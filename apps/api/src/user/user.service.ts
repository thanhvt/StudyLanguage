/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from '../storage/storage.service';

/**
 * Interface cho response user stats
 */
export interface UserStats {
  streak: number;
  totalMinutes: number;
  totalSessions: number;
  level: number;
  xp: number;
  dailyGoalMinutes: number;
  dailyGoalProgress: number;
  speakingGoal: number;
  speakingGoalProgress: number;
  todayMinutes: number;
}

/**
 * Interface cho Word of the Day
 */
export interface WordOfTheDay {
  word: string;
  ipa: string | null;
  meaningVi: string | null;
  meaningEn: string | null;
  example: string | null;
}

/**
 * Interface cho Gamification data
 */
export interface GamificationData {
  xp: number;
  level: number;
  badges: any[];
  dailyGoalMinutes: number;
  speakingGoal: number;
  totalSessions: number;
  totalMinutes: number;
}

/**
 * Badge definition
 */
interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: (stats: { totalSessions: number; totalMinutes: number; streak: number }) => boolean;
}

/**
 * Danh sách badges có thể unlock
 */
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    name: 'Bước Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên',
    icon: '🎉',
    criteria: (s) => s.totalSessions >= 1,
  },
  {
    id: 'ten_sessions',
    name: 'Người Kiên Trì',
    description: 'Hoàn thành 10 bài học',
    icon: '💪',
    criteria: (s) => s.totalSessions >= 10,
  },
  {
    id: 'fifty_sessions',
    name: 'Chiến Binh Ngôn Ngữ',
    description: 'Hoàn thành 50 bài học',
    icon: '⚔️',
    criteria: (s) => s.totalSessions >= 50,
  },
  {
    id: 'hundred_sessions',
    name: 'Bậc Thầy',
    description: 'Hoàn thành 100 bài học',
    icon: '👑',
    criteria: (s) => s.totalSessions >= 100,
  },
  {
    id: 'one_hour',
    name: 'Một Giờ Vàng',
    description: 'Học tổng cộng 60 phút',
    icon: '⏰',
    criteria: (s) => s.totalMinutes >= 60,
  },
  {
    id: 'ten_hours',
    name: 'Chuyên Cần',
    description: 'Học tổng cộng 600 phút (10 giờ)',
    icon: '📚',
    criteria: (s) => s.totalMinutes >= 600,
  },
  {
    id: 'streak_7',
    name: 'Tuần Lửa',
    description: 'Duy trì streak 7 ngày liên tục',
    icon: '🔥',
    criteria: (s) => s.streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Tháng Thép',
    description: 'Duy trì streak 30 ngày liên tục',
    icon: '🏆',
    criteria: (s) => s.streak >= 30,
  },
];

/**
 * UserService - Service xử lý nghiệp vụ cho User Module
 *
 * Mục đích: Quản lý user profile, stats, gamification, settings
 * Tham số đầu vào: userId từ SupabaseAuthGuard
 * Tham số đầu ra: Dữ liệu user từ Supabase
 * Khi nào sử dụng: Được inject vào UserController
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private supabase: SupabaseClient;

  constructor(private readonly storageService: StorageService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Lấy stats tổng quan cho Dashboard
   *
   * Mục đích: Aggregate dữ liệu từ lessons + gamification cho Dashboard
   * @param userId - ID của user hiện tại
   * @returns UserStats với streak, totalMinutes, level, goals
   * Khi nào sử dụng: GET /user/stats → Dashboard screen
   */
  async getStats(userId: string): Promise<UserStats> {
    try {
      // Lấy gamification data
      const gamification = await this.getOrCreateGamification(userId);

      // Tính today minutes từ lessons
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayLessons } = await this.supabase
        .from('lessons')
        .select('duration_minutes')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      const todayMinutes = (todayLessons || []).reduce(
        (sum: number, l: any) => sum + (l.duration_minutes || 0),
        0,
      );

      // Tính streak
      const streak = await this.calculateStreak(userId);

      // Tính speaking goal progress (sessions hôm nay)
      const { count: todaySpeakingCount } = await this.supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'speaking')
        .gte('created_at', today.toISOString());

      return {
        streak,
        totalMinutes: gamification.totalMinutes,
        totalSessions: gamification.totalSessions,
        level: gamification.level,
        xp: gamification.xp,
        dailyGoalMinutes: gamification.dailyGoalMinutes,
        dailyGoalProgress: Math.min(todayMinutes / gamification.dailyGoalMinutes, 1),
        speakingGoal: gamification.speakingGoal,
        speakingGoalProgress: Math.min((todaySpeakingCount || 0) / gamification.speakingGoal, 1),
        todayMinutes,
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi lấy stats:', error);
      throw new InternalServerErrorException('Lỗi lấy thống kê người dùng');
    }
  }

  /**
   * Lấy Word of the Day
   *
   * Mục đích: Trả về từ vựng theo ngày (rotate theo day_index)
   * @returns WordOfTheDay với word, ipa, meaning, example
   * Khi nào sử dụng: GET /user/word-of-the-day → Dashboard screen
   */
  async getWordOfTheDay(): Promise<WordOfTheDay> {
    try {
      // Dùng ngày trong năm để rotate (1-366)
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - startOfYear.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

      // Lấy tổng số words
      const { count } = await this.supabase
        .from('words_of_the_day')
        .select('id', { count: 'exact', head: true });

      const totalWords = count || 30;
      // Cycle qua danh sách
      const targetIndex = (dayOfYear % totalWords) + 1;

      const { data, error } = await this.supabase
        .from('words_of_the_day')
        .select('*')
        .eq('day_index', targetIndex)
        .single();

      if (error || !data) {
        // Fallback nếu không tìm thấy
        return {
          word: 'serendipity',
          ipa: '/ˌser.ənˈdɪp.ə.t̬i/',
          meaningVi: 'sự tình cờ may mắn',
          meaningEn: 'the occurrence of events by chance in a happy way',
          example: 'Finding that book was pure serendipity.',
        };
      }

      return {
        word: data.word,
        ipa: data.ipa,
        meaningVi: data.meaning_vi,
        meaningEn: data.meaning_en,
        example: data.example,
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi lấy word of the day:', error);
      throw new InternalServerErrorException('Lỗi lấy từ vựng ngày');
    }
  }

  /**
   * Lấy session cuối cùng để "Continue"
   *
   * Mục đích: Trả về info session mới nhất cho nút Continue trên Dashboard
   * @param userId - ID của user hiện tại
   * @returns Thông tin lesson cuối hoặc null
   * Khi nào sử dụng: GET /user/last-session → Dashboard "Continue" button
   */
  async getLastSession(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('lessons')
        .select('id, type, topic, mode, content, duration_minutes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return { success: true, session: null };
      }

      return {
        success: true,
        session: {
          id: data.id,
          type: data.type,
          topic: data.topic,
          mode: data.mode,
          durationMinutes: data.duration_minutes,
          createdAt: data.created_at,
        },
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi lấy last session:', error);
      return { success: true, session: null };
    }
  }

  /**
   * Cập nhật profile user
   *
   * Mục đích: Update thông tin hiển thị (name, avatar URL)
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu cần cập nhật
   * @returns Profile đã cập nhật
   * Khi nào sử dụng: PATCH /user/profile → Profile screen
   */
  async updateProfile(
    userId: string,
    dto: { displayName?: string; avatarUrl?: string },
  ) {
    try {
      const updateData: Record<string, any> = {};
      if (dto.displayName !== undefined) updateData.full_name = dto.displayName;
      if (dto.avatarUrl !== undefined) updateData.avatar_url = dto.avatarUrl;

      const { error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: updateData,
      });

      if (error) {
        this.logger.error('[UserService] Lỗi cập nhật profile:', error);
        throw new InternalServerErrorException('Lỗi cập nhật profile');
      }

      return {
        success: true,
        message: 'Đã cập nhật profile',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[UserService] Lỗi cập nhật profile:', error);
      throw new InternalServerErrorException('Lỗi cập nhật profile');
    }
  }

  /**
   * Upload avatar
   *
   * Mục đích: Upload ảnh avatar lên Storage, cập nhật profile
   * @param userId - ID của user hiện tại
   * @param file - File ảnh (Buffer)
   * @returns URL ảnh avatar mới
   * Khi nào sử dụng: POST /user/avatar → Profile screen
   */
  async uploadAvatar(userId: string, file: Buffer) {
    try {
      const filename = `avatar-${userId}-${Date.now()}.jpg`;
      const avatarUrl = await this.storageService.uploadAudio(
        file,
        'avatars',
        filename,
      );

      // Cập nhật avatar URL vào user metadata
      await this.updateProfile(userId, { avatarUrl });

      return {
        success: true,
        avatarUrl,
        message: 'Đã upload avatar',
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi upload avatar:', error);
      throw new InternalServerErrorException('Lỗi upload avatar');
    }
  }

  /**
   * Lấy dữ liệu gamification
   *
   * Mục đích: Trả về XP, level, badges, goals
   * @param userId - ID của user hiện tại
   * @returns GamificationData
   * Khi nào sử dụng: GET /user/gamification → Dashboard, Speaking
   */
  async getGamification(userId: string): Promise<{ success: true; data: GamificationData }> {
    const data = await this.getOrCreateGamification(userId);
    return { success: true, data };
  }

  /**
   * Kiểm tra và unlock badge mới
   *
   * Mục đích: Đánh giá điều kiện badge, unlock nếu đạt
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu context (totalSessions, totalMinutes, streak)
   * @returns Danh sách badges mới unlock (nếu có)
   * Khi nào sử dụng: POST /user/gamification/check-badge → sau mỗi lesson
   */
  async checkBadge(
    userId: string,
    dto: { totalSessions?: number; totalMinutes?: number; streak?: number },
  ) {
    try {
      const gamification = await this.getOrCreateGamification(userId);
      const currentBadges: string[] = (gamification.badges || []).map(
        (b: any) => b.id,
      );

      // Cập nhật stats nếu có
      const stats = {
        totalSessions: dto.totalSessions ?? gamification.totalSessions,
        totalMinutes: dto.totalMinutes ?? gamification.totalMinutes,
        streak: dto.streak ?? 0,
      };

      // Kiểm tra từng badge
      const newBadges: { id: string; name: string; icon: string; unlockedAt: string }[] = [];

      for (const badge of BADGE_DEFINITIONS) {
        if (!currentBadges.includes(badge.id) && badge.criteria(stats)) {
          newBadges.push({
            id: badge.id,
            name: badge.name,
            icon: badge.icon,
            unlockedAt: new Date().toISOString(),
          });
        }
      }

      if (newBadges.length > 0) {
        // Cập nhật badges list
        const allBadges = [...(gamification.badges || []), ...newBadges];

        // Tính level mới (mỗi 100 XP = 1 level)
        const newXp = gamification.xp + newBadges.length * 50; // 50 XP per badge
        const newLevel = Math.floor(newXp / 100) + 1;

        await this.supabase
          .from('user_gamification')
          .update({
            badges: allBadges,
            xp: newXp,
            level: newLevel,
            total_sessions: stats.totalSessions,
            total_minutes: stats.totalMinutes,
          })
          .eq('user_id', userId);
      } else {
        // Chỉ cập nhật stats
        await this.supabase
          .from('user_gamification')
          .update({
            total_sessions: stats.totalSessions,
            total_minutes: stats.totalMinutes,
          })
          .eq('user_id', userId);
      }

      return {
        success: true,
        newBadges,
        totalBadges: currentBadges.length + newBadges.length,
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi check badge:', error);
      throw new InternalServerErrorException('Lỗi kiểm tra badge');
    }
  }

  /**
   * Lấy settings đồng bộ
   *
   * Mục đích: Trả về settings JSON blob cho sync across devices
   * @param userId - ID của user hiện tại
   * @returns Settings object
   * Khi nào sử dụng: GET /user/settings → App startup
   */
  async getSettings(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('settings, updated_at')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Chưa có settings → trả về default
        return {
          success: true,
          settings: {},
          updatedAt: null,
        };
      }

      return {
        success: true,
        settings: data.settings,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi lấy settings:', error);
      throw new InternalServerErrorException('Lỗi lấy settings');
    }
  }

  /**
   * Sync settings lên server
   *
   * Mục đích: Lưu settings JSON blob vào database
   * @param userId - ID của user hiện tại
   * @param settings - Settings object
   * @returns Kết quả lưu
   * Khi nào sử dụng: PUT /user/settings → khi user thay đổi settings
   */
  async updateSettings(userId: string, settings: Record<string, any>) {
    try {
      const { error } = await this.supabase
        .from('user_settings')
        .upsert(
          {
            user_id: userId,
            settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

      if (error) {
        this.logger.error('[UserService] Lỗi cập nhật settings:', error);
        throw new InternalServerErrorException('Lỗi cập nhật settings');
      }

      return {
        success: true,
        message: 'Đã đồng bộ settings',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[UserService] Lỗi cập nhật settings:', error);
      throw new InternalServerErrorException('Lỗi cập nhật settings');
    }
  }

  /**
   * Export toàn bộ data của user (GDPR compliance)
   *
   * Mục đích: Aggregate tất cả data từ mọi table liên quan
   * @param userId - ID của user hiện tại
   * @returns JSON chứa toàn bộ data
   * Khi nào sử dụng: POST /user/export-data → Profile settings
   */
  async exportData(userId: string) {
    try {
      // Lấy data từ tất cả tables
      const [
        lessons,
        customScenarios,
        listenLater,
        playlists,
        feedbacks,
        gamification,
        settings,
        savedWords,
      ] = await Promise.all([
        this.supabase.from('lessons').select('*').eq('user_id', userId),
        this.supabase.from('custom_scenarios').select('*').eq('user_id', userId),
        this.supabase.from('listen_later').select('*').eq('user_id', userId),
        this.supabase.from('playlists').select('*').eq('user_id', userId),
        this.supabase.from('feedbacks').select('*').eq('user_id', userId),
        this.supabase.from('user_gamification').select('*').eq('user_id', userId),
        this.supabase.from('user_settings').select('*').eq('user_id', userId),
        this.supabase.from('saved_words').select('*').eq('user_id', userId),
      ]);

      return {
        success: true,
        exportedAt: new Date().toISOString(),
        data: {
          lessons: lessons.data || [],
          customScenarios: customScenarios.data || [],
          listenLater: listenLater.data || [],
          playlists: playlists.data || [],
          feedbacks: feedbacks.data || [],
          gamification: gamification.data || [],
          settings: settings.data || [],
          savedWords: savedWords.data || [],
        },
      };
    } catch (error) {
      this.logger.error('[UserService] Lỗi export data:', error);
      throw new InternalServerErrorException('Lỗi export dữ liệu người dùng');
    }
  }

  /**
   * Xóa toàn bộ account và data (GDPR compliance)
   *
   * Mục đích: Cascade delete tất cả data + Supabase Auth user
   * @param userId - ID của user hiện tại
   * @returns Kết quả xóa
   * Khi nào sử dụng: DELETE /user/delete-account → Profile settings
   *
   * ⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ hoàn tác
   */
  async deleteAccount(userId: string) {
    try {
      this.logger.warn(`[UserService] ⚠️ Bắt đầu xóa account: ${userId}`);

      // CASCADE DELETE từ các bảng có foreign key (thứ tự quan trọng)
      const tables = [
        'saved_words',
        'device_tokens',
        'user_gamification',
        'user_settings',
        'listen_later',
        'feedbacks',
        'custom_scenarios',
        'lessons', // lessons chứa history references
      ];

      for (const table of tables) {
        const { error } = await this.supabase
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          this.logger.warn(`[UserService] Lỗi xóa ${table} (có thể bảng chưa tồn tại):`, error.message);
        }
      }

      // Xóa playlists và playlist_items
      const { data: userPlaylists } = await this.supabase
        .from('playlists')
        .select('id')
        .eq('user_id', userId);

      if (userPlaylists && userPlaylists.length > 0) {
        const playlistIds = userPlaylists.map((p: any) => p.id);
        await this.supabase
          .from('playlist_items')
          .delete()
          .in('playlist_id', playlistIds);

        await this.supabase
          .from('playlists')
          .delete()
          .eq('user_id', userId);
      }

      // Xóa Supabase Auth user
      const { error: authError } = await this.supabase.auth.admin.deleteUser(userId);

      if (authError) {
        this.logger.error('[UserService] Lỗi xóa auth user:', authError);
        throw new InternalServerErrorException('Lỗi xóa tài khoản');
      }

      this.logger.warn(`[UserService] ✅ Đã xóa account hoàn toàn: ${userId}`);

      return {
        success: true,
        message: 'Tài khoản và toàn bộ dữ liệu đã được xóa vĩnh viễn',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[UserService] Lỗi xóa account:', error);
      throw new InternalServerErrorException('Lỗi xóa tài khoản');
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Lấy hoặc tạo gamification record cho user
   *
   * Mục đích: Đảm bảo luôn có gamification data
   * @param userId - ID của user
   * @returns GamificationData
   * Khi nào sử dụng: Được gọi bởi getStats, getGamification, checkBadge
   */
  private async getOrCreateGamification(userId: string): Promise<GamificationData> {
    const { data, error } = await this.supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      return {
        xp: data.xp ?? 0,
        level: data.level ?? 1,
        badges: data.badges ?? [],
        dailyGoalMinutes: data.daily_goal_minutes ?? 10,
        speakingGoal: data.speaking_goal ?? 5,
        totalSessions: data.total_sessions ?? 0,
        totalMinutes: data.total_minutes ?? 0,
      };
    }

    // Tạo mới nếu chưa có
    const { data: newData, error: insertError } = await this.supabase
      .from('user_gamification')
      .insert({ user_id: userId })
      .select()
      .single();

    if (insertError || !newData) {
      this.logger.error('[UserService] Lỗi tạo gamification:', insertError);
      // Trả về default
      return {
        xp: 0,
        level: 1,
        badges: [],
        dailyGoalMinutes: 10,
        speakingGoal: 5,
        totalSessions: 0,
        totalMinutes: 0,
      };
    }

    return {
      xp: newData.xp ?? 0,
      level: newData.level ?? 1,
      badges: newData.badges ?? [],
      dailyGoalMinutes: newData.daily_goal_minutes ?? 10,
      speakingGoal: newData.speaking_goal ?? 5,
      totalSessions: newData.total_sessions ?? 0,
      totalMinutes: newData.total_minutes ?? 0,
    };
  }

  /**
   * Tính streak liên tục từ lessons
   *
   * Mục đích: Đếm số ngày liên tục user có ít nhất 1 lesson
   * @param userId - ID của user
   * @returns Số ngày streak
   * Khi nào sử dụng: Được gọi bởi getStats
   */
  private async calculateStreak(userId: string): Promise<number> {
    try {
      // Lấy 90 ngày gần nhất có lesson
      const { data } = await this.supabase
        .from('lessons')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!data || data.length === 0) return 0;

      // Tạo set các ngày có lesson
      const activeDays = new Set<string>();
      for (const lesson of data) {
        const date = new Date(lesson.created_at).toISOString().split('T')[0];
        activeDays.add(date);
      }

      // Đếm streak từ hôm nay ngược lại
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (activeDays.has(dateStr)) {
          streak++;
        } else if (i === 0) {
          // Hôm nay chưa học → check từ hôm qua
          continue;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      this.logger.error('[UserService] Lỗi tính streak:', error);
      return 0;
    }
  }
}

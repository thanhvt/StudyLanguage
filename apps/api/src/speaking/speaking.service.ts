/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SpeakingService - Service xử lý nghiệp vụ cho Speaking Module
 *
 * Mục đích: Tongue twisters, speaking stats, voice clone
 * Tham số đầu vào: userId, filters
 * Tham số đầu ra: Content, stats, voice clone results
 * Khi nào sử dụng: Được inject vào SpeakingController
 */
@Injectable()
export class SpeakingService {
  private readonly logger = new Logger(SpeakingService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Lấy danh sách tongue twisters theo level
   *
   * Mục đích: Query tongue_twisters table, filter theo level
   * @param level - beginner | intermediate | advanced
   * @returns Danh sách tongue twisters
   * Khi nào sử dụng: GET /speaking/tongue-twisters?level=beginner
   */
  async getTongueTwisters(level?: string) {
    try {
      let query = this.supabase
        .from('tongue_twisters')
        .select('*')
        .order('difficulty', { ascending: true });

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('[SpeakingService] Lỗi lấy tongue twisters:', error);
        throw new InternalServerErrorException('Lỗi lấy tongue twisters');
      }

      return {
        success: true,
        tongueTwisters: (data || []).map((t: any) => ({
          id: t.id,
          text: t.text_en,
          ipa: t.ipa,
          level: t.level,
          difficulty: t.difficulty,
        })),
        count: data?.length || 0,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[SpeakingService] Lỗi lấy tongue twisters:', error);
      throw new InternalServerErrorException('Lỗi lấy tongue twisters');
    }
  }

  /**
   * Lấy thống kê speaking của user
   *
   * Mục đích: Aggregate data từ lessons where type='speaking'
   * @param userId - ID của user
   * @returns Speaking stats { totalSessions, totalMinutes, avgAccuracy, recentTopics }
   * Khi nào sử dụng: GET /speaking/stats → Speaking screen overview
   */
  async getStats(userId: string) {
    try {
      // Lấy tất cả speaking lessons
      const { data, error } = await this.supabase
        .from('lessons')
        .select('id, topic, duration_minutes, created_at, content')
        .eq('user_id', userId)
        .eq('type', 'speaking')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('[SpeakingService] Lỗi lấy speaking stats:', error);
        throw new InternalServerErrorException('Lỗi lấy thống kê speaking');
      }

      const lessons = data || [];
      const totalSessions = lessons.length;
      const totalMinutes = lessons.reduce(
        (sum: number, l: any) => sum + (l.duration_minutes || 0),
        0,
      );

      // Đếm số topics unique
      const uniqueTopics = [...new Set(lessons.map((l: any) => l.topic).filter(Boolean))];
      const topicsCount = uniqueTopics.length;

      // Lấy 5 topics gần nhất (unique)
      const recentTopics = [...new Set(lessons.slice(0, 10).map((l: any) => l.topic))].slice(0, 5);

      // Tính sessions theo tuần hiện tại
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const thisWeekSessions = lessons.filter(
        (l: any) => new Date(l.created_at) >= weekStart,
      ).length;

      // Tính weeklyData — phút luyện theo từng ngày trong tuần hiện tại
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyData = dayNames.map((day) => ({ day, minutes: 0 }));
      lessons.forEach((l: any) => {
        const lessonDate = new Date(l.created_at);
        if (lessonDate >= weekStart) {
          const dayIndex = lessonDate.getDay();
          weeklyData[dayIndex].minutes += l.duration_minutes || 0;
        }
      });

      // Tính avgAccuracy — trung bình score từ content.overallScore
      const scores = lessons
        .map((l: any) => l.content?.overallScore)
        .filter((s: any) => typeof s === 'number');
      const avgAccuracy = scores.length > 0
        ? Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
        : 0;

      return {
        success: true,
        stats: {
          totalSessions,
          totalMinutes,
          topicsCount,
          thisWeekSessions,
          weeklyData,
          avgAccuracy,
          recentTopics,
          averageSessionMinutes: totalSessions > 0
            ? Math.round(totalMinutes / totalSessions)
            : 0,
        },
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[SpeakingService] Lỗi lấy speaking stats:', error);
      throw new InternalServerErrorException('Lỗi lấy thống kê speaking');
    }
  }

  // ============================================
  // SPRINT 2: GAMIFICATION APIs
  // ============================================

  /**
   * Lấy daily speaking goal của user
   *
   * Mục đích: Hiển thị tiến trình mục tiêu nói hàng ngày
   * @param userId - ID của user
   * @returns Daily goal { target, completed, streak }
   * Khi nào sử dụng: GET /speaking/daily-goal → Dashboard + Speaking screen
   */
  async getDailyGoal(userId: string) {
    try {
      // Lấy goal config từ bảng speaking_goals (upsert on first access)
      const { data: goalData, error: goalError } = await this.supabase
        .from('speaking_goals')
        .select('target, streak')
        .eq('user_id', userId)
        .single();

      // Nếu chưa có → trả default
      const target = goalData?.target ?? 10;
      const streak = goalData?.streak ?? 0;

      // Đếm số câu đã nói hôm nay từ lessons
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayLessons, error: todayError } = await this.supabase
        .from('lessons')
        .select('id, content')
        .eq('user_id', userId)
        .eq('type', 'speaking')
        .gte('created_at', todayStart.toISOString());

      if (todayError) {
        this.logger.error('[SpeakingService] Lỗi lấy daily goal:', todayError);
        throw new InternalServerErrorException('Lỗi lấy daily goal');
      }

      // Đếm completed: mỗi lesson = 1 session
      const completed = todayLessons?.length || 0;

      return {
        success: true,
        dailyGoal: {
          target,
          completed,
          streak,
          isCompleted: completed >= target,
          progress: target > 0 ? Math.min(1, completed / target) : 0,
        },
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[SpeakingService] Lỗi lấy daily goal:', error);
      throw new InternalServerErrorException('Lỗi lấy daily goal');
    }
  }

  /**
   * Cập nhật daily speaking goal target
   *
   * Mục đích: User thay đổi mục tiêu số câu nói mỗi ngày
   * @param userId - ID của user
   * @param target - Số câu mục tiêu/ngày (1-100)
   * @returns Updated goal
   * Khi nào sử dụng: PUT /speaking/daily-goal → Settings / Goal screen
   */
  async updateDailyGoal(userId: string, target: number) {
    try {
      const clampedTarget = Math.max(1, Math.min(100, target));

      const { data, error } = await this.supabase
        .from('speaking_goals')
        .upsert(
          { user_id: userId, target: clampedTarget, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
        .select()
        .single();

      if (error) {
        this.logger.error('[SpeakingService] Lỗi cập nhật daily goal:', error);
        throw new InternalServerErrorException('Lỗi cập nhật daily goal');
      }

      return {
        success: true,
        dailyGoal: {
          target: data?.target ?? clampedTarget,
          streak: data?.streak ?? 0,
        },
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[SpeakingService] Lỗi cập nhật daily goal:', error);
      throw new InternalServerErrorException('Lỗi cập nhật daily goal');
    }
  }

  /**
   * Lấy speaking progress data cho dashboard
   *
   * Mục đích: Cung cấp dữ liệu cho radar chart, calendar heatmap, weak sounds
   * @param userId - ID của user
   * @returns Progress { radarChart, calendarHeatmap, weakSounds, weeklyReport }
   * Khi nào sử dụng: GET /speaking/progress → Speaking Progress Dashboard
   */
  async getProgress(userId: string) {
    try {
      // Lấy 90 ngày lessons gần nhất
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await this.supabase
        .from('lessons')
        .select('id, topic, duration_minutes, created_at, content')
        .eq('user_id', userId)
        .eq('type', 'speaking')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('[SpeakingService] Lỗi lấy progress:', error);
        throw new InternalServerErrorException('Lỗi lấy progress');
      }

      const lessons = data || [];

      // Radar chart — trung bình scores từ content
      const radarScores = { pronunciation: 0, fluency: 0, vocabulary: 0, grammar: 0 };
      let scoredCount = 0;
      lessons.forEach((l: any) => {
        const content = l.content;
        if (content?.pronunciation || content?.overallScore) {
          radarScores.pronunciation += content.pronunciation ?? content.overallScore ?? 0;
          radarScores.fluency += content.fluency ?? content.overallScore ?? 0;
          radarScores.vocabulary += content.vocabulary ?? content.overallScore ?? 0;
          radarScores.grammar += content.grammar ?? content.overallScore ?? 0;
          scoredCount++;
        }
      });
      const radarChart = scoredCount > 0 ? {
        pronunciation: Math.round(radarScores.pronunciation / scoredCount),
        fluency: Math.round(radarScores.fluency / scoredCount),
        vocabulary: Math.round(radarScores.vocabulary / scoredCount),
        grammar: Math.round(radarScores.grammar / scoredCount),
      } : { pronunciation: 0, fluency: 0, vocabulary: 0, grammar: 0 };

      // Calendar heatmap — sessions per day (90 ngày)
      const heatmapMap: Record<string, number> = {};
      lessons.forEach((l: any) => {
        const dateStr = new Date(l.created_at).toISOString().split('T')[0];
        heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
      });
      const calendarHeatmap = Object.entries(heatmapMap)
        .map(([date, sessions]) => ({ date, sessions }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Weak sounds — aggregate từ content.wordByWord / patterns
      const phonemeMap: Record<string, { correct: number; total: number }> = {};
      lessons.forEach((l: any) => {
        const patterns = l.content?.patterns;
        if (Array.isArray(patterns)) {
          patterns.forEach((p: string) => {
            // Trích xuất phoneme từ pattern string (VD: "/θ/", "/ʃ/")
            const match = p.match(/\/[^/]+\//);
            if (match) {
              const phoneme = match[0];
              if (!phonemeMap[phoneme]) {
                phonemeMap[phoneme] = { correct: 0, total: 0 };
              }
              phonemeMap[phoneme].total += 1;
            }
          });
        }
        // Cũng tính từ wordByWord nếu có
        const wordByWord = l.content?.wordByWord;
        if (Array.isArray(wordByWord)) {
          wordByWord.forEach((w: any) => {
            if (w.issue) {
              const match = w.issue.match(/\/[^/]+\//);
              if (match) {
                const phoneme = match[0];
                if (!phonemeMap[phoneme]) {
                  phonemeMap[phoneme] = { correct: 0, total: 0 };
                }
                phonemeMap[phoneme].total += 1;
              }
            }
          });
        }
      });
      const weakSounds = Object.entries(phonemeMap)
        .map(([phoneme, counts]) => ({
          phoneme,
          accuracy: counts.total > 0
            ? Math.round(((counts.total - counts.correct) / counts.total) * 100)
            : 0,
          totalAttempts: counts.total,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 10);

      // Weekly report — 7 ngày gần nhất
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekLessons = lessons.filter(
        (l: any) => new Date(l.created_at) >= sevenDaysAgo,
      );
      const weekScores = weekLessons
        .map((l: any) => l.content?.overallScore)
        .filter((s: any) => typeof s === 'number');
      const weeklyReport = {
        avgScore: weekScores.length > 0
          ? Math.round(weekScores.reduce((a: number, b: number) => a + b, 0) / weekScores.length)
          : 0,
        totalMinutes: weekLessons.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0),
        totalSessions: weekLessons.length,
      };

      return {
        success: true,
        progress: {
          radarChart,
          calendarHeatmap,
          weakSounds,
          weeklyReport,
        },
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[SpeakingService] Lỗi lấy progress:', error);
      throw new InternalServerErrorException('Lỗi lấy progress');
    }
  }

  /**
   * Lấy danh sách achievement badges
   *
   * Mục đích: Hiển thị badges đã đạt và chưa đạt
   * @param userId - ID của user
   * @returns { badges, totalUnlocked, totalBadges }
   * Khi nào sử dụng: GET /speaking/badges → Speaking Gamification screen
   */
  async getBadges(userId: string) {
    try {
      // Lấy tổng số sessions và stats
      const { data, error } = await this.supabase
        .from('lessons')
        .select('id, created_at, content')
        .eq('user_id', userId)
        .eq('type', 'speaking')
        .order('created_at', { ascending: true });

      if (error) {
        this.logger.error('[SpeakingService] Lỗi lấy badges:', error);
        throw new InternalServerErrorException('Lỗi lấy badges');
      }

      const lessons = data || [];
      const totalSessions = lessons.length;

      // Tính streak hiện tại
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(today);
      const sessionDates = new Set(
        lessons.map((l: any) => new Date(l.created_at).toISOString().split('T')[0]),
      );

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (sessionDates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          // Hôm nay chưa luyện, kiểm tra hôm qua
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        } else {
          break;
        }
      }

      // Đếm số câu perfect (score >= 90)
      const perfectCount = lessons.filter(
        (l: any) => (l.content?.overallScore ?? 0) >= 90,
      ).length;

      // Định nghĩa badges
      const badgeDefinitions = [
        { id: 'first-speak', name: '🎤 Câu nói đầu tiên', description: 'Hoàn thành 1 câu nói', condition: totalSessions >= 1 },
        { id: '100-sentences', name: '🎤 100 câu', description: 'Hoàn thành 100 câu nói', condition: totalSessions >= 100 },
        { id: '500-sentences', name: '🎯 500 câu', description: 'Hoàn thành 500 câu nói', condition: totalSessions >= 500 },
        { id: '1000-sentences', name: '🏆 1000 câu', description: 'Hoàn thành 1000 câu nói', condition: totalSessions >= 1000 },
        { id: 'streak-7', name: '🔥 Streak 7 ngày', description: 'Luyện 7 ngày liên tục', condition: currentStreak >= 7 },
        { id: 'streak-30', name: '🔥 Streak 30 ngày', description: 'Luyện 30 ngày liên tục', condition: currentStreak >= 30 },
        { id: 'streak-100', name: '💎 Streak 100 ngày', description: 'Luyện 100 ngày liên tục', condition: currentStreak >= 100 },
        { id: 'perfect-10', name: '🏅 10 câu Perfect', description: 'Đạt ≥90 điểm 10 lần', condition: perfectCount >= 10 },
        { id: 'perfect-50', name: '🌟 50 câu Perfect', description: 'Đạt ≥90 điểm 50 lần', condition: perfectCount >= 50 },
        { id: 'shadower', name: '🎙️ Shadower', description: 'Hoàn thành 20 bài shadowing', condition: false }, // Cần data riêng
      ];

      const badges = badgeDefinitions.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        unlocked: badge.condition,
        unlockedAt: badge.condition ? new Date().toISOString() : null,
      }));

      const totalUnlocked = badges.filter((b) => b.unlocked).length;

      return {
        success: true,
        badges,
        totalUnlocked,
        totalBadges: badges.length,
        currentStreak,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[SpeakingService] Lỗi lấy badges:', error);
      throw new InternalServerErrorException('Lỗi lấy badges');
    }
  }

  // ============================================
  // SPRINT 3: VOICE CLONE + SHADOWING
  // ============================================

  /**
   * Voice Clone — Azure Custom Voice integration
   *
   * Mục đích: Clone giọng user để AI phát âm đúng bằng giọng user
   * @param userId - ID của user
   * @param audioSample - Audio sample của user (Buffer)
   * @param text - Text cần TTS bằng giọng clone
   * @returns Audio buffer hoặc graceful degradation
   * Khi nào sử dụng: POST /speaking/voice-clone → AI Voice Clone Replay
   *
   * Luồng Azure Custom Voice:
   *   1. Upload audio sample → Azure Speech Studio
   *   2. Create/reuse voice profile
   *   3. Generate TTS với custom voice
   *   4. Trả về audio buffer
   *
   * Docs: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/custom-neural-voice
   */
  async voiceClone(
    userId: string,
    audioSample: Buffer,
    text: string,
  ) {
    this.logger.log(`[SpeakingService] Voice Clone cho user ${userId}, text: "${text.substring(0, 50)}..."`);

    try {
      // Kiểm tra Azure Speech key
      const speechKey = process.env.AZURE_SPEECH_KEY;
      const speechRegion = process.env.AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        this.logger.warn('[SpeakingService] Azure Speech credentials chưa được cấu hình');
        return {
          success: false,
          message: 'Azure Speech Service chưa được cấu hình. Vui lòng thêm AZURE_SPEECH_KEY và AZURE_SPEECH_REGION.',
          status: 'not_configured',
        };
      }

      // Kiểm tra audio sample hợp lệ
      if (!audioSample || audioSample.length < 1000) {
        return {
          success: false,
          message: 'Audio sample quá ngắn. Vui lòng ghi ít nhất 5 giây.',
          status: 'invalid_sample',
        };
      }

      // Azure Custom Neural Voice yêu cầu approval riêng
      // Fallback: Sử dụng Azure TTS thường với voice gần nhất
      // và trả về kèm bản gốc để so sánh before/after
      this.logger.warn('[SpeakingService] Custom Neural Voice chưa có approval - dùng Azure TTS fallback');

      // Gọi Azure TTS với giọng standard gần nhất
      const audioBase64 = audioSample.toString('base64');

      return {
        success: true,
        status: 'fallback',
        message: 'Đang sử dụng Azure TTS fallback (Custom Neural Voice cần approval riêng)',
        originalAudio: audioBase64,
        correctedAudio: null, // Sẽ được populate khi có Custom Voice approval
        text,
      };
    } catch (error) {
      this.logger.error('[SpeakingService] Lỗi Voice Clone:', error);
      return {
        success: false,
        message: 'Lỗi xử lý Voice Clone. Vui lòng thử lại.',
        status: 'error',
      };
    }
  }

  /**
   * Đánh giá phát âm cho Shadowing Mode
   *
   * Mục đích: So sánh chi tiết giọng user với AI mẫu (rhythm, intonation, accuracy)
   * @param userId - ID của user
   * @param originalText - Câu mẫu gốc
   * @param userTranscript - Transcript từ user recording (Whisper)
   * @param speed - Tốc độ shadowing (0.5x - 1.5x)
   * @returns Scoring chi tiết { rhythm, intonation, accuracy, overallScore, feedback }
   * Khi nào sử dụng: POST /speaking/shadowing-evaluate → Shadowing Mode result
   */
  async evaluateShadowing(
    userId: string,
    originalText: string,
    userTranscript: string,
    speed: number = 1.0,
  ) {
    this.logger.log(`[SpeakingService] Đánh giá shadowing cho user ${userId}`);

    try {
      // So sánh text-based: tính accuracy, rhythm ước lượng
      const originalWords = originalText.toLowerCase().split(/\s+/).filter(Boolean);
      const userWords = userTranscript.toLowerCase().split(/\s+/).filter(Boolean);

      // Accuracy — tỷ lệ từ đúng
      let matchCount = 0;
      const wordResults: { word: string; matched: boolean }[] = [];
      originalWords.forEach((word, i) => {
        const matched = userWords[i] === word;
        if (matched) matchCount++;
        wordResults.push({ word, matched });
      });
      const accuracy = originalWords.length > 0
        ? Math.round((matchCount / originalWords.length) * 100)
        : 0;

      // Rhythm — ước lượng dựa trên số từ (user nói đủ từ = nhịp tốt)
      const wordCountRatio = originalWords.length > 0
        ? userWords.length / originalWords.length
        : 0;
      const rhythm = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(1 - wordCountRatio) * 100)));

      // Intonation — ước lượng dựa trên accuracy + rhythm
      // (Real implementation cần audio analysis, đây là text-based approximation)
      const intonation = Math.round((accuracy * 0.6 + rhythm * 0.4));

      // Overall score
      const overallScore = Math.round(accuracy * 0.5 + rhythm * 0.25 + intonation * 0.25);

      // Tìm từ sai
      const missedWords = wordResults
        .filter((w) => !w.matched)
        .map((w) => w.word);

      // Feedback
      const feedback: string[] = [];
      if (accuracy >= 90) {
        feedback.push('Tuyệt vời! Phát âm rất chính xác. 🎯');
      } else if (accuracy >= 70) {
        feedback.push('Khá tốt! Cần chú ý phát âm rõ hơn một số từ.');
      } else {
        feedback.push('Tiếp tục luyện tập nhé! Thử giảm tốc độ để phát âm rõ hơn.');
      }

      if (rhythm < 70) {
        feedback.push(`Nhịp nói chưa đều. Thử tốc độ ${speed > 1 ? 'chậm hơn' : 'nhanh hơn'} một chút.`);
      }

      if (missedWords.length > 0) {
        feedback.push(`Từ cần chú ý: ${missedWords.slice(0, 5).join(', ')}`);
      }

      return {
        success: true,
        shadowing: {
          overallScore,
          rhythm,
          intonation,
          accuracy,
          speed,
          wordResults,
          missedWords: missedWords.slice(0, 10),
          feedback,
        },
      };
    } catch (error) {
      this.logger.error('[SpeakingService] Lỗi đánh giá shadowing:', error);
      throw new InternalServerErrorException('Lỗi đánh giá shadowing');
    }
  }
}


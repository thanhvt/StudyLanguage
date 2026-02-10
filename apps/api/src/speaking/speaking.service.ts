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

      // Lấy 5 topics gần nhất (unique)
      const recentTopics = [...new Set(lessons.slice(0, 10).map((l: any) => l.topic))].slice(0, 5);

      // Tính sessions theo tuần hiện tại
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const thisWeekSessions = lessons.filter(
        (l: any) => new Date(l.created_at) >= weekStart,
      ).length;

      return {
        success: true,
        stats: {
          totalSessions,
          totalMinutes,
          thisWeekSessions,
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

  /**
   * Voice Clone (Skeleton)
   *
   * Mục đích: Placeholder cho Azure Custom Voice feature
   * @param _userId - ID của user
   * @param _audioSample - Audio sample (Buffer)
   * @param _text - Text cần TTS với giọng clone
   * @returns Placeholder response
   * Khi nào sử dụng: POST /speaking/voice-clone
   *
   * TODO [VOICE-CLONE]: Implement Azure Custom Voice integration
   * - Cần Azure Custom Neural Voice approval
   * - Steps: Upload audio sample → Create voice profile → Generate TTS
   * - Docs: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/custom-neural-voice
   */
  async voiceClone(
    _userId: string,
    _audioSample: Buffer,
    _text: string,
  ) {
    // TODO [VOICE-CLONE]: Implement Azure Custom Voice
    // 1. Upload audio sample to Azure
    // 2. Create/get voice profile
    // 3. Generate TTS with custom voice
    // 4. Return audio buffer

    this.logger.warn('[SpeakingService] Voice Clone chưa được implement - trả về placeholder');

    return {
      success: false,
      message: 'Feature Voice Clone đang phát triển. Sẽ sớm ra mắt!',
      status: 'coming_soon',
      // TODO [VOICE-CLONE]: Thay thế bằng actual response:
      // audio: base64AudioBuffer,
      // contentType: 'audio/mpeg',
    };
  }
}

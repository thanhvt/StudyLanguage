/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface cho việc tạo lesson mới
 */
export interface CreateLessonDto {
  type: 'listening' | 'speaking' | 'reading' | 'writing';
  topic: string;
  content: any;
  durationMinutes?: number;
  numSpeakers?: number;
  keywords?: string;
  mode?: 'passive' | 'interactive';
  status?: 'draft' | 'completed';
}

export interface LessonRow {
  id: string;
  user_id: string;
  type: string;
  topic: string;
  content: any;
  duration_minutes: number | null;
  num_speakers: number | null;
  keywords: string | null;
  mode: string;
  status: string;
  created_at: string;
  audio_url?: string | null;
  audio_timestamps?: any;
}

/**
 * LessonsService - Service xử lý CRUD cho lessons
 *
 * Mục đích: Tạo và quản lý các bài học trong database
 * Khi nào sử dụng: Được inject vào LessonsController
 */
@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Tạo lesson mới
   *
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu lesson cần tạo
   * @returns Lesson vừa tạo
   */
  async createLesson(userId: string, dto: CreateLessonDto) {
    const { data, error } = await this.supabase
      .from('lessons')
      .insert({
        user_id: userId,
        type: dto.type,
        topic: dto.topic,
        content: dto.content,
        duration_minutes: dto.durationMinutes,
        num_speakers: dto.numSpeakers,
        keywords: dto.keywords,
        mode: dto.mode || 'passive',
        status: dto.status || 'completed',
      })
      .select()
      .single();

    if (error) {
      this.logger.error('[LessonsService] Lỗi tạo lesson:', error);
      throw error;
    }

    const lessonData = data as LessonRow;

    return {
      success: true,
      lesson: {
        id: lessonData.id,
        type: lessonData.type,
        topic: lessonData.topic,
        createdAt: lessonData.created_at,
      },
    };
  }

  /**
   * Cập nhật audio URL và timestamps cho lesson
   *
   * Mục đích: Lưu audio URL sau khi sinh xong để không cần sinh lại
   * Tham số:
   *   - userId: ID của user (để kiểm tra quyền sở hữu)
   *   - lessonId: ID của lesson
   *   - audioUrl: URL audio trên Supabase Storage
   *   - audioTimestamps: Timestamps của từng câu trong audio
   * Khi nào sử dụng: Sau khi frontend sinh audio xong và nhận được URL từ backend
   */
  async updateAudioData(
    userId: string,
    lessonId: string,
    audioUrl: string,
    audioTimestamps?: { startTime: number; endTime: number }[],
  ) {
    // Kiểm tra quyền sở hữu lesson
    const { data: lesson, error: fetchError } = await this.supabase
      .from('lessons')
      .select('id, user_id')
      .eq('id', lessonId)
      .single();

    if (fetchError || !lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    if (lesson.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật bài học này');
    }

    const updateData: { audio_url: string; audio_timestamps?: object } = {
      audio_url: audioUrl,
    };

    if (audioTimestamps) {
      updateData.audio_timestamps = audioTimestamps;
    }

    const { error } = await this.supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('[LessonsService] Lỗi cập nhật audio:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã lưu audio URL',
    };
  }
}

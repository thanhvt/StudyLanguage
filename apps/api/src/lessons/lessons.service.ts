import { Injectable } from '@nestjs/common';
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

/**
 * LessonsService - Service xử lý CRUD cho lessons
 * 
 * Mục đích: Tạo và quản lý các bài học trong database
 * Khi nào sử dụng: Được inject vào LessonsController
 */
@Injectable()
export class LessonsService {
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
      console.error('[LessonsService] Lỗi tạo lesson:', error);
      throw error;
    }

    return {
      success: true,
      lesson: {
        id: data.id,
        type: data.type,
        topic: data.topic,
        createdAt: data.created_at,
      },
    };
  }

  /**
   * Cập nhật audio URL và timestamps cho lesson
   * 
   * Mục đích: Lưu audio URL sau khi sinh xong để không cần sinh lại
   * Tham số:
   *   - lessonId: ID của lesson
   *   - audioUrl: URL audio trên Supabase Storage
   *   - audioTimestamps: Timestamps của từng câu trong audio
   * Khi nào sử dụng: Sau khi frontend sinh audio xong và nhận được URL từ backend
   */
  async updateAudioData(
    lessonId: string, 
    audioUrl: string,
    audioTimestamps?: { startTime: number; endTime: number }[],
  ) {
    const updateData: { audio_url: string; audio_timestamps?: object } = {
      audio_url: audioUrl,
    };
    
    if (audioTimestamps) {
      updateData.audio_timestamps = audioTimestamps;
    }

    const { error } = await this.supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId);

    if (error) {
      console.error('[LessonsService] Lỗi cập nhật audio:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã lưu audio URL',
    };
  }
}

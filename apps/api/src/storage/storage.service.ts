import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

/**
 * Storage Service - Supabase Storage Integration
 *
 * Mục đích: Upload và quản lý files trên Supabase Storage
 * Khi nào sử dụng: Upload audio lessons, user recordings
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials không được cấu hình. Storage sẽ không hoạt động.');
    }

    this.supabase = createClient(supabaseUrl || '', supabaseKey || '');
  }

  /**
   * Upload audio file lên Supabase Storage
   *
   * Mục đích: Lưu trữ audio lessons
   * Tham số:
   *   - buffer: Audio data dạng Buffer
   *   - bucket: Tên bucket (default: audio-lessons)
   *   - filename: Tên file tùy chọn (default: UUID)
   * Trả về: Public URL của file
   */
  async uploadAudio(
    buffer: Buffer,
    bucket: string = 'audio-lessons',
    filename?: string,
  ): Promise<string> {
    const fileName = filename || `${randomUUID()}.mp3`;
    const filePath = `lessons/${fileName}`;

    this.logger.log(`Đang upload audio: ${filePath}`);

    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        this.logger.error('Lỗi upload:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Lấy public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      this.logger.log(`Upload thành công: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    } catch (error) {
      this.logger.error('Lỗi upload audio:', error);
      throw error;
    }
  }

  /**
   * Xóa file khỏi storage
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      this.logger.error('Lỗi xóa file:', error);
      throw error;
    }
  }
}

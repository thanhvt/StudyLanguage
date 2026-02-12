/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface DTO tạo bookmark mới
 *
 * Mục đích: Định nghĩa dữ liệu cần thiết khi tạo bookmark
 * Khi nào sử dụng: POST /bookmarks
 */
export interface CreateBookmarkDto {
  historyEntryId?: string;
  sentenceIndex: number;
  speaker: string;
  sentenceText: string;
  sentenceTranslation?: string;
  topic?: string;
}

/**
 * BookmarksService - Service xử lý CRUD cho Sentence Bookmarks
 *
 * Mục đích: Quản lý bookmarks câu trong bài nghe trên Supabase
 * Tham số đầu vào: userId và DTO từ controller
 * Tham số đầu ra: Dữ liệu bookmark từ Supabase
 * Khi nào sử dụng: Được inject vào BookmarksController
 */
@Injectable()
export class BookmarksService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(BookmarksService.name);

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Tạo bookmark mới cho 1 câu trong transcript
   *
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu bookmark cần tạo
   * @returns Bookmark vừa tạo
   * Khi nào sử dụng: User long press câu trong transcript → POST /bookmarks
   */
  async createBookmark(userId: string, dto: CreateBookmarkDto) {
    // Kiểm tra trùng lặp: cùng user, cùng session, cùng sentence_index
    if (dto.historyEntryId) {
      const { data: existing } = await this.supabase
        .from('sentence_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('history_entry_id', dto.historyEntryId)
        .eq('sentence_index', dto.sentenceIndex)
        .maybeSingle();

      if (existing) {
        this.logger.log(`Bookmark đã tồn tại, trả về bookmark hiện có: ${existing.id}`);
        return {
          success: true,
          bookmark: this.transformBookmark(existing),
          alreadyExists: true,
        };
      }
    }

    const { data, error } = await this.supabase
      .from('sentence_bookmarks')
      .insert({
        user_id: userId,
        history_entry_id: dto.historyEntryId || null,
        sentence_index: dto.sentenceIndex,
        speaker: dto.speaker || '',
        sentence_text: dto.sentenceText,
        sentence_translation: dto.sentenceTranslation || null,
        topic: dto.topic || null,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Lỗi tạo bookmark:', error);
      throw error;
    }

    this.logger.log(`Đã tạo bookmark mới: ${data.id} cho câu index ${dto.sentenceIndex}`);

    return {
      success: true,
      bookmark: this.transformBookmark(data),
      alreadyExists: false,
    };
  }

  /**
   * Lấy danh sách bookmarks của user
   *
   * @param userId - ID của user hiện tại
   * @param page - Trang hiện tại (mặc định 1)
   * @param limit - Số bản ghi mỗi trang (mặc định 20)
   * @returns Danh sách bookmarks, sắp xếp mới nhất trước
   * Khi nào sử dụng: GET /bookmarks → Bookmark list screen (tương lai)
   */
  async getBookmarks(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from('sentence_bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error('Lỗi lấy bookmarks:', error);
      throw error;
    }

    return {
      success: true,
      bookmarks: (data || []).map(this.transformBookmark),
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Lấy bookmarks theo session (history entry) cụ thể
   *
   * @param userId - ID của user hiện tại
   * @param historyEntryId - ID của session trong learning_history
   * @returns Danh sách bookmarks của session đó
   * Khi nào sử dụng: GET /bookmarks/session/:id → PlayerScreen load bookmark state khi resume
   */
  async getBookmarksBySession(userId: string, historyEntryId: string) {
    const { data, error } = await this.supabase
      .from('sentence_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('history_entry_id', historyEntryId)
      .order('sentence_index', { ascending: true });

    if (error) {
      this.logger.error('Lỗi lấy bookmarks theo session:', error);
      throw error;
    }

    return {
      success: true,
      bookmarks: (data || []).map(this.transformBookmark),
      count: data?.length || 0,
    };
  }

  /**
   * Xóa bookmark
   *
   * @param userId - ID của user hiện tại
   * @param bookmarkId - ID của bookmark cần xóa
   * @returns Kết quả xóa
   * Khi nào sử dụng: DELETE /bookmarks/:id → User long press lại câu đã bookmark để bỏ
   */
  async deleteBookmark(userId: string, bookmarkId: string) {
    const { error } = await this.supabase
      .from('sentence_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('Lỗi xóa bookmark:', error);
      throw error;
    }

    this.logger.log(`Đã xóa bookmark: ${bookmarkId}`);

    return {
      success: true,
      message: 'Đã xóa bookmark',
    };
  }

  /**
   * Xóa bookmark theo sentence index trong session
   *
   * @param userId - ID của user hiện tại
   * @param historyEntryId - ID session (nullable)
   * @param sentenceIndex - Vị trí câu trong transcript
   * @returns Kết quả xóa
   * Khi nào sử dụng: Mobile gọi khi user long press câu đã bookmark để toggle off
   */
  async deleteBookmarkByIndex(
    userId: string,
    historyEntryId: string | null,
    sentenceIndex: number,
  ) {
    let query = this.supabase
      .from('sentence_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('sentence_index', sentenceIndex);

    if (historyEntryId) {
      query = query.eq('history_entry_id', historyEntryId);
    }

    const { error } = await query;

    if (error) {
      this.logger.error('Lỗi xóa bookmark theo index:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa bookmark',
    };
  }

  /**
   * Transform database row thành response format
   *
   * Mục đích: Chuyển snake_case DB fields sang camelCase cho frontend
   * Tham số đầu vào: row (any) - DB row
   * Tham số đầu ra: Object camelCase
   * Khi nào sử dụng: Sau mỗi query, trước khi return
   */
  private transformBookmark(row: any) {
    return {
      id: row.id,
      historyEntryId: row.history_entry_id,
      sentenceIndex: row.sentence_index,
      speaker: row.speaker,
      sentenceText: row.sentence_text,
      sentenceTranslation: row.sentence_translation,
      topic: row.topic,
      createdAt: row.created_at,
    };
  }
}

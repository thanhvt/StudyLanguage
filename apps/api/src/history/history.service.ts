import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface định nghĩa filter options cho history query
 */
export interface HistoryFilters {
  type?: 'listening' | 'speaking' | 'reading' | 'writing';
  status?: 'all' | 'pinned' | 'favorite' | 'deleted';
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Interface định nghĩa một entry trong lịch sử
 */
export interface HistoryEntry {
  id: string;
  type: 'listening' | 'speaking' | 'reading' | 'writing';
  topic: string;
  content: any;
  durationMinutes?: number;
  numSpeakers?: number;
  keywords?: string;
  mode?: string;
  status: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  deletedAt?: string;
}

/**
 * HistoryService - Service xử lý logic nghiệp vụ cho lịch sử học tập
 * 
 * Mục đích: CRUD operations cho lịch sử bài học với Supabase
 * Khi nào sử dụng: Được inject vào HistoryController
 */
@Injectable()
export class HistoryService {
  private supabase: SupabaseClient;

  constructor() {
    // Khởi tạo Supabase client với service role key để bypass RLS
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Lấy danh sách lịch sử với filters
   * 
   * @param userId - ID của user hiện tại
   * @param filters - Các điều kiện lọc
   * @returns Danh sách entries và metadata phân trang
   */
  async getHistory(userId: string, filters: HistoryFilters) {
    const { type, status, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    // Build query
    let query = this.supabase
      .from('lessons')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false }) // Pinned items lên đầu
      .order('created_at', { ascending: false });

    // Filter theo type
    if (type) {
      query = query.eq('type', type);
    }

    // Filter theo status
    switch (status) {
      case 'pinned':
        query = query.eq('is_pinned', true).is('deleted_at', null);
        break;
      case 'favorite':
        query = query.eq('is_favorite', true).is('deleted_at', null);
        break;
      case 'deleted':
        query = query.not('deleted_at', 'is', null);
        break;
      case 'all':
      default:
        query = query.is('deleted_at', null);
        break;
    }

    // Search theo topic hoặc keywords
    if (search) {
      query = query.or(`topic.ilike.%${search}%,keywords.ilike.%${search}%`);
    }

    // Phân trang
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[HistoryService] Lỗi lấy lịch sử:', error);
      throw error;
    }

    // Transform data để khớp với interface frontend
    const entries: HistoryEntry[] = (data || []).map(this.transformEntry);

    return {
      entries,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Lấy chi tiết một bản ghi
   */
  async getHistoryEntry(userId: string, id: string): Promise<HistoryEntry> {
    const { data, error } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Không tìm thấy bản ghi');
    }

    return this.transformEntry(data);
  }

  /**
   * Toggle trạng thái pin
   */
  async togglePin(userId: string, id: string) {
    // Lấy trạng thái hiện tại
    const entry = await this.getHistoryEntry(userId, id);

    // Cập nhật ngược lại
    const { data, error } = await this.supabase
      .from('lessons')
      .update({ is_pinned: !entry.isPinned })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[HistoryService] Lỗi toggle pin:', error);
      throw error;
    }

    return {
      success: true,
      isPinned: data.is_pinned,
      message: data.is_pinned ? 'Đã ghim bản ghi' : 'Đã bỏ ghim',
    };
  }

  /**
   * Toggle trạng thái favorite
   */
  async toggleFavorite(userId: string, id: string) {
    // Lấy trạng thái hiện tại
    const entry = await this.getHistoryEntry(userId, id);

    // Cập nhật ngược lại
    const { data, error } = await this.supabase
      .from('lessons')
      .update({ is_favorite: !entry.isFavorite })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[HistoryService] Lỗi toggle favorite:', error);
      throw error;
    }

    return {
      success: true,
      isFavorite: data.is_favorite,
      message: data.is_favorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
    };
  }

  /**
   * Soft delete - đánh dấu deleted_at
   */
  async softDelete(userId: string, id: string) {
    // Verify ownership
    await this.getHistoryEntry(userId, id);

    const { error } = await this.supabase
      .from('lessons')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[HistoryService] Lỗi soft delete:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa bản ghi (có thể khôi phục)',
    };
  }

  /**
   * Restore - khôi phục bản ghi đã xóa
   */
  async restore(userId: string, id: string) {
    const { error } = await this.supabase
      .from('lessons')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[HistoryService] Lỗi restore:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã khôi phục bản ghi',
    };
  }

  /**
   * Permanent delete - xóa vĩnh viễn
   */
  async permanentDelete(userId: string, id: string) {
    // Verify ownership
    await this.getHistoryEntry(userId, id);

    const { error } = await this.supabase
      .from('lessons')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[HistoryService] Lỗi permanent delete:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa vĩnh viễn bản ghi',
    };
  }

  /**
   * Transform database row thành HistoryEntry interface
   */
  private transformEntry(row: any): HistoryEntry {
    return {
      id: row.id,
      type: row.type,
      topic: row.topic,
      content: row.content,
      durationMinutes: row.duration_minutes,
      numSpeakers: row.num_speakers,
      keywords: row.keywords,
      mode: row.mode,
      status: row.status,
      isPinned: row.is_pinned || false,
      isFavorite: row.is_favorite || false,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
    };
  }
}

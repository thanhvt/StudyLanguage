import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
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
  dateFrom?: string; // ISO date string (YYYY-MM-DD)
  dateTo?: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Interface định nghĩa một entry trong lịch sử
 */
/**
 * Interface định nghĩa thống kê lịch sử học tập
 */
export interface HistoryStats {
  todayCount: number;
  weekCount: number;
  streak: number;
  heatmapData: { date: string; count: number }[];
  weeklyData: { date: string; count: number; byType: { listening: number; speaking: number; reading: number } }[];
}

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
  userNotes?: string;
  createdAt: string;
  deletedAt?: string;
  // Audio data - lưu trữ để tái sử dụng, không cần sinh lại
  audioUrl?: string;
  audioTimestamps?: { startTime: number; endTime: number }[];
}

/**
 * HistoryService - Service xử lý logic nghiệp vụ cho lịch sử học tập
 * 
 * Mục đích: CRUD operations cho lịch sử bài học với Supabase
 * Khi nào sử dụng: Được inject vào HistoryController
 */
@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private supabase: SupabaseClient;

  constructor() {
    // Khởi tạo Supabase client với service role key để bypass RLS
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Tạo mới một bản ghi lịch sử học tập
   *
   * Mục đích: Lưu kết quả session học (reading/listening/speaking) vào DB
   * @param userId - ID của user hiện tại
   * @param data - Dữ liệu session cần lưu
   * @returns Entry vừa tạo (đã transform) kèm message xác nhận
   * Khi nào sử dụng: POST /history → Sau khi user hoàn thành 1 session học
   *   - Reading: lưu bài đọc đã hoàn thành
   *   - Listening: lưu bài nghe đã hoàn thành
   *   - Speaking: lưu bài nói đã hoàn thành
   */
  async createEntry(
    userId: string,
    data: {
      type: 'listening' | 'speaking' | 'reading';
      topic: string;
      content?: any;
      durationMinutes?: number;
      numSpeakers?: number;
      keywords?: string;
      mode?: string;
      audioUrl?: string;
      audioTimestamps?: { startTime: number; endTime: number }[];
    },
  ) {
    const insertData: Record<string, any> = {
      user_id: userId,
      type: data.type,
      topic: data.topic,
      content: data.content || null,
      duration_minutes: data.durationMinutes || null,
      num_speakers: data.numSpeakers || null,
      keywords: data.keywords || null,
      mode: data.mode || null,
      status: 'completed',
      is_pinned: false,
      is_favorite: false,
      audio_url: data.audioUrl || null,
      audio_timestamps: data.audioTimestamps || null,
    };

    const { data: created, error } = await this.supabase
      .from('lessons')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      this.logger.error('[HistoryService] Lỗi tạo bản ghi lịch sử:', error);
      throw error;
    }

    return {
      success: true,
      entry: this.transformEntry(created),
      message: 'Đã lưu bài học vào lịch sử',
    };
  }

  /**
   * Lấy danh sách lịch sử với filters
   * 
   * @param userId - ID của user hiện tại
   * @param filters - Các điều kiện lọc
   * @returns Danh sách entries và metadata phân trang
   */
  async getHistory(userId: string, filters: HistoryFilters) {
    const { type, status, search, page = 1, limit = 20, dateFrom, dateTo } = filters;
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

    // Search theo topic hoặc keywords (đã sanitize wildcard)
    if (search) {
      // Escape ký tự đặc biệt của PostgreSQL LIKE để tránh pattern injection
      const sanitized = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`topic.ilike.%${sanitized}%,keywords.ilike.%${sanitized}%`);
    }

    // Filter theo date range
    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }
    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }

    // Phân trang
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('[HistoryService] Lỗi lấy lịch sử:', error);
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
      this.logger.error('[HistoryService] Lỗi toggle pin:', error);
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
      this.logger.error('[HistoryService] Lỗi toggle favorite:', error);
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
      this.logger.error('[HistoryService] Lỗi soft delete:', error);
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
      this.logger.error('[HistoryService] Lỗi restore:', error);
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
      this.logger.error('[HistoryService] Lỗi permanent delete:', error);
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
      userNotes: row.user_notes || null,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      // Audio data - trả về nếu đã có trong DB
      audioUrl: row.audio_url || undefined,
      audioTimestamps: row.audio_timestamps || undefined,
    };
  }

  /**
   * Cập nhật ghi chú cho bản ghi
   * 
   * @param userId - ID của user hiện tại
   * @param id - ID của bản ghi
   * @param notes - Nội dung ghi chú
   * @returns Kết quả và ghi chú đã lưu
   */
  async updateNotes(userId: string, id: string, notes: string) {
    // Verify ownership
    await this.getHistoryEntry(userId, id);

    const { data, error } = await this.supabase
      .from('lessons')
      .update({ user_notes: notes })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('[HistoryService] Lỗi cập nhật notes:', error);
      throw error;
    }

    return {
      success: true,
      userNotes: data.user_notes,
      message: 'Đã lưu ghi chú',
    };
  }

  /**
   * Lấy thống kê lịch sử học tập
   * 
   * @param userId - ID của user hiện tại
   * @returns HistoryStats với todayCount, weekCount, streak, heatmapData, weeklyData
   */
  async getStats(userId: string): Promise<HistoryStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6); // 7 days including today
    const ninetyDaysAgo = new Date(todayStart);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

    // Lấy tất cả lessons trong 90 ngày
    const { data: lessonsData, error } = await this.supabase
      .from('lessons')
      .select('created_at, type')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('[HistoryService] Lỗi lấy stats:', error);
      throw error;
    }

    const lessons = lessonsData || [];

    // Count today
    const todayCount = lessons.filter(l => 
      new Date(l.created_at) >= todayStart
    ).length;

    // Count this week
    const weekCount = lessons.filter(l => 
      new Date(l.created_at) >= weekStart
    ).length;

    // Build date map for heatmap and streak calculation
    const dateMap: Map<string, { count: number; byType: { listening: number; speaking: number; reading: number } }> = new Map();
    
    lessons.forEach(l => {
      const date = new Date(l.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { count: 0, byType: { listening: 0, speaking: 0, reading: 0 } });
      }
      
      const entry = dateMap.get(dateKey)!;
      entry.count++;
      
      if (l.type === 'listening' || l.type === 'speaking' || l.type === 'reading') {
        const lessonType = l.type as 'listening' | 'speaking' | 'reading';
        entry.byType[lessonType]++;
      }
    });

    // Calculate streak
    let streak = 0;
    const checkDate = new Date(todayStart);
    
    // Check if today has lessons, if not start from yesterday
    const todayKey = checkDate.toISOString().split('T')[0];
    if (!dateMap.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Count consecutive days
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (dateMap.has(dateKey) && dateMap.get(dateKey)!.count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Build heatmap data (90 days)
    const heatmapData: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      heatmapData.push({
        date: dateKey,
        count: dateMap.get(dateKey)?.count || 0,
      });
    }

    // Build weekly data (7 days)
    const weeklyData: { date: string; count: number; byType: { listening: number; speaking: number; reading: number } }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = dateMap.get(dateKey);
      weeklyData.push({
        date: dateKey,
        count: dayData?.count || 0,
        byType: dayData?.byType || { listening: 0, speaking: 0, reading: 0 },
      });
    }

    return {
      todayCount,
      weekCount,
      streak,
      heatmapData,
      weeklyData,
    };
  }

  /**
   * Batch action trên nhiều entries
   *
   * Mục đích: Thực hiện cùng 1 hành động trên nhiều bản ghi
   * @param userId - ID của user hiện tại
   * @param ids - Danh sách IDs
   * @param action - Hành động: 'delete' | 'pin' | 'unpin' | 'favorite' | 'unfavorite'
   * @returns Kết quả batch action
   * Khi nào sử dụng: POST /history/batch-action → chọn nhiều items rồi xóa/pin
   */
  async batchAction(
    userId: string,
    ids: string[],
    action: 'delete' | 'pin' | 'unpin' | 'favorite' | 'unfavorite',
  ) {
    let updateData: Record<string, any> = {};
    let message = '';

    switch (action) {
      case 'delete':
        updateData = { deleted_at: new Date().toISOString() };
        message = `Đã xóa ${ids.length} bản ghi`;
        break;
      case 'pin':
        updateData = { is_pinned: true };
        message = `Đã ghim ${ids.length} bản ghi`;
        break;
      case 'unpin':
        updateData = { is_pinned: false };
        message = `Đã bỏ ghim ${ids.length} bản ghi`;
        break;
      case 'favorite':
        updateData = { is_favorite: true };
        message = `Đã yêu thích ${ids.length} bản ghi`;
        break;
      case 'unfavorite':
        updateData = { is_favorite: false };
        message = `Đã bỏ yêu thích ${ids.length} bản ghi`;
        break;
    }

    const { error } = await this.supabase
      .from('lessons')
      .update(updateData)
      .in('id', ids)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('[HistoryService] Lỗi batch action:', error);
      throw error;
    }

    return {
      success: true,
      affected: ids.length,
      message,
    };
  }

  /**
   * Lấy analytics data cho charts
   *
   * Mục đích: Aggregate data theo thời gian cho biểu đồ
   * @param userId - ID của user hiện tại
   * @param period - 'week' | 'month' | 'year'
   * @returns Analytics data cho charts
   * Khi nào sử dụng: GET /history/analytics → History analytics screen
   */
  async getAnalytics(userId: string, period: string = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    const { data: lessons, error } = await this.supabase
      .from('lessons')
      .select('type, duration_minutes, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('[HistoryService] Lỗi lấy analytics:', error);
      throw error;
    }

    const data = lessons || [];

    // Phân bố theo loại bài
    const typeDistribution = {
      listening: data.filter((l: any) => l.type === 'listening').length,
      speaking: data.filter((l: any) => l.type === 'speaking').length,
      reading: data.filter((l: any) => l.type === 'reading').length,
    };

    // Tổng thời gian
    const totalMinutes = data.reduce(
      (sum: number, l: any) => sum + (l.duration_minutes || 0),
      0,
    );

    // Aggregate theo ngày
    const dailyData: Record<string, { count: number; minutes: number }> = {};
    for (const lesson of data) {
      const date = new Date(lesson.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, minutes: 0 };
      }
      dailyData[date].count++;
      dailyData[date].minutes += (lesson as any).duration_minutes || 0;
    }

    return {
      success: true,
      analytics: {
        period,
        totalSessions: data.length,
        totalMinutes,
        avgMinutesPerDay: Math.round(totalMinutes / Math.max(Object.keys(dailyData).length, 1)),
        typeDistribution,
        dailyData: Object.entries(dailyData).map(([date, val]) => ({
          date,
          ...val,
        })),
      },
    };
  }

  /**
   * Export session summary dạng text
   *
   * Mục đích: Tạo summary text cho 1 session để share/export
   * @param userId - ID của user hiện tại
   * @param id - ID của session
   * @returns Text summary
   * Khi nào sử dụng: POST /history/:id/export → Export/Share
   */
  async exportSession(userId: string, id: string) {
    const entry = await this.getHistoryEntry(userId, id);

    // Tạo summary text
    const lines: string[] = [
      `📚 StudyLanguage - Bản ghi học tập`,
      ``,
      `📌 Chủ đề: ${entry.topic}`,
      `📝 Loại: ${entry.type}`,
      `⏱ Thời lượng: ${entry.durationMinutes || 0} phút`,
      `📅 Ngày học: ${new Date(entry.createdAt).toLocaleDateString('vi-VN')}`,
    ];

    if (entry.keywords) {
      lines.push(`🔑 Từ khóa: ${entry.keywords}`);
    }

    if (entry.userNotes) {
      lines.push(``, `📝 Ghi chú: ${entry.userNotes}`);
    }

    return {
      success: true,
      summary: lines.join('\n'),
      entry,
    };
  }
}


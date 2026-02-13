/**
 * Mục đích: API service layer cho History module
 * Tham số đầu vào: Các hàm nhận filters, id, notes...
 * Tham số đầu ra: Promise với dữ liệu history từ backend
 * Khi nào sử dụng: Được gọi từ useHistoryStore và HistoryScreen
 *   khi user xem/quản lý lịch sử học tập
 *
 * Backend endpoints: /history (NestJS HistoryController)
 * DB table: lessons (Supabase)
 */

import {apiClient} from './client';

// ==========================================
// Interfaces — khớp với backend HistoryEntry
// ==========================================

/**
 * Mục đích: Định nghĩa một bản ghi lịch sử học tập
 * Khi nào sử dụng: Mọi nơi hiển thị history entry (HistoryCard, Detail...)
 */
export interface HistoryEntry {
  id: string;
  type: 'listening' | 'speaking' | 'reading';
  topic: string;
  content: Record<string, unknown>;
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
  audioUrl?: string;
  audioTimestamps?: {startTime: number; endTime: number}[];
}

/**
 * Mục đích: Filter options khi query history
 * Khi nào sử dụng: HistoryScreen → truyền vào getHistory()
 */
export interface HistoryFilters {
  type?: 'listening' | 'speaking' | 'reading' | 'all';
  status?: 'all' | 'pinned' | 'favorite' | 'deleted';
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Mục đích: Thông tin phân trang từ API
 * Khi nào sử dụng: useHistoryStore → quản lý pagination state
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Mục đích: Response từ GET /history
 * Khi nào sử dụng: getHistory() → parse response
 */
export interface HistoryResponse {
  entries: HistoryEntry[];
  pagination: Pagination;
}

/**
 * Mục đích: Thống kê lịch sử học tập
 * Khi nào sử dụng: StatsBar → hiển thị streak, today, week
 */
export interface HistoryStats {
  todayCount: number;
  weekCount: number;
  streak: number;
  heatmapData: {date: string; count: number}[];
  weeklyData: {
    date: string;
    count: number;
    byType: {listening: number; speaking: number; reading: number};
  }[];
}

// ==========================================
// API Functions
// ==========================================

/**
 * Mục đích: Lấy danh sách lịch sử học tập với filters + phân trang
 * Tham số đầu vào: filters - HistoryFilters (type, status, search, page, limit)
 * Tham số đầu ra: Promise<HistoryResponse> { entries, pagination }
 * Khi nào sử dụng: HistoryScreen mount, filter change, load more, pull-to-refresh
 */
export async function getHistory(
  filters: HistoryFilters = {},
): Promise<HistoryResponse> {
  const params: Record<string, string> = {};

  if (filters.type && filters.type !== 'all') {
    params.type = filters.type;
  }
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.page) {
    params.page = String(filters.page);
  }
  if (filters.limit) {
    params.limit = String(filters.limit);
  }
  if (filters.dateFrom) {
    params.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    params.dateTo = filters.dateTo;
  }

  console.log('📜 [HistoryAPI] Lấy danh sách lịch sử...', params);

  const response = await apiClient.get<HistoryResponse>('/history', {params});
  return response.data;
}

/**
 * Mục đích: Lấy thống kê lịch sử (streak, today, week, heatmap)
 * Tham số đầu vào: không có
 * Tham số đầu ra: Promise<HistoryStats>
 * Khi nào sử dụng: HistoryScreen mount → StatsBar hiển thị
 */
export async function getStats(): Promise<HistoryStats> {
  console.log('📊 [HistoryAPI] Lấy thống kê...');

  const response = await apiClient.get<HistoryStats>('/history/stats');
  return response.data;
}

/**
 * Mục đích: Toggle ghim (pin) một bản ghi lịch sử
 * Tham số đầu vào: id - ID bản ghi
 * Tham số đầu ra: Promise<{ success, isPinned, message }>
 * Khi nào sử dụng: HistoryCard → swipe right hoặc long press → Pin
 */
export async function togglePin(
  id: string,
): Promise<{success: boolean; isPinned: boolean; message: string}> {
  console.log('📌 [HistoryAPI] Toggle pin:', id);

  const response = await apiClient.patch<{
    success: boolean;
    isPinned: boolean;
    message: string;
  }>(`/history/${id}/pin`);
  return response.data;
}

/**
 * Mục đích: Toggle yêu thích (favorite) một bản ghi
 * Tham số đầu vào: id - ID bản ghi
 * Tham số đầu ra: Promise<{ success, isFavorite, message }>
 * Khi nào sử dụng: HistoryCard → long press → Favorite
 */
export async function toggleFavorite(
  id: string,
): Promise<{success: boolean; isFavorite: boolean; message: string}> {
  console.log('⭐ [HistoryAPI] Toggle favorite:', id);

  const response = await apiClient.patch<{
    success: boolean;
    isFavorite: boolean;
    message: string;
  }>(`/history/${id}/favorite`);
  return response.data;
}

/**
 * Mục đích: Xóa mềm một bản ghi (soft delete)
 * Tham số đầu vào: id - ID bản ghi
 * Tham số đầu ra: Promise<{ success, message }>
 * Khi nào sử dụng: HistoryCard → swipe left hoặc long press → Delete
 */
export async function deleteEntry(
  id: string,
): Promise<{success: boolean; message: string}> {
  console.log('🗑️ [HistoryAPI] Xóa mềm:', id);

  const response = await apiClient.delete<{success: boolean; message: string}>(
    `/history/${id}`,
  );
  return response.data;
}

/**
 * Mục đích: Khôi phục bản ghi đã xóa
 * Tham số đầu vào: id - ID bản ghi
 * Tham số đầu ra: Promise<{ success, message }>
 * Khi nào sử dụng: Deleted tab → Restore button
 */
export async function restoreEntry(
  id: string,
): Promise<{success: boolean; message: string}> {
  console.log('♻️ [HistoryAPI] Khôi phục:', id);

  const response = await apiClient.post<{success: boolean; message: string}>(
    `/history/${id}/restore`,
  );
  return response.data;
}

/**
 * Mục đích: Cập nhật ghi chú cho bản ghi
 * Tham số đầu vào: id - ID bản ghi, notes - Nội dung ghi chú
 * Tham số đầu ra: Promise<{ success, userNotes, message }>
 * Khi nào sử dụng: Session detail → Notes input
 */
export async function updateNotes(
  id: string,
  notes: string,
): Promise<{success: boolean; userNotes: string; message: string}> {
  console.log('📝 [HistoryAPI] Cập nhật ghi chú:', id);

  const response = await apiClient.patch<{
    success: boolean;
    userNotes: string;
    message: string;
  }>(`/history/${id}/notes`, {notes});
  return response.data;
}

/**
 * Mục đích: Lấy chi tiết một bản ghi
 * Tham số đầu vào: id - ID bản ghi
 * Tham số đầu ra: Promise<HistoryEntry>
 * Khi nào sử dụng: Session detail screen
 */
export async function getHistoryEntry(id: string): Promise<HistoryEntry> {
  console.log('🔍 [HistoryAPI] Lấy chi tiết:', id);

  const response = await apiClient.get<HistoryEntry>(`/history/${id}`);
  return response.data;
}

// Gộp tất cả vào object để import dễ dàng
export const historyApi = {
  getHistory,
  getStats,
  togglePin,
  toggleFavorite,
  deleteEntry,
  restoreEntry,
  updateNotes,
  getHistoryEntry,
};

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, apiJson } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Interface định nghĩa một entry trong lịch sử
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
}

/**
 * Interface cho filters
 */
export interface HistoryFilters {
  type?: 'listening' | 'speaking' | 'reading' | 'all';
  status?: 'all' | 'pinned' | 'favorite' | 'deleted';
  search?: string;
}

/**
 * Interface cho pagination info
 */
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Interface cho API response
 */
interface HistoryResponse {
  entries: HistoryEntry[];
  pagination: Pagination;
}

/**
 * useHistory - Hook quản lý lịch sử học tập
 * 
 * Mục đích: Cung cấp state và functions để quản lý lịch sử
 * Tham số đầu vào: 
 *   - initialFilters: Filters mặc định (optional)
 * Tham số đầu ra: Object chứa history data và các functions
 * Khi nào sử dụng: Trong các page hoặc component cần hiển thị/quản lý lịch sử
 */
export function useHistory(initialFilters?: Partial<HistoryFilters>) {
  // State
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<HistoryFilters>({
    type: 'all',
    status: 'all',
    search: '',
    ...initialFilters,
  });

  /**
   * Fetch lịch sử từ API
   */
  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') {
        params.set('type', filters.type);
      }
      if (filters.status) {
        params.set('status', filters.status);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await apiJson<HistoryResponse>(
        `/history?${params.toString()}`
      );

      setHistory(response.entries);
      setPagination(response.pagination);
    } catch (err) {
      console.error('[useHistory] Lỗi fetch lịch sử:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  /**
   * Toggle trạng thái pin
   */
  const togglePin = useCallback(async (id: string) => {
    try {
      const response = await apiJson<{ success: boolean; isPinned: boolean }>(
        `/history/${id}/pin`,
        { method: 'PATCH' }
      );

      // Cập nhật local state
      setHistory(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, isPinned: response.isPinned } : entry
        )
      );

      return response;
    } catch (err) {
      console.error('[useHistory] Lỗi toggle pin:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  /**
   * Toggle trạng thái favorite
   */
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const response = await apiJson<{ success: boolean; isFavorite: boolean }>(
        `/history/${id}/favorite`,
        { method: 'PATCH' }
      );

      // Cập nhật local state
      setHistory(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, isFavorite: response.isFavorite } : entry
        )
      );

      return response;
    } catch (err) {
      console.error('[useHistory] Lỗi toggle favorite:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  /**
   * Soft delete một entry
   */
  const deleteEntry = useCallback(async (id: string) => {
    try {
      await api(`/history/${id}`, { method: 'DELETE' });

      // Remove từ local state
      setHistory(prev => prev.filter(entry => entry.id !== id));

      toast.success('Đã xóa bài học');
      return { success: true };
    } catch (err) {
      console.error('[useHistory] Lỗi delete:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  /**
   * Restore một entry đã xóa
   */
  const restoreEntry = useCallback(async (id: string) => {
    try {
      await api(`/history/${id}/restore`, { method: 'POST' });

      // Refresh list
      fetchHistory(pagination.page);

      toast.success('Đã khôi phục bài học');
      return { success: true };
    } catch (err) {
      console.error('[useHistory] Lỗi restore:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, [fetchHistory, pagination.page]);

  /**
   * Cập nhật ghi chú cho một entry
   */
  const updateNotes = useCallback(async (id: string, notes: string) => {
    try {
      const response = await apiJson<{ success: boolean; userNotes: string }>(
        `/history/${id}/notes`,
        { 
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes })
        }
      );

      // Cập nhật local state
      setHistory(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, userNotes: response.userNotes } : entry
        )
      );

      toast.success('Đã lưu ghi chú');
      return response;
    } catch (err) {
      console.error('[useHistory] Lỗi update notes:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  /**
   * Cập nhật filters
   */
  const updateFilters = useCallback((newFilters: Partial<HistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Chuyển trang
   */
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchHistory(page);
    }
  }, [fetchHistory, pagination.totalPages]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchHistory(pagination.page);
  }, [fetchHistory, pagination.page]);

  // Auto-fetch khi filters thay đổi
  useEffect(() => {
    fetchHistory(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    // Data
    history,
    loading,
    pagination,
    filters,
    
    // Actions
    setFilters: updateFilters,
    togglePin,
    toggleFavorite,
    deleteEntry,
    restoreEntry,
    updateNotes,
    goToPage,
    refresh,
  };
}


/**
 * getTypeIcon - Lấy icon cho từng loại bài học
 */
export function getTypeIcon(type: HistoryEntry['type']): string {
  const icons = {
    listening: '🎧',
    speaking: '🎤',
    reading: '📖',
  };
  return icons[type] || '📚';
}

/**
 * getTypeLabel - Lấy label tiếng Việt cho từng loại
 */
export function getTypeLabel(type: HistoryEntry['type']): string {
  const labels = {
    listening: 'Nghe',
    speaking: 'Nói',
    reading: 'Đọc',
  };
  return labels[type] || type;
}

/**
 * formatRelativeTime - Format thời gian relative
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
}

/**
 * formatDateGroup - Nhóm theo ngày
 */
export function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (entryDate.getTime() === today.getTime()) return 'Hôm nay';
  if (entryDate.getTime() === yesterday.getTime()) return 'Hôm qua';
  if (entryDate > weekAgo) return 'Tuần này';
  
  return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
}

/**
 * Interface cho thống kê lịch sử
 */
export interface HistoryStats {
  todayCount: number;
  weekCount: number;
  streak: number;
  heatmapData: { date: string; count: number }[];
  weeklyData: { 
    date: string; 
    count: number; 
    byType: { listening: number; speaking: number; reading: number } 
  }[];
}

/**
 * useHistoryStats - Hook lấy thống kê lịch sử học tập
 * 
 * Mục đích: Fetch data cho stats cards, heatmap, weekly chart
 * Tham số đầu ra: Object chứa stats data và loading state
 */
export function useHistoryStats() {
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiJson<HistoryStats>('/history/stats');
      setStats(data);
    } catch (err) {
      console.error('[useHistoryStats] Lỗi fetch stats:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

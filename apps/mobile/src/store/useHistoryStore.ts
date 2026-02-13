/**
 * Mục đích: Zustand store quản lý state cho History module
 * Tham số đầu vào: không có (singleton store)
 * Tham số đầu ra: Object chứa state + actions
 * Khi nào sử dụng: HistoryScreen, HistoryCard, StatsBar
 *   → Tất cả components trong History tab đều dùng store này
 *
 * Pattern: Giống useListeningStore, useReadingStore
 */

import {create} from 'zustand';
import type {
  HistoryEntry,
  HistoryFilters,
  HistoryStats,
  Pagination,
} from '@/services/api/history';

// ==========================================
// State Interface
// ==========================================

interface HistoryState {
  // Danh sách entries
  entries: HistoryEntry[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;

  // Filters
  filters: HistoryFilters;

  // Phân trang
  pagination: Pagination;

  // Thống kê
  stats: HistoryStats | null;
  statsLoading: boolean;

  // Search
  searchQuery: string;
}

// ==========================================
// Actions Interface
// ==========================================

interface HistoryActions {
  // Quản lý entries
  setEntries: (entries: HistoryEntry[]) => void;
  appendEntries: (entries: HistoryEntry[]) => void;
  removeEntryLocal: (id: string) => void;

  // Pin/Favorite — cập nhật local state (optimistic update)
  togglePinLocal: (id: string) => void;
  toggleFavoriteLocal: (id: string) => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  setError: (error: string | null) => void;

  // Filters
  setFilters: (filters: Partial<HistoryFilters>) => void;
  setSearchQuery: (query: string) => void;

  // Phân trang
  setPagination: (pagination: Pagination) => void;

  // Thống kê
  setStats: (stats: HistoryStats | null) => void;
  setStatsLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

// ==========================================
// Default State
// ==========================================

const defaultState: HistoryState = {
  entries: [],
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,

  filters: {
    type: 'all',
    status: 'all',
    search: '',
    page: 1,
    limit: 20,
  },

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  stats: null,
  statsLoading: false,

  searchQuery: '',
};

// ==========================================
// Store
// ==========================================

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  (set, get) => ({
    ...defaultState,

    /**
     * Mục đích: Gán danh sách entries mới (thay thế toàn bộ)
     * Tham số đầu vào: entries - Mảng HistoryEntry
     * Tham số đầu ra: void
     * Khi nào sử dụng: fetchHistory() thành công → setEntries(response.entries)
     */
    setEntries: (entries: HistoryEntry[]) => set({entries}),

    /**
     * Mục đích: Nối thêm entries vào cuối danh sách (pagination)
     * Tham số đầu vào: entries - Mảng HistoryEntry
     * Tham số đầu ra: void
     * Khi nào sử dụng: loadMore() → appendEntries(nextPageEntries)
     */
    appendEntries: (newEntries: HistoryEntry[]) =>
      set(state => ({entries: [...state.entries, ...newEntries]})),

    /**
     * Mục đích: Xóa entry khỏi local state (optimistic delete)
     * Tham số đầu vào: id - ID entry cần xóa
     * Tham số đầu ra: void
     * Khi nào sử dụng: HistoryCard swipe left → xóa → removeEntryLocal(id)
     */
    removeEntryLocal: (id: string) =>
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
      })),

    /**
     * Mục đích: Toggle pin trên local state (optimistic update)
     * Tham số đầu vào: id - ID entry
     * Tham số đầu ra: void
     * Khi nào sử dụng: HistoryCard swipe right → togglePinLocal(id)
     */
    togglePinLocal: (id: string) =>
      set(state => ({
        entries: state.entries.map(e =>
          e.id === id ? {...e, isPinned: !e.isPinned} : e,
        ),
      })),

    /**
     * Mục đích: Toggle favorite trên local state (optimistic update)
     * Tham số đầu vào: id - ID entry
     * Tham số đầu ra: void
     * Khi nào sử dụng: HistoryCard long press → Favorite → toggleFavoriteLocal(id)
     */
    toggleFavoriteLocal: (id: string) =>
      set(state => ({
        entries: state.entries.map(e =>
          e.id === id ? {...e, isFavorite: !e.isFavorite} : e,
        ),
      })),

    // Loading states
    setLoading: (loading: boolean) => set({loading}),
    setRefreshing: (refreshing: boolean) => set({refreshing}),
    setLoadingMore: (loadingMore: boolean) => set({loadingMore}),
    setError: (error: string | null) => set({error}),

    /**
     * Mục đích: Cập nhật filters (merge với filters hiện tại)
     * Tham số đầu vào: filters - Partial<HistoryFilters>
     * Tham số đầu ra: void
     * Khi nào sử dụng: FilterPills tap → setFilters({type: 'listening'})
     */
    setFilters: (newFilters: Partial<HistoryFilters>) =>
      set(state => ({
        filters: {...state.filters, ...newFilters, page: 1},
      })),

    /**
     * Mục đích: Cập nhật search query
     * Tham số đầu vào: query - Chuỗi tìm kiếm
     * Tham số đầu ra: void
     * Khi nào sử dụng: Search input change → debounced setSearchQuery
     */
    setSearchQuery: (query: string) =>
      set(state => ({
        searchQuery: query,
        filters: {...state.filters, search: query, page: 1},
      })),

    setPagination: (pagination: Pagination) => set({pagination}),

    setStats: (stats: HistoryStats | null) => set({stats}),
    setStatsLoading: (loading: boolean) => set({statsLoading: loading}),

    /**
     * Mục đích: Reset toàn bộ store về trạng thái mặc định
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: Logout hoặc cần clear data
     */
    reset: () => set(defaultState),
  }),
);

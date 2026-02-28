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

  // Bộ lọc thời gian (NEW ✨)
  dateRange: 'week' | 'month' | '3months' | 'custom' | 'all';
  customDateStart?: string;
  customDateEnd?: string;

  // Sắp xếp (NEW ✨)
  sortOrder: 'newest' | 'oldest';

  // Phân trang
  pagination: Pagination;

  // Thống kê
  stats: HistoryStats | null;
  statsLoading: boolean;

  // Search
  searchQuery: string;
  recentSearches: string[]; // NEW ✨

  // Chế độ chọn nhiều (NEW ✨)
  selectionMode: boolean;
  selectedIds: string[];
}

// ==========================================
// Actions Interface
// ==========================================

interface HistoryActions {
  // Quản lý entries
  setEntries: (entries: HistoryEntry[]) => void;
  appendEntries: (entries: HistoryEntry[]) => void;
  removeEntryLocal: (id: string) => void;
  removeEntriesBatch: (ids: string[]) => void; // NEW ✨

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

  // Date range (NEW ✨)
  setDateRange: (range: HistoryState['dateRange']) => void;
  setCustomDateRange: (start: string, end: string) => void;

  // Sort (NEW ✨)
  setSortOrder: (order: 'newest' | 'oldest') => void;
  toggleSortOrder: () => void;

  // Phân trang
  setPagination: (pagination: Pagination) => void;

  // Thống kê
  setStats: (stats: HistoryStats | null) => void;
  setStatsLoading: (loading: boolean) => void;

  // Recent searches (NEW ✨)
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Selection mode (NEW ✨)
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelectEntry: (id: string) => void;
  selectAllEntries: () => void;
  deselectAllEntries: () => void;

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

  // Bộ lọc thời gian
  dateRange: 'all',
  customDateStart: undefined,
  customDateEnd: undefined,

  // Sắp xếp
  sortOrder: 'newest',

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  stats: null,
  statsLoading: false,

  searchQuery: '',
  recentSearches: [],

  // Selection mode
  selectionMode: false,
  selectedIds: [],
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
     * Mục đích: Nối thêm entries vào cuối danh sách (pagination) — EC-M08 fix: loại trùng lặp
     * Tham số đầu vào: entries - Mảng HistoryEntry
     * Tham số đầu ra: void
     * Khi nào sử dụng: loadMore() → appendEntries(nextPageEntries)
     */
    appendEntries: (newEntries: HistoryEntry[]) =>
      set(state => {
        const existingIds = new Set(state.entries.map(e => e.id));
        const uniqueEntries = newEntries.filter(e => !existingIds.has(e.id));
        return {entries: [...state.entries, ...uniqueEntries]};
      }),

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
     * Mục đích: Xóa nhiều entries cùng lúc (batch delete)
     * Tham số đầu vào: ids - Mảng ID entries cần xóa
     * Tham số đầu ra: void
     * Khi nào sử dụng: BatchActionBar → Delete selected
     */
    removeEntriesBatch: (ids: string[]) =>
      set(state => {
        const idSet = new Set(ids);
        return {
          entries: state.entries.filter(e => !idSet.has(e.id)),
          selectedIds: [],
          selectionMode: false,
        };
      }),

    /**
     * Mục đích: Đặt bộ lọc khoảng thời gian
     * Tham số đầu vào: range - 'week' | 'month' | '3months' | 'custom' | 'all'
     * Tham số đầu ra: void
     * Khi nào sử dụng: DateRangeSheet → chọn khoảng thời gian
     */
    setDateRange: (range: HistoryState['dateRange']) =>
      set(state => {
        // Tính dateFrom dựa trên range
        const now = new Date();
        let dateFrom: string | undefined;
        let dateTo: string | undefined;

        switch (range) {
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFrom = weekAgo.toISOString().split('T')[0];
            break;
          }
          case 'month': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFrom = monthAgo.toISOString().split('T')[0];
            break;
          }
          case '3months': {
            const threeMonths = new Date(now);
            threeMonths.setMonth(threeMonths.getMonth() - 3);
            dateFrom = threeMonths.toISOString().split('T')[0];
            break;
          }
          case 'custom':
            // Giữ nguyên custom dates
            dateFrom = state.customDateStart;
            dateTo = state.customDateEnd;
            break;
          default:
            dateFrom = undefined;
            dateTo = undefined;
        }

        return {
          dateRange: range,
          filters: {
            ...state.filters,
            dateFrom,
            dateTo,
            page: 1,
          },
        };
      }),

    /**
     * Mục đích: Đặt khoảng thời gian tùy chỉnh
     * Tham số đầu vào: start, end - ISO date strings (YYYY-MM-DD)
     * Tham số đầu ra: void
     * Khi nào sử dụng: DateRangeSheet → chọn "Tùy chỉnh" → chọn ngày
     */
    setCustomDateRange: (start: string, end: string) =>
      set(state => ({
        dateRange: 'custom' as const,
        customDateStart: start,
        customDateEnd: end,
        filters: {
          ...state.filters,
          dateFrom: start,
          dateTo: end,
          page: 1,
        },
      })),

    /**
     * Mục đích: Đặt thứ tự sắp xếp
     * Tham số đầu vào: order - 'newest' | 'oldest'
     * Tham số đầu ra: void
     * Khi nào sử dụng: SortToggle → tap
     */
    setSortOrder: (order: 'newest' | 'oldest') => set({sortOrder: order}),

    /**
     * Mục đích: Toggle thứ tự sắp xếp giữa newest và oldest
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: SortToggle button press
     */
    toggleSortOrder: () =>
      set(state => ({
        sortOrder: state.sortOrder === 'newest' ? 'oldest' : 'newest',
      })),

    /**
     * Mục đích: Thêm một từ khóa vào recent searches (max 10)
     * Tham số đầu vào: query - từ khóa tìm kiếm
     * Tham số đầu ra: void
     * Khi nào sử dụng: SearchBar → submit search
     */
    addRecentSearch: (query: string) =>
      set(state => {
        if (!query.trim()) return state;
        const filtered = state.recentSearches.filter(s => s !== query);
        return {
          recentSearches: [query, ...filtered].slice(0, 10),
        };
      }),

    /**
     * Mục đích: Xóa một từ khóa khỏi recent searches
     * Tham số đầu vào: query - từ khóa cần xóa
     * Tham số đầu ra: void
     * Khi nào sử dụng: RecentSearches → tap X bên cạnh từ khóa
     */
    removeRecentSearch: (query: string) =>
      set(state => ({
        recentSearches: state.recentSearches.filter(s => s !== query),
      })),

    /**
     * Mục đích: Xóa toàn bộ recent searches
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: RecentSearches → "Xóa tất cả"
     */
    clearRecentSearches: () => set({recentSearches: []}),

    /**
     * Mục đích: Bật chế độ chọn nhiều
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: HistoryCard long press → vào selection mode
     */
    enterSelectionMode: () => set({selectionMode: true, selectedIds: []}),

    /**
     * Mục đích: Tắt chế độ chọn nhiều và xóa selection
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: BatchActionBar → Cancel / hoàn thành action
     */
    exitSelectionMode: () => set({selectionMode: false, selectedIds: []}),

    /**
     * Mục đích: Toggle chọn/bỏ chọn một entry
     * Tham số đầu vào: id - ID entry
     * Tham số đầu ra: void
     * Khi nào sử dụng: HistoryCard tap khi đang ở selection mode
     */
    toggleSelectEntry: (id: string) =>
      set(state => {
        const isSelected = state.selectedIds.includes(id);
        const newIds = isSelected
          ? state.selectedIds.filter(sid => sid !== id)
          : [...state.selectedIds, id];
        // Tự động thoát selection mode nếu không còn entry nào được chọn
        return {
          selectedIds: newIds,
          selectionMode: newIds.length > 0,
        };
      }),

    /**
     * Mục đích: Chọn tất cả entries hiện tại
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: BatchActionBar → "Chọn tất cả"
     */
    selectAllEntries: () =>
      set(state => ({
        selectedIds: state.entries.map(e => e.id),
      })),

    /**
     * Mục đích: Bỏ chọn tất cả entries
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: BatchActionBar → "Bỏ chọn tất cả"
     */
    deselectAllEntries: () => set({selectedIds: []}),

    /**
     * Mục đích: Reset toàn bộ store về trạng thái mặc định
     * Tham số đầu vào: không có
     * Tham số đầu ra: void
     * Khi nào sử dụng: Logout hoặc cần clear data
     */
    reset: () => set(defaultState),
  }),
);

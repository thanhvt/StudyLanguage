/**
 * Unit test cho useHistoryStore (Zustand)
 *
 * Mục đích: Test History store state management
 * Bao gồm:
 *   - Default state
 *   - setEntries / appendEntries
 *   - togglePinLocal / toggleFavoriteLocal
 *   - removeEntryLocal
 *   - setFilters / setSearchQuery
 *   - setPagination
 *   - reset
 */
import {useHistoryStore} from '@/store/useHistoryStore';
import type {HistoryEntry} from '@/services/api/history';

// Mock entries cho test
const mockEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: 'test-1',
  type: 'listening',
  topic: 'Coffee Shop Talk',
  content: {},
  durationMinutes: 15,
  numSpeakers: 2,
  status: 'completed',
  isPinned: false,
  isFavorite: false,
  createdAt: '2026-02-13T10:00:00Z',
  ...overrides,
});

describe('useHistoryStore', () => {
  beforeEach(() => {
    // Reset store về mặc định trước mỗi test
    useHistoryStore.getState().reset();
  });

  describe('Trạng thái mặc định', () => {
    it('entries rỗng khi khởi tạo', () => {
      expect(useHistoryStore.getState().entries).toEqual([]);
    });

    it('loading = false khi khởi tạo', () => {
      expect(useHistoryStore.getState().loading).toBe(false);
    });

    it('filters mặc định type = all, status = all', () => {
      const {filters} = useHistoryStore.getState();
      expect(filters.type).toBe('all');
      expect(filters.status).toBe('all');
      expect(filters.search).toBe('');
    });

    it('pagination mặc định page = 1, limit = 20', () => {
      const {pagination} = useHistoryStore.getState();
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(20);
      expect(pagination.total).toBe(0);
    });

    it('stats = null khi khởi tạo', () => {
      expect(useHistoryStore.getState().stats).toBeNull();
    });
  });

  describe('Quản lý entries', () => {
    it('setEntries gán danh sách entries', () => {
      const entries = [mockEntry(), mockEntry({id: 'test-2'})];
      useHistoryStore.getState().setEntries(entries);

      expect(useHistoryStore.getState().entries).toHaveLength(2);
    });

    it('setEntries thay thế entries cũ', () => {
      useHistoryStore.getState().setEntries([mockEntry()]);
      useHistoryStore.getState().setEntries([mockEntry({id: 'new-1'})]);

      const {entries} = useHistoryStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('new-1');
    });

    it('appendEntries nối thêm vào cuối', () => {
      useHistoryStore.getState().setEntries([mockEntry({id: 'page-1'})]);
      useHistoryStore
        .getState()
        .appendEntries([mockEntry({id: 'page-2'}), mockEntry({id: 'page-3'})]);

      expect(useHistoryStore.getState().entries).toHaveLength(3);
    });

    it('removeEntryLocal xóa đúng entry', () => {
      useHistoryStore.getState().setEntries([
        mockEntry({id: 'a'}),
        mockEntry({id: 'b'}),
        mockEntry({id: 'c'}),
      ]);

      useHistoryStore.getState().removeEntryLocal('b');

      const ids = useHistoryStore.getState().entries.map(e => e.id);
      expect(ids).toEqual(['a', 'c']);
    });
  });

  describe('Toggle pin/favorite (optimistic update)', () => {
    it('togglePinLocal đổi isPinned thành true', () => {
      useHistoryStore.getState().setEntries([mockEntry({id: 'pin-1', isPinned: false})]);
      useHistoryStore.getState().togglePinLocal('pin-1');

      expect(useHistoryStore.getState().entries[0].isPinned).toBe(true);
    });

    it('togglePinLocal đổi isPinned thành false', () => {
      useHistoryStore.getState().setEntries([mockEntry({id: 'pin-2', isPinned: true})]);
      useHistoryStore.getState().togglePinLocal('pin-2');

      expect(useHistoryStore.getState().entries[0].isPinned).toBe(false);
    });

    it('togglePinLocal chỉ ảnh hưởng đúng entry', () => {
      useHistoryStore.getState().setEntries([
        mockEntry({id: 'x', isPinned: false}),
        mockEntry({id: 'y', isPinned: false}),
      ]);

      useHistoryStore.getState().togglePinLocal('x');

      const entries = useHistoryStore.getState().entries;
      expect(entries[0].isPinned).toBe(true);
      expect(entries[1].isPinned).toBe(false);
    });

    it('toggleFavoriteLocal đổi isFavorite', () => {
      useHistoryStore.getState().setEntries([mockEntry({id: 'fav-1', isFavorite: false})]);
      useHistoryStore.getState().toggleFavoriteLocal('fav-1');

      expect(useHistoryStore.getState().entries[0].isFavorite).toBe(true);
    });
  });

  describe('Filters', () => {
    it('setFilters cập nhật type filter', () => {
      useHistoryStore.getState().setFilters({type: 'listening'});
      expect(useHistoryStore.getState().filters.type).toBe('listening');
    });

    it('setFilters merge đúng, không mất filter cũ', () => {
      useHistoryStore.getState().setFilters({type: 'speaking'});
      useHistoryStore.getState().setFilters({status: 'pinned'});

      const {filters} = useHistoryStore.getState();
      expect(filters.type).toBe('speaking');
      expect(filters.status).toBe('pinned');
    });

    it('setFilters reset page về 1', () => {
      useHistoryStore.getState().setPagination({
        page: 3,
        limit: 20,
        total: 100,
        totalPages: 5,
      });

      useHistoryStore.getState().setFilters({type: 'reading'});
      expect(useHistoryStore.getState().filters.page).toBe(1);
    });

    it('setSearchQuery cập nhật search + filters.search', () => {
      useHistoryStore.getState().setSearchQuery('coffee');

      expect(useHistoryStore.getState().searchQuery).toBe('coffee');
      expect(useHistoryStore.getState().filters.search).toBe('coffee');
    });
  });

  describe('Loading states', () => {
    it('setLoading cập nhật loading', () => {
      useHistoryStore.getState().setLoading(true);
      expect(useHistoryStore.getState().loading).toBe(true);
    });

    it('setRefreshing cập nhật refreshing', () => {
      useHistoryStore.getState().setRefreshing(true);
      expect(useHistoryStore.getState().refreshing).toBe(true);
    });

    it('setLoadingMore cập nhật loadingMore', () => {
      useHistoryStore.getState().setLoadingMore(true);
      expect(useHistoryStore.getState().loadingMore).toBe(true);
    });

    it('setError lưu lỗi', () => {
      useHistoryStore.getState().setError('Lỗi mạng');
      expect(useHistoryStore.getState().error).toBe('Lỗi mạng');
    });
  });

  describe('Stats', () => {
    it('setStats lưu dữ liệu thống kê', () => {
      const mockStats = {
        todayCount: 3,
        weekCount: 15,
        streak: 7,
        heatmapData: [],
        weeklyData: [],
      };
      useHistoryStore.getState().setStats(mockStats);

      expect(useHistoryStore.getState().stats).toEqual(mockStats);
    });

    it('setStats(null) xóa stats', () => {
      useHistoryStore.getState().setStats({
        todayCount: 1,
        weekCount: 1,
        streak: 1,
        heatmapData: [],
        weeklyData: [],
      });
      useHistoryStore.getState().setStats(null);

      expect(useHistoryStore.getState().stats).toBeNull();
    });
  });

  describe('Reset', () => {
    it('reset() trả về trạng thái mặc định', () => {
      // Setup: có data
      useHistoryStore.getState().setEntries([mockEntry()]);
      useHistoryStore.getState().setFilters({type: 'speaking'});
      useHistoryStore.getState().setSearchQuery('test');
      useHistoryStore.getState().setLoading(true);
      useHistoryStore.getState().setStats({
        todayCount: 5,
        weekCount: 20,
        streak: 12,
        heatmapData: [],
        weeklyData: [],
      });

      // Reset
      useHistoryStore.getState().reset();

      const state = useHistoryStore.getState();
      expect(state.entries).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.filters.type).toBe('all');
      expect(state.searchQuery).toBe('');
      expect(state.stats).toBeNull();
      expect(state.pagination.page).toBe(1);
    });
  });
});

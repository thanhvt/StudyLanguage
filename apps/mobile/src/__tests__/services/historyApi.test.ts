/**
 * Unit test cho History API Service (mock axios)
 *
 * Mục đích: Test service layer gọi đúng endpoints + xử lý response
 * Tham số đầu vào: Mock apiClient
 * Tham số đầu ra: Kết quả test
 * Khi nào sử dụng: CI/CD pipeline + pre-commit
 */
import {
  getHistory,
  getStats,
  togglePin,
  toggleFavorite,
  deleteEntry,
  restoreEntry,
  updateNotes,
  getHistoryEntry,
} from '@/services/api/history';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

describe('History API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getHistory
  // ==========================================
  describe('getHistory', () => {
    const mockResponse = {
      data: {
        entries: [
          {id: '1', type: 'listening', topic: 'Coffee', isPinned: false},
        ],
        pagination: {page: 1, limit: 20, total: 1, totalPages: 1},
      },
    };

    it('gọi GET /history không có params khi filters rỗng', async () => {
      mockedClient.get.mockResolvedValue(mockResponse);

      const result = await getHistory();

      expect(mockedClient.get).toHaveBeenCalledWith('/history', {params: {}});
      expect(result.entries).toHaveLength(1);
    });

    it('gọi GET /history với type filter', async () => {
      mockedClient.get.mockResolvedValue(mockResponse);

      await getHistory({type: 'listening'});

      expect(mockedClient.get).toHaveBeenCalledWith('/history', {
        params: {type: 'listening'},
      });
    });

    it('bỏ qua type=all trong params', async () => {
      mockedClient.get.mockResolvedValue(mockResponse);

      await getHistory({type: 'all'});

      expect(mockedClient.get).toHaveBeenCalledWith('/history', {params: {}});
    });

    it('truyền search + page + limit đúng', async () => {
      mockedClient.get.mockResolvedValue(mockResponse);

      await getHistory({search: 'coffee', page: 2, limit: 10});

      expect(mockedClient.get).toHaveBeenCalledWith('/history', {
        params: {search: 'coffee', page: '2', limit: '10'},
      });
    });

    it('truyền dateFrom + dateTo cho range filter', async () => {
      mockedClient.get.mockResolvedValue(mockResponse);

      await getHistory({dateFrom: '2026-01-01', dateTo: '2026-02-01'});

      expect(mockedClient.get).toHaveBeenCalledWith('/history', {
        params: {dateFrom: '2026-01-01', dateTo: '2026-02-01'},
      });
    });

    it('throw error khi API lỗi', async () => {
      mockedClient.get.mockRejectedValue(new Error('Lỗi mạng'));

      await expect(getHistory()).rejects.toThrow('Lỗi mạng');
    });
  });

  // ==========================================
  // getStats
  // ==========================================
  describe('getStats', () => {
    it('gọi GET /history/stats', async () => {
      const mockStats = {
        data: {todayCount: 3, weekCount: 15, streak: 7, heatmapData: [], weeklyData: []},
      };
      mockedClient.get.mockResolvedValue(mockStats);

      const result = await getStats();

      expect(mockedClient.get).toHaveBeenCalledWith('/history/stats');
      expect(result.streak).toBe(7);
    });
  });

  // ==========================================
  // togglePin
  // ==========================================
  describe('togglePin', () => {
    it('gọi PATCH /history/:id/pin', async () => {
      mockedClient.patch.mockResolvedValue({
        data: {success: true, isPinned: true, message: 'Đã ghim'},
      });

      const result = await togglePin('abc-123');

      expect(mockedClient.patch).toHaveBeenCalledWith('/history/abc-123/pin');
      expect(result.isPinned).toBe(true);
    });
  });

  // ==========================================
  // toggleFavorite
  // ==========================================
  describe('toggleFavorite', () => {
    it('gọi PATCH /history/:id/favorite', async () => {
      mockedClient.patch.mockResolvedValue({
        data: {success: true, isFavorite: true, message: 'Đã yêu thích'},
      });

      const result = await toggleFavorite('abc-123');

      expect(mockedClient.patch).toHaveBeenCalledWith(
        '/history/abc-123/favorite',
      );
      expect(result.isFavorite).toBe(true);
    });
  });

  // ==========================================
  // deleteEntry
  // ==========================================
  describe('deleteEntry', () => {
    it('gọi DELETE /history/:id', async () => {
      mockedClient.delete.mockResolvedValue({
        data: {success: true, message: 'Đã xóa'},
      });

      const result = await deleteEntry('abc-123');

      expect(mockedClient.delete).toHaveBeenCalledWith('/history/abc-123');
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // restoreEntry
  // ==========================================
  describe('restoreEntry', () => {
    it('gọi POST /history/:id/restore', async () => {
      mockedClient.post.mockResolvedValue({
        data: {success: true, message: 'Đã khôi phục'},
      });

      const result = await restoreEntry('abc-123');

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/history/abc-123/restore',
      );
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // updateNotes
  // ==========================================
  describe('updateNotes', () => {
    it('gọi PATCH /history/:id/notes với body', async () => {
      mockedClient.patch.mockResolvedValue({
        data: {success: true, userNotes: 'Ghi chú mới', message: 'OK'},
      });

      const result = await updateNotes('abc-123', 'Ghi chú mới');

      expect(mockedClient.patch).toHaveBeenCalledWith(
        '/history/abc-123/notes',
        {notes: 'Ghi chú mới'},
      );
      expect(result.userNotes).toBe('Ghi chú mới');
    });
  });

  // ==========================================
  // getHistoryEntry
  // ==========================================
  describe('getHistoryEntry', () => {
    it('gọi GET /history/:id', async () => {
      mockedClient.get.mockResolvedValue({
        data: {id: 'abc-123', type: 'speaking', topic: 'Interview'},
      });

      const result = await getHistoryEntry('abc-123');

      expect(mockedClient.get).toHaveBeenCalledWith('/history/abc-123');
      expect(result.topic).toBe('Interview');
    });
  });
});

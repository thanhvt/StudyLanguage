import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HistoryService } from './history.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  })),
}));

describe('HistoryService - Extensions', () => {
  let service: HistoryService;
  let supabase: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryService],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    supabase = (service as any).supabase;
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('getHistory - dateFrom/dateTo filter', () => {
    it('nên áp dụng dateFrom filter', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      await service.getHistory('user-123', {
        dateFrom: '2026-01-01',
      });

      // Assert - gte phải được gọi với dateFrom
      expect(mockQuery.gte).toHaveBeenCalledWith(
        'created_at',
        '2026-01-01T00:00:00.000Z',
      );
    });

    it('nên áp dụng dateFrom và dateTo cùng lúc', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      await service.getHistory('user-123', {
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      });

      // Assert
      expect(mockQuery.gte).toHaveBeenCalledWith(
        'created_at',
        '2026-01-01T00:00:00.000Z',
      );
      expect(mockQuery.lte).toHaveBeenCalledWith(
        'created_at',
        '2026-01-31T23:59:59.999Z',
      );
    });
  });

  describe('batchAction', () => {
    it('nên batch delete nhiều entries', async () => {
      // Arrange
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.batchAction(
        'user-123',
        ['id-1', 'id-2', 'id-3'],
        'delete',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.affected).toBe(3);
      expect(result.message).toContain('3');
      expect(result.message).toContain('xóa');
    });

    it('nên batch pin nhiều entries', async () => {
      // Arrange
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.batchAction(
        'user-123',
        ['id-1', 'id-2'],
        'pin',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.affected).toBe(2);
      expect(result.message).toContain('ghim');
    });

    it('nên batch favorite entries', async () => {
      // Arrange
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.batchAction('user-123', ['id-1'], 'favorite');

      // Assert
      expect(result.message).toContain('yêu thích');
    });

    it('nên throw khi DB lỗi', async () => {
      // Arrange
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act & Assert
      await expect(
        service.batchAction('user-123', ['id-1'], 'delete'),
      ).rejects.toBeDefined();
    });
  });

  describe('getAnalytics', () => {
    it('nên trả về analytics data cho month period', async () => {
      // Arrange
      const today = new Date();
      const mockLessons = [
        { type: 'listening', duration_minutes: 20, created_at: today.toISOString() },
        { type: 'speaking', duration_minutes: 15, created_at: today.toISOString() },
        { type: 'listening', duration_minutes: 10, created_at: today.toISOString() },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getAnalytics('user-123', 'month');

      // Assert
      expect(result.success).toBe(true);
      expect(result.analytics.period).toBe('month');
      expect(result.analytics.totalSessions).toBe(3);
      expect(result.analytics.totalMinutes).toBe(45);
      expect(result.analytics.typeDistribution.listening).toBe(2);
      expect(result.analytics.typeDistribution.speaking).toBe(1);
    });

    it('nên hỗ trợ period = week', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getAnalytics('user-123', 'week');

      // Assert
      expect(result.analytics.period).toBe('week');
      expect(result.analytics.totalSessions).toBe(0);
    });
  });

  describe('exportSession', () => {
    it('nên export session summary', async () => {
      // Arrange - Mock getHistoryEntry
      const mockEntry = {
        id: 'session-1',
        topic: 'Greetings',
        type: 'listening',
        durationMinutes: 15,
        createdAt: '2026-01-15T10:00:00Z',
        keywords: 'hello, hi, hey',
        userNotes: 'Bài này hay quá!',
        content: {},
        status: 'completed',
        isPinned: false,
        isFavorite: false,
      };

      jest.spyOn(service, 'getHistoryEntry').mockResolvedValue(mockEntry as any);

      // Act
      const result = await service.exportSession('user-123', 'session-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.summary).toContain('Greetings');
      expect(result.summary).toContain('listening');
      expect(result.summary).toContain('15 phút');
      expect(result.summary).toContain('hello, hi, hey');
      expect(result.summary).toContain('Bài này hay quá!');
      expect(result.entry).toBeDefined();
    });

    it('nên throw NotFoundException khi entry không tồn tại', async () => {
      // Arrange
      jest.spyOn(service, 'getHistoryEntry').mockRejectedValue(
        new NotFoundException('Không tìm thấy'),
      );

      // Act & Assert
      await expect(
        service.exportSession('user-123', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

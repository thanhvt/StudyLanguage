import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  })),
}));

describe('SyncService', () => {
  let service: SyncService;
  let supabase: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncService],
    }).compile();

    service = module.get<SyncService>(SyncService);
    supabase = (service as any).supabase;
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('processQueue', () => {
    it('nên xử lý CREATE action thành công', async () => {
      // Arrange
      const actions = [
        {
          id: 'action-1',
          type: 'CREATE' as const,
          table: 'lessons',
          data: { topic: 'Test', type: 'listening' },
          timestamp: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.processQueue('user-123', actions);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processed).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(0);
    });

    it('nên xử lý UPDATE action thành công', async () => {
      // Arrange
      const actions = [
        {
          id: 'action-2',
          type: 'UPDATE' as const,
          table: 'lessons',
          data: { id: 'lesson-1', topic: 'Updated' },
          timestamp: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      mockQuery.eq = jest.fn()
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce({ error: null });
      mockQuery.update = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.processQueue('user-123', actions);

      // Assert
      expect(result.successCount).toBe(1);
    });

    it('nên xử lý DELETE action thành công', async () => {
      // Arrange
      const actions = [
        {
          id: 'action-3',
          type: 'DELETE' as const,
          table: 'saved_words',
          data: { id: 'word-1' },
          timestamp: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      mockQuery.eq = jest.fn()
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce({ error: null });
      mockQuery.delete = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.processQueue('user-123', actions);

      // Assert
      expect(result.successCount).toBe(1);
    });

    it('nên reject bảng không nằm trong whitelist', async () => {
      // Arrange
      const actions = [
        {
          id: 'action-4',
          type: 'CREATE' as const,
          table: 'auth.users', // Bảng không cho phép
          data: { email: 'hack@test.com' },
          timestamp: new Date().toISOString(),
        },
      ];

      // Act
      const result = await service.processQueue('user-123', actions);

      // Assert
      expect(result.failCount).toBe(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toContain('không được phép');
    });

    it('nên xử lý mixed success/fail', async () => {
      // Arrange
      const actions = [
        {
          id: 'ok-1',
          type: 'CREATE' as const,
          table: 'lessons',
          data: { topic: 'Good' },
          timestamp: new Date().toISOString(),
        },
        {
          id: 'fail-1',
          type: 'CREATE' as const,
          table: 'forbidden_table',
          data: {},
          timestamp: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.processQueue('user-123', actions);

      // Assert
      expect(result.processed).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
    });

    it('nên xử lý DB error trong action', async () => {
      // Arrange
      const actions = [
        {
          id: 'db-fail',
          type: 'CREATE' as const,
          table: 'lessons',
          data: { topic: 'Test' },
          timestamp: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Foreign key violation' },
        }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.processQueue('user-123', actions);

      // Assert
      expect(result.failCount).toBe(1);
      expect(result.results[0].error).toContain('Foreign key');
    });
  });

  describe('getStatus', () => {
    it('nên trả về sync status', async () => {
      // Arrange
      const mockLessonQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { created_at: '2026-01-01T00:00:00Z' },
          error: null,
        }),
      };
      const mockSettingsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { updated_at: '2026-01-02T00:00:00Z' },
          error: null,
        }),
      };

      let callCount = 0;
      supabase.from = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockLessonQuery : mockSettingsQuery;
      });

      // Act
      const result = await service.getStatus('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.lastSync.lessons).toBe('2026-01-01T00:00:00Z');
      expect(result.lastSync.settings).toBe('2026-01-02T00:00:00Z');
      expect(result.serverTime).toBeDefined();
    });

    it('nên trả về null nếu chưa có data', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getStatus('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.serverTime).toBeDefined();
    });
  });
});

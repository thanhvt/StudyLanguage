import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { StorageService } from '../storage/storage.service';

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    admin: {
      updateUserById: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock StorageService
const mockStorageService = {
  uploadAvatar: jest.fn(),
};

/**
 * UserService Unit Tests
 *
 * Mục đích: Kiểm tra tất cả methods của UserService
 * Bao gồm: stats, wordOfTheDay, lastSession, profile, gamification, settings, GDPR
 */
describe('UserService', () => {
  let service: UserService;

  /**
   * Helper: tạo mock query chain cho Supabase
   *
   * Mục đích: Giảm boilerplate khi mock supabase queries
   * @param resolvedValue - Giá trị trả về cuối chain
   * @returns Mock object với tất cả methods trong chain
   */
  const createMockQuery = (resolvedValue: any) => {
    const query: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(resolvedValue),
    };
    // Order cũng có thể resolve trực tiếp
    query.order = jest.fn().mockImplementation(() => {
      // Trả về query nếu chain tiếp, hoặc resolve nếu kết thúc
      return { ...query, then: (resolve: any) => Promise.resolve(resolvedValue).then(resolve) };
    });
    return query;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('nên trả về stats với streak và level', async () => {
      // Arrange - mock internal methods vì getStats gọi nhiều sub-queries
      const mockGamification = {
        xp: 100, level: 2, badges: [], dailyGoalMinutes: 15,
        speakingGoal: 5, totalSessions: 10, totalMinutes: 50,
      };
      jest.spyOn(service as any, 'getOrCreateGamification').mockResolvedValue(mockGamification);
      jest.spyOn(service as any, 'calculateStreak').mockResolvedValue(3);

      // Mock from('lessons') cho todayLessons và todaySpeakingCount
      const mockLessonsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ data: [{ duration_minutes: 20 }], error: null }),
      };
      const mockSpeakingQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ count: 1, error: null }),
      };
      let fromCallCount = 0;
      mockSupabaseClient.from = jest.fn().mockImplementation(() => {
        fromCallCount++;
        return fromCallCount === 1 ? mockLessonsQuery : mockSpeakingQuery;
      });

      // Act
      const result = await service.getStats('user-123');

      // Assert - getStats trả về UserStats trực tiếp
      expect(result.totalMinutes).toBe(50);
      expect(result.totalSessions).toBe(10);
      expect(result.level).toBe(2);
      expect(result.streak).toBe(3);
      expect(result.todayMinutes).toBe(20);
    });
  });

  describe('getWordOfTheDay', () => {
    it('nên trả về word of the day', async () => {
      // Arrange
      const mockWord = {
        word: 'serendipity',
        ipa: '/ˌserənˈdipəti/',
        meaning_vi: 'Sự tình cờ may mắn',
        meaning_en: 'The occurrence of events by chance',
        example: 'Finding this book was pure serendipity.',
      };

      // getWordOfTheDay gọi from() 2 lần:
      // 1. count query (select id, head: true)
      // 2. data query (select * → eq → single)
      const mockCountQuery = {
        select: jest.fn().mockResolvedValue({ count: 50, error: null }),
      };
      const mockDataQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockWord, error: null }),
      };

      let fromCallCount = 0;
      mockSupabaseClient.from = jest.fn().mockImplementation(() => {
        fromCallCount++;
        return fromCallCount === 1 ? mockCountQuery : mockDataQuery;
      });

      // Act
      const result = await service.getWordOfTheDay();

      // Assert - trả về WordOfTheDay trực tiếp
      expect(result.word).toBe('serendipity');
      expect(result.ipa).toBe('/ˌserənˈdipəti/');
      expect(result.meaningVi).toBe('Sự tình cờ may mắn');
    });
  });

  describe('getLastSession', () => {
    it('nên trả về session cuối cùng', async () => {
      // Arrange
      const mockSession = {
        id: 'session-1',
        topic: 'Greetings',
        type: 'listening',
        created_at: new Date().toISOString(),
        duration_minutes: 15,
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
      };
      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getLastSession('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.session.topic).toBe('Greetings');
    });

    it('nên trả về null nếu không có session nào', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getLastSession('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.session).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('nên cập nhật profile thành công', async () => {
      // Arrange
      mockSupabaseClient.auth.admin.updateUserById = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Act
      const result = await service.updateProfile('user-123', {
        displayName: 'Thành',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('cập nhật');
      // Service maps displayName → full_name trong user_metadata
      expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          user_metadata: expect.objectContaining({ full_name: 'Thành' }),
        }),
      );
    });
  });

  describe('getGamification', () => {
    it('nên trả về gamification data', async () => {
      // Arrange
      const mockGamification = {
        xp: 150,
        level: 3,
        badges: ['first_step'],
        daily_goal_minutes: 15,
        speaking_goal: 5,
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockGamification, error: null }),
      };
      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getGamification('user-123');

      // Assert
      expect(result.success).toBe(true);
      // Service trả về { success: true, data: GamificationData }
      expect(result.data.xp).toBe(150);
      expect(result.data.level).toBe(3);
    });

    it('nên tạo mới nếu chưa có gamification record', async () => {
      // Arrange - select trả về null (chưa có)
      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { xp: 0, level: 1, badges: [], daily_goal_minutes: 10, speaking_goal: 5 },
          error: null,
        }),
      };

      let callCount = 0;
      mockSupabaseClient.from = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockSelectQuery : mockInsertQuery;
      });

      // Act
      const result = await service.getGamification('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.xp).toBe(0);
    });
  });

  describe('getSettings / updateSettings', () => {
    it('nên lấy settings', async () => {
      // Arrange
      const mockSettings = { settings: { theme: 'dark', language: 'vi' } };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSettings, error: null }),
      };
      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getSettings('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.settings.theme).toBe('dark');
    });

    it('nên cập nhật settings', async () => {
      // Arrange
      const newSettings = { theme: 'light', fontSize: 16 };
      const mockQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { settings: newSettings },
          error: null,
        }),
      };
      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.updateSettings('user-123', newSettings);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('exportData', () => {
    it('nên export data của user', async () => {
      // Arrange - Mỗi from() call trả về { data: [] }
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.exportData('user-123');

      // Assert
      expect(result.success).toBe(true);
      // exportedAt ở top level
      expect(result.exportedAt).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.lessons).toEqual([]);
    });
  });

  describe('deleteAccount', () => {
    it('nên xóa account và cascade data', async () => {
      // Arrange
      // Mock from().delete().eq() cho mỗi table
      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      // Mock from().select().eq() cho playlists check
      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      
      let callCount = 0;
      mockSupabaseClient.from = jest.fn().mockImplementation((table: string) => {
        // Calls 1-8: tables cascade delete
        // Call 9: playlists select check
        callCount++;
        if (table === 'playlists' && callCount > 8) {
          return mockSelectQuery;
        }
        return mockDeleteQuery;
      });

      mockSupabaseClient.auth.admin.deleteUser = jest.fn().mockResolvedValue({ error: null });

      // Act
      const result = await service.deleteAccount('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('xóa');
      expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
    });
  });
});

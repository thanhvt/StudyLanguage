import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { SpeakingService } from './speaking.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
}));

describe('SpeakingService', () => {
  let service: SpeakingService;
  let supabase: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeakingService],
    }).compile();

    service = module.get<SpeakingService>(SpeakingService);
    supabase = (service as any).supabase;
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('getTongueTwisters', () => {
    const mockTwisters = [
      { id: 1, text_en: 'She sells seashells', ipa: '/ʃiː sɛlz/', level: 'beginner', difficulty: 1 },
      { id: 2, text_en: 'Peter Piper picked', ipa: '/piːtər/', level: 'beginner', difficulty: 2 },
    ];

    it('nên lấy tất cả tongue twisters', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockTwisters, error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getTongueTwisters();

      // Assert
      expect(result.success).toBe(true);
      expect(result.tongueTwisters).toHaveLength(2);
      expect(result.tongueTwisters[0].text).toBe('She sells seashells');
      expect(result.count).toBe(2);
    });

    it('nên filter theo level', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [mockTwisters[0]], error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getTongueTwisters('beginner');

      // Assert
      expect(result.success).toBe(true);
      expect(result.tongueTwisters).toHaveLength(1);
    });

    it('nên throw InternalServerErrorException khi DB lỗi', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act & Assert
      await expect(service.getTongueTwisters()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getStats', () => {
    it('nên tính toán speaking stats đúng', async () => {
      // Arrange
      const mockLessons = [
        { id: '1', topic: 'Greetings', duration_minutes: 10, created_at: new Date().toISOString(), content: {} },
        { id: '2', topic: 'Shopping', duration_minutes: 15, created_at: new Date().toISOString(), content: {} },
        { id: '3', topic: 'Greetings', duration_minutes: 5, created_at: new Date().toISOString(), content: {} },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
      };
      // Chain 2 lần eq: user_id + type
      mockQuery.eq = jest.fn()
        .mockReturnValueOnce(mockQuery) // eq('user_id', userId)
        .mockReturnValue(mockQuery); // eq('type', 'speaking')
      mockQuery.order = jest.fn().mockResolvedValue({ data: mockLessons, error: null });
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getStats('user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.stats.totalSessions).toBe(3);
      expect(result.stats.totalMinutes).toBe(30);
      expect(result.stats.averageSessionMinutes).toBe(10);
      // Unique topics: Greetings, Shopping
      expect(result.stats.recentTopics).toContain('Greetings');
      expect(result.stats.recentTopics).toContain('Shopping');
    });

    it('nên trả về stats rỗng khi không có sessions', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getStats('user-123');

      // Assert
      expect(result.stats.totalSessions).toBe(0);
      expect(result.stats.totalMinutes).toBe(0);
      expect(result.stats.averageSessionMinutes).toBe(0);
    });
  });

  describe('voiceClone', () => {
    it('nên trả về placeholder response (skeleton)', async () => {
      // Arrange
      const audioBuffer = Buffer.from('fake audio');

      // Act
      const result = await service.voiceClone('user-123', audioBuffer, 'Hello world');

      // Assert
      expect(result.success).toBe(false);
      expect(result.status).toBe('coming_soon');
      expect(result.message).toContain('đang phát triển');
    });
  });
});

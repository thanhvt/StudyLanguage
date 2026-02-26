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
    gte: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
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

  // ============================================
  // getTongueTwisters
  // ============================================

  describe('getTongueTwisters', () => {
    const mockTwisters = [
      { id: 1, text_en: 'She sells seashells', ipa: '/ʃiː sɛlz/', level: 'beginner', difficulty: 1 },
      { id: 2, text_en: 'Peter Piper picked', ipa: '/piːtər/', level: 'beginner', difficulty: 2 },
    ];

    it('nên lấy tất cả tongue twisters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockTwisters, error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getTongueTwisters();

      expect(result.success).toBe(true);
      expect(result.tongueTwisters).toHaveLength(2);
      expect(result.tongueTwisters[0].text).toBe('She sells seashells');
      expect(result.count).toBe(2);
    });

    it('nên filter theo level', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [mockTwisters[0]], error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getTongueTwisters('beginner');

      expect(result.success).toBe(true);
      expect(result.tongueTwisters).toHaveLength(1);
    });

    it('nên throw InternalServerErrorException khi DB lỗi', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      await expect(service.getTongueTwisters()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ============================================
  // getStats (Sprint 1 — Enhanced)
  // ============================================

  describe('getStats', () => {
    it('nên tính toán speaking stats đúng với các fields mới', async () => {
      const mockLessons = [
        { id: '1', topic: 'Greetings', duration_minutes: 10, created_at: new Date().toISOString(), content: { overallScore: 85 } },
        { id: '2', topic: 'Shopping', duration_minutes: 15, created_at: new Date().toISOString(), content: { overallScore: 90 } },
        { id: '3', topic: 'Greetings', duration_minutes: 5, created_at: new Date().toISOString(), content: { overallScore: 75 } },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getStats('user-123');

      expect(result.success).toBe(true);
      expect(result.stats.totalSessions).toBe(3);
      expect(result.stats.totalMinutes).toBe(30);
      expect(result.stats.averageSessionMinutes).toBe(10);
      // Kiểm tra fields mới Sprint 1
      expect(result.stats.topicsCount).toBe(2); // Greetings, Shopping
      expect(result.stats.avgAccuracy).toBe(83); // (85+90+75)/3 = 83.33 → 83
      expect(result.stats.weeklyData).toBeDefined();
      expect(result.stats.weeklyData).toHaveLength(7); // 7 ngày trong tuần
      expect(result.stats.recentTopics).toContain('Greetings');
      expect(result.stats.recentTopics).toContain('Shopping');
    });

    it('nên trả về stats rỗng khi không có sessions', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getStats('user-123');

      expect(result.stats.totalSessions).toBe(0);
      expect(result.stats.totalMinutes).toBe(0);
      expect(result.stats.averageSessionMinutes).toBe(0);
      expect(result.stats.topicsCount).toBe(0);
      expect(result.stats.avgAccuracy).toBe(0);
      expect(result.stats.weeklyData).toHaveLength(7);
    });
  });

  // ============================================
  // getDailyGoal (Sprint 2)
  // ============================================

  describe('getDailyGoal', () => {
    it('nên trả về daily goal với default khi chưa có config', async () => {
      // Mock 2 queries: speaking_goals + lessons
      let callCount = 0;
      supabase.from = jest.fn().mockImplementation((table: string) => {
        if (table === 'speaking_goals') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          };
        }
        // lessons table
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null }),
        };
      });

      const result = await service.getDailyGoal('user-123');

      expect(result.success).toBe(true);
      expect(result.dailyGoal.target).toBe(10); // Default
      expect(result.dailyGoal.completed).toBe(2);
      expect(result.dailyGoal.progress).toBeCloseTo(0.2);
    });
  });

  // ============================================
  // updateDailyGoal (Sprint 2)
  // ============================================

  describe('updateDailyGoal', () => {
    it('nên cập nhật target và clamp trong khoảng 1-100', async () => {
      const mockQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123', target: 15, streak: 3 },
          error: null,
        }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.updateDailyGoal('user-123', 15);

      expect(result.success).toBe(true);
      expect(result.dailyGoal.target).toBe(15);
    });

    it('nên clamp target khi vượt giới hạn', async () => {
      const mockQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123', target: 100, streak: 0 },
          error: null,
        }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.updateDailyGoal('user-123', 999);
      expect(result.success).toBe(true);
      // Target bị clamp xuống 100
      expect(result.dailyGoal.target).toBe(100);
    });
  });

  // ============================================
  // getProgress (Sprint 2)
  // ============================================

  describe('getProgress', () => {
    it('nên trả về progress data đầy đủ', async () => {
      const mockLessons = [
        {
          id: '1', topic: 'Test', duration_minutes: 10,
          created_at: new Date().toISOString(),
          content: { overallScore: 80, pronunciation: 85, fluency: 75, vocabulary: 90, grammar: 70 },
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getProgress('user-123');

      expect(result.success).toBe(true);
      expect(result.progress.radarChart).toBeDefined();
      expect(result.progress.radarChart.pronunciation).toBe(85);
      expect(result.progress.radarChart.fluency).toBe(75);
      expect(result.progress.calendarHeatmap).toBeDefined();
      expect(result.progress.weeklyReport).toBeDefined();
      expect(result.progress.weakSounds).toBeDefined();
    });

    it('nên trả về zeros khi không có data', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getProgress('user-123');

      expect(result.progress.radarChart.pronunciation).toBe(0);
      expect(result.progress.calendarHeatmap).toHaveLength(0);
      expect(result.progress.weeklyReport.avgScore).toBe(0);
    });
  });

  // ============================================
  // getBadges (Sprint 2)
  // ============================================

  describe('getBadges', () => {
    it('nên tính badge đúng dựa trên sessions', async () => {
      // 3 lessons → first-speak badge unlocked
      const mockLessons = [
        { id: '1', created_at: new Date().toISOString(), content: { overallScore: 95 } },
        { id: '2', created_at: new Date().toISOString(), content: { overallScore: 60 } },
        { id: '3', created_at: new Date().toISOString(), content: { overallScore: 92 } },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getBadges('user-123');

      expect(result.success).toBe(true);
      expect(result.totalBadges).toBe(10);
      // first-speak nên unlocked vì có 3 sessions
      const firstSpeak = result.badges.find((b: any) => b.id === 'first-speak');
      expect(firstSpeak?.unlocked).toBe(true);
      // 100-sentences KHÔNG unlocked vì chỉ có 3 sessions
      const hundred = result.badges.find((b: any) => b.id === '100-sentences');
      expect(hundred?.unlocked).toBe(false);
    });

    it('nên trả về badges rỗng khi không có sessions', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getBadges('user-123');

      expect(result.totalUnlocked).toBe(0);
      expect(result.currentStreak).toBe(0);
    });
  });

  // ============================================
  // voiceClone (Sprint 3 — Enhanced)
  // ============================================

  describe('voiceClone', () => {
    it('nên trả về not_configured khi thiếu Azure credentials', async () => {
      // Không set env vars
      delete process.env.AZURE_SPEECH_KEY;
      delete process.env.AZURE_SPEECH_REGION;

      const audioBuffer = Buffer.from('fake audio data for testing minimum length requirements');

      const result = await service.voiceClone('user-123', audioBuffer, 'Hello world');

      expect(result.success).toBe(false);
      expect(result.status).toBe('not_configured');
    });

    it('nên trả về invalid_sample khi audio quá ngắn', async () => {
      process.env.AZURE_SPEECH_KEY = 'test-key';
      process.env.AZURE_SPEECH_REGION = 'eastus';

      const shortBuffer = Buffer.from('short');

      const result = await service.voiceClone('user-123', shortBuffer, 'Hello');

      expect(result.success).toBe(false);
      expect(result.status).toBe('invalid_sample');
    });

    it('nên trả về fallback khi có Azure credentials nhưng chưa có Custom Voice', async () => {
      process.env.AZURE_SPEECH_KEY = 'test-key';
      process.env.AZURE_SPEECH_REGION = 'eastus';

      // Audio đủ dài
      const audioBuffer = Buffer.alloc(5000, 'a');

      const result = await service.voiceClone('user-123', audioBuffer, 'Hello world');

      expect(result.success).toBe(true);
      expect(result.status).toBe('fallback');
      expect(result.originalAudio).toBeDefined();
    });
  });

  // ============================================
  // evaluateShadowing (Sprint 3)
  // ============================================

  describe('evaluateShadowing', () => {
    it('nên tính score chính xác khi user nói đúng hoàn toàn', async () => {
      const result = await service.evaluateShadowing(
        'user-123',
        'Hello world how are you',
        'hello world how are you',
      );

      expect(result.success).toBe(true);
      expect(result.shadowing.accuracy).toBe(100);
      expect(result.shadowing.rhythm).toBe(100);
      expect(result.shadowing.overallScore).toBeGreaterThanOrEqual(90);
      expect(result.shadowing.missedWords).toHaveLength(0);
    });

    it('nên phát hiện từ sai', async () => {
      const result = await service.evaluateShadowing(
        'user-123',
        'I want to go to school',
        'i want go to school',
      );

      expect(result.success).toBe(true);
      expect(result.shadowing.accuracy).toBeLessThan(100);
      expect(result.shadowing.missedWords.length).toBeGreaterThan(0);
    });

    it('nên cho feedback khuyến khích khi score thấp', async () => {
      const result = await service.evaluateShadowing(
        'user-123',
        'The quick brown fox jumps over the lazy dog',
        'quick brown',
      );

      expect(result.success).toBe(true);
      expect(result.shadowing.accuracy).toBeLessThan(50);
      expect(result.shadowing.feedback.length).toBeGreaterThan(0);
    });

    it('nên xử lý chuỗi rỗng gracefully', async () => {
      const result = await service.evaluateShadowing(
        'user-123',
        '',
        '',
      );

      expect(result.success).toBe(true);
      expect(result.shadowing.accuracy).toBe(0);
    });
  });
});

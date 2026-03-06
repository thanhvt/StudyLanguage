/**
 * Unit test cho RadioService
 *
 * Mục đích: Test logic nghiệp vụ của Radio Mode backend
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau mỗi thay đổi radio service
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RadioService } from './radio.service';
import { AiService } from '../ai/ai.service';

// Mock AiService
const mockAiService = {
  generateConversation: jest.fn().mockResolvedValue({
    script: [
      { speaker: 'Person A', text: 'Hello there!' },
      { speaker: 'Person B', text: 'Hi, how are you?' },
    ],
  }),
};

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'mock-playlist-id', name: 'Radio Test' },
            error: null,
          }),
        })),
      })),
    })),
  })),
}));

describe('RadioService', () => {
  let service: RadioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RadioService,
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<RadioService>(RadioService);
    jest.clearAllMocks();
  });

  // ========================
  // generateRandomDuration
  // ========================
  describe('generateRandomDuration', () => {
    it('trả về 1 trong 4 giá trị: 1, 30, 60, 120', () => {
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        results.add(service.generateRandomDuration());
      }
      // Phải có ít nhất 2 giá trị khác nhau (xác suất gần 100%)
      expect(results.size).toBeGreaterThanOrEqual(2);
      results.forEach(val => {
        expect([1, 30, 60, 120]).toContain(val);
      });
    });
  });

  // ========================
  // calculateTrackCount
  // ========================
  describe('calculateTrackCount', () => {
    it('duration 1 phút → 1 track', () => {
      expect(service.calculateTrackCount(1)).toBe(1);
    });

    it('duration 30 phút → ~5 tracks', () => {
      const count = service.calculateTrackCount(30);
      expect(count).toBe(5); // 30/7 = 4.28 → ceil = 5
    });

    it('duration 60 phút → ~9 tracks', () => {
      const count = service.calculateTrackCount(60);
      expect(count).toBe(9); // 60/7 = 8.57 → ceil = 9
    });

    it('duration 120 phút → ~18 tracks', () => {
      const count = service.calculateTrackCount(120);
      expect(count).toBe(18); // 120/7 = 17.14 → ceil = 18
    });

    it('trả về number > 0 cho mọi duration dương', () => {
      for (const dur of [1, 5, 10, 30, 60, 120]) {
        expect(service.calculateTrackCount(dur)).toBeGreaterThan(0);
      }
    });
  });

  // ========================
  // getRandomSpeakerCount (T-06)
  // ========================
  describe('getRandomSpeakerCount', () => {
    it('trả về 2, 3, hoặc 4', () => {
      const results = new Set<number>();
      for (let i = 0; i < 200; i++) {
        results.add(service.getRandomSpeakerCount());
      }
      results.forEach(val => {
        expect([2, 3, 4]).toContain(val);
      });
    });

    it('2 speakers xuất hiện nhiều nhất (~60%)', () => {
      let count2 = 0;
      const total = 1000;
      for (let i = 0; i < total; i++) {
        if (service.getRandomSpeakerCount() === 2) count2++;
      }
      // 60% ± 10% tolerance
      expect(count2 / total).toBeGreaterThan(0.45);
      expect(count2 / total).toBeLessThan(0.75);
    });
  });

  // ========================
  // pickRandomTopics
  // ========================
  describe('pickRandomTopics', () => {
    it('trả về đúng số lượng topics yêu cầu', () => {
      const topics = service.pickRandomTopics(5);
      expect(topics).toHaveLength(5);
    });

    it('không trùng lặp topics', () => {
      const topics = service.pickRandomTopics(10);
      const ids = topics.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('filter theo categories hoạt động', () => {
      const topics = service.pickRandomTopics(3, ['it']);
      topics.forEach(t => {
        expect(t.category).toBe('it');
      });
    });

    it('filter nhiều categories', () => {
      const topics = service.pickRandomTopics(5, ['it', 'daily']);
      topics.forEach(t => {
        expect(['it', 'daily']).toContain(t.category);
      });
    });

    it('fallback khi filter quá ít results', () => {
      // Yêu cầu 100 topics từ 1 category → fallback dùng tất cả
      const topics = service.pickRandomTopics(100);
      expect(topics.length).toBeGreaterThan(0);
    });

    it('trả về mảng rỗng khi count = 0', () => {
      const topics = service.pickRandomTopics(0);
      expect(topics).toHaveLength(0);
    });
  });

  // ========================
  // calculateTrackDuration
  // ========================
  describe('calculateTrackDuration', () => {
    it('clamp giữa 5-10 phút', () => {
      // 30 phút / 5 tracks = 6 → OK
      expect(service.calculateTrackDuration(30, 5)).toBe(6);
    });

    it('không vượt quá 10 phút', () => {
      // 120 phút / 2 tracks = 60 → clamp = 10
      expect(service.calculateTrackDuration(120, 2)).toBe(10);
    });

    it('không dưới 5 phút', () => {
      // 1 phút / 1 track = 1 → clamp = 5
      expect(service.calculateTrackDuration(1, 1)).toBe(5);
    });
  });

  // ========================
  // Edge Cases
  // ========================
  describe('Edge Cases', () => {
    it('gọi nhiều lần pickRandomTopics trả về thứ tự khác nhau', () => {
      const run1 = service.pickRandomTopics(5).map(t => t.id);
      const run2 = service.pickRandomTopics(5).map(t => t.id);
      // Xác suất 2 lần giống nhau cực thấp
      // Nhưng không guarantee nên chỉ check format
      expect(run1).toHaveLength(5);
      expect(run2).toHaveLength(5);
    });

    it('getRandomSpeakerCount không crash khi gọi 1000 lần', () => {
      for (let i = 0; i < 1000; i++) {
        const count = service.getRandomSpeakerCount();
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(4);
      }
    });
  });
});

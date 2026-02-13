/**
 * Unit test cho topic-data.ts utility functions
 *
 * Mục đích: Test dữ liệu topic/scenarios và các hàm tiện ích
 * Tham số đầu vào: không có (pure data + functions)
 * Tham số đầu ra: test results
 * Khi nào sử dụng:
 *   - TopicPicker render danh sách scenarios
 *   - Search bar filter scenarios realtime
 *   - Header hiển thị "140+ scenarios"
 *   - Random suggestion khi user chưa chọn topic
 *
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-021: TopicPicker hiển thị đúng data
 *   - MOB-LIS-MVP-MNL-001: Dữ liệu scenarios đầy đủ
 */
import {
  TOPIC_CATEGORIES,
  searchScenarios,
  getTotalScenarios,
  getRandomScenario,
  getScenariosByCategory,
} from '@/data/topic-data';

describe('topic-data', () => {
  // ========================
  // TOPIC_CATEGORIES — Dữ liệu gốc
  // ========================
  describe('TOPIC_CATEGORIES', () => {
    // Có đủ 3 categories chính
    it('chứa đúng 3 categories (IT, Daily, Personal)', () => {
      expect(TOPIC_CATEGORIES).toHaveLength(3);
      const ids = TOPIC_CATEGORIES.map(c => c.id);
      expect(ids).toContain('it');
      expect(ids).toContain('daily');
      expect(ids).toContain('personal');
    });

    // Mỗi category có đủ fields
    it('mỗi category có id, name, icon, description, subCategories', () => {
      for (const category of TOPIC_CATEGORIES) {
        expect(category.id).toBeTruthy();
        expect(category.name).toBeTruthy();
        expect(category.icon).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(Array.isArray(category.subCategories)).toBe(true);
        expect(category.subCategories.length).toBeGreaterThan(0);
      }
    });

    // Mỗi scenario có đủ id, name, description
    it('mỗi scenario có id, name, description không rỗng', () => {
      for (const category of TOPIC_CATEGORIES) {
        for (const sub of category.subCategories) {
          for (const scenario of sub.scenarios) {
            expect(scenario.id).toBeTruthy();
            expect(scenario.name).toBeTruthy();
            expect(scenario.description).toBeTruthy();
          }
        }
      }
    });

    // Không có ID trùng lặp
    it('tất cả scenario IDs là duy nhất (không trùng)', () => {
      const allIds: string[] = [];
      for (const category of TOPIC_CATEGORIES) {
        for (const sub of category.subCategories) {
          for (const scenario of sub.scenarios) {
            allIds.push(scenario.id);
          }
        }
      }
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    // IT có đúng 40 scenarios
    it('category IT có 40 scenarios', () => {
      const itCategory = TOPIC_CATEGORIES.find(c => c.id === 'it');
      const count = itCategory!.subCategories.reduce(
        (total, sub) => total + sub.scenarios.length,
        0,
      );
      expect(count).toBe(40);
    });

    // Daily có đúng 60 scenarios
    it('category Daily Survival có 60 scenarios', () => {
      const dailyCategory = TOPIC_CATEGORIES.find(c => c.id === 'daily');
      const count = dailyCategory!.subCategories.reduce(
        (total, sub) => total + sub.scenarios.length,
        0,
      );
      expect(count).toBe(60);
    });

    // Personal có đúng 40 scenarios
    it('category Personal Life có 40 scenarios', () => {
      const personalCategory = TOPIC_CATEGORIES.find(c => c.id === 'personal');
      const count = personalCategory!.subCategories.reduce(
        (total, sub) => total + sub.scenarios.length,
        0,
      );
      expect(count).toBe(40);
    });
  });

  // ========================
  // searchScenarios — Tìm kiếm
  // ========================
  describe('searchScenarios', () => {
    // Tìm đúng keyword
    it('tìm thấy scenario theo keyword trong name', () => {
      const results = searchScenarios('stand-up');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].scenario.name.toLowerCase()).toContain('stand-up');
    });

    // Tìm theo description
    it('tìm thấy scenario theo keyword trong description', () => {
      const results = searchScenarios('blockers');
      expect(results.length).toBeGreaterThan(0);
      const hasMatch = results.some(r =>
        r.scenario.description.toLowerCase().includes('blockers'),
      );
      expect(hasMatch).toBe(true);
    });

    // Case-insensitive
    it('tìm kiếm không phân biệt hoa thường', () => {
      const lower = searchScenarios('coffee');
      const upper = searchScenarios('COFFEE');
      const mixed = searchScenarios('Coffee');
      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
    });

    // Chuỗi rỗng → trả về tất cả (vì ''.includes('') === true)
    it('chuỗi rỗng trả về tất cả scenarios', () => {
      const results = searchScenarios('');
      expect(results.length).toBe(getTotalScenarios());
    });

    // Keyword không tồn tại → mảng rỗng
    it('keyword không match trả về mảng rỗng', () => {
      const results = searchScenarios('xyzabcnotexist123');
      expect(results).toEqual([]);
    });

    // Kết quả có đủ category, subCategory, scenario
    it('mỗi kết quả chứa category, subCategory, scenario', () => {
      const results = searchScenarios('airport');
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.category).toBeDefined();
        expect(result.category.id).toBeTruthy();
        expect(result.subCategory).toBeDefined();
        expect(result.subCategory.id).toBeTruthy();
        expect(result.scenario).toBeDefined();
        expect(result.scenario.id).toBeTruthy();
      }
    });

    // Tìm kiếm "hotel" → có kết quả từ Daily
    it('tìm "hotel" trả về kết quả từ Daily category', () => {
      const results = searchScenarios('hotel');
      expect(results.length).toBeGreaterThan(0);
      const hasDailyCategory = results.some(r => r.category.id === 'daily');
      expect(hasDailyCategory).toBe(true);
    });
  });

  // ========================
  // getTotalScenarios — Đếm tổng
  // ========================
  describe('getTotalScenarios', () => {
    // Tổng = 140
    it('trả về đúng 140 scenarios', () => {
      expect(getTotalScenarios()).toBe(140);
    });

    // Đúng khi cộng thủ công (40 + 60 + 40)
    it('tổng = IT(40) + Daily(60) + Personal(40)', () => {
      const manualCount = TOPIC_CATEGORIES.reduce(
        (total, cat) =>
          total +
          cat.subCategories.reduce(
            (subTotal, sub) => subTotal + sub.scenarios.length,
            0,
          ),
        0,
      );
      expect(getTotalScenarios()).toBe(manualCount);
    });
  });

  // ========================
  // getRandomScenario — Random
  // ========================
  describe('getRandomScenario', () => {
    // Trả về object hợp lệ
    it('trả về object có category, subCategory, scenario', () => {
      const result = getRandomScenario();
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.category.id).toBeTruthy();
      expect(result.subCategory).toBeDefined();
      expect(result.subCategory.id).toBeTruthy();
      expect(result.scenario).toBeDefined();
      expect(result.scenario.id).toBeTruthy();
      expect(result.scenario.name).toBeTruthy();
    });

    // Scenario thuộc đúng category/subcategory
    it('scenario thuộc đúng subcategory trong category', () => {
      for (let i = 0; i < 20; i++) {
        const result = getRandomScenario();
        const foundCategory = TOPIC_CATEGORIES.find(
          c => c.id === result.category.id,
        );
        expect(foundCategory).toBeDefined();

        const foundSub = foundCategory!.subCategories.find(
          s => s.id === result.subCategory.id,
        );
        expect(foundSub).toBeDefined();

        const foundScenario = foundSub!.scenarios.find(
          s => s.id === result.scenario.id,
        );
        expect(foundScenario).toBeDefined();
      }
    });
  });

  // ========================
  // getScenariosByCategory — Lấy theo category
  // ========================
  describe('getScenariosByCategory', () => {
    // Tìm đúng category IT
    it('trả về category IT khi truyền id "it"', () => {
      const result = getScenariosByCategory('it');
      expect(result).toBeDefined();
      expect(result!.id).toBe('it');
      expect(result!.name).toBe('IT & Technology');
    });

    // Tìm đúng category Daily
    it('trả về category Daily khi truyền id "daily"', () => {
      const result = getScenariosByCategory('daily');
      expect(result).toBeDefined();
      expect(result!.id).toBe('daily');
    });

    // Tìm đúng category Personal
    it('trả về category Personal khi truyền id "personal"', () => {
      const result = getScenariosByCategory('personal');
      expect(result).toBeDefined();
      expect(result!.id).toBe('personal');
    });

    // ID không tồn tại → undefined
    it('trả về undefined khi category không tồn tại', () => {
      const result = getScenariosByCategory('nonexistent');
      expect(result).toBeUndefined();
    });

    // Trả về đúng subCategories
    it('category IT chứa subCategories (agile, features, architecture, devops)', () => {
      const result = getScenariosByCategory('it');
      const subIds = result!.subCategories.map(s => s.id);
      expect(subIds).toContain('agile');
      expect(subIds).toContain('features');
      expect(subIds).toContain('architecture');
      expect(subIds).toContain('devops');
    });
  });
});

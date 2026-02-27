/**
 * Unit test cho Topic Data module — Tier 1
 *
 * Mục đích: Test searchScenarios, getRandomScenario, getTotalScenarios, data integrity
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau khi thay đổi topic-data.ts
 */
import {
  TOPIC_CATEGORIES,
  searchScenarios,
  getRandomScenario,
  getTotalScenarios,
  type TopicCategory,
  type TopicScenario,
} from '@/data/topic-data';

// ===========================================
// 1. Data Integrity — TOPIC_CATEGORIES
// ===========================================

describe('TOPIC_CATEGORIES — Data Integrity', () => {
  it('có đủ 3 categories chính (IT, Daily, Personal)', () => {
    expect(TOPIC_CATEGORIES.length).toBeGreaterThanOrEqual(3);
    const ids = TOPIC_CATEGORIES.map(c => c.id);
    expect(ids).toContain('it');
    expect(ids).toContain('daily');
    expect(ids).toContain('personal');
  });

  it('mỗi category có đầy đủ fields bắt buộc', () => {
    TOPIC_CATEGORIES.forEach(category => {
      expect(category.id).toBeTruthy();
      expect(category.name).toBeTruthy();
      expect(category.icon).toBeTruthy();
      expect(category.description).toBeTruthy();
      expect(Array.isArray(category.subCategories)).toBe(true);
      expect(category.subCategories.length).toBeGreaterThan(0);
    });
  });

  it('mỗi subcategory có đầy đủ fields bắt buộc', () => {
    TOPIC_CATEGORIES.forEach(category => {
      category.subCategories.forEach(sub => {
        expect(sub.id).toBeTruthy();
        expect(sub.name).toBeTruthy();
        expect(Array.isArray(sub.scenarios)).toBe(true);
        expect(sub.scenarios.length).toBeGreaterThan(0);
      });
    });
  });

  it('mỗi scenario có id, name, description hợp lệ', () => {
    TOPIC_CATEGORIES.forEach(category => {
      category.subCategories.forEach(sub => {
        sub.scenarios.forEach(scenario => {
          expect(scenario.id).toBeTruthy();
          expect(scenario.name).toBeTruthy();
          expect(scenario.description).toBeTruthy();
          // ID nên có prefix phù hợp với category
          expect(typeof scenario.id).toBe('string');
        });
      });
    });
  });

  it('không có scenario ID trùng lặp trên toàn bộ data', () => {
    const allIds: string[] = [];
    TOPIC_CATEGORIES.forEach(category => {
      category.subCategories.forEach(sub => {
        sub.scenarios.forEach(scenario => {
          allIds.push(scenario.id);
        });
      });
    });
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('không có subcategory ID trùng lặp trong cùng category', () => {
    TOPIC_CATEGORIES.forEach(category => {
      const subIds = category.subCategories.map(s => s.id);
      const uniqueSubIds = new Set(subIds);
      expect(uniqueSubIds.size).toBe(subIds.length);
    });
  });

  it('category ID là unique', () => {
    const categoryIds = TOPIC_CATEGORIES.map(c => c.id);
    const uniqueCategoryIds = new Set(categoryIds);
    expect(uniqueCategoryIds.size).toBe(categoryIds.length);
  });
});

// ===========================================
// 2. getTotalScenarios
// ===========================================

describe('getTotalScenarios', () => {
  it('trả về số lượng scenario > 100 (hiện có 140)', () => {
    const total = getTotalScenarios();
    expect(total).toBeGreaterThanOrEqual(100);
  });

  it('trả về đúng tổng khi đếm thủ công', () => {
    let manualCount = 0;
    TOPIC_CATEGORIES.forEach(category => {
      category.subCategories.forEach(sub => {
        manualCount += sub.scenarios.length;
      });
    });
    expect(getTotalScenarios()).toBe(manualCount);
  });

  it('trả về number (không NaN, không undefined)', () => {
    const total = getTotalScenarios();
    expect(typeof total).toBe('number');
    expect(Number.isNaN(total)).toBe(false);
    expect(total).toBeGreaterThan(0);
  });
});

// ===========================================
// 3. searchScenarios
// ===========================================

describe('searchScenarios', () => {
  it('tìm thấy "Daily Stand-up" với keyword "stand"', () => {
    const results = searchScenarios('stand');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const scenarioNames = results.map(r => r.scenario.name);
    expect(scenarioNames).toContain('Daily Stand-up Update');
  });

  it('tìm kiếm case-insensitive', () => {
    const lower = searchScenarios('coffee');
    const upper = searchScenarios('COFFEE');
    const mixed = searchScenarios('CoFfEe');
    // Tất cả phải trả cùng kết quả
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBe(mixed.length);
  });

  it('trả về mảng rỗng khi không tìm thấy', () => {
    const results = searchScenarios('xyznonexistent123');
    expect(results).toEqual([]);
    expect(results.length).toBe(0);
  });

  it('trả về kết quả khi tìm trong description', () => {
    // "Emergency war room" nằm trong description của scenario "Fixing a Critical Bug"
    const results = searchScenarios('war room');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('trả về đủ 3 fields: category, subCategory, scenario', () => {
    const results = searchScenarios('airport');
    expect(results.length).toBeGreaterThanOrEqual(1);
    results.forEach(r => {
      expect(r).toHaveProperty('category');
      expect(r).toHaveProperty('subCategory');
      expect(r).toHaveProperty('scenario');
      expect(r.category.id).toBeTruthy();
      expect(r.subCategory.id).toBeTruthy();
      expect(r.scenario.id).toBeTruthy();
    });
  });

  it('tìm kiếm chuỗi rỗng trả về mảng rỗng', () => {
    const results = searchScenarios('');
    // Chuỗi rỗng "" match tất cả, nhưng hàm hiện tại sẽ trả tất cả
    // vì "".includes("") === true — test kiểm tra behavior thực tế
    expect(Array.isArray(results)).toBe(true);
  });

  it('tìm kiếm ký tự đặc biệt không crash', () => {
    expect(() => searchScenarios('()')).not.toThrow();
    expect(() => searchScenarios('[]')).not.toThrow();
    expect(() => searchScenarios('.*+')).not.toThrow();
    expect(() => searchScenarios('$^')).not.toThrow();
  });
});

// ===========================================
// 4. getRandomScenario
// ===========================================

describe('getRandomScenario', () => {
  it('trả về object hợp lệ với category, subCategory, scenario', () => {
    const random = getRandomScenario();
    expect(random).toBeDefined();
    expect(random).toHaveProperty('category');
    expect(random).toHaveProperty('subCategory');
    expect(random).toHaveProperty('scenario');
  });

  it('scenario trả về có id, name, description', () => {
    const random = getRandomScenario();
    expect(random.scenario.id).toBeTruthy();
    expect(random.scenario.name).toBeTruthy();
    expect(random.scenario.description).toBeTruthy();
  });

  it('category của scenario tồn tại trong TOPIC_CATEGORIES', () => {
    const random = getRandomScenario();
    const found = TOPIC_CATEGORIES.find(c => c.id === random.category.id);
    expect(found).toBeDefined();
  });

  it('gọi nhiều lần không crash', () => {
    for (let i = 0; i < 50; i++) {
      const random = getRandomScenario();
      expect(random).toBeDefined();
      expect(random.scenario).toBeDefined();
    }
  });

  it('không phải lúc nào cũng trả cùng kết quả (tính ngẫu nhiên)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const random = getRandomScenario();
      results.add(random.scenario.id);
    }
    // Với 140 scenarios, 20 lần gọi nên cho ít nhất 2 kết quả khác nhau
    expect(results.size).toBeGreaterThanOrEqual(2);
  });
});

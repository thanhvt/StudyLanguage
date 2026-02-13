/**
 * Unit test cho topic-data.ts
 *
 * Mục đích: Test các utility functions xử lý data kịch bản hội thoại
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-027: Search scenarios
 *   - MOB-LIS-MVP-HP-028: Get random scenario
 *   - MOB-LIS-MVP-HP-029: Get scenarios by category
 *   - MOB-LIS-MVP-EC-010: Search không tìm thấy
 *   - MOB-LIS-MVP-EC-011: Search special characters
 *   - MOB-LIS-MVP-EC-012: getTotalScenarios trả tổng đúng
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
  // TOPIC_CATEGORIES — cấu trúc data
  // ========================
  describe('TOPIC_CATEGORIES', () => {
    it('có ít nhất 3 categories', () => {
      expect(TOPIC_CATEGORIES.length).toBeGreaterThanOrEqual(3);
    });

    it('mỗi category có id, name, icon, subCategories', () => {
      for (const cat of TOPIC_CATEGORIES) {
        expect(cat.id).toBeTruthy();
        expect(cat.name).toBeTruthy();
        expect(cat.icon).toBeTruthy();
        expect(cat.subCategories.length).toBeGreaterThan(0);
      }
    });

    it('mỗi subCategory có id, name, scenarios', () => {
      for (const cat of TOPIC_CATEGORIES) {
        for (const sub of cat.subCategories) {
          expect(sub.id).toBeTruthy();
          expect(sub.name).toBeTruthy();
          expect(sub.scenarios.length).toBeGreaterThan(0);
        }
      }
    });

    it('mỗi scenario có id, name, description', () => {
      for (const cat of TOPIC_CATEGORIES) {
        for (const sub of cat.subCategories) {
          for (const scenario of sub.scenarios) {
            expect(scenario.id).toBeTruthy();
            expect(scenario.name).toBeTruthy();
            expect(scenario.description).toBeTruthy();
          }
        }
      }
    });

    // Edge case: không có duplicate ID
    it('tất cả scenario IDs là unique', () => {
      const allIds: string[] = [];
      for (const cat of TOPIC_CATEGORIES) {
        for (const sub of cat.subCategories) {
          for (const scenario of sub.scenarios) {
            allIds.push(scenario.id);
          }
        }
      }
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  // ========================
  // searchScenarios
  // MOB-LIS-MVP-HP-027
  // ========================
  describe('searchScenarios', () => {
    // MOB-LIS-MVP-HP-027: Tìm kiếm scenario thành công
    it('tìm thấy scenarios theo keyword "interview"', () => {
      const results = searchScenarios('interview');
      expect(results.length).toBeGreaterThan(0);

      // Mỗi result phải chứa keyword ở name, description, hoặc category
      for (const r of results) {
        const combined = `${r.scenario.name} ${r.scenario.description} ${r.category.name}`.toLowerCase();
        expect(combined).toContain('interview');
      }
    });

    it('tìm kiếm case-insensitive (viết hoa/thường)', () => {
      const lower = searchScenarios('meeting');
      const upper = searchScenarios('MEETING');
      const mixed = searchScenarios('Meeting');

      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
    });

    it('kết quả chứa đúng cấu trúc { scenario, category, subCategory }', () => {
      const results = searchScenarios('coffee');

      if (results.length > 0) {
        const first = results[0];
        expect(first.scenario).toBeDefined();
        expect(first.scenario.id).toBeTruthy();
        expect(first.scenario.name).toBeTruthy();
        expect(first.category).toBeDefined();
        expect(first.category.id).toBeTruthy();
        expect(first.subCategory).toBeDefined();
        expect(first.subCategory.id).toBeTruthy();
      }
    });

    // MOB-LIS-MVP-EC-010: Search không tìm thấy
    it('trả mảng rỗng khi không tìm thấy', () => {
      const results = searchScenarios('xyznotexist12345');
      expect(results).toEqual([]);
    });

    // Lưu ý: searchScenarios('') trả TẤT CẢ vì ''.includes('') === true
    // Caller (TopicPicker) check empty trước khi gọi → đây là expected behavior
    it('trả tất cả khi input rỗng (caller phải check trước)', () => {
      const results = searchScenarios('');
      expect(results.length).toBe(getTotalScenarios());
    });

    it('trả mảng rỗng khi input chỉ có whitespace', () => {
      const results = searchScenarios('   ');
      expect(results).toEqual([]);
    });

    // MOB-LIS-MVP-EC-011: Search special characters
    it('xử lý special characters không crash', () => {
      expect(() => searchScenarios('!!!')).not.toThrow();
      expect(() => searchScenarios('()')).not.toThrow();
      expect(() => searchScenarios('[.*+?^${}]')).not.toThrow();
      expect(() => searchScenarios('@#$%')).not.toThrow();
    });

    // Stress: search với 1 ký tự (có thể trả rất nhiều kết quả)
    it('search 1 ký tự "a" trả kết quả hợp lệ', () => {
      const results = searchScenarios('a');
      expect(results.length).toBeGreaterThan(0);
      // Không vượt quá tổng số scenarios
      expect(results.length).toBeLessThanOrEqual(getTotalScenarios());
    });
  });

  // ========================
  // getTotalScenarios
  // MOB-LIS-MVP-EC-012
  // ========================
  describe('getTotalScenarios', () => {
    it('trả về tổng số scenarios > 100', () => {
      // Dataset hiện tại có ~140 scenarios
      expect(getTotalScenarios()).toBeGreaterThan(100);
    });

    it('tổng khớp với đếm thủ công', () => {
      let count = 0;
      for (const cat of TOPIC_CATEGORIES) {
        for (const sub of cat.subCategories) {
          count += sub.scenarios.length;
        }
      }
      expect(getTotalScenarios()).toBe(count);
    });
  });

  // ========================
  // getRandomScenario
  // MOB-LIS-MVP-HP-028
  // ========================
  describe('getRandomScenario', () => {
    // MOB-LIS-MVP-HP-028: Lấy random scenario
    it('trả về object { category, subCategory, scenario }', () => {
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

    // Monkey test: gọi 20 lần không crash
    it('gọi 20 lần không crash, luôn trả kết quả hợp lệ', () => {
      for (let i = 0; i < 20; i++) {
        const result = getRandomScenario();
        expect(result).toBeDefined();
        expect(result.scenario.id).toBeTruthy();
      }
    });

    // Kiểm tra tính random (ít nhất 2 kết quả khác nhau trong 20 lần)
    it('trả kết quả không lặp lại 100% (kiểm tra tính random)', () => {
      const scenarioIds = new Set<string>();
      for (let i = 0; i < 20; i++) {
        scenarioIds.add(getRandomScenario().scenario.id);
      }
      // Trong 20 lần random từ 140+ items, phải có ít nhất 2 kết quả khác nhau
      expect(scenarioIds.size).toBeGreaterThan(1);
    });
  });

  // ========================
  // getScenariosByCategory
  // MOB-LIS-MVP-HP-029
  // ========================
  describe('getScenariosByCategory', () => {
    it('trả về category khi ID hợp lệ ("it")', () => {
      const cat = getScenariosByCategory('it');
      expect(cat).toBeDefined();
      expect(cat!.id).toBe('it');
      expect(cat!.name).toBeTruthy();
      expect(cat!.subCategories.length).toBeGreaterThan(0);
    });

    it('trả về category "daily"', () => {
      const cat = getScenariosByCategory('daily');
      expect(cat).toBeDefined();
      expect(cat!.id).toBe('daily');
    });

    it('trả về category "personal"', () => {
      const cat = getScenariosByCategory('personal');
      expect(cat).toBeDefined();
      expect(cat!.id).toBe('personal');
    });

    it('trả undefined khi ID không tồn tại', () => {
      const cat = getScenariosByCategory('nonexistent');
      expect(cat).toBeUndefined();
    });

    it('trả undefined khi ID rỗng', () => {
      const cat = getScenariosByCategory('');
      expect(cat).toBeUndefined();
    });
  });
});

// ========================
// Store integration — Favorites Tab + Category Switching
// Tests liên quan đến redesign scenario picker
// ========================
describe('useListeningStore — Scenario Picker Redesign', () => {
  // Import lại ở đây vì cần reset giữa các test
  const {useListeningStore} = require('@/store/useListeningStore');

  beforeEach(() => {
    useListeningStore.getState().reset();
  });

  describe('Favorites Tab — Tab "⭐ Yêu thích"', () => {
    it('favoriteScenarioIds ban đầu rỗng', () => {
      expect(useListeningStore.getState().favoriteScenarioIds).toEqual([]);
    });

    it('star 3 scenarios → favorites có 3 IDs', () => {
      const store = useListeningStore.getState();
      store.toggleFavorite('it-standup-1');
      store.toggleFavorite('daily-coffee-1');
      store.toggleFavorite('personal-interview-1');

      const ids = useListeningStore.getState().favoriteScenarioIds;
      expect(ids).toHaveLength(3);
    });

    it('un-star scenario → favorites giảm 1', () => {
      const store = useListeningStore.getState();
      store.toggleFavorite('it-standup-1');
      store.toggleFavorite('daily-coffee-1');
      store.toggleFavorite('it-standup-1'); // bỏ star

      const ids = useListeningStore.getState().favoriteScenarioIds;
      expect(ids).toHaveLength(1);
      expect(ids).toContain('daily-coffee-1');
      expect(ids).not.toContain('it-standup-1');
    });

    // Monkey: toggle cùng ID nhiều lần
    it('toggle favorite 10 lần → state cuối đúng (chẵn = bỏ star)', () => {
      for (let i = 0; i < 10; i++) {
        useListeningStore.getState().toggleFavorite('test-id');
      }
      // 10 lần (chẵn) → không còn trong favorites
      expect(
        useListeningStore.getState().favoriteScenarioIds,
      ).not.toContain('test-id');
    });

    it('toggle favorite 11 lần → state cuối đúng (lẻ = có star)', () => {
      for (let i = 0; i < 11; i++) {
        useListeningStore.getState().toggleFavorite('test-id');
      }
      expect(
        useListeningStore.getState().favoriteScenarioIds,
      ).toContain('test-id');
    });
  });

  describe('Category Switching — Tab navigation', () => {
    it('chuyển sang tab "favorites"', () => {
      useListeningStore.getState().setSelectedCategory('favorites');
      expect(useListeningStore.getState().selectedCategory).toBe('favorites');
    });

    it('chuyển sang tab "custom"', () => {
      useListeningStore.getState().setSelectedCategory('custom');
      expect(useListeningStore.getState().selectedCategory).toBe('custom');
    });

    it('chuyển qua lại nhiều tabs nhanh → state cuối đúng', () => {
      const tabs = ['favorites', 'it', 'daily', 'personal', 'custom', 'favorites'];
      for (const tab of tabs) {
        useListeningStore.getState().setSelectedCategory(tab);
      }
      expect(useListeningStore.getState().selectedCategory).toBe('favorites');
    });

    it('đổi category giữ nguyên selectedTopic', () => {
      const mockTopic = {id: 'test-1', name: 'Test', description: 'desc'};
      useListeningStore.getState().setSelectedTopic(mockTopic, 'it', 'agile');
      useListeningStore.getState().setSelectedCategory('daily');

      const state = useListeningStore.getState();
      expect(state.selectedTopic).toEqual(mockTopic);
      expect(state.selectedCategory).toBe('daily');
    });
  });

  describe('Scenario Selection — Confirm flow', () => {
    it('chọn scenario → config.topic cập nhật', () => {
      const topic = {
        id: 'it-standup-1',
        name: 'Daily Stand-up Update',
        description: 'Báo cáo nhanh hàng ngày',
      };
      useListeningStore.getState().setSelectedTopic(topic, 'it', 'agile');

      const state = useListeningStore.getState();
      expect(state.config.topic).toBe('Daily Stand-up Update');
      expect(state.selectedTopic?.id).toBe('it-standup-1');
    });

    it('bỏ chọn scenario → config.topic trở về rỗng', () => {
      const topic = {id: 'it-1', name: 'Test', description: 'desc'};
      useListeningStore.getState().setSelectedTopic(topic, 'it', 'agile');
      useListeningStore.getState().setSelectedTopic(null);

      expect(useListeningStore.getState().config.topic).toBe('');
      expect(useListeningStore.getState().selectedTopic).toBeNull();
    });

    // Chọn custom scenario
    it('chọn custom scenario → lưu đúng', () => {
      const customTopic = {
        id: 'custom-1707834000',
        name: 'Tình huống tự tạo',
        description: 'Mô tả tự tạo',
      };
      useListeningStore.getState().setSelectedTopic(customTopic, 'custom', '');

      const state = useListeningStore.getState();
      expect(state.selectedTopic?.name).toBe('Tình huống tự tạo');
      expect(state.selectedCategory).toBe('custom');
      expect(state.config.topic).toBe('Tình huống tự tạo');
    });
  });

  describe('SubCategory Toggle — Accordion', () => {
    it('mở accordion → selectedSubCategory cập nhật', () => {
      useListeningStore.getState().setSelectedSubCategory('agile');
      expect(useListeningStore.getState().selectedSubCategory).toBe('agile');
    });

    it('đóng accordion (toggle lại) → selectedSubCategory rỗng', () => {
      useListeningStore.getState().setSelectedSubCategory('agile');
      useListeningStore.getState().setSelectedSubCategory('agile');
      expect(useListeningStore.getState().selectedSubCategory).toBe('');
    });

    it('mở accordion khác → selectedSubCategory đổi sang mới', () => {
      useListeningStore.getState().setSelectedSubCategory('agile');
      useListeningStore.getState().setSelectedSubCategory('tech');
      expect(useListeningStore.getState().selectedSubCategory).toBe('tech');
    });

    // Monkey: toggle nhanh nhiều accordion
    it('toggle 5 accordion khác nhau nhanh → state cuối đúng', () => {
      const subs = ['agile', 'tech', 'daily-food', 'daily-travel', 'personal-work'];
      for (const sub of subs) {
        useListeningStore.getState().setSelectedSubCategory(sub);
      }
      expect(useListeningStore.getState().selectedSubCategory).toBe('personal-work');
    });
  });
});

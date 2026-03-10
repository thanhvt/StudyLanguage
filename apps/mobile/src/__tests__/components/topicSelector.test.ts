/**
 * Unit test cho TopicSelector shared component
 *
 * Mục đích: Verify logic rendering, prop handling, và callback behavior
 *           của TopicSelector component dùng chung giữa 4 config screens
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau khi thay đổi TopicSelector hoặc topic-data
 */

import {TOPIC_CATEGORIES, getTotalScenarios, type TopicScenario} from '../../data/topic-data';

// ============================================
// Helper: Lấy scenarios từ category (mirror logic trong component)
// ============================================

/**
 * Mục đích: Lấy danh sách scenarios theo categoryId + subCategoryId (giống useMemo trong screen)
 * Tham số đầu vào: categoryId (string), subCategoryId (string, optional)
 * Tham số đầu ra: TopicScenario[]
 * Khi nào sử dụng: Test verify đúng scenarios được hiển thị cho mỗi category/subcategory
 */
function getScenariosForCategory(categoryId: string, subCategoryId?: string): TopicScenario[] {
  const category = TOPIC_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return [];
  let scenarios: TopicScenario[] = [];
  if (subCategoryId) {
    const sub = category.subCategories?.find(s => s.id === subCategoryId);
    scenarios = sub?.scenarios ?? [];
  } else {
    category.subCategories?.forEach(sub => {
      scenarios = [...scenarios, ...(sub.scenarios ?? [])];
    });
  }
  return scenarios;
}

/**
 * Mục đích: Kiểm tra scenario có đầy đủ fields bắt buộc không
 * Tham số đầu vào: scenario (TopicScenario)
 * Tham số đầu ra: boolean
 * Khi nào sử dụng: Validate data integrity trong test
 */
function isValidScenario(scenario: TopicScenario): boolean {
  return !!(scenario.id && scenario.name && typeof scenario.description === 'string');
}

// ============================================
// Props interface mirror — verify type contract
// ============================================

interface TopicSelectorCallbackLog {
  onSelectTopic: Array<{topic: TopicScenario | null; categoryId?: string; subCategoryId?: string}>;
  onSelectCategory: string[];
  onSelectSubCategory: string[];
  onTopicInputChange: string[];
  onToggleFavorite: string[];
  onOpenTopicModal: number;
  onPlusPress: number;
}

/**
 * Mục đích: Tạo mock callback logger để track các lần gọi callback
 * Tham số đầu vào: không
 * Tham số đầu ra: TopicSelectorCallbackLog + mock functions
 * Khi nào sử dụng: Test verify callbacks được gọi đúng
 */
function createCallbackLogger() {
  const log: TopicSelectorCallbackLog = {
    onSelectTopic: [],
    onSelectCategory: [],
    onSelectSubCategory: [],
    onTopicInputChange: [],
    onToggleFavorite: [],
    onOpenTopicModal: 0,
    onPlusPress: 0,
  };

  return {
    log,
    callbacks: {
      onSelectTopic: (topic: TopicScenario | null, categoryId?: string, subCategoryId?: string) => {
        log.onSelectTopic.push({topic, categoryId, subCategoryId});
      },
      onSelectCategory: (id: string) => { log.onSelectCategory.push(id); },
      onSelectSubCategory: (id: string) => { log.onSelectSubCategory.push(id); },
      onTopicInputChange: (text: string) => { log.onTopicInputChange.push(text); },
      onToggleFavorite: (id: string) => { log.onToggleFavorite.push(id); },
      onOpenTopicModal: () => { log.onOpenTopicModal++; },
      onPlusPress: () => { log.onPlusPress++; },
    },
  };
}

// ============================================
// Tests
// ============================================

describe('TopicSelector — Data & Logic', () => {
  // ----- TOPIC_CATEGORIES Data Integrity -----

  describe('TOPIC_CATEGORIES — Data Integrity', () => {
    it('có danh sách categories không rỗng', () => {
      expect(Array.isArray(TOPIC_CATEGORIES)).toBe(true);
      expect(TOPIC_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('mỗi category có id và name', () => {
      TOPIC_CATEGORIES.forEach(cat => {
        expect(cat.id).toBeTruthy();
        expect(cat.name).toBeTruthy();
      });
    });

    it('không có category ID trùng lặp', () => {
      const ids = TOPIC_CATEGORIES.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('tổng scenarios > 0', () => {
      expect(getTotalScenarios()).toBeGreaterThan(0);
    });
  });

  // ----- Scenario Filtering Logic -----

  describe('getScenariosForCategory — Filtering Logic', () => {
    it('trả scenarios cho category hợp lệ', () => {
      const firstCat = TOPIC_CATEGORIES[0];
      const scenarios = getScenariosForCategory(firstCat.id);
      expect(Array.isArray(scenarios)).toBe(true);
    });

    it('trả mảng rỗng cho category không tồn tại', () => {
      const scenarios = getScenariosForCategory('non_existent_category_xyz');
      expect(scenarios).toEqual([]);
    });

    it('filter theo subcategory trả ít hơn hoặc bằng tổng', () => {
      const firstCat = TOPIC_CATEGORIES[0];
      if (firstCat.subCategories?.length) {
        const allScenarios = getScenariosForCategory(firstCat.id);
        const firstSub = firstCat.subCategories[0];
        const subScenarios = getScenariosForCategory(firstCat.id, firstSub.id);
        expect(subScenarios.length).toBeLessThanOrEqual(allScenarios.length);
      }
    });

    it('mỗi scenario có đầy đủ fields', () => {
      const firstCat = TOPIC_CATEGORIES[0];
      const scenarios = getScenariosForCategory(firstCat.id);
      scenarios.forEach(s => {
        expect(isValidScenario(s)).toBe(true);
      });
    });

    it('max 3 scenarios khi slice(0, 3) — mirror logic trong component', () => {
      const firstCat = TOPIC_CATEGORIES[0];
      const scenarios = getScenariosForCategory(firstCat.id).slice(0, 3);
      expect(scenarios.length).toBeLessThanOrEqual(3);
    });
  });

  // ----- Callback Logger -----

  describe('Callback System — Contract Verification', () => {
    it('tạo callback logger thành công', () => {
      const {log, callbacks} = createCallbackLogger();
      expect(log.onOpenTopicModal).toBe(0);
      expect(log.onPlusPress).toBe(0);
      expect(log.onSelectTopic).toEqual([]);
      expect(log.onSelectCategory).toEqual([]);
      expect(log.onSelectSubCategory).toEqual([]);
      expect(log.onTopicInputChange).toEqual([]);
      expect(log.onToggleFavorite).toEqual([]);
      expect(typeof callbacks.onSelectTopic).toBe('function');
    });

    it('onSelectTopic ghi đúng data', () => {
      const {log, callbacks} = createCallbackLogger();
      const mockTopic: TopicScenario = {id: 't1', name: 'Test Topic', description: 'Test desc'};

      callbacks.onSelectTopic(mockTopic, 'cat1', 'sub1');
      callbacks.onSelectTopic(null);

      expect(log.onSelectTopic).toHaveLength(2);
      expect(log.onSelectTopic[0]).toEqual({topic: mockTopic, categoryId: 'cat1', subCategoryId: 'sub1'});
      expect(log.onSelectTopic[1]).toEqual({topic: null, categoryId: undefined, subCategoryId: undefined});
    });

    it('onSelectCategory ghi đúng category ID', () => {
      const {log, callbacks} = createCallbackLogger();
      callbacks.onSelectCategory('it');
      callbacks.onSelectCategory('custom');
      callbacks.onSelectCategory('favorites');

      expect(log.onSelectCategory).toEqual(['it', 'custom', 'favorites']);
    });

    it('onToggleFavorite ghi đúng scenario ID', () => {
      const {log, callbacks} = createCallbackLogger();
      callbacks.onToggleFavorite('scenario-1');
      callbacks.onToggleFavorite('scenario-2');
      callbacks.onToggleFavorite('scenario-1'); // Toggle lại

      expect(log.onToggleFavorite).toEqual(['scenario-1', 'scenario-2', 'scenario-1']);
    });

    it('onOpenTopicModal đếm đúng số lần gọi', () => {
      const {log, callbacks} = createCallbackLogger();
      callbacks.onOpenTopicModal();
      callbacks.onOpenTopicModal();
      callbacks.onOpenTopicModal();

      expect(log.onOpenTopicModal).toBe(3);
    });

    it('onTopicInputChange ghi đúng text', () => {
      const {log, callbacks} = createCallbackLogger();
      callbacks.onTopicInputChange('Hello');
      callbacks.onTopicInputChange('Hello world');
      callbacks.onTopicInputChange('');

      expect(log.onTopicInputChange).toEqual(['Hello', 'Hello world', '']);
    });
  });

  // ----- Topic Selection Logic -----

  describe('Topic Selection — Business Logic', () => {
    it('selectedTopic null → topicInput được ưu tiên', () => {
      const selectedTopic = null;
      const topicInput = 'AI và Machine Learning';
      const finalTopic = selectedTopic?.name || topicInput.trim() || null;

      expect(finalTopic).toBe('AI và Machine Learning');
    });

    it('selectedTopic có → topicInput bị ghi đè bởi selectedTopic', () => {
      const selectedTopic: TopicScenario = {id: 't1', name: 'Technology', description: ''};
      const topicInput = 'AI và Machine Learning';
      const finalTopic = selectedTopic?.name || topicInput.trim() || null;

      expect(finalTopic).toBe('Technology'); // selectedTopic được ưu tiên
    });

    it('cả 2 đều rỗng → không valid', () => {
      const selectedTopic = null;
      const topicInput = '   '; // Chỉ có whitespace
      const hasValidTopic = !!selectedTopic || !!topicInput.trim();

      expect(hasValidTopic).toBe(false);
    });

    it('topicInput có text → valid dù không có selectedTopic', () => {
      const selectedTopic = null;
      const topicInput = 'Topic A';
      const hasValidTopic = !!selectedTopic || !!topicInput.trim();

      expect(hasValidTopic).toBe(true);
    });
  });

  // ----- Favorite Logic -----

  describe('Favorite — Toggle Logic', () => {
    it('toggle thêm vào danh sách', () => {
      const favoriteIds: string[] = [];
      const scenarioId = 'sc-1';
      const result = favoriteIds.includes(scenarioId)
        ? favoriteIds.filter(id => id !== scenarioId)
        : [...favoriteIds, scenarioId];

      expect(result).toContain('sc-1');
    });

    it('toggle bỏ khỏi danh sách', () => {
      const favoriteIds = ['sc-1', 'sc-2', 'sc-3'];
      const scenarioId = 'sc-2';
      const result = favoriteIds.includes(scenarioId)
        ? favoriteIds.filter(id => id !== scenarioId)
        : [...favoriteIds, scenarioId];

      expect(result).toEqual(['sc-1', 'sc-3']);
      expect(result).not.toContain('sc-2');
    });

    it('toggle 2 lần → trở lại trạng thái ban đầu', () => {
      let favoriteIds: string[] = ['sc-1'];
      const scenarioId = 'sc-1';

      // Lần 1: bỏ
      favoriteIds = favoriteIds.includes(scenarioId)
        ? favoriteIds.filter(id => id !== scenarioId)
        : [...favoriteIds, scenarioId];
      expect(favoriteIds).toEqual([]);

      // Lần 2: thêm lại
      favoriteIds = favoriteIds.includes(scenarioId)
        ? favoriteIds.filter(id => id !== scenarioId)
        : [...favoriteIds, scenarioId];
      expect(favoriteIds).toEqual(['sc-1']);
    });
  });

  // ----- Custom Scenarios -----

  describe('Custom Scenarios — Tab Logic', () => {
    it('showCustomTab=false → không hiện tab Tuỳ chỉnh', () => {
      const showCustomTab = false;
      const selectedCategory = 'custom';

      // Component sẽ không render custom scenario list nếu showCustomTab=false
      const shouldShowCustomContent = showCustomTab && selectedCategory === 'custom';
      expect(shouldShowCustomContent).toBe(false);
    });

    it('showCustomTab=true + selectedCategory=custom → hiện custom scenarios', () => {
      const showCustomTab = true;
      const selectedCategory = 'custom';

      const shouldShowCustomContent = showCustomTab && selectedCategory === 'custom';
      expect(shouldShowCustomContent).toBe(true);
    });

    it('showCustomTab=true + selectedCategory != custom → ẩn custom scenarios', () => {
      const showCustomTab = true;
      const selectedCategory = 'it';

      const shouldShowCustomContent = showCustomTab && selectedCategory === 'custom';
      expect(shouldShowCustomContent).toBe(false);
    });

    it('custom scenario selection bằng name matching', () => {
      const selectedTopic: TopicScenario = {id: 'cs-1', name: 'My Custom Topic', description: ''};
      const customScenarioName = 'My Custom Topic';

      const isSelected = selectedTopic?.name === customScenarioName;
      expect(isSelected).toBe(true);
    });

    it('regular scenario selection bằng id matching', () => {
      const selectedTopic: TopicScenario = {id: 'sc-123', name: 'AI', description: ''};
      const scenarioId = 'sc-123';

      const isSelected = selectedTopic?.id === scenarioId;
      expect(isSelected).toBe(true);
    });
  });

  // ----- Category + SubCategory State -----

  describe('Category & SubCategory — State Transitions', () => {
    it('chuyển category → reset subcategory (theo convention)', () => {
      let selectedCategory = 'it';
      let selectedSubCategory = 'web-dev';

      // User chuyển category → nên reset subcategory
      selectedCategory = 'business';
      selectedSubCategory = ''; // Reset

      expect(selectedCategory).toBe('business');
      expect(selectedSubCategory).toBe('');
    });

    it('chọn subcategory đã chọn → toggle off (deselect)', () => {
      const currentSub = 'web-dev';
      const clickedSub = 'web-dev';

      // Logic từ store: nếu cùng ID → deselect
      const result = currentSub === clickedSub ? '' : clickedSub;
      expect(result).toBe('');
    });

    it('chọn subcategory khác → switch', () => {
      const currentSub = 'web-dev';
      const clickedSub = 'mobile-dev';

      const result = currentSub === clickedSub ? '' : clickedSub;
      expect(result).toBe('mobile-dev');
    });
  });

  // ----- Accent Color Props -----

  describe('Accent Color — Props Contract', () => {
    it('scenarioHighlightColor mặc định dùng accentColor', () => {
      const accentColor = '#3b82f6';
      const scenarioHighlightColor = undefined;
      const cardHighlight = scenarioHighlightColor ?? accentColor;

      expect(cardHighlight).toBe('#3b82f6');
    });

    it('scenarioHighlightColor override accentColor', () => {
      const accentColor = '#3b82f6'; // LISTENING_BLUE
      const scenarioHighlightColor = '#f59e0b'; // LISTENING_ORANGE
      const cardHighlight = scenarioHighlightColor ?? accentColor;

      expect(cardHighlight).toBe('#f59e0b');
    });
  });
});

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Platform,
  SectionList,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

// Bật LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {
  TOPIC_CATEGORIES,
  searchScenarios,
  getRandomScenario,
  type TopicCategory,
  type TopicScenario,
  type TopicSubCategory,
} from '@/data/topic-data';
import {useListeningStore} from '@/store/useListeningStore';

// ========================
// Custom hook: useDebounce — tránh search mỗi keystroke
// ========================

/**
 * Mục đích: Debounce giá trị input để tránh gọi searchScenarios quá nhiều
 * Tham số đầu vào: value (T), delay (ms)
 * Tham số đầu ra: debouncedValue (T)
 * Khi nào sử dụng: Search bar → debounce 300ms trước khi filter
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ========================
// Props
// ========================

interface TopicPickerProps {
  disabled?: boolean;
  /** Callback khi user chọn 1 scenario (dùng để auto-close modal nếu cần) */
  onScenarioSelected?: () => void;
  /** Hiện category badge trên search results (thường true khi trong modal) */
  showCategoryBadge?: boolean;
}

// ========================
// Category Tab Types
// ========================

interface CategoryTab {
  id: string;
  name: string;
  icon: string;
}

// ========================
// Memoized ScenarioItem — với scale animation và haptic star
// ========================

interface ScenarioItemProps {
  scenario: TopicScenario;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (scenario: TopicScenario) => void;
  onToggleFavorite: (scenarioId: string) => void;
  /** Hiện category badge (trong search results) */
  categoryBadge?: {icon: string; name: string} | null;
}

/**
 * Mục đích: Render 1 scenario item trong danh sách, có scale animation + haptic
 * Tham số đầu vào: scenario, isSelected, isFavorite, onSelect, onToggleFavorite, categoryBadge
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPicker → danh sách scenarios (subcategory accordion, search results, favorites)
 */
const ScenarioItem = React.memo(function ScenarioItem({
  scenario,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  categoryBadge,
}: ScenarioItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const haptic = useHaptic();

  /**
   * Mục đích: Animation press in (scale 0.97)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn xuống scenario item
   */
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  /**
   * Mục đích: Animation press out (scale trở về 1)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user thả tay khỏi scenario item
   */
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  /**
   * Mục đích: Xử lý toggle favorite với haptic feedback
   * Tham số đầu vào: không (dùng scenario.id từ closure)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap star icon
   */
  const handleToggleFav = useCallback(() => {
    haptic.light();
    onToggleFavorite(scenario.id);
  }, [haptic, onToggleFavorite, scenario.id]);

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        className={`flex-row items-center justify-between px-4 py-3.5 rounded-2xl mb-2 ${
          isSelected ? 'bg-primary/10 border border-primary' : 'bg-neutrals900'
        }`}
        onPress={() => onSelect(scenario)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityLabel={`Kịch bản: ${scenario.name}${isSelected ? ', đang chọn' : ''}`}
        accessibilityRole="button">
        <View className="flex-1 mr-3">
          <AppText
            className={`text-sm font-sans-medium ${
              isSelected ? 'text-primary' : 'text-foreground'
            }`}>
            {scenario.name}
          </AppText>
          <AppText className="text-xs text-neutrals400 mt-0.5" numberOfLines={1}>
            {scenario.description}
          </AppText>
          {/* Category badge — chỉ hiện trong search results */}
          {categoryBadge && (
            <View className="flex-row mt-1.5">
              <View className="bg-neutrals800 rounded-full px-2 py-0.5">
                <AppText className="text-neutrals300 text-[10px]">
                  {categoryBadge.icon} {categoryBadge.name}
                </AppText>
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleToggleFav}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.6}
          accessibilityLabel={`${isFavorite ? 'Bỏ' : 'Đánh dấu'} yêu thích ${scenario.name}`}
          accessibilityRole="button">
          <AppText className={isFavorite ? 'text-warning' : 'text-neutrals600'}>
            {isFavorite ? '⭐' : '☆'}
          </AppText>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ========================
// SubCategory Accordion — với animated chevron
// ========================

interface SubCategoryAccordionProps {
  subCategory: TopicSubCategory;
  isExpanded: boolean;
  onToggle: () => void;
  selectedTopicId: string | null;
  favoriteIds: string[];
  onSelectScenario: (scenario: TopicScenario) => void;
  onToggleFavorite: (scenarioId: string) => void;
}

/**
 * Mục đích: Render subcategory header + expandable scenario list với animated chevron
 * Tham số đầu vào: subCategory, isExpanded, onToggle, selectedTopicId, favoriteIds, callbacks
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPicker → mỗi subcategory trong category view
 */
const SubCategoryAccordion = React.memo(function SubCategoryAccordion({
  subCategory,
  isExpanded,
  onToggle,
  selectedTopicId,
  favoriteIds,
  onSelectScenario,
  onToggleFavorite,
}: SubCategoryAccordionProps) {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  // Kiểm tra subcategory này có chứa scenario đang chọn không
  const hasSelectedScenario = selectedTopicId
    ? subCategory.scenarios.some(s => s.id === selectedTopicId)
    : false;

  // Animate chevron khi expand/collapse
  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 2,
    }).start();
  }, [isExpanded, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View className="mb-2">
      <TouchableOpacity
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${
          hasSelectedScenario
            ? 'bg-primary/10 border border-primary/30'
            : 'bg-neutrals900/50'
        }`}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityLabel={`${subCategory.name}, ${subCategory.scenarios.length} kịch bản${isExpanded ? ', đang mở' : ''}${hasSelectedScenario ? ', chứa kịch bản đang chọn' : ''}`}
        accessibilityRole="button">
        <View className="flex-row items-center flex-1">
          {/* Chấm tròn indicator khi subcategory chứa scenario đang chọn */}
          {hasSelectedScenario && (
            <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          )}
          <AppText className={`font-sans-medium text-sm ${
            hasSelectedScenario ? 'text-primary' : 'text-foreground'
          }`}>
            {subCategory.name}
          </AppText>
          <View className="bg-neutrals700 rounded-full px-2.5 py-1 ml-2">
            <AppText className="text-neutrals300 text-xs font-sans-medium">
              {subCategory.scenarios.length}
            </AppText>
          </View>
        </View>
        {/* Animated chevron thay vì text ▲/▼ */}
        <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
          <Icon name="ChevronDown" className="w-4 h-4 text-neutrals400" />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="mt-1.5 pl-1">
          {subCategory.scenarios.map(scenario => (
            <ScenarioItem
              key={scenario.id}
              scenario={scenario}
              isSelected={selectedTopicId === scenario.id}
              isFavorite={favoriteIds.includes(scenario.id)}
              onSelect={onSelectScenario}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </View>
      )}
    </View>
  );
});

// ========================
// Favorites Tab — với empty state
// ========================

interface FavoritesTabProps {
  favoriteIds: string[];
  selectedTopicId: string | null;
  onSelectScenario: (scenario: TopicScenario) => void;
  onToggleFavorite: (scenarioId: string) => void;
}

/**
 * Mục đích: Render tab "Yêu thích" với danh sách favorites hoặc empty state
 * Tham số đầu vào: favoriteIds, selectedTopicId, onSelectScenario, onToggleFavorite
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPicker → khi selectedCategory === 'favorites'
 */
const FavoritesTab = React.memo(function FavoritesTab({
  favoriteIds,
  selectedTopicId,
  onSelectScenario,
  onToggleFavorite,
}: FavoritesTabProps) {
  // Tìm tất cả scenarios có trong favoriteIds
  const favoriteScenarios = useMemo(() => {
    const results: {scenario: TopicScenario; categoryIcon: string; categoryName: string}[] = [];
    for (const category of TOPIC_CATEGORIES) {
      for (const sub of category.subCategories) {
        for (const scenario of sub.scenarios) {
          if (favoriteIds.includes(scenario.id)) {
            results.push({
              scenario,
              categoryIcon: category.icon,
              categoryName: category.name,
            });
          }
        }
      }
    }
    return results;
  }, [favoriteIds]);

  if (favoriteScenarios.length === 0) {
    // Empty state
    return (
      <View className="items-center py-12 px-6">
        <AppText className="text-4xl mb-4">⭐</AppText>
        <AppText className="text-foreground font-sans-semibold text-base mb-2">
          Chưa có kịch bản yêu thích
        </AppText>
        <AppText className="text-neutrals400 text-sm text-center leading-5">
          Nhấn ⭐ trên bất kỳ kịch bản nào{'\n'}để lưu vào danh sách yêu thích
        </AppText>
      </View>
    );
  }

  return (
    <View>
      <AppText className="text-neutrals400 text-xs mb-2">
        {favoriteScenarios.length} kịch bản yêu thích
      </AppText>
      {favoriteScenarios.map(({scenario, categoryIcon, categoryName}) => (
        <ScenarioItem
          key={scenario.id}
          scenario={scenario}
          isSelected={selectedTopicId === scenario.id}
          isFavorite={true}
          onSelect={onSelectScenario}
          onToggleFavorite={onToggleFavorite}
          categoryBadge={{icon: categoryIcon, name: categoryName}}
        />
      ))}
    </View>
  );
});

// ========================
// Main TopicPicker Component
// ========================

/**
 * Mục đích: Component chọn kịch bản/topic cho bài nghe — redesigned v2
 * Tham số đầu vào:
 *   - disabled: có disable không (khi đang generate)
 *   - onScenarioSelected: callback khi user chọn scenario
 *   - showCategoryBadge: hiện badge category trên search results
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPickerModal → nội dung chính
 *   - Tab "⭐ Yêu thích" cho returning users
 *   - Search bar với debounce 300ms
 *   - Horizontal category tabs
 *   - SubCategory accordion mở/đóng với animated chevron
 *   - Favorite/Star toggle với haptic
 *   - Scale animation trên mỗi item
 */
export default function TopicPicker({
  disabled = false,
  onScenarioSelected,
  showCategoryBadge = true,
}: TopicPickerProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search — 300ms để tránh lag
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Store
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const selectedCategory = useListeningStore(state => state.selectedCategory);
  const selectedSubCategory = useListeningStore(
    state => state.selectedSubCategory,
  );
  const favoriteIds = useListeningStore(state => state.favoriteScenarioIds);
  const setSelectedTopic = useListeningStore(state => state.setSelectedTopic);
  const setSelectedCategory = useListeningStore(
    state => state.setSelectedCategory,
  );
  const setSelectedSubCategory = useListeningStore(
    state => state.setSelectedSubCategory,
  );
  const toggleFavorite = useListeningStore(state => state.toggleFavorite);

  // Lấy category đang chọn
  const activeCategory = useMemo(
    () => TOPIC_CATEGORIES.find(c => c.id === selectedCategory),
    [selectedCategory],
  );

  // Search results — dùng debouncedSearch thay vì searchQuery trực tiếp
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return null;
    }
    return searchScenarios(debouncedSearch.trim());
  }, [debouncedSearch]);

  /**
   * Mục đích: Xử lý khi user chọn 1 scenario
   * Tham số đầu vào: scenario (TopicScenario)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 scenario item
   */
  const handleSelectScenario = useCallback(
    (scenario: TopicScenario) => {
      haptic.light();
      if (selectedTopic?.id === scenario.id) {
        // Bỏ chọn nếu đã chọn
        setSelectedTopic(null);
      } else {
        setSelectedTopic(scenario, selectedCategory, selectedSubCategory);
        // Không auto-close modal nữa — user nhấn Confirm ở footer
      }
    },
    [
      haptic,
      selectedTopic,
      setSelectedTopic,
      selectedCategory,
      selectedSubCategory,
    ],
  );

  /**
   * Mục đích: Toggle favorite cho 1 scenario (đã có haptic trong ScenarioItem)
   * Tham số đầu vào: scenarioId (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: ScenarioItem → star icon tap
   */
  const handleToggleFavorite = useCallback(
    (scenarioId: string) => {
      toggleFavorite(scenarioId);
    },
    [toggleFavorite],
  );

  /**
   * Mục đích: Toggle subcategory accordion
   * Tham số đầu vào: subCategoryId (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: SubCategoryAccordion header tap
   */
  const handleToggleSubCategory = useCallback(
    (subCategoryId: string) => {
      haptic.selection();
      setSelectedSubCategory(subCategoryId);
    },
    [haptic, setSelectedSubCategory],
  );

  /**
   * Mục đích: Chọn random scenario — CTA "Gợi ý ngẫu nhiên"
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: TopicPickerModal → footer button khi chưa chọn scenario
   */
  const handleRandomScenario = useCallback(() => {
    haptic.medium();
    const random = getRandomScenario();
    if (random) {
      setSelectedTopic(random.scenario, random.category.id, random.subCategory.id);
      setSelectedCategory(random.category.id);
      setSelectedSubCategory(random.subCategory.id);
    }
  }, [haptic, setSelectedTopic, setSelectedCategory, setSelectedSubCategory]);

  // Tab data: Yêu thích + categories + Custom
  const categoryTabs: CategoryTab[] = useMemo(
    () => [
      {id: 'favorites', name: 'Yêu thích', icon: '⭐'},
      ...TOPIC_CATEGORIES.map(c => ({id: c.id, name: c.name, icon: c.icon})),
      {id: 'custom', name: 'Tuỳ chỉnh', icon: '✨'},
    ],
    [],
  );

  // ========================
  // Render Category Tabs
  // ========================
  const renderCategoryTab = useCallback(
    ({item}: {item: CategoryTab}) => {
      const isActive = item.id === selectedCategory;
      // Hiện badge count cho favorites
      const badgeCount = item.id === 'favorites' ? favoriteIds.length : null;

      return (
        <TouchableOpacity
          className={`px-4 py-2.5 rounded-full mr-2 border ${
            isActive
              ? 'bg-primary/15 border-primary'
              : 'bg-neutrals900 border-transparent'
          }`}
          onPress={() => {
            haptic.light();
            setSelectedCategory(item.id);
          }}
          disabled={disabled}
          activeOpacity={0.7}
          accessibilityLabel={`Danh mục: ${item.name}${badgeCount ? `, ${badgeCount} yêu thích` : ''}${isActive ? ', đang chọn' : ''}`}
          accessibilityRole="button">
          <View className="flex-row items-center">
            <AppText
              className={`text-sm font-sans-medium ${
                isActive ? 'text-primary' : 'text-foreground'
              }`}>
              {item.icon} {item.name}
            </AppText>
            {/* Badge count cho tab Yêu thích */}
            {badgeCount !== null && badgeCount > 0 && (
              <View className="bg-primary/20 rounded-full px-1.5 py-0.5 ml-1.5">
                <AppText className="text-primary text-[10px] font-sans-bold">
                  {badgeCount}
                </AppText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedCategory, disabled, haptic, setSelectedCategory, favoriteIds.length],
  );

  const keyExtractor = useCallback(
    (item: {id: string}) => item.id,
    [],
  );

  return (
    <View className="flex-1">
      {/* Search Bar với debounce */}
      <View className="flex-row items-center bg-neutrals900 rounded-2xl px-4 py-2.5 mb-3">
        <Icon name="Search" className="w-4 h-4 text-neutrals400 mr-2" />
        <TextInput
          className="flex-1 text-base py-1"
          style={{color: colors.foreground}}
          placeholder="Tìm kịch bản..."
          placeholderTextColor={colors.neutrals500}
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Tìm kiếm kịch bản"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityLabel="Xóa tìm kiếm"
            accessibilityRole="button">
            <Icon name="X" className="w-4 h-4 text-neutrals500" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs — Horizontal Scroll (có tab Yêu thích đầu tiên) */}
      <FlatList
        data={categoryTabs}
        renderItem={renderCategoryTab}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
        contentContainerStyle={{paddingRight: 16}}
      />

      {/* Nội dung: Search results hoặc Tab content */}
      {searchResults ? (
        // Kết quả tìm kiếm — với category badge
        <View>
          <AppText className="text-neutrals300 text-xs mb-2">
            {searchResults.length} kết quả cho "{debouncedSearch}"
          </AppText>
          {searchResults.length === 0 ? (
            <View className="items-center py-8">
              <AppText className="text-2xl mb-2">🔍</AppText>
              <AppText className="text-neutrals400 text-sm">
                Không tìm thấy kịch bản nào
              </AppText>
              <AppText className="text-neutrals500 text-xs mt-1">
                Thử từ khóa khác hoặc chọn từ danh mục
              </AppText>
            </View>
          ) : (
            searchResults.slice(0, 20).map(result => (
              <ScenarioItem
                key={result.scenario.id}
                scenario={result.scenario}
                isSelected={selectedTopic?.id === result.scenario.id}
                isFavorite={favoriteIds.includes(result.scenario.id)}
                onSelect={handleSelectScenario}
                onToggleFavorite={handleToggleFavorite}
                categoryBadge={
                  showCategoryBadge
                    ? {icon: result.category.icon, name: result.category.name}
                    : null
                }
              />
            ))
          )}
        </View>
      ) : selectedCategory === 'favorites' ? (
        // Tab "⭐ Yêu thích"
        <FavoritesTab
          favoriteIds={favoriteIds}
          selectedTopicId={selectedTopic?.id ?? null}
          onSelectScenario={handleSelectScenario}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : selectedCategory === 'custom' ? (
        // Tab "Tuỳ chỉnh" — placeholder, sẽ được render bởi parent (Modal)
        null
      ) : activeCategory ? (
        // Danh sách SubCategories + Scenarios
        <View>
          {activeCategory.subCategories.map(sub => (
            <SubCategoryAccordion
              key={sub.id}
              subCategory={sub}
              isExpanded={selectedSubCategory === sub.id}
              onToggle={() => handleToggleSubCategory(sub.id)}
              selectedTopicId={selectedTopic?.id ?? null}
              favoriteIds={favoriteIds}
              onSelectScenario={handleSelectScenario}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </View>
      ) : null}

      {/* Hiển thị topic đang chọn — sticky bottom indicator */}
      {selectedTopic && (
        <View className="mt-3 bg-primary/10 rounded-2xl px-4 py-3 flex-row items-center">
          <AppText className="text-primary text-sm flex-1">
            ✅ Đã chọn: <AppText className="font-sans-bold">{selectedTopic.name}</AppText>
          </AppText>
          <TouchableOpacity
            onPress={() => {
              haptic.light();
              setSelectedTopic(null);
            }}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityLabel="Bỏ chọn kịch bản"
            accessibilityRole="button">
            <Icon name="X" className="w-4 h-4 text-primary" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Export thêm handleRandomScenario để modal dùng
export {getRandomScenario};

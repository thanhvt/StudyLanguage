import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {
  TOPIC_CATEGORIES,
  searchScenarios,
  type TopicCategory,
  type TopicScenario,
  type TopicSubCategory,
} from '@/data/topic-data';
import {useListeningStore} from '@/store/useListeningStore';

interface TopicPickerProps {
  disabled?: boolean;
  /** Callback khi user chọn "Custom" tab → hiện CustomScenarioInput */
  onCustomPress?: () => void;
}

// ========================
// Memoized ScenarioItem
// ========================

interface ScenarioItemProps {
  scenario: TopicScenario;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (scenario: TopicScenario) => void;
  onToggleFavorite: (scenarioId: string) => void;
}

/**
 * Mục đích: Render 1 scenario item trong danh sách (memoized cho performance)
 */
const ScenarioItem = React.memo(function ScenarioItem({
  scenario,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: ScenarioItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between px-4 py-3 rounded-xl mb-1.5 ${
        isSelected ? 'bg-primary/10 border border-primary' : 'bg-neutrals900'
      }`}
      onPress={() => onSelect(scenario)}
      activeOpacity={0.7}>
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
      </View>
      <TouchableOpacity
        onPress={() => onToggleFavorite(scenario.id)}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        activeOpacity={0.6}>
        <AppText className={isFavorite ? 'text-warning' : 'text-neutrals600'}>
          {isFavorite ? '⭐' : '☆'}
        </AppText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

// ========================
// SubCategory Accordion
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

const SubCategoryAccordion = React.memo(function SubCategoryAccordion({
  subCategory,
  isExpanded,
  onToggle,
  selectedTopicId,
  favoriteIds,
  onSelectScenario,
  onToggleFavorite,
}: SubCategoryAccordionProps) {
  return (
    <View className="mb-2">
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-2.5 bg-neutrals900/50 rounded-xl"
        onPress={onToggle}
        activeOpacity={0.7}>
        <View className="flex-row items-center">
          <AppText className="text-foreground font-sans-medium text-sm">
            {subCategory.name}
          </AppText>
          <View className="bg-neutrals700 rounded-full px-2 py-0.5 ml-2">
            <AppText className="text-neutrals300 text-xs">
              {subCategory.scenarios.length}
            </AppText>
          </View>
        </View>
        <AppText className="text-neutrals500 text-xs">
          {isExpanded ? '▲' : '▼'}
        </AppText>
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
// Main TopicPicker Component
// ========================

/**
 * Mục đích: Component chọn kịch bản/topic cho bài nghe
 * Tham số đầu vào:
 *   - disabled: có disable không (khi đang generate)
 *   - onCustomPress: callback khi user nhấn tab "Custom"
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → section đầu tiên, hiển thị 140+ scenarios
 *   - Horizontal category tabs
 *   - Search bar filter realtime
 *   - SubCategory accordion mở/đóng
 *   - Favorite/Star toggle
 */
export default function TopicPicker({
  disabled = false,
  onCustomPress,
}: TopicPickerProps) {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return null;
    }
    return searchScenarios(searchQuery.trim());
  }, [searchQuery]);

  /**
   * Mục đích: Xử lý khi user chọn 1 scenario
   * Tham số đầu vào: scenario (TopicScenario)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 scenario item
   */
  const handleSelectScenario = useCallback(
    (scenario: TopicScenario) => {
      if (selectedTopic?.id === scenario.id) {
        // Bỏ chọn nếu đã chọn
        setSelectedTopic(null);
      } else {
        setSelectedTopic(scenario, selectedCategory, selectedSubCategory);
      }
    },
    [
      selectedTopic,
      setSelectedTopic,
      selectedCategory,
      selectedSubCategory,
    ],
  );

  const handleToggleFavorite = useCallback(
    (scenarioId: string) => {
      toggleFavorite(scenarioId);
    },
    [toggleFavorite],
  );

  const handleToggleSubCategory = useCallback(
    (subCategoryId: string) => {
      setSelectedSubCategory(subCategoryId);
    },
    [setSelectedSubCategory],
  );

  // ========================
  // Render Category Tabs
  // ========================
  const renderCategoryTab = useCallback(
    ({item}: {item: TopicCategory | {id: 'custom'; name: string; icon: string}}) => {
      const isActive = item.id === selectedCategory;
      return (
        <TouchableOpacity
          className={`px-4 py-2 rounded-full mr-2 border ${
            isActive
              ? 'bg-primary/15 border-primary'
              : 'bg-neutrals900 border-transparent'
          }`}
          onPress={() => {
            if (item.id === 'custom') {
              onCustomPress?.();
            } else {
              setSelectedCategory(item.id);
            }
          }}
          disabled={disabled}
          activeOpacity={0.7}>
          <AppText
            className={`text-sm font-sans-medium ${
              isActive ? 'text-primary' : 'text-foreground'
            }`}>
            {item.icon} {item.name}
          </AppText>
        </TouchableOpacity>
      );
    },
    [selectedCategory, disabled, onCustomPress, setSelectedCategory],
  );

  // Tab data (categories + Custom)
  const categoryTabs = useMemo(
    () => [
      ...TOPIC_CATEGORIES,
      {id: 'custom' as const, name: 'Tuỳ chỉnh', icon: '✨', subCategories: [], description: ''},
    ],
    [],
  );

  const keyExtractor = useCallback(
    (item: {id: string}) => item.id,
    [],
  );

  return (
    <View>
      {/* Search Bar */}
      <View className="flex-row items-center bg-neutrals900 rounded-2xl px-4 py-2.5 mb-3">
        <Icon name="Search" className="w-4 h-4 text-neutrals500 mr-2" />
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
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="X" className="w-4 h-4 text-neutrals500" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs - Horizontal Scroll */}
      <FlatList
        data={categoryTabs as any}
        renderItem={renderCategoryTab}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
      />

      {/* Nội dung: Search results hoặc SubCategories */}
      {searchResults ? (
        // Kết quả tìm kiếm
        <View>
          <AppText className="text-neutrals400 text-xs mb-2">
            {searchResults.length} kết quả cho "{searchQuery}"
          </AppText>
          {searchResults.length === 0 ? (
            <View className="items-center py-6">
              <AppText className="text-neutrals500 text-sm">
                Không tìm thấy kịch bản nào
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
              />
            ))
          )}
        </View>
      ) : activeCategory && selectedCategory !== 'custom' ? (
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

      {/* Hiển thị topic đang chọn */}
      {selectedTopic && (
        <View className="mt-3 bg-primary/10 rounded-2xl px-4 py-3 flex-row items-center">
          <AppText className="text-primary text-sm flex-1">
            ✅ Đã chọn: <AppText className="font-sans-bold">{selectedTopic.name}</AppText>
          </AppText>
          <TouchableOpacity
            onPress={() => setSelectedTopic(null)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="X" className="w-4 h-4 text-primary" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Pressable} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useAppStore} from '@/store/useAppStore';
import {TOPIC_CATEGORIES, type TopicScenario} from '@/data/topic-data';
import type {CustomScenario} from '@/services/api/customScenarios';
import type {CustomCategory} from '@/services/api/customCategories';
import {customCategoryApi} from '@/services/api/customCategories';
import {customScenarioApi} from '@/services/api/customScenarios';
import {useListeningStore} from '@/store/useListeningStore';

// =======================
// Types
// =======================

export interface TopicSelectorProps {
  /** Màu accent chính (VD: speakingColor, LISTENING_BLUE) */
  accentColor: string;
  /** Màu highlight cho scenario cards khi selected (mặc định = accentColor) */
  scenarioHighlightColor?: string;
  /** Label hiển thị trên đầu section ("Chủ đề" / "Nội dung luyện tập" / "Kịch bản") */
  label: string;

  // === State (controlled) ===
  /** Topic đang chọn */
  selectedTopic: TopicScenario | null;
  /** Category đang chọn */
  selectedCategory: string;
  /** SubCategory đang chọn */
  selectedSubCategory: string;
  /** Danh sách scenarios hiện tại (thường max 3) */
  currentScenarios: TopicScenario[];
  /** Danh sách scenario IDs yêu thích */
  favoriteScenarioIds: string[];
  /** Tổng số scenarios */
  totalScenarios: number;
  /** Giá trị text input */
  topicInput: string;

  // === Custom Scenarios (tab Tuỳ chỉnh) ===
  /** Hiển thị tab "Tuỳ chỉnh" không (mặc định false) */
  showCustomTab?: boolean;
  /** Danh sách custom scenarios (dùng khi showCustomTab=true) */
  customScenarios?: CustomScenario[];

  // === Tuỳ chọn ===
  /** TextInput có editable không (mặc định true) */
  inputEditable?: boolean;
  /** Placeholder cho TextInput */
  inputPlaceholder?: string;
  /** Accessibility label cho TextInput */
  inputAccessibilityLabel?: string;

  // === Callbacks ===
  /** Khi chọn/bỏ chọn topic */
  onSelectTopic: (
    topic: TopicScenario | null,
    categoryId?: string,
    subCategoryId?: string,
  ) => void;
  /** Khi chọn category tab */
  onSelectCategory: (categoryId: string) => void;
  /** Khi chọn subcategory chip */
  onSelectSubCategory: (subCategoryId: string) => void;
  /** Khi text input thay đổi */
  onTopicInputChange: (text: string) => void;
  /** Khi toggle favorite cho 1 scenario */
  onToggleFavorite: (scenarioId: string) => void;
  /** Khi mở topic modal (nút Search / Xem tất cả) */
  onOpenTopicModal: () => void;
  /** Custom action cho nút Plus (mặc định: setCategory('custom') + openModal) */
  onPlusPress?: () => void;

  // === Enhance Scenario ===
  /** Callback khi user bấm nút ✨ enhance scenario */
  onEnhanceScenario?: () => void;
  /** Trạng thái đang enhance (hiện loading indicator thay icon) */
  isEnhancing?: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Component dùng chung cho việc chọn topic/scenario trên tất cả config screens
 *   Bao gồm: header buttons, selected badge, category tabs, subcategory chips,
 *   scenario cards, "Xem tất cả" link, divider, free text input, và custom scenarios tab
 * Tham số đầu vào: TopicSelectorProps (xem interface ở trên)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - speaking/ConfigScreen → chọn topic cho Practice Mode
 *   - speaking/ShadowingConfigScreen → chọn nội dung Shadowing
 *   - speaking/ConversationSetupScreen → chọn chủ đề/kịch bản AI Conversation
 *   - listening/ConfigScreen → chọn chủ đề Podcast
 */
export default function TopicSelector({
  accentColor,
  scenarioHighlightColor,
  label,
  selectedTopic,
  selectedCategory,
  selectedSubCategory,
  currentScenarios,
  favoriteScenarioIds,
  totalScenarios,
  topicInput,
  showCustomTab = false,
  customScenarios = [],
  inputEditable = true,
  inputPlaceholder = 'Nhập chủ đề riêng...',
  inputAccessibilityLabel = 'Nhập chủ đề luyện tập tự do',
  onSelectTopic,
  onSelectCategory,
  onSelectSubCategory,
  onTopicInputChange,
  onToggleFavorite,
  onOpenTopicModal,
  onPlusPress,
  onEnhanceScenario,
  isEnhancing = false,
}: TopicSelectorProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // Màu cho scenario cards khi selected (Listening dùng LISTENING_ORANGE, còn lại = accentColor)
  const cardHighlight = scenarioHighlightColor ?? accentColor;

  // === Custom Categories: đọc từ store + tự load nếu chưa có ===
  const customCategories = useListeningStore(s => s.customCategories);
  const customCategoriesLoaded = useListeningStore(s => s.customCategoriesLoaded);
  const setCustomCategories = useListeningStore(s => s.setCustomCategories);

  /**
   * Mục đích: Auto-load custom categories từ API nếu chưa tải
   * Tham số đầu vào: không
   * Tham số đầu ra: void (cập nhật store)
   * Khi nào sử dụng: Component mount lần đầu + categories chưa loaded
   */
  useEffect(() => {
    if (customCategoriesLoaded) return;
    customCategoryApi.list()
      .then(res => setCustomCategories(res.categories))
      .catch(err => console.error('📂 [TopicSelector] Lỗi load custom categories:', err));
  }, [customCategoriesLoaded, setCustomCategories]);

  // === State cho custom category scenarios (load từ API khi chọn tab) ===
  const [customCatScenarios, setCustomCatScenarios] = useState<CustomScenario[]>([]);
  const [isLoadingCustomCat, setIsLoadingCustomCat] = useState(false);

  // Kiểm tra có đang ở tab custom category không
  const activeCustomCategory = customCategories.find(c => c.id === selectedCategory);

  /**
   * Mục đích: Load scenarios khi user chọn tab custom category
   * Tham số đầu vào: không (đọc selectedCategory từ props)
   * Tham số đầu ra: void (cập nhật customCatScenarios state)
   * Khi nào sử dụng: selectedCategory thay đổi và trùng với 1 custom category ID
   */
  useEffect(() => {
    if (!activeCustomCategory) {
      setCustomCatScenarios([]);
      return;
    }
    let mounted = true;
    setIsLoadingCustomCat(true);
    customScenarioApi
      .list(activeCustomCategory.id)
      .then(data => {
        if (mounted) setCustomCatScenarios(data);
      })
      .catch(err => console.error('📂 [TopicSelector] Lỗi load scenarios:', err))
      .finally(() => {
        if (mounted) setIsLoadingCustomCat(false);
      });
    return () => { mounted = false; };
  }, [activeCustomCategory?.id]);

  /**
   * Mục đích: Xử lý nhấn nút Plus — dùng custom handler nếu có, hoặc mặc định mở modal tab custom
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "+" trên top row
   */
  const handlePlusPress = useCallback(() => {
    haptic.light();
    if (onPlusPress) {
      onPlusPress();
    } else {
      onSelectCategory('custom');
      onOpenTopicModal();
    }
  }, [haptic, onPlusPress, onSelectCategory, onOpenTopicModal]);

  return (
    <>
      {/* Top Row: Label + 3 action buttons (Search, Heart, Plus) */}
      <View className="flex-row items-center justify-between mb-3">
        <AppText
          className="font-sans-semibold text-base"
          style={{color: colors.foreground}}>
          {label}
        </AppText>
        <View className="flex-row items-center gap-2">
          {/* Nút tìm kiếm */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{backgroundColor: isDark ? `${accentColor}15` : `${accentColor}10`}}
            hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
            onPress={() => {
              haptic.light();
              onOpenTopicModal();
            }}
            accessibilityLabel="Tìm kiếm chủ đề"
            accessibilityRole="button">
            <Icon name="Search" className="w-5 h-5" style={{color: accentColor}} />
          </TouchableOpacity>
          {/* Nút yêu thích */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{backgroundColor: isDark ? `${accentColor}15` : `${accentColor}10`}}
            hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
            onPress={() => {
              haptic.light();
              onSelectCategory('favorites');
              onOpenTopicModal();
            }}
            accessibilityLabel="Chủ đề yêu thích"
            accessibilityRole="button">
            <Icon name="Heart" className="w-5 h-5" style={{color: accentColor}} />
          </TouchableOpacity>
          {/* Nút thêm mới / tuỳ chỉnh */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{backgroundColor: isDark ? `${accentColor}15` : `${accentColor}10`}}
            hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
            onPress={handlePlusPress}
            accessibilityLabel="Tạo chủ đề mới"
            accessibilityRole="button">
            <Icon name="Plus" className="w-5 h-5" style={{color: accentColor}} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hiển thị topic đang chọn — badge */}
      {selectedTopic && (
        <View
          className="flex-row items-center rounded-xl px-3 py-2 mb-3"
          style={{
            backgroundColor: `${accentColor}10`,
            borderWidth: 1,
            borderColor: `${accentColor}25`,
          }}>
          <Icon
            name="Check"
            className="w-3.5 h-3.5"
            style={{color: accentColor, marginRight: 8}}
          />
          <AppText
            className="text-[13px] flex-1"
            style={{color: colors.foreground}}
            numberOfLines={1}>
            <AppText className="font-sans-bold" style={{color: accentColor}}>
              {selectedTopic.name}
            </AppText>
          </AppText>
          <TouchableOpacity
            onPress={() => {
              haptic.light();
              onSelectTopic(null);
            }}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityLabel="Bỏ chọn chủ đề"
            accessibilityRole="button">
            <Icon name="X" className="w-3.5 h-3.5" style={{color: colors.neutrals400}} />
          </TouchableOpacity>
        </View>
      )}

      {/* Category Tabs — pills ngang */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2">
        <View className="flex-row gap-2">
          {TOPIC_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                className="flex-row items-center px-4 py-2.5 rounded-full border"
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  borderColor: isActive ? accentColor : colors.neutrals800,
                }}
                onPress={() => {
                  haptic.light();
                  onSelectCategory(cat.id);
                  onSelectSubCategory('');
                }}
                accessibilityLabel={`Danh mục ${cat.name}${isActive ? ', đang chọn' : ''}`}
                accessibilityRole="button">
                {cat.icon && (
                  <AppText className="text-[13px] mr-1">{cat.icon}</AppText>
                )}
                <AppText
                  className="text-[13px] font-sans-medium"
                  style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
          {/* Custom Category tabs — nhóm do user tạo */}
          {customCategories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                className="flex-row items-center px-4 py-2.5 rounded-full border"
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  borderColor: isActive ? accentColor : colors.neutrals800,
                }}
                onPress={() => {
                  haptic.light();
                  onSelectCategory(cat.id);
                  onSelectSubCategory('');
                }}
                accessibilityLabel={`Danh mục ${cat.name}${isActive ? ', đang chọn' : ''}`}
                accessibilityRole="button">
                {cat.icon && (
                  <AppText className="text-[13px] mr-1">{cat.icon}</AppText>
                )}
                <AppText
                  className="text-[13px] font-sans-medium"
                  style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
          {/* Tab Tuỳ chỉnh — chỉ hiện khi showCustomTab=true */}
          {showCustomTab && (() => {
            const isActive = selectedCategory === 'custom';
            return (
              <TouchableOpacity
                className="flex-row items-center px-4 py-2.5 rounded-full border"
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  borderColor: isActive ? accentColor : colors.neutrals800,
                }}
                onPress={() => {
                  haptic.light();
                  onSelectCategory('custom');
                  onSelectSubCategory('');
                }}
                accessibilityLabel={`Tuỳ chỉnh${isActive ? ', đang chọn' : ''}`}
                accessibilityRole="button">
                <AppText className="text-[13px] mr-1">✨</AppText>
                <AppText
                  className="text-[13px] font-sans-medium"
                  style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                  Tuỳ chỉnh
                </AppText>
              </TouchableOpacity>
            );
          })()}
        </View>
      </ScrollView>

      {/* Subcategory Chips — ẩn khi tab Tuỳ chỉnh hoặc custom category */}
      {selectedCategory !== 'custom' && !activeCustomCategory && (() => {
        const category = TOPIC_CATEGORIES.find(c => c.id === selectedCategory);
        if (!category?.subCategories?.length) {return null;}
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3">
            <View className="flex-row gap-2">
              {category.subCategories.map(sub => {
                const isActive = selectedSubCategory === sub.id;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    className="px-4 py-2.5 rounded-full border"
                    style={{
                      backgroundColor: isActive ? `${accentColor}15` : 'transparent',
                      borderColor: isActive ? accentColor : colors.neutrals700,
                    }}
                    onPress={() => {
                      haptic.light();
                      onSelectSubCategory(sub.id);
                    }}
                    accessibilityLabel={`${sub.name}${isActive ? ', đang chọn' : ''}`}
                    accessibilityRole="button">
                    <AppText
                      className="text-[13px] font-sans-medium"
                      style={{color: isActive ? accentColor : colors.neutrals300}}>
                      {sub.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        );
      })()}

      {/* Custom Scenarios — hiện khi tab Tuỳ chỉnh active */}
      {showCustomTab && selectedCategory === 'custom' ? (
        customScenarios.length === 0 ? (
          <View className="items-center py-6">
            <AppText className="text-2xl mb-2">✨</AppText>
            <AppText className="text-sm" style={{color: colors.neutrals300}}>
              Chưa có kịch bản tuỳ chỉnh
            </AppText>
            <AppText className="text-xs mt-1" style={{color: colors.neutrals300}}>
              Mở Chọn chủ đề → Tuỳ chỉnh để tạo
            </AppText>
          </View>
        ) : (
          customScenarios.slice(0, 3).map(cs => {
            const isSelected = selectedTopic?.name === cs.name;
            return (
              <TouchableOpacity
                key={cs.id}
                className="rounded-xl px-4 py-3.5 mb-3"
                style={{
                  backgroundColor: isSelected ? `${accentColor}15` : colors.neutrals900,
                  borderColor: isSelected ? accentColor : colors.border,
                  borderWidth: 1,
                }}
                onPress={() => {
                  haptic.light();
                  if (isSelected) {
                    onSelectTopic(null);
                  } else {
                    onSelectTopic(
                      {id: cs.id, name: cs.name, description: cs.description || ''},
                      'custom',
                      '',
                    );
                  }
                }}
                accessibilityLabel={`${cs.name}${isSelected ? ', đang chọn' : ''}`}
                accessibilityRole="button">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <AppText
                      className="font-sans-bold text-[15px]"
                      style={{color: isSelected ? accentColor : colors.foreground}}>
                      {cs.name}
                    </AppText>
                    {cs.description ? (
                      <AppText
                        className="text-xs mt-0.5"
                        style={{color: colors.neutrals300}}
                        numberOfLines={1}>
                        {cs.description}
                      </AppText>
                    ) : null}
                  </View>
                  {isSelected && (
                    <View
                      className="w-5 h-5 items-center justify-center rounded-full"
                      style={{backgroundColor: accentColor}}>
                      <Icon name="Check" className="w-3 h-3" style={{color: '#FFFFFF'}} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )
      ) : null}

      {/* Custom Category Scenarios — hiện khi tab custom category active */}
      {activeCustomCategory ? (
        isLoadingCustomCat ? (
          <View className="items-center py-6">
            <AppText className="text-sm" style={{color: colors.neutrals300}}>
              Đang tải chủ đề...
            </AppText>
          </View>
        ) : customCatScenarios.length === 0 ? (
          <View className="items-center py-6">
            <AppText className="text-2xl mb-2">{activeCustomCategory.icon || '📝'}</AppText>
            <AppText className="text-sm" style={{color: colors.neutrals300}}>
              Chưa có chủ đề nào trong nhóm này
            </AppText>
          </View>
        ) : (
          customCatScenarios.map(cs => {
            const isSelected = selectedTopic?.id === cs.id;
            return (
              <TouchableOpacity
                key={cs.id}
                className="rounded-xl px-4 py-3.5 mb-3"
                style={{
                  backgroundColor: isSelected ? `${cardHighlight}15` : colors.neutrals900,
                  borderColor: isSelected ? cardHighlight : colors.border,
                  borderWidth: 1,
                }}
                onPress={() => {
                  haptic.light();
                  if (isSelected) {
                    onSelectTopic(null);
                  } else {
                    onSelectTopic(
                      {id: cs.id, name: cs.name, description: cs.description || ''},
                      activeCustomCategory.id,
                      '',
                    );
                  }
                }}
                accessibilityLabel={`${cs.name}${isSelected ? ', đang chọn' : ''}`}
                accessibilityRole="button">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <AppText
                      className="font-sans-bold text-[15px]"
                      style={{color: isSelected ? cardHighlight : colors.foreground}}>
                      {cs.name}
                    </AppText>
                    {cs.description ? (
                      <AppText
                        className="text-xs mt-0.5"
                        style={{color: colors.neutrals300}}
                        numberOfLines={1}>
                        {cs.description}
                      </AppText>
                    ) : null}
                  </View>
                  {isSelected && (
                    <View
                      className="w-5 h-5 items-center justify-center rounded-full"
                      style={{backgroundColor: cardHighlight}}>
                      <Icon name="Check" className="w-3 h-3" style={{color: '#FFFFFF'}} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )
      ) : null}

      {/* Scenario Cards (2-3 cards) — ẩn khi tab Tuỳ chỉnh hoặc custom category active */}
      {selectedCategory !== 'custom' && !activeCustomCategory && currentScenarios.map(scenario => {
        const isSelected = selectedTopic?.id === scenario.id;
        const isFav = favoriteScenarioIds.includes(scenario.id);
        return (
          <TouchableOpacity
            key={scenario.id}
            className="rounded-xl px-4 py-3.5 mb-3"
            style={{
              backgroundColor: isSelected ? `${cardHighlight}15` : colors.neutrals900,
              borderColor: isSelected ? cardHighlight : colors.border,
              borderWidth: 1,
            }}
            onPress={() => {
              haptic.light();
              onSelectTopic(
                isSelected ? null : scenario,
                selectedCategory,
                selectedSubCategory,
              );
            }}
            accessibilityLabel={`${scenario.name}. ${scenario.description}${isSelected ? ', đang chọn' : ''}`}
            accessibilityRole="button">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <AppText
                  className="font-sans-bold text-[15px]"
                  style={{color: isSelected ? cardHighlight : colors.foreground}}>
                  {scenario.name}
                </AppText>
                <AppText
                  className="text-xs mt-0.5"
                  style={{color: colors.neutrals400}}
                  numberOfLines={1}>
                  {scenario.description}
                </AppText>
              </View>
              <TouchableOpacity
                className="pt-0.5"
                onPress={() => {
                  haptic.light();
                  onToggleFavorite(scenario.id);
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                accessibilityLabel={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                accessibilityRole="button">
                <Icon
                  name="Heart"
                  className="w-4 h-4"
                  style={{color: isFav ? cardHighlight : colors.neutrals400}}
                  fill={isFav ? cardHighlight : 'none'}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* "Xem tất cả" link */}
      <TouchableOpacity
        className="py-3 items-center"
        onPress={() => {
          haptic.light();
          onOpenTopicModal();
        }}
        accessibilityLabel="Xem tất cả kịch bản"
        accessibilityRole="link">
        <AppText className="text-sm text-center" style={{color: accentColor}}>
          Xem tất cả {totalScenarios} kịch bản →
        </AppText>
      </TouchableOpacity>

      {/* Divider "hoặc" */}
      <View className="flex-row items-center my-3">
        <View className="flex-1 h-[1px]" style={{backgroundColor: colors.border}} />
        <AppText className="text-xs mx-3" style={{color: colors.neutrals400}}>
          hoặc
        </AppText>
        <View className="flex-1 h-[1px]" style={{backgroundColor: colors.border}} />
      </View>

      {/* Free text input + Enhance button */}
      <View className="flex-row items-center gap-2">
        <TextInput
          className="flex-1 rounded-xl px-4 py-3 text-[15px]"
          style={{
            color: colors.foreground,
            backgroundColor: colors.neutrals900,
            borderWidth: 1,
            borderColor: colors.neutrals800,
          }}
          placeholder={inputPlaceholder}
          placeholderTextColor={colors.neutrals400}
          value={topicInput}
          onChangeText={onTopicInputChange}
          returnKeyType="done"
          editable={inputEditable}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={inputAccessibilityLabel}
        />

        {/* Nút ✨ Enhance Scenario — chỉ hiện khi có text + callback */}
        {onEnhanceScenario && topicInput.trim().length > 0 && (
          <Pressable
            onPress={onEnhanceScenario}
            disabled={isEnhancing}
            hitSlop={12}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{
              backgroundColor: isDark ? colors.neutrals900 : colors.neutrals100,
              borderWidth: 1,
              borderColor: isEnhancing ? colors.neutrals700 : accentColor,
              opacity: isEnhancing ? 0.6 : 1,
            }}
            accessibilityLabel="Mở rộng kịch bản bằng AI"
            accessibilityRole="button"
          >
            {isEnhancing ? (
              <ActivityIndicator size="small" color={accentColor} />
            ) : (
              <Icon name="Sparkles" className="w-5 h-5" style={{color: accentColor}} />
            )}
          </Pressable>
        )}
      </View>
    </>
  );
}

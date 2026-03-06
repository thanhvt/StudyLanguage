import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {customScenarioApi, type CustomScenario} from '@/services/api/customScenarios';
import {useListeningStore} from '@/store/useListeningStore';
import type {CustomCategory} from '@/services/api/customCategories';
import type {TopicScenario} from '@/data/topic-data';

const LISTENING_BLUE = '#2563EB';

interface UserCategoryViewProps {
  /** Category đang hiển thị */
  category: CustomCategory;
  /** Danh sách scenario IDs đã favorite */
  favoriteIds: string[];
  /** Callback khi chọn 1 scenario */
  onSelectScenario?: (scenario: TopicScenario, categoryId: string) => void;
  /** Callback khi nhấn "⚙️ Quản lý" → navigate tới Settings */
  onManage?: (categoryId: string) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Hiển thị nội dung tab user category (flat list scenarios)
 * Tham số đầu vào: category, favoriteIds, onSelectScenario, onManage
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPicker render khi tab user-created category được chọn
 *
 * Layout:
 *   - Category header (icon + name + description)
 *   - Flat list scenarios
 *   - "+ Thêm chủ đề vào nhóm" button
 *   - "⚙️ Quản lý nhóm này →" link
 */
export function UserCategoryView({
  category,
  favoriteIds,
  onSelectScenario,
  onManage,
  disabled,
}: UserCategoryViewProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const selectedTopic = useListeningStore(s => s.selectedTopic);
  const toggleFavorite = useListeningStore(s => s.toggleFavorite);

  const [scenarios, setScenarios] = useState<CustomScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Mục đích: Load scenarios cho category này
   * Khi nào sử dụng: Component mount hoặc category thay đổi
   */
  useEffect(() => {
    let mounted = true;
    const loadScenarios = async () => {
      setIsLoading(true);
      try {
        const data = await customScenarioApi.list(category.id);
        if (mounted) setScenarios(data);
      } catch (error) {
        console.error('📂 [UserCategoryView] Lỗi load scenarios:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadScenarios();
    return () => { mounted = false; };
  }, [category.id]);

  /**
   * Mục đích: Chuyển đổi CustomScenario → TopicScenario format
   * Tham số đầu vào: scenario (CustomScenario)
   * Tham số đầu ra: TopicScenario
   * Khi nào sử dụng: Khi user chọn 1 scenario từ danh sách
   */
  const toTopicScenario = useCallback(
    (s: CustomScenario): TopicScenario => ({
      id: s.id,
      name: s.name,
      description: s.description || s.name,
    }),
    [],
  );

  /**
   * Mục đích: Render 1 scenario item
   * Tham số đầu vào: item (CustomScenario)
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderScenarioItem = useCallback(
    ({item}: {item: CustomScenario}) => {
      const isSelected = selectedTopic?.id === item.id;
      const isFav = favoriteIds.includes(item.id);

      return (
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 rounded-xl mb-2"
          style={{
            backgroundColor: isSelected ? `${LISTENING_BLUE}12` : colors.glassBg,
            borderWidth: 1,
            borderColor: isSelected ? LISTENING_BLUE : colors.glassBorderStrong,
          }}
          onPress={() => {
            haptic.light();
            const topicScenario = toTopicScenario(item);
            onSelectScenario?.(topicScenario, category.id);
          }}
          disabled={disabled}
          activeOpacity={0.7}>
          <View className="flex-1">
            <AppText
              className={`text-sm ${isSelected ? 'font-sans-bold' : 'font-sans-medium'}`}
              style={{color: isSelected ? LISTENING_BLUE : colors.foreground}}
              numberOfLines={1}>
              📝 {item.name}
            </AppText>
            {item.description ? (
              <AppText
                className="text-xs mt-0.5"
                style={{color: colors.neutrals400}}
                numberOfLines={1}>
                {item.description}
              </AppText>
            ) : null}
          </View>
          {/* Favorite star */}
          <TouchableOpacity
            onPress={() => {
              haptic.light();
              toggleFavorite(item.id);
            }}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <AppText className="text-lg">{isFav ? '⭐' : '☆'}</AppText>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [
      selectedTopic,
      favoriteIds,
      haptic,
      toTopicScenario,
      onSelectScenario,
      category.id,
      disabled,
      toggleFavorite,
      colors,
    ],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <ActivityIndicator color={LISTENING_BLUE} />
        <AppText className="text-xs mt-2" style={{color: colors.neutrals400}}>
          Đang tải chủ đề...
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Category Header */}
      <View className="px-1 mb-3">
        <AppText className="text-lg font-sans-bold" style={{color: colors.foreground}}>
          {category.icon} {category.name}
        </AppText>
        {category.description ? (
          <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}}>
            {category.description}
          </AppText>
        ) : null}
      </View>

      {/* Scenario List */}
      {scenarios.length === 0 ? (
        <View className="items-center py-8">
          <AppText className="text-3xl mb-2">📝</AppText>
          <AppText className="text-sm" style={{color: colors.neutrals500}}>
            Chưa có chủ đề nào
          </AppText>
          <AppText className="text-xs mt-1" style={{color: colors.neutrals400}}>
            Thêm chủ đề bên dưới hoặc ở Quản lý nhóm
          </AppText>
        </View>
      ) : (
        <View>
          {scenarios.map(item => (
            <React.Fragment key={item.id}>
              {renderScenarioItem({item})}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* "+ Thêm chủ đề vào nhóm" — sẽ mở QuickScenarioSheet */}
      <TouchableOpacity
        className="flex-row items-center justify-center rounded-xl py-3 mt-2"
        style={{
          backgroundColor: colors.glassBg,
          borderWidth: 1,
          borderColor: colors.glassBorderStrong,
          borderStyle: 'dashed',
        }}
        onPress={() => {
          // TODO: Mở QuickScenarioSheet (pre-fill category = this)
          haptic.light();
        }}
        disabled={disabled}>
        <Icon name="Plus" className="w-4 h-4 mr-2" style={{color: LISTENING_BLUE}} />
        <AppText className="text-sm font-sans-medium" style={{color: LISTENING_BLUE}}>
          Thêm chủ đề vào nhóm
        </AppText>
      </TouchableOpacity>

      {/* "⚙️ Quản lý nhóm này →" link */}
      <TouchableOpacity
        className="flex-row items-center justify-center py-3 mt-2"
        onPress={() => onManage?.(category.id)}
        disabled={disabled}>
        <AppText className="text-xs" style={{color: colors.neutrals400}}>
          ⚙️ Quản lý nhóm này →
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

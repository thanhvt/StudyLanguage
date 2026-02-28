import React, {useCallback} from 'react';
import {View, Pressable, Animated as RNAnimated} from 'react-native';
import {AppText} from '@/components/ui';
import {
  getTypeIcon,
  getAccentColor,
  formatRelativeTime,
  type SkillType,
} from '@/utils/historyHelpers';
import type {HistoryEntry} from '@/services/api/history';
import {Swipeable} from 'react-native-gesture-handler';
import {SharedTransition} from './SharedTransition';

/**
 * Mục đích: Card hiển thị một bản ghi lịch sử với swipe actions + selection mode
 * Tham số đầu vào:
 *   - entry: HistoryEntry — dữ liệu bản ghi
 *   - onPress: Callback khi tap card (navigate detail)
 *   - onDelete: Callback khi swipe left (xóa)
 *   - onPin: Callback khi swipe right (ghim)
 *   - onLongPress: Callback khi long press (quick actions / enter selection mode)
 *   - selectionMode: boolean — đang ở chế độ chọn nhiều
 *   - isSelected: boolean — card đang được chọn
 *   - onToggleSelect: Callback toggle chọn/bỏ chọn
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → SectionList renderItem
 */

interface HistoryCardProps {
  entry: HistoryEntry;
  onPress?: (entry: HistoryEntry) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onLongPress?: (entry: HistoryEntry) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const HistoryCard = React.memo(function HistoryCard({
  entry,
  onPress,
  onDelete,
  onPin,
  onLongPress,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: HistoryCardProps) {
  const accent = getAccentColor(entry.type as SkillType);
  const icon = getTypeIcon(entry.type as SkillType);
  const timeAgo = formatRelativeTime(entry.createdAt);

  /**
   * Mục đích: Xử lý tap card — navigate hoặc toggle select
   * Tham số đầu vào: không có (dùng props từ closure)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Pressable onPress
   */
  const handlePress = useCallback(() => {
    if (selectionMode && onToggleSelect) {
      // Đang ở selection mode → toggle chọn
      onToggleSelect(entry.id);
    } else {
      // Bình thường → navigate tới detail
      onPress?.(entry);
    }
  }, [selectionMode, onToggleSelect, onPress, entry]);

  /**
   * Mục đích: Xử lý long press — vào selection mode hoặc quick actions
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Pressable onLongPress (500ms)
   */
  const handleLongPress = useCallback(() => {
    onLongPress?.(entry);
  }, [onLongPress, entry]);

  /**
   * Mục đích: Render action khi swipe phải (pin/unpin)
   * Tham số đầu vào: progress, dragX — Animated values từ Swipeable
   * Tham số đầu ra: JSX.Element — nút Pin
   * Khi nào sử dụng: Swipeable renderLeftActions
   */
  const renderLeftActions = useCallback(
    (
      _progress: RNAnimated.AnimatedInterpolation<number>,
      dragX: RNAnimated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [0, 80],
        outputRange: [0.5, 1],
        extrapolate: 'clamp',
      });

      return (
        <Pressable
          className="bg-amber-500 justify-center items-center rounded-l-2xl"
          style={{width: 80}}
          onPress={() => onPin?.(entry.id)}>
          <RNAnimated.View style={{transform: [{scale}]}}>
            <AppText className="text-2xl">
              {entry.isPinned ? '📌' : '📍'}
            </AppText>
            <AppText className="text-white text-xs font-sans-medium mt-1">
              {entry.isPinned ? 'Bỏ ghim' : 'Ghim'}
            </AppText>
          </RNAnimated.View>
        </Pressable>
      );
    },
    [entry.id, entry.isPinned, onPin],
  );

  /**
   * Mục đích: Render action khi swipe trái (delete)
   * Tham số đầu vào: progress, dragX — Animated values từ Swipeable
   * Tham số đầu ra: JSX.Element — nút Delete
   * Khi nào sử dụng: Swipeable renderRightActions
   */
  const renderRightActions = useCallback(
    (
      _progress: RNAnimated.AnimatedInterpolation<number>,
      dragX: RNAnimated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      });

      return (
        <Pressable
          className="bg-red-500 justify-center items-center rounded-r-2xl"
          style={{width: 80}}
          onPress={() => onDelete?.(entry.id)}>
          <RNAnimated.View style={{transform: [{scale}]}}>
            <AppText className="text-2xl">🗑️</AppText>
            <AppText className="text-white text-xs font-sans-medium mt-1">
              Xóa
            </AppText>
          </RNAnimated.View>
        </Pressable>
      );
    },
    [entry.id, onDelete],
  );

  /**
   * Mục đích: Lấy subtitle cho card dựa trên loại bài học
   * Tham số đầu vào: không (dùng entry từ closure)
   * Tham số đầu ra: string — mô tả ngắn
   * Khi nào sử dụng: HistoryCard render → dòng subtitle
   */
  const getSubtitle = (): string => {
    switch (entry.type) {
      case 'listening':
        return `${entry.durationMinutes || 5} phút • ${entry.numSpeakers || 2} người`;
      case 'speaking':
        return `${entry.mode === 'interactive' ? 'Hội thoại AI' : 'Luyện phát âm'}`;
      case 'reading':
        return `${entry.durationMinutes || 5} phút đọc`;
      default:
        return '';
    }
  };

  // Ở selection mode → không cho swipe, chỉ tap để chọn
  const cardContent = (
    <Pressable
      className={`bg-surface-raised rounded-2xl mx-4 mb-3 overflow-hidden border ${
        isSelected
          ? 'border-primary/30'
          : 'border-border'
      } active:scale-[0.97]`}
      style={[
        {borderLeftWidth: 4, borderLeftColor: accent.border},
        isSelected ? {backgroundColor: 'rgba(74, 222, 128, 0.08)'} : undefined,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}>
      <View className="p-4">
        {/* Hàng 1: Checkbox (selection) + Icon + Title + Badges */}
        <View className="flex-row items-center gap-3">
          {/* Checkbox khi ở selection mode */}
          {selectionMode && (
            <View
              className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'border-neutrals400'
              }`}>
              {isSelected && (
                <AppText className="text-black text-xs font-sans-bold">✓</AppText>
              )}
            </View>
          )}

          {/* Icon loại bài — SharedElement cho transition animation */}
          <SharedTransition id={`history-icon-${entry.id}`}>
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{backgroundColor: accent.bg}}>
              <AppText className="text-lg">{icon}</AppText>
            </View>
          </SharedTransition>

          {/* Title + Badges */}
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              {entry.isPinned && <AppText className="text-xs">📌</AppText>}
              {entry.isFavorite && <AppText className="text-xs">⭐</AppText>}
              <AppText
                className="text-foreground font-sans-semibold text-base flex-1"
                numberOfLines={1}>
                {entry.topic}
              </AppText>
            </View>

            {/* Subtitle */}
            <AppText
              className="text-sm mt-0.5"
              style={{color: accent.text}}>
              {getSubtitle()}
            </AppText>
          </View>
        </View>

        {/* Hàng 2: Keywords + Timestamp */}
        <View className="flex-row items-center justify-between mt-2.5 pt-2.5 border-t border-border/30">
          {entry.keywords ? (
            <AppText
              className="text-xs text-neutrals400 flex-1"
              numberOfLines={1}>
              🔑 {entry.keywords}
            </AppText>
          ) : (
            <View />
          )}
          <AppText className="text-xs text-neutrals400">{timeAgo}</AppText>
        </View>
      </View>
    </Pressable>
  );

  // Ở selection mode → không cần Swipeable
  if (selectionMode) {
    return cardContent;
  }

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}>
      {cardContent}
    </Swipeable>
  );
});

import React, {useCallback} from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Thanh batch actions hiển thị ở bottom khi đang ở selection mode
 * Tham số đầu vào:
 *   - selectedCount: Số lượng entries đang được chọn
 *   - onDelete: Callback xóa hàng loạt
 *   - onFavorite: Callback yêu thích hàng loạt
 *   - onSelectAll: Callback chọn tất cả
 *   - onCancel: Callback thoát selection mode
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: HistoryScreen → khi selectionMode === true
 */

interface BatchActionBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onFavorite?: () => void;
  onSelectAll?: () => void;
  onCancel?: () => void;
}

export const BatchActionBar = React.memo(function BatchActionBar({
  selectedCount,
  onDelete,
  onFavorite,
  onSelectAll,
  onCancel,
}: BatchActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  /**
   * Mục đích: Render nút action trong batch bar
   * Tham số đầu vào: icon, label, onPress, variant
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: BatchActionBar render → mỗi action button
   */
  const ActionButton = useCallback(
    ({
      icon,
      label,
      onPressAction,
      variant = 'default',
    }: {
      icon: string;
      label: string;
      onPressAction?: () => void;
      variant?: 'default' | 'destructive';
    }) => (
      <Pressable
        className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
          variant === 'destructive'
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-primary/10 border border-primary/20'
        } active:scale-[0.95]`}
        onPress={onPressAction}>
        <AppText className="text-base">{icon}</AppText>
        <AppText
          className={`text-sm font-sans-semibold ${
            variant === 'destructive' ? 'text-red-400' : 'text-primary'
          }`}>
          {label}
        </AppText>
      </Pressable>
    ),
    [],
  );

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border px-4 pt-3 pb-8">
      {/* Header: Số lượng đã chọn + actions */}
      <View className="flex-row items-center justify-between mb-3">
        <AppText className="text-foreground font-sans-semibold">
          ✓ {selectedCount} đã chọn
        </AppText>

        <View className="flex-row gap-3">
          <Pressable onPress={onSelectAll}>
            <AppText className="text-primary text-sm font-sans-medium">
              Chọn tất cả
            </AppText>
          </Pressable>
          <Pressable onPress={onCancel}>
            <AppText className="text-neutrals400 text-sm font-sans-medium">
              Hủy
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <ActionButton
          icon="🗑️"
          label={`Xóa (${selectedCount})`}
          onPressAction={onDelete}
          variant="destructive"
        />
        <ActionButton
          icon="⭐"
          label="Yêu thích"
          onPressAction={onFavorite}
        />
      </View>
    </View>
  );
});

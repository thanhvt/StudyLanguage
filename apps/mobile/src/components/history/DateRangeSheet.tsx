import React, {useState, useCallback} from 'react';
import {View, Pressable, Modal} from 'react-native';
import {AppText} from '@/components/ui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * Mục đích: Bottom sheet cho phép chọn khoảng thời gian filter lịch sử
 * Tham số đầu vào:
 *   - visible: boolean — hiển thị/ẩn sheet
 *   - activeRange: Khoảng thời gian đang active
 *   - onSelect: Callback khi chọn khoảng thời gian
 *   - onCustomDate: Callback khi chọn tùy chỉnh (start, end)
 *   - onClose: Callback đóng sheet
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → tap nút "📅 Tuần này ▼"
 */

type DateRange = 'week' | 'month' | '3months' | 'custom' | 'all';

interface DateRangeSheetProps {
  visible: boolean;
  activeRange: DateRange;
  onSelect: (range: DateRange) => void;
  onCustomDate?: (start: string, end: string) => void;
  onClose: () => void;
}

const RANGE_OPTIONS: {key: DateRange; icon: string; label: string}[] = [
  {key: 'all', icon: '📋', label: 'Tất cả'},
  {key: 'week', icon: '📅', label: 'Tuần này'},
  {key: 'month', icon: '📆', label: 'Tháng này'},
  {key: '3months', icon: '🗓️', label: '3 tháng'},
  {key: 'custom', icon: '✏️', label: 'Tùy chỉnh'},
];

export function DateRangeSheet({
  visible,
  activeRange,
  onSelect,
  onClose,
}: DateRangeSheetProps) {
  const insets = useSafeAreaInsets();
  const [selectedRange, setSelectedRange] = useState<DateRange>(activeRange);

  /**
   * Mục đích: Xử lý khi chọn khoảng thời gian
   * Tham số đầu vào: range - DateRange
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap vào option → select → apply
   */
  const handleSelect = useCallback(
    (range: DateRange) => {
      setSelectedRange(range);
      if (range !== 'custom') {
        // Áp dụng ngay nếu không phải custom
        onSelect(range);
        onClose();
      }
      // TODO: Nếu custom → hiển thị date picker (Phase 2)
      if (range === 'custom') {
        // Tạm thời áp dụng custom với range mặc định
        onSelect(range);
        onClose();
      }
    },
    [onSelect, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        className="flex-1"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.50)'}}
        onPress={onClose}
      />

      {/* Sheet content */}
      <View
        className="bg-background rounded-t-3xl"
        style={{
          paddingBottom: Math.max(insets.bottom, 16) + 24,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
        }}>
        {/* Handle bar */}
        <View className="items-center pt-4 mb-4">
          <View className="w-10 h-1 bg-neutrals600 rounded-full" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-5">
          <AppText className="text-foreground font-sans-bold text-lg">
            📅 Khoảng thời gian
          </AppText>
          <Pressable
            className="w-8 h-8 rounded-full bg-neutrals900 items-center justify-center active:scale-90"
            onPress={onClose}>
            <AppText className="text-neutrals400 text-sm">✕</AppText>
          </Pressable>
        </View>

        {/* Options */}
        <View className="px-6 gap-2">
          {RANGE_OPTIONS.map(option => {
            const isActive = selectedRange === option.key;
            return (
              <Pressable
                key={option.key}
                className={`flex-row items-center gap-3 px-4 py-3.5 rounded-2xl border ${
                  isActive
                    ? 'border-primary/30'
                    : 'border-border'
                } active:scale-[0.97]`}
                style={
                  isActive
                    ? {backgroundColor: 'rgba(74, 222, 128, 0.08)'}
                    : {backgroundColor: '#171717'}
                }
                onPress={() => handleSelect(option.key)}>
                <AppText className="text-base">{option.icon}</AppText>
                <AppText
                  className={`flex-1 font-sans-medium ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}>
                  {option.label}
                </AppText>
                {isActive && (
                  <AppText className="text-primary text-sm">✓</AppText>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

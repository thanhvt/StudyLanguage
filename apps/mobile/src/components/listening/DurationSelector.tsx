import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';

/** Màu LISTENING đặc trưng */
const LISTENING_BLUE = '#2563EB';

/** Phạm vi duration */
const MIN_DURATION = 5;
const MAX_DURATION = 60;

/** Danh sách giá trị duration cho picker — bước 5 phút */
const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

/** Chiều cao mỗi item trong picker list */
const PICKER_ITEM_HEIGHT = 48;

interface DurationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn thời lượng bài nghe — compact dropdown giống design mockup
 *   Hiển thị "5 phút ∨", nhấn vào mở bottom sheet picker
 * Tham số đầu vào:
 *   - value: số phút hiện tại
 *   - onChange: callback khi đổi duration
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → DURATION + SPEAKERS ROW → cột trái
 */
export default function DurationSelector({
  value,
  onChange,
  disabled = false,
}: DurationSelectorProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const [showPicker, setShowPicker] = useState(false);

  /**
   * Mục đích: Mở picker modal
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào dropdown button
   */
  const handleOpen = useCallback(() => {
    if (disabled) return;
    haptic.light();
    setShowPicker(true);
  }, [disabled, haptic]);

  /**
   * Mục đích: Chọn giá trị duration và đóng picker
   * Tham số đầu vào: minutes (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User chọn 1 item trong picker list
   */
  const handleSelect = useCallback(
    (minutes: number) => {
      haptic.medium();
      onChange(minutes);
      setShowPicker(false);
    },
    [haptic, onChange],
  );

  return (
    <View>
      {/* Label */}
      <AppText
        className="text-xs font-sans-medium mb-2 uppercase tracking-wider"
        style={{color: colors.neutrals400}}>
        Duration
      </AppText>

      {/* Dropdown Button — "5 phút ∨" */}
      <TouchableOpacity
        className="flex-row items-center justify-between rounded-xl px-3 py-2.5"
        style={{
          backgroundColor: colors.neutrals900,
          borderWidth: 1,
          borderColor: colors.neutrals800,
        }}
        onPress={handleOpen}
        disabled={disabled}
        accessibilityLabel={`Thời lượng: ${value} phút. Nhấn để thay đổi`}
        accessibilityRole="button">
        <AppText
          className="text-sm font-sans-medium"
          style={{color: colors.foreground}}>
          {value} phút
        </AppText>
        <Icon
          name="ChevronDown"
          className="w-4 h-4 ml-2"
          style={{color: colors.neutrals400}}
        />
      </TouchableOpacity>

      {/* Bottom Sheet Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
          onPress={() => setShowPicker(false)}>
          <Pressable
            onPress={e => e.stopPropagation()}
            className="rounded-t-3xl px-6 pb-safe-offset-6 pt-4"
            style={{
              maxHeight: '50%',
              backgroundColor: colors.background,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -4},
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 20,
            }}>
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View
                className="rounded-full"
                style={{
                  width: 36,
                  height: 4,
                  backgroundColor: colors.neutrals700,
                }}
              />
            </View>

            {/* Header */}
            <AppText
              className="font-sans-bold text-lg mb-4"
              style={{color: colors.foreground}}>
              Chọn thời lượng
            </AppText>

            {/* Duration List */}
            <FlatList
              data={DURATION_OPTIONS}
              keyExtractor={item => String(item)}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => {
                const isSelected = item === value;
                return (
                  <PickerItem
                    value={item}
                    isSelected={isSelected}
                    onPress={() => handleSelect(item)}
                  />
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ========================
// PickerItem — mỗi dòng trong danh sách duration
// ========================

interface PickerItemProps {
  value: number;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Mục đích: Render 1 item trong picker list
 * Tham số đầu vào: value (số phút), isSelected, onPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: DurationSelector picker modal → mỗi option
 */
function PickerItem({value, isSelected, onPress}: PickerItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className="flex-row items-center justify-between rounded-xl px-4"
        style={{
          marginBottom: 4,
          height: PICKER_ITEM_HEIGHT,
          backgroundColor: isSelected ? `${LISTENING_BLUE}15` : 'transparent',
          borderWidth: isSelected ? 1 : 0,
          borderColor: isSelected ? `${LISTENING_BLUE}40` : 'transparent',
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`${value} phút${isSelected ? ', đang chọn' : ''}`}
        accessibilityRole="button">
        <AppText
          className="text-base"
          style={{
            fontWeight: isSelected ? '700' : '500',
            color: isSelected ? LISTENING_BLUE : colors.foreground,
          }}>
          {value} phút
        </AppText>
        {/* Badge "phổ biến" cho 10 phút */}
        {value === 10 && (
          <View
            className="rounded-md px-1.5 py-0.5"
            style={{backgroundColor: colors.neutrals700}}>
            <AppText style={{color: colors.neutrals400, fontSize: 10}}>
              phổ biến
            </AppText>
          </View>
        )}
        {isSelected && (
          <Icon
            name="Check"
            style={{width: 20, height: 20, color: LISTENING_BLUE}}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

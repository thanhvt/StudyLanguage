import React from 'react';
import {TextInput, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Pressable} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';

/** Tuỳ chọn thời lượng cố định */
const PRESET_DURATIONS = [5, 10, 15] as const;

interface DurationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn thời lượng bài nghe — compact inline layout
 * Tham số đầu vào:
 *   - value: số phút hiện tại
 *   - onChange: callback khi đổi duration
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → section "Cấu hình cơ bản" → row "Thời lượng"
 */
export default function DurationSelector({
  value,
  onChange,
  disabled = false,
}: DurationSelectorProps) {
  const colors = useColors();
  const isCustom = !PRESET_DURATIONS.includes(value as any);
  const [showCustomInput, setShowCustomInput] = React.useState(isCustom);
  const [customText, setCustomText] = React.useState(
    isCustom ? String(value) : '',
  );
  const haptic = useHaptic();

  /**
   * Mục đích: Xử lý khi user chọn 1 preset duration
   * Tham số đầu vào: minutes (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào pill 5/10/15
   */
  const handlePreset = (minutes: number) => {
    haptic.light();
    setShowCustomInput(false);
    setCustomText('');
    onChange(minutes);
  };

  /**
   * Mục đích: Mở input custom duration
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút custom (icon bút chì)
   */
  const handleCustomToggle = () => {
    haptic.light();
    setShowCustomInput(true);
    onChange(value);
  };

  /**
   * Mục đích: Xử lý khi user nhập custom duration
   * Tham số đầu vào: text (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhập số phút vào TextInput
   */
  const handleCustomChange = (text: string) => {
    // Chỉ cho phép nhập số
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomText(cleaned);
    const num = parseInt(cleaned, 10);
    if (num >= 5 && num <= 60) {
      onChange(num);
    }
  };

  return (
    <View>
      {/* Row chính: label trái, pills + custom button phải */}
      <View className="flex-row items-center justify-between">
        <AppText className="text-foreground font-sans-medium text-sm">
          Thời lượng
        </AppText>

        <View className="flex-row items-center gap-1.5">
          {/* Segmented pills */}
          <View
            className="flex-row rounded-xl overflow-hidden border border-neutrals800"
            style={{backgroundColor: colors.neutrals900}}>
            {PRESET_DURATIONS.map((d, index) => (
              <CompactPill
                key={d}
                label={`${d}`}
                selected={value === d && !showCustomInput}
                onPress={() => handlePreset(d)}
                disabled={disabled}
                isFirst={index === 0}
                isLast={index === PRESET_DURATIONS.length - 1}
                accessibilityLabel={`${d} phút${value === d && !showCustomInput ? ', đang chọn' : ''}`}
              />
            ))}
          </View>

          {/* Nút custom — icon nhỏ gọn */}
          <CustomIconButton
            active={showCustomInput}
            onPress={handleCustomToggle}
            disabled={disabled}
          />
        </View>
      </View>

      {/* Input custom duration — hiện bên dưới khi active */}
      {showCustomInput && (
        <View className="mt-2.5 flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-neutrals700 rounded-xl px-3 py-2 text-sm"
            style={{color: colors.foreground}}
            placeholder="5-60"
            placeholderTextColor={colors.neutrals500}
            value={customText}
            onChangeText={handleCustomChange}
            keyboardType="number-pad"
            maxLength={2}
            editable={!disabled}
            accessibilityLabel="Nhập số phút tuỳ chỉnh, từ 5 đến 60"
          />
          <AppText className="text-neutrals400 text-xs">phút</AppText>
        </View>
      )}
    </View>
  );
}

// ========================
// CompactPill — pill nhỏ gọn trong segmented control
// ========================

interface CompactPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  accessibilityLabel: string;
}

/**
 * Mục đích: Pill button compact trong segmented control, có spring animation
 * Tham số đầu vào: label, selected, onPress, disabled, isFirst, isLast, accessibilityLabel
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: DurationSelector → mỗi preset pill (5/10/15)
 */
function CompactPill({
  label,
  selected,
  onPress,
  disabled,
  accessibilityLabel,
}: CompactPillProps) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className="items-center justify-center"
        style={{
          width: 48,
          height: 36,
          backgroundColor: selected ? `${colors.primary}18` : 'transparent',
          borderColor: selected ? colors.primary : 'transparent',
          borderWidth: selected ? 1 : 0,
          borderRadius: selected ? 10 : 0,
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        <AppText
          className={`font-sans-bold text-sm ${
            selected ? 'text-primary' : 'text-foreground'
          }`}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

// ========================
// CustomIconButton — nút icon bút chì mở custom input
// ========================

interface CustomIconButtonProps {
  active: boolean;
  onPress: () => void;
  disabled: boolean;
}

/**
 * Mục đích: Nút icon nhỏ gọn để mở custom duration input
 * Tham số đầu vào: active (đang mở custom), onPress, disabled
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: DurationSelector → sau segmented pills
 */
function CustomIconButton({active, onPress, disabled}: CustomIconButtonProps) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className="items-center justify-center rounded-xl"
        style={{
          width: 36,
          height: 36,
          backgroundColor: active ? `${colors.primary}18` : colors.neutrals900,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.neutrals800,
        }}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, {damping: 15, stiffness: 300});
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {damping: 12, stiffness: 200});
        }}
        disabled={disabled}
        accessibilityLabel={`Tuỳ chỉnh thời lượng${active ? ', đang chọn' : ''}`}
        accessibilityRole="button">
        <Icon
          name="Pencil"
          className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-neutrals400'}`}
        />
      </Pressable>
    </Animated.View>
  );
}

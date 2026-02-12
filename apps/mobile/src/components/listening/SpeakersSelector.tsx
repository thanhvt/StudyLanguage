import React from 'react';
import {Pressable, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useHaptic} from '@/hooks/useHaptic';
import {useColors} from '@/hooks/useColors';

/** Tuỳ chọn số lượng speakers */
const SPEAKER_OPTIONS = [
  {value: 2, label: 'Dialog'},
  {value: 3, label: 'Nhóm'},
  {value: 4, label: 'Team'},
] as const;

interface SpeakersSelectorProps {
  value: number;
  onChange: (speakers: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn số người nói — compact inline layout
 * Tham số đầu vào:
 *   - value: số speakers hiện tại (2/3/4)
 *   - onChange: callback khi đổi speakers
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → section "Cấu hình cơ bản" → row "Số người nói"
 */
export default function SpeakersSelector({
  value,
  onChange,
  disabled = false,
}: SpeakersSelectorProps) {
  const haptic = useHaptic();

  return (
    <View className="flex-row items-center justify-between">
      <AppText className="text-foreground font-sans-medium text-sm">
        Số người nói
      </AppText>

      <View className="flex-row items-center gap-2">
        {SPEAKER_OPTIONS.map(opt => (
          <SpeakerPill
            key={opt.value}
            number={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onPress={() => {
              haptic.light();
              onChange(opt.value);
            }}
            disabled={disabled}
            accessibilityLabel={`${opt.value} người nói, ${opt.label}${value === opt.value ? ', đang chọn' : ''}`}
          />
        ))}
      </View>
    </View>
  );
}

// ========================
// SpeakerPill — pill compact hiển thị số + label nhỏ
// ========================

interface SpeakerPillProps {
  number: number;
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
}

/**
 * Mục đích: Pill hiển thị số người nói + label nhỏ, có spring animation
 * Tham số đầu vào: number, label, selected, onPress, disabled, accessibilityLabel
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SpeakersSelector → mỗi option (2/3/4 speakers)
 */
function SpeakerPill({
  number,
  label,
  selected,
  onPress,
  disabled,
  accessibilityLabel,
}: SpeakerPillProps) {
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
        className="items-center justify-center rounded-xl"
        style={{
          width: 56,
          height: 48,
          backgroundColor: selected ? `${colors.primary}18` : colors.neutrals900,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.neutrals800,
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        <AppText
          className={`font-sans-bold text-base ${
            selected ? 'text-primary' : 'text-foreground'
          }`}>
          {number}
        </AppText>
        <AppText
          className={`text-[10px] mt-0.5 ${
            selected ? 'text-primary' : 'text-neutrals400'
          }`}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

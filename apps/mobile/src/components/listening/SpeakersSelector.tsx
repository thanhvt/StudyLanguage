import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useHaptic} from '@/hooks/useHaptic';
import {useColors} from '@/hooks/useColors';

/** Màu LISTENING đặc trưng */
const LISTENING_BLUE = '#2563EB';

/** Giới hạn số speakers */
const MIN_SPEAKERS = 2;
const MAX_SPEAKERS = 4;

interface SpeakersSelectorProps {
  value: number;
  onChange: (speakers: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn số người nói — compact stepper (— 2 +) giống design mockup
 * Tham số đầu vào:
 *   - value: số speakers hiện tại (2/3/4)
 *   - onChange: callback khi đổi speakers
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → DURATION + SPEAKERS ROW → cột phải
 */
export default function SpeakersSelector({
  value,
  onChange,
  disabled = false,
}: SpeakersSelectorProps) {
  const haptic = useHaptic();
  const colors = useColors();

  /**
   * Mục đích: Giảm số speakers
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "—"
   */
  const handleDecrease = useCallback(() => {
    if (value > MIN_SPEAKERS) {
      haptic.light();
      onChange(value - 1);
    }
  }, [value, haptic, onChange]);

  /**
   * Mục đích: Tăng số speakers
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "+"
   */
  const handleIncrease = useCallback(() => {
    if (value < MAX_SPEAKERS) {
      haptic.light();
      onChange(value + 1);
    }
  }, [value, haptic, onChange]);

  const canDecrease = value > MIN_SPEAKERS;
  const canIncrease = value < MAX_SPEAKERS;

  return (
    <View>
      {/* Label */}
      <AppText
        className="text-xs font-sans-medium mb-2 uppercase tracking-wider"
        style={{color: colors.neutrals400}}>
        Speakers
      </AppText>

      {/* Stepper: — [number] + */}
      <View
        className="flex-row items-center justify-between rounded-xl"
        style={{
          backgroundColor: colors.neutrals900,
          borderWidth: 1,
          borderColor: colors.neutrals800,
        }}>
        {/* Nút giảm — */}
        <TouchableOpacity
          className="items-center justify-center"
          style={{
            width: 44,
            height: 40,
            opacity: canDecrease ? 1 : 0.3,
          }}
          onPress={handleDecrease}
          disabled={disabled || !canDecrease}
          accessibilityLabel="Giảm số người nói"
          accessibilityRole="button">
          <Icon
            name="Minus"
            className="w-4 h-4"
            style={{color: canDecrease ? LISTENING_BLUE : colors.neutrals600}}
          />
        </TouchableOpacity>

        {/* Số lượng hiện tại */}
        <AppText
          className="text-base font-sans-bold"
          style={{color: colors.foreground}}>
          {value}
        </AppText>

        {/* Nút tăng + */}
        <TouchableOpacity
          className="items-center justify-center"
          style={{
            width: 44,
            height: 40,
            opacity: canIncrease ? 1 : 0.3,
          }}
          onPress={handleIncrease}
          disabled={disabled || !canIncrease}
          accessibilityLabel="Tăng số người nói"
          accessibilityRole="button">
          <Icon
            name="Plus"
            className="w-4 h-4"
            style={{color: canIncrease ? LISTENING_BLUE : colors.neutrals600}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

import React from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/** Tuỳ chọn thời lượng cố định */
const PRESET_DURATIONS = [5, 10, 15] as const;

interface DurationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn thời lượng bài nghe (5/10/15 phút hoặc Custom)
 * Tham số đầu vào:
 *   - value: số phút hiện tại
 *   - onChange: callback khi đổi duration
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → section "Thời lượng"
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

  /**
   * Mục đích: Xử lý khi user chọn 1 preset duration
   * Tham số đầu vào: minutes (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào chip 5/10/15
   */
  const handlePreset = (minutes: number) => {
    setShowCustomInput(false);
    setCustomText('');
    onChange(minutes);
  };

  /**
   * Mục đích: Mở input custom duration
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "Custom"
   */
  const handleCustomToggle = () => {
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
    if (num >= 1 && num <= 60) {
      onChange(num);
    }
  };

  return (
    <View>
      <View className="flex-row gap-2">
        {PRESET_DURATIONS.map(d => (
          <TouchableOpacity
            key={d}
            className={`flex-1 py-3 rounded-2xl items-center border ${
              value === d && !showCustomInput
                ? 'bg-primary/10 border-primary'
                : 'bg-neutrals900 border-neutrals800'
            }`}
            onPress={() => handlePreset(d)}
            disabled={disabled}
            activeOpacity={0.7}>
            <AppText
              className={`font-sans-bold text-base ${
                value === d && !showCustomInput
                  ? 'text-primary'
                  : 'text-foreground'
              }`}>
              {d} phút
            </AppText>
          </TouchableOpacity>
        ))}

        {/* Nút Custom */}
        <TouchableOpacity
          className={`flex-1 py-3 rounded-2xl items-center border ${
            showCustomInput
              ? 'bg-primary/10 border-primary'
              : 'bg-neutrals900 border-neutrals800'
          }`}
          onPress={handleCustomToggle}
          disabled={disabled}
          activeOpacity={0.7}>
          <AppText
            className={`font-sans-bold text-base ${
              showCustomInput ? 'text-primary' : 'text-foreground'
            }`}>
            ✏️
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Input custom duration */}
      {showCustomInput && (
        <View className="mt-3 flex-row items-center gap-3">
          <TextInput
            className="flex-1 border border-neutrals700 rounded-xl px-4 py-2.5 text-base"
            style={{color: colors.foreground}}
            placeholder="Nhập số phút (1-60)"
            placeholderTextColor={colors.neutrals500}
            value={customText}
            onChangeText={handleCustomChange}
            keyboardType="number-pad"
            maxLength={2}
            editable={!disabled}
          />
          <AppText className="text-neutrals400 text-sm">phút</AppText>
        </View>
      )}
    </View>
  );
}

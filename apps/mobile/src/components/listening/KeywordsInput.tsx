import React from 'react';
import {TextInput, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

interface KeywordsInputProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
}

const MAX_LENGTH = 200;

/**
 * Mục đích: Component nhập từ khóa gợi ý cho bài nghe (optional)
 * Tham số đầu vào:
 *   - value: text từ khóa hiện tại
 *   - onChange: callback khi nhập
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → CollapsibleSection → "Từ khóa (tuỳ chọn)"
 */
export default function KeywordsInput({
  value,
  onChange,
  disabled = false,
  onFocus,
}: KeywordsInputProps) {
  const colors = useColors();

  return (
    <View className="rounded-2xl px-4 py-3" style={{backgroundColor: colors.neutrals900}}>
      <TextInput
        className="text-base min-h-[52px]"
        style={{color: colors.foreground, textAlignVertical: 'top'}}
        placeholder="vd: coffee, reservation, check-in..."
        placeholderTextColor={colors.neutrals500}
        value={value}
        onChangeText={text => onChange(text.slice(0, MAX_LENGTH))}
        multiline
        maxLength={MAX_LENGTH}
        editable={!disabled}
        numberOfLines={2}
        accessibilityLabel="Nhập từ khóa gợi ý cho bài nghe"
        accessibilityHint="Tuỳ chọn. Gợi ý nội dung xoay quanh các từ khóa bạn nhập"
        onFocus={onFocus}
      />
      <View className="flex-row justify-between items-center mt-1">
        <AppText className="text-xs" style={{color: colors.neutrals400}}>
          Gợi ý nội dung xoay quanh các từ khóa này
        </AppText>
        <AppText
          className={`text-xs ${
            value.length > MAX_LENGTH * 0.9
              ? 'text-destructive'
              : ''
          }`}
          style={value.length <= MAX_LENGTH * 0.9 ? {color: colors.neutrals400} : undefined}>
          {value.length}/{MAX_LENGTH}
        </AppText>
      </View>
    </View>
  );
}

import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';

/** Tuỳ chọn số lượng speakers */
const SPEAKER_OPTIONS = [
  {value: 2, label: '2', description: 'Dialog'},
  {value: 3, label: '3', description: 'Nhóm'},
  {value: 4, label: '4', description: 'Team'},
] as const;

interface SpeakersSelectorProps {
  value: number;
  onChange: (speakers: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn số người nói trong hội thoại
 * Tham số đầu vào:
 *   - value: số speakers hiện tại (2/3/4)
 *   - onChange: callback khi đổi speakers
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → section "Số người nói"
 */
export default function SpeakersSelector({
  value,
  onChange,
  disabled = false,
}: SpeakersSelectorProps) {
  return (
    <View className="flex-row gap-3">
      {SPEAKER_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          className={`flex-1 py-3 rounded-2xl items-center border ${
            value === opt.value
              ? 'bg-primary/10 border-primary'
              : 'bg-neutrals900 border-neutrals800'
          }`}
          onPress={() => onChange(opt.value)}
          disabled={disabled}
          activeOpacity={0.7}>
          <AppText
            className={`font-sans-bold text-lg ${
              value === opt.value ? 'text-primary' : 'text-foreground'
            }`}>
            👤×{opt.label}
          </AppText>
          <AppText
            className={`text-xs mt-0.5 ${
              value === opt.value ? 'text-primary' : 'text-neutrals400'
            }`}>
            {opt.description}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

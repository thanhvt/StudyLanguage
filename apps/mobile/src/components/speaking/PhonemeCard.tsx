import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';
import type {PhonemeInfo} from '@/types/tongueTwister.types';

// =======================
// Types
// =======================

interface PhonemeCardProps {
  /** Thông tin phoneme category */
  phoneme: PhonemeInfo;
  /** Card đang được chọn hay không */
  isSelected: boolean;
  /** Callback khi user tap */
  onPress: () => void;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card hiển thị 1 phoneme category trong grid chọn âm
 * Tham số đầu vào: phoneme (PhonemeInfo), isSelected (boolean), onPress (callback)
 * Tham số đầu ra: JSX.Element — card có border màu, phoneme pair + example
 * Khi nào sử dụng:
 *   - TongueTwisterSelectScreen → PhonemeGrid → 6 PhonemeCards
 *   - User tap → setPhonemeCategory trong store
 */
export default function PhonemeCard({phoneme, isSelected, onPress}: PhonemeCardProps) {
  const colors = useColors();
  // UI-06 FIX: Dùng colorLight khi light mode
  const theme = useAppStore(state => state.theme);
  const accentColor = theme === 'light' ? phoneme.colorLight : phoneme.color;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: isSelected
            ? `${accentColor}20`
            : colors.surface,
          borderColor: isSelected ? accentColor : `${accentColor}30`,
          borderWidth: isSelected ? 2 : 1,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Chọn phoneme ${phoneme.phonemePair}`}
      accessibilityState={{selected: isSelected}}>
      {/* Phoneme pair */}
      <AppText
        variant="heading3"
        weight="bold"
        style={{color: accentColor}}
        raw>
        {phoneme.phonemePair}
      </AppText>

      {/* Ví dụ */}
      <AppText
        variant="caption"
        className="text-neutrals400 mt-1"
        raw>
        {phoneme.example}
      </AppText>
    </Pressable>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
});

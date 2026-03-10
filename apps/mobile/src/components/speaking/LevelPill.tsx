import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import type {TwisterLevel} from '@/types/tongueTwister.types';

// =======================
// Types
// =======================

interface LevelPillProps {
  /** Level */
  level: TwisterLevel;
  /** Label hiển thị */
  label: string;
  /** Emoji icon */
  emoji: string;
  /** Level có được unlock không */
  isUnlocked: boolean;
  /** Đang được chọn */
  isSelected: boolean;
  /** Callback khi user tap */
  onPress: () => void;
}

// =======================
// Constants
// =======================

/** Màu cho từng level */
const LEVEL_COLORS: Record<TwisterLevel, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#f97316',
  extreme: '#ef4444',
};

// =======================
// Component
// =======================

/**
 * Mục đích: Pill selector cho difficulty level (Easy/Medium/Hard/Extreme)
 * Tham số đầu vào: level, label, emoji, isUnlocked, isSelected, onPress
 * Tham số đầu ra: JSX.Element — pill chip
 * Khi nào sử dụng:
 *   - TongueTwisterSelectScreen → Level row → 4 LevelPills
 *   - User tap → setLevel trong store (chỉ nếu unlocked)
 */
export default function LevelPill({
  level,
  label,
  emoji,
  isUnlocked,
  isSelected,
  onPress,
}: LevelPillProps) {
  const colors = useColors();
  const levelColor = LEVEL_COLORS[level];

  return (
    <Pressable
      onPress={isUnlocked ? onPress : undefined}
      disabled={!isUnlocked}
      style={({pressed}) => [
        styles.pill,
        {
          backgroundColor: isSelected
            ? levelColor
            : isUnlocked
              ? `${levelColor}15`
              : colors.surface,
          borderColor: isSelected
            ? levelColor
            : isUnlocked
              ? `${levelColor}40`
              : colors.neutrals300 || '#555',
          opacity: !isUnlocked ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Level ${label}${!isUnlocked ? ' - Khóa' : ''}`}
      accessibilityState={{disabled: !isUnlocked, selected: isSelected}}>
      <AppText
        variant="caption"
        weight={isSelected ? 'bold' : 'medium'}
        style={{color: isSelected ? '#fff' : isUnlocked ? levelColor : colors.neutrals400}}
        raw>
        {emoji} {label} {!isUnlocked ? '🔒' : ''}
      </AppText>
    </Pressable>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
});

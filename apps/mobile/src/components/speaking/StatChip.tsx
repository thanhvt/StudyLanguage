import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

interface StatChipProps {
  /** Icon emoji */
  icon: string;
  /** Label (ví dụ "WPM") */
  label: string;
  /** Giá trị hiển thị */
  value: string | number;
  /** Màu value (optional) */
  valueColor?: string;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Chip nhỏ hiển thị 1 stat (WPM / Accuracy / Best WPM)
 * Tham số đầu vào: icon, label, value, valueColor
 * Tham số đầu ra: JSX.Element — compact stat display
 * Khi nào sử dụng:
 *   - FeedbackScreen → Stats Row → 3× StatChip
 *   - ShadowingFeedbackScreen → score summary
 */
export default function StatChip({icon, label, value, valueColor}: StatChipProps) {
  const colors = useColors();

  return (
    <View style={[styles.chip, {backgroundColor: colors.surface}]}>
      <AppText variant="caption" raw>
        {icon}
      </AppText>
      <AppText
        variant="caption"
        className="text-neutrals400 ml-1"
        raw>
        {label}:
      </AppText>
      <AppText
        variant="bodySmall"
        weight="bold"
        style={{color: valueColor || colors.foreground, marginLeft: 3}}
        raw>
        {value}
      </AppText>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
});

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface TurnCounterProps {
  /** Lượt hiện tại */
  current: number;
  /** Tổng số lượt */
  total: number;
  /** Label tuỳ chỉnh */
  label?: string;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Badge hiển thị lượt chơi hiện tại / tổng
 * Tham số đầu vào: current, total, label
 * Tham số đầu ra: JSX.Element — compact badge
 * Khi nào sử dụng:
 *   - RoleplaySessionScreen: hiển thị lượt nói User/AI
 *   - TongueTwisterScreen: hiển thị round hiện tại
 */
export default function TurnCounter({
  current,
  total,
  label = 'Lượt',
}: TurnCounterProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <AppText variant="caption" className="text-neutrals400 mb-1" raw>
        {label}
      </AppText>

      <View style={styles.row}>
        <AppText variant="heading3" weight="bold" style={{color: speakingColor}} raw>
          {current}
        </AppText>
        <AppText variant="bodySmall" className="text-neutrals400" raw>
          / {total}
        </AppText>
      </View>

      {/* Mini progress bar */}
      <View style={[styles.track, {backgroundColor: `${speakingColor}15`}]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: speakingColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  track: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import type {SpeedRound} from '@/types/tongueTwister.types';

// =======================
// Types
// =======================

interface RoundCardProps {
  /** Dữ liệu round */
  round: SpeedRound;
  /** Round này đang active (đang chơi) */
  isActive: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị 1 row trạng thái round trong Speed Challenge tracker
 * Tham số đầu vào: round (SpeedRound), isActive (boolean)
 * Tham số đầu ra: JSX.Element — row với status icon, speed label, score
 * Khi nào sử dụng:
 *   - SpeedChallengeScreen → SpeedTracker → 4× RoundCard
 *   - Hiển thị ✅ completed / 🔴 ACTIVE / 🔒 locked
 */
export default function RoundCard({round, isActive}: RoundCardProps) {
  const colors = useColors();

  /**
   * Mục đích: Lấy icon trạng thái cho round
   * Tham số đầu vào: status
   * Tham số đầu ra: string emoji
   * Khi nào sử dụng: Render status indicator
   */
  const getStatusIcon = () => {
    switch (round.status) {
      case 'completed':
        return '✅';
      case 'active':
        return '🔴';
      case 'locked':
        return '🔒';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isActive
            ? `${colors.foreground}08`
            : colors.surface,
          borderColor: isActive ? '#eab308' : 'transparent',
          borderWidth: isActive ? 1.5 : 0,
        },
      ]}>
      {/* Thông tin round */}
      <View style={styles.leftSection}>
        <AppText variant="body" weight="semibold" className="text-foreground" raw>
          Round {round.round}: {round.targetSpeed}x
        </AppText>
        <AppText variant="caption" className="ml-2" raw>
          {getStatusIcon()}
        </AppText>
      </View>

      {/* Score hoặc status label */}
      <View style={styles.rightSection}>
        {round.status === 'completed' && round.score !== null ? (
          <AppText variant="body" weight="bold" style={{color: '#22c55e'}} raw>
            Score: {round.score}
          </AppText>
        ) : round.status === 'active' ? (
          <AppText variant="bodySmall" weight="bold" style={{color: '#eab308'}} raw>
            ACTIVE
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
});

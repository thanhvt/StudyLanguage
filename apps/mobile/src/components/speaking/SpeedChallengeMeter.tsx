import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface SpeedChallengeMeterProps {
  /** Tốc độ hiện tại (words per minute) */
  currentWPM: number;
  /** Tốc độ mục tiêu */
  targetWPM: number;
  /** Label */
  label?: string;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Đồng hồ đo tốc độ nói (WPM) cho Tongue Twister challenge
 * Tham số đầu vào: currentWPM, targetWPM, label
 * Tham số đầu ra: JSX.Element — gauge meter
 * Khi nào sử dụng:
 *   - TongueTwisterScreen: hiển thị tốc độ user đạt vs mục tiêu
 *   - PracticeScreen: (tùy chọn) hiển thị pace
 */
export default function SpeedChallengeMeter({
  currentWPM,
  targetWPM,
  label = 'Tốc độ',
}: SpeedChallengeMeterProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  const progress = useSharedValue(0);
  const ratio = Math.min(currentWPM / targetWPM, 1.5); // Cho phép vượt 150%

  useEffect(() => {
    progress.value = withTiming(ratio, {duration: 800, easing: Easing.out(Easing.cubic)});
  }, [currentWPM, targetWPM, ratio, progress]);

  /**
   * Mục đích: Lấy màu dựa trên % đạt target
   * Tham số đầu vào: r (ratio)
   * Tham số đầu ra: string — hex color
   * Khi nào sử dụng: Tô màu progress bar
   */
  const getColor = (r: number) => {
    if (r >= 1) return '#22c55e';
    if (r >= 0.7) return '#facc15';
    if (r >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const barColor = getColor(ratio);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%`,
  }));

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <View style={styles.header}>
        <AppText variant="bodySmall" weight="semibold" className="text-foreground" raw>
          ⚡ {label}
        </AppText>
        <View style={styles.wpmRow}>
          <AppText variant="heading3" weight="bold" style={{color: barColor}} raw>
            {currentWPM}
          </AppText>
          <AppText variant="bodySmall" className="text-neutrals400 ml-1" raw>
            / {targetWPM} wpm
          </AppText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.track, {backgroundColor: `${speakingColor}12`}]}>
        <Animated.View
          style={[styles.fill, {backgroundColor: barColor}, animatedWidth]}
        />
        {/* Target marker */}
        <View style={[styles.targetLine, {left: '66.7%'}]} />
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        <AppText variant="caption" className="text-neutrals400" raw>Chậm</AppText>
        <AppText variant="caption" className="text-neutrals400" raw>Chuẩn</AppText>
        <AppText variant="caption" className="text-neutrals400" raw>Nhanh</AppText>
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  track: {
    height: 10,
    borderRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 5,
  },
  targetLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

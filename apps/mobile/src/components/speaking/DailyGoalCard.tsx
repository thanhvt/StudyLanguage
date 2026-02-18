import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface DailyGoalCardProps {
  /** Số phút đã luyện hôm nay */
  currentMinutes: number;
  /** Mục tiêu phút/ngày */
  goalMinutes: number;
  /** Số câu đã luyện */
  sentencesDone: number;
  /** Số session hoàn tất */
  sessionsDone: number;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card hiển thị tiến độ mục tiêu hàng ngày
 * Tham số đầu vào: currentMinutes, goalMinutes, sentencesDone, sessionsDone
 * Tham số đầu ra: JSX.Element — card progress ring
 * Khi nào sử dụng:
 *   - ProgressDashboardScreen: mục tiêu hàng ngày
 *   - ConfigScreen: (tùy chọn) mini widget
 */
export default function DailyGoalCard({
  currentMinutes,
  goalMinutes,
  sentencesDone,
  sessionsDone,
}: DailyGoalCardProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;
  const progress = Math.min(currentMinutes / goalMinutes, 1);
  const percentage = Math.round(progress * 100);
  const completed = progress >= 1;

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Left: Progress circle */}
      <View style={styles.circleArea}>
        <View style={[styles.circleOuter, {borderColor: `${speakingColor}20`}]}>
          <View
            style={[
              styles.circleInner,
              {
                backgroundColor: completed ? `${speakingColor}20` : 'transparent',
              },
            ]}>
            <AppText
              variant="heading3"
              weight="bold"
              style={{color: completed ? '#22c55e' : speakingColor}}
              raw>
              {percentage}%
            </AppText>
          </View>
        </View>
      </View>

      {/* Right: Stats */}
      <View style={styles.stats}>
        <AppText variant="body" weight="semibold" className="text-foreground" raw>
          {completed ? '🎉 Hoàn thành!' : '🎯 Mục tiêu hôm nay'}
        </AppText>

        <View style={styles.statRow}>
          <AppText variant="bodySmall" className="text-neutrals400" raw>
            ⏱️ {currentMinutes}/{goalMinutes} phút
          </AppText>
        </View>
        <View style={styles.statRow}>
          <AppText variant="bodySmall" className="text-neutrals400" raw>
            📝 {sentencesDone} câu
          </AppText>
        </View>
        <View style={styles.statRow}>
          <AppText variant="bodySmall" className="text-neutrals400" raw>
            🔄 {sessionsDone} phiên
          </AppText>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, {backgroundColor: `${speakingColor}15`}]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: completed ? '#22c55e' : speakingColor,
              },
            ]}
          />
        </View>
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
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 14,
  },
  circleArea: {
    justifyContent: 'center',
  },
  circleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flex: 1,
    justifyContent: 'center',
  },
  statRow: {
    marginTop: 2,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: 8,
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
});

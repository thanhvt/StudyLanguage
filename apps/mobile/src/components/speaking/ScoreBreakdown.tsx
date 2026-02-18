import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface ScoreItem {
  /** Tên metric */
  label: string;
  /** Điểm 0-100 */
  value: number;
  /** Icon emoji */
  icon: string;
}

interface ScoreBreakdownProps {
  /** Danh sách metrics */
  scores: ScoreItem[];
  /** Có hiện progress bar */
  showBars?: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card hiển thị chi tiết điểm theo nhiều tiêu chí với progress bar
 * Tham số đầu vào: scores — {label, value, icon}[], showBars
 * Tham số đầu ra: JSX.Element — vertical list với animated bars
 * Khi nào sử dụng:
 *   - FeedbackScreen: thay thế sub-scores section hiện tại
 *   - ShadowingScreen: hiển thị kết quả chi tiết
 */
export default function ScoreBreakdown({scores, showBars = true}: ScoreBreakdownProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  /**
   * Mục đích: Lấy màu cho progress bar
   * Tham số đầu vào: value (0-100)
   * Tham số đầu ra: string — hex color
   * Khi nào sử dụng: Tô màu progress bar
   */
  const getBarColor = (value: number) => {
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#facc15';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <AppText variant="body" weight="semibold" className="mb-3 text-foreground" raw>
        📊 Chi tiết đánh giá
      </AppText>

      {scores.map((item, index) => (
        <View key={item.label} style={[styles.row, index < scores.length - 1 && styles.rowBorder]}>
          <View style={styles.rowLeft}>
            <AppText variant="body" raw>{item.icon}</AppText>
            <AppText variant="body" className="text-foreground ml-2" raw>
              {item.label}
            </AppText>
          </View>

          <View style={styles.rowRight}>
            {showBars && (
              <View style={[styles.barTrack, {backgroundColor: `${speakingColor}15`}]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${item.value}%`,
                      backgroundColor: getBarColor(item.value),
                    },
                  ]}
                />
              </View>
            )}
            <AppText
              variant="body"
              weight="bold"
              style={{color: getBarColor(item.value), minWidth: 32, textAlign: 'right'}}
              raw>
              {item.value}
            </AppText>
          </View>
        </View>
      ))}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.12)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    maxWidth: 100,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
});

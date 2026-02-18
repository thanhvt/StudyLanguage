import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface DayData {
  /** Ngày (YYYY-MM-DD) */
  date: string;
  /** Số phút luyện */
  minutes: number;
}

interface CalendarHeatmapProps {
  /** Dữ liệu 7 tuần gần nhất */
  data: DayData[];
  /** Số tuần hiển thị */
  weeks?: number;
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Lấy màu dựa trên số phút
 * Tham số đầu vào: minutes (number)
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: Tô màu cho ô ngày
 */
function getHeatColor(minutes: number): string {
  const speakingColor = SKILL_COLORS.speaking.dark;
  if (minutes === 0) return 'rgba(150,150,150,0.08)';
  if (minutes < 5) return `${speakingColor}20`;
  if (minutes < 15) return `${speakingColor}40`;
  if (minutes < 30) return `${speakingColor}70`;
  return `${speakingColor}CC`;
}

const DAYS_VN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const CELL_SIZE = 14;
const CELL_GAP = 3;

// =======================
// Component
// =======================

/**
 * Mục đích: Heatmap lịch luyện tập (giống GitHub contribution chart)
 * Tham số đầu vào: data — {date, minutes}[], weeks
 * Tham số đầu ra: JSX.Element — 7x(weeks) grid
 * Khi nào sử dụng:
 *   - ProgressDashboardScreen: streak + habit tracking
 */
export default function CalendarHeatmap({data, weeks = 7}: CalendarHeatmapProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Tạo grid 7 ngày x N tuần
  const totalDays = weeks * 7;
  const today = new Date();

  const grid: {date: string; minutes: number}[][] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const week: {date: string; minutes: number}[] = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + (6 - d);
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      const found = data.find(item => item.date === dateStr);
      week.push({date: dateStr, minutes: found?.minutes || 0});
    }
    grid.push(week);
  }

  // Tính streak
  let streak = 0;
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const found = data.find(item => item.date === dateStr);
    if (found && found.minutes > 0) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="body" weight="semibold" className="text-foreground" raw>
          📅 Lịch luyện tập
        </AppText>
        <View style={[styles.streakBadge, {backgroundColor: `${speakingColor}15`}]}>
          <AppText variant="bodySmall" weight="bold" style={{color: speakingColor}} raw>
            🔥 {streak} ngày
          </AppText>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.gridArea}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {DAYS_VN.map((d, i) => (
            <View key={d} style={{height: CELL_SIZE, justifyContent: 'center'}}>
              {i % 2 === 0 && (
                <AppText variant="caption" className="text-neutrals400" style={{fontSize: 9}} raw>
                  {d}
                </AppText>
              )}
            </View>
          ))}
        </View>

        {/* Weeks */}
        <View style={styles.weeks}>
          {grid.map((week, wi) => (
            <View key={wi} style={styles.weekColumn}>
              {week.map((day, di) => (
                <View
                  key={day.date}
                  style={[
                    styles.cell,
                    {backgroundColor: getHeatColor(day.minutes)},
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <AppText variant="caption" className="text-neutrals400" raw>Ít</AppText>
        {[0, 5, 15, 30, 60].map((m, i) => (
          <View
            key={i}
            style={[styles.legendCell, {backgroundColor: getHeatColor(m)}]}
          />
        ))}
        <AppText variant="caption" className="text-neutrals400" raw>Nhiều</AppText>
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
    marginBottom: 12,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridArea: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 4,
    gap: CELL_GAP,
  },
  weeks: {
    flexDirection: 'row',
    gap: CELL_GAP,
    flex: 1,
  },
  weekColumn: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 8,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

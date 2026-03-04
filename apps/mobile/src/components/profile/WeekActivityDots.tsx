import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';

// Mock data — sẽ thay bằng API thực sau
const MOCK_WEEK = [
  {day: 'T2', minutes: 25},
  {day: 'T3', minutes: 35},
  {day: 'T4', minutes: 45},
  {day: 'T5', minutes: 40},
  {day: 'T6', minutes: 30},
  {day: 'Sá', minutes: 50},
  {day: 'CN', minutes: 20},
];

const MAX_BAR_HEIGHT = 80;

/**
 * Mục đích: Hiển thị hoạt động tuần dạng bar chart (7 cột T2→CN)
 * Tham số đầu vào: không có (dùng mock data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: MoreScreen — sau StatsOverview
 *
 * Hi-fi ref: ps_profile_overview_v2
 *   - Bar chart 7 cột vertical, primary color
 *   - Card bg: surface #141414, glassBorder rgba
 *   - Title "Hoạt động tuần này" TRONG card
 */
export default function WeekActivityChart() {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  const maxMinutes = Math.max(...MOCK_WEEK.map(d => d.minutes), 1);

  return (
    <View
      className="mx-4 mt-4 rounded-[20px] p-4"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: isDark ? colors.glassBorder : colors.border,
      }}>
      {/* Title — trong card, foreground color */}
      <AppText
        variant="label"
        style={{color: colors.foreground}}
        className="mb-4 font-sans-semibold"
        raw>
        Hoạt động tuần này
      </AppText>

      {/* Bar chart */}
      <View className="flex-row justify-between items-end" style={{height: MAX_BAR_HEIGHT + 28}}>
        {MOCK_WEEK.map((item, index) => {
          const barHeight = Math.max(
            (item.minutes / maxMinutes) * MAX_BAR_HEIGHT,
            6,
          );
          const hasActivity = item.minutes > 0;

          return (
            <View key={index} className="items-center flex-1">
              <View
                style={{
                  width: 24,
                  height: barHeight,
                  backgroundColor: hasActivity
                    ? colors.primary
                    : isDark ? colors.neutrals800 : colors.neutrals600,
                  borderRadius: 6,
                }}
              />
              <AppText
                variant="caption"
                style={{color: colors.neutrals400}}
                className="mt-2"
                raw>
                {item.day}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

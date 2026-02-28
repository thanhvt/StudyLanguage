import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Heatmap kiểu GitHub hiển thị hoạt động học tập theo ngày trong tuần
 * Tham số đầu vào:
 *   - data: {date: string; count: number}[] — dữ liệu heatmap (mảng 7 ngày * n tuần)
 *   - weeks: number — số tuần hiển thị (mặc định 4)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Analytics section → hiển thị weekly activity
 */

interface HeatmapData {
  date: string;
  count: number;
}

interface WeeklyHeatmapProps {
  data?: HeatmapData[];
  weeks?: number;
}

// Labels cho ngày trong tuần
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Mục đích: Lấy màu cell dựa trên count (intensity levels)
 * Tham số đầu vào: count — số lần hoạt động
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: Render từng cell trong heatmap grid
 */
function getCellColor(count: number): string {
  if (count === 0) return '#171717'; // surface-raised
  if (count === 1) return 'rgba(74, 222, 128, 0.15)';
  if (count === 2) return 'rgba(74, 222, 128, 0.30)';
  if (count === 3) return 'rgba(74, 222, 128, 0.50)';
  return 'rgba(74, 222, 128, 0.75)'; // 4+
}

export const WeeklyHeatmap = React.memo(function WeeklyHeatmap({
  data = [],
  weeks = 4,
}: WeeklyHeatmapProps) {
  // Tạo grid data — nếu không có data thì tạo placeholder
  const generateGrid = (): number[][] => {
    if (data.length > 0) {
      // Nhóm data theo tuần
      const grid: number[][] = [];
      for (let w = 0; w < weeks; w++) {
        const weekData: number[] = [];
        for (let d = 0; d < 7; d++) {
          const idx = w * 7 + d;
          weekData.push(data[idx]?.count || 0);
        }
        grid.push(weekData);
      }
      return grid;
    }
    // Placeholder data
    return Array.from({length: weeks}, () =>
      Array.from({length: 7}, () => Math.floor(Math.random() * 5)),
    );
  };

  const grid = generateGrid();

  return (
    <View className="mx-4 mb-4 p-4 bg-surface-raised rounded-2xl border border-border">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <AppText className="text-sm">📊</AppText>
        <AppText className="text-foreground font-sans-semibold">
          Hoạt động tuần
        </AppText>
      </View>

      {/* Day labels */}
      <View className="flex-row mb-2 pl-0">
        {DAY_LABELS.map(day => (
          <View key={day} className="flex-1 items-center">
            <AppText className="text-neutrals400 text-[10px] font-sans-medium">
              {day}
            </AppText>
          </View>
        ))}
      </View>

      {/* Heatmap grid */}
      <View className="gap-1.5">
        {grid.map((week, weekIdx) => (
          <View key={weekIdx} className="flex-row gap-1.5">
            {week.map((count, dayIdx) => (
              <View
                key={`${weekIdx}-${dayIdx}`}
                className="flex-1 rounded-md"
                style={{
                  backgroundColor: getCellColor(count),
                  height: 20,
                  borderWidth: count === 0 ? 1 : 0,
                  borderColor: '#262626',
                }}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-end gap-2 mt-3">
        <AppText className="text-neutrals500 text-[10px]">Ít</AppText>
        {[0, 1, 2, 3, 4].map(level => (
          <View
            key={level}
            className="rounded-sm"
            style={{
              width: 12,
              height: 12,
              backgroundColor: getCellColor(level),
              borderWidth: level === 0 ? 1 : 0,
              borderColor: '#262626',
            }}
          />
        ))}
        <AppText className="text-neutrals500 text-[10px]">Nhiều</AppText>
      </View>
    </View>
  );
});

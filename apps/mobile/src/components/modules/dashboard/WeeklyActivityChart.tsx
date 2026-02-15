import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';

// Mock data — sẽ thay bằng API sau
const WEEK_DATA = [
  {day: 'T2', minutes: 25, active: true},
  {day: 'T3', minutes: 35, active: true},
  {day: 'T4', minutes: 15, active: true},
  {day: 'T5', minutes: 40, active: true},
  {day: 'T6', minutes: 30, active: true},
  {day: 'T7', minutes: 0, active: false},
  {day: 'CN', minutes: 0, active: false},
];

const MAX_BAR_HEIGHT = 80;

/**
 * Mục đích: Widget biểu đồ cột hoạt động trong tuần
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần "Tuần này" trên Dashboard
 *   - 7 cột bar chart (T2→CN)
 *   - Active days: bg amber/warning, Inactive: bg neutrals800
 *   - Mock data tĩnh, nối API sau
 */
export default function WeeklyActivityChart() {
  // Tìm giá trị lớn nhất để scale bars
  const maxMinutes = Math.max(...WEEK_DATA.map(d => d.minutes), 1);

  return (
    <View className="px-4 py-2">
      <View className="bg-neutrals900 rounded-2xl p-4 border border-neutrals800">
        {/* Title */}
        <AppText className="text-foreground font-sans-bold text-base mb-3">
          📈 TUẦN NÀY
        </AppText>

        {/* Bar chart */}
        <View className="flex-row justify-between items-end" style={{height: MAX_BAR_HEIGHT + 20}}>
          {WEEK_DATA.map(item => {
            // Tính chiều cao bar dựa trên tỷ lệ
            const barHeight = item.active
              ? Math.max((item.minutes / maxMinutes) * MAX_BAR_HEIGHT, 8)
              : 8;

            return (
              <View key={item.day} className="items-center flex-1" style={{gap: 4}}>
                {/* Bar */}
                <View
                  className={`w-6 rounded ${item.active ? 'bg-warning' : 'bg-neutrals800'}`}
                  style={{height: barHeight}}
                />
                {/* Label ngày */}
                <AppText className="text-neutrals500 text-[10px]">
                  {item.day}
                </AppText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

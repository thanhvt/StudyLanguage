import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// Mock data — sẽ thay bằng API thực sau
const MOCK_WEEK = [
  {day: 'T2', minutes: 15, active: true},
  {day: 'T3', minutes: 20, active: true},
  {day: 'T4', minutes: 10, active: true},
  {day: 'T5', minutes: 25, active: true},
  {day: 'T6', minutes: 0, active: false},
  {day: 'T7', minutes: 0, active: false},
  {day: 'CN', minutes: 0, active: false},
];

/**
 * Mục đích: Hiển thị hoạt động tuần dạng dots + phút
 * Tham số đầu vào: không có (dùng mock data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ProfileScreen — sau StatsOverview
 */
export default function WeekActivityDots() {
  const colors = useColors();

  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-4"
      style={{backgroundColor: colors.neutrals900}}>
      <AppText variant="label" className="text-foreground mb-3" raw>
        📈 Tuần này
      </AppText>
      <View className="flex-row justify-between">
        {MOCK_WEEK.map((item, index) => (
          <View key={index} className="items-center flex-1">
            {/* Dot hiển thị trạng thái hoạt động */}
            <View
              className="w-8 h-8 rounded-full items-center justify-center mb-1"
              style={{
                backgroundColor: item.active
                  ? colors.primary
                  : colors.neutrals800,
              }}>
              {item.active && (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </View>
            {/* Tên ngày */}
            <AppText
              variant="caption"
              className="text-neutrals400"
              raw>
              {item.day}
            </AppText>
            {/* Số phút */}
            {item.minutes > 0 && (
              <AppText
                variant="caption"
                className="text-neutrals500 mt-0.5"
                raw>
                {item.minutes}p
              </AppText>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

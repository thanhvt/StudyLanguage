import React from 'react';
import {View} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// Mock data — sẽ thay bằng API thực sau
const MOCK_STATS = {
  streak: 7,
  totalMinutes: 210,
  wordsLearned: 156,
};

/**
 * Mục đích: Hiển thị 3 thẻ thống kê nhanh (Streak, Time, Words)
 * Tham số đầu vào: không có (dùng mock data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ProfileScreen — sau ProfileHeader
 */
export default function StatsOverview() {
  const colors = useColors();

  const stats = [
    {
      icon: 'Flame',
      label: 'Streak',
      value: `${MOCK_STATS.streak} ngày`,
      color: '#EF4444',
    },
    {
      icon: 'Clock',
      label: 'Thời gian',
      value: `${(MOCK_STATS.totalMinutes / 60).toFixed(1)} giờ`,
      color: '#3B82F6',
    },
    {
      icon: 'BookOpen',
      label: 'Từ vựng',
      value: `${MOCK_STATS.wordsLearned}`,
      color: '#10B981',
    },
  ];

  return (
    <View className="flex-row gap-3 px-4">
      {stats.map((stat, index) => (
        <View
          key={index}
          className="flex-1 rounded-2xl p-3 items-center"
          style={{backgroundColor: colors.neutrals900}}>
          <View
            className="w-10 h-10 rounded-full items-center justify-center mb-2"
            style={{backgroundColor: stat.color + '20'}}>
            <Icon
              name={stat.icon as any}
              className="w-5 h-5"
              style={{color: stat.color}}
            />
          </View>
          <AppText variant="heading4" className="text-foreground" raw>
            {stat.value}
          </AppText>
          <AppText variant="caption" className="text-neutrals400 mt-1" raw>
            {stat.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

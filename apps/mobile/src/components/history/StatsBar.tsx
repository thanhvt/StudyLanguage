import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import type {HistoryStats} from '@/services/api/history';

/**
 * Mục đích: Thanh thống kê nhanh hiển thị streak, hôm nay, tuần này
 * Tham số đầu vào:
 *   - stats: HistoryStats | null — dữ liệu thống kê
 *   - loading: boolean — đang tải
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → phía trên danh sách entries
 */

interface StatsBarProps {
  stats: HistoryStats | null;
  loading?: boolean;
}

export function StatsBar({stats, loading}: StatsBarProps) {
  if (loading) {
    return (
      <View className="flex-row mx-4 mb-4 gap-3">
        {[1, 2, 3].map(i => (
          <View
            key={i}
            className="flex-1 bg-card rounded-xl p-3 items-center">
            <View className="w-8 h-8 bg-muted rounded-lg mb-1" />
            <View className="w-12 h-3 bg-muted rounded mt-1" />
          </View>
        ))}
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  const items = [
    {icon: '🔥', value: stats.streak, label: 'Streak'},
    {icon: '📚', value: stats.todayCount, label: 'Hôm nay'},
    {icon: '📈', value: stats.weekCount, label: 'Tuần này'},
  ];

  return (
    <View className="flex-row mx-4 mb-4 gap-3">
      {items.map(item => (
        <View
          key={item.label}
          className="flex-1 bg-card rounded-xl p-3 items-center border border-border/30">
          <AppText className="text-xl">{item.icon}</AppText>
          <AppText className="text-foreground font-sans-bold text-lg mt-1">
            {item.value}
          </AppText>
          <AppText className="text-neutrals400 text-xs mt-0.5">
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

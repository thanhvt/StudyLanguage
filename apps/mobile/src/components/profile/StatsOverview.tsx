import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';

// Mock data — sẽ thay bằng API GET /api/user/stats
const MOCK_STATS = {
  streak: 7,
  totalMinutes: 500,
  totalSessions: 42,
};

/**
 * Mục đích: Hiển thị 3 stat cards ngang (Streak, Phút, Sessions)
 * Tham số đầu vào: không có (dùng mock data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: MoreScreen — sau ProfileHeader
 *
 * Hi-fi ref: ps_profile_overview_v2
 *   - 3 cards ngang: Streak 🔥, Phút ⏱, Sessions 📋
 *   - Card bg: surface #141414, glassBorder rgba
 */
export default function StatsOverview() {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  const stats = [
    {value: MOCK_STATS.streak.toString(), label: 'Streak 🔥'},
    {value: MOCK_STATS.totalMinutes.toString(), label: 'Phút ⏱'},
    {value: MOCK_STATS.totalSessions.toString(), label: 'Sessions 📋'},
  ];

  return (
    <View className="flex-row gap-3 px-4 mt-4">
      {stats.map((stat, index) => (
        <View
          key={index}
          className="flex-1 rounded-[20px] p-4 items-center justify-center"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: isDark ? colors.glassBorder : colors.border,
          }}>
          <AppText
            variant="heading2"
            style={{color: colors.primary}}
            className="font-sans-bold"
            raw>
            {stat.value}
          </AppText>
          <AppText
            variant="caption"
            style={{color: colors.neutrals400}}
            className="mt-1"
            raw>
            {stat.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

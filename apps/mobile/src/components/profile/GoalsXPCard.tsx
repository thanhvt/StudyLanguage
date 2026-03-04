import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';

// Mock data — sẽ thay bằng API GET /api/user/gamification
const MOCK_GOALS = {completed: 8, target: 10};
const MOCK_XP = 1250;

/**
 * Mục đích: Hiển thị 2 card ngang: Mục tiêu (8/10) và XP (1,250)
 * Tham số đầu vào: không có (dùng mock data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: MoreScreen — sau WeekActivityChart
 *
 * Hi-fi ref: ps_profile_overview_v2
 *   - Card bg: surface #141414, glassBorder rgba
 *   - Labels: neutrals400, values: primary/warning
 */
export default function GoalsXPCard() {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  const goalPercent = Math.round(
    (MOCK_GOALS.completed / MOCK_GOALS.target) * 100,
  );

  return (
    <View className="flex-row gap-3 px-4 mt-4">
      {/* Card Mục tiêu */}
      <View
        className="flex-1 rounded-[20px] p-4"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isDark ? colors.glassBorder : colors.border,
        }}>
        <AppText
          variant="caption"
          style={{color: colors.neutrals400}}
          raw>
          Mục tiêu
        </AppText>
        <View className="flex-row items-baseline mt-1">
          <AppText
            variant="heading2"
            style={{color: colors.primary}}
            className="font-sans-bold"
            raw>
            {MOCK_GOALS.completed}/{MOCK_GOALS.target}
          </AppText>
          <AppText
            variant="caption"
            style={{color: colors.neutrals400}}
            className="ml-2"
            raw>
            {goalPercent}%
          </AppText>
        </View>
        <View
          className="mt-3 rounded-full overflow-hidden"
          style={{height: 4, backgroundColor: isDark ? colors.neutrals800 : colors.neutrals600}}>
          <View
            className="rounded-full"
            style={{
              height: 4,
              width: `${goalPercent}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>

      {/* Card XP */}
      <View
        className="flex-1 rounded-[20px] p-4"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isDark ? colors.glassBorder : colors.border,
        }}>
        <View className="flex-row items-center justify-between">
          <AppText
            variant="caption"
            style={{color: colors.neutrals400}}
            raw>
            XP
          </AppText>
          <AppText variant="caption" raw>
            🏆⭐
          </AppText>
        </View>
        <AppText
          variant="heading2"
          style={{color: colors.warning}}
          className="font-sans-bold mt-1"
          raw>
          {MOCK_XP.toLocaleString()}
        </AppText>
        <View
          className="mt-3 rounded-full overflow-hidden"
          style={{height: 4, backgroundColor: isDark ? colors.neutrals800 : colors.neutrals600}}>
          <View
            className="rounded-full"
            style={{
              height: 4,
              width: '65%',
              backgroundColor: colors.warning,
            }}
          />
        </View>
      </View>
    </View>
  );
}

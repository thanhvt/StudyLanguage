import React from 'react';
import {View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useAuthStore} from '@/store/useAuthStore';

/**
 * Mục đích: Widget greeting + streak text + 3 stat pills (theo mockup mới)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần đầu Dashboard HomeScreen
 *   - Greeting dạng inline bold: "Chào buổi sáng, {name}! 👋"
 *   - Streak subtitle: "Chuỗi X ngày liên tiếp 🔥"
 *   - Stats Row: 3 pill cards ngang (Streak, Tổng giờ, Từ mới)
 *   - Animated: stat pills xuất hiện staggered FadeInDown
 */
export default function StreakWidget() {
  const user = useAuthStore(state => state.user);
  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Bạn';

  // TODO: Lấy từ API khi backend ready
  const streak = 12;
  const totalHours = 3.5;
  const newWords = 156;

  /**
   * Mục đích: Xác định lời chào theo giờ trong ngày
   * Tham số đầu vào: không có
   * Tham số đầu ra: string (lời chào)
   * Khi nào sử dụng: Render tiêu đề greeting
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return 'Vẫn đang học';
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Dữ liệu 3 stat pills — dễ mở rộng sau
  const statPills = [
    {label: 'Streak', value: `🔥 ${streak}`, delay: 100},
    {label: 'Tổng giờ', value: `${totalHours}h`, delay: 200},
    {label: 'Từ mới', value: `${newWords}`, delay: 300},
  ];

  return (
    <View className="px-4 pt-safe-offset-4 pb-2">
      {/* Greeting inline */}
      <AppText
        variant={'heading1'}
        className="text-foreground text-[26px] font-sans-bold leading-tight">
        {getGreeting()}, {displayName}! 👋
      </AppText>

      {/* Streak subtitle */}
      <View className="flex-row items-center mt-1">
        <AppText className="text-neutrals400 text-sm">
          Chuỗi{' '}
        </AppText>
        <AppText className="text-warning font-sans-bold text-sm">
          {streak} ngày
        </AppText>
        <AppText className="text-neutrals400 text-sm">
          {' '}liên tiếp 🔥
        </AppText>
      </View>

      {/* Stats Row - 3 pills với staggered animation */}
      <View className="flex-row gap-2 mt-4">
        {statPills.map(pill => (
          <Animated.View
            key={pill.label}
            entering={FadeInDown.delay(pill.delay).duration(400).springify()}
            className="flex-1 bg-neutrals900 rounded-2xl py-3 px-3 items-center border border-neutrals800">
            <AppText className="text-foreground font-sans-bold text-lg">
              {pill.value}
            </AppText>
            <AppText className="text-neutrals400 text-xs mt-1">
              {pill.label}
            </AppText>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

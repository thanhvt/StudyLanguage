import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {useAuthStore} from '@/store/useAuthStore';
import Icon from '@/components/ui/Icon';

/**
 * Mục đích: Widget hiển thị lời chào + số ngày streak học liên tiếp
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần đầu Dashboard HomeScreen
 *   - Hiển thị tên user từ authStore
 *   - Hiển thị streak (hiện tại mock data, sau sẽ lấy từ API)
 */
export default function StreakWidget() {
  const user = useAuthStore(state => state.user);
  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Bạn';

  // TODO: Lấy streak từ API khi backend ready
  const streak = 7;

  /**
   * Mục đích: Xác định lời chào theo giờ trong ngày
   * Tham số đầu vào: không có
   * Tham số đầu ra: string (lời chào)
   * Khi nào sử dụng: Render tiêu đề greeting
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <View className="px-6 pt-safe-offset-6 pb-4">
      {/* Greeting */}
      <AppText className="text-neutrals400 text-base">
        {getGreeting()} 👋
      </AppText>
      <AppText
        variant={'heading1'}
        className="text-2xl font-sans-bold text-foreground mt-1">
        {displayName}
      </AppText>

      {/* Streak card */}
      <View className="flex-row items-center bg-neutrals900 rounded-2xl p-4 mt-4">
        <View className="w-12 h-12 bg-orange-500/20 rounded-full items-center justify-center">
          <AppText className="text-2xl">🔥</AppText>
        </View>
        <View className="ml-3 flex-1">
          <AppText className="text-foreground font-sans-bold text-lg">
            {streak} ngày liên tiếp
          </AppText>
          <AppText className="text-neutrals400 text-sm">
            Tiếp tục phát huy nhé!
          </AppText>
        </View>
        <Icon name="ChevronRight" className="w-5 h-5 text-neutrals500" />
      </View>
    </View>
  );
}

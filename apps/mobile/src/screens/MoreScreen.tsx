import React from 'react';
import {ScrollView, View, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AppText, Icon, MenuList} from '@/components/ui';
import {useDialog} from '@/components/ui/DialogProvider';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsOverview from '@/components/profile/StatsOverview';
import WeekActivityDots from '@/components/profile/WeekActivityDots';
import {usePreferencesSync} from '@/hooks/usePreferencesSync';
import {authService} from '@/services/supabase/auth';
import {useAuthStore} from '@/store/useAuthStore';

/**
 * Mục đích: Màn hình hồ sơ người dùng — hiển thị thông tin + thống kê + settings navigation
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab "Hồ sơ" trong MainTabs (tab cuối cùng)
 *
 * Layout:
 *   1. ProfileHeader: avatar + tên + email
 *   2. StatsOverview: 3 thẻ thống kê (Streak, Time, Words)
 *   3. WeekActivityDots: hoạt động tuần (dots + phút)
 *   4. Settings navigation: Giao diện, Âm thanh, Quyền riêng tư, Về ứng dụng
 *   5. Nút đăng xuất + dialog xác nhận
 */
const MoreScreen = () => {
  const navigation = useNavigation();
  const {showConfirm} = useDialog();

  // Đồng bộ preferences với Supabase
  usePreferencesSync();

  /**
   * Mục đích: Hiện dialog xác nhận đăng xuất
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Đăng xuất"
   */
  const handleLogoutPress = () => {
    showConfirm(
      'Đăng xuất?',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản? Dữ liệu chưa sync sẽ bị mất.',
      async () => {
        try {
          console.log('🚪 [Profile] Đang đăng xuất...');
          await authService.signOut();
          useAuthStore.getState().reset();
          console.log('✅ [Profile] Đã đăng xuất thành công');
        } catch (error) {
          console.error('❌ [Profile] Lỗi đăng xuất:', error);
        }
      },
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* Header: Avatar + Tên + Email */}
      <ProfileHeader />

      {/* Thống kê nhanh */}
      <StatsOverview />

      {/* Hoạt động tuần */}
      <WeekActivityDots />

      {/* Settings Navigation */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Cài đặt
        </AppText>
        <MenuList
          data={[
            {
              icon: () => (
                <Icon name="Palette" className="size-22 text-neutrals100" />
              ),
              title: 'Giao diện',
              onPress: () => navigation.navigate('AppearanceSettings'),
            },
            {
              icon: () => (
                <Icon name="Volume2" className="size-22 text-neutrals100" />
              ),
              title: 'Âm thanh',
              onPress: () => navigation.navigate('AudioSettings'),
            },
            {
              icon: () => (
                <Icon name="Shield" className="size-22 text-neutrals100" />
              ),
              title: 'Quyền riêng tư',
              onPress: () => navigation.navigate('PrivacySettings'),
            },
            {
              icon: () => (
                <Icon name="MessageSquare" className="size-22 text-neutrals100" />
              ),
              title: 'Góp ý',
              onPress: () => navigation.navigate('Feedback' as any),
            },
            {
              icon: () => (
                <Icon name="Info" className="size-22 text-neutrals100" />
              ),
              title: 'Về ứng dụng',
              onPress: () => navigation.navigate('About'),
            },
          ]}
        />
      </View>

      {/* Nút đăng xuất */}
      <View className="px-4 mt-8">
        <Pressable
          onPress={handleLogoutPress}
          className="flex-row items-center justify-center py-4 rounded-2xl border border-red-500/30 active:bg-red-500/10">
          <Icon name="LogOut" className="w-5 h-5 text-red-500 mr-2" />
          <AppText variant="label" className="text-red-500" raw>
            Đăng xuất
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default MoreScreen;

import React from 'react';
import {ScrollView, View, Pressable, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AppText, Icon, MenuList} from '@/components/ui';
import {useDialog} from '@/components/ui/DialogProvider';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsOverview from '@/components/profile/StatsOverview';
import WeekActivityChart from '@/components/profile/WeekActivityDots';
import GoalsXPCard from '@/components/profile/GoalsXPCard';
import {usePreferencesSync} from '@/hooks/usePreferencesSync';
import {authService} from '@/services/supabase/auth';
import {useAuthStore} from '@/store/useAuthStore';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Mục đích: Màn hình hồ sơ người dùng — hiển thị thông tin + thống kê + settings navigation
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab "Hồ sơ" trong MainTabs (tab cuối cùng)
 *
 * Hi-fi ref: ps_profile_overview_v2
 *   1. Header "Hồ sơ" + gear icon
 *   2. ProfileHeader: avatar + tên + badge level
 *   3. StatsOverview: 3 stat cards (Streak, Phút, Sessions)
 *   4. WeekActivityChart: bar chart 7 cột
 *   5. GoalsXPCard: Mục tiêu + XP cards
 *   6. Menu: Giao diện, Âm thanh, Quyền riêng tư, Giới thiệu
 *   7. Nút đăng xuất (duy nhất ở đây theo quyết định)
 */
const MoreScreen = () => {
  const navigation = useNavigation();
  const {showConfirm} = useDialog();
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

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
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Nền gradient emerald — tạo depth như Listening ConfigScreen */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {isDark ? (
          <>
            {/* Dark: emerald tint mạnh — α=40% top, 20% bottom */}
            <LinearGradient
              colors={['#064E3B65', '#05201515', 'transparent', '#10b98130']}
              locations={[0, 0.3, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
          </>
        ) : (
          <>
            {/* Light: warm cream + subtle green tint */}
            <LinearGradient
              colors={['#f0fdf410', 'transparent', '#ecfdf510']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
          </>
        )}
      </View>

    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* Screen Header: "Hồ sơ" + gear + logout */}
      <View className="flex-row items-center justify-between px-4 pt-safe-offset-4 pb-2">
        <AppText variant="heading1" style={{color: colors.foreground}} raw>
          Hồ sơ
        </AppText>
        <View className="flex-row items-center gap-2">
          {/* Nút Settings */}
          <Pressable
            onPress={() => navigation.navigate('AppearanceSettings')}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}
            accessibilityLabel="Cài đặt giao diện"
            accessibilityRole="button">
            <Icon
              name="Settings"
              className="w-5 h-5"
              style={{color: colors.neutrals300}}
            />
          </Pressable>
          {/* Nút Đăng xuất — cạnh gear, tông đỏ nhạt */}
          <Pressable
            onPress={handleLogoutPress}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{
              backgroundColor: colors.error + '10',
              borderWidth: 1,
              borderColor: isDark ? colors.error + '15' : colors.error + '25',
            }}
            accessibilityLabel="Đăng xuất"
            accessibilityRole="button">
            <Icon
              name="LogOut"
              className="w-5 h-5"
              style={{color: colors.error}}
            />
          </Pressable>
        </View>
      </View>

      {/* Profile: Avatar + Tên + Badge Level */}
      <ProfileHeader />

      {/* 3 Stat Cards: Streak, Phút, Sessions */}
      <StatsOverview />

      {/* Bar Chart: Hoạt động tuần này */}
      <WeekActivityChart />

      {/* Mục tiêu + XP Cards */}
      <GoalsXPCard />

      {/* Settings Navigation */}
      <View className="px-4 mt-6">
        <MenuList
          data={[
            {
              icon: () => (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{backgroundColor: colors.primary + '20'}}>
                  <Icon
                    name="Palette"
                    className="w-4 h-4"
                    style={{color: colors.primary}}
                  />
                </View>
              ),
              title: 'Giao diện',
              onPress: () => navigation.navigate('AppearanceSettings'),
            },
            {
              icon: () => (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{backgroundColor: '#6366f1' + '20'}}>
                  <Icon
                    name="Volume2"
                    className="w-4 h-4"
                    style={{color: '#6366f1'}}
                  />
                </View>
              ),
              title: 'Âm thanh',
              onPress: () => navigation.navigate('AudioSettings'),
            },
            {
              icon: () => (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{backgroundColor: '#f43f5e' + '20'}}>
                  <Icon
                    name="Shield"
                    className="w-4 h-4"
                    style={{color: '#f43f5e'}}
                  />
                </View>
              ),
              title: 'Quyền riêng tư',
              onPress: () => navigation.navigate('PrivacySettings'),
            },
            {
              icon: () => (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{backgroundColor: '#3B82F6' + '20'}}>
                  <Icon
                    name="Info"
                    className="w-4 h-4"
                    style={{color: '#3B82F6'}}
                  />
                </View>
              ),
              title: 'Giới thiệu',
              onPress: () => navigation.navigate('About'),
            },
          ]}
        />
      </View>

    </ScrollView>
    </View>
  );
};

export default MoreScreen;

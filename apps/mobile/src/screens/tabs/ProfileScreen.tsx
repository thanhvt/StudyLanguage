import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {AppText, Avatar} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import MenuList from '@/components/ui/MenuList';
import {useAuthStore} from '@/store/useAuthStore';
import {authService} from '@/services/supabase/auth';
import {useNavigation} from '@react-navigation/native';

/**
 * Mục đích: Tab Profile hiển thị thông tin user và các tuỳ chọn
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab thứ 3 trong MainTabs
 *   - Hiển thị avatar, tên, email từ authStore
 *   - Nút Sign Out → reset authStore → RootNavigator chuyển về AuthStack
 */
export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const reset = useAuthStore(state => state.reset);
  const navigation = useNavigation();

  /**
   * Mục đích: Xử lý đăng xuất
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút Sign Out
   */
  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      // Luôn reset store dù signOut thành công hay không
      reset();
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email || 'Guest';
  const displayEmail = user?.email || '';

  return (
    <View className="flex-1 bg-background p-4 pt-safe-offset-4">
      <AppText variant={'heading1'} className="mb-4">
        Hồ sơ
      </AppText>

      {/* Thông tin user */}
      <View className="bg-neutrals1000 flex-row p-4 rounded-3xl mb-4">
        <Avatar text={displayName} size={'xl'} />
        <View className="flex-1 justify-center ml-4">
          <AppText className="text-foreground font-sans-bold text-lg">
            {displayName}
          </AppText>
          <AppText className="text-neutrals500 font-sans-regular text-md">
            {displayEmail}
          </AppText>
        </View>
      </View>

      {/* Menu */}
      <View className="py-2">
        <AppText className="section-title">Cài đặt</AppText>
      </View>
      <MenuList
        data={[
          {
            icon: () => (
              <Icon name="Settings" className="size-22 text-neutrals100" />
            ),
            title: 'Cài đặt chung',
            onPress: () => navigation.navigate('Settings'),
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

      {/* Nút đăng xuất */}
      <View className="mt-6">
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 px-4 bg-red-900/20 rounded-2xl"
          onPress={handleSignOut}>
          <Icon name="LogOut" className="w-5 h-5 text-red-400 mr-2" />
          <AppText className="text-red-400 font-sans-semibold text-base">
            Đăng xuất
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

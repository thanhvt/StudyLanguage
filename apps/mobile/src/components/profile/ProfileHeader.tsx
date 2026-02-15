import React from 'react';
import {View} from 'react-native';
import {AppText, Avatar} from '@/components/ui';
import {useAuthStore} from '@/store/useAuthStore';

/**
 * Mục đích: Hiển thị avatar, tên và email người dùng
 * Tham số đầu vào: không có (lấy từ useAuthStore)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ProfileScreen — phần header đầu tiên
 */
export default function ProfileHeader() {
  const user = useAuthStore(state => state.user);

  // Lấy thông tin từ Supabase user metadata
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Người dùng';
  const email = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <View className="items-center py-6">
      <Avatar
        text={displayName}
        source={avatarUrl ? {uri: avatarUrl} : undefined}
        size="xl"
      />
      <AppText
        variant="heading3"
        className="mt-3 text-foreground"
        raw>
        {displayName}
      </AppText>
      <AppText
        variant="body"
        className="mt-1 text-neutrals400"
        raw>
        {email}
      </AppText>
    </View>
  );
}

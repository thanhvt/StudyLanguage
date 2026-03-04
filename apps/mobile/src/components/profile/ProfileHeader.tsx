import React from 'react';
import {View} from 'react-native';
import {AppText, Avatar} from '@/components/ui';
import {useAuthStore} from '@/store/useAuthStore';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';

/**
 * Mục đích: Hiển thị avatar, tên, badge level (Intermediate - Lv.5)
 * Tham số đầu vào: không có (lấy từ useAuthStore)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: MoreScreen — phần header đầu tiên
 *
 * Hi-fi ref: ps_profile_overview_v2
 *   - Layout row: Avatar bên trái + text bên phải
 *   - Tên 18px semibold, màu foreground
 *   - Badge "Intermediate - Lv.5" pill với primary color
 *   - Card bg: surface #141414, glassBorder rgba
 */
export default function ProfileHeader() {
  const user = useAuthStore(state => state.user);
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // Lấy thông tin từ Supabase user metadata
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Người dùng';
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // TODO: Lấy từ API /api/user/gamification — mock cho MVP
  const level = 'Intermediate';
  const levelNumber = 5;

  return (
    <View
      className="flex-row items-center p-4 mx-4 rounded-[20px]"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: isDark ? colors.glassBorder : colors.border,
      }}>
      <Avatar
        text={displayName}
        source={avatarUrl ? {uri: avatarUrl} : undefined}
        size="xl"
      />
      <View className="flex-1 ml-4 justify-center">
        {/* Tên user — foreground color, rõ ràng dark & light */}
        <AppText
          variant="heading3"
          className="font-sans-semibold"
          style={{color: colors.foreground}}
          raw>
          {displayName}
        </AppText>

        {/* Badge level — pill shape, primary tint */}
        <View
          className="flex-row items-center mt-2 self-start px-3 py-1 rounded-full"
          style={{backgroundColor: colors.primary + '20'}}>
          <AppText
            variant="caption"
            style={{color: colors.primary}}
            className="font-sans-semibold"
            raw>
            {level} · Lv.{levelNumber}
          </AppText>
        </View>
      </View>
    </View>
  );
}

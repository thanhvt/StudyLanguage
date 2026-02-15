import {useEffect, useCallback} from 'react';
import {useAuthStore} from '@/store/useAuthStore';
import {useAppStore, AccentColorId, Theme} from '@/store/useAppStore';
import {supabase} from '@/services/supabase/client';

/**
 * Mục đích: Đồng bộ preferences (theme, accent_color) giữa MMKV local và Supabase
 * Tham số đầu vào: không có
 * Tham số đầu ra: { loadPreferences, savePreferences }
 * Khi nào sử dụng:
 *   - Gọi 1 lần trong ProfileScreen hoặc RootNavigator
 *   - Tương tự web-v1 use-preferences-sync.ts
 *
 * Luồng:
 *   1. User đăng nhập → loadPreferences() → lấy từ DB → apply vào useAppStore
 *   2. User thay đổi theme/accent → savePreferences() → upsert vào DB
 *   3. Table: user_preferences (user_id, theme, accent_color)
 */
export function usePreferencesSync() {
  const user = useAuthStore((state) => state.user);
  const theme = useAppStore((state) => state.theme);
  const accentColor = useAppStore((state) => state.accentColor);
  const setTheme = useAppStore((state) => state.setTheme);
  const setAccentColor = useAppStore((state) => state.setAccentColor);

  /**
   * Mục đích: Tải preferences từ Supabase khi user đăng nhập
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tự động gọi khi user.id thay đổi (đăng nhập)
   */
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const {data, error} = await supabase
        .from('user_preferences')
        .select('theme, accent_color')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Chưa có record → tạo mới với preferences hiện tại
        if (error.code === 'PGRST116') {
          console.log('📝 [PreferencesSync] Tạo preferences mới cho user');
          await supabase.from('user_preferences').insert({
            user_id: user.id,
            theme,
            accent_color: accentColor,
          });
        } else {
          console.error('❌ [PreferencesSync] Lỗi load:', error.message);
        }
        return;
      }

      // Áp dụng preferences từ DB vào local store
      if (data) {
        if (data.theme && data.theme !== theme) {
          console.log('🎨 [PreferencesSync] Sync theme từ DB:', data.theme);
          setTheme(data.theme as Theme);
        }
        if (data.accent_color && data.accent_color !== accentColor) {
          console.log('🎨 [PreferencesSync] Sync accent từ DB:', data.accent_color);
          setAccentColor(data.accent_color as AccentColorId);
        }
      }
    } catch (err) {
      console.error('❌ [PreferencesSync] Lỗi load preferences:', err);
    }
  }, [user, theme, accentColor, setTheme, setAccentColor]);

  /**
   * Mục đích: Lưu preferences lên Supabase khi thay đổi
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tự động gọi khi theme/accentColor thay đổi (debounce 1s)
   */
  const savePreferences = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            theme,
            accent_color: accentColor,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        );
      console.log('✅ [PreferencesSync] Đã lưu preferences lên Supabase');
    } catch (err) {
      console.error('❌ [PreferencesSync] Lỗi save preferences:', err);
    }
  }, [user, theme, accentColor]);

  // Load preferences khi user đăng nhập
  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Save preferences khi thay đổi (debounce 1s)
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      savePreferences();
    }, 1000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, accentColor, user?.id]);

  return {loadPreferences, savePreferences};
}

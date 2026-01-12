'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { createClient } from '@/lib/supabase/client';
import type { AccentColorId } from '@/lib/themes';

/**
 * usePreferencesSync Hook
 *
 * Mục đích: Đồng bộ user preferences (theme, accent_color) giữa localStorage và Supabase
 * Khi nào sử dụng: Gọi 1 lần trong layout hoặc app component
 * 
 * Flow:
 * 1. Khi user đăng nhập → load preferences từ DB → apply vào app
 * 2. Khi user thay đổi theme/accent → save vào DB
 */
export function usePreferencesSync() {
  const { user } = useAuth();
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();
  const supabase = createClient();

  /**
   * Load preferences từ Supabase khi đăng nhập
   */
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme, accent_color')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Nếu chưa có record, tạo mới với preferences hiện tại
        if (error.code === 'PGRST116') {
          await supabase.from('user_preferences').insert({
            user_id: user.id,
            theme,
            accent_color: accentColor,
          });
        }
        return;
      }

      // Áp dụng preferences từ DB
      if (data) {
        if (data.theme && data.theme !== theme) {
          setTheme(data.theme as 'light' | 'dark');
        }
        if (data.accent_color && data.accent_color !== accentColor) {
          setAccentColor(data.accent_color as AccentColorId);
        }
      }
    } catch (err) {
      console.error('Lỗi load preferences:', err);
    }
  }, [user, supabase, theme, accentColor, setTheme, setAccentColor]);

  /**
   * Save preferences lên Supabase khi thay đổi
   */
  const savePreferences = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme,
          accent_color: accentColor,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
    } catch (err) {
      console.error('Lỗi save preferences:', err);
    }
  }, [user, supabase, theme, accentColor]);

  // Load preferences khi user đăng nhập
  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  // Save preferences khi thay đổi (debounce)
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      savePreferences();
    }, 1000); // Debounce 1s

    return () => clearTimeout(timeoutId);
  }, [theme, accentColor, user?.id]);

  return { loadPreferences, savePreferences };
}

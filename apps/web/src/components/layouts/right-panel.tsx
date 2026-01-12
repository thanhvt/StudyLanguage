'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

/**
 * RightPanel - Panel bên phải hiển thị user info và settings
 * 
 * Mục đích: Hiển thị thông tin user, theme switcher, language switcher
 * Tham số đầu vào: Không có props
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được sử dụng trong AppLayout, hiển thị ở desktop (ẩn trên mobile)
 */
export function RightPanel() {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex w-80 border-l glass-card border-border flex-col">
      {/* User Info Section */}
      <div className="p-6 border-b border-border">
        {loading ? (
          <div className="text-center text-muted-foreground">
            {t('auth.loading')}
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {user.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full"
            >
              🚪 {t('auth.logout')}
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            {t('auth.notLoggedIn')}
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">⚙️ {t('settings.theme')}</h3>
          <ThemeSwitcher />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">🌍 {t('settings.language')}</h3>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Tips Section (Optional) */}
      <div className="flex-1 p-6">
        <GlassCard variant="default" hover="none" className="p-4">
          <h4 className="text-sm font-semibold mb-2">💡 {t('tips.title')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('tips.daily') || 'Practice 15 minutes daily for best results!'}
          </p>
        </GlassCard>
      </div>
    </aside>
  );
}

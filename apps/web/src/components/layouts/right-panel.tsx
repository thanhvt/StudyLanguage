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
  const { user, loading, signOut, signInWithGoogle } = useAuth();
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
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.notLoggedIn')}
            </p>
            <Button
              onClick={signInWithGoogle}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
              {t('auth.loginWithGoogle')}
            </Button>
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

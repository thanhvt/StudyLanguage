'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { User, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';



/**
 * RightPanel - Panel bên phải (Redesigned theo reference)
 *
 * Mục đích: Hiển thị user info, theme/language toggles, tips, và stats
 * Layout: Các card riêng biệt xếp dọc với bo góc lớn
 * 
 * Luồng sử dụng: Hiển thị trong app-layout cho màn hình XL+
 */
export function RightPanel() {
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  




  return (
    <aside className="hidden xl:flex w-80 flex-col gap-4 p-4 bg-background/50 backdrop-blur-sm border-l border-border/50">
      {/* User Info Card */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-sm">
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            {t('auth.loading')}
          </div>
        ) : user ? (
          <div className="space-y-3">
            {/* Avatar & Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-md">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {user.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full rounded-lg"
            >
              {t('auth.logout')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Guest Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Khách</h3>
                <p className="text-xs text-muted-foreground">{t('auth.notLoggedIn')}</p>
              </div>
            </div>

            {/* Login Button - Primary style với icon */}
            <Button
              onClick={signInWithGoogle}
              className="w-full rounded-lg gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Đăng nhập
            </Button>
          </div>
        )}
      </div>

      {/* Theme Switcher Card */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Giao diện
        </h3>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {[
            { icon: Sun, label: 'Sáng', value: 'light' as const },
            { icon: Moon, label: 'Tối', value: 'dark' as const },
            { icon: Monitor, label: 'Hệ thống', value: 'system' as const },
          ].map(({ icon: Icon, label, value }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-xs transition-all font-medium',
                theme === value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Switcher Card */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">Ngôn ngữ</h3>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setLanguage('vi')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all',
              language === 'vi'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:bg-muted/80'
            )}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all',
              language === 'en'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:bg-muted/80'
            )}
          >
            🇬🇧 English
          </button>
        </div>
      </div>




    </aside>
  );
}

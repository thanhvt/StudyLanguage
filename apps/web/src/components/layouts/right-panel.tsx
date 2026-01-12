'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { User, Lightbulb, BookOpen, Clock } from 'lucide-react';

/**
 * RightPanel - Panel bên phải (Updated để match reference)
 *
 * Mục đích: Hiển thị user info, settings, tips, và stats
 * Features: Guest/Login section, theme/language, tips, stats counters
 */
export function RightPanel() {
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const { t, language } = useLanguage();

  // Mock stats - có thể fetch từ API sau
  const stats = {
    lessons: 0,
    minutes: 0,
  };

  return (
    <aside className="hidden xl:flex w-80 flex-col panel-enhanced panel-glow-border">
      {/* User Info Section */}
      <div className="p-4 border-b border-border glow-divider relative z-10">
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            {t('auth.loading')}
          </div>
        ) : user ? (
          <div className="space-y-3">
            {/* Avatar & Info với glow effect */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-md avatar-glow">
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
              className="w-full"
            >
              {t('auth.logout')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Guest Avatar với subtle glow */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center avatar-glow">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Khách</h3>
                <p className="text-xs text-muted-foreground">{t('auth.notLoggedIn')}</p>
              </div>
            </div>

            {/* Login Button - Green like reference */}
            <Button
              onClick={signInWithGoogle}
              className="w-full"
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
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập
            </Button>
          </div>
        )}
      </div>

      {/* Settings Section với glow divider */}
      <div className="p-4 space-y-4 border-b border-border glow-divider relative z-10 settings-section-glow">
        {/* Interface Settings Header */}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          ⚙️ Giao diện
        </h3>
        
        {/* Theme Switcher */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t('settings.theme')}</p>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Language Section với glow divider */}
      <div className="p-4 border-b border-border glow-divider relative z-10">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          🌍 Ngôn ngữ
        </h3>
        <LanguageSwitcher />
      </div>

      {/* Tips Section với glow border */}
      <div className="p-4 border-b border-border glow-divider relative z-10 tip-card-glow rounded-xl mx-2 my-2">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Mẹo học tập</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {language === 'vi' 
            ? 'Viết nhật ký bằng tiếng Anh mỗi ngày để rèn luyện tư duy.'
            : 'Write a diary in English every day to train your thinking.'}
        </p>
      </div>

      {/* Stats Section - New! Matching reference */}
      <div className="mt-auto p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          📊 Bài học
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Lessons Counter với neon effect */}
          <div className="rounded-xl p-3 text-center stat-card-neon">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.lessons}</p>
            <p className="text-xs text-muted-foreground">Bài học</p>
          </div>
          
          {/* Minutes Counter với neon effect */}
          <div className="rounded-xl p-3 text-center stat-card-neon">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.minutes}</p>
            <p className="text-xs text-muted-foreground">Phút học</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

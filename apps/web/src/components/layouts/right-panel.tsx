'use client';
import { useMemo } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { User, Lightbulb, BookOpen, Clock, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Learning Tips - Danh sách mẹo học tập
 * 
 * Mục đích: Hiển thị ngẫu nhiên mẹo học tập cho người dùng
 */
const learningTips = [
  {
    vi: 'Luyện nghe mỗi ngày 15 phút để cải thiện khả năng nhận biết âm.',
    en: 'Practice listening 15 minutes daily to improve sound recognition.'
  },
  {
    vi: 'Đừng ngại nói sai - sai lầm là cơ hội để học hỏi!',
    en: "Don't be afraid to make mistakes - they're learning opportunities!"
  },
  {
    vi: 'Đọc to thành tiếng giúp cải thiện cả kỹ năng đọc và phát âm.',
    en: 'Reading aloud improves both reading skills and pronunciation.'
  },
  {
    vi: 'Viết nhật ký bằng tiếng Anh mỗi ngày để rèn luyện tư duy.',
    en: 'Write a diary in English every day to train your thinking.'
  },
];

/**
 * Tính tip index dựa vào ngày trong năm
 * 
 * Mục đích: Đảm bảo server và client render cùng 1 tip dựa vào date,
 *           thay đổi mỗi ngày nhưng nhất quán trong cùng 1 ngày
 * 
 * Tham số: Không có
 * Đầu ra: number - index của tip (0 đến learningTips.length - 1)
 * Luồng: Được gọi bởi RightPanel component khi render
 */
const getDailyTipIndex = (): number => {
  // Sử dụng day of year để chọn tip - đảm bảo consistency giữa server/client
  // trong cùng 1 ngày, và thay đổi mỗi ngày để người dùng thấy tip mới
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % learningTips.length;
};

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
  
  /**
   * Tip Index - Sử dụng daily tip để tránh hydration mismatch
   * 
   * Mục đích: Đảm bảo server và client render cùng 1 tip
   * useMemo đảm bảo không tính lại mỗi lần render
   * 
   * Luồng: getDailyTipIndex() → useMemo cache → currentTip
   */
  const tipIndex = useMemo(() => getDailyTipIndex(), []);
  const currentTip = learningTips[tipIndex];

  // Mock stats - có thể fetch từ API sau
  const stats = {
    lessons: 0,
    minutes: 0,
  };

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

      {/* Learning Tips Card với gradient background nhẹ */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl border border-primary/20 p-4 shadow-sm flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Mẹo học tập</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {language === 'vi' ? currentTip.vi : currentTip.en}
        </p>
        {/* Progress dots */}
        <div className="mt-4 flex gap-1">
          {learningTips.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full flex-1 transition-colors',
                i === tipIndex ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          📊 Thống kê
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Lessons Counter */}
          <div className="rounded-xl bg-muted/30 p-3 text-center border border-border/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.lessons}</p>
            <p className="text-xs text-muted-foreground">Bài học</p>
          </div>

          {/* Minutes Counter */}
          <div className="rounded-xl bg-muted/30 p-3 text-center border border-border/30">
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

'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { THEME_CONFIGS, AccentColorId } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * ThemeSwitcher Component
 *
 * Mục đích: UI để chuyển đổi Light/Dark mode và chọn Accent Color
 * Khi nào sử dụng: Trong Settings page hoặc Header dropdown
 */
export function ThemeSwitcher() {
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme();

  return (
    <Card className="p-4 space-y-4">
      {/* Toggle Light/Dark */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Chế độ giao diện</span>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="min-w-[100px]"
        >
          {theme === 'light' ? '☀️ Sáng' : '🌙 Tối'}
        </Button>
      </div>

      {/* Accent Color Picker */}
      <div className="space-y-2">
        <span className="font-medium">Màu chủ đạo</span>
        <div className="grid grid-cols-3 gap-2">
          {THEME_CONFIGS.map((themeConfig) => (
            <button
              key={themeConfig.id}
              onClick={() => setAccentColor(themeConfig.id as AccentColorId)}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                hover:scale-105 active:scale-95
                ${
                  accentColor === themeConfig.id
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-transparent hover:border-muted-foreground/30'
                }
              `}
              title={themeConfig.description}
            >
              {/* Màu preview */}
              <div className="flex gap-1 mb-1">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: themeConfig.preview.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: themeConfig.preview.accent }}
                />
              </div>
              {/* Tên theme */}
              <span className="text-xs font-medium line-clamp-1">
                {themeConfig.name}
              </span>
              {/* Checkmark nếu đang chọn */}
              {accentColor === themeConfig.id && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

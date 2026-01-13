'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';

/**
 * LanguageSwitcher - Component chuyển đổi ngôn ngữ
 * 
 * Mục đích: Cho phép user chuyển đổi giữa Tiếng Việt và English
 * Khi nào sử dụng: Trong mobile header, sidebar hoặc settings
 * 
 * Note: Đã tối ưu cho mobile với kích thước touch-friendly
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-card p-1.5 rounded-full border border-border shadow-sm">
      <Button
        variant={language === 'vi' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('vi')}
        className={`
          rounded-full px-4 h-9 text-sm font-medium transition-all
          ${language === 'vi' 
            ? 'shadow-md' 
            : 'hover:bg-muted'
          }
        `}
      >
        <span className="mr-1.5">🇻🇳</span>
        <span>Tiếng Việt</span>
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={`
          rounded-full px-4 h-9 text-sm font-medium transition-all
          ${language === 'en' 
            ? 'shadow-md' 
            : 'hover:bg-muted'
          }
        `}
      >
        <span className="mr-1.5">🇬🇧</span>
        <span>English</span>
      </Button>
    </div>
  );
}

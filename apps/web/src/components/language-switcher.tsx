'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border">
      <Button
        variant={language === 'vi' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('vi')}
        className="rounded-full px-3 h-7 text-xs font-medium"
      >
        🇻🇳 VN
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="rounded-full px-3 h-7 text-xs font-medium"
      >
        🇬🇧 EN
      </Button>
    </div>
  );
}

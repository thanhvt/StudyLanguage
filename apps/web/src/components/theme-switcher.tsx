'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { THEME_CONFIGS } from '@/lib/themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  dropUp?: boolean;
}

export function ThemeSwitcher({ dropUp = false }: ThemeSwitcherProps) {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentThemeConfig = THEME_CONFIGS.find(t => t.id === accentColor) || THEME_CONFIGS[0];

  return (
    <div className="space-y-2 relative">
      {/* Row 1: Light/Dark Toggle + Theme Dropdown Trigger */}
      <div className="flex items-center gap-2">
        {/* Light / Dark Toggle - Compact */}
        <div className="flex bg-muted/50 rounded-lg p-0.5">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "px-3 py-1.5 rounded-md transition-[colors,box-shadow] flex items-center gap-1.5",
              (theme === 'light' || theme === 'system')
                ? "bg-background text-amber-500 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Sáng"
          >
            <Sun className="w-8 h-4" />
            {/* <span className="text-xs">Sáng</span> */}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "px-3 py-1.5 rounded-md transition-[colors,box-shadow] flex items-center gap-1.5",
              theme === 'dark'
                ? "bg-background text-indigo-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Tối"
          >
            <Moon className="w-8 h-4" />
            {/* <span className="text-xs">Tối</span> */}
          </button>
        </div>

        {/* Theme Picker Trigger - Compact */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg border bg-card/50 hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div
                className="w-4 h-4 rounded-full border border-background shadow-sm"
                style={{ backgroundColor: currentThemeConfig.preview.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-background shadow-sm"
                style={{ backgroundColor: currentThemeConfig.preview.accent }}
              />
            </div>
            <span className="text-xs font-medium truncate">{currentThemeConfig.name}</span>
          </div>
          {isDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropUp ? 10 : -10 }}
            className={cn(
              "absolute z-50 inset-x-0 p-1 bg-popover border rounded-xl shadow-xl max-h-[250px] overflow-y-auto",
              dropUp ? "bottom-full mb-1" : "top-full mt-1"
            )}
          >
            {THEME_CONFIGS.map((config) => (
              <button
                key={config.id}
                onClick={() => {
                    setAccentColor(config.id);
                    setIsDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                  accentColor === config.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                )}
              >
                 <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                        <div
                        className="w-4 h-4 rounded-full border border-background shadow-sm"
                        style={{ backgroundColor: config.preview.primary }}
                        />
                        <div
                        className="w-4 h-4 rounded-full border border-background shadow-sm"
                        style={{ backgroundColor: config.preview.accent }}
                        />
                    </div>
                    <span className="text-xs font-medium">{config.name}</span>
                 </div>
                 {accentColor === config.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


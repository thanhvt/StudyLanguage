'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  AccentColorId, 
  DEFAULT_THEME, 
  getThemeConfig, 
  themeToCssVariables 
} from '@/lib/themes';

/**
 * Theme Context Interface
 * Chứa các giá trị và hàm để quản lý theme
 */
interface ThemeContextType {
  theme: 'light' | 'dark';
  accentColor: AccentColorId;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: AccentColorId) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Component
 * 
 * Mục đích: Quản lý theme (light/dark) và accent color cho toàn app
 * Tham số: children - React nodes con
 * Khi nào sử dụng: Wrap ở root layout để áp dụng theme cho toàn bộ app
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // State cho Light/Dark mode
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  // State cho Accent Color (6 themes)
  const [accentColor, setAccentColorState] = useState<AccentColorId>(DEFAULT_THEME);
  // Đánh dấu đã mount để tránh hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Đánh dấu đã mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load preferences từ localStorage khi mount
  useEffect(() => {
    if (!mounted) return;
    
    // Lấy theme từ localStorage hoặc system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const savedAccent = localStorage.getItem('accentColor') as AccentColorId | null;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Kiểm tra system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
    
    if (savedAccent) {
      setAccentColorState(savedAccent);
    }
  }, [mounted]);

  // Áp dụng theme lên document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Toggle dark class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Áp dụng accent color CSS variables
    const themeConfig = getThemeConfig(accentColor);
    const cssVars = themeToCssVariables(themeConfig);
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Lưu vào localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
  }, [theme, accentColor, mounted]);

  // Hàm set theme
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Hàm set accent color
  const setAccentColor = (color: AccentColorId) => {
    setAccentColorState(color);
  };

  // Hàm toggle theme
  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Tránh hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        setTheme,
        setAccentColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook để sử dụng theme context
 * 
 * Mục đích: Truy cập theme state và functions từ bất kỳ component nào
 * Tham số: Không có
 * Trả về: ThemeContextType object
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme phải được sử dụng bên trong ThemeProvider');
  }
  return context;
}

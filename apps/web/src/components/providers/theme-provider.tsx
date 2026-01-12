/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
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
 * Helper để đọc giá trị từ localStorage an toàn
 */
function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredAccent(): AccentColorId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('accentColor') as AccentColorId | null;
  return stored || DEFAULT_THEME;
}

/**
 * ThemeProvider Component
 * 
 * Mục đích: Quản lý theme (light/dark) và accent color cho toàn app
 * Tham số: children - React nodes con
 * Khi nào sử dụng: Wrap ở root layout để áp dụng theme cho toàn bộ app
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Khởi tạo state với giá trị mặc định (sẽ được cập nhật sau hydration)
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColorState] = useState<AccentColorId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Load preferences sau khi mount (chỉ chạy 1 lần)
  // Đây là pattern chuẩn cho hydration - setState trong useEffect là cần thiết
  useEffect(() => {
    setMounted(true);
    setThemeState(getStoredTheme());
    setAccentColorState(getStoredAccent());
  }, []);

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
  }, [mounted, theme, accentColor]);

  // Toggle giữa light và dark
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Set theme cụ thể
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  // Set accent color
  const setAccentColor = useCallback((color: AccentColorId) => {
    setAccentColorState(color);
    localStorage.setItem('accentColor', color);
  }, []);

  // Memoize context value
  const value = useMemo(() => ({
    theme,
    accentColor,
    setTheme,
    setAccentColor,
    toggleTheme,
  }), [theme, accentColor, setTheme, setAccentColor, toggleTheme]);

  // Hiển thị placeholder trong khi chờ hydration
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook để sử dụng theme context
 * 
 * Mục đích: Truy cập theme state và functions từ bất kỳ component nào
 * Tham số: Không có
 * Trả về: ThemeContextType object (hoặc defaults nếu ngoài Provider)
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  // Trả về defaults nếu context chưa sẵn sàng (SSR hoặc ngoài Provider)
  if (context === undefined) {
    return {
      theme: 'light',
      accentColor: 'fresh-greens',
      setTheme: () => {},
      toggleTheme: () => {},
      setAccentColor: () => {},
    };
  }
  
  return context;
}

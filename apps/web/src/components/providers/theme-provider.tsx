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
 * Theme Mode Type - Bao gồm 'system' để tự động theo OS
 */
type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme Context Interface
 * Chứa các giá trị và hàm để quản lý theme
 */
interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark'; // Giá trị thực tế sau khi resolve 'system'
  accentColor: AccentColorId;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColorId) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Helper để đọc giá trị từ localStorage an toàn
 */
function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system'; // Default là system
}

/**
 * Helper để resolve theme mode thành light/dark
 */
function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function getStoredAccent(): AccentColorId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('accentColor') as AccentColorId | null;
  return stored || DEFAULT_THEME;
}

/**
 * ThemeProvider Component
 * 
 * Mục đích: Quản lý theme (light/dark/system) và accent color cho toàn app
 * Tham số: children - React nodes con
 * Khi nào sử dụng: Wrap ở root layout để áp dụng theme cho toàn bộ app
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Khởi tạo state với giá trị mặc định (sẽ được cập nhật sau hydration)
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [accentColor, setAccentColorState] = useState<AccentColorId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Resolved theme (actual light/dark)
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  // Load preferences sau khi mount (chỉ chạy 1 lần)
  // Đây là pattern chuẩn cho hydration - setState trong useEffect là cần thiết
  useEffect(() => {
    setMounted(true);
    setThemeState(getStoredTheme());
    setAccentColorState(getStoredAccent());
  }, []);

  // Lắng nghe thay đổi system preference
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Force re-render khi system preference thay đổi
      setThemeState('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Áp dụng theme lên document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const actualTheme = resolveTheme(theme);
    
    // Toggle dark class
    if (actualTheme === 'dark') {
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

  // Toggle giữa light và dark (bỏ qua system khi toggle)
  const toggleTheme = useCallback(() => {
    const current = resolveTheme(theme);
    const newTheme = current === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Set theme cụ thể
  const setTheme = useCallback((newTheme: ThemeMode) => {
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
    resolvedTheme,
    accentColor,
    setTheme,
    setAccentColor,
    toggleTheme,
  }), [theme, resolvedTheme, accentColor, setTheme, setAccentColor, toggleTheme]);

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
      theme: 'system',
      resolvedTheme: 'light',
      accentColor: 'fresh-greens',
      setTheme: () => {},
      toggleTheme: () => {},
      setAccentColor: () => {},
    };
  }
  
  return context;
}

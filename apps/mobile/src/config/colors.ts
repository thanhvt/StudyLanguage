/**
 * Mục đích: Định nghĩa bảng màu cho app theo Design System
 * Tham số đầu vào: không có
 * Tham số đầu ra: AppColors (dark), AppColorsLight (light)
 * Khi nào sử dụng:
 *   - useColors hook (chọn palette theo theme)
 *   - tailwind.config.js (tạo color tokens)
 *   - App.tsx (NavigationContainer theme)
 */

// Bảng màu Dark Mode (mặc định) — Theo UI_Design_System.md
export const AppColors = {
  primary: '#10b981',        // Obsidian Glass emerald
  secondary: '#6366f1',      // Indigo accent
  primaryForeground: '#000000',
  secondaryForeground: '#FFFFFF',
  foreground: '#f5f5f5',     // Hi-fi typography white
  background: '#000000',     // OLED pure black
  surface: '#141414',        // Hi-fi surface
  surfaceRaised: '#1a1a1a',
  success: '#10b981',        // Same as primary
  warning: '#fbbf24',
  error: '#f43f5e',          // Hi-fi rose
  border: '#1e1e1e',         // Hi-fi border
  neutrals100: '#e5e5e5',
  neutrals200: '#d4d4d4',
  neutrals300: '#a3a3a3',
  neutrals400: '#737373',    // Hi-fi secondary text
  neutrals500: '#525252',
  neutrals600: '#404040',
  neutrals700: '#303030',
  neutrals800: '#1e1e1e',    // Hi-fi dividers
  neutrals900: '#141414',    // Hi-fi card bg
  neutrals1000: '#0a0a0a',
  // Skill accent colors
  skillListening: '#6366f1',
  skillSpeaking: '#10b981',
  skillReading: '#fbbf24',
};

// Bảng màu Light Mode — Theo UI_Design_System.md
export const AppColorsLight: typeof AppColors = {
  primary: '#22c55e',
  secondary: '#2D9CDB',
  primaryForeground: '#FFFFFF',
  secondaryForeground: '#FFFFFF',
  foreground: '#171717',
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceRaised: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#e5e5e5',
  neutrals100: '#6c6c6c',
  neutrals200: '#808080',
  neutrals300: '#9e9e9e',
  neutrals400: '#b4b4b4',
  neutrals500: '#c1c1c1',
  neutrals600: '#d3d3d3',
  neutrals700: '#d9d9d9',
  neutrals800: '#dddddd',
  neutrals900: '#f2f2f2',
  neutrals1000: '#f5f5f5',
  // Skill accent colors
  skillListening: '#4F46E5',
  skillSpeaking: '#16A34A',
  skillReading: '#D97706',
};

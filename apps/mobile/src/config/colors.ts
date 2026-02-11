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
  primary: '#4ade80',
  secondary: '#007BFF',
  primaryForeground: '#000000',
  secondaryForeground: '#FFFFFF',
  foreground: '#fafafa',
  background: '#000000', // OLED pure black
  surface: '#0a0a0a',
  surfaceRaised: '#171717',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  border: '#262626',
  neutrals100: '#949494',
  neutrals200: '#858585',
  neutrals300: '#7a7a7a',
  neutrals400: '#6e6e6e',
  neutrals500: '#5e5e5e',
  neutrals600: '#4d4d4d',
  neutrals700: '#414240',
  neutrals800: '#1d1d1d',
  neutrals900: '#1c1c1c',
  neutrals1000: '#111111',
  // Skill accent colors
  skillListening: '#6366F1',
  skillSpeaking: '#4ade80',
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

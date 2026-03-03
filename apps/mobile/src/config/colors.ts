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
  // Glassmorphism tokens — dùng thay vì hardcode rgba
  glassBg: 'rgba(255,255,255,0.04)',         // Nền glass nhẹ
  glassBorder: 'rgba(255,255,255,0.06)',     // Border glass chuẩn
  glassBorderStrong: 'rgba(255,255,255,0.08)', // Border glass đậm hơn
  glassHover: 'rgba(255,255,255,0.03)',      // Hover/expanded state
  glassDivider: 'rgba(255,255,255,0.04)',    // Divider trong glass panel
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
  neutrals100: '#525252',    // Tối hơn — text chính trên nền trắng (7.5:1)
  neutrals200: '#6b7280',    // gray-500 — text phụ (4.6:1)
  neutrals300: '#6b7280',    // gray-500 — subcategory headers (4.6:1) ← was #9e9e9e (2.8:1 FAIL)
  neutrals400: '#9ca3af',    // gray-400 — icons, muted text (2.9:1) ← was #b4b4b4 (1.9:1 FAIL)
  neutrals500: '#6b7280',    // gray-500 — placeholder (4.6:1) ← was #c1c1c1 (1.6:1 FAIL)
  neutrals600: '#d1d5db',    // gray-300 — divider lines
  neutrals700: '#e5e7eb',    // gray-200 — badge bg
  neutrals800: '#f3f4f6',    // gray-100 — divider bg
  neutrals900: '#f9fafb',    // gray-50  — card bg
  neutrals1000: '#f3f4f6',
  // Glassmorphism tokens — light mode dùng rgba đen
  glassBg: 'rgba(0,0,0,0.03)',
  glassBorder: 'rgba(0,0,0,0.08)',
  glassBorderStrong: 'rgba(0,0,0,0.12)',
  glassHover: 'rgba(0,0,0,0.04)',
  glassDivider: 'rgba(0,0,0,0.06)',
  // Skill accent colors
  skillListening: '#4F46E5',
  skillSpeaking: '#16A34A',
  skillReading: '#D97706',
};


/**
 * Theme Configuration - AI Learning App
 * Bộ sưu tập 6 màu Green Nature cho giao diện
 * 
 * Mục đích: Định nghĩa các theme có thể chọn cho người dùng
 * Sử dụng: Import vào ThemeProvider để áp dụng CSS variables
 */

export type AccentColorId =
  | 'fresh-greens'
  | 'leafy-green-garden'
  | 'cool-waters'
  | 'bright-green'
  | 'green-harmony'
  | 'spring-green-harmony';

export interface ThemeConfig {
  id: AccentColorId;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    ring: string;
    sidebarPrimary: string;
  };
  preview: {
    primary: string;
    accent: string;
  };
}

// Danh sách 6 themes theo yêu cầu
export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'fresh-greens',
    name: 'Fresh Greens',
    description: 'Xanh lá tươi mát, năng động',
    colors: {
      primary: '122 39% 49%',
      primaryForeground: '0 0% 100%',
      accent: '66 70% 54%',
      accentForeground: '0 0% 10%',
      ring: '122 39% 49%',
      sidebarPrimary: '122 39% 49%',
    },
    preview: {
      primary: '#4caf50',
      accent: '#cddc39',
    },
  },
  {
    id: 'leafy-green-garden',
    name: 'Leafy Green Garden',
    description: 'Vườn xanh thanh bình',
    colors: {
      primary: '160 84% 39%',
      primaryForeground: '0 0% 100%',
      accent: '174 72% 40%',
      accentForeground: '0 0% 100%',
      ring: '160 84% 39%',
      sidebarPrimary: '160 84% 39%',
    },
    preview: {
      primary: '#10b981',
      accent: '#14b8a6',
    },
  },
  {
    id: 'cool-waters',
    name: 'Cool Waters',
    description: 'Nước biển mát lạnh',
    colors: {
      primary: '207 90% 54%',
      primaryForeground: '0 0% 100%',
      accent: '187 100% 42%',
      accentForeground: '0 0% 10%',
      ring: '207 90% 54%',
      sidebarPrimary: '207 90% 54%',
    },
    preview: {
      primary: '#2196f3',
      accent: '#00bcd4',
    },
  },
  {
    id: 'bright-green',
    name: 'Bright Green',
    description: 'Xanh sáng năng động',
    colors: {
      primary: '84 81% 44%',
      primaryForeground: '0 0% 10%',
      accent: '48 96% 53%',
      accentForeground: '0 0% 10%',
      ring: '84 81% 44%',
      sidebarPrimary: '84 81% 44%',
    },
    preview: {
      primary: '#84cc16',
      accent: '#facc15',
    },
  },
  {
    id: 'green-harmony',
    name: 'Green Harmony',
    description: 'Hài hòa xanh lá',
    colors: {
      primary: '142 71% 45%',
      primaryForeground: '0 0% 100%',
      accent: '160 84% 39%',
      accentForeground: '0 0% 100%',
      ring: '142 71% 45%',
      sidebarPrimary: '142 71% 45%',
    },
    preview: {
      primary: '#22c55e',
      accent: '#10b981',
    },
  },
  {
    id: 'spring-green-harmony',
    name: 'Spring Green Harmony',
    description: 'Mùa xuân tươi trẻ',
    colors: {
      primary: '158 64% 52%',
      primaryForeground: '0 0% 10%',
      accent: '156 72% 67%',
      accentForeground: '0 0% 10%',
      ring: '158 64% 52%',
      sidebarPrimary: '158 64% 52%',
    },
    preview: {
      primary: '#34d399',
      accent: '#6ee7b7',
    },
  },
];

// Theme mặc định
export const DEFAULT_THEME: AccentColorId = 'fresh-greens';

/**
 * Lấy config của theme theo ID
 * @param id - ID của theme cần lấy
 * @returns ThemeConfig hoặc default theme nếu không tìm thấy
 */
export function getThemeConfig(id: AccentColorId): ThemeConfig {
  return THEME_CONFIGS.find((t) => t.id === id) || THEME_CONFIGS[0];
}

/**
 * Chuyển đổi theme config thành CSS variables
 * @param theme - ThemeConfig cần chuyển đổi
 * @returns Object chứa các CSS variable names và values
 */
export function themeToCssVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--primary': theme.colors.primary,
    '--primary-foreground': theme.colors.primaryForeground,
    '--accent': theme.colors.accent,
    '--accent-foreground': theme.colors.accentForeground,
    '--ring': theme.colors.ring,
    '--sidebar-primary': theme.colors.sidebarPrimary,
  };
}

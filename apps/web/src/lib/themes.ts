/**
 * Theme Configuration - AI Learning App
 * Bộ sưu tập 6 màu Green Nature cho giao diện
 * 
 * Mục đích: Định nghĩa các theme có thể chọn cho người dùng
 * Sử dụng: Import vào ThemeProvider để áp dụng CSS variables
 */

export type AccentColorId =
  | 'ocean-scholar'
  | 'sunset-focus'
  | 'royal-purple'
  | 'rose-focus'
  | 'ocean-blue'
  | 'emerald-study';

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

// 6 Vibrant Learning-Focused Themes
export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'ocean-scholar',
    name: 'Ocean Scholar',
    description: 'Teal học thuật, thanh lịch',
    colors: {
      primary: '166 84% 32%',
      primaryForeground: '0 0% 100%',
      accent: '168 78% 56%',
      accentForeground: '0 0% 10%',
      ring: '166 84% 32%',
      sidebarPrimary: '166 84% 32%',
    },
    preview: {
      primary: '#0D9488',
      accent: '#2DD4BF',
    },
  },
  {
    id: 'sunset-focus',
    name: 'Sunset Focus',
    description: 'Cam năng động, tập trung',
    colors: {
      primary: '21 90% 48%',
      primaryForeground: '0 0% 100%',
      accent: '38 92% 50%',
      accentForeground: '0 0% 10%',
      ring: '21 90% 48%',
      sidebarPrimary: '21 90% 48%',
    },
    preview: {
      primary: '#EA580C',
      accent: '#F59E0B',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Tím sang trọng, sáng tạo',
    colors: {
      primary: '263 70% 58%',
      primaryForeground: '0 0% 100%',
      accent: '271 91% 65%',
      accentForeground: '0 0% 100%',
      ring: '263 70% 58%',
      sidebarPrimary: '263 70% 58%',
    },
    preview: {
      primary: '#7C3AED',
      accent: '#A855F7',
    },
  },
  {
    id: 'rose-focus',
    name: 'Rose Focus',
    description: 'Hồng thân thiện, ấm áp',
    colors: {
      primary: '330 81% 60%',
      primaryForeground: '0 0% 100%',
      accent: '330 86% 70%',
      accentForeground: '0 0% 10%',
      ring: '330 81% 60%',
      sidebarPrimary: '330 81% 60%',
    },
    preview: {
      primary: '#EC4899',
      accent: '#F472B6',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Xanh dương cổ điển',
    colors: {
      primary: '221 83% 53%',
      primaryForeground: '0 0% 100%',
      accent: '187 94% 43%',
      accentForeground: '0 0% 10%',
      ring: '221 83% 53%',
      sidebarPrimary: '221 83% 53%',
    },
    preview: {
      primary: '#2563EB',
      accent: '#06B6D4',
    },
  },
  {
    id: 'emerald-study',
    name: 'Emerald Study',
    description: 'Xanh ngọc bích, phát triển',
    colors: {
      primary: '160 84% 39%',
      primaryForeground: '0 0% 100%',
      accent: '84 81% 44%',
      accentForeground: '0 0% 10%',
      ring: '160 84% 39%',
      sidebarPrimary: '160 84% 39%',
    },
    preview: {
      primary: '#10B981',
      accent: '#84CC16',
    },
  },
];

// Theme mặc định
export const DEFAULT_THEME: AccentColorId = 'ocean-scholar';

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

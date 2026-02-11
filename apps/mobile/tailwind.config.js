/**
 * Mục đích: Cấu hình Tailwind CSS cho NativeWind
 * Tham số đầu vào: không có
 * Tham số đầu ra: Tailwind config object
 * Khi nào sử dụng: Metro bundler tự động load khi compile NativeWind CSS
 */
const {AppColors} = require('./src/config/colors');

/**
 * Mục đích: Chuyển camelCase key thành kebab-case cho CSS
 * Tham số đầu vào: key (string) - tên property dạng camelCase
 * Tham số đầu ra: string - tên dạng kebab-case
 * Khi nào sử dụng: Khi generate colorsConfig từ AppColors
 */
function toKebab(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

// Tạo color config từ AppColors, sử dụng CSS variables để hỗ trợ dark mode
const colorsConfig = Object.fromEntries(
  Object.entries(AppColors).map(([k]) => [
    toKebab(k),
    `rgb(var(--color-${toKebab(k)}) / <alpha-value>)`,
  ]),
);

module.exports = {
  darkMode: 'class',
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'sans-thin': ['"SourceSans3-Thin"'],
        'sans-extralight': ['"SourceSans3-ExtraLight"'],
        'sans-light': ['"SourceSans3-Light"'],
        'sans-regular': ['"SourceSans3-Regular"'],
        'sans-medium': ['"SourceSans3-Medium"'],
        'sans-semibold': ['"SourceSans3-SemiBold"'],
        'sans-bold': ['"SourceSans3-Bold"'],
        'sans-extrabold': ['"SourceSans3-ExtraBold"'],
        'sans-black': ['"SourceSans3-Black"'],
      },
      fontSize: {
        xs: 12,
        sm: 13,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
        '5xl': 36,
      },
      // Spacing tokens theo UI_Design_System.md §4.1
      spacing: {
        xs: 4,   // 4px - padding nhỏ
        sm: 8,   // 8px - gap nhỏ
        md: 16,  // 16px - padding chuẩn
        lg: 24,  // 24px - gap lớn
        xl: 32,  // 32px - section spacing
        '2xl': 48, // 48px - page margin lớn
      },
      // Border radius tokens theo UI_Design_System.md §6
      borderRadius: {
        button: 12,  // 12px - buttons
        card: 16,    // 16px - cards
        sheet: 24,   // 24px - bottom sheets
        full: 9999,  // pills, avatars
      },
      colors: colorsConfig,
    },
  },
};

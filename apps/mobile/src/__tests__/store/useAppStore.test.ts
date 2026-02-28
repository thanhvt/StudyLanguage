/**
 * Unit test cho useAppStore — Appearance settings
 *
 * Mục đích: Test theme, accentColor, language (đã loại bỏ fontSize)
 * Ref test cases:
 *   - MOB-AUTH-MVP-HP-002: Onboarding hiện lần đầu
 *   - MOB-AUTH-MVP-EC-001: Onboarding không hiện lại
 *   - MOB-PROF-ENH-HP-001: Theme toggle
 *   - MOB-PROF-ENH-HP-003: Accent color
 *   - MOB-PROF-ENH-HP-004: Language switch
 */

// Mock getDeviceLanguage trước khi import store
jest.mock('@/utils/getDeviceLanguage', () => ({
  getDeviceLanguage: jest.fn().mockReturnValue('en'),
}));

jest.mock('@/config/i18n', () => ({
  LanguageCode: {},
}));

import {useAppStore} from '@/store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      isFirstLaunch: true,
      theme: 'dark',
      accentColor: 'ocean-scholar',
      language: 'en',
    });
  });

  // ============================================================
  // Onboarding
  // ============================================================
  describe('Onboarding', () => {
    it('isFirstLaunch mặc định là true', () => {
      expect(useAppStore.getState().isFirstLaunch).toBe(true);
    });

    it('setIsFirstLaunch(false) → onboarding không hiện lại', () => {
      useAppStore.getState().setIsFirstLaunch(false);
      expect(useAppStore.getState().isFirstLaunch).toBe(false);
    });

    it('setIsFirstLaunch gọi nhiều lần - idempotent', () => {
      useAppStore.getState().setIsFirstLaunch(false);
      useAppStore.getState().setIsFirstLaunch(false);
      expect(useAppStore.getState().isFirstLaunch).toBe(false);
    });
  });

  // ============================================================
  // Theme — Hi-fi: ps_appearance — "Chủ đề" (Sáng/Tối/Tự động)
  // ============================================================
  describe('Theme', () => {
    it('toggleTheme chuyển từ dark → light', () => {
      useAppStore.setState({theme: 'dark'});
      useAppStore.getState().toggleTheme();
      expect(useAppStore.getState().theme).toBe('light');
    });

    it('toggleTheme chuyển từ light → dark', () => {
      useAppStore.setState({theme: 'light'});
      useAppStore.getState().toggleTheme();
      expect(useAppStore.getState().theme).toBe('dark');
    });

    it('setTheme đặt trực tiếp', () => {
      useAppStore.getState().setTheme('light');
      expect(useAppStore.getState().theme).toBe('light');

      useAppStore.getState().setTheme('dark');
      expect(useAppStore.getState().theme).toBe('dark');
    });
  });

  // ============================================================
  // Accent Color — Hi-fi: ps_appearance — "Màu nhấn" (6 colors)
  // ============================================================
  describe('Accent Color', () => {
    it('set accent color = sunset-focus', () => {
      useAppStore.getState().setAccentColor('sunset-focus');
      expect(useAppStore.getState().accentColor).toBe('sunset-focus');
    });

    it('set accent color = royal-purple', () => {
      useAppStore.getState().setAccentColor('royal-purple');
      expect(useAppStore.getState().accentColor).toBe('royal-purple');
    });

    it('set tất cả 6 accent colors', () => {
      const colors = [
        'ocean-scholar', 'sunset-focus', 'royal-purple',
        'rose-focus', 'ocean-blue', 'emerald-study',
      ] as const;

      for (const color of colors) {
        useAppStore.getState().setAccentColor(color);
        expect(useAppStore.getState().accentColor).toBe(color);
      }
    });
  });

  // ============================================================
  // Language — Hi-fi: ps_appearance — "Ngôn ngữ" (Tiếng Việt / English)
  // ============================================================
  describe('Language', () => {
    it('set language = vi', () => {
      useAppStore.getState().setLanguage('vi');
      expect(useAppStore.getState().language).toBe('vi');
    });

    it('set language = en', () => {
      useAppStore.getState().setLanguage('vi');
      useAppStore.getState().setLanguage('en');
      expect(useAppStore.getState().language).toBe('en');
    });
  });

  // ============================================================
  // REMOVED: fontSize — đã loại bỏ theo updated spec
  // ============================================================
  describe('Deprecated fields KHÔNG tồn tại', () => {
    it('fontSize không tồn tại trong store state', () => {
      expect((useAppStore.getState() as any).fontSize).toBeUndefined();
    });

    it('setFontSize không tồn tại trong store', () => {
      expect((useAppStore.getState() as any).setFontSize).toBeUndefined();
    });
  });
});

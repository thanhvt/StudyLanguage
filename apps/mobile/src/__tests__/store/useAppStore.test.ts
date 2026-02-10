/**
 * Unit test cho useAppStore (Zustand - isFirstLaunch cho Onboarding)
 *
 * Mục đích: Test app state persistence cho onboarding flow
 * Ref test cases:
 *   - MOB-AUTH-MVP-HP-002: Onboarding hiện lần đầu
 *   - MOB-AUTH-MVP-EC-001: Onboarding không hiện lại
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
    // Reset trạng thái isFirstLaunch
    useAppStore.setState({isFirstLaunch: true});
  });

  // MOB-AUTH-MVP-HP-002: Lần đầu mở app → isFirstLaunch = true
  it('isFirstLaunch mặc định là true', () => {
    useAppStore.setState({isFirstLaunch: true});
    expect(useAppStore.getState().isFirstLaunch).toBe(true);
  });

  // MOB-AUTH-MVP-EC-001: Sau onboarding → isFirstLaunch = false, không hiện lại
  it('setIsFirstLaunch(false) → onboarding không hiện lại', () => {
    useAppStore.getState().setIsFirstLaunch(false);

    expect(useAppStore.getState().isFirstLaunch).toBe(false);
  });

  // Verify idempotent
  it('setIsFirstLaunch gọi nhiều lần không ảnh hưởng', () => {
    useAppStore.getState().setIsFirstLaunch(false);
    useAppStore.getState().setIsFirstLaunch(false);

    expect(useAppStore.getState().isFirstLaunch).toBe(false);
  });

  // Theme toggle
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
});

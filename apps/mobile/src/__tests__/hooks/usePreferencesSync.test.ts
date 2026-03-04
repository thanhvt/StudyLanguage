/**
 * Unit test cho usePreferencesSync hook
 *
 * Mục đích: Test đồng bộ settings giữa mobile (MMKV) và server (API)
 * Ref: Settings sync implementation plan
 */
import {renderHook, act, waitFor} from '@testing-library/react-native';

// Mock MMKV trước khi import stores
jest.mock('react-native-mmkv', () => {
  const storage = new Map<string, string>();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: string) => storage.set(key, value),
      getString: (key: string) => storage.get(key) ?? null,
      delete: (key: string) => storage.delete(key),
    })),
  };
});

// Mock nativewind colorScheme
jest.mock('nativewind', () => ({
  colorScheme: {
    set: jest.fn(),
  },
}));

// Mock settingsApi
const mockGetSettings = jest.fn();
const mockUpdateSettings = jest.fn();
jest.mock('@/services/api/settings', () => ({
  settingsApi: {
    getSettings: (...args: any[]) => mockGetSettings(...args),
    updateSettings: (...args: any[]) => mockUpdateSettings(...args),
  },
}));

// Mock i18n helper
jest.mock('@/utils/getDeviceLanguage', () => ({
  getDeviceLanguage: () => 'vi',
}));

import {usePreferencesSync} from '@/hooks/usePreferencesSync';
import {useAuthStore} from '@/store/useAuthStore';
import {useAppStore} from '@/store/useAppStore';
import {useSettingsStore} from '@/store/useSettingsStore';

// Mock timer cho debounce
jest.useFakeTimers();

describe('usePreferencesSync', () => {
  // User mẫu cho tests
  const mockUser = {id: 'user-123', email: 'test@test.com'} as any;

  // Settings mẫu từ server
  const serverSettings = {
    theme: 'light' as const,
    accentColor: 'sunset-focus',
    language: 'en',
    audio: {
      backgroundMusic: {enabled: false, volume: 30},
      musicDucking: false,
      soundEffects: false,
      autoPlay: false,
    },
    privacy: {
      saveRecordings: false,
      dataSync: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores về default
    useAuthStore.setState({user: null, session: null});
    useAppStore.setState({
      theme: 'dark',
      accentColor: 'ocean-scholar',
      language: 'vi',
    });
    useSettingsStore.setState({
      audio: {
        backgroundMusic: {enabled: true, volume: 50},
        musicDucking: true,
        soundEffects: true,
        autoPlay: true,
      },
      privacy: {
        saveRecordings: true,
        dataSync: true,
      },
    });
  });

  // ============================================================
  // Load Preferences (Pull từ server)
  // ============================================================
  describe('loadPreferences', () => {
    it('không gọi API khi user = null', async () => {
      const {result} = renderHook(() => usePreferencesSync());

      await act(async () => {
        await result.current.loadPreferences();
      });

      expect(mockGetSettings).not.toHaveBeenCalled();
    });

    it('pull settings từ server khi user đăng nhập', async () => {
      mockGetSettings.mockResolvedValue({
        success: true,
        settings: serverSettings,
        updatedAt: '2026-03-04T00:00:00Z',
      });

      useAuthStore.setState({user: mockUser});

      const {result} = renderHook(() => usePreferencesSync());

      // Đợi effect chạy
      await waitFor(() => {
        expect(mockGetSettings).toHaveBeenCalled();
      });

      // Verify stores đã được cập nhật từ server
      expect(useAppStore.getState().theme).toBe('light');
      expect(useAppStore.getState().accentColor).toBe('sunset-focus');
      expect(useAppStore.getState().language).toBe('en');
      expect(useSettingsStore.getState().audio.backgroundMusic.enabled).toBe(false);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(30);
      expect(useSettingsStore.getState().audio.musicDucking).toBe(false);
      expect(useSettingsStore.getState().privacy.saveRecordings).toBe(false);
    });

    it('push local settings lên server khi server chưa có data', async () => {
      mockGetSettings.mockResolvedValue({
        success: true,
        settings: {},
        updatedAt: null,
      });
      mockUpdateSettings.mockResolvedValue({success: true, message: 'ok'});

      useAuthStore.setState({user: mockUser});

      renderHook(() => usePreferencesSync());

      await waitFor(() => {
        expect(mockGetSettings).toHaveBeenCalled();
      });

      // Phải gọi updateSettings để push local lên server
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalled();
      });

      // Verify payload chứa local settings
      const sentPayload = mockUpdateSettings.mock.calls[0][0];
      expect(sentPayload.theme).toBe('dark');
      expect(sentPayload.accentColor).toBe('ocean-scholar');
      expect(sentPayload.audio.backgroundMusic.enabled).toBe(true);
    });

    it('không crash khi API lỗi', async () => {
      mockGetSettings.mockRejectedValue(new Error('Network error'));

      useAuthStore.setState({user: mockUser});

      // Không throw error
      const {result} = renderHook(() => usePreferencesSync());

      await waitFor(() => {
        expect(mockGetSettings).toHaveBeenCalled();
      });

      // Hook vẫn hoạt động bình thường
      expect(result.current.loadPreferences).toBeDefined();
      expect(result.current.savePreferences).toBeDefined();
    });
  });

  // ============================================================
  // Save Preferences (Push lên server)
  // ============================================================
  describe('savePreferences', () => {
    it('không gọi API khi user = null', async () => {
      const {result} = renderHook(() => usePreferencesSync());

      await act(async () => {
        await result.current.savePreferences();
      });

      expect(mockUpdateSettings).not.toHaveBeenCalled();
    });

    it('gọi updateSettings với toàn bộ settings hiện tại', async () => {
      mockUpdateSettings.mockResolvedValue({success: true, message: 'ok'});

      useAuthStore.setState({user: mockUser});

      const {result} = renderHook(() => usePreferencesSync());

      await act(async () => {
        await result.current.savePreferences();
      });

      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
          accentColor: 'ocean-scholar',
          language: 'vi',
          audio: expect.objectContaining({
            backgroundMusic: {enabled: true, volume: 50},
          }),
          privacy: expect.objectContaining({
            saveRecordings: true,
          }),
        }),
      );
    });

    it('không crash khi save API lỗi', async () => {
      mockUpdateSettings.mockRejectedValue(new Error('Server error'));

      useAuthStore.setState({user: mockUser});

      const {result} = renderHook(() => usePreferencesSync());

      // Không throw
      await act(async () => {
        await result.current.savePreferences();
      });

      expect(mockUpdateSettings).toHaveBeenCalled();
    });
  });

  // ============================================================
  // Return values
  // ============================================================
  describe('Return API', () => {
    it('trả về loadPreferences và savePreferences', () => {
      const {result} = renderHook(() => usePreferencesSync());

      expect(typeof result.current.loadPreferences).toBe('function');
      expect(typeof result.current.savePreferences).toBe('function');
    });
  });
});

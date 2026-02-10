import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import {colorScheme} from 'nativewind';
import {LanguageCode} from '@/config/i18n';
import {getDeviceLanguage} from '@/utils/getDeviceLanguage';

// Loại theme hỗ trợ
export type Theme = 'light' | 'dark';

// Insets an toàn (safe area)
export interface Insets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// ===========================
// MMKV Storage Adapter cho Zustand
// ===========================
const storage = new MMKV();

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: (name) => {
    return storage.getString(name) ?? null;
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

// ===========================
// Interface cho App Store
// ===========================
interface AppState {
  // Trạng thái
  theme: Theme;
  language: LanguageCode;
  insets: Insets;
  isFirstLaunch: boolean;
  isLoading: boolean;

  // Hành động
  setTheme: (theme: Theme) => void;
  setLanguage: (language: LanguageCode) => void;
  setInsets: (insets: Insets) => void;
  setIsFirstLaunch: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  toggleTheme: () => void;
}

/**
 * Mục đích: Store toàn cục quản lý trạng thái ứng dụng (theme, ngôn ngữ, insets, ...)
 * Tham số đầu vào: không có
 * Tham số đầu ra: AppState (trạng thái + hành động)
 * Khi nào sử dụng: Mọi nơi cần đọc/ghi trạng thái app (theme, language, safe area insets)
 *   - App.tsx: đọc theme để render
 *   - SettingsScreen: đọc/ghi theme, language
 *   - InsetsHelper: ghi insets
 *   - useColors: đọc theme
 *   - LanguageHelper: đọc language
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Giá trị mặc định
      theme: 'dark',
      language: getDeviceLanguage(),
      insets: {left: 0, top: 0, right: 0, bottom: 0},
      isFirstLaunch: true,
      isLoading: false,

      // Đặt theme
      setTheme: (theme) => {
        colorScheme.set(theme);
        set({theme});
      },

      // Đặt ngôn ngữ
      setLanguage: (language) => set({language}),

      // Đặt safe area insets
      setInsets: (insets) => set({insets}),

      // Đặt trạng thái lần chạy đầu tiên
      setIsFirstLaunch: (value) => set({isFirstLaunch: value}),

      // Đặt trạng thái loading
      setIsLoading: (value) => set({isLoading: value}),

      // Chuyển đổi theme sáng/tối
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        colorScheme.set(newTheme);
        set({theme: newTheme});
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ lưu trữ các giá trị cần persist, bỏ qua insets (tạm thời)
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        isFirstLaunch: state.isFirstLaunch,
      }),
    },
  ),
);

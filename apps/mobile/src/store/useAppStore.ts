import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import {colorScheme} from 'nativewind';
import {LanguageCode} from '@/config/i18n';
import {getDeviceLanguage} from '@/utils/getDeviceLanguage';

// Loại accent color — đồng bộ với web-v1 themes.ts
export type AccentColorId =
  | 'ocean-scholar'
  | 'sunset-focus'
  | 'royal-purple'
  | 'rose-focus'
  | 'ocean-blue'
  | 'emerald-study';


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
// Đọc theme từ MMKV đồng bộ (sync) — tránh flash dark→light
// ===========================

/**
 * Mục đích: Đọc theme đã lưu từ MMKV một cách đồng bộ (synchronous)
 * Tham số đầu vào: không có
 * Tham số đầu ra: Theme ('light' | 'dark')
 * Khi nào sử dụng: Khởi tạo store — trước render đầu tiên
 *
 * MMKV lưu state dạng JSON: {"state":{"theme":"light",...},"version":0}
 * Đọc sync → zero delay → không còn flash theme sai
 */
function getPersistedTheme(): Theme {
  try {
    const raw = storage.getString('app-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedTheme = parsed?.state?.theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        console.log('🎨 [Store] Đọc theme sync từ MMKV:', savedTheme);
        return savedTheme;
      }
    }
  } catch (e) {
    console.log('⚠️ [Store] Không đọc được theme từ MMKV, dùng dark mặc định');
  }
  return 'dark';
}

// Đọc 1 lần duy nhất khi module load — sync, ~0ms
const initialTheme = getPersistedTheme();

// Đặt colorScheme ngay lập tức — trước render đầu tiên
// Dùng giá trị thực từ MMKV thay vì hardcode 'dark'
colorScheme.set(initialTheme);

// ===========================
// Interface cho App Store
// ===========================
interface AppState {
  // Trạng thái
  theme: Theme;
  accentColor: AccentColorId;
  language: LanguageCode;
  insets: Insets;
  isFirstLaunch: boolean;
  isLoading: boolean;

  // Hành động
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColorId) => void;
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
      // Giá trị mặc định — dùng theme đã đọc sync từ MMKV
      theme: initialTheme,
      accentColor: 'ocean-scholar',
      language: getDeviceLanguage(),
      insets: {left: 0, top: 0, right: 0, bottom: 0},
      isFirstLaunch: true,
      isLoading: false,

      setTheme: (theme) => {
        colorScheme.set(theme);
        set({theme});
      },

      // Đặt accent color
      setAccentColor: (accentColor) => set({accentColor}),

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
        accentColor: state.accentColor,
        language: state.language,
        isFirstLaunch: state.isFirstLaunch,
      }),
      // Đồng bộ NativeWind colorScheme khi store hydrate từ MMKV
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          console.log('🎨 [Store] Hydration hoàn tất — colorScheme:', state.theme);
          colorScheme.set(state.theme);
        }
      },
    },
  ),
);


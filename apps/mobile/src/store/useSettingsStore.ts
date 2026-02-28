import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';

// ===========================
// MMKV Storage Adapter cho Zustand
// ===========================
const settingsStorage = new MMKV({id: 'settings-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    settingsStorage.set(name, value);
  },
  getItem: (name) => {
    return settingsStorage.getString(name) ?? null;
  },
  removeItem: (name) => {
    settingsStorage.delete(name);
  },
};

// ===========================
// Audio Settings Interface
// ===========================
interface AudioSettings {
  backgroundMusic: {enabled: boolean; volume: number};
  musicDucking: boolean;
  soundEffects: boolean;
  autoPlay: boolean;
}

// ===========================
// Privacy Settings Interface
// ===========================
interface PrivacySettings {
  saveRecordings: boolean;
  dataSync: boolean;
}

// ===========================
// Settings Store Interface
// ===========================
interface SettingsState {
  // Trạng thái
  audio: AudioSettings;
  privacy: PrivacySettings;

  // Audio actions
  setBackgroundMusic: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setMusicDucking: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setAutoPlay: (enabled: boolean) => void;

  // Privacy actions
  setSaveRecordings: (enabled: boolean) => void;
  setDataSync: (enabled: boolean) => void;
}

/**
 * Mục đích: Store quản lý cài đặt Audio và Privacy
 * Tham số đầu vào: không có
 * Tham số đầu ra: SettingsState (trạng thái + hành động)
 * Khi nào sử dụng:
 *   - AudioSettingsScreen: đọc/ghi cài đặt audio
 *   - PrivacySettingsScreen: đọc/ghi cài đặt privacy
 *   - Listening module: đọc autoPlay
 *   - Speaking module: đọc saveRecordings
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Giá trị mặc định audio
      audio: {
        backgroundMusic: {enabled: true, volume: 50},
        musicDucking: true,
        soundEffects: true,
        autoPlay: true,
      },

      // Giá trị mặc định privacy
      privacy: {
        saveRecordings: true,
        dataSync: true,
      },

      // === Audio actions ===

      // Bật/tắt nhạc nền
      setBackgroundMusic: (enabled) =>
        set((state) => ({
          audio: {
            ...state.audio,
            backgroundMusic: {...state.audio.backgroundMusic, enabled},
          },
        })),

      // Chỉnh âm lượng nhạc nền (0-100) — clamp để không lưu giá trị ngoài biên
      setMusicVolume: (volume) =>
        set((state) => ({
          audio: {
            ...state.audio,
            backgroundMusic: {
              ...state.audio.backgroundMusic,
              volume: Math.max(0, Math.min(100, volume)),
            },
          },
        })),

      // Bật/tắt smart ducking (tự giảm nhạc khi lesson audio phát)
      setMusicDucking: (musicDucking) =>
        set((state) => ({audio: {...state.audio, musicDucking}})),

      // Bật/tắt hiệu ứng âm thanh
      setSoundEffects: (soundEffects) =>
        set((state) => ({audio: {...state.audio, soundEffects}})),

      // Bật/tắt tự động phát câu tiếp theo
      setAutoPlay: (autoPlay) =>
        set((state) => ({audio: {...state.audio, autoPlay}})),

      // === Privacy actions ===

      // Bật/tắt lưu bản ghi âm
      setSaveRecordings: (saveRecordings) =>
        set((state) => ({privacy: {...state.privacy, saveRecordings}})),

      // Bật/tắt đồng bộ dữ liệu
      setDataSync: (dataSync) =>
        set((state) => ({privacy: {...state.privacy, dataSync}})),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

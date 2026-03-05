/**
 * useRadioStore — Zustand store cho Radio Mode (persist MMKV)
 *
 * Mục đích: Lưu trạng thái Radio: playlist hiện tại, track index, progress, preferences
 * Tham số đầu vào: không (Zustand auto-inject)
 * Tham số đầu ra: RadioState & RadioActions
 * Khi nào sử dụng:
 *   - RadioScreen: đọc/ghi currentPlaylist, currentTrackIndex
 *   - NowPlayingBar: đọc track hiện tại
 *   - ConfigScreen: đọc preferredCategories
 *   - useRadioPlayer hook: gọi actions khi phát nhạc
 */
import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import type {RadioPlaylistResult, RadioPlaylistItem} from '@/services/api/radio';

// ===========================
// MMKV Storage Adapter — persist radio state (nhanh ~30x so với AsyncStorage)
// ===========================
const radioStorage = new MMKV({id: 'radio-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    radioStorage.set(name, value);
  },
  getItem: (name) => {
    return radioStorage.getString(name) ?? null;
  },
  removeItem: (name) => {
    radioStorage.delete(name);
  },
};

// =======================
// State types
// =======================

/** Chế độ lặp lại */
export type RepeatMode = 'off' | 'all' | 'one';

/** Trạng thái Radio */
export type RadioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended';

interface RadioState {
  /** Playlist đang phát (hoặc vừa phát xong) */
  currentPlaylist: RadioPlaylistResult | null;
  /** Index track đang phát (-1 = chưa phát) */
  currentTrackIndex: number;
  /** Trạng thái phát */
  playbackState: RadioPlaybackState;
  /** Đang sinh audio cho track */
  isGeneratingAudio: boolean;
  /** Sleep timer (phút, 0 = tắt) */
  sleepTimerMinutes: number;
  /** Thời điểm sleep timer kết thúc (epoch ms, 0 = tắt) */
  sleepTimerEndAt: number;
  /** Tốc độ phát (0.5 - 2.0) */
  playbackSpeed: number;
  /** Shuffle mode */
  shuffle: boolean;
  /** Repeat mode */
  repeat: RepeatMode;
  /** Categories ưa thích */
  preferredCategories: string[];
  /** Lịch sử track index → progress (seconds) */
  trackProgress: Record<string, number>;
  /** Tổng thời gian đã nghe (giây) */
  totalListenedSeconds: number;
  /** Số ngày liên tiếp nghe radio */
  streak: number;
  /** Ngày cuối cùng nghe (ISO date string) */
  lastListenedDate: string | null;
}

interface RadioActions {
  /** Set playlist đang phát */
  setCurrentPlaylist: (playlist: RadioPlaylistResult | null) => void;
  /** Set index track đang phát */
  setCurrentTrackIndex: (index: number) => void;
  /** Set trạng thái phát */
  setPlaybackState: (state: RadioPlaybackState) => void;
  /** Set đang sinh audio */
  setGeneratingAudio: (value: boolean) => void;
  /** Set sleep timer */
  setSleepTimer: (minutes: number) => void;
  /** Hủy sleep timer */
  clearSleepTimer: () => void;
  /** Set tốc độ phát */
  setPlaybackSpeed: (speed: number) => void;
  /** Toggle shuffle */
  toggleShuffle: () => void;
  /** Cycle repeat mode: off → all → one → off */
  cycleRepeat: () => void;
  /** Set categories ưa thích */
  setPreferredCategories: (cats: string[]) => void;
  /** Cập nhật progress cho track hiện tại */
  updateTrackProgress: (trackId: string, seconds: number) => void;
  /** Tăng tổng thời gian nghe */
  addListenedTime: (seconds: number) => void;
  /** Cập nhật streak */
  checkAndUpdateStreak: () => void;
  /** Lấy track hiện tại */
  getCurrentTrack: () => RadioPlaylistItem | null;
  /** Skip sang track tiếp theo */
  nextTrack: () => number;
  /** Quay lại track trước */
  previousTrack: () => number;
  /** Reset về trạng thái ban đầu */
  reset: () => void;
}

const initialState: RadioState = {
  currentPlaylist: null,
  currentTrackIndex: -1,
  playbackState: 'idle',
  isGeneratingAudio: false,
  sleepTimerMinutes: 0,
  sleepTimerEndAt: 0,
  playbackSpeed: 1,
  shuffle: false,
  repeat: 'off',
  preferredCategories: [],
  trackProgress: {},
  totalListenedSeconds: 0,
  streak: 0,
  lastListenedDate: null,
};

/**
 * Mục đích: Zustand store cho Radio Mode — persist MMKV
 * Khi nào sử dụng:
 *   - RadioScreen: quản lý playlist, track state
 *   - NowPlayingBar: hiển thị track đang phát
 *   - useRadioPlayer: điều khiển phát nhạc
 *   - ConfigScreen: đọc preferred categories
 */
export const useRadioStore = create<RadioState & RadioActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentPlaylist: playlist => set({currentPlaylist: playlist}),
      setCurrentTrackIndex: index => set({currentTrackIndex: Math.max(-1, index)}),
      setPlaybackState: state => set({playbackState: state}),
      setGeneratingAudio: value => set({isGeneratingAudio: value}),

      setSleepTimer: minutes => {
        const endAt = minutes > 0 ? Date.now() + minutes * 60 * 1000 : 0;
        set({sleepTimerMinutes: minutes, sleepTimerEndAt: endAt});
      },
      clearSleepTimer: () => set({sleepTimerMinutes: 0, sleepTimerEndAt: 0}),

      setPlaybackSpeed: speed => set({
        playbackSpeed: Math.max(0.5, Math.min(2.0, speed)),
      }),

      toggleShuffle: () => set(s => ({shuffle: !s.shuffle})),

      cycleRepeat: () =>
        set(s => {
          const next: Record<RepeatMode, RepeatMode> = {
            off: 'all',
            all: 'one',
            one: 'off',
          };
          return {repeat: next[s.repeat]};
        }),

      setPreferredCategories: cats => set({preferredCategories: cats}),

      updateTrackProgress: (trackId, seconds) =>
        set(s => ({
          trackProgress: {...s.trackProgress, [trackId]: seconds},
        })),

      addListenedTime: seconds =>
        set(s => ({totalListenedSeconds: s.totalListenedSeconds + seconds})),

      checkAndUpdateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const {lastListenedDate, streak} = get();
        if (lastListenedDate === today) {
          // Đã ghi nhận hôm nay rồi
          return;
        }
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastListenedDate === yesterday) {
          // Liên tiếp → tăng streak
          set({streak: streak + 1, lastListenedDate: today});
        } else {
          // Đứt mạch → reset về 1
          set({streak: 1, lastListenedDate: today});
        }
      },

      getCurrentTrack: () => {
        const {currentPlaylist, currentTrackIndex} = get();
        if (!currentPlaylist || currentTrackIndex < 0) {return null;}
        return currentPlaylist.items[currentTrackIndex] ?? null;
      },

      nextTrack: () => {
        const {currentPlaylist, currentTrackIndex, shuffle, repeat} = get();
        if (!currentPlaylist) {return -1;}
        const total = currentPlaylist.items.length;

        if (shuffle) {
          // Random track khác track hiện tại
          let next = Math.floor(Math.random() * total);
          if (total > 1) {
            while (next === currentTrackIndex) {
              next = Math.floor(Math.random() * total);
            }
          }
          set({currentTrackIndex: next});
          return next;
        }

        if (repeat === 'one') {
          // Lặp lại track hiện tại
          return currentTrackIndex;
        }

        let next = currentTrackIndex + 1;
        if (next >= total) {
          if (repeat === 'all') {
            next = 0; // Quay lại đầu
          } else {
            return -1; // Hết playlist
          }
        }
        set({currentTrackIndex: next});
        return next;
      },

      previousTrack: () => {
        const {currentPlaylist, currentTrackIndex} = get();
        if (!currentPlaylist || currentTrackIndex <= 0) {return 0;}
        const prev = currentTrackIndex - 1;
        set({currentTrackIndex: prev});
        return prev;
      },

      reset: () => set({
        currentPlaylist: null,
        currentTrackIndex: -1,
        playbackState: 'idle',
        isGeneratingAudio: false,
        sleepTimerMinutes: 0,
        sleepTimerEndAt: 0,
      }),
    }),
    {
      name: 'radio-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ persist các preference lâu dài, không persist playlist/playback state
      partialize: state => ({
        playbackSpeed: state.playbackSpeed,
        preferredCategories: state.preferredCategories,
        totalListenedSeconds: state.totalListenedSeconds,
        streak: state.streak,
        lastListenedDate: state.lastListenedDate,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
    },
  ),
);

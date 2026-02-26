import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';

// ===========================
// MMKV Storage Adapter cho Zustand — thay thế AsyncStorage (nhanh hơn ~30x)
// ===========================
const audioPlayerStorage = new MMKV({id: 'audio-player-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    audioPlayerStorage.set(name, value);
  },
  getItem: (name) => {
    return audioPlayerStorage.getString(name) ?? null;
  },
  removeItem: (name) => {
    audioPlayerStorage.delete(name);
  },
};
import type {ConversationTimestamp, ConversationResult} from '@/services/api/listening';

// =======================
// Kiểu dữ liệu cho player mode
// =======================

/** Chế độ hiển thị player */
export type PlayerMode = 'full' | 'compact' | 'minimized' | 'hidden';

/** Thông tin session audio đang phát / gần nhất */
export interface AudioSession {
  /** URL audio */
  audioUrl: string;
  /** Tiêu đề bài nghe */
  title: string;
  /** Vị trí phát cuối cùng (giây) */
  lastPosition: number;
  /** Tổng thời lượng (giây) */
  duration: number;
  /** Timestamps cho transcript sync */
  timestamps: ConversationTimestamp[];
  /** Thời điểm lưu session (ISO string) */
  savedAt: string;
  /** Topic/Scenario đã chọn */
  topic: string;
  /** Dữ liệu conversation để restore khi tiếp tục nghe */
  conversationData?: ConversationResult;
}

// =======================
// Audio Player State
// =======================

interface AudioPlayerState {
  /** Chế độ hiển thị player hiện tại */
  playerMode: PlayerMode;
  /** Tốc độ phát (persist qua lần mở app tiếp) */
  playbackSpeed: number;
  /** Âm lượng (0-1, persist) */
  volume: number;
  /** Session audio gần nhất — cho session restoration */
  lastSession: AudioSession | null;
  /** Đang phát audio hay không (runtime, KHÔNG persist) */
  isPlaying: boolean;
}

interface AudioPlayerActions {
  /** Set chế độ player (full → compact → minimized → hidden) */
  setPlayerMode: (mode: PlayerMode) => void;
  /** Set tốc độ phát (được persist) */
  setPlaybackSpeed: (speed: number) => void;
  /** Set âm lượng (được persist) */
  setVolume: (volume: number) => void;
  /** Lưu session hiện tại để restore sau */
  saveSession: (session: AudioSession) => void;
  /** Xóa session đã lưu */
  clearSession: () => void;
  /** Set trạng thái đang phát */
  setIsPlaying: (value: boolean) => void;
  /** Reset player về hidden + clear session */
  resetPlayer: () => void;
}

const initialState: AudioPlayerState = {
  playerMode: 'hidden',
  playbackSpeed: 1,
  volume: 1,
  lastSession: null,
  isPlaying: false,
};

/**
 * Mục đích: Zustand store LƯU TRỮ trạng thái audio player xuyên suốt app
 * Tham số đầu vào: không (global store)
 * Tham số đầu ra: state + actions
 * Khi nào sử dụng:
 *   - CompactPlayer / MinimizedPlayer: đọc playerMode, isPlaying, lastSession
 *   - PlayerScreen: đọc/ghi playbackSpeed, volume; gọi saveSession khi có audio
 *   - ConfigScreen: đọc lastSession để hiện "Tiếp tục nghe" button
 *   - MainStack: đọc playerMode để quyết định render Compact/Minimized
 *   - PERSIST: playbackSpeed, volume, lastSession được lưu qua MMKV
 * KHÔNG PERSIST: playerMode, isPlaying (runtime-only)
 */
export const useAudioPlayerStore = create<
  AudioPlayerState & AudioPlayerActions
>()(
  persist(
    set => ({
      ...initialState,

      setPlayerMode: mode => set({playerMode: mode}),

      // EC-M04 fix: Clamp speed trong [0.25, 4.0]
      setPlaybackSpeed: speed => set({playbackSpeed: Math.max(0.25, Math.min(4.0, speed))}),

      setVolume: volume => set({volume: Math.max(0, Math.min(1, volume))}),

      saveSession: session => set({lastSession: session}),

      clearSession: () => set({lastSession: null}),

      setIsPlaying: value => set({isPlaying: value}),

      resetPlayer: () =>
        set({
          playerMode: 'hidden',
          isPlaying: false,
          lastSession: null,
        }),
    }),
    {
      name: 'audio-player-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ persist các field cần thiết — runtime state không persist
      partialize: state => ({
        playbackSpeed: state.playbackSpeed,
        volume: state.volume,
        lastSession: state.lastSession,
      }),
    },
  ),
);

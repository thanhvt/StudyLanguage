import {create} from 'zustand';
import type {
  ListeningConfig,
  ConversationResult,
} from '@/services/api/listening';

// =======================
// Listening Store State
// =======================

interface ListeningState {
  /** Cấu hình bài nghe hiện tại */
  config: ListeningConfig;
  /** Kết quả conversation từ API */
  conversation: ConversationResult | null;
  /** Đang generate */
  isGenerating: boolean;
  /** Trạng thái phát audio */
  isPlaying: boolean;
  /** Vị trí transcript hiện tại (index của exchange đang phát) */
  currentExchangeIndex: number;
  /** Tốc độ phát */
  playbackSpeed: number;
}

interface ListeningActions {
  /** Cập nhật config */
  setConfig: (config: Partial<ListeningConfig>) => void;
  /** Set kết quả conversation */
  setConversation: (result: ConversationResult | null) => void;
  /** Set trạng thái generating */
  setGenerating: (value: boolean) => void;
  /** Toggle play/pause */
  togglePlaying: () => void;
  /** Set đang phát hay không */
  setPlaying: (value: boolean) => void;
  /** Set exchange index hiện tại */
  setCurrentExchangeIndex: (index: number) => void;
  /** Đổi tốc độ phát */
  setPlaybackSpeed: (speed: number) => void;
  /** Reset về trạng thái ban đầu */
  reset: () => void;
}

const initialState: ListeningState = {
  config: {
    topic: '',
    durationMinutes: 5,
    level: 'intermediate',
    includeVietnamese: true,
  },
  conversation: null,
  isGenerating: false,
  isPlaying: false,
  currentExchangeIndex: 0,
  playbackSpeed: 1,
};

/**
 * Mục đích: Zustand store cho Listening module
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - PlayerScreen: đọc conversation, điều khiển playback
 *   - QuickActions: reset khi bắt đầu bài mới
 */
export const useListeningStore = create<ListeningState & ListeningActions>(
  set => ({
    ...initialState,

    setConfig: config =>
      set(state => ({
        config: {...state.config, ...config},
      })),

    setConversation: result => set({conversation: result}),
    setGenerating: value => set({isGenerating: value}),
    togglePlaying: () => set(state => ({isPlaying: !state.isPlaying})),
    setPlaying: value => set({isPlaying: value}),
    setCurrentExchangeIndex: index => set({currentExchangeIndex: index}),
    setPlaybackSpeed: speed => set({playbackSpeed: speed}),
    reset: () => set(initialState),
  }),
);

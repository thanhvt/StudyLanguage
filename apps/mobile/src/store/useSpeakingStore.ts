import {create} from 'zustand';
import type {
  SpeakingConfig,
  Sentence,
  FeedbackResult,
} from '@/services/api/speaking';

// =======================
// Speaking Store State
// =======================

interface SpeakingState {
  /** Cấu hình luyện nói */
  config: SpeakingConfig;
  /** Danh sách câu practice */
  sentences: Sentence[];
  /** Index câu hiện tại (0-based) */
  currentIndex: number;
  /** Đang ghi âm */
  isRecording: boolean;
  /** Thời gian ghi đã trôi (seconds) */
  recordingDuration: number;
  /** URI file audio ghi được */
  audioUri: string | null;
  /** Kết quả feedback từ AI */
  feedback: FeedbackResult | null;
  /** Đang chờ AI đánh giá */
  isFeedbackLoading: boolean;
  /** Đang sinh câu practice */
  isGenerating: boolean;
  /** Đang transcribe audio */
  isTranscribing: boolean;
  /** Lỗi (nếu có) */
  error: string | null;
}

interface SpeakingActions {
  /** Cập nhật config */
  setConfig: (config: Partial<SpeakingConfig>) => void;
  /** Set danh sách câu */
  setSentences: (sentences: Sentence[]) => void;
  /** Chuyển sang câu tiếp theo */
  nextSentence: () => void;
  /** Quay lại câu trước */
  prevSentence: () => void;
  /** Set câu hiện tại theo index */
  setCurrentIndex: (index: number) => void;
  /** Bắt đầu ghi âm */
  startRecording: () => void;
  /** Dừng ghi âm + lưu URI */
  stopRecording: (audioUri: string) => void;
  /** Cập nhật thời gian ghi */
  setRecordingDuration: (seconds: number) => void;
  /** Set kết quả feedback */
  setFeedback: (result: FeedbackResult | null) => void;
  /** Set loading feedback */
  setFeedbackLoading: (value: boolean) => void;
  /** Set trạng thái generating */
  setGenerating: (value: boolean) => void;
  /** Set trạng thái transcribing */
  setTranscribing: (value: boolean) => void;
  /** Set lỗi */
  setError: (error: string | null) => void;
  /** Xóa recording state (retry) */
  clearRecording: () => void;
  /** Reset toàn bộ store */
  reset: () => void;
}

const initialState: SpeakingState = {
  config: {
    topic: '',
    level: 'intermediate',
  },
  sentences: [],
  currentIndex: 0,
  isRecording: false,
  recordingDuration: 0,
  audioUri: null,
  feedback: null,
  isFeedbackLoading: false,
  isGenerating: false,
  isTranscribing: false,
  error: null,
};

/**
 * Mục đích: Zustand store cho Speaking module
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - PracticeScreen: quản lý recording, navigate sentences
 *   - FeedbackScreen: đọc feedback, retry/next
 *   - QuickActions: reset khi bắt đầu session mới
 */
export const useSpeakingStore = create<SpeakingState & SpeakingActions>(
  set => ({
    ...initialState,

    setConfig: config =>
      set(state => ({
        config: {...state.config, ...config},
      })),

    setSentences: sentences => set({sentences, currentIndex: 0, feedback: null}),

    nextSentence: () =>
      set(state => ({
        currentIndex: Math.min(state.currentIndex + 1, state.sentences.length - 1),
        feedback: null,
        audioUri: null,
        recordingDuration: 0,
      })),

    prevSentence: () =>
      set(state => ({
        currentIndex: Math.max(state.currentIndex - 1, 0),
        feedback: null,
        audioUri: null,
        recordingDuration: 0,
      })),

    setCurrentIndex: index =>
      set({currentIndex: index, feedback: null, audioUri: null, recordingDuration: 0}),

    startRecording: () =>
      set({isRecording: true, recordingDuration: 0, audioUri: null, feedback: null, error: null}),

    stopRecording: audioUri =>
      set({isRecording: false, audioUri}),

    setRecordingDuration: seconds => set({recordingDuration: seconds}),

    setFeedback: result => set({feedback: result, isFeedbackLoading: false, error: null}),
    setFeedbackLoading: value => set({isFeedbackLoading: value}),
    setGenerating: value => set({isGenerating: value}),
    setTranscribing: value => set({isTranscribing: value}),
    setError: error => set({error}),

    clearRecording: () =>
      set({audioUri: null, recordingDuration: 0, isRecording: false, feedback: null}),

    reset: () => set(initialState),
  }),
);

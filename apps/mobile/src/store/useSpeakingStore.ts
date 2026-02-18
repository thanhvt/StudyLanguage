import {create} from 'zustand';
import type {
  SpeakingConfig,
  Sentence,
  FeedbackResult,
} from '@/services/api/speaking';
import type {ChatMessage} from '@/components/speaking/ChatBubble';

// =======================
// Coach Types
// =======================

/** Cấu hình Conversation Coach mode */
export interface CoachSetup {
  /** Chủ đề hội thoại */
  topic: string;
  /** Thời lượng session (phút) */
  durationMinutes: number;
  /** Mức độ sửa lỗi */
  feedbackMode: 'beginner' | 'intermediate' | 'advanced';
}

/** Trạng thái 1 coach session */
export interface CoachSession {
  /** Cấu hình setup ban đầu */
  setup: CoachSetup;
  /** Danh sách tin nhắn */
  messages: ChatMessage[];
  /** Thời gian còn lại (seconds) */
  remainingSeconds: number;
  /** Chế độ input: voice hoặc text */
  inputMode: 'voice' | 'text';
  /** Đang chờ AI trả lời */
  isAIResponding: boolean;
  /** Session đã kết thúc */
  isEnded: boolean;
}

// =======================
// Speaking Store State
// =======================

/** Cài đặt TTS cho Speaking */
export interface TtsSettings {
  /** Provider TTS: OpenAI hoặc Azure */
  provider: 'openai' | 'azure';
  /** ID giọng đọc */
  voiceId: string;
  /** Tốc độ đọc (0.5 → 2.0) */
  speed: number;
}

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

  // ===== TTS Settings =====
  /** Cài đặt TTS provider + voice + speed */
  ttsSettings: TtsSettings;

  // ===== Coach Mode State =====
  /** Coach session hiện tại (null nếu chưa bắt đầu) */
  coachSession: CoachSession | null;
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

  // ===== Coach Mode Actions =====
  /** Bắt đầu coach session mới */
  startCoachSession: (setup: CoachSetup) => void;
  /** Thêm 1 message vào hội thoại */
  addCoachMessage: (message: ChatMessage) => void;
  /** Chuyển chế độ input (voice/text) */
  setCoachInputMode: (mode: 'voice' | 'text') => void;
  /** Giảm timer 1 giây */
  tickCoachTimer: () => void;
  /** Set AI đang trả lời */
  setCoachAIResponding: (value: boolean) => void;
  /** Kết thúc coach session */
  endCoachSession: () => void;
  /** Reset coach session */
  resetCoach: () => void;

  // ===== TTS Settings Actions =====
  /** Cập nhật TTS settings (merge partial) */
  setTtsSettings: (settings: Partial<TtsSettings>) => void;
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
  ttsSettings: {
    provider: 'openai',
    voiceId: 'alloy',
    speed: 1.0,
  },
  coachSession: null,
};

/**
 * Mục đích: Zustand store cho Speaking module (Practice + Coach Mode)
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - PracticeScreen: quản lý recording, navigate sentences
 *   - FeedbackScreen: đọc feedback, retry/next
 *   - CoachSetupScreen: tạo coach session
 *   - CoachSessionScreen: gửi/nhận messages, quản lý timer
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

    // ===== Coach Mode Actions =====

    startCoachSession: setup =>
      set({
        coachSession: {
          setup,
          messages: [],
          remainingSeconds: setup.durationMinutes * 60,
          inputMode: 'voice',
          isAIResponding: false,
          isEnded: false,
        },
        isRecording: false,
        audioUri: null,
        error: null,
      }),

    addCoachMessage: message =>
      set(state => {
        if (!state.coachSession) return {};
        return {
          coachSession: {
            ...state.coachSession,
            messages: [...state.coachSession.messages, message],
          },
        };
      }),

    setCoachInputMode: mode =>
      set(state => {
        if (!state.coachSession) return {};
        return {
          coachSession: {...state.coachSession, inputMode: mode},
        };
      }),

    tickCoachTimer: () =>
      set(state => {
        if (!state.coachSession || state.coachSession.isEnded) return {};
        const remaining = state.coachSession.remainingSeconds - 1;
        if (remaining <= 0) {
          return {
            coachSession: {
              ...state.coachSession,
              remainingSeconds: 0,
              isEnded: true,
            },
          };
        }
        return {
          coachSession: {
            ...state.coachSession,
            remainingSeconds: remaining,
          },
        };
      }),

    setCoachAIResponding: value =>
      set(state => {
        if (!state.coachSession) return {};
        return {
          coachSession: {...state.coachSession, isAIResponding: value},
        };
      }),

    endCoachSession: () =>
      set(state => {
        if (!state.coachSession) return {};
        return {
          coachSession: {...state.coachSession, isEnded: true},
        };
      }),

    resetCoach: () => set({coachSession: null}),

    // ===== TTS Settings =====
    setTtsSettings: (settings) =>
      set(state => ({
        ttsSettings: {...state.ttsSettings, ...settings},
      })),
  }),
);

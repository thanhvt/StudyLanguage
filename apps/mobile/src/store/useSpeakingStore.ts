import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import type {
  SpeakingConfig,
  Sentence,
  FeedbackResult,
} from '@/services/api/speaking';
import type {ChatMessage} from '@/components/speaking/ChatBubble';

// =======================
// AI Conversation Types
// =======================

/** Persona AI cho Roleplay mode */
export interface ScenarioPersona {
  /** Tên persona: "Tony" */
  name: string;
  /** Vai trò: "Waiter" */
  role: string;
  /** Avatar emoji hoặc URL: "👨‍🍳" */
  avatar: string;
  /** Câu chào: "Welcome to Bella Italia!" */
  greeting: string;
  /** System prompt cho AI behavior */
  systemPrompt: string;
}

/** Tin nhắn hội thoại AI — mở rộng từ ChatMessage */
export interface ConversationMessage extends ChatMessage {
  /** Feedback phát âm inline (nếu có) */
  pronunciationFeedback?: {
    word: string;
    ipa: string;
    tip: string;
  };
  /** Sửa ngữ pháp inline (nếu có) */
  grammarCorrections?: {
    original: string;
    correction: string;
    explanation: string;
  }[];
}

/** Setup cấu hình cho AI Conversation */
export interface ConversationSetup {
  /** Mode: Free Talk (timer) hoặc Roleplay (turns) */
  mode: 'free-talk' | 'roleplay';
  /** Topic/Scenario đã chọn (reuse TopicPicker) */
  topicId: string | null;
  /** Tên topic hiển thị */
  topicName: string;
  /** Mô tả topic */
  topicDescription: string;
  /** Persona cho Roleplay (null cho Free Talk) */
  persona: ScenarioPersona | null;
  /** Độ khó — chỉ cho Roleplay */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Thời lượng phút — chỉ cho Free Talk */
  durationMinutes: number;
  /** Số turns tối đa — chỉ cho Roleplay */
  maxTurns: number;
  /** Mức phản hồi */
  feedbackMode: 'beginner' | 'intermediate' | 'advanced';
  /** Tuỳ chọn */
  options: {
    /** Gợi ý câu trả lời (Free Talk + beginner) */
    showSuggestions: boolean;
    /** Sửa ngữ pháp inline */
    inlineGrammarFix: boolean;
    /** Cảnh báo phát âm inline */
    pronunciationAlert: boolean;
  };
}

/** Trạng thái session AI Conversation */
export interface ConversationSession {
  /** Session đang hoạt động */
  isActive: boolean;
  /** Danh sách tin nhắn */
  messages: ConversationMessage[];
  /** Thời gian còn lại — Free Talk countdown (seconds), 0 nếu unlimited */
  remainingTime: number;
  /** Thời gian đã trôi qua — dùng cho unlimited mode (seconds) */
  elapsedTime: number;
  /** Turn hiện tại — Roleplay */
  currentTurn: number;
  /** Chế độ input: voice hoặc text */
  inputMode: 'voice' | 'text';
}

/** Trạng thái ghi âm */
export interface RecordingState {
  /** Đang ghi âm */
  isRecording: boolean;
  /** Thời gian ghi (seconds) */
  duration: number;
  /** URI file audio */
  audioUri: string | null;
  /** Dữ liệu waveform realtime */
  waveformData: number[];
}

/** Trạng thái AI */
export interface AIState {
  /** AI đang generate response */
  isThinking: boolean;
  /** Đang transcribe audio → text */
  isTranscribing: boolean;
  /** Gợi ý câu trả lời (cho Free Talk beginner) */
  suggestedResponses: string[];
}

/** Kết quả tổng kết session */
export interface SessionSummary {
  /** Tổng thời gian session (seconds) */
  totalTime: number;
  /** Tổng lượt nói */
  totalTurns: number;
  /** Điểm tổng 0-100 */
  overallScore: number;
  /** Xếp loại */
  grade: string;
  /** Từ phát âm cần cải thiện */
  pronunciationIssues: {
    word: string;
    accuracy: number;
    ipa: string;
  }[];
  /** Lỗi ngữ pháp đã sửa */
  grammarFixes: {
    original: string;
    correction: string;
  }[];
  /** Nhận xét AI */
  aiFeedback: string;
  /** Badge scenario (Roleplay only) */
  scenarioBadge: string | null;
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
  /** Cảm xúc giọng đọc: cheerful / neutral / friendly / newscast */
  emotion: 'cheerful' | 'neutral' | 'friendly' | 'newscast';
  /** Tự động chọn cảm xúc theo context */
  autoEmotion: boolean;
  /** Cao độ giọng (-50 → +50 %) */
  pitch: number;
  /** Random giọng đọc mỗi câu */
  randomVoice: boolean;
}

/** Cài đạt hiển thị cho Practice Session */
export interface DisplaySettings {
  /** Hiện/ẩn phiên âm IPA */
  showIPA: boolean;
  /** Hiện/ẩn stress marking */
  showStress: boolean;
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
  /** Session đã hoàn thành (user nhấn Hoàn thành) — bypass beforeRemove guard */
  sessionCompleted: boolean;

  // ===== TTS Settings =====
  /** Cài đặt TTS provider + voice + speed + pitch + emotion */
  ttsSettings: TtsSettings;

  // ===== Display Settings =====
  /** Cài đặt hiển thị (showIPA, showStress) */
  displaySettings: DisplaySettings;

  // ===== Best Scores (per-sentence, local MMKV) =====
  /** Map sentenceId → bestScore (0-100), lưu local qua MMKV */
  bestScores: Record<string, number>;

  // ===== AI Conversation State =====
  /** Setup cấu hình conversation (null nếu chưa config) */
  conversationSetup: ConversationSetup | null;
  /** Session conversation hiện tại (null nếu chưa bắt đầu) */
  conversationSession: ConversationSession | null;
  /** Trạng thái ghi âm conversation */
  conversationRecording: RecordingState;
  /** Trạng thái AI conversation */
  conversationAI: AIState;
  /** Kết quả tổng kết (null nếu chưa có) */
  conversationSummary: SessionSummary | null;
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
  /** Đánh dấu session đã hoàn thành (bypass confirm popup) */
  setSessionCompleted: (value: boolean) => void;

  // ===== AI Conversation Actions =====
  /** Lưu setup cấu hình conversation */
  setConversationSetup: (setup: ConversationSetup) => void;
  /** Bắt đầu conversation session mới */
  startConversation: () => void;
  /** Thêm tin nhắn vào hội thoại */
  addConversationMessage: (message: ConversationMessage) => void;
  /** Cập nhật tin nhắn cuối (streaming) */
  updateLastMessage: (update: Partial<ConversationMessage>) => void;
  /** Chuyển input mode (voice/text) */
  setConversationInputMode: (mode: 'voice' | 'text') => void;
  /** Giảm timer 1 giây (Free Talk) */
  tickConversationTimer: () => void;
  /** Tăng turn counter (Roleplay) */
  incrementTurn: () => void;
  /** Set AI đang thinking */
  setAIThinking: (value: boolean) => void;
  /** Set đang transcribing */
  setAITranscribing: (value: boolean) => void;
  /** Set gợi ý câu trả lời */
  setSuggestedResponses: (suggestions: string[]) => void;
  /** Bắt đầu ghi âm conversation */
  startConversationRecording: () => void;
  /** Dừng ghi âm conversation */
  stopConversationRecording: (audioUri: string) => void;
  /** Cập nhật waveform data */
  updateWaveformData: (data: number[]) => void;
  /** Cập nhật thời gian ghi âm conversation */
  setConversationRecordingDuration: (seconds: number) => void;
  /** Kết thúc conversation session */
  endConversation: () => void;
  /** Set kết quả tổng kết */
  setConversationSummary: (summary: SessionSummary) => void;
  /** Reset toàn bộ conversation state */
  resetConversation: () => void;

  // ===== TTS Settings Actions =====
  /** Cập nhật TTS settings (merge partial) */
  setTtsSettings: (settings: Partial<TtsSettings>) => void;

  // ===== Display Settings Actions =====
  /** Toggle hiển thị IPA */
  setShowIPA: (show: boolean) => void;
  /** Toggle hiển thị stress marking */
  setShowStress: (show: boolean) => void;

  // ===== Best Score Actions =====
  /** Cập nhật best score cho 1 câu (chỉ update nếu score mới > cũ) */
  setBestScore: (sentenceId: string, score: number) => void;
}

const initialConversationRecording: RecordingState = {
  isRecording: false,
  duration: 0,
  audioUri: null,
  waveformData: [],
};

const initialConversationAI: AIState = {
  isThinking: false,
  isTranscribing: false,
  suggestedResponses: [],
};

const initialState: SpeakingState = {
  config: {
    topic: null,
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
  sessionCompleted: false,
  ttsSettings: {
    provider: 'azure',
    voiceId: 'en-US-JennyNeural',
    speed: 1.0,
    pitch: 0,
    emotion: 'cheerful',
    autoEmotion: true,
    randomVoice: false,
  },
  displaySettings: {
    showIPA: true,
    showStress: false,
  },
  bestScores: {},
  conversationSetup: null,
  conversationSession: null,
  conversationRecording: initialConversationRecording,
  conversationAI: initialConversationAI,
  conversationSummary: null,
};

/**
 * Mục đích: Zustand store cho Speaking module (Practice + AI Conversation)
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - PracticeScreen: quản lý recording, navigate sentences
 *   - FeedbackScreen: đọc feedback, retry/next
 *   - ConversationSetupScreen: tạo conversation setup
 *   - ConversationScreen: gửi/nhận messages, quản lý timer/turns
 *   - SessionSummaryScreen: hiển thị tổng kết
 *   - QuickActions: reset khi bắt đầu session mới
 */
// ===========================
// MMKV Storage Adapter cho Zustand — persist TTS settings
// ===========================
const speakingStorage = new MMKV({id: 'speaking-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    speakingStorage.set(name, value);
  },
  getItem: (name) => {
    return speakingStorage.getString(name) ?? null;
  },
  removeItem: (name) => {
    speakingStorage.delete(name);
  },
};

export const useSpeakingStore = create<SpeakingState & SpeakingActions>()(
  persist(
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

    // EC-C05 fix: Clamp index để tránh truy cập ngoài biên → crash UI
    setCurrentIndex: index =>
      set(state => ({
        currentIndex: Math.max(0, Math.min(index, Math.max(0, state.sentences.length - 1))),
        feedback: null,
        audioUri: null,
        recordingDuration: 0,
      })),

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

    setSessionCompleted: value => set({sessionCompleted: value}),

    // ===== AI Conversation Actions =====

    setConversationSetup: setup =>
      set({conversationSetup: setup}),

    startConversation: () =>
      set(state => {
        if (!state.conversationSetup) return {};
        const setup = state.conversationSetup;
        // Unlimited mode: durationMinutes === 0 → remainingTime = 0, đếm elapsed
        const isUnlimited = setup.durationMinutes === 0;
        return {
          conversationSession: {
            isActive: true,
            messages: [],
            remainingTime: setup.mode === 'free-talk' && !isUnlimited
              ? setup.durationMinutes * 60
              : 0,
            elapsedTime: 0,
            currentTurn: 0,
            inputMode: 'voice',
          },
          conversationRecording: initialConversationRecording,
          conversationAI: initialConversationAI,
          conversationSummary: null,
          error: null,
        };
      }),

    addConversationMessage: message =>
      set(state => {
        if (!state.conversationSession) return {};
        return {
          conversationSession: {
            ...state.conversationSession,
            messages: [...state.conversationSession.messages, message],
          },
        };
      }),

    updateLastMessage: update =>
      set(state => {
        if (!state.conversationSession) return {};
        const msgs = [...state.conversationSession.messages];
        if (msgs.length === 0) return {};
        msgs[msgs.length - 1] = {...msgs[msgs.length - 1], ...update};
        return {
          conversationSession: {
            ...state.conversationSession,
            messages: msgs,
          },
        };
      }),

    setConversationInputMode: mode =>
      set(state => {
        if (!state.conversationSession) return {};
        return {
          conversationSession: {...state.conversationSession, inputMode: mode},
        };
      }),

    tickConversationTimer: () =>
      set(state => {
        if (!state.conversationSession || !state.conversationSession.isActive) return {};
        const setup = state.conversationSetup;
        const isUnlimited = setup?.durationMinutes === 0;

        // Unlimited mode: chỉ tăng elapsedTime, không giảm remainingTime
        if (isUnlimited) {
          return {
            conversationSession: {
              ...state.conversationSession,
              elapsedTime: state.conversationSession.elapsedTime + 1,
            },
          };
        }

        // Countdown mode: giảm remainingTime + tăng elapsedTime
        const remaining = state.conversationSession.remainingTime - 1;
        if (remaining <= 0) {
          return {
            conversationSession: {
              ...state.conversationSession,
              remainingTime: 0,
              elapsedTime: state.conversationSession.elapsedTime + 1,
              isActive: false,
            },
          };
        }
        return {
          conversationSession: {
            ...state.conversationSession,
            remainingTime: remaining,
            elapsedTime: state.conversationSession.elapsedTime + 1,
          },
        };
      }),

    incrementTurn: () =>
      set(state => {
        if (!state.conversationSession) return {};
        const newTurn = state.conversationSession.currentTurn + 1;
        const maxTurns = state.conversationSetup?.maxTurns ?? 8;
        const isActive = newTurn < maxTurns;
        return {
          conversationSession: {
            ...state.conversationSession,
            currentTurn: newTurn,
            isActive,
          },
        };
      }),

    setAIThinking: value =>
      set(state => ({
        conversationAI: {...state.conversationAI, isThinking: value},
      })),

    setAITranscribing: value =>
      set(state => ({
        conversationAI: {...state.conversationAI, isTranscribing: value},
      })),

    setSuggestedResponses: suggestions =>
      set(state => ({
        conversationAI: {...state.conversationAI, suggestedResponses: suggestions},
      })),

    startConversationRecording: () =>
      set({
        conversationRecording: {
          isRecording: true,
          duration: 0,
          audioUri: null,
          waveformData: [],
        },
      }),

    stopConversationRecording: audioUri =>
      set(state => ({
        conversationRecording: {
          ...state.conversationRecording,
          isRecording: false,
          audioUri,
        },
      })),

    updateWaveformData: data =>
      set(state => ({
        conversationRecording: {
          ...state.conversationRecording,
          waveformData: data,
        },
      })),

    setConversationRecordingDuration: seconds =>
      set(state => ({
        conversationRecording: {
          ...state.conversationRecording,
          duration: seconds,
        },
      })),

    endConversation: () =>
      set(state => {
        if (!state.conversationSession) return {};
        return {
          conversationSession: {
            ...state.conversationSession,
            isActive: false,
          },
        };
      }),

    setConversationSummary: summary =>
      set({conversationSummary: summary}),

    resetConversation: () =>
      set({
        conversationSetup: null,
        conversationSession: null,
        conversationRecording: initialConversationRecording,
        conversationAI: initialConversationAI,
        conversationSummary: null,
      }),

    // ===== TTS Settings =====
    // Clamp speed (0.5-2.0) và pitch (-50 đến +50) trong range hợp lệ
    setTtsSettings: (settings) =>
      set(state => ({
        ttsSettings: {
          ...state.ttsSettings,
          ...settings,
          speed: settings.speed !== undefined
            ? Math.max(0.5, Math.min(2.0, settings.speed))
            : state.ttsSettings.speed,
          pitch: settings.pitch !== undefined
            ? Math.max(-50, Math.min(50, settings.pitch))
            : state.ttsSettings.pitch,
        },
      })),

    // ===== Display Settings =====
    setShowIPA: (show) => set(state => ({
      displaySettings: {...state.displaySettings, showIPA: show},
    })),
    setShowStress: (show) => set(state => ({
      displaySettings: {...state.displaySettings, showStress: show},
    })),

    // ===== Best Scores =====
    setBestScore: (sentenceId, score) => set(state => {
      const currentBest = state.bestScores[sentenceId] ?? 0;
      if (score <= currentBest) return {}; // Chỉ update nếu score mới cao hơn
      return {
        bestScores: {...state.bestScores, [sentenceId]: score},
      };
    }),

  }),
    {
      name: 'speaking-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Persist TTS + display settings + best scores — session state không persist
      partialize: (state) => ({
        ttsSettings: state.ttsSettings,
        displaySettings: state.displaySettings,
        bestScores: state.bestScores,
      }),
    },
  ),
);

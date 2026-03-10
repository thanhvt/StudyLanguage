import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import type {TopicScenario} from '@/data/topic-data';

// =======================
// Shadowing Types
// =======================

/** Tốc độ phát AI cho Shadowing */
export type ShadowingSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

/** Phase trong 4-phase flow */
export type ShadowingPhase = 'preview' | 'shadow' | 'score' | 'action';

/** Chế độ chấm điểm */
export type ScoringMode = 'post-recording' | 'realtime';

/** Một câu để shadowing — từ AI generate */
export interface ShadowingSentence {
  id: string;
  text: string;
  ipa: string;
  audioUrl: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/** Điểm shadowing cho 1 câu */
export interface ShadowingScore {
  rhythm: number;
  intonation: number;
  accuracy: number;
  overall: number;
  tips: string[];
  wordIssues: {word: string; score: number; issue?: string; ipa?: string}[];
}

/** Kết quả 1 câu trong session (tích luỹ cho summary) */
export interface SentenceResult {
  sentenceId: string;
  text: string;
  score: ShadowingScore;
  attempts: number;
}

// =======================
// State Interfaces
// =======================

/** Cấu hình Shadowing — set ở Config Screen */
interface ShadowingConfig {
  topic: TopicScenario | null;
  speed: ShadowingSpeed;
  delay: number;
  scoringMode: ScoringMode;
  hasHeadphones: boolean;
  volumeDucking: boolean;
}

/** Session — danh sách câu từ AI */
interface ShadowingSession {
  sentences: ShadowingSentence[];
  currentIndex: number;
  totalSentences: number;
  isCompleted: boolean;
}

/** Phase — trạng thái 4 giai đoạn */
interface ShadowingPhaseState {
  current: ShadowingPhase;
  isAIPlaying: boolean;
  isRecording: boolean;
  aiProgress: number;
  userProgress: number;
}

/** Waveform — dữ liệu hiển thị sóng âm */
interface ShadowingWaveform {
  aiData: number[];
  userData: number[];
}

/** Score — kết quả đánh giá */
interface ShadowingScoreState {
  isLoading: boolean;
  current: ShadowingScore | null;
  aiAudioUrl: string | null;
  userAudioUri: string | null;
}

// =======================
// Store Types
// =======================

interface ShadowingState {
  config: ShadowingConfig;
  session: ShadowingSession;
  phase: ShadowingPhaseState;
  waveform: ShadowingWaveform;
  score: ShadowingScoreState;
  sessionResults: SentenceResult[];
}

interface ShadowingActions {
  // Config
  setConfig: (config: Partial<ShadowingConfig>) => void;
  setTopic: (topic: TopicScenario | null) => void;
  setSpeed: (speed: ShadowingSpeed) => void;
  setDelay: (delay: number) => void;
  setScoringMode: (mode: ScoringMode) => void;
  setHeadphones: (connected: boolean) => void;
  setVolumeDucking: (enabled: boolean) => void;

  // Session
  startSession: (sentences: ShadowingSentence[]) => void;

  /**
   * Mục đích: Chuyển sang câu tiếp theo
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Câu tiếp" ở Phase 4 (Action)
   */
  nextSentence: () => void;

  /**
   * Mục đích: Lặp lại câu hiện tại
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Shadow lại" ở Phase 4 (Action)
   */
  repeatSentence: () => void;

  /**
   * Mục đích: Cập nhật audioUrl cho 1 câu (immutable) — tránh mutate trực tiếp
   * Tham số đầu vào: index (number), audioUrl (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Sau khi TTS generate xong URL cho câu i
   */
  updateSentenceAudioUrl: (index: number, audioUrl: string) => void;

  // Phase
  setPhase: (phase: ShadowingPhase) => void;
  setAIPlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setAIProgress: (progress: number) => void;
  setUserProgress: (progress: number) => void;

  // Waveform
  updateAIWaveform: (data: number[]) => void;
  updateUserWaveform: (data: number[]) => void;
  appendUserWaveform: (amplitude: number) => void;

  // Score
  setScoreLoading: (loading: boolean) => void;
  setScore: (score: ShadowingScore) => void;
  setAudioUrls: (aiUrl: string | null, userUri: string | null) => void;

  /**
   * Mục đích: Lưu kết quả 1 câu vào session results (cho summary)
   * Tham số đầu vào: result (SentenceResult)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Sau khi score loaded → ghi vào sessionResults
   */
  addSessionResult: (result: SentenceResult) => void;

  // Reset
  reset: () => void;
  resetPhase: () => void;
}

// =======================
// Initial State
// =======================

const initialConfig: ShadowingConfig = {
  topic: null,
  speed: 1.0,
  delay: 0.5,
  scoringMode: 'post-recording',
  hasHeadphones: false,
  volumeDucking: true,
};

const initialSession: ShadowingSession = {
  sentences: [],
  currentIndex: 0,
  totalSentences: 0,
  isCompleted: false,
};

const initialPhase: ShadowingPhaseState = {
  current: 'preview',
  isAIPlaying: false,
  isRecording: false,
  aiProgress: 0,
  userProgress: 0,
};

const initialWaveform: ShadowingWaveform = {
  aiData: [],
  userData: [],
};

const initialScore: ShadowingScoreState = {
  isLoading: false,
  current: null,
  aiAudioUrl: null,
  userAudioUri: null,
};

const initialState: ShadowingState = {
  config: initialConfig,
  session: initialSession,
  phase: initialPhase,
  waveform: initialWaveform,
  score: initialScore,
  sessionResults: [],
};

// =======================
// MMKV Storage — persist speed/delay/scoringMode
// =======================

const shadowingStorage = new MMKV({id: 'shadowing-storage'});

const mmkvStorage: StateStorage = {
  /**
   * Mục đích: Lưu giá trị vào MMKV persistent storage
   * Tham số đầu vào: name (string), value (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Zustand persist middleware tự gọi khi state thay đổi
   */
  setItem(name: string, value: string) {
    shadowingStorage.set(name, value);
  },
  /**
   * Mục đích: Đọc giá trị từ MMKV persistent storage
   * Tham số đầu vào: name (string)
   * Tham số đầu ra: string | null
   * Khi nào sử dụng: Zustand persist middleware tự gọi khi hydrate store
   */
  getItem(name: string) {
    return shadowingStorage.getString(name) ?? null;
  },
  /**
   * Mục đích: Xoá giá trị khỏi MMKV persistent storage
   * Tham số đầu vào: name (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Zustand persist middleware tự gọi khi cần clear
   */
  removeItem(name: string) {
    shadowingStorage.delete(name);
  },
};

// =======================
// Store
// =======================

/**
 * Mục đích: Zustand store riêng cho Shadowing Mode — quản lý toàn bộ state
 * Tham số đầu vào: không (global store)
 * Tham số đầu ra: ShadowingState & ShadowingActions
 * Khi nào sử dụng:
 *   - ShadowingConfigScreen: setConfig, setTopic, setSpeed, setDelay
 *   - ShadowingSessionScreen: phase transitions, waveform updates
 *   - ShadowingFeedbackScreen: read score, addSessionResult
 *   - ShadowingSessionSummaryScreen: read sessionResults
 */
export const useShadowingStore = create<ShadowingState & ShadowingActions>()(
  persist(
    set => ({
      ...initialState,

      // ===== Config =====
      setConfig: config =>
        set(state => ({
          config: {...state.config, ...config},
        })),

      setTopic: topic =>
        set(state => ({
          config: {...state.config, topic},
        })),

      setSpeed: speed =>
        set(state => ({
          config: {...state.config, speed},
        })),

      setDelay: delay =>
        set(state => ({
          config: {...state.config, delay: Math.max(0, Math.min(2.0, delay))},
        })),

      setScoringMode: scoringMode =>
        set(state => ({
          config: {...state.config, scoringMode},
        })),

      setHeadphones: hasHeadphones =>
        set(state => ({
          config: {...state.config, hasHeadphones},
        })),

      setVolumeDucking: volumeDucking =>
        set(state => ({
          config: {...state.config, volumeDucking},
        })),

      // ===== Session =====
      startSession: sentences =>
        set({
          session: {
            sentences,
            currentIndex: 0,
            totalSentences: sentences.length,
            isCompleted: false,
          },
          phase: initialPhase,
          waveform: initialWaveform,
          score: initialScore,
          sessionResults: [],
        }),

      nextSentence: () =>
        set(state => {
          const nextIndex = state.session.currentIndex + 1;
          const isCompleted = nextIndex >= state.session.totalSentences;
          return {
            session: {
              ...state.session,
              currentIndex: isCompleted
                ? state.session.currentIndex
                : nextIndex,
              isCompleted,
            },
            // Reset phase + waveform + score khi chuyển câu
            phase: initialPhase,
            waveform: initialWaveform,
            score: initialScore,
          };
        }),

      repeatSentence: () =>
        set({
          // Giữ nguyên session index, chỉ reset phase + waveform + score
          phase: initialPhase,
          waveform: initialWaveform,
          score: initialScore,
        }),

      updateSentenceAudioUrl: (index, audioUrl) =>
        set(state => {
          const sentences = [...state.session.sentences];
          if (index >= 0 && index < sentences.length) {
            sentences[index] = {...sentences[index], audioUrl};
          }
          return {
            session: {...state.session, sentences},
          };
        }),

      // ===== Phase =====
      setPhase: current =>
        set(state => ({
          phase: {...state.phase, current},
        })),

      setAIPlaying: isAIPlaying =>
        set(state => ({
          phase: {...state.phase, isAIPlaying},
        })),

      setRecording: isRecording =>
        set(state => ({
          phase: {...state.phase, isRecording},
        })),

      setAIProgress: aiProgress =>
        set(state => ({
          phase: {...state.phase, aiProgress},
        })),

      setUserProgress: userProgress =>
        set(state => ({
          phase: {...state.phase, userProgress},
        })),

      // ===== Waveform =====
      updateAIWaveform: aiData =>
        set(state => ({
          waveform: {...state.waveform, aiData},
        })),

      updateUserWaveform: userData =>
        set(state => ({
          waveform: {...state.waveform, userData},
        })),

      appendUserWaveform: amplitude =>
        set(state => ({
          waveform: {
            ...state.waveform,
            userData: [...state.waveform.userData, amplitude],
          },
        })),

      // ===== Score =====
      setScoreLoading: isLoading =>
        set(state => ({
          score: {...state.score, isLoading},
        })),

      setScore: score =>
        set(state => ({
          score: {
            ...state.score,
            current: score,
            isLoading: false,
          },
        })),

      setAudioUrls: (aiAudioUrl, userAudioUri) =>
        set(state => ({
          score: {...state.score, aiAudioUrl, userAudioUri},
        })),

      addSessionResult: result =>
        set(state => ({
          sessionResults: [...state.sessionResults, result],
        })),

      // ===== Reset =====
      reset: () => set(initialState),

      resetPhase: () =>
        set({
          phase: initialPhase,
          waveform: initialWaveform,
          score: initialScore,
        }),
    }),
    {
      name: 'shadowing-preferences',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ persist config preferences — không persist session/phase/score
      partialize: state => ({
        config: {
          topic: null, // Không persist topic
          speed: state.config.speed,
          delay: state.config.delay,
          scoringMode: state.config.scoringMode,
          hasHeadphones: false, // Không persist headphone state
          volumeDucking: state.config.volumeDucking,
        },
      }),
    },
  ),
);

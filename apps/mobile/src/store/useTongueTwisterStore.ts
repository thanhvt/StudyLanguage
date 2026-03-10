import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import type {
  PhonemeCategory,
  TwisterLevel,
  TongueTwister,
  PhonemeHit,
  SpeedRound,
  CategoryLevelProgress,
  LevelProgress,
} from '@/types/tongueTwister.types';
import {SPEED_ROUNDS_CONFIG} from '@/types/tongueTwister.types';

// =======================
// State Interface
// =======================

/** Trạng thái Tongue Twister Mode */
interface TongueTwisterState {
  // Cấu hình — set ở Select Screen
  config: {
    phonemeCategory: PhonemeCategory | null;
    level: TwisterLevel | null;
  };

  // Session — danh sách tongue twisters
  session: {
    twisters: TongueTwister[];
    currentIndex: number;
    totalTwisters: number;
  };

  // Ghi âm — trạng thái mic
  recording: {
    isRecording: boolean;
    duration: number;
    audioUri: string | null;
    waveformData: number[];
  };

  // Score — kết quả practice
  score: {
    isLoading: boolean;
    pronunciation: number | null;
    phonemeHits: PhonemeHit[];
    tip: string | null;
  };

  // Speed Challenge
  speedChallenge: {
    isActive: boolean;
    currentRound: 1 | 2 | 3 | 4;
    rounds: SpeedRound[];
    bestWPM: number;
    retryCount: number;
  };

  // Level progress — unlock tracking (persisted)
  levelProgress: Record<string, CategoryLevelProgress>;
}

// =======================
// Actions Interface
// =======================

interface TongueTwisterActions {
  // Config
  setPhonemeCategory: (category: PhonemeCategory) => void;
  setLevel: (level: TwisterLevel) => void;

  // Session
  loadTwisters: (twisters: TongueTwister[]) => void;
  nextTwister: () => void;
  prevTwister: () => void;

  // Recording
  startRecording: () => void;
  stopRecording: (audioUri: string) => void;
  setRecordingDuration: (seconds: number) => void;
  clearRecording: () => void;

  // Score
  setScoreLoading: (loading: boolean) => void;
  setScore: (pronunciation: number, phonemeHits: PhonemeHit[], tip: string | null) => void;
  clearScore: () => void;

  // Speed Challenge
  startSpeedChallenge: () => void;
  completeRound: (score: number, wpm: number, accuracy: number) => void;
  retryRound: () => void;
  exitSpeedChallenge: () => void;

  // Level Progress
  updateLevelProgress: (category: PhonemeCategory, level: TwisterLevel, score: number) => void;

  // Reset
  resetSession: () => void;
  resetAll: () => void;
}

// =======================
// Default State
// =======================

const defaultLevelProgress: CategoryLevelProgress = {
  easy: {avgScore: 0, completed: false},
  medium: {avgScore: 0, completed: false},
  hard: {avgScore: 0, completed: false},
  extreme: {avgScore: 0, completed: false},
};

const initialState: TongueTwisterState = {
  config: {
    phonemeCategory: null,
    level: null,
  },
  session: {
    twisters: [],
    currentIndex: 0,
    totalTwisters: 0,
  },
  recording: {
    isRecording: false,
    duration: 0,
    audioUri: null,
    waveformData: [],
  },
  score: {
    isLoading: false,
    pronunciation: null,
    phonemeHits: [],
    tip: null,
  },
  speedChallenge: {
    isActive: false,
    currentRound: 1,
    rounds: SPEED_ROUNDS_CONFIG.map(r => ({
      round: r.round,
      targetSpeed: r.targetSpeed,
      status: r.round === 1 ? 'active' : 'locked' as const,
      score: null,
      wpm: null,
      accuracy: null,
    })),
    bestWPM: 0,
    retryCount: 0,
  },
  levelProgress: {},
};

// =======================
// MMKV Persistence (chỉ persist levelProgress)
// =======================

const tongueTwisterStorage = new MMKV({id: 'tongue-twister-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    tongueTwisterStorage.set(name, value);
  },
  getItem: name => {
    return tongueTwisterStorage.getString(name) ?? null;
  },
  removeItem: name => {
    tongueTwisterStorage.delete(name);
  },
};

// =======================
// Store
// =======================

/**
 * Mục đích: Zustand store cho Tongue Twister Mode
 * Tham số đầu vào: không có
 * Tham số đầu ra: state + actions cho Tongue Twister
 * Khi nào sử dụng:
 *   - TongueTwisterSelectScreen → config, levelProgress
 *   - TongueTwisterPracticeScreen → session, recording, score
 *   - SpeedChallengeScreen → speedChallenge
 */
export const useTongueTwisterStore = create<TongueTwisterState & TongueTwisterActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== Config =====

      setPhonemeCategory: (category) =>
        set(state => ({
          config: {...state.config, phonemeCategory: category},
        })),

      setLevel: (level) =>
        set(state => ({
          config: {...state.config, level},
        })),

      // ===== Session =====

      loadTwisters: (twisters) =>
        set({
          session: {
            twisters,
            currentIndex: 0,
            totalTwisters: twisters.length,
          },
          // Reset score khi load session mới
          score: initialState.score,
          recording: initialState.recording,
        }),

      nextTwister: () =>
        set(state => {
          const nextIdx = Math.min(
            state.session.currentIndex + 1,
            state.session.totalTwisters - 1,
          );
          return {
            session: {...state.session, currentIndex: nextIdx},
            score: initialState.score,
            recording: initialState.recording,
          };
        }),

      prevTwister: () =>
        set(state => {
          const prevIdx = Math.max(state.session.currentIndex - 1, 0);
          return {
            session: {...state.session, currentIndex: prevIdx},
            score: initialState.score,
            recording: initialState.recording,
          };
        }),

      // ===== Recording =====

      startRecording: () =>
        set({
          recording: {
            isRecording: true,
            duration: 0,
            audioUri: null,
            waveformData: [],
          },
          // Reset score khi bắt đầu ghi âm mới
          score: initialState.score,
        }),

      stopRecording: (audioUri) =>
        set(state => ({
          recording: {...state.recording, isRecording: false, audioUri},
        })),

      setRecordingDuration: (seconds) =>
        set(state => ({
          recording: {...state.recording, duration: seconds},
        })),

      clearRecording: () =>
        set({recording: initialState.recording}),

      // ===== Score =====

      setScoreLoading: (loading) =>
        set(state => ({
          score: {...state.score, isLoading: loading},
        })),

      setScore: (pronunciation, phonemeHits, tip) =>
        set({
          score: {
            isLoading: false,
            pronunciation,
            phonemeHits,
            tip,
          },
        }),

      clearScore: () =>
        set({score: initialState.score}),

      // ===== Speed Challenge =====

      startSpeedChallenge: () =>
        set({
          speedChallenge: {
            isActive: true,
            currentRound: 1,
            rounds: SPEED_ROUNDS_CONFIG.map(r => ({
              round: r.round,
              targetSpeed: r.targetSpeed,
              status: r.round === 1 ? 'active' : 'locked' as const,
              score: null,
              wpm: null,
              accuracy: null,
            })),
            bestWPM: 0,
            retryCount: 0,
          },
          recording: initialState.recording,
          score: initialState.score,
        }),

      completeRound: (score, wpm, accuracy) =>
        set(state => {
          const {currentRound, rounds, bestWPM} = state.speedChallenge;
          const passThreshold = SPEED_ROUNDS_CONFIG[currentRound - 1].passThreshold;
          const passed = accuracy >= passThreshold;

          if (!passed) {
            // Chưa đạt — tăng retry count
            return {
              speedChallenge: {
                ...state.speedChallenge,
                retryCount: state.speedChallenge.retryCount + 1,
              },
            };
          }

          // Đạt — cập nhật round hiện tại và mở khóa round tiếp
          const updatedRounds = rounds.map(r => {
            if (r.round === currentRound) {
              return {...r, status: 'completed' as const, score, wpm, accuracy};
            }
            if (r.round === currentRound + 1) {
              return {...r, status: 'active' as const};
            }
            return r;
          });

          const nextRound = currentRound < 4 ? (currentRound + 1) as 1 | 2 | 3 | 4 : currentRound;
          const newBestWPM = Math.max(bestWPM, wpm);

          return {
            speedChallenge: {
              isActive: currentRound < 4, // Kết thúc nếu round 4 xong
              currentRound: nextRound,
              rounds: updatedRounds,
              bestWPM: newBestWPM,
              retryCount: 0,
            },
            recording: initialState.recording,
          };
        }),

      retryRound: () =>
        set(state => ({
          recording: initialState.recording,
          score: initialState.score,
          speedChallenge: {
            ...state.speedChallenge,
            // Giữ nguyên round, chỉ reset recording/score
          },
        })),

      exitSpeedChallenge: () =>
        set({
          speedChallenge: initialState.speedChallenge,
          recording: initialState.recording,
          score: initialState.score,
        }),

      // ===== Level Progress =====

      updateLevelProgress: (category, level, score) =>
        set(state => {
          const categoryProgress = state.levelProgress[category] || {...defaultLevelProgress};
          const currentLevel = categoryProgress[level];

          // Tính trung bình cộng dồn (simplified — lấy max giữa score cũ và mới)
          const newAvgScore = Math.max(currentLevel.avgScore, score);
          const completed = newAvgScore >= 70;

          return {
            levelProgress: {
              ...state.levelProgress,
              [category]: {
                ...categoryProgress,
                [level]: {avgScore: newAvgScore, completed},
              },
            },
          };
        }),

      // ===== Reset =====

      resetSession: () =>
        set({
          session: initialState.session,
          recording: initialState.recording,
          score: initialState.score,
          speedChallenge: initialState.speedChallenge,
        }),

      resetAll: () =>
        set({...initialState, levelProgress: get().levelProgress}),
    }),
    {
      name: 'tongue-twister-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ persist cấu hình level progress
      partialize: (state) => ({
        levelProgress: state.levelProgress,
      }),
    },
  ),
);

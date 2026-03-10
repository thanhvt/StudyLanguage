/**
 * Mục đích: Shared TypeScript types cho Tongue Twister Mode
 * Tham số đầu vào: không có
 * Tham số đầu ra: Types, interfaces, constants cho Tongue Twister feature
 * Khi nào sử dụng:
 *   - useTongueTwisterStore → state & actions typing
 *   - TongueTwisterSelectScreen, TongueTwisterPracticeScreen, SpeedChallengeScreen
 *   - API service → request/response types
 *   - Components: PhonemeCard, LevelPill, RoundCard, StatChip
 */

// =======================
// Enums & Literal Types
// =======================

/** Các loại phoneme category */
export type PhonemeCategory = 'th_sounds' | 'sh_s' | 'r_l' | 'v_w' | 'ae_e' | 'ee_i';

/** Các level khó */
export type TwisterLevel = 'easy' | 'medium' | 'hard' | 'extreme';

// =======================
// Data Structures
// =======================

/** Một câu tongue twister */
export interface TongueTwister {
  id: string;
  /** Câu tongue twister đầy đủ */
  text: string;
  /** Phiên âm IPA */
  ipa: string;
  /** Phonemes mục tiêu để luyện */
  targetPhonemes: string[];
  /** Các từ cần highlight (chứa phoneme mục tiêu) */
  highlightWords: string[];
  /** Độ khó */
  difficulty: TwisterLevel;
}

/** Kết quả phân tích phoneme cho 1 từ */
export interface PhonemeHit {
  /** Phoneme mục tiêu */
  phoneme: string;
  /** Từ chứa phoneme */
  word: string;
  /** User phát âm đúng hay không */
  isCorrect: boolean;
  /** Phoneme user thực tế phát âm (nếu sai) */
  userPhoneme?: string;
}

/** Trạng thái 1 round trong Speed Challenge */
export interface SpeedRound {
  round: 1 | 2 | 3 | 4;
  /** Tốc độ mục tiêu (hệ số nhân) */
  targetSpeed: 0.8 | 1.0 | 1.2 | 1.5;
  /** Trạng thái round */
  status: 'locked' | 'active' | 'completed';
  /** Điểm (null nếu chưa hoàn thành) */
  score: number | null;
  /** Words Per Minute đạt được */
  wpm: number | null;
  /** Phần trăm accuracy */
  accuracy: number | null;
}

/** Kết quả đánh giá phoneme-focused */
export interface PhonemeAnalysisResult {
  /** Điểm pronunciation tổng (0-100) */
  score: number;
  /** Chi tiết từng phoneme đúng/sai */
  phonemeHits: PhonemeHit[];
  /** Gợi ý cải thiện */
  tip: string | null;
}

/** Kết quả 1 round Speed Challenge */
export interface SpeedRoundResult {
  /** Điểm tổng hợp */
  score: number;
  /** Words Per Minute */
  wpm: number;
  /** Phần trăm accuracy */
  accuracy: number;
}

/** Tiến trình unlock level cho 1 category */
export interface LevelProgress {
  avgScore: number;
  completed: boolean;
}

/** Tiến trình tất cả levels cho 1 category */
export interface CategoryLevelProgress {
  easy: LevelProgress;
  medium: LevelProgress;
  hard: LevelProgress;
  extreme: LevelProgress;
}

// =======================
// Constants
// =======================

/** Thông tin 6 phoneme categories */
export interface PhonemeInfo {
  key: PhonemeCategory;
  /** Cặp phoneme hiển thị */
  phonemePair: string;
  /** Ví dụ */
  example: string;
  /** Màu theme (dark mode) */
  color: string;
  /** Màu theme (light mode) */
  colorLight: string;
}

export const PHONEME_CATEGORIES: PhonemeInfo[] = [
  {key: 'th_sounds', phonemePair: '/θ/ vs /ð/', example: 'think vs this', color: '#a855f7', colorLight: '#9333ea'},
  {key: 'sh_s', phonemePair: '/ʃ/ vs /s/', example: 'she vs see', color: '#3b82f6', colorLight: '#2563eb'},
  {key: 'r_l', phonemePair: '/r/ vs /l/', example: 'right vs light', color: '#22c55e', colorLight: '#16a34a'},
  {key: 'v_w', phonemePair: '/v/ vs /w/', example: 'vine vs wine', color: '#f97316', colorLight: '#ea580c'},
  {key: 'ae_e', phonemePair: '/æ/ vs /ɛ/', example: 'bat vs bet', color: '#ef4444', colorLight: '#dc2626'},
  {key: 'ee_i', phonemePair: '/iː/ vs /ɪ/', example: 'sheep vs ship', color: '#eab308', colorLight: '#ca8a04'},
];

/** Cấu hình level với threshold unlock */
export interface LevelConfig {
  level: TwisterLevel;
  label: string;
  emoji: string;
  /** Điểm trung bình tối thiểu của level trước để unlock */
  unlockThreshold: number;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {level: 'easy', label: 'Easy', emoji: '🌱', unlockThreshold: 0},
  {level: 'medium', label: 'Medium', emoji: '🌿', unlockThreshold: 70},
  {level: 'hard', label: 'Hard', emoji: '🌳', unlockThreshold: 70},
  {level: 'extreme', label: 'Extreme', emoji: '🔥', unlockThreshold: 70},
];

/** Cấu hình Speed Challenge rounds */
export const SPEED_ROUNDS_CONFIG: {round: 1 | 2 | 3 | 4; targetSpeed: 0.8 | 1.0 | 1.2 | 1.5; targetWPM: number; passThreshold: number}[] = [
  {round: 1, targetSpeed: 0.8, targetWPM: 100, passThreshold: 50},
  {round: 2, targetSpeed: 1.0, targetWPM: 125, passThreshold: 50},
  {round: 3, targetSpeed: 1.2, targetWPM: 150, passThreshold: 45},
  {round: 4, targetSpeed: 1.5, targetWPM: 180, passThreshold: 40},
];

// =======================
// Utility Functions
// =======================

/**
 * Mục đích: Tính Words Per Minute cho tongue twister recording
 * Tham số đầu vào: totalWords - số từ trong câu, durationSeconds - thời gian ghi âm, accuracy - % accuracy
 * Tham số đầu ra: WPM (number)
 * Khi nào sử dụng: Sau khi user ghi âm xong mỗi round
 */
export function calculateWPM(totalWords: number, durationSeconds: number, accuracy: number = 100): number {
  if (durationSeconds <= 0) return 0;
  // Chỉ tính các từ phát âm đúng
  const correctWords = totalWords * (accuracy / 100);
  return Math.round((correctWords / durationSeconds) * 60);
}

/**
 * Mục đích: Tính điểm tổng hợp Speed Challenge
 * Tham số đầu vào: accuracy - % phoneme đúng, wpm - tốc độ thực tế, targetWPM - tốc độ mục tiêu
 * Tham số đầu ra: number (0-100) — Tổng điểm
 * Khi nào sử dụng: Sau khi hoàn thành 1 round Speed Challenge
 */
export function calculateSpeedScore(accuracy: number, wpm: number, targetWPM: number): number {
  const speedRatio = Math.min(wpm / targetWPM, 1) * 100;
  return Math.round(accuracy * 0.7 + speedRatio * 0.3);
}

/**
 * Mục đích: Kiểm tra level có được unlock hay chưa
 * Tham số đầu vào: level - level cần check, progress - tiến trình categories
 * Tham số đầu ra: boolean — level có được unlock không
 * Khi nào sử dụng: TongueTwisterSelectScreen → render LevelPill locked/unlocked
 */
export function isLevelUnlocked(
  level: TwisterLevel,
  progress: CategoryLevelProgress | undefined,
): boolean {
  if (level === 'easy') return true;
  if (!progress) return false;

  const levelOrder: TwisterLevel[] = ['easy', 'medium', 'hard', 'extreme'];
  const currentIdx = levelOrder.indexOf(level);
  const prevLevel = levelOrder[currentIdx - 1];

  return progress[prevLevel].avgScore >= 70;
}

/**
 * Mục đích: Format thời gian giây thành mm:ss.x
 * Tham số đầu vào: seconds - số giây (có thể thập phân)
 * Tham số đầu ra: string — "00:03.2"
 * Khi nào sử dụng: Speed Challenge timer display
 */
export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds * 10) % 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}

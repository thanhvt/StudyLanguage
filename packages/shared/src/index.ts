// Shared Types for StudyLanguage App
// Các type dùng chung cho Web, Mobile, và API

// ================== USER ==================
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  accent_color: AccentColor;
  language: 'en' | 'vi';
  updated_at: string;
}

// ================== THEME ==================
export type AccentColor =
  | 'fresh-greens'
  | 'leafy-green-garden'
  | 'cool-waters'
  | 'bright-green'
  | 'green-harmony'
  | 'spring-green-harmony';

export interface ThemeConfig {
  id: AccentColor;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    ring: string;
    sidebarPrimary: string;
  };
  preview: {
    primary: string;
    accent: string;
  };
}

// ================== LESSON ==================
export type LessonType = 'listening' | 'speaking' | 'reading' | 'writing';
export type LessonMode = 'passive' | 'interactive';
export type LessonStatus = 'draft' | 'generating' | 'ready' | 'completed';

export interface Lesson {
  id: string;
  user_id: string;
  type: LessonType;
  topic: string;
  duration_minutes: number;
  keywords: string | null;
  num_speakers: number;
  mode: LessonMode;
  content: LessonContent | null;
  audio_url: string | null;
  status: LessonStatus;
  created_at: string;
}

export interface LessonContent {
  script?: ConversationLine[];
  questions?: QuizQuestion[];
  sample_text?: string;
  grammar_feedback?: GrammarFeedback;
}

export interface ConversationLine {
  speaker: string;
  text: string;
  audio_url?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface GrammarFeedback {
  corrections: GrammarCorrection[];
  suggestions: string[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

// ================== CONVERSATION ==================
export interface Conversation {
  id: string;
  lesson_id: string;
  sequence: number;
  speaker: string;
  text_content: string;
  audio_url: string | null;
  start_time_ms: number | null;
  end_time_ms: number | null;
  created_at: string;
}

// ================== SCORES ==================
export interface LessonScore {
  id: string;
  user_id: string;
  lesson_id: string;
  pronunciation_score: number | null;
  fluency_score: number | null;
  accuracy_score: number | null;
  overall_score: number | null;
  feedback: ScoreFeedback | null;
  user_transcript: string | null;
  user_audio_url: string | null;
  created_at: string;
}

export interface ScoreFeedback {
  wrong_words: WrongWord[];
  tips: string[];
  encouragement: string;
}

export interface WrongWord {
  word: string;
  user_said: string;
  suggestion: string;
}

// ================== API REQUESTS ==================
export interface CreateLessonRequest {
  type: LessonType;
  topic: string;
  duration_minutes?: number;
  keywords?: string;
  num_speakers?: number;
  mode?: LessonMode;
}

export interface GenerateConversationRequest {
  topic: string;
  duration_minutes: number;
  keywords?: string;
  num_speakers: number;
}

export interface TranscribeAudioRequest {
  audio_url: string;
  language?: 'en' | 'vi';
}

export interface TextToSpeechRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

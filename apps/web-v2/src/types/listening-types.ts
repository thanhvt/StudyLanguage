/**
 * listening-types.ts - TypeScript interfaces for Listening module
 * 
 * Purpose: Define types for conversations, sessions, topics, playlists
 * Usage: Import in all listening-related components
 */

// ============================================
// CONVERSATION TYPES
// ============================================

export interface ConversationLine {
  id: string
  speaker: string
  text: string
  timestamp?: string
  isUserTurn?: boolean
  audioUrl?: string
}

export interface ConversationTimestamp {
  startTime: number
  endTime: number
}

// ============================================
// SESSION TYPES
// ============================================

export type SessionStatus = 'idle' | 'generating' | 'ready' | 'playing' | 'paused' | 'completed'

export interface ListeningSession {
  id: string
  topic: string
  conversation: ConversationLine[]
  duration: number
  speakers: number
  keywords?: string
  category?: string
  subCategory?: string
  status: SessionStatus
  audioUrl?: string
  timestamps?: ConversationTimestamp[]
  createdAt: string
}

// ============================================
// TOPIC TYPES
// ============================================

export interface TopicScenario {
  id: string
  name: string
  description: string
}

export interface TopicSubCategory {
  id: string
  name: string
  scenarios: TopicScenario[]
}

export interface TopicCategory {
  id: string
  name: string
  icon: string
  description: string
  subCategories: TopicSubCategory[]
}

// ============================================
// PLAYLIST TYPES
// ============================================

export interface PlaylistItem {
  id: string
  topic: string
  conversation: ConversationLine[]
  duration: number
  speakers: number
  category?: string
  subCategory?: string
  audioUrl?: string
  timestamps?: ConversationTimestamp[]
}

export interface Playlist {
  id: string
  name: string
  items: PlaylistItem[]
  createdAt: string
  updatedAt: string
}

// ============================================
// LISTEN LATER TYPES
// ============================================

export interface ListenLaterItem extends PlaylistItem {
  addedAt: string
}

// ============================================
// AUDIO PLAYER TYPES
// ============================================

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2

export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  speed: PlaybackSpeed
  volume: number
  isMuted: boolean
}

// ============================================
// TTS SETTINGS TYPES
// ============================================

/** TTS Provider khả dụng */
export type TtsProvider = 'openai' | 'azure'

/** Cấu hình TTS chung cho frontend */
export interface TtsSettings {
  provider: TtsProvider
  voice?: string
  emotion?: string
  randomVoice: boolean
  randomEmotion: boolean
  pitch?: string
  rate?: string
  volume?: string
  multiTalker?: boolean
  multiTalkerPairIndex?: number
}

/** Thông tin giọng Azure */
export interface AzureVoice {
  name: string
  displayName: string
  gender: string
  styles: string[]
}

/** Timestamp cho từng từ (word-level highlight) */
export interface WordTimestamp {
  word: string
  startTime: number
  endTime: number
}

/** Kết quả lấy danh sách voices */
export interface VoicesResponse {
  voices: AzureVoice[]
  multiTalker: { name: string; speakers: string[] }[]
}

// ============================================
// API TYPES
// ============================================

export interface GenerateConversationRequest {
  topic: string
  durationMinutes: number
  numSpeakers?: number
  keywords?: string
}

export interface GenerateConversationResponse {
  script: ConversationLine[]
}

export interface GenerateAudioRequest {
  conversation: { speaker: string; text: string }[]
}

export interface GenerateAudioResponse {
  audioUrl: string
  timestamps: ConversationTimestamp[]
  wordTimestamps?: WordTimestamp[][]
}

// ============================================
// HISTORY TYPES
// ============================================

export interface HistoryEntry {
  id: string
  type: 'listening' | 'speaking' | 'reading'
  topic: string
  content: {
    script?: ConversationLine[]
    scenario?: string  // Interactive mode scenario context
    conversationHistory?: { speaker: string; text: string }[]  // Interactive mode history
    audioUrl?: string
    timestamps?: ConversationTimestamp[]
  }
  durationMinutes?: number
  numSpeakers?: number
  keywords?: string
  mode?: 'passive' | 'interactive'
  status: string
  isPinned: boolean
  isFavorite: boolean
  userNotes?: string
  createdAt: string
  deletedAt?: string
}

/**
 * listening-types.ts - Định nghĩa các types cho Listening feature
 * 
 * Mục đích: Type definitions cho Duration, Speakers, Topics, Listen Later, Playlists
 * Khi nào sử dụng: Import vào các components và hooks liên quan đến Listening
 */

// ============================================
// Conversation Types
// ============================================

/**
 * Một dòng trong hội thoại
 */
export interface ConversationLine {
  speaker: string;
  text: string;
  audioUrl?: string;
}

// ============================================
// Topic Types
// ============================================

/**
 * Một scenario cụ thể (e.g. "Daily Stand-up Update")
 */
export interface TopicScenario {
  id: string;
  name: string;
  description: string;
}

/**
 * Subcategory chứa nhiều scenarios (e.g. "Agile Ceremonies")
 */
export interface TopicSubCategory {
  id: string;
  name: string;
  scenarios: TopicScenario[];
}

/**
 * Category lớn (e.g. "IT", "Daily", "Personal")
 */
export interface TopicCategory {
  id: 'it' | 'daily' | 'personal';
  name: string;
  icon: string;
  description: string;
  subCategories: TopicSubCategory[];
}

// ============================================
// Listen Later Types
// ============================================

/**
 * Một item trong danh sách Nghe Sau
 */
export interface ListenLaterItem {
  id: string;
  user_id: string;
  topic: string;
  conversation: ConversationLine[];
  duration: number;
  num_speakers: number;
  category?: string;
  sub_category?: string;
  created_at: string;
  audio_url?: string; // URL audio đã lưu
  audio_timestamps?: { startTime: number; endTime: number }[]; // Timestamps đã lưu
}

/**
 * DTO để thêm vào Listen Later
 */
export interface AddListenLaterDto {
  topic: string;
  conversation: ConversationLine[];
  duration: number;
  numSpeakers: number;
  category?: string;
  subCategory?: string;
  audioUrl?: string;
  audioTimestamps?: { startTime: number; endTime: number }[];
}

// ============================================
// Playlist Types
// ============================================

/**
 * Một playlist
 */
export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  itemCount?: number;
  items?: PlaylistItem[];
}

/**
 * Một item trong playlist
 */
export interface PlaylistItem {
  id: string;
  playlist_id: string;
  topic: string;
  conversation: ConversationLine[];
  duration: number;
  num_speakers: number;
  category?: string;
  sub_category?: string;
  position: number;
  created_at: string;
  audio_url?: string;
  audio_timestamps?: { startTime: number; endTime: number }[];
}

/**
 * DTO để tạo playlist
 */
export interface CreatePlaylistDto {
  name: string;
  description?: string;
}

/**
 * DTO để thêm item vào playlist
 */
export interface AddPlaylistItemDto {
  topic: string;
  conversation: ConversationLine[];
  duration: number;
  numSpeakers: number;
  category?: string;
  subCategory?: string;
  audioUrl?: string;
  audioTimestamps?: { startTime: number; endTime: number }[];
}

// ============================================
// Player Types
// ============================================

/**
 * Trạng thái của Playlist Player
 */
export interface PlaylistPlayerState {
  isPlaying: boolean;
  currentPlaylistId: string | null;
  currentItemIndex: number;
  currentItem: PlaylistItem | null;
  items: PlaylistItem[];
}

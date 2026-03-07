import {apiClient} from './client';

// =======================
// Types cho Radio API
// =======================

/** Kết quả preview trước khi tạo playlist */
export interface RadioPreview {
  duration: number;
  trackCount: number;
  estimatedTime: string;
}

/** Một item trong playlist */
export interface RadioPlaylistItem {
  id: string;
  topic: string;
  conversation: {speaker: string; text: string}[];
  duration: number;
  numSpeakers: number;
  category: string;
  subCategory: string;
  position: number;
  audioUrl?: string;
  audioTimestamps?: {startTime: number; endTime: number}[];
}

/** Kết quả generate playlist */
export interface RadioPlaylistResult {
  playlist: {
    id: string;
    name: string;
    description: string;
    duration: number;
    trackCount: number;
  };
  items: RadioPlaylistItem[];
}

/** Playlist summary cho danh sách */
export interface PlaylistSummary {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  itemCount: number;
}

/** Playlist detail kèm items */
export interface PlaylistDetail {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  items: RadioPlaylistItem[];
}

// =======================
// Radio API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Radio Mode
 * Tham số đầu vào: duration, categories
 * Tham số đầu ra: RadioPlaylistResult, PlaylistSummary[], PlaylistDetail
 * Khi nào sử dụng:
 *   - RadioScreen: gọi generate() khi user tạo playlist
 *   - ConfigScreen: gọi getPlaylists() để hiện "Your Playlists"
 *   - RadioScreen: gọi updateTrackAudio() sau khi sinh TTS
 */
export const radioApi = {
  /**
   * Mục đích: Lấy thông tin ước tính cho playlist
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<RadioPreview>
   * Khi nào sử dụng: RadioScreen mở → hiện preview
   */
  getPreview: async (): Promise<RadioPreview> => {
    console.log('📻 [Radio] Lấy preview...');
    const response = await apiClient.get('/radio/preview');
    return response.data.data;
  },

  /**
   * Mục đích: Generate playlist mới với duration và categories
   * Tham số đầu vào: duration (1|30|60|120), categories (optional)
   * Tham số đầu ra: Promise<RadioPlaylistResult>
   * Khi nào sử dụng: User chọn duration → nhấn "Bắt đầu" → tạo playlist
   */
  generate: async (
    duration: number,
    categories?: string[],
  ): Promise<RadioPlaylistResult> => {
    console.log(
      '📻 [Radio] Đang tạo playlist, duration:',
      duration,
      'phút',
      categories ? `categories: [${categories.join(',')}]` : '',
    );
    const response = await apiClient.post(
      '/radio/generate',
      {duration, ...(categories?.length ? {categories} : {})},
      {timeout: 120000}, // 2 phút — generate text cho nhiều track
    );
    return response.data.data;
  },

  // =======================
  // Playlist History (T-01, T-02)
  // =======================

  /**
   * Mục đích: Lấy danh sách playlists của user
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<PlaylistSummary[]>
   * Khi nào sử dụng: ConfigScreen radio tab → hiện "Your Playlists"
   */
  getPlaylists: async (): Promise<PlaylistSummary[]> => {
    console.log('📻 [Radio] Lấy danh sách playlists...');
    const response = await apiClient.get('/playlists');
    return response.data.playlists || [];
  },

  /**
   * Mục đích: Lấy chi tiết playlist kèm items
   * Tham số đầu vào: playlistId
   * Tham số đầu ra: Promise<PlaylistDetail>
   * Khi nào sử dụng: User tap playlist cũ → load và play lại
   */
  getPlaylistById: async (playlistId: string): Promise<PlaylistDetail> => {
    console.log('📻 [Radio] Lấy chi tiết playlist:', playlistId);
    const response = await apiClient.get(`/playlists/${playlistId}`);
    return response.data.playlist;
  },

  /**
   * Mục đích: Xóa playlist
   * Tham số đầu vào: playlistId
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User swipe delete / nhấn nút xóa
   */
  deletePlaylist: async (playlistId: string): Promise<void> => {
    console.log('📻 [Radio] Xóa playlist:', playlistId);
    await apiClient.delete(`/playlists/${playlistId}`);
  },

  /**
   * Mục đích: Xóa 1 item khỏi playlist
   * Tham số đầu vào: playlistId, itemId
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User swipe xóa 1 track
   */
  deletePlaylistItem: async (playlistId: string, itemId: string): Promise<void> => {
    console.log('📻 [Radio] Xóa item:', itemId, 'khỏi playlist:', playlistId);
    await apiClient.delete(`/playlists/${playlistId}/items/${itemId}`);
  },

  /**
   * Mục đích: Xóa nhiều playlists cùng lúc (batch)
   * Tham số đầu vào: playlistIds — mảng ID cần xóa
   * Tham số đầu ra: Promise<{ deletedCount: number }>
   * Khi nào sử dụng: User multi-select → xóa lô playlists
   */
  deletePlaylists: async (playlistIds: string[]): Promise<{ deletedCount: number }> => {
    console.log('📻 [Radio] Xóa batch playlists:', playlistIds.length);
    const response = await apiClient.delete('/playlists/batch', { data: { ids: playlistIds } });
    return response.data;
  },

  /**
   * Mục đích: Xóa nhiều items khỏi playlist cùng lúc (batch)
   * Tham số đầu vào: playlistId, itemIds — mảng ID items cần xóa
   * Tham số đầu ra: Promise<{ deletedCount: number }>
   * Khi nào sử dụng: User multi-select items → xóa lô
   */
  deletePlaylistItems: async (
    playlistId: string,
    itemIds: string[],
  ): Promise<{ deletedCount: number }> => {
    console.log('📻 [Radio] Xóa batch items:', itemIds.length, 'từ playlist:', playlistId);
    const response = await apiClient.delete(`/playlists/${playlistId}/items/batch`, {
      data: { itemIds },
    });
    return response.data;
  },

  // =======================
  // Audio Caching (T-03, T-04)
  // =======================

  /**
   * Mục đích: Lưu audio URL + timestamps sau khi sinh TTS
   * Tham số đầu vào: playlistId, itemId, audioUrl, audioTimestamps
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Sau generateConversationAudio() thành công → cache vào DB
   */
  updateTrackAudio: async (
    playlistId: string,
    itemId: string,
    audioUrl: string,
    audioTimestamps?: {startTime: number; endTime: number}[],
  ): Promise<void> => {
    console.log('📻 [Radio] Lưu audio URL cho track:', itemId);
    await apiClient.put(`/playlists/${playlistId}/items/${itemId}/audio`, {
      audioUrl,
      ...(audioTimestamps ? {audioTimestamps} : {}),
    });
  },
};


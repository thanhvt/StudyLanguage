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

// =======================
// Radio API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Radio Mode
 * Tham số đầu vào: duration (1|30|60|120 phút)
 * Tham số đầu ra: RadioPlaylistResult
 * Khi nào sử dụng:
 *   - RadioScreen: gọi getPreview() để hiện info trước khi generate
 *   - RadioScreen: gọi generate() khi user xác nhận tạo playlist
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
   * Mục đích: Generate playlist mới
   * Tham số đầu vào: duration (1|30|60|120 phút)
   * Tham số đầu ra: Promise<RadioPlaylistResult>
   * Khi nào sử dụng: User chọn duration → nhấn "Bắt đầu" → tạo playlist
   */
  generate: async (duration: number): Promise<RadioPlaylistResult> => {
    console.log('📻 [Radio] Generating playlist, duration:', duration, 'phút');
    const response = await apiClient.post(
      '/radio/generate',
      {duration},
      {timeout: 120000}, // 2 phút — generate text cho nhiều track
    );
    return response.data.data;
  },
};

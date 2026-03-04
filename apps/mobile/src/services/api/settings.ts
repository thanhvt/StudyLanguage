import {apiClient} from './client';

// =======================
// Types cho Settings API
// =======================

/** Cấu trúc audio settings đồng bộ lên server */
export interface SyncAudioSettings {
  backgroundMusic: {enabled: boolean; volume: number};
  musicDucking: boolean;
  soundEffects: boolean;
  autoPlay: boolean;
}

/** Cấu trúc privacy settings đồng bộ lên server */
export interface SyncPrivacySettings {
  saveRecordings: boolean;
  dataSync: boolean;
}

/** Payload gom toàn bộ settings gửi lên server */
export interface SettingsPayload {
  theme: 'light' | 'dark';
  accentColor: string;
  language: string;
  audio: SyncAudioSettings;
  privacy: SyncPrivacySettings;
}

/** Response từ GET /user/settings */
export interface GetSettingsResponse {
  success: boolean;
  settings: SettingsPayload | Record<string, never>;
  updatedAt: string | null;
}

/** Response từ PUT /user/settings */
export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
}

// =======================
// Settings API Service
// =======================

/**
 * Mục đích: Service gọi API backend để đồng bộ settings across devices
 * Tham số đầu vào: SettingsPayload (theme, accent, language, audio, privacy)
 * Tham số đầu ra: GetSettingsResponse | UpdateSettingsResponse
 * Khi nào sử dụng:
 *   - usePreferencesSync: gọi getSettings() khi app startup / user đăng nhập
 *   - usePreferencesSync: gọi updateSettings() khi user thay đổi bất kỳ setting nào
 */
export const settingsApi = {
  /**
   * Mục đích: Lấy settings đã lưu trên server
   * Tham số đầu vào: không có
   * Tham số đầu ra: Promise<GetSettingsResponse>
   * Khi nào sử dụng: App startup → pull settings từ server → merge vào local
   */
  getSettings: async (): Promise<GetSettingsResponse> => {
    console.log('⚙️ [Settings] Lấy settings từ server...');
    const response = await apiClient.get('/user/settings');
    return response.data;
  },

  /**
   * Mục đích: Đẩy toàn bộ settings lên server (overwrite)
   * Tham số đầu vào: payload - SettingsPayload chứa tất cả settings
   * Tham số đầu ra: Promise<UpdateSettingsResponse>
   * Khi nào sử dụng: Sau khi user thay đổi bất kỳ setting nào (debounce 1.5s)
   */
  updateSettings: async (
    payload: SettingsPayload,
  ): Promise<UpdateSettingsResponse> => {
    console.log('⚙️ [Settings] Đẩy settings lên server...');
    const response = await apiClient.put('/user/settings', {
      settings: payload,
    });
    return response.data;
  },
};

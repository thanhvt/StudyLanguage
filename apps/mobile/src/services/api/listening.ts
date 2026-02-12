import {apiClient} from './client';

// =======================
// Types cho Listening API
// =======================

/** Cấu hình để generate conversation */
export interface ListeningConfig {
  topic: string;
  /** Thời lượng (phút) — 1-20, hỗ trợ custom */
  durationMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  numExchanges?: number;
  includeVietnamese?: boolean;
  /** Số người nói: 2 (Dialog), 3 (Group), 4 (Team) */
  numSpeakers?: number;
  /** Từ khóa gợi ý nội dung (tối đa 200 ký tự) */
  keywords?: string;
}

/** Kịch bản có sẵn */
export type ScenarioType =
  | 'restaurant'
  | 'hotel'
  | 'shopping'
  | 'airport'
  | 'hospital'
  | 'job_interview'
  | 'phone_call'
  | 'small_talk';

/** Một lượt trao đổi trong hội thoại */
export interface ConversationExchange {
  speaker: string;
  text: string;
  vietnamese?: string;
}

/** Kết quả trả về từ API generate */
export interface ConversationResult {
  conversation: ConversationExchange[];
  title?: string;
  summary?: string;
  vocabulary?: string[];
}

// =======================
// API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Listening feature
 * Khi nào sử dụng: ConfigScreen gọi generate, PlayerScreen hiển thị kết quả
 *   - generateConversation: User nhấn "Tạo bài nghe" ở ConfigScreen
 *   - generateScenario: User chọn kịch bản có sẵn
 */
export const listeningApi = {
  /**
   * Mục đích: Sinh hội thoại theo chủ đề tự do
   * Tham số đầu vào: config (ListeningConfig)
   * Tham số đầu ra: Promise<ConversationResult>
   * Khi nào sử dụng: User nhấn "Tạo bài nghe" sau khi chọn topic, duration, level
   */
  generateConversation: async (
    config: ListeningConfig,
  ): Promise<ConversationResult> => {
    const response = await apiClient.post(
      '/conversation-generator/generate',
      config,
    );
    return response.data;
  },

  /**
   * Mục đích: Sinh hội thoại từ kịch bản có sẵn (restaurant, hotel...)
   * Tham số đầu vào: type (ScenarioType), customContext (string, optional)
   * Tham số đầu ra: Promise<ConversationResult>
   * Khi nào sử dụng: User chọn 1 trong 8 kịch bản nhanh ở ConfigScreen
   */
  generateScenario: async (
    type: ScenarioType,
    customContext?: string,
  ): Promise<ConversationResult> => {
    const params: Record<string, string> = {type};
    if (customContext) {
      params.customContext = customContext;
    }
    const response = await apiClient.get(
      '/conversation-generator/scenario',
      {params},
    );
    return response.data;
  },
};

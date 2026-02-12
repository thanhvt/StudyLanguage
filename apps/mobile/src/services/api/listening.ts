import {apiClient} from './client';

// =======================
// Types cho Listening API
// =======================

/** Cấu hình để generate conversation */
export interface ListeningConfig {
  topic: string;
  /** Thời lượng (phút) — backend chấp nhận 5-15 */
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
  /** Cụm từ quan trọng trong câu */
  keyPhrases?: string[];
}

/** Kết quả trả về sau khi đã map từ backend */
export interface ConversationResult {
  conversation: ConversationExchange[];
  title?: string;
  summary?: string;
  vocabulary?: string[];
}

/** Timestamp cho từng câu hội thoại — sync audio với transcript */
export interface ConversationTimestamp {
  /** Index câu hội thoại (0-based) */
  lineIndex: number;
  /** Thời điểm bắt đầu (giây) */
  startTime: number;
  /** Thời điểm kết thúc (giây) */
  endTime: number;
  /** Speaker name */
  speaker: string;
}

/** Kết quả sinh audio TTS từ backend */
export interface AudioGenerationResult {
  /** URL audio file (có thể là URL tạm hoặc CDN) */
  audioUrl: string;
  /** Timestamps cho từng câu — dùng để sync transcript */
  timestamps: ConversationTimestamp[];
}

// =======================
// Backend Response Types (raw, chưa map)
// =======================

/**
 * Mục đích: Type mô tả đúng response từ backend (Groq API)
 * Khi nào sử dụng: Internal — dùng trong mapBackendResponse để transform
 * Lưu ý: Backend trả "script" + "translation", mobile dùng "conversation" + "vietnamese"
 */
interface BackendExchange {
  speaker: string;
  text: string;
  /** Backend dùng "translation" thay vì "vietnamese" */
  translation?: string;
  keyPhrases?: string[];
}

interface BackendVocabulary {
  word: string;
  meaning: string;
  example: string;
}

interface BackendResponse {
  /** Backend trả "script" thay vì "conversation" */
  script?: BackendExchange[];
  /** Fallback: một số endpoint có thể trả "conversation" trực tiếp */
  conversation?: BackendExchange[];
  title?: string;
  summary?: string;
  /** Backend trả vocabulary là object[], mobile dùng string[] */
  vocabulary?: BackendVocabulary[] | string[];
}

// =======================
// Mapper
// =======================

/**
 * Mục đích: Chuyển đổi response backend sang format mobile
 * Tham số đầu vào: raw (BackendResponse) — response gốc từ API
 * Tham số đầu ra: ConversationResult — format mobile dùng
 * Khi nào sử dụng: Sau mỗi API call, trước khi return cho store/screen
 *   - script[] → conversation[]
 *   - translation → vietnamese
 *   - vocabulary objects → strings
 */
function mapBackendResponse(raw: BackendResponse): ConversationResult {
  // Ưu tiên "script" (format backend chính), fallback "conversation"
  const exchanges = raw.script ?? raw.conversation ?? [];

  const conversation: ConversationExchange[] = exchanges.map(item => ({
    speaker: item.speaker,
    text: item.text,
    // Map "translation" (backend) → "vietnamese" (mobile)
    vietnamese: item.translation,
    keyPhrases: item.keyPhrases,
  }));

  // Vocabulary: backend trả object {word, meaning, example} → mobile chỉ cần string
  let vocabulary: string[] = [];
  if (Array.isArray(raw.vocabulary) && raw.vocabulary.length > 0) {
    const first = raw.vocabulary[0];
    if (typeof first === 'string') {
      // Đã là string[] rồi
      vocabulary = raw.vocabulary as string[];
    } else {
      // Object[] → chuyển thành "word — meaning"
      vocabulary = (raw.vocabulary as BackendVocabulary[]).map(
        v => `${v.word} — ${v.meaning}`,
      );
    }
  }

  return {
    conversation,
    title: raw.title,
    summary: raw.summary,
    vocabulary,
  };
}

/**
 * Mục đích: Giới hạn durationMinutes về khoảng backend chấp nhận (5-15)
 * Tham số đầu vào: minutes (number) — giá trị user chọn
 * Tham số đầu ra: number — giá trị đã clamp
 * Khi nào sử dụng: Trước khi gửi request lên backend
 */
function clampDuration(minutes: number): number {
  return Math.max(5, Math.min(15, minutes));
}

// =======================
// API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Listening feature
 * Khi nào sử dụng: ConfigScreen gọi generate, PlayerScreen hiển thị kết quả
 *   - generateConversation: User nhấn "Tạo bài nghe" ở ConfigScreen
 *   - generateScenario: User chọn kịch bản có sẵn
 *   - generateConversationAudio: PlayerScreen gọi sau khi có conversation → sinh audio TTS
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
    // Clamp duration để tránh 400 từ backend DTO validation (min=5, max=15)
    const payload = {
      topic: config.topic,
      durationMinutes: clampDuration(config.durationMinutes),
      level: config.level,
      numExchanges: config.numExchanges,
      includeVietnamese: config.includeVietnamese,
      // Backend DTO đã hỗ trợ 2 fields này
      numSpeakers: config.numSpeakers,
      keywords: config.keywords,
    };

    console.log('🎧 [Listening] Gửi request generate:', payload);

    const response = await apiClient.post(
      '/conversation-generator/generate',
      payload,
    );

    console.log('✅ [Listening] Nhận response, đang map dữ liệu...');
    return mapBackendResponse(response.data);
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

    console.log('🎧 [Listening] Gửi request scenario:', params);

    const response = await apiClient.get(
      '/conversation-generator/scenario',
      {params},
    );

    console.log('✅ [Listening] Nhận response scenario, đang map dữ liệu...');
    return mapBackendResponse(response.data);
  },

  /**
   * Mục đích: Sinh audio TTS cho hội thoại đã generate
   * Tham số đầu vào: conversation (ConversationExchange[]) — danh sách câu hội thoại
   * Tham số đầu ra: Promise<AudioGenerationResult> — audioUrl + timestamps
   * Khi nào sử dụng: PlayerScreen gọi sau khi nhận được conversation từ store
   *   - Gọi POST /ai/generate-conversation-audio
   *   - Nhận về URL audio + timestamps cho từng câu
   *   - Timestamps dùng để sync highlight transcript theo thời gian phát
   */
  generateConversationAudio: async (
    conversation: ConversationExchange[],
  ): Promise<AudioGenerationResult> => {
    const payload = {
      conversation: conversation.map(line => ({
        speaker: line.speaker,
        text: line.text,
      })),
    };

    console.log(
      '🔊 [Listening] Gửi request sinh audio TTS, số câu:',
      conversation.length,
    );

    const response = await apiClient.post(
      '/ai/generate-conversation-audio',
      payload,
      {timeout: 180000}, // 3 phút — sinh audio chậm hơn generate text
    );

    console.log('✅ [Listening] Nhận audio URL:', response.data.audioUrl);
    return response.data as AudioGenerationResult;
  },
};

// =======================
// Bookmark Types
// =======================

/** Dữ liệu bookmark trả về từ server */
export interface SentenceBookmark {
  id: string;
  historyEntryId?: string;
  sentenceIndex: number;
  speaker: string;
  sentenceText: string;
  sentenceTranslation?: string;
  topic?: string;
  createdAt: string;
}

// =======================
// Bookmark API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho tính năng Bookmark câu
 * Khi nào sử dụng: PlayerScreen long press câu → tạo/xóa bookmark
 *   - create: User long press câu chưa bookmark → POST /bookmarks
 *   - getBySession: Load bookmarks khi resume session → GET /bookmarks/session/:id
 *   - delete: User long press câu đã bookmark → DELETE /bookmarks/:id
 *   - deleteByIndex: Toggle off khi chưa biết bookmark ID
 */
export const bookmarkApi = {
  /**
   * Mục đích: Tạo bookmark mới cho 1 câu trong transcript
   * Tham số đầu vào: data chứa sentenceIndex, speaker, sentenceText, etc.
   * Tham số đầu ra: Promise<{success, bookmark, alreadyExists}>
   * Khi nào sử dụng: User long press câu chưa được bookmark
   */
  create: async (data: {
    historyEntryId?: string;
    sentenceIndex: number;
    speaker: string;
    sentenceText: string;
    sentenceTranslation?: string;
    topic?: string;
  }): Promise<{success: boolean; bookmark: SentenceBookmark; alreadyExists: boolean}> => {
    console.log('⭐ [Bookmark] Tạo bookmark cho câu index:', data.sentenceIndex);
    const response = await apiClient.post('/bookmarks', data);
    return response.data;
  },

  /**
   * Mục đích: Lấy danh sách bookmarks theo session cụ thể
   * Tham số đầu vào: historyEntryId (string) — ID session trong learning_history
   * Tham số đầu ra: Promise<{success, bookmarks, count}>
   * Khi nào sử dụng: PlayerScreen mở lại session đã có → load bookmark state
   */
  getBySession: async (
    historyEntryId: string,
  ): Promise<{success: boolean; bookmarks: SentenceBookmark[]; count: number}> => {
    console.log('⭐ [Bookmark] Lấy bookmarks cho session:', historyEntryId);
    const response = await apiClient.get(`/bookmarks/session/${historyEntryId}`);
    return response.data;
  },

  /**
   * Mục đích: Xóa bookmark theo ID
   * Tham số đầu vào: bookmarkId (string)
   * Tham số đầu ra: Promise<{success, message}>
   * Khi nào sử dụng: User long press lại câu đã bookmark để bỏ (khi có bookmark ID)
   */
  delete: async (
    bookmarkId: string,
  ): Promise<{success: boolean; message: string}> => {
    console.log('⭐ [Bookmark] Xóa bookmark:', bookmarkId);
    const response = await apiClient.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  },

  /**
   * Mục đích: Xóa bookmark theo sentence index (khi chưa biết bookmark ID)
   * Tham số đầu vào: historyEntryId (nullable), sentenceIndex
   * Tham số đầu ra: Promise<{success, message}>
   * Khi nào sử dụng: Toggle bookmark off trên PlayerScreen
   */
  deleteByIndex: async (data: {
    historyEntryId?: string;
    sentenceIndex: number;
  }): Promise<{success: boolean; message: string}> => {
    console.log('⭐ [Bookmark] Xóa bookmark theo index:', data.sentenceIndex);
    const response = await apiClient.post('/bookmarks/remove-by-index', data);
    return response.data;
  },
};

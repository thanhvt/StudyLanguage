import {apiClient} from './client';

// =======================
// Types cho Listening API
// =======================

/** Cấu hình để generate conversation */
export interface ListeningConfig {
  topic: string;
  /** Thời lượng (phút) — backend chấp nhận 5-30 */
  durationMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
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
  /** Map speaker → voice ID đã sử dụng (để hiển thị tên giọng đọc) */
  voiceMap?: Record<string, string>;
}

// =======================
// Voice Types cho TTS Settings
// =======================

/** Thông tin 1 giọng đọc từ backend */
export interface VoiceInfo {
  /** Voice ID (ví dụ: 'en-US-JennyNeural') */
  id: string;
  /** Tên hiển thị (ví dụ: 'Jenny') */
  name: string;
  /** Giới tính */
  gender: 'Male' | 'Female';
  /** Mô tả ngắn (ví dụ: 'Nữ US, tự nhiên') */
  description?: string;
  /** Danh sách emotion styles hỗ trợ */
  styles?: string[];
}

/** Cặp giọng multi-talker */
export interface MultiTalkerPair {
  /** Tên 2 speaker trong cặp (legacy field name) */
  pair?: string[];
  /** Tên 2 speaker trong cặp (backend field name) */
  speakers?: string[];
  /** Tên voice model */
  name?: string;
  /** Index cặp (0, 1, ...) */
  index?: number;
}

/** Response từ GET /ai/voices */
export interface VoicesResponse {
  voices: VoiceInfo[];
  multiTalker: MultiTalkerPair[];
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
 * Mục đích: Giới hạn durationMinutes về khoảng backend chấp nhận (5-30)
 * Tham số đầu vào: minutes (number) — giá trị user chọn
 * Tham số đầu ra: number — giá trị đã clamp
 * Khi nào sử dụng: Trước khi gửi request lên backend
 */
function clampDuration(minutes: number): number {
  return Math.max(5, Math.min(30, minutes));
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
      includeVietnamese: config.includeVietnamese,
      // Backend DTO đã hỗ trợ 2 fields này
      numSpeakers: config.numSpeakers,
      keywords: config.keywords,
    };

    console.log('🎧 [Listening] Gửi request generate:', payload);

    const response = await apiClient.post(
      '/conversation-generator/generate',
      payload,
      {timeout: 120000}, // 2 phút — API sinh hội thoại cần ~1 phút
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
   * Tham số đầu vào:
   *   - conversation (ConversationExchange[]) — danh sách câu hội thoại
   *   - ttsOptions (optional) — cấu hình TTS provider và voice
   * Tham số đầu ra: Promise<AudioGenerationResult> — audioUrl + timestamps
   * Khi nào sử dụng: PlayerScreen gọi sau khi nhận được conversation từ store
   *   - Gọi POST /ai/generate-conversation-audio
   *   - Nhận về URL audio + timestamps cho từng câu
   *   - Timestamps dùng để sync highlight transcript theo thời gian phát
   */
  generateConversationAudio: async (
    conversation: ConversationExchange[],
    ttsOptions?: {
      /** TTS provider — luôn là 'azure' */
      provider?: 'openai' | 'azure';
      /** Giọng ngẫu nhiên (AI tự chọn) */
      randomVoice?: boolean;
      /** Map giọng cho từng speaker (speakerLabel → voiceId) */
      voicePerSpeaker?: Record<string, string>;
      /** Multi-talker mode (DragonHD) */
      multiTalker?: boolean;
      /** Index cặp giọng multi-talker */
      multiTalkerPairIndex?: number;
      /** Emotion style cho Azure express-as (cheerful, sad, angry...) */
      emotion?: string;
      /** Pitch adjustment -20 to +20 (%) */
      pitch?: number;
      /** Rate adjustment -20 to +20 (%) */
      rate?: number;
      /** Volume 0-100 (%) */
      volume?: number;
      /** Cảm xúc ngẫu nhiên — API tự random emotion */
      randomEmotion?: boolean;
    },
  ): Promise<AudioGenerationResult> => {
    const payload: Record<string, unknown> = {
      conversation: conversation.map(line => ({
        speaker: line.speaker,
        text: line.text,
      })),
      // Luôn gửi provider = azure
      provider: ttsOptions?.provider ?? 'azure',
      // Các tuỳ chọn TTS
      ...(ttsOptions?.randomVoice !== undefined && {randomVoice: ttsOptions.randomVoice}),
      ...(ttsOptions?.voicePerSpeaker && {voicePerSpeaker: ttsOptions.voicePerSpeaker}),
      ...(ttsOptions?.multiTalker !== undefined && {multiTalker: ttsOptions.multiTalker}),
      ...(ttsOptions?.multiTalkerPairIndex !== undefined && {multiTalkerPairIndex: ttsOptions.multiTalkerPairIndex}),
      // Prosody & Emotion (Azure SSML)
      ...(ttsOptions?.emotion && ttsOptions.emotion !== 'default' && {emotion: ttsOptions.emotion}),
      ...(ttsOptions?.pitch !== undefined && ttsOptions.pitch !== 0 && {pitch: ttsOptions.pitch}),
      ...(ttsOptions?.rate !== undefined && ttsOptions.rate !== 0 && {rate: ttsOptions.rate}),
      ...(ttsOptions?.volume !== undefined && ttsOptions.volume !== 100 && {volume: ttsOptions.volume}),
      ...(ttsOptions?.randomEmotion !== undefined && {randomEmotion: ttsOptions.randomEmotion}),
    };

    console.log(
      '🔊 [Listening] Gửi request sinh audio TTS, số câu:',
      conversation.length,
      '| Provider:', ttsOptions?.provider ?? 'azure',
      '| Random:', ttsOptions?.randomVoice ?? true,
    );

    const response = await apiClient.post(
      '/ai/generate-conversation-audio',
      payload,
      {timeout: 180000}, // 3 phút — sinh audio chậm hơn generate text
    );

    console.log('✅ [Listening] Nhận audio URL:', response.data.audioUrl);
    return response.data as AudioGenerationResult;
  },

  /**
   * Mục đích: Lấy danh sách voices khả dụng để hiển thị trong TTS Settings
   * Tham số đầu vào: provider ('azure' | 'openai', mặc định 'azure')
   * Tham số đầu ra: Promise<VoicesResponse> — danh sách voices + multi-talker pairs
   * Khi nào sử dụng: TtsSettingsSheet mở → fetch voices 1 lần, cache trong component
   */
  fetchVoices: async (
    provider: 'azure' | 'openai' = 'azure',
  ): Promise<VoicesResponse> => {
    console.log('🔊 [Listening] Lấy danh sách giọng đọc, provider:', provider);
    const response = await apiClient.get('/ai/voices', {
      params: {provider},
    });
    console.log('✅ [Listening] Nhận', response.data.voices?.length ?? 0, 'giọng đọc');
    return response.data as VoicesResponse;
  },

  /**
   * Mục đích: Phát thử giọng đọc (preview 1 câu sample)
   * Tham số đầu vào:
   *   - text: Câu sample (ví dụ: "Hello, how are you today?")
   *   - voice: Voice ID (ví dụ: 'en-US-JennyNeural')
   *   - emotion: Emotion style (optional, ví dụ: 'cheerful')
   * Tham số đầu ra: Promise<Blob> — audio data
   * Khi nào sử dụng: User nhấn nút ▶ trên voice item trong TTS Settings
   */
  previewVoice: async (
    text: string,
    voice: string,
    emotion?: string,
  ): Promise<ArrayBuffer> => {
    console.log('🔊 [Listening] Preview giọng:', voice, '| Emotion:', emotion ?? 'default');
    const response = await apiClient.post(
      '/ai/text-to-speech',
      {
        text,
        provider: 'azure',
        voice,
        ...(emotion && emotion !== 'default' && {emotion}),
      },
      {
        responseType: 'arraybuffer',
        timeout: 15000, // 15s cho preview ngắn
      },
    );
    console.log('✅ [Listening] Nhận audio preview, size:', response.data.byteLength, 'bytes');
    return response.data;
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

  /**
   * Mục đích: Lấy tất cả bookmarks (không phân biệt session) — cho tab Từ vựng
   * Tham số đầu vào: page (number), limit (number)
   * Tham số đầu ra: Promise<{bookmarks: SentenceBookmark[]; total: number}>
   * Khi nào sử dụng: VocabularyTab trong HistoryScreen load danh sách bookmark
   */
  getAll: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<{bookmarks: SentenceBookmark[]; total: number}> => {
    console.log('⭐ [Bookmark] Lấy tất cả bookmarks, trang:', page);
    try {
      const response = await apiClient.get('/bookmarks', {
        params: {page, limit},
      });
      return response.data;
    } catch (err: any) {
      // Fallback: nếu backend chưa có endpoint GET /bookmarks → trả rỗng
      console.warn('⚠️ [Bookmark] API getAll chưa sẵn sàng, trả rỗng:', err?.message);
      return {bookmarks: [], total: 0};
    }
  },
};

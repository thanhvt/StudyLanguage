import {apiClient} from './client';

// =======================
// Types cho Reading API
// =======================

/** Cấu hình để generate bài đọc */
export interface ReadingConfig {
  /** Chủ đề bài đọc (bắt buộc) */
  topic: string;
  /** Trình độ: beginner / intermediate / advanced */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Độ dài: short (~200 từ) / medium (~400 từ) / long (~600 từ) */
  length: 'short' | 'medium' | 'long';
}

/** Kết quả bài đọc trả về từ backend */
export interface ArticleResult {
  /** Tiêu đề bài đọc */
  title: string;
  /** Nội dung bài đọc (markdown hoặc plain text) */
  content: string;
  /** Số từ trong bài */
  wordCount: number;
  /** Thời gian đọc ước tính (phút) */
  readingTime: number;
  /** Trình độ bài đọc */
  level: string;
}

/** Từ đã lưu */
export interface SavedWord {
  id: string;
  word: string;
  meaning?: string;
  context?: string;
  articleId?: string;
  createdAt: string;
}

// =======================
// Backend Response Types
// =======================

/**
 * Mục đích: Type mô tả response gốc từ backend
 * Khi nào sử dụng: Internal — dùng trong mapBackendArticle để transform
 */
interface BackendArticleResponse {
  title?: string;
  content?: string;
  article?: string;
  wordCount?: number;
  word_count?: number;
  readingTime?: number;
  reading_time?: number;
  level?: string;
  difficulty?: string;
}

// =======================
// Mapper
// =======================

/**
 * Mục đích: Chuyển đổi response backend sang format mobile
 * Tham số đầu vào: raw (BackendArticleResponse) — response gốc từ API
 * Tham số đầu ra: ArticleResult — format mobile dùng
 * Khi nào sử dụng: Sau API call generateArticle, trước khi return cho store
 *   - content / article → content
 *   - word_count / wordCount → wordCount
 *   - reading_time / readingTime → readingTime
 *   - difficulty / level → level
 */
function mapBackendArticle(raw: BackendArticleResponse): ArticleResult {
  const content = raw.content ?? raw.article ?? '';
  const wordCount = raw.wordCount ?? raw.word_count ?? content.split(/\s+/).length;
  const readingTime = raw.readingTime ?? raw.reading_time ?? Math.ceil(wordCount / 200);

  return {
    title: raw.title ?? 'Bài đọc',
    content,
    wordCount,
    readingTime,
    level: raw.level ?? raw.difficulty ?? 'intermediate',
  };
}

/**
 * Mục đích: Map length config sang wordCount cho backend
 * Tham số đầu vào: length ('short' | 'medium' | 'long')
 * Tham số đầu ra: number — số từ gợi ý
 * Khi nào sử dụng: Trước khi gửi request lên backend
 */
function lengthToWordCount(length: 'short' | 'medium' | 'long'): number {
  const mapping = {short: 200, medium: 400, long: 600};
  return mapping[length] ?? 400;
}

// =======================
// API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Reading feature
 * Khi nào sử dụng: ConfigScreen gọi generate, ArticleScreen hiển thị kết quả
 *   - generateArticle: User nhấn "Tạo bài đọc" ở ConfigScreen
 *   - saveWord: User tap từ → chọn "Lưu" trong DictionaryPopup
 *   - getSavedWords: Xem danh sách từ đã lưu
 */
export const readingApi = {
  /**
   * Mục đích: Sinh bài đọc theo chủ đề và trình độ
   * Tham số đầu vào: config (ReadingConfig) — topic, level, length
   * Tham số đầu ra: Promise<ArticleResult>
   * Khi nào sử dụng: User nhấn "Tạo bài đọc" sau khi chọn cấu hình
   */
  generateArticle: async (config: ReadingConfig): Promise<ArticleResult> => {
    const payload = {
      topic: config.topic,
      level: config.level,
      wordCount: lengthToWordCount(config.length),
    };

    console.log('📖 [Reading] Gửi request generate article:', payload);

    const response = await apiClient.post(
      '/reading/generate-article',
      payload,
    );

    console.log('✅ [Reading] Nhận response, đang map dữ liệu...');
    return mapBackendArticle(response.data);
  },

  /**
   * Mục đích: Lưu từ mới vào danh sách saved words
   * Tham số đầu vào: data { word, meaning?, context?, articleId? }
   * Tham số đầu ra: Promise<{success: boolean; word: SavedWord}>
   * Khi nào sử dụng: User tap từ trong bài đọc → chọn "Lưu vào từ vựng"
   */
  saveWord: async (data: {
    word: string;
    meaning?: string;
    context?: string;
    articleId?: string;
  }): Promise<{success: boolean; word: SavedWord}> => {
    console.log('📖 [Reading] Lưu từ mới:', data.word);
    const response = await apiClient.post('/reading/saved-words', data);
    return response.data;
  },

  /**
   * Mục đích: Lấy danh sách từ đã lưu (có phân trang)
   * Tham số đầu vào: page (number), limit (number)
   * Tham số đầu ra: Promise<{words: SavedWord[]; total: number}>
   * Khi nào sử dụng: Xem danh sách từ vựng đã lưu
   */
  getSavedWords: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<{words: SavedWord[]; total: number}> => {
    console.log('📖 [Reading] Lấy danh sách từ đã lưu, trang:', page);
    const response = await apiClient.get('/reading/saved-words', {
      params: {page, limit},
    });
    return response.data;
  },

  /**
   * Mục đích: Xóa từ khỏi danh sách đã lưu
   * Tham số đầu vào: wordId (string) — ID của từ cần xóa
   * Tham số đầu ra: Promise<{success: boolean}>
   * Khi nào sử dụng: User xóa từ trong danh sách saved words
   */
  deleteWord: async (wordId: string): Promise<{success: boolean}> => {
    console.log('📖 [Reading] Xóa từ:', wordId);
    const response = await apiClient.delete(`/reading/saved-words/${wordId}`);
    return response.data;
  },

  /**
   * Mục đích: Phân tích kết quả luyện đọc bằng AI
   * Tham số đầu vào: originalText (string) — text gốc, userTranscript (string) — text user đọc
   * Tham số đầu ra: Promise<PracticeAnalysis> — accuracy, fluencyScore, errors, feedback
   * Khi nào sử dụng: User đọc xong 1 câu/đoạn → gửi transcript để AI phân tích
   */
  analyzePractice: async (
    originalText: string,
    userTranscript: string,
  ): Promise<{
    accuracy: number;
    fluencyScore: number;
    errors: Array<{
      original: string;
      spoken: string;
      type: string;
      suggestion?: string;
    }>;
    feedback: string;
  }> => {
    console.log('📖 [Reading] Gửi phân tích practice...');
    const response = await apiClient.post('/reading/analyze-practice', {
      originalText,
      userTranscript,
    });
    return response.data;
  },

  /**
   * Mục đích: Lưu bài đọc vào lịch sử (History)
   * Tham số đầu vào: article (ArticleResult) — bài đọc cần lưu, savedWordsCount (number)
   * Tham số đầu ra: Promise<{success: boolean; id: string}>
   * Khi nào sử dụng: User nhấn nút "Lưu bài" ở bottom bar trong ArticleScreen
   */
  saveReadingSession: async (
    article: ArticleResult,
    savedWordsCount: number = 0,
  ): Promise<{success: boolean; id: string}> => {
    console.log('📖 [Reading] Lưu bài đọc vào lịch sử:', article.title);
    const response = await apiClient.post('/history', {
      type: 'reading',
      topic: article.title,
      content: {
        title: article.title,
        wordCount: article.wordCount,
        level: article.level,
        readingTime: article.readingTime,
        savedWordsCount,
      },
      durationMinutes: article.readingTime,
    });
    return response.data;
  },
};

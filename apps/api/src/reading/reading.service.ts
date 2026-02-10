/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConversationGeneratorService } from '../conversation-generator/conversation-generator.service';

/**
 * ReadingService - Service xử lý nghiệp vụ cho Reading Module
 *
 * Mục đích: Sinh bài đọc, phân tích reading practice, quản lý saved words
 * Tham số đầu vào: userId, DTOs
 * Tham số đầu ra: Articles, analysis results, saved words
 * Khi nào sử dụng: Được inject vào ReadingController
 */
@Injectable()
export class ReadingService {
  private readonly logger = new Logger(ReadingService.name);
  private supabase: SupabaseClient;

  constructor(
    private readonly conversationGeneratorService: ConversationGeneratorService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Sinh bài đọc theo chủ đề và level
   *
   * Mục đích: Dùng Groq AI để generate bài đọc tiếng Anh
   * @param dto - { topic, level, wordCount }
   * @returns Generated article { title, content, wordCount, level }
   * Khi nào sử dụng: POST /reading/generate-article
   */
  async generateArticle(dto: {
    topic: string;
    level: string;
    wordCount?: number;
  }) {
    try {
      const wordCount = dto.wordCount || 300;
      const prompt = `Write an English article about "${dto.topic}" at ${dto.level} level.
Requirements:
- Approximately ${wordCount} words
- Level: ${dto.level} (adjust vocabulary and grammar complexity accordingly)
- Include a title
- Use clear paragraphs
- Include some interesting vocabulary words

Format your response as JSON:
{
  "title": "Article Title",
  "content": "Full article text...",
  "vocabularyHighlights": ["word1", "word2", "word3"]
}`;

      const systemPrompt = `You are an expert English language teacher creating reading materials. 
Levels: beginner (A1-A2), intermediate (B1-B2), advanced (C1-C2).
Always respond with valid JSON only.`;

      const result = await this.conversationGeneratorService.generateText(
        prompt,
        systemPrompt,
      );

      // Parse JSON response
      try {
        const parsed = JSON.parse(result);
        return {
          success: true,
          article: {
            title: parsed.title || dto.topic,
            content: parsed.content || result,
            level: dto.level,
            wordCount: (parsed.content || result).split(/\s+/).length,
            vocabularyHighlights: parsed.vocabularyHighlights || [],
          },
        };
      } catch {
        // Nếu không parse được JSON, trả về raw text
        return {
          success: true,
          article: {
            title: dto.topic,
            content: result,
            level: dto.level,
            wordCount: result.split(/\s+/).length,
            vocabularyHighlights: [],
          },
        };
      }
    } catch (error) {
      this.logger.error('[ReadingService] Lỗi sinh bài đọc:', error);
      throw new InternalServerErrorException('Lỗi sinh bài đọc');
    }
  }

  /**
   * Phân tích kết quả luyện đọc
   *
   * Mục đích: So sánh transcript đọc của user với text gốc
   * @param dto - { originalText, userTranscript }
   * @returns Analysis { accuracy, fluencyScore, errors, feedback }
   * Khi nào sử dụng: POST /reading/analyze-practice
   */
  async analyzePractice(dto: {
    originalText: string;
    userTranscript: string;
  }) {
    try {
      const prompt = `Compare the original text with the user's reading transcript and provide analysis.

Original text: "${dto.originalText}"
User's transcript: "${dto.userTranscript}"

Analyze:
1. Overall accuracy (0-100%)
2. Words that were mispronounced or skipped
3. Fluency assessment
4. Specific feedback for improvement

Respond in JSON:
{
  "accuracy": 85,
  "fluencyScore": 80,
  "errors": [{"word": "...", "issue": "mispronounced/skipped/added"}],
  "feedback": "Overall feedback...",
  "tips": ["tip1", "tip2"]
}`;

      const result = await this.conversationGeneratorService.generateText(
        prompt,
        'You are an expert pronunciation teacher. Analyze reading practice and provide constructive feedback. Always respond with valid JSON only.',
      );

      try {
        const parsed = JSON.parse(result);
        return { success: true, analysis: parsed };
      } catch {
        return {
          success: true,
          analysis: {
            accuracy: 0,
            fluencyScore: 0,
            errors: [],
            feedback: result,
            tips: [],
          },
        };
      }
    } catch (error) {
      this.logger.error('[ReadingService] Lỗi phân tích reading:', error);
      throw new InternalServerErrorException('Lỗi phân tích bài đọc');
    }
  }

  /**
   * Lấy danh sách từ đã lưu
   *
   * Mục đích: Query saved_words table với pagination
   * @param userId - ID của user
   * @param page - Trang hiện tại (1-indexed)
   * @param limit - Số lượng mỗi trang
   * @returns Danh sách saved words
   * Khi nào sử dụng: GET /reading/saved-words
   */
  async getSavedWords(userId: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from('saved_words')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('[ReadingService] Lỗi lấy saved words:', error);
        throw new InternalServerErrorException('Lỗi lấy danh sách từ');
      }

      return {
        success: true,
        words: (data || []).map((w: any) => ({
          id: w.id,
          word: w.word,
          meaning: w.meaning,
          context: w.context,
          articleId: w.article_id,
          createdAt: w.created_at,
        })),
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[ReadingService] Lỗi lấy saved words:', error);
      throw new InternalServerErrorException('Lỗi lấy danh sách từ');
    }
  }

  /**
   * Lưu từ mới vào danh sách
   *
   * Mục đích: Insert từ mới vào saved_words table
   * @param userId - ID của user
   * @param dto - { word, meaning?, context?, articleId? }
   * @returns Từ đã lưu
   * Khi nào sử dụng: POST /reading/saved-words
   */
  async saveWord(
    userId: string,
    dto: { word: string; meaning?: string; context?: string; articleId?: string },
  ) {
    try {
      const { data, error } = await this.supabase
        .from('saved_words')
        .insert({
          user_id: userId,
          word: dto.word,
          meaning: dto.meaning || null,
          context: dto.context || null,
          article_id: dto.articleId || null,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('[ReadingService] Lỗi lưu từ:', error);
        throw new InternalServerErrorException('Lỗi lưu từ vựng');
      }

      return {
        success: true,
        word: {
          id: data.id,
          word: data.word,
          meaning: data.meaning,
          context: data.context,
          createdAt: data.created_at,
        },
        message: `Đã lưu từ "${dto.word}"`,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[ReadingService] Lỗi lưu từ:', error);
      throw new InternalServerErrorException('Lỗi lưu từ vựng');
    }
  }

  /**
   * Xóa từ khỏi danh sách
   *
   * Mục đích: Delete từ khỏi saved_words table
   * @param userId - ID của user
   * @param wordId - ID của từ cần xóa
   * @returns Kết quả xóa
   * Khi nào sử dụng: DELETE /reading/saved-words/:id
   */
  async deleteWord(userId: string, wordId: string) {
    try {
      const { error } = await this.supabase
        .from('saved_words')
        .delete()
        .eq('id', wordId)
        .eq('user_id', userId);

      if (error) {
        this.logger.error('[ReadingService] Lỗi xóa từ:', error);
        throw new InternalServerErrorException('Lỗi xóa từ vựng');
      }

      return {
        success: true,
        message: 'Đã xóa từ',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[ReadingService] Lỗi xóa từ:', error);
      throw new InternalServerErrorException('Lỗi xóa từ vựng');
    }
  }
}

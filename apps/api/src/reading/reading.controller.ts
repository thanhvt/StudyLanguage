/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReadingService } from './reading.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

// ==================== DTOs ====================

/**
 * DTO cho sinh bài đọc
 *
 * Mục đích: Validate input POST /reading/generate-article
 * Tham số: topic (bắt buộc), level, wordCount
 * Khi nào sử dụng: User chọn chủ đề và level để sinh bài đọc
 */
class GenerateArticleDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsOptional()
  level?: string = 'intermediate';

  @IsNumber()
  @IsOptional()
  wordCount?: number;
}

/**
 * DTO cho phân tích reading practice
 *
 * Mục đích: Validate input POST /reading/analyze-practice
 * Khi nào sử dụng: Sau khi user đọc xong bài và có transcript
 */
class AnalyzePracticeDto {
  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsNotEmpty()
  userTranscript: string;
}

/**
 * DTO cho lưu từ mới
 *
 * Mục đích: Validate input POST /reading/saved-words
 * Khi nào sử dụng: User tap vào từ khi đọc → lưu lại
 */
class SaveWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsOptional()
  meaning?: string;

  @IsString()
  @IsOptional()
  context?: string;

  @IsString()
  @IsOptional()
  articleId?: string;
}

// ==================== Controller ====================

/**
 * ReadingController - API endpoints cho Reading feature
 *
 * Mục đích: Sinh bài đọc, phân tích practice, quản lý saved words
 * Base path: /api/reading
 * Khi nào sử dụng: Reading screen trên mobile app
 */
@Controller('reading')
@UseGuards(SupabaseAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  /**
   * POST /api/reading/generate-article
   *
   * Mục đích: Sinh bài đọc theo chủ đề và level
   * @param dto - { topic, level?, wordCount? }
   * @returns Generated article
   * Khi nào sử dụng: User chọn "Generate New Article"
   */
  @Post('generate-article')
  @HttpCode(HttpStatus.OK)
  async generateArticle(@Body() dto: GenerateArticleDto) {
    return this.readingService.generateArticle({
      topic: dto.topic,
      level: dto.level || 'intermediate',
      wordCount: dto.wordCount,
    });
  }

  /**
   * POST /api/reading/analyze-practice
   *
   * Mục đích: Phân tích kết quả đọc (so sánh transcript với gốc)
   * @param dto - { originalText, userTranscript }
   * @returns Analysis { accuracy, fluencyScore, errors, feedback }
   * Khi nào sử dụng: Sau khi user đọc xong bài
   */
  @Post('analyze-practice')
  @HttpCode(HttpStatus.OK)
  async analyzePractice(@Body() dto: AnalyzePracticeDto) {
    return this.readingService.analyzePractice(dto);
  }

  /**
   * GET /api/reading/saved-words?page=1&limit=20
   *
   * Mục đích: Lấy danh sách từ đã lưu (paginated)
   * @param page - Trang hiện tại
   * @param limit - Số lượng mỗi trang
   * @returns Danh sách words + pagination info
   * Khi nào sử dụng: Saved Words screen
   */
  @Get('saved-words')
  @HttpCode(HttpStatus.OK)
  async getSavedWords(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // M3: Validate pagination bounds
    const parsedPage = parseInt(page || '1', 10);
    const parsedLimit = parseInt(limit || '20', 10);
    const safePage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const safeLimit = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);

    return this.readingService.getSavedWords(
      req.user.id,
      safePage,
      safeLimit,
    );
  }

  /**
   * POST /api/reading/saved-words
   *
   * Mục đích: Lưu từ mới vào danh sách
   * @param dto - { word, meaning?, context?, articleId? }
   * @returns Từ đã lưu
   * Khi nào sử dụng: User tap từ → chọn "Save"
   */
  @Post('saved-words')
  @HttpCode(HttpStatus.CREATED)
  async saveWord(@Req() req: any, @Body() dto: SaveWordDto) {
    return this.readingService.saveWord(req.user.id, dto);
  }

  /**
   * DELETE /api/reading/saved-words/:id
   *
   * Mục đích: Xóa từ khỏi danh sách đã lưu
   * @param id - ID của từ cần xóa
   * @returns Kết quả xóa
   * Khi nào sử dụng: User swipe-to-delete trong Saved Words screen
   */
  @Delete('saved-words/:id')
  @HttpCode(HttpStatus.OK)
  async deleteWord(@Req() req: any, @Param('id') id: string) {
    return this.readingService.deleteWord(req.user.id, id);
  }
}

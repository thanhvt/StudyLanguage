import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * DictionaryController - API endpoint tra từ điển
 *
 * Mục đích: Proxy tới Free Dictionary API cho Reading feature
 * Base path: /api/dictionary
 * Khi nào sử dụng: Tap-to-translate trong Reading screen
 */
@Controller('dictionary')
@UseGuards(SupabaseAuthGuard)
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  /**
   * GET /api/dictionary/lookup?word=serendipity
   *
   * Mục đích: Tra nghĩa, IPA, ví dụ cho 1 từ tiếng Anh
   * @param word - Từ cần tra
   * @returns { success, result: { word, ipa, audio, meanings } }
   * Khi nào sử dụng: User tap vào từ khi đọc bài
   */
  @Get('lookup')
  @HttpCode(HttpStatus.OK)
  async lookup(@Query('word') word: string) {
    if (!word || word.trim().length === 0) {
      throw new BadRequestException('Vui lòng cung cấp từ cần tra');
    }

    const result = await this.dictionaryService.lookup(word);
    return { success: true, result };
  }
}

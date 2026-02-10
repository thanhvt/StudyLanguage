/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeakingService } from './speaking.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

// ==================== DTOs ====================

/**
 * DTO cho voice clone request
 *
 * Mục đích: Validate input POST /speaking/voice-clone
 * Khi nào sử dụng: User muốn nghe AI nói bằng giọng mình
 *
 * TODO [VOICE-CLONE]: Extend DTO khi implement full feature
 */
class VoiceCloneDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

// ==================== Controller ====================

/**
 * SpeakingController - API endpoints cho Speaking feature extensions
 *
 * Mục đích: Tongue twisters, speaking stats, voice clone
 * Base path: /api/speaking
 * Khi nào sử dụng: Speaking screen trên mobile app
 */
@Controller('speaking')
@UseGuards(SupabaseAuthGuard)
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  /**
   * GET /api/speaking/tongue-twisters?level=beginner
   *
   * Mục đích: Lấy danh sách tongue twisters theo level
   * @param level - beginner | intermediate | advanced
   * @returns Danh sách tongue twisters
   * Khi nào sử dụng: Tongue Twister practice mode
   */
  @Get('tongue-twisters')
  @HttpCode(HttpStatus.OK)
  async getTongueTwisters(@Query('level') level?: string) {
    return this.speakingService.getTongueTwisters(level);
  }

  /**
   * GET /api/speaking/stats
   *
   * Mục đích: Lấy thống kê speaking của user
   * @returns Speaking stats (sessions, minutes, topics, weekly)
   * Khi nào sử dụng: Speaking screen overview
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@Req() req: any) {
    return this.speakingService.getStats(req.user.id);
  }

  /**
   * POST /api/speaking/voice-clone
   *
   * Mục đích: Clone giọng user qua Azure Custom Voice
   * @param file - Audio sample của user
   * @param dto - { text } text cần TTS
   * @returns Audio buffer (hoặc placeholder khi chưa implement)
   * Khi nào sử dụng: Speaking → AI Voice Clone Replay
   *
   * TODO [VOICE-CLONE]: Feature đang phát triển - hiện trả về placeholder
   */
  @Post('voice-clone')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  async voiceClone(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: VoiceCloneDto,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng cung cấp audio sample');
    }
    return this.speakingService.voiceClone(req.user.id, file.buffer, dto.text);
  }
}

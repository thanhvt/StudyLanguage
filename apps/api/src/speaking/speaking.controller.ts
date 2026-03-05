/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Put,
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
import { GroqSttService } from '../groq-stt/groq-stt.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

// ==================== DTOs ====================

/**
 * DTO cho voice clone request
 *
 * Mục đích: Validate input POST /speaking/voice-clone
 * Khi nào sử dụng: User muốn nghe AI nói bằng giọng mình
 */
class VoiceCloneDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

/**
 * DTO cho update daily goal
 *
 * Mục đích: Validate input PUT /speaking/daily-goal
 * Khi nào sử dụng: User thay đổi mục tiêu hàng ngày
 */
class UpdateDailyGoalDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  target: number;
}

/**
 * DTO cho shadowing evaluate
 *
 * Mục đích: Validate input POST /speaking/shadowing-evaluate
 * Khi nào sử dụng: Shadowing Mode – đánh giá phát âm
 */
class ShadowingEvaluateDto {
  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsNotEmpty()
  userTranscript: string;

  @IsNumber()
  @IsOptional()
  speed?: number;
}

/**
 * DTO cho transcribe-and-evaluate combo
 *
 * Mục đích: Validate input POST /speaking/transcribe-and-evaluate
 * Khi nào sử dụng: Mobile gửi audio + câu gốc → backend transcribe + evaluate 1 lần
 */
class TranscribeAndEvaluateDto {
  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsNumber()
  @IsOptional()
  speed?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['whisper-large-v3-turbo', 'whisper-large-v3'])
  model?: 'whisper-large-v3-turbo' | 'whisper-large-v3';
}

// ==================== Controller ====================

/**
 * SpeakingController - API endpoints cho Speaking feature
 *
 * Mục đích: Tongue twisters, stats, gamification, voice clone, shadowing, STT
 * Base path: /api/speaking
 * Khi nào sử dụng: Speaking screen trên mobile app
 */
@Controller('speaking')
@UseGuards(SupabaseAuthGuard)
export class SpeakingController {
  constructor(
    private readonly speakingService: SpeakingService,
    private readonly groqSttService: GroqSttService,
  ) {}

  // ============================================
  // CORE ENDPOINTS
  // ============================================

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
   * Mục đích: Lấy thống kê speaking của user (enhanced)
   * @returns Speaking stats (sessions, minutes, topics, weekly, accuracy)
   * Khi nào sử dụng: Speaking screen overview + Dashboard
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@Req() req: any) {
    return this.speakingService.getStats(req.user.id);
  }

  // ============================================
  // SPRINT 2: GAMIFICATION ENDPOINTS
  // ============================================

  /**
   * GET /api/speaking/daily-goal
   *
   * Mục đích: Lấy tiến trình daily speaking goal
   * @returns { target, completed, streak, isCompleted, progress }
   * Khi nào sử dụng: Dashboard + Speaking screen → Daily Goal card
   */
  @Get('daily-goal')
  @HttpCode(HttpStatus.OK)
  async getDailyGoal(@Req() req: any) {
    return this.speakingService.getDailyGoal(req.user.id);
  }

  /**
   * PUT /api/speaking/daily-goal
   *
   * Mục đích: Cập nhật mục tiêu speaking hàng ngày
   * @param dto - { target: number } (1-100)
   * @returns Updated daily goal
   * Khi nào sử dụng: Settings → Speaking goal
   */
  @Put('daily-goal')
  @HttpCode(HttpStatus.OK)
  async updateDailyGoal(@Req() req: any, @Body() dto: UpdateDailyGoalDto) {
    return this.speakingService.updateDailyGoal(req.user.id, dto.target);
  }

  /**
   * GET /api/speaking/progress
   *
   * Mục đích: Lấy progress data cho Speaking Dashboard
   * @returns { radarChart, calendarHeatmap, weakSounds, weeklyReport }
   * Khi nào sử dụng: Speaking Progress Dashboard screen
   */
  @Get('progress')
  @HttpCode(HttpStatus.OK)
  async getProgress(@Req() req: any) {
    return this.speakingService.getProgress(req.user.id);
  }

  /**
   * GET /api/speaking/badges
   *
   * Mục đích: Lấy danh sách achievement badges
   * @returns { badges[], totalUnlocked, totalBadges, currentStreak }
   * Khi nào sử dụng: Speaking Gamification screen
   */
  @Get('badges')
  @HttpCode(HttpStatus.OK)
  async getBadges(@Req() req: any) {
    return this.speakingService.getBadges(req.user.id);
  }

  // ============================================
  // SPRINT 3: VOICE CLONE + SHADOWING
  // ============================================

  /**
   * POST /api/speaking/voice-clone
   *
   * Mục đích: Clone giọng user qua Azure Custom Voice
   * @param file - Audio sample của user
   * @param dto - { text } text cần TTS
   * @returns Audio buffer hoặc graceful degradation
   * Khi nào sử dụng: Speaking → AI Voice Clone Replay
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

  /**
   * POST /api/speaking/shadowing-evaluate
   *
   * Mục đích: Đánh giá phát âm shadowing (rhythm, intonation, accuracy)
   * @param dto - { originalText, userTranscript, speed? }
   * @returns Scoring chi tiết cho shadowing mode
   * Khi nào sử dụng: Shadowing Mode → kết quả sau khi nhại
   */
  @Post('shadowing-evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluateShadowing(@Req() req: any, @Body() dto: ShadowingEvaluateDto) {
    return this.speakingService.evaluateShadowing(
      req.user.id,
      dto.originalText,
      dto.userTranscript,
      dto.speed ?? 1.0,
    );
  }

  // ============================================
  // STT: GROQ WHISPER ENDPOINTS
  // ============================================

  /**
   * POST /api/speaking/transcribe
   *
   * Mục đích: Transcribe audio file thành text bằng Groq Whisper
   * @param file - Audio file (m4a, mp3, wav, webm, ogg, flac)
   * @returns { text, language, duration, model }
   * Khi nào sử dụng:
   *   - PracticeScreen → sau ghi âm → gửi audio → nhận text
   *   - ShadowingScreen → sau ghi âm → gửi audio → nhận text
   *   - CoachSessionScreen → voice input → gửi audio → nhận text
   */
  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
    @Query('model') model?: 'whisper-large-v3-turbo' | 'whisper-large-v3',
    @Query('language') language?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng cung cấp audio file');
    }

    if (!this.groqSttService.checkConfigured()) {
      throw new BadRequestException('Groq STT chưa được cấu hình');
    }

    const result = await this.groqSttService.transcribeBuffer(
      file.buffer,
      file.originalname || 'recording.m4a',
      { model, language },
    );

    return {
      success: true,
      ...result,
    };
  }

  /**
   * POST /api/speaking/transcribe-and-evaluate
   *
   * Mục đích: Combo flow — transcribe audio + evaluate phát âm trong 1 request
   * @param file - Audio file (m4a, mp3, wav...)
   * @param dto - { originalText, speed?, model? }
   * @returns { transcript, evaluation }
   * Khi nào sử dụng:
   *   - PracticeScreen → submit recording → 1 API call thay vì 2
   *   - ShadowingScreen → submit recording → transcribe + evaluate
   */
  @Post('transcribe-and-evaluate')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAndEvaluate(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: TranscribeAndEvaluateDto,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng cung cấp audio file');
    }

    if (!this.groqSttService.checkConfigured()) {
      throw new BadRequestException('Groq STT chưa được cấu hình');
    }

    // Bước 1: Transcribe
    const transcribeResult = await this.groqSttService.transcribeBuffer(
      file.buffer,
      file.originalname || 'recording.m4a',
      { model: dto.model, language: 'en' },
    );

    if (!transcribeResult.text.trim()) {
      return {
        success: false,
        error: 'Không nghe được gì, thử nói to hơn nhé!',
        transcript: '',
      };
    }

    // Bước 2: Evaluate
    const evaluation = await this.speakingService.evaluateShadowing(
      req.user.id,
      dto.originalText,
      transcribeResult.text,
      dto.speed ?? 1.0,
    );

    return {
      success: true,
      transcript: transcribeResult.text,
      transcribeModel: transcribeResult.model,
      audioDuration: transcribeResult.duration,
      evaluation: evaluation.shadowing,
    };
  }

  /**
   * GET /api/speaking/stt-models
   *
   * Mục đích: Lấy danh sách models STT có sẵn
   * @returns Mảng { id, name, description }
   * Khi nào sử dụng: Mobile hiển thị lựa chọn model Whisper trong settings
   */
  @Get('stt-models')
  @HttpCode(HttpStatus.OK)
  getSttModels() {
    return {
      success: true,
      models: this.groqSttService.getAvailableModels(),
      configured: this.groqSttService.checkConfigured(),
    };
  }
}



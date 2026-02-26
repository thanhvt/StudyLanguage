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
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

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

// ==================== Controller ====================

/**
 * SpeakingController - API endpoints cho Speaking feature
 *
 * Mục đích: Tongue twisters, stats, gamification, voice clone, shadowing
 * Base path: /api/speaking
 * Khi nào sử dụng: Speaking screen trên mobile app
 */
@Controller('speaking')
@UseGuards(SupabaseAuthGuard)
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

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
}


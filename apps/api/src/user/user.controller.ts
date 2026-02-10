/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';

// ==================== DTOs ====================

/**
 * DTO cho cập nhật profile
 *
 * Mục đích: Validate input PATCH /user/profile
 * Khi nào sử dụng: User cập nhật tên hiển thị hoặc avatar URL
 */
class UpdateProfileDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

/**
 * DTO cho kiểm tra badge
 *
 * Mục đích: Validate input POST /user/gamification/check-badge
 * Khi nào sử dụng: Sau mỗi lesson hoàn thành, gửi stats để check badges
 */
class CheckBadgeDto {
  @IsNumber()
  @IsOptional()
  totalSessions?: number;

  @IsNumber()
  @IsOptional()
  totalMinutes?: number;

  @IsNumber()
  @IsOptional()
  streak?: number;
}

/**
 * DTO cho sync settings
 *
 * Mục đích: Validate input PUT /user/settings
 * Khi nào sử dụng: User thay đổi settings, đồng bộ lên server
 */
class UpdateSettingsDto {
  @IsObject()
  settings: Record<string, any>;
}

// ==================== Controller ====================

/**
 * UserController - API endpoints cho User Module
 *
 * Mục đích: Quản lý user profile, stats, gamification, settings
 * Base path: /api/user
 * Tất cả endpoints yêu cầu xác thực Supabase JWT
 * Khi nào sử dụng: Dashboard, Profile screen, Speaking gamification
 */
@Controller('user')
@UseGuards(SupabaseAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/user/stats
   *
   * Mục đích: Lấy stats tổng quan cho Dashboard
   * @returns UserStats (streak, totalMinutes, level, goals, etc.)
   * Khi nào sử dụng: Dashboard screen load
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@Req() req: any) {
    return this.userService.getStats(req.user.id);
  }

  /**
   * GET /api/user/word-of-the-day
   *
   * Mục đích: Lấy từ vựng của ngày hôm nay
   * @returns WordOfTheDay (word, ipa, meaning, example)
   * Khi nào sử dụng: Dashboard screen load
   */
  @Get('word-of-the-day')
  @HttpCode(HttpStatus.OK)
  async getWordOfTheDay() {
    const word = await this.userService.getWordOfTheDay();
    return { success: true, word };
  }

  /**
   * GET /api/user/last-session
   *
   * Mục đích: Lấy session cuối cùng để hiển thị nút "Continue"
   * @returns Session info hoặc null
   * Khi nào sử dụng: Dashboard screen "Continue Last Lesson"
   */
  @Get('last-session')
  @HttpCode(HttpStatus.OK)
  async getLastSession(@Req() req: any) {
    return this.userService.getLastSession(req.user.id);
  }

  /**
   * PATCH /api/user/profile
   *
   * Mục đích: Cập nhật thông tin profile (tên, avatar URL)
   * @param dto - UpdateProfileDto { displayName?, avatarUrl? }
   * @returns Kết quả cập nhật
   * Khi nào sử dụng: Profile settings screen
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  /**
   * POST /api/user/avatar
   *
   * Mục đích: Upload ảnh avatar (multipart form-data)
   * @param file - File ảnh
   * @returns Avatar URL mới
   * Khi nào sử dụng: Profile screen → đổi avatar
   */
  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }
    return this.userService.uploadAvatar(req.user.id, file.buffer);
  }

  /**
   * GET /api/user/gamification
   *
   * Mục đích: Lấy dữ liệu XP, level, badges, goals
   * @returns GamificationData
   * Khi nào sử dụng: Dashboard, Speaking screen
   */
  @Get('gamification')
  @HttpCode(HttpStatus.OK)
  async getGamification(@Req() req: any) {
    return this.userService.getGamification(req.user.id);
  }

  /**
   * POST /api/user/gamification/check-badge
   *
   * Mục đích: Kiểm tra và unlock badges mới sau mỗi lesson
   * @param dto - CheckBadgeDto { totalSessions?, totalMinutes?, streak? }
   * @returns Danh sách badges mới unlock
   * Khi nào sử dụng: Sau khi hoàn thành 1 lesson
   */
  @Post('gamification/check-badge')
  @HttpCode(HttpStatus.OK)
  async checkBadge(@Req() req: any, @Body() dto: CheckBadgeDto) {
    return this.userService.checkBadge(req.user.id, dto);
  }

  /**
   * GET /api/user/settings
   *
   * Mục đích: Lấy settings đồng bộ từ server
   * @returns Settings JSON object
   * Khi nào sử dụng: App startup → merge với local settings
   */
  @Get('settings')
  @HttpCode(HttpStatus.OK)
  async getSettings(@Req() req: any) {
    return this.userService.getSettings(req.user.id);
  }

  /**
   * PUT /api/user/settings
   *
   * Mục đích: Sync settings lên server (overwrite)
   * @param dto - UpdateSettingsDto { settings: {...} }
   * @returns Kết quả đồng bộ
   * Khi nào sử dụng: Sau khi user thay đổi settings
   */
  @Put('settings')
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Req() req: any, @Body() dto: UpdateSettingsDto) {
    return this.userService.updateSettings(req.user.id, dto.settings);
  }

  /**
   * POST /api/user/export-data
   *
   * Mục đích: Export toàn bộ data (GDPR compliance)
   * @returns JSON chứa tất cả data của user
   * Khi nào sử dụng: Profile settings → "Export My Data"
   */
  @Post('export-data')
  @HttpCode(HttpStatus.OK)
  async exportData(@Req() req: any) {
    return this.userService.exportData(req.user.id);
  }

  /**
   * DELETE /api/user/delete-account
   *
   * Mục đích: Xóa account và toàn bộ data (KHÔNG THỂ hoàn tác)
   * @returns Kết quả xóa
   * Khi nào sử dụng: Profile settings → "Delete Account"
   *
   * ⚠️ CẢNH BÁO: Cascade delete all tables + Supabase Auth
   */
  @Delete('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Req() req: any) {
    return this.userService.deleteAccount(req.user.id);
  }
}

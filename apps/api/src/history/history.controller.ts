/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== DTOs ====================

/**
 * DTO cho tạo mới bản ghi lịch sử
 *
 * Mục đích: Validate input POST /history
 * Tham số: type (bắt buộc), topic (bắt buộc), content, durationMinutes, ...
 * Khi nào sử dụng: Sau khi user hoàn thành 1 session learning
 */
class AudioTimestampDto {
  @IsNumber()
  startTime: number;

  @IsNumber()
  endTime: number;
}

class CreateHistoryEntryDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['listening', 'speaking', 'reading'])
  type: 'listening' | 'speaking' | 'reading';

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsOptional()
  content?: any;

  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @IsNumber()
  @IsOptional()
  numSpeakers?: number;

  @IsString()
  @IsOptional()
  keywords?: string;

  @IsString()
  @IsOptional()
  mode?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioTimestampDto)
  @IsOptional()
  audioTimestamps?: AudioTimestampDto[];
}

// ==================== Controller ====================

/**
 * HistoryController - Controller quản lý lịch sử học tập
 *
 * Mục đích: Xử lý các request liên quan đến lịch sử bài học
 * Tham số đầu vào: Request từ client với JWT token
 * Tham số đầu ra: JSON response với dữ liệu lịch sử
 * Khi nào sử dụng: Được gọi từ frontend khi user xem/quản lý lịch sử
 */
@ApiTags('History')
@ApiBearerAuth()
@Controller('history')
@UseGuards(SupabaseAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /**
   * Tạo mới bản ghi lịch sử học tập
   *
   * Mục đích: Lưu 1 session learning mới vào lịch sử
   * @param dto - Dữ liệu session (type, topic, content, ...)
   * @returns Entry vừa tạo
   * Khi nào sử dụng: POST /history → Sau khi user hoàn thành bài học
   *   - Reading: saveReadingSession → History
   *   - Listening: saveListeningSession → History
   *   - Speaking: saveSpeakingSession → History
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mới bản ghi lịch sử học tập' })
  @ApiBody({ type: CreateHistoryEntryDto })
  async createEntry(@Req() req: any, @Body() dto: CreateHistoryEntryDto) {
    const userId = req.user.id;
    return this.historyService.createEntry(userId, dto);
  }

  /**
   * Lấy danh sách lịch sử học tập
   *
   * @param type - Loại bài học (listening, speaking, reading, writing)
   * @param status - Trạng thái filter (all, pinned, favorite, deleted)
   * @param search - Từ khóa tìm kiếm
   * @param page - Trang hiện tại
   * @param limit - Số bản ghi mỗi trang
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch sử học tập' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['listening', 'speaking', 'reading', 'writing'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['all', 'pinned', 'favorite', 'deleted'],
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'YYYY-MM-DD' })
  async getHistory(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const userId = req.user.id;
    return this.historyService.getHistory(userId, {
      type: type as any,
      status: status as any,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      dateFrom,
      dateTo,
    });
  }

  /**
   * Lấy thống kê lịch sử học tập
   * Returns: todayCount, weekCount, streak, heatmapData (90 days), weeklyData (7 days)
   */
  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê lịch sử học tập' })
  async getStats(@Req() req: any) {
    const userId = req.user.id;
    return this.historyService.getStats(userId);
  }

  /**
   * Lấy analytics data cho biểu đồ
   *
   * Mục đích: Trả về data aggregated theo period cho charts
   * @param period - 'week' | 'month' | 'year'
   * Khi nào sử dụng: GET /history/analytics → History analytics screen
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Lấy analytics data cho biểu đồ' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
  async getAnalytics(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    const userId = req.user.id;
    return this.historyService.getAnalytics(userId, period);
  }

  /**
   * Batch action trên nhiều entries
   *
   * Mục đích: Delete/pin/favorite nhiều entries cùng lúc
   * Khi nào sử dụng: POST /history/batch-action → chọn nhiều rồi thao tác
   */
  @Post('batch-action')
  @ApiOperation({ summary: 'Batch action trên nhiều bản ghi' })
  async batchAction(
    @Req() req: any,
    @Body() body: { ids: string[]; action: 'delete' | 'pin' | 'unpin' | 'favorite' | 'unfavorite' },
  ) {
    const userId = req.user.id;
    return this.historyService.batchAction(userId, body.ids, body.action);
  }

  /**
   * Lấy chi tiết một bản ghi lịch sử
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bản ghi lịch sử' })
  async getHistoryEntry(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.getHistoryEntry(userId, id);
  }

  /**
   * Toggle trạng thái ghim (pin)
   */
  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle ghim bản ghi' })
  async togglePin(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.togglePin(userId, id);
  }

  /**
   * Toggle trạng thái yêu thích (favorite)
   */
  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle yêu thích bản ghi' })
  async toggleFavorite(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.toggleFavorite(userId, id);
  }

  /**
   * Cập nhật ghi chú cho bản ghi
   */
  @Patch(':id/notes')
  @ApiOperation({ summary: 'Cập nhật ghi chú bản ghi' })
  async updateNotes(
    @Req() req: any,
    @Param('id') id: string,
    @Body('notes') notes: string,
  ) {
    const userId = req.user.id;
    return this.historyService.updateNotes(userId, id, notes || '');
  }

  /**
   * Export session summary
   *
   * Mục đích: Tạo text summary cho 1 session để share
   * Khi nào sử dụng: POST /history/:id/export → Share/Export button
   */
  @Post(':id/export')
  @ApiOperation({ summary: 'Export session summary' })
  async exportSession(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.exportSession(userId, id);
  }

  /**
   * Soft delete một bản ghi
   */

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm bản ghi' })
  async deleteEntry(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.softDelete(userId, id);
  }

  /**
   * Khôi phục bản ghi đã xóa
   */
  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục bản ghi đã xóa' })
  async restoreEntry(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.restore(userId, id);
  }

  /**
   * Xóa vĩnh viễn bản ghi (hard delete)
   */
  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Xóa vĩnh viễn bản ghi' })
  async permanentDelete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.historyService.permanentDelete(userId, id);
  }
}

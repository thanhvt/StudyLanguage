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
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

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
  async getHistory(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    return this.historyService.getHistory(userId, {
      type: type as any,
      status: status as any,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
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

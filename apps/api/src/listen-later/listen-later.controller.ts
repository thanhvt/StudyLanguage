/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ListenLaterService } from './listen-later.service';
import type { AddListenLaterDto } from './listen-later.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * ListenLaterController - Controller xử lý API cho tính năng Nghe Sau
 *
 * Mục đích: Expose các endpoints cho CRUD Listen Later
 * Khi nào sử dụng: Frontend gọi API để quản lý danh sách Nghe Sau
 */
@ApiTags('Listen Later')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('listen-later')
export class ListenLaterController {
  constructor(private readonly listenLaterService: ListenLaterService) {}

  /**
   * Lấy danh sách Nghe Sau của user
   *
   * GET /listen-later
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Nghe Sau' })
  async getListenLater(@Req() req: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.listenLaterService.getListenLater(userId);
    } catch (error) {
      console.error('[ListenLaterController] GET error:', error);
      throw new HttpException(
        error.message || 'Lỗi lấy danh sách Nghe Sau',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Thêm item vào Nghe Sau
   *
   * POST /listen-later
   */
  @Post()
  @ApiOperation({ summary: 'Thêm vào danh sách Nghe Sau' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', example: 'Daily Stand-up Update' },
        conversation: {
          type: 'array',
          example: [{ speaker: 'A', text: 'Hello' }],
        },
        duration: { type: 'number', example: 5 },
        numSpeakers: { type: 'number', example: 2 },
        category: { type: 'string', example: 'it' },
        subCategory: { type: 'string', example: 'Agile Ceremonies' },
        audioUrl: { type: 'string', description: 'URL audio đã sinh (optional)' },
        audioTimestamps: { type: 'array', description: 'Timestamps cho từng câu (optional)' },
      },
      required: ['topic', 'conversation', 'duration', 'numSpeakers'],
    },
  })
  async addToListenLater(@Req() req: any, @Body() dto: AddListenLaterDto) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.listenLaterService.addToListenLater(userId, dto);
    } catch (error) {
      console.error('[ListenLaterController] POST error:', error);
      throw new HttpException(
        error.message || 'Lỗi thêm vào Nghe Sau',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật audio URL cho item Nghe Sau
   *
   * PATCH /listen-later/:id/audio
   */
  @Patch(':id/audio')
  @ApiOperation({ summary: 'Cập nhật audio cho item Nghe Sau' })
  @ApiParam({ name: 'id', description: 'ID của item cần cập nhật' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audioUrl: { type: 'string', description: 'URL audio trên Supabase Storage' },
        audioTimestamps: { type: 'array', description: 'Timestamps cho từng câu' },
      },
      required: ['audioUrl'],
    },
  })
  async updateAudio(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: { audioUrl: string; audioTimestamps?: { startTime: number; endTime: number }[] },
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.listenLaterService.updateAudioData(
        userId,
        id,
        dto.audioUrl,
        dto.audioTimestamps,
      );
    } catch (error) {
      console.error('[ListenLaterController] PATCH audio error:', error);
      throw new HttpException(
        error.message || 'Lỗi cập nhật audio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa item khỏi Nghe Sau
   *
   * DELETE /listen-later/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khỏi danh sách Nghe Sau' })
  @ApiParam({ name: 'id', description: 'ID của item cần xóa' })
  async removeFromListenLater(@Req() req: any, @Param('id') id: string) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.listenLaterService.removeFromListenLater(userId, id);
    } catch (error) {
      console.error('[ListenLaterController] DELETE error:', error);
      throw new HttpException(
        error.message || 'Lỗi xóa khỏi Nghe Sau',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa tất cả items trong Nghe Sau
   *
   * DELETE /listen-later
   */
  @Delete()
  @ApiOperation({ summary: 'Xóa tất cả khỏi danh sách Nghe Sau' })
  async clearListenLater(@Req() req: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.listenLaterService.clearListenLater(userId);
    } catch (error) {
      console.error('[ListenLaterController] DELETE ALL error:', error);
      throw new HttpException(
        error.message || 'Lỗi xóa tất cả Nghe Sau',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


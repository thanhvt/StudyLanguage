import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ListenLaterService, AddListenLaterDto } from './listen-later.service';
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
        conversation: { type: 'array', example: [{ speaker: 'A', text: 'Hello' }] },
        duration: { type: 'number', example: 5 },
        numSpeakers: { type: 'number', example: 2 },
        category: { type: 'string', example: 'it' },
        subCategory: { type: 'string', example: 'Agile Ceremonies' },
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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { RadioService } from './radio.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * RadioController - Controller xử lý API cho Radio Mode
 *
 * Mục đích: Expose các endpoints cho Radio Mode feature
 * Khi nào sử dụng: Frontend gọi API để tạo Radio playlist
 */
@Controller('radio')
export class RadioController {
  private readonly logger = new Logger(RadioController.name);

  constructor(private readonly radioService: RadioService) {}

  /**
   * Lấy thông tin Radio playlist sẽ được tạo (duration random)
   *
   * Mục đích: Hiển thị cho user trước khi confirm tạo
   * Trả về: duration và trackCount ước tính
   */
  @Get('preview')
  getPreview() {
    const duration = this.radioService.generateRandomDuration();
    const trackCount = this.radioService.calculateTrackCount(duration);

    return {
      success: true,
      data: {
        duration,
        trackCount,
        estimatedTime: `~${Math.ceil(trackCount * 3)} giây`, // ~3s per track to generate text
      },
    };
  }

  /**
   * Tạo Radio playlist mới
   *
   * Mục đích: Generate playlist với duration đã chọn
   * Tham số: duration (phút)
   * Trả về: Playlist object với items
   */
  @Post('generate')
  @UseGuards(SupabaseAuthGuard)
  async generateRadioPlaylist(
    @Req() req: any,
    @Body() body: { duration: number },
  ) {
    try {
      // Lấy userId từ request (đã được auth middleware xử lý)
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        throw new HttpException(
          'Vui lòng đăng nhập để sử dụng tính năng này',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { duration } = body;

      if (!duration || ![1, 30, 60, 120].includes(duration)) {
        throw new HttpException(
          'Duration phải là 1, 30, 60, hoặc 120 phút',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `User ${userId} đang tạo Radio playlist ${duration} phút`,
      );

      const result = await this.radioService.generateRadioPlaylist(
        userId,
        duration,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi tạo Radio playlist:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Không thể tạo Radio playlist. Vui lòng thử lại.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

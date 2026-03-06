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
  Sse,
} from '@nestjs/common';
import { RadioService } from './radio.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { Observable, Subject } from 'rxjs';
import { Request } from 'express';

/**
 * N-04: Typed request với user info từ SupabaseAuthGuard
 */
interface AuthenticatedRequest extends Request {
  user?: { id?: string; sub?: string };
}

// T-13: Lưu progress subjects cho từng user
const progressSubjects = new Map<string, Subject<MessageEvent>>();

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
        estimatedTime: `~${Math.ceil(trackCount * 3)} giây`,
      },
    };
  }

  /**
   * T-13: SSE endpoint cho progress khi generate
   *
   * Mục đích: Real-time progress cho mobile khi đang generate playlist
   * Tham số đầu vào: userId (từ auth)
   * Tham số đầu ra: Observable<MessageEvent> — stream SSE events
   * Khi nào sử dụng: Mobile kết nối trước khi gọi POST /generate
   */
  @Sse('generate/progress')
  @UseGuards(SupabaseAuthGuard)
  generateProgress(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
    const userId = req.user?.id || req.user?.sub || 'unknown';
    const subject = new Subject<MessageEvent>();
    progressSubjects.set(userId, subject);

    // Cleanup khi client ngắt kết nối
    req.on('close', () => {
      subject.complete();
      progressSubjects.delete(userId);
    });

    return subject.asObservable();
  }

  /**
   * Emit progress event cho user (static helper)
   *
   * Mục đích: Gửi SSE event về cho client
   * Tham số đầu vào: userId, track index, total, topic
   * Khi nào sử dụng: RadioService gọi khi generate xong mỗi track
   */
  static emitProgress(userId: string, trackIndex: number, total: number, topic: string) {
    const subject = progressSubjects.get(userId);
    if (subject) {
      subject.next({
        data: JSON.stringify({
          trackIndex,
          total,
          topic,
          percent: Math.round(((trackIndex + 1) / total) * 100),
        }),
      } as MessageEvent);
    }
  }

  /**
   * Tạo Radio playlist mới
   *
   * Mục đích: Generate playlist với duration và categories đã chọn
   * Tham số đầu vào:
   *   - duration: Thời lượng (1, 30, 60, 120 phút)
   *   - categories: Lọc theo categories (optional)
   * Tham số đầu ra: Playlist object với items
   * Khi nào sử dụng: Mobile gọi khi user nhấn "Tạo Radio playlist"
   */
  @Post('generate')
  @UseGuards(SupabaseAuthGuard)
  async generateRadioPlaylist(
    @Req() req: AuthenticatedRequest,
    @Body() body: { duration: number; categories?: string[] },
  ) {
    try {
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        throw new HttpException(
          'Vui lòng đăng nhập để sử dụng tính năng này',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { duration, categories } = body;

      if (!duration || ![1, 30, 60, 120].includes(duration)) {
        throw new HttpException(
          'Duration phải là 1, 30, 60, hoặc 120 phút',
          HttpStatus.BAD_REQUEST,
        );
      }

      const validCategories = ['it', 'daily', 'personal', 'business', 'academic'];
      if (categories && categories.length > 0) {
        const invalidCats = categories.filter(c => !validCategories.includes(c));
        if (invalidCats.length > 0) {
          throw new HttpException(
            `Categories không hợp lệ: ${invalidCats.join(', ')}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      this.logger.log(
        `User ${userId} tạo Radio playlist ${duration} phút${categories ? ` [${categories.join(',')}]` : ''}`,
      );

      const result = await this.radioService.generateRadioPlaylist(
        userId,
        duration,
        categories,
      );

      // T-13: Hoàn thành — close SSE stream
      const subject = progressSubjects.get(userId);
      if (subject) {
        subject.next({
          data: JSON.stringify({ done: true, trackCount: result.items.length }),
        } as MessageEvent);
        subject.complete();
        progressSubjects.delete(userId);
      }

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

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import type { CreateFeedbackDto } from './feedback.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * FeedbackController - Controller xử lý feedback submissions
 *
 * Mục đích: Nhận feedback từ cả guest và authenticated users
 * Tham số đầu vào: Request body với feedback data
 * Tham số đầu ra: JSON response
 * Khi nào sử dụng: Được gọi từ frontend FeedbackDialog
 */
@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Gửi feedback (public - không yêu cầu auth)
   */
  @Post()
  @ApiOperation({ summary: 'Gửi góp ý/phản hồi' })
  async submitFeedback(
    @Body() body: CreateFeedbackDto,
    @Req() req: any,
    @Headers('user-agent') userAgent: string,
  ) {
    // Try to get userId from request (if authenticated)
    const userId = req.user?.id || null;

    // Add user agent and page URL
    const dto: CreateFeedbackDto = {
      ...body,
      userAgent: userAgent || undefined,
    };

    return this.feedbackService.submitFeedback(userId, dto);
  }

  /**
   * Lấy danh sách feedback của user (yêu cầu auth)
   */
  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách góp ý của user' })
  async getUserFeedbacks(@Req() req: any) {
    const userId = req.user.id;
    return this.feedbackService.getUserFeedbacks(userId);
  }
}

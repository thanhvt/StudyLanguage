import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

/**
 * FeedbackModule - Module quản lý feedback/góp ý
 *
 * Mục đích: Đăng ký controller và service cho feedback
 * Khi nào sử dụng: Import vào AppModule
 */
@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}

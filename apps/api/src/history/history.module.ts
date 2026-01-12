import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

/**
 * HistoryModule - Module quản lý lịch sử học tập
 *
 * Mục đích: Cung cấp các tính năng xem lịch sử, ghim, yêu thích, xóa bản ghi
 * Khi nào sử dụng: Import vào AppModule để enable history endpoints
 */
@Module({
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}

import { Module } from '@nestjs/common';
import { ListenLaterController } from './listen-later.controller';
import { ListenLaterService } from './listen-later.service';

/**
 * ListenLaterModule - Module quản lý tính năng Nghe Sau
 * 
 * Mục đích: Bundle controller và service cho Listen Later
 * Khi nào sử dụng: Import vào AppModule
 */
@Module({
  controllers: [ListenLaterController],
  providers: [ListenLaterService],
  exports: [ListenLaterService],
})
export class ListenLaterModule {}

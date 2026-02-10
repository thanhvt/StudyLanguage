import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

/**
 * NotificationsModule - Module quản lý push notifications
 *
 * Mục đích: Đăng ký device tokens, gửi push notifications
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

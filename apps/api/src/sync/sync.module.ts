import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';

/**
 * SyncModule - Module đồng bộ offline data
 *
 * Mục đích: Process offline action queue, track sync status
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}

import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

/**
 * Storage Module
 * Cung cấp StorageService cho các module khác
 */
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

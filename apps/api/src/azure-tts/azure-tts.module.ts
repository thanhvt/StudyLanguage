import { Module } from '@nestjs/common';
import { AzureTtsService } from './azure-tts.service';
import { StorageModule } from '../storage/storage.module';

/**
 * AzureTtsModule - Module wrapper cho Azure Speech Service
 *
 * Mục đích: Đăng ký AzureTtsService với NestJS DI container
 * Khi nào sử dụng: Import vào AiModule để inject AzureTtsService
 */
@Module({
  imports: [StorageModule],
  providers: [AzureTtsService],
  exports: [AzureTtsService],
})
export class AzureTtsModule {}

import { Module } from '@nestjs/common';
import { SpeakingService } from './speaking.service';
import { SpeakingController } from './speaking.controller';

/**
 * SpeakingModule - Module cho Speaking feature extensions
 *
 * Mục đích: Tongue twisters, speaking stats, voice clone (skeleton)
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  controllers: [SpeakingController],
  providers: [SpeakingService],
  exports: [SpeakingService],
})
export class SpeakingModule {}

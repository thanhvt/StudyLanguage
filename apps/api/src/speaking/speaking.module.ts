import { Module } from '@nestjs/common';
import { SpeakingService } from './speaking.service';
import { SpeakingController } from './speaking.controller';
import { GroqSttModule } from '../groq-stt/groq-stt.module';

/**
 * SpeakingModule - Module cho Speaking feature extensions
 *
 * Mục đích: Tongue twisters, speaking stats, voice clone, STT (Whisper)
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  imports: [GroqSttModule],
  controllers: [SpeakingController],
  providers: [SpeakingService],
  exports: [SpeakingService],
})
export class SpeakingModule {}


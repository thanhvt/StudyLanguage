import { Module } from '@nestjs/common';
import { GroqSttService } from './groq-stt.service';

/**
 * GroqSttModule — Module wrapper cho Groq Speech-to-Text Service
 *
 * Mục đích: Đăng ký GroqSttService với NestJS DI container
 * Khi nào sử dụng: Import vào SpeakingModule để inject GroqSttService
 */
@Module({
  providers: [GroqSttService],
  exports: [GroqSttService],
})
export class GroqSttModule {}

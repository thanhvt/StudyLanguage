import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { ConversationGeneratorModule } from '../conversation-generator/conversation-generator.module';

/**
 * ReadingModule - Module cho Reading feature
 *
 * Mục đích: Generate articles, analyze reading practice, manage saved words
 * Import: ConversationGeneratorModule (dùng Groq để sinh bài đọc)
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  imports: [ConversationGeneratorModule],
  controllers: [ReadingController],
  providers: [ReadingService],
  exports: [ReadingService],
})
export class ReadingModule {}

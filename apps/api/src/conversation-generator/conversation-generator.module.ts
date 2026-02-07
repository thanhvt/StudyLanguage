import { Module } from '@nestjs/common';
import { ConversationGeneratorController } from './conversation-generator.controller';
import { ConversationGeneratorService } from './conversation-generator.service';

/**
 * ConversationGeneratorModule - Module cho Groq API integration
 *
 * Mục đích: Đóng gói service và controller cho việc sinh hội thoại
 * Khi nào sử dụng: Import vào AppModule để sử dụng
 */
@Module({
  controllers: [ConversationGeneratorController],
  providers: [ConversationGeneratorService],
  exports: [ConversationGeneratorService],
})
export class ConversationGeneratorModule {}

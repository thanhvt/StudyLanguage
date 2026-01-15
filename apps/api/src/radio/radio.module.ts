import { Module } from '@nestjs/common';
import { RadioController } from './radio.controller';
import { RadioService } from './radio.service';
import { AiModule } from '../ai/ai.module';

/**
 * RadioModule - Module cho Radio Mode feature
 *
 * Mục đích: Đăng ký RadioService và RadioController
 * Dependencies: AiModule (để sử dụng AiService cho generate conversation)
 */
@Module({
  imports: [AiModule],
  controllers: [RadioController],
  providers: [RadioService],
  exports: [RadioService],
})
export class RadioModule {}

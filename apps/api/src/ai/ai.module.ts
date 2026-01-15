import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService], // Export để các module khác có thể inject AiService
})
export class AiModule {}

import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { StorageModule } from '../storage/storage.module';
import { AzureTtsModule } from '../azure-tts/azure-tts.module';
import { TtsProviderService } from './tts-provider.service';

@Module({
  imports: [StorageModule, AzureTtsModule],
  providers: [AiService, TtsProviderService],
  controllers: [AiController],
  exports: [AiService, TtsProviderService], // Export để các module khác có thể inject
})
export class AiModule {}


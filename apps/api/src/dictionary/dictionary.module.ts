import { Module } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';

/**
 * DictionaryModule - Module tra từ điển
 *
 * Mục đích: Proxy tới Free Dictionary API cho tap-to-translate
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  controllers: [DictionaryController],
  providers: [DictionaryService],
  exports: [DictionaryService],
})
export class DictionaryModule {}

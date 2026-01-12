import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

/**
 * LessonsModule - Module quản lý lessons
 * 
 * Mục đích: Cung cấp CRUD endpoints cho lessons
 * Khi nào sử dụng: Import vào AppModule để enable lessons endpoints
 */
@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}

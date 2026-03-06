import { Module } from '@nestjs/common';
import { CustomCategoriesController } from './custom-categories.controller';
import { CustomCategoriesService } from './custom-categories.service';

/**
 * CustomCategoriesModule — Module quản lý custom categories
 *
 * Mục đích: Đăng ký controller và service cho custom categories
 * Khi nào sử dụng: Import vào AppModule
 */
@Module({
  controllers: [CustomCategoriesController],
  providers: [CustomCategoriesService],
  exports: [CustomCategoriesService],
})
export class CustomCategoriesModule {}

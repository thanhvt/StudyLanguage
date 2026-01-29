import { Module } from '@nestjs/common';
import { CustomScenariosController } from './custom-scenarios.controller';
import { CustomScenariosService } from './custom-scenarios.service';

/**
 * CustomScenariosModule - Module quản lý custom scenarios
 *
 * Mục đích: Đăng ký controller và service cho custom scenarios
 * Khi nào sử dụng: Import vào AppModule
 */
@Module({
  controllers: [CustomScenariosController],
  providers: [CustomScenariosService],
  exports: [CustomScenariosService],
})
export class CustomScenariosModule {}

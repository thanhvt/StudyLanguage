import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StorageModule } from '../storage/storage.module';

/**
 * UserModule - Module quản lý user profile, stats, gamification, settings
 *
 * Mục đích: Cung cấp endpoints cho Dashboard stats, Profile, Gamification
 * Import: StorageModule (avatar upload)
 * Khi nào sử dụng: Được import bởi AppModule
 */
@Module({
  imports: [StorageModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

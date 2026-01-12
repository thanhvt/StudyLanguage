import { Module, Global } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';

/**
 * AuthModule - Module quản lý xác thực
 *
 * Mục đích: Cung cấp các guard và service liên quan đến authentication
 * Khi nào sử dụng: Import module này vào AppModule để sử dụng SupabaseAuthGuard
 */
@Global() // Đánh dấu là Global để các module khác không cần import lại
@Module({
  providers: [SupabaseAuthGuard],
  exports: [SupabaseAuthGuard],
})
export class AuthModule {}

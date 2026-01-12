/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseAuthGuard - Guard xác thực sử dụng Supabase JWT
 *
 * Mục đích: Bảo vệ các endpoint yêu cầu user đã đăng nhập
 * Cách sử dụng: @UseGuards(SupabaseAuthGuard) trên controller hoặc method
 * Khi nào được gọi: Mỗi khi có request tới endpoint được bảo vệ
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    // Khởi tạo Supabase client với Service Role Key để verify token
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    console.log('--- SupabaseAuthGuard Init ---');
    console.log('URL:', supabaseUrl);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn(
        '⚠️ SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình!',
      );
      // Tạo dummy client để tránh crash - sẽ reject tất cả auth
      this.supabase = createClient('http://dummy', 'dummy');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  /**
   * canActivate - Kiểm tra xem request có được phép thực thi không
   *
   * @param context - Execution context chứa request
   * @returns boolean - true nếu user đã xác thực, false nếu không
   * Luồng gọi: NestJS gọi method này trước mỗi request tới route được bảo vệ
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Allow CORS preflight requests
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException(
        'Thiếu token xác thực. Vui lòng đăng nhập.',
      );
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Token không đúng định dạng. Sử dụng: Bearer <token>',
      );
    }

    try {
      // Xác thực token với Supabase
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // Gắn user info vào request để các handler khác có thể sử dụng
      request.user = user;
    } catch (error) {
      // Debug logging to file
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'auth-debug.log');
      const logData =
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            message: error.message,
            tokenPrefix: token ? token.substring(0, 10) : 'none',
            errorStack: error.stack,
            isAuthException: error instanceof UnauthorizedException,
          },
          null,
          2,
        ) + '\n---\n';

      try {
        fs.appendFileSync(logPath, logData);
      } catch (e) {
        // ignore
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Lỗi xác thực:', error);
      throw new UnauthorizedException('Lỗi xác thực người dùng');
    }

    return true;
  }
}

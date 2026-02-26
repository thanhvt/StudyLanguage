/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsObject,
} from 'class-validator';

// ==================== DTOs ====================

/**
 * DTO cho đăng ký device token
 *
 * Mục đích: Validate input POST /notifications/register-device
 * Khi nào sử dụng: App startup → đăng ký FCM/APNs token
 */
class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}

/**
 * DTO cho gửi push notification
 *
 * Mục đích: Validate input POST /notifications/send
 * Khi nào sử dụng: Internal/Admin gửi push tới user cụ thể
 */
class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, string>;
}

/**
 * DTO cho hủy đăng ký device
 *
 * Mục đích: Validate input DELETE /notifications/unregister
 * Khi nào sử dụng: User logout → xóa device token
 */
class UnregisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

// ==================== Controller ====================

/**
 * NotificationsController - API endpoints cho Push Notifications
 *
 * Mục đích: Đăng ký device, gửi push, hủy đăng ký
 * Base path: /api/notifications
 * Khi nào sử dụng: Mobile app push notification setup
 */
@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * POST /api/notifications/register-device
   *
   * Mục đích: Đăng ký FCM/APNs token cho device hiện tại
   * @param dto - { token, platform: 'ios'|'android' }
   * @returns Kết quả đăng ký
   * Khi nào sử dụng: App startup sau khi login
   */
  @Post('register-device')
  @HttpCode(HttpStatus.OK)
  async registerDevice(
    @Req() req: any,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.notificationsService.registerDevice(
      req.user.id,
      dto.token,
      dto.platform,
    );
  }

  /**
   * POST /api/notifications/send
   *
   * Mục đích: Gửi push notification tới user (chỉ cho phép gửi cho chính mình hoặc admin)
   * @param dto - { userId, title, body, data? }
   * @returns Kết quả gửi
   * Khi nào sử dụng: System trigger hoặc self-notification
   *
   * ⚠️ Bảo mật: Kiểm tra quyền — user chỉ được gửi cho chính mình
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Req() req: any,
    @Body() dto: SendNotificationDto,
  ) {
    // Kiểm tra quyền: user chỉ được gửi notification cho chính mình
    const currentUserId = req.user.id;
    if (dto.userId !== currentUserId) {
      throw new BadRequestException(
        'Bạn chỉ có thể gửi notification cho chính mình',
      );
    }

    return this.notificationsService.sendNotification(dto.userId, {
      title: dto.title,
      body: dto.body,
      data: dto.data,
    });
  }

  /**
   * DELETE /api/notifications/unregister
   *
   * Mục đích: Xóa device token khi user logout
   * @param dto - { token }
   * @returns Kết quả xóa
   * Khi nào sử dụng: Logout flow
   */
  @Delete('unregister')
  @HttpCode(HttpStatus.OK)
  async unregisterDevice(
    @Req() req: any,
    @Body() dto: UnregisterDeviceDto,
  ) {
    return this.notificationsService.unregisterDevice(
      req.user.id,
      dto.token,
    );
  }
}

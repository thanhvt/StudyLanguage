/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * NotificationsService - Service quản lý push notifications
 *
 * Mục đích: Đăng ký device tokens, gửi push notifications
 * Tham số đầu vào: userId, token, platform
 * Tham số đầu ra: Result objects
 * Khi nào sử dụng: Được inject vào NotificationsController
 *
 * Lưu ý: Firebase Admin SDK sẽ được integrate sau khi có Firebase project
 * Hiện tại service chỉ quản lý device tokens trong DB
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Đăng ký device token cho push notifications
   *
   * Mục đích: Lưu FCM/APNs token vào database
   * @param userId - ID của user hiện tại
   * @param token - FCM hoặc APNs token
   * @param platform - 'ios' hoặc 'android'
   * @returns Kết quả đăng ký
   * Khi nào sử dụng: POST /notifications/register-device → App startup
   */
  async registerDevice(
    userId: string,
    token: string,
    platform: 'ios' | 'android',
  ) {
    try {
      // Upsert: nếu token đã tồn tại → cập nhật updated_at
      const { error } = await this.supabase
        .from('device_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            platform,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,token' },
        );

      if (error) {
        this.logger.error('[NotificationsService] Lỗi đăng ký device:', error);
        throw new InternalServerErrorException('Lỗi đăng ký device');
      }

      this.logger.log(`[NotificationsService] Đã đăng ký device ${platform} cho user ${userId}`);

      return {
        success: true,
        message: 'Đã đăng ký device token',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[NotificationsService] Lỗi đăng ký device:', error);
      throw new InternalServerErrorException('Lỗi đăng ký device');
    }
  }

  /**
   * Gửi push notification tới user
   *
   * Mục đích: Gửi push notification qua FCM
   * @param userId - ID của user nhận
   * @param payload - { title, body, data? }
   * @returns Kết quả gửi
   * Khi nào sử dụng: POST /notifications/send (internal, có thể dùng cho admin)
   *
   * TODO: Integrate Firebase Admin SDK khi có Firebase project
   * - npm install firebase-admin
   * - Khởi tạo app với service account
   * - Gọi admin.messaging().send()
   */
  async sendNotification(
    userId: string,
    payload: { title: string; body: string; data?: Record<string, string> },
  ) {
    try {
      // Lấy tất cả device tokens của user
      const { data: tokens, error } = await this.supabase
        .from('device_tokens')
        .select('token, platform')
        .eq('user_id', userId);

      if (error) {
        this.logger.error('[NotificationsService] Lỗi lấy tokens:', error);
        throw new InternalServerErrorException('Lỗi gửi notification');
      }

      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          message: 'Không có device token nào được đăng ký',
          sent: 0,
        };
      }

      // TODO: Gửi qua Firebase Admin SDK
      // const messages = tokens.map(t => ({
      //   token: t.token,
      //   notification: { title: payload.title, body: payload.body },
      //   data: payload.data,
      // }));
      // const result = await admin.messaging().sendEach(messages);

      this.logger.log(
        `[NotificationsService] Sẽ gửi notification tới ${tokens.length} devices (Firebase chưa configure)`,
      );

      return {
        success: true,
        message: `Notification queued (Firebase chưa configure). ${tokens.length} devices sẽ nhận.`,
        sent: tokens.length,
        devicesTargeted: tokens.map((t: any) => ({
          platform: t.platform,
          tokenPrefix: t.token.substring(0, 10) + '...',
        })),
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[NotificationsService] Lỗi gửi notification:', error);
      throw new InternalServerErrorException('Lỗi gửi notification');
    }
  }

  /**
   * Xóa device token (khi user logout)
   *
   * Mục đích: Unregister device khi user logout
   * @param userId - ID của user
   * @param token - Token cần xóa
   * @returns Kết quả xóa
   * Khi nào sử dụng: DELETE /notifications/unregister → Logout flow
   */
  async unregisterDevice(userId: string, token: string) {
    try {
      const { error } = await this.supabase
        .from('device_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', token);

      if (error) {
        this.logger.error('[NotificationsService] Lỗi xóa device token:', error);
        throw new InternalServerErrorException('Lỗi xóa device token');
      }

      return {
        success: true,
        message: 'Đã xóa device token',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('[NotificationsService] Lỗi xóa device token:', error);
      throw new InternalServerErrorException('Lỗi xóa device token');
    }
  }
}

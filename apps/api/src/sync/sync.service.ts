/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface cho offline action
 */
interface SyncAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * SyncService - Service xử lý đồng bộ offline data
 *
 * Mục đích: Process queue actions khi device quay lại online
 * Tham số đầu vào: userId, actions[]
 * Tham số đầu ra: Sync results
 * Khi nào sử dụng: Được inject vào SyncController
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private supabase: SupabaseClient;

  // Whitelist các bảng cho phép sync
  private readonly ALLOWED_TABLES = [
    'lessons',
    'custom_scenarios',
    'listen_later',
    'user_settings',
    'saved_words',
  ];

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Process hàng đợi offline actions
   *
   * Mục đích: Thực thi từng action trong queue theo thứ tự
   * @param userId - ID của user hiện tại
   * @param actions - Danh sách actions từ device
   * @returns Kết quả xử lý từng action
   * Khi nào sử dụng: POST /sync/queue → khi device reconnect
   */
  async processQueue(userId: string, actions: SyncAction[]) {
    const results: {
      id: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const action of actions) {
      try {
        // Validate table whitelist
        if (!this.ALLOWED_TABLES.includes(action.table)) {
          results.push({
            id: action.id,
            success: false,
            error: `Bảng "${action.table}" không được phép sync`,
          });
          continue;
        }

        switch (action.type) {
          case 'CREATE': {
            const { error } = await this.supabase
              .from(action.table)
              .insert({
                ...action.data,
                user_id: userId,
              });

            if (error) {
              results.push({ id: action.id, success: false, error: error.message });
            } else {
              results.push({ id: action.id, success: true });
            }
            break;
          }

          case 'UPDATE': {
            const recordId = action.data.id;
            const { id: _, ...updateData } = action.data;

            const { error } = await this.supabase
              .from(action.table)
              .update(updateData)
              .eq('id', recordId)
              .eq('user_id', userId);

            if (error) {
              results.push({ id: action.id, success: false, error: error.message });
            } else {
              results.push({ id: action.id, success: true });
            }
            break;
          }

          case 'DELETE': {
            const { error } = await this.supabase
              .from(action.table)
              .delete()
              .eq('id', action.data.id)
              .eq('user_id', userId);

            if (error) {
              results.push({ id: action.id, success: false, error: error.message });
            } else {
              results.push({ id: action.id, success: true });
            }
            break;
          }

          default:
            results.push({
              id: action.id,
              success: false,
              error: `Action type "${action.type}" không được hỗ trợ`,
            });
        }
      } catch (error: any) {
        this.logger.error(`[SyncService] Lỗi xử lý action ${action.id}:`, error);
        results.push({
          id: action.id,
          success: false,
          error: error.message || 'Lỗi không xác định',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    this.logger.log(
      `[SyncService] Đã xử lý ${actions.length} actions: ${successCount} thành công, ${failCount} lỗi`,
    );

    return {
      success: true,
      processed: actions.length,
      successCount,
      failCount,
      results,
    };
  }

  /**
   * Lấy sync status
   *
   * Mục đích: Trả về timestamp sync cuối cùng
   * @param userId - ID của user hiện tại
   * @returns Sync status
   * Khi nào sử dụng: GET /sync/status → kiểm tra trước khi sync
   */
  async getStatus(userId: string) {
    try {
      // Lấy record mới nhất từ lessons (proxy cho last sync time)
      const { data: lastLesson } = await this.supabase
        .from('lessons')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Lấy settings updated_at
      const { data: settings } = await this.supabase
        .from('user_settings')
        .select('updated_at')
        .eq('user_id', userId)
        .single();

      return {
        success: true,
        lastSync: {
          lessons: lastLesson?.created_at || null,
          settings: settings?.updated_at || null,
        },
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('[SyncService] Lỗi lấy sync status:', error);
      return {
        success: true,
        lastSync: { lessons: null, settings: null },
        serverTime: new Date().toISOString(),
      };
    }
  }
}

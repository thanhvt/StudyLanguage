import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface cho việc thêm item vào Listen Later
 */
export interface AddListenLaterDto {
  topic: string;
  conversation: { speaker: string; text: string }[];
  duration: number;
  numSpeakers: number;
  category?: string;
  subCategory?: string;
}

/**
 * ListenLaterService - Service xử lý CRUD cho Listen Later
 * 
 * Mục đích: Quản lý danh sách "Nghe Sau" của user trong Supabase
 * Tham số đầu vào: userId và DTO
 * Tham số đầu ra: Dữ liệu từ Supabase
 * Khi nào sử dụng: Được inject vào ListenLaterController
 */
@Injectable()
export class ListenLaterService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Lấy danh sách Listen Later của user
   * 
   * @param userId - ID của user hiện tại
   * @returns Danh sách items sắp xếp theo thời gian tạo mới nhất
   */
  async getListenLater(userId: string) {
    const { data, error } = await this.supabase
      .from('listen_later')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ListenLaterService] Lỗi lấy listen later:', error);
      throw error;
    }

    return {
      success: true,
      items: data || [],
      count: data?.length || 0,
    };
  }

  /**
   * Thêm item vào Listen Later
   * 
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu item cần thêm
   * @returns Item vừa thêm
   */
  async addToListenLater(userId: string, dto: AddListenLaterDto) {
    const { data, error } = await this.supabase
      .from('listen_later')
      .insert({
        user_id: userId,
        topic: dto.topic,
        conversation: dto.conversation,
        duration: dto.duration,
        num_speakers: dto.numSpeakers,
        category: dto.category,
        sub_category: dto.subCategory,
      })
      .select()
      .single();

    if (error) {
      console.error('[ListenLaterService] Lỗi thêm listen later:', error);
      throw error;
    }

    return {
      success: true,
      item: data,
    };
  }

  /**
   * Xóa item khỏi Listen Later
   * 
   * @param userId - ID của user hiện tại
   * @param itemId - ID của item cần xóa
   * @returns Kết quả xóa
   */
  async removeFromListenLater(userId: string, itemId: string) {
    const { error } = await this.supabase
      .from('listen_later')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      console.error('[ListenLaterService] Lỗi xóa listen later:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa khỏi danh sách Nghe Sau',
    };
  }

  /**
   * Xóa tất cả items trong Listen Later
   * 
   * @param userId - ID của user hiện tại
   * @returns Kết quả xóa
   */
  async clearListenLater(userId: string) {
    const { error } = await this.supabase
      .from('listen_later')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[ListenLaterService] Lỗi xóa tất cả listen later:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa tất cả khỏi danh sách Nghe Sau',
    };
  }
}

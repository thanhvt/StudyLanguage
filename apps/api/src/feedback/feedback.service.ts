import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface cho việc tạo feedback
 */
export interface CreateFeedbackDto {
  email: string;
  type: 'bug' | 'feature' | 'general' | 'content';
  title: string;
  description: string;
  pageUrl?: string;
  userAgent?: string;
}

/**
 * FeedbackService - Service xử lý feedback submissions
 *
 * Mục đích: Lưu trữ feedback từ user (cả guest và authenticated)
 * Tham số đầu vào: userId (optional) và CreateFeedbackDto
 * Tham số đầu ra: Kết quả lưu từ Supabase
 * Khi nào sử dụng: Được inject vào FeedbackController
 */
@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Gửi feedback mới
   *
   * @param userId - ID của user (null nếu guest)
   * @param dto - Dữ liệu feedback
   * @returns Feedback vừa tạo
   */
  async submitFeedback(userId: string | null, dto: CreateFeedbackDto) {
    // Validate required fields
    if (!dto.email || !dto.type || !dto.title || !dto.description) {
      throw new BadRequestException('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate type
    const validTypes = ['bug', 'feature', 'general', 'content'];
    if (!validTypes.includes(dto.type)) {
      throw new BadRequestException('Invalid feedback type');
    }

    const { data, error } = await this.supabase
      .from('feedbacks')
      .insert({
        user_id: userId,
        email: dto.email,
        type: dto.type,
        title: dto.title.trim(),
        description: dto.description.trim(),
        page_url: dto.pageUrl || null,
        user_agent: dto.userAgent || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      this.logger.error('[FeedbackService] Lỗi gửi feedback:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Cảm ơn bạn đã gửi góp ý!',
      feedback: {
        id: data.id,
        type: data.type,
        title: data.title,
        createdAt: data.created_at,
      },
    };
  }

  /**
   * Lấy danh sách feedback của user (nếu đã đăng nhập)
   *
   * @param userId - ID của user
   * @returns Danh sách feedback
   */
  async getUserFeedbacks(userId: string) {
    const { data, error } = await this.supabase
      .from('feedbacks')
      .select('id, type, title, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('[FeedbackService] Lỗi lấy feedback:', error);
      throw error;
    }

    return {
      success: true,
      feedbacks: (data || []).map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        status: row.status,
        createdAt: row.created_at,
      })),
      count: data?.length || 0,
    };
  }
}

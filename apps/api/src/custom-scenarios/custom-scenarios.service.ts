/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface cho việc tạo custom scenario
 */
export interface CreateCustomScenarioDto {
  name: string;
  description?: string;
  category?: string;
  /** ID nhóm chủ đề (custom_categories.id). NULL = Other */
  categoryId?: string;
}

/**
 * Interface cho việc cập nhật custom scenario
 */
export interface UpdateCustomScenarioDto {
  name?: string;
  description?: string;
  isFavorite?: boolean;
  /** ID nhóm chủ đề (custom_categories.id). null = move to Other */
  categoryId?: string | null;
}

/**
 * CustomScenariosService - Service xử lý CRUD cho Custom Scenarios
 *
 * Mục đích: Quản lý scenarios tùy chỉnh của user trong Supabase
 * Tham số đầu vào: userId và DTO
 * Tham số đầu ra: Dữ liệu từ Supabase
 * Khi nào sử dụng: Được inject vào CustomScenariosController
 */
@Injectable()
export class CustomScenariosService {
  private readonly logger = new Logger(CustomScenariosService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Lấy danh sách custom scenarios của user
   *
   * @param userId - ID của user hiện tại
   * @returns Danh sách scenarios, favorites trước, theo created_at mới nhất
   */
  async getCustomScenarios(userId: string, categoryId?: string | null) {
    let query = this.supabase
      .from('custom_scenarios')
      .select('*')
      .eq('user_id', userId);

    // Lọc theo categoryId nếu có
    if (categoryId === null || categoryId === 'null') {
      // Lấy scenarios thuộc Other (category_id = null)
      query = query.is('category_id', null);
    } else if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('[CustomScenariosService] Lỗi lấy custom scenarios:', error);
      throw error;
    }

    return {
      success: true,
      scenarios: (data || []).map(this.transformScenario),
      count: data?.length || 0,
    };
  }

  /**
   * Tạo custom scenario mới
   *
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu scenario cần tạo
   * @returns Scenario vừa tạo
   */
  async createCustomScenario(userId: string, dto: CreateCustomScenarioDto) {
    const { data, error } = await this.supabase
      .from('custom_scenarios')
      .insert({
        user_id: userId,
        name: dto.name,
        description: dto.description || '',
        category: dto.category || 'custom',
        category_id: dto.categoryId || null,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('[CustomScenariosService] Lỗi tạo custom scenario:', error);
      throw error;
    }

    return {
      success: true,
      scenario: this.transformScenario(data),
    };
  }

  /**
   * Cập nhật custom scenario
   *
   * @param userId - ID của user hiện tại
   * @param scenarioId - ID của scenario cần cập nhật
   * @param dto - Dữ liệu cập nhật
   * @returns Scenario đã cập nhật
   */
  async updateCustomScenario(
    userId: string,
    scenarioId: string,
    dto: UpdateCustomScenarioDto,
  ) {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isFavorite !== undefined) updateData.is_favorite = dto.isFavorite;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId || null;

    const { data, error } = await this.supabase
      .from('custom_scenarios')
      .update(updateData)
      .eq('id', scenarioId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('[CustomScenariosService] Lỗi cập nhật custom scenario:', error);
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Custom scenario không tồn tại');
    }

    return {
      success: true,
      scenario: this.transformScenario(data),
    };
  }

  /**
   * Toggle trạng thái favorite
   *
   * @param userId - ID của user hiện tại
   * @param scenarioId - ID của scenario
   * @returns Trạng thái favorite mới
   */
  async toggleFavorite(userId: string, scenarioId: string) {
    // Lấy trạng thái hiện tại
    const { data: current, error: fetchError } = await this.supabase
      .from('custom_scenarios')
      .select('is_favorite')
      .eq('id', scenarioId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !current) {
      throw new NotFoundException('Custom scenario không tồn tại');
    }

    // Toggle
    const { data, error } = await this.supabase
      .from('custom_scenarios')
      .update({
        is_favorite: !current.is_favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scenarioId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('[CustomScenariosService] Lỗi toggle favorite:', error);
      throw error;
    }

    return {
      success: true,
      isFavorite: data.is_favorite,
      message: data.is_favorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
    };
  }

  /**
   * Xóa custom scenario
   *
   * @param userId - ID của user hiện tại
   * @param scenarioId - ID của scenario cần xóa
   * @returns Kết quả xóa
   */
  async deleteCustomScenario(userId: string, scenarioId: string) {
    const { error } = await this.supabase
      .from('custom_scenarios')
      .delete()
      .eq('id', scenarioId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('[CustomScenariosService] Lỗi xóa custom scenario:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa custom scenario',
    };
  }

  /**
   * Mục đích: Di chuyển scenario sang category khác
   * Tham số đầu vào: userId, scenarioId, targetCategoryId (null = Other)
   * Tham số đầu ra: { success, scenario }
   * Khi nào sử dụng: Settings > ManageCategories > ManageScenarios > "Di chuyển nhóm"
   */
  async moveScenario(
    userId: string,
    scenarioId: string,
    targetCategoryId: string | null,
  ) {
    this.logger.log(
      `[moveScenario] Di chuyển scenario ${scenarioId} → category ${targetCategoryId || 'Other'}`,
    );

    const { data, error } = await this.supabase
      .from('custom_scenarios')
      .update({
        category_id: targetCategoryId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scenarioId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('[moveScenario] Lỗi di chuyển:', error);
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Chủ đề không tồn tại');
    }

    return {
      success: true,
      scenario: this.transformScenario(data),
    };
  }

  /**
   * Transform database row thành response format
   */
  private transformScenario(row: any) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      categoryId: row.category_id || null,
      isFavorite: row.is_favorite || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

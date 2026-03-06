/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Giới hạn số categories mỗi user */
const MAX_CATEGORIES_PER_USER = 10;

/**
 * Interface cho việc tạo custom category
 */
export interface CreateCustomCategoryDto {
  name: string;
  icon?: string;
  description?: string;
  /** Danh sách tên scenarios tạo kèm (optional, name-only) */
  scenarioNames?: string[];
}

/**
 * Interface cho việc cập nhật custom category
 */
export interface UpdateCustomCategoryDto {
  name?: string;
  icon?: string;
  description?: string;
}

/**
 * CustomCategoriesService — Service xử lý CRUD cho Custom Categories
 *
 * Mục đích: Quản lý nhóm chủ đề tùy chỉnh của user trong Supabase
 * Tham số đầu vào: userId và DTO
 * Tham số đầu ra: Dữ liệu từ Supabase
 * Khi nào sử dụng: Được inject vào CustomCategoriesController
 */
@Injectable()
export class CustomCategoriesService {
  private readonly logger = new Logger(CustomCategoriesService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Mục đích: Lấy danh sách custom categories của user
   * Tham số đầu vào: userId (string) — ID của user hiện tại
   * Tham số đầu ra: { success, categories, count }
   * Khi nào sử dụng: Frontend load danh sách categories khi mở TopicPicker
   */
  async getCategories(userId: string) {
    this.logger.log(`[getCategories] Lấy danh sách categories cho user: ${userId}`);

    const { data, error } = await this.supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('[getCategories] Lỗi lấy categories:', error);
      throw error;
    }

    // Batch query: đếm scenarios theo category_id trong 1 lượt (thay vì N+1)
    const categoryIds = (data || []).map(c => c.id);

    let countMap: Record<string, number> = {};
    if (categoryIds.length > 0) {
      const { data: countData } = await this.supabase
        .from('custom_scenarios')
        .select('category_id')
        .eq('user_id', userId)
        .in('category_id', categoryIds);

      // Đếm thủ công từ kết quả (group by category_id)
      countMap = (countData || []).reduce((acc: Record<string, number>, row: any) => {
        const catId = row.category_id;
        acc[catId] = (acc[catId] || 0) + 1;
        return acc;
      }, {});
    }

    const categories = (data || []).map((cat) => ({
      ...this.transformCategory(cat),
      scenarioCount: countMap[cat.id] || 0,
    }));

    // Đếm scenarios chưa gán nhóm (Other) — 1 query duy nhất
    const { count: otherCount } = await this.supabase
      .from('custom_scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('category_id', null);

    return {
      success: true,
      categories,
      otherCount: otherCount || 0,
      count: categories.length,
      maxCategories: MAX_CATEGORIES_PER_USER,
    };
  }

  /**
   * Mục đích: Tạo category mới + optional batch tạo scenarios
   * Tham số đầu vào: userId, dto (name, icon, description, scenarioNames?)
   * Tham số đầu ra: { success, category }
   * Khi nào sử dụng: User nhấn "Tạo nhóm" trong CreateCategorySheet
   */
  async createCategory(userId: string, dto: CreateCustomCategoryDto) {
    this.logger.log(`[createCategory] Tạo category mới: "${dto.name}" cho user: ${userId}`);

    // Kiểm tra giới hạn 10 categories
    const { count } = await this.supabase
      .from('custom_categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count || 0) >= MAX_CATEGORIES_PER_USER) {
      throw new BadRequestException(
        `Đã đạt giới hạn ${MAX_CATEGORIES_PER_USER} nhóm. Xoá nhóm cũ để tạo mới.`,
      );
    }

    // Tạo category
    const { data, error } = await this.supabase
      .from('custom_categories')
      .insert({
        user_id: userId,
        name: dto.name.trim(),
        icon: dto.icon || '📂',
        description: dto.description || '',
      })
      .select()
      .single();

    if (error) {
      // Kiểm tra lỗi unique constraint
      if (error.code === '23505') {
        throw new BadRequestException(`Tên nhóm "${dto.name}" đã tồn tại.`);
      }
      this.logger.error('[createCategory] Lỗi tạo category:', error);
      // EC-16: Wrap raw Supabase error → không leak DB schema ra client
      throw new InternalServerErrorException('Lỗi tạo nhóm chủ đề. Vui lòng thử lại.');
    }

    // Batch tạo scenarios nếu có (name-only)
    let scenariosCreated = 0;
    if (dto.scenarioNames && dto.scenarioNames.length > 0) {
      // EC-18: Deduplicate + validate scenario names
      const uniqueNames = [...new Set(
        dto.scenarioNames
          .map(name => name.trim())
          .filter(name => name.length > 0),
      )];

      const scenarioInserts = uniqueNames
        .slice(0, 5) // Max 5 scenarios khi tạo nhanh
        .map((name) => ({
          user_id: userId,
          name: name.trim(),
          description: '',
          category: 'custom',
          category_id: data.id,
        }));

      if (scenarioInserts.length > 0) {
        const { error: scenarioError } = await this.supabase
          .from('custom_scenarios')
          .insert(scenarioInserts);

        if (scenarioError) {
          this.logger.warn('[createCategory] Lỗi tạo batch scenarios:', scenarioError);
          // Không throw — category đã tạo thành công, scenario lỗi không critical
        } else {
          scenariosCreated = scenarioInserts.length;
        }
      }
    }

    return {
      success: true,
      category: {
        ...this.transformCategory(data),
        scenarioCount: scenariosCreated,
      },
    };
  }

  /**
   * Mục đích: Cập nhật thông tin category
   * Tham số đầu vào: userId, categoryId, dto (name?, icon?, description?)
   * Tham số đầu ra: { success, category }
   * Khi nào sử dụng: User sửa tên/icon/mô tả trong Settings > ManageCategories
   */
  async updateCategory(
    userId: string,
    categoryId: string,
    dto: UpdateCustomCategoryDto,
  ) {
    this.logger.log(`[updateCategory] Cập nhật category: ${categoryId}`);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.description !== undefined) updateData.description = dto.description;

    const { data, error } = await this.supabase
      .from('custom_categories')
      .update(updateData)
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(`Tên nhóm "${dto.name}" đã tồn tại.`);
      }
      this.logger.error('[updateCategory] Lỗi cập nhật:', error);
      // EC-16: Wrap raw error
      throw new InternalServerErrorException('Lỗi cập nhật nhóm. Vui lòng thử lại.');
    }

    if (!data) {
      throw new NotFoundException('Nhóm chủ đề không tồn tại');
    }

    return {
      success: true,
      category: this.transformCategory(data),
    };
  }

  /**
   * Mục đích: Xoá category + xử lý scenarios bên trong
   * Tham số đầu vào: userId, categoryId, keepScenarios (boolean)
   * Tham số đầu ra: { success, message, movedScenarios? }
   * Khi nào sử dụng: User xoá nhóm trong Settings > ManageCategories
   *   - keepScenarios=true → chuyển scenarios vào Other (set category_id=null)
   *   - keepScenarios=false → xoá tất cả scenarios trong nhóm + xoá nhóm
   */
  async deleteCategory(
    userId: string,
    categoryId: string,
    keepScenarios: boolean = true,
  ) {
    this.logger.log(
      `[deleteCategory] Xoá category: ${categoryId}, keepScenarios: ${keepScenarios}`,
    );

    // Kiểm tra category tồn tại
    const { data: existing, error: fetchError } = await this.supabase
      .from('custom_categories')
      .select('*')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      throw new NotFoundException('Nhóm chủ đề không tồn tại');
    }

    let movedScenarios = 0;

    if (keepScenarios) {
      // Chuyển scenarios vào Other (category_id = null)
      const { data: moved } = await this.supabase
        .from('custom_scenarios')
        .update({ category_id: null, updated_at: new Date().toISOString() })
        .eq('category_id', categoryId)
        .eq('user_id', userId)
        .select();

      movedScenarios = moved?.length || 0;
    } else {
      // Xoá tất cả scenarios trong nhóm
      // EC-17: Kiểm tra lỗi xoá scenarios trước khi xoá category
      const { error: scenarioDelError } = await this.supabase
        .from('custom_scenarios')
        .delete()
        .eq('category_id', categoryId)
        .eq('user_id', userId);

      if (scenarioDelError) {
        this.logger.error('[deleteCategory] Lỗi xoá scenarios:', scenarioDelError);
        throw new InternalServerErrorException('Lỗi xoá chủ đề trong nhóm. Vui lòng thử lại.');
      }
    }

    // Xoá category
    const { error } = await this.supabase
      .from('custom_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('[deleteCategory] Lỗi xoá:', error);
      // EC-16: Wrap raw error
      throw new InternalServerErrorException('Lỗi xoá nhóm. Vui lòng thử lại.');
    }

    return {
      success: true,
      message: keepScenarios
        ? `Đã xoá nhóm và chuyển ${movedScenarios} chủ đề vào Other`
        : 'Đã xoá nhóm và tất cả chủ đề bên trong',
      movedScenarios: keepScenarios ? movedScenarios : 0,
    };
  }

  /**
   * Mục đích: Transform database row thành response format
   * Tham số đầu vào: row (any) — raw row từ Supabase
   * Tham số đầu ra: object đã format
   * Khi nào sử dụng: Tất cả methods trả dữ liệu → gọi hàm này
   */
  private transformCategory(row: any) {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      description: row.description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

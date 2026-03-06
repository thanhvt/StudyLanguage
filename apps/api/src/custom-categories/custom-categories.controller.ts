/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomCategoriesService } from './custom-categories.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  MaxLength,
} from 'class-validator';

// ==================== DTOs ====================

/**
 * Mục đích: Validate input POST /custom-categories
 * Tham số: name (bắt buộc), icon, description, scenarioNames (tuỳ chọn)
 * Khi nào sử dụng: User tạo category mới từ CreateCategorySheet
 */
class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  scenarioNames?: string[];
}

/**
 * Mục đích: Validate input PATCH /custom-categories/:id
 * Khi nào sử dụng: User sửa category trong Settings
 */
class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(25)
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * CustomCategoriesController — Controller quản lý custom categories
 *
 * Mục đích: Xử lý các request CRUD cho nhóm chủ đề tùy chỉnh
 * Tham số đầu vào: Request từ client với JWT token
 * Tham số đầu ra: JSON response với dữ liệu categories
 * Khi nào sử dụng:
 *   - TopicPicker → tạo category mới (POST)
 *   - TopicPicker → load danh sách (GET)
 *   - Settings → sửa/xoá category (PATCH/DELETE)
 */
@ApiTags('Custom Categories')
@ApiBearerAuth()
@Controller('custom-categories')
@UseGuards(SupabaseAuthGuard)
export class CustomCategoriesController {
  constructor(
    private readonly customCategoriesService: CustomCategoriesService,
  ) {}

  /**
   * Mục đích: Lấy danh sách categories của user
   * Tham số đầu vào: JWT token (auto extract userId)
   * Tham số đầu ra: { success, categories, otherCount, count, maxCategories }
   * Khi nào sử dụng: TopicPicker mount → fetch categories
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách custom categories' })
  async getCategories(@Req() req: any) {
    const userId = req.user.id;
    return this.customCategoriesService.getCategories(userId);
  }

  /**
   * Mục đích: Tạo category mới + optional batch scenarios
   * Tham số đầu vào: { name, icon?, description?, scenarioNames? }
   * Tham số đầu ra: { success, category }
   * Khi nào sử dụng: User nhấn "✅ Tạo nhóm" trong CreateCategorySheet
   */
  @Post()
  @ApiOperation({ summary: 'Tạo custom category mới' })
  async createCategory(@Req() req: any, @Body() body: CreateCategoryDto) {
    const userId = req.user.id;
    return this.customCategoriesService.createCategory(userId, body);
  }

  /**
   * Mục đích: Cập nhật thông tin category
   * Tham số đầu vào: categoryId (param), { name?, icon?, description? }
   * Tham số đầu ra: { success, category }
   * Khi nào sử dụng: User sửa trong Settings > ManageCategories
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật custom category' })
  async updateCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    const userId = req.user.id;
    return this.customCategoriesService.updateCategory(userId, id, body);
  }

  /**
   * Mục đích: Xoá category + xử lý scenarios bên trong
   * Tham số đầu vào: categoryId (param), keepScenarios (query, default true)
   * Tham số đầu ra: { success, message, movedScenarios? }
   * Khi nào sử dụng: User xoá nhóm trong Settings
   *   - keepScenarios=true → chuyển scenarios vào Other
   *   - keepScenarios=false → cascade delete scenarios
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xoá custom category' })
  @ApiQuery({
    name: 'keepScenarios',
    required: false,
    type: Boolean,
    description: 'Giữ scenarios (chuyển vào Other) hay xoá hết',
  })
  async deleteCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Query('keepScenarios') keepScenarios?: string,
  ) {
    const userId = req.user.id;
    // Query params luôn là string → convert
    const keep = keepScenarios !== 'false';
    return this.customCategoriesService.deleteCategory(userId, id, keep);
  }
}

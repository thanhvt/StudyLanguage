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
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomScenariosService } from './custom-scenarios.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

// ==================== DTOs ====================

/**
 * DTO cho tạo custom scenario
 *
 * Mục đích: Validate input POST /custom-scenarios
 * Tham số: name (bắt buộc), description, category (tùy chọn)
 * Khi nào sử dụng: User tạo scenario mới
 */
class CreateCustomScenarioDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

/**
 * DTO cho cập nhật custom scenario
 *
 * Mục đích: Validate input PATCH /custom-scenarios/:id
 * Khi nào sử dụng: User edit scenario
 */
class UpdateCustomScenarioDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;
}

/**
 * CustomScenariosController - Controller quản lý custom scenarios
 *
 * Mục đích: Xử lý các request liên quan đến custom scenarios
 * Tham số đầu vào: Request từ client với JWT token
 * Tham số đầu ra: JSON response với dữ liệu scenarios
 * Khi nào sử dụng: Được gọi từ frontend khi user quản lý custom scenarios
 */
@ApiTags('Custom Scenarios')
@ApiBearerAuth()
@Controller('custom-scenarios')
@UseGuards(SupabaseAuthGuard)
export class CustomScenariosController {
  constructor(private readonly customScenariosService: CustomScenariosService) {}

  /**
   * Lấy danh sách custom scenarios của user
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách custom scenarios' })
  async getCustomScenarios(@Req() req: any) {
    const userId = req.user.id;
    return this.customScenariosService.getCustomScenarios(userId);
  }

  /**
   * Tạo custom scenario mới
   */
  @Post()
  @ApiOperation({ summary: 'Tạo custom scenario mới' })
  async createCustomScenario(
    @Req() req: any,
    @Body() body: CreateCustomScenarioDto,
  ) {
    const userId = req.user.id;
    return this.customScenariosService.createCustomScenario(userId, body);
  }

  /**
   * Cập nhật custom scenario
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật custom scenario' })
  async updateCustomScenario(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateCustomScenarioDto,
  ) {
    const userId = req.user.id;
    return this.customScenariosService.updateCustomScenario(userId, id, body);
  }

  /**
   * Toggle trạng thái favorite
   */
  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite custom scenario' })
  async toggleFavorite(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.customScenariosService.toggleFavorite(userId, id);
  }

  /**
   * Xóa custom scenario
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa custom scenario' })
  async deleteCustomScenario(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.customScenariosService.deleteCustomScenario(userId, id);
  }
}

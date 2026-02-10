/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsIn,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== DTOs ====================

/**
 * DTO cho 1 sync action
 *
 * Mục đích: Validate từng action trong queue
 * Khi nào sử dụng: POST /sync/queue → body.actions[]
 */
class SyncActionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsIn(['CREATE', 'UPDATE', 'DELETE'])
  type: 'CREATE' | 'UPDATE' | 'DELETE';

  @IsString()
  @IsNotEmpty()
  table: string;

  @IsObject()
  data: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  timestamp: string;
}

/**
 * DTO cho sync queue request
 *
 * Mục đích: Validate input POST /sync/queue
 * Khi nào sử dụng: Device reconnect → upload offline actions
 */
class SyncQueueDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncActionDto)
  actions: SyncActionDto[];
}

// ==================== Controller ====================

/**
 * SyncController - API endpoints cho Offline Sync
 *
 * Mục đích: Process offline action queue, check sync status
 * Base path: /api/sync
 * Khi nào sử dụng: Mobile app reconnection flow
 */
@Controller('sync')
@UseGuards(SupabaseAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * POST /api/sync/queue
   *
   * Mục đích: Upload và process offline action queue
   * @param dto - { actions: SyncActionDto[] }
   * @returns Kết quả xử lý từng action
   * Khi nào sử dụng: Device reconnect sau offline period
   */
  @Post('queue')
  @HttpCode(HttpStatus.OK)
  async processQueue(@Req() req: any, @Body() dto: SyncQueueDto) {
    return this.syncService.processQueue(req.user.id, dto.actions);
  }

  /**
   * GET /api/sync/status
   *
   * Mục đích: Kiểm tra sync status và timestamp cuối
   * @returns { lastSync, serverTime }
   * Khi nào sử dụng: Trước khi bắt đầu sync process
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Req() req: any) {
    return this.syncService.getStatus(req.user.id);
  }
}

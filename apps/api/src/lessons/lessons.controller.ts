/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LessonsService, CreateLessonDto } from './lessons.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO với validation cho request tạo lesson
 */
class CreateLessonRequestDto implements CreateLessonDto {
  @IsEnum(['listening', 'speaking', 'reading', 'writing'])
  @IsNotEmpty()
  type: 'listening' | 'speaking' | 'reading' | 'writing';

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsNotEmpty()
  content: any;

  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @IsNumber()
  @IsOptional()
  numSpeakers?: number;

  @IsString()
  @IsOptional()
  keywords?: string;

  @IsEnum(['passive', 'interactive'])
  @IsOptional()
  mode?: 'passive' | 'interactive';

  @IsEnum(['draft', 'completed'])
  @IsOptional()
  status?: 'draft' | 'completed';
}

/**
 * DTO cho timestamp
 */
class TimestampDto {
  @IsNumber()
  startTime: number;

  @IsNumber()
  endTime: number;
}

/**
 * DTO cho request cập nhật audio
 */
class UpdateAudioRequestDto {
  @IsString()
  @IsNotEmpty()
  audioUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimestampDto)
  @IsOptional()
  audioTimestamps?: TimestampDto[];
}

/**
 * LessonsController - API endpoints cho lessons
 *
 * Mục đích: CRUD operations cho lessons
 * Base path: /api/lessons
 */
@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * POST /api/lessons
   *
   * Mục đích: Tạo lesson mới (lưu bài học vào database)
   * Body: { type, topic, content, durationMinutes?, numSpeakers?, keywords?, mode?, status? }
   * Trả về: { success: true, lesson: { id, type, topic, createdAt } }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo bài học mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  async createLesson(@Req() req: any, @Body() dto: CreateLessonRequestDto) {
    const userId = req.user.id;
    return this.lessonsService.createLesson(userId, dto);
  }

  /**
   * PATCH /api/lessons/:id/audio
   *
   * Mục đích: Cập nhật audio URL và timestamps cho lesson sau khi sinh audio
   * Params: id - Lesson ID
   * Body: { audioUrl, audioTimestamps? }
   * Trả về: { success: true, message: 'Đã lưu audio URL' }
   */
  @Patch(':id/audio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật audio cho bài học' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateAudio(
    @Param('id') lessonId: string,
    @Body() dto: UpdateAudioRequestDto,
  ) {
    return this.lessonsService.updateAudioData(
      lessonId,
      dto.audioUrl,
      dto.audioTimestamps,
    );
  }
}

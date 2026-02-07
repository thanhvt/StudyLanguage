import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO cho việc sinh hội thoại tiếng Anh
 *
 * Mục đích: Validate input và hiển thị form trong Swagger UI
 * Khi nào sử dụng: POST /conversation-generator/generate
 */
export class GenerateConversationDto {
  @ApiProperty({
    description: 'Chủ đề hội thoại',
    example: 'ordering coffee at a cafe',
  })
  @IsString()
  topic: string;

  @ApiPropertyOptional({
    description: 'Trình độ tiếng Anh',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({
    description: 'Số lượt trao đổi trong hội thoại',
    minimum: 4,
    maximum: 30,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(30)
  numExchanges?: number;

  @ApiPropertyOptional({
    description: 'Có bao gồm bản dịch tiếng Việt không',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeVietnamese?: boolean;
}

/**
 * DTO cho việc luyện tập với từ vựng cụ thể
 *
 * Mục đích: Validate input cho practice endpoint
 * Khi nào sử dụng: POST /conversation-generator/practice
 */
export class PracticeConversationDto {
  @ApiProperty({
    description: 'Danh sách từ vựng cần luyện tập',
    example: ['negotiate', 'salary', 'benefits'],
    type: [String],
  })
  @IsString({ each: true })
  keywords: string[];

  @ApiPropertyOptional({
    description: 'Cấu trúc ngữ pháp cần luyện',
    example: 'Present Perfect tense',
  })
  @IsOptional()
  @IsString()
  grammarFocus?: string;

  @ApiPropertyOptional({
    description: 'Chủ đề hội thoại',
    example: 'job interview',
    default: 'daily life',
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({
    description: 'Trình độ tiếng Anh',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';
}

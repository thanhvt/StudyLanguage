import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';

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
    description: 'Thời lượng hội thoại (phút)',
    enum: [5, 10, 15],
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(15)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Trình độ tiếng Anh',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({
    description: 'Số lượt trao đổi (nếu không truyền sẽ tự tính từ duration)',
    minimum: 4,
    maximum: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(30)
  numExchanges?: number;

  @ApiPropertyOptional({
    description: 'Có bao gồm bản dịch tiếng Việt không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeVietnamese?: boolean;

  @ApiPropertyOptional({
    description: 'Số người nói trong hội thoại (2 = Dialog, 3 = Group, 4 = Team)',
    minimum: 2,
    maximum: 4,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(4)
  numSpeakers?: number;

  @ApiPropertyOptional({
    description: 'Từ khóa gợi ý để đưa vào hội thoại (tối đa 200 ký tự)',
    example: 'negotiation, deadline, teamwork',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  keywords?: string;
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

/**
 * DTO cho việc sinh văn bản tổng quát (bài đọc, câu hỏi...)
 *
 * Mục đích: Thay thế /ai/generate-text endpoint (OpenAI → Groq)
 * Khi nào sử dụng: POST /conversation-generator/generate-text
 */
export class GenerateTextDto {
  @ApiProperty({
    description: 'Prompt gửi đến AI',
    example: 'Tạo một bài đọc tiếng Anh về chủ đề "Travel" ở mức A2',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'System prompt (vai trò của AI)',
    example: 'You are an English teacher creating reading materials.',
  })
  @IsOptional()
  @IsString()
  systemPrompt?: string;
}

/**
 * DTO cho việc sinh hội thoại tương tác
 *
 * Mục đích: Thay thế /ai/generate-interactive-conversation (OpenAI → Groq)
 * Khi nào sử dụng: POST /conversation-generator/generate-interactive
 */
export class InteractiveConversationDto {
  @ApiProperty({
    description: 'Chủ đề hội thoại',
    example: 'Ordering food at a restaurant',
  })
  @IsString()
  topic: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngữ cảnh bổ sung',
    example: 'Generate an interactive 5 minute conversation where the user participates.',
  })
  @IsOptional()
  @IsString()
  contextDescription?: string;
}

/**
 * DTO cho việc tiếp tục hội thoại (AI phản hồi)
 *
 * Mục đích: Thay thế /ai/continue-conversation (OpenAI → Groq)
 * Khi nào sử dụng: POST /conversation-generator/continue-conversation
 */
export class ContinueConversationDto {
  @ApiProperty({
    description: 'Lịch sử hội thoại',
    type: 'array',
    example: [
      { speaker: 'AI Coach', text: 'What do you think about traveling?' },
      { speaker: 'User', text: 'I like travel very much.' },
    ],
  })
  @IsArray()
  conversationHistory: { speaker: string; text: string }[];

  @ApiProperty({
    description: 'Câu user vừa nói',
    example: 'I go to school yesterday',
  })
  @IsString()
  userInput: string;

  @ApiProperty({
    description: 'Chủ đề hội thoại',
    example: 'Daily routine',
  })
  @IsString()
  topic: string;
}

/**
 * DTO cho việc đánh giá phát âm
 *
 * Mục đích: Thay thế /ai/evaluate-pronunciation (OpenAI → Groq)
 * Khi nào sử dụng: POST /conversation-generator/evaluate-pronunciation
 */
export class EvaluatePronunciationDto {
  @ApiProperty({
    description: 'Văn bản gốc (mẫu)',
    example: 'The weather is beautiful today and I want to go for a walk.',
  })
  @IsString()
  originalText: string;

  @ApiProperty({
    description: 'Văn bản user đọc (transcript từ Whisper)',
    example: 'The weather is beautiful today and I want to go for walk.',
  })
  @IsString()
  userTranscript: string;
}

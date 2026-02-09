import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConversationGeneratorService } from './conversation-generator.service';
import {
  GenerateConversationDto,
  PracticeConversationDto,
  GenerateTextDto,
  InteractiveConversationDto,
  ContinueConversationDto,
  EvaluatePronunciationDto,
} from './dto/generate-conversation.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * ConversationGeneratorController - API endpoints cho sinh hội thoại
 *
 * Mục đích: Expose REST API để frontend gọi sinh hội thoại tiếng Anh
 * Khi nào sử dụng: Mobile/Web app gọi để lấy nội dung hội thoại học tập
 * [SECURITY] Tất cả endpoints yêu cầu xác thực Supabase
 */
@ApiTags('Conversation Generator')
@ApiBearerAuth()
@Controller('conversation-generator')
@UseGuards(SupabaseAuthGuard)
export class ConversationGeneratorController {
  constructor(
    private readonly conversationGeneratorService: ConversationGeneratorService,
  ) {}

  /**
   * Sinh hội thoại theo chủ đề tự do
   *
   * Mục đích: API chính để generate conversation
   * Endpoint: POST /conversation-generator/generate
   */
  @Post('generate')
  @ApiOperation({ summary: 'Sinh hội thoại tiếng Anh theo chủ đề' })
  @ApiBody({ type: GenerateConversationDto })
  async generateConversation(@Body() body: GenerateConversationDto) {
    return this.conversationGeneratorService.generateConversation(body);
  }

  /**
   * Sinh hội thoại theo kịch bản có sẵn
   *
   * Mục đích: Quick generate từ các scenarios phổ biến
   * Endpoint: GET /conversation-generator/scenario
   */
  @Get('scenario')
  @ApiOperation({ summary: 'Sinh hội thoại theo kịch bản có sẵn' })
  @ApiQuery({
    name: 'type',
    enum: [
      'restaurant',
      'hotel',
      'shopping',
      'airport',
      'hospital',
      'job_interview',
      'phone_call',
      'small_talk',
    ],
    description: 'Loại kịch bản hội thoại',
  })
  @ApiQuery({
    name: 'customContext',
    required: false,
    description: 'Yêu cầu bổ sung cho kịch bản',
  })
  async generateScenario(
    @Query('type')
    type:
      | 'restaurant'
      | 'hotel'
      | 'shopping'
      | 'airport'
      | 'hospital'
      | 'job_interview'
      | 'phone_call'
      | 'small_talk',
    @Query('customContext') customContext?: string,
  ) {
    return this.conversationGeneratorService.generateScenarioConversation(
      type,
      customContext,
    );
  }

  /**
   * Sinh hội thoại với từ vựng/ngữ pháp cụ thể
   *
   * Mục đích: Luyện tập vocabulary và grammar trong context
   * Endpoint: POST /conversation-generator/practice
   */
  @Post('practice')
  @ApiOperation({
    summary: 'Sinh hội thoại luyện tập từ vựng và ngữ pháp cụ thể',
  })
  @ApiBody({ type: PracticeConversationDto })
  async generatePractice(@Body() body: PracticeConversationDto) {
    return this.conversationGeneratorService.generatePracticeConversation(body);
  }

  // ============================================
  // ENDPOINTS MIGRATE TỪ /ai/* → /conversation-generator/*
  // ============================================

  /**
   * Sinh văn bản tổng quát (bài đọc, câu hỏi...)
   *
   * Mục đích: Thay thế /ai/generate-text (OpenAI → Groq)
   * Endpoint: POST /conversation-generator/generate-text
   * Luồng gọi: Reading module -> API -> Groq
   */
  @Post('generate-text')
  @ApiOperation({ summary: 'Sinh văn bản (bài đọc, câu hỏi) bằng Groq' })
  @ApiBody({ type: GenerateTextDto })
  async generateText(@Body() body: GenerateTextDto) {
    const result = await this.conversationGeneratorService.generateText(
      body.prompt,
      body.systemPrompt,
    );
    return { text: result };
  }

  /**
   * Sinh hội thoại tương tác có chỗ trống cho user
   *
   * Mục đích: Thay thế /ai/generate-interactive-conversation (OpenAI → Groq)
   * Endpoint: POST /conversation-generator/generate-interactive
   * Luồng gọi: Listening InteractiveMode -> API -> Groq
   */
  @Post('generate-interactive')
  @ApiOperation({ summary: 'Sinh hội thoại tương tác (có YOUR_TURN markers)' })
  @ApiBody({ type: InteractiveConversationDto })
  async generateInteractive(@Body() body: InteractiveConversationDto) {
    return this.conversationGeneratorService.generateInteractiveConversation(
      body.topic,
      body.contextDescription,
    );
  }

  /**
   * Tiếp tục hội thoại - AI phản hồi + sửa lỗi
   *
   * Mục đích: Thay thế /ai/continue-conversation (OpenAI → Groq)
   * Endpoint: POST /conversation-generator/continue-conversation
   * Luồng gọi: Speaking + Listening InteractiveMode -> API -> Groq
   */
  @Post('continue-conversation')
  @ApiOperation({ summary: 'AI phản hồi hội thoại + phát hiện lỗi ngữ pháp' })
  @ApiBody({ type: ContinueConversationDto })
  async continueConversation(@Body() body: ContinueConversationDto) {
    return this.conversationGeneratorService.continueConversation(
      body.conversationHistory,
      body.userInput,
      body.topic,
    );
  }

  /**
   * Đánh giá phát âm word-by-word
   *
   * Mục đích: Thay thế /ai/evaluate-pronunciation (OpenAI → Groq)
   * Endpoint: POST /conversation-generator/evaluate-pronunciation
   * Luồng gọi: Reading Feedback -> API -> Groq
   */
  @Post('evaluate-pronunciation')
  @ApiOperation({ summary: 'Đánh giá phát âm chi tiết từng từ' })
  @ApiBody({ type: EvaluatePronunciationDto })
  async evaluatePronunciation(@Body() body: EvaluatePronunciationDto) {
    return this.conversationGeneratorService.evaluatePronunciation(
      body.originalText,
      body.userTranscript,
    );
  }

  /**
   * Health check cho Groq API
   *
   * Mục đích: Kiểm tra API có hoạt động bình thường không
   * Endpoint: GET /conversation-generator/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái Groq API' })
  async healthCheck() {
    return this.conversationGeneratorService.checkHealth();
  }
}


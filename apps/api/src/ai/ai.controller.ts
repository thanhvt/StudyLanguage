/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { TtsProviderService } from './tts-provider.service';
import type { TtsProvider } from './tts-provider.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConversationItemDto {
  @IsString()
  @IsNotEmpty()
  speaker: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

class ConversationHistoryItemDto {
  @IsString()
  @IsNotEmpty()
  speaker: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

/**
 * DTO cho request sinh văn bản tùy ý
 *
 * Mục đích: Validate input POST /ai/generate-text
 * Tham số: prompt (bắt buộc), systemPrompt (tùy chọn)
 * Khi nào sử dụng: Khi cần sinh text từ AI (GPT/Groq)
 */
class GenerateTextDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;
}

/**
 * DTO cho request sinh hội thoại
 */
class GenerateConversationDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsNumber()
  durationMinutes: number;

  @IsNumber()
  @IsOptional()
  numSpeakers?: number;

  @IsString()
  @IsOptional()
  keywords?: string;
}

/**
 * DTO cho request TTS - Hỗ trợ cả OpenAI và Azure
 *
 * Mục đích: Validate input cho text-to-speech endpoint
 * Khi nào sử dụng: POST /ai/text-to-speech
 */
class TextToSpeechDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  voice?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['openai', 'azure'])
  provider?: TtsProvider;

  @IsString()
  @IsOptional()
  emotion?: string;

  @IsBoolean()
  @IsOptional()
  randomVoice?: boolean;

  @IsBoolean()
  @IsOptional()
  randomEmotion?: boolean;

  @IsString()
  @IsOptional()
  pitch?: string;

  @IsString()
  @IsOptional()
  rate?: string;

  @IsString()
  @IsOptional()
  volume?: string;
}

/**
 * DTO cho request đánh giá phát âm
 */
class EvaluatePronunciationDto {
  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsNotEmpty()
  userTranscript: string;
}

/**
 * DTO cho request sinh audio hội thoại - Hỗ trợ cả OpenAI và Azure
 *
 * Mục đích: Validate input cho generate-conversation-audio endpoint
 * Khi nào sử dụng: POST /ai/generate-conversation-audio
 */
class GenerateConversationAudioDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationItemDto)
  conversation: ConversationItemDto[];

  @IsString()
  @IsOptional()
  @IsEnum(['openai', 'azure'])
  provider?: TtsProvider;

  @IsString()
  @IsOptional()
  voice?: string;

  @IsString()
  @IsOptional()
  emotion?: string;

  @IsBoolean()
  @IsOptional()
  randomVoice?: boolean;

  @IsBoolean()
  @IsOptional()
  randomEmotion?: boolean;

  @IsBoolean()
  @IsOptional()
  multiTalker?: boolean;

  @IsNumber()
  @IsOptional()
  multiTalkerPairIndex?: number;

  /** Map giọng cho từng speaker (speakerLabel → voiceId). Mobile gửi khi user chọn thủ công */
  @IsOptional()
  voicePerSpeaker?: Record<string, string>;

  @IsString()
  @IsOptional()
  pitch?: string;

  @IsString()
  @IsOptional()
  rate?: string;

  @IsString()
  @IsOptional()
  volume?: string;
}

/**
 * DTO cho request sinh hội thoại tương tác
 */
class GenerateInteractiveConversationDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsOptional()
  contextDescription?: string;
}

/**
 * DTO cho request tiếp tục hội thoại
 */
class ContinueConversationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationHistoryItemDto)
  conversationHistory: ConversationHistoryItemDto[];

  @IsString()
  @IsNotEmpty()
  userInput: string;

  @IsString()
  @IsNotEmpty()
  topic: string;
}

/**
 * AI Controller - API endpoints cho AI features
 *
 * Mục đích: Expose các AI services qua REST API
 * Base path: /api/ai
 * [FIX API-AUTH-01] Tất cả endpoints đều yêu cầu xác thực Supabase
 */
@Controller('ai')
@UseGuards(SupabaseAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly ttsProviderService: TtsProviderService,
  ) {}

  /**
   * POST /api/ai/generate-conversation
   *
   * Mục đích: Sinh kịch bản hội thoại theo chủ đề
   * Body: { topic, durationMinutes, numSpeakers?, keywords? }
   * Trả về: { script: [{ speaker, text }] }
   */
  @Post('generate-conversation')
  @HttpCode(HttpStatus.OK)
  async generateConversation(@Body() dto: GenerateConversationDto) {
    return this.aiService.generateConversation(
      dto.topic,
      dto.durationMinutes,
      dto.numSpeakers || 2,
      dto.keywords,
    );
  }

  /**
   * POST /api/ai/transcribe
   *
   * Mục đích: Chuyển audio thành text (Whisper STT)
   * Body: FormData với file audio
   * Trả về: { text: "..." }
   */
  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const text = await this.aiService.transcribeAudio(file.buffer);
    return { text };
  }

  /**
   * POST /api/ai/text-to-speech
   *
   * Mục đích: Chuyển text thành audio (OpenAI hoặc Azure TTS)
   * Body: { text, voice?, provider?, emotion?, randomVoice?, ... }
   * Trả về: { audio: base64, contentType, wordTimestamps? }
   */
  @Post('text-to-speech')
  @HttpCode(HttpStatus.OK)
  async textToSpeech(@Body() dto: TextToSpeechDto) {
    // Nếu provider = azure → dùng TtsProviderService với word timestamps
    if (dto.provider === 'azure') {
      const result = await this.ttsProviderService.textToSpeechWithTimestamps(
        dto.text,
        {
          provider: dto.provider,
          voice: dto.voice,
          emotion: dto.emotion,
          randomVoice: dto.randomVoice,
          randomEmotion: dto.randomEmotion,
          pitch: dto.pitch,
          rate: dto.rate,
          volume: dto.volume,
        },
      );
      return {
        audio: result.audioBuffer.toString('base64'),
        contentType: 'audio/mpeg',
        wordTimestamps: result.wordTimestamps,
      };
    }

    // OpenAI (code gốc giữ nguyên)
    const audioBuffer = await this.aiService.textToSpeech(dto.text, dto.voice as any);
    return {
      audio: audioBuffer.toString('base64'),
      contentType: 'audio/mpeg',
    };
  }

  /**
   * POST /api/ai/evaluate-pronunciation
   *
   * Mục đích: Đánh giá phát âm của user
   * Body: { originalText, userTranscript }
   * Trả về: { overallScore, feedback }
   */
  @Post('evaluate-pronunciation')
  @HttpCode(HttpStatus.OK)
  async evaluatePronunciation(@Body() dto: EvaluatePronunciationDto) {
    return this.aiService.evaluatePronunciation(
      dto.originalText,
      dto.userTranscript,
    );
  }

  /**
   * POST /api/ai/generate-text
   *
   * Mục đích: Endpoint chung để sinh văn bản tùy ý
   * Body: { prompt, systemPrompt? }
   * Trả về: { text: "..." }
   */
  @Post('generate-text')
  @HttpCode(HttpStatus.OK)
  async generateText(@Body() dto: GenerateTextDto) {
    const text = await this.aiService.generateText(
      dto.prompt,
      dto.systemPrompt,
    );
    return { text };
  }

  /**
   * POST /api/ai/generate-conversation-audio
   *
   * Mục đích: Sinh audio cho toàn bộ hội thoại với nhiều giọng
   * Body: { conversation, provider?, voice?, emotion?, multiTalker?, ... }
   * Trả về: { audio: base64, timestamps, wordTimestamps?, audioUrl }
   */
  @Post('generate-conversation-audio')
  @HttpCode(HttpStatus.OK)
  async generateConversationAudio(@Body() dto: GenerateConversationAudioDto) {
    const result = await this.ttsProviderService.generateConversationAudio(
      dto.conversation,
      {
        provider: dto.provider,
        voice: dto.voice,
        emotion: dto.emotion,
        randomVoice: dto.randomVoice,
        randomEmotion: dto.randomEmotion,
        multiTalker: dto.multiTalker,
        multiTalkerPairIndex: dto.multiTalkerPairIndex,
        voicePerSpeaker: dto.voicePerSpeaker,
        pitch: dto.pitch,
        rate: dto.rate,
        volume: dto.volume,
      },
    );

    // Trả về base64 audio + timestamps + wordTimestamps + audioUrl
    return {
      audio: result.audioBuffer.toString('base64'),
      contentType: 'audio/mpeg',
      timestamps: result.timestamps,
      wordTimestamps: result.wordTimestamps,
      audioUrl: result.audioUrl,
    };
  }

  /**
   * GET /api/ai/voices
   *
   * Mục đích: Lấy danh sách voices khả dụng theo provider
   * Query: ?provider=azure|openai
   * Trả về: { voices: [...], multiTalker: [...] }
   */
  @Get('voices')
  @HttpCode(HttpStatus.OK)
  getAvailableVoices(@Query('provider') provider?: TtsProvider) {
    return this.ttsProviderService.getAvailableVoices(provider || 'openai');
  }

  /**
   * POST /api/ai/generate-interactive-conversation
   *
   * Mục đích: Sinh hội thoại tương tác với [YOUR TURN] markers
   * Body: { topic, contextDescription? }
   * Trả về: { scenario, script: [{ speaker, text, isUserTurn }] }
   */
  @Post('generate-interactive-conversation')
  @HttpCode(HttpStatus.OK)
  async generateInteractiveConversation(
    @Body() dto: GenerateInteractiveConversationDto,
  ) {
    return this.aiService.generateInteractiveConversation(
      dto.topic,
      dto.contextDescription,
    );
  }

  /**
   * POST /api/ai/continue-conversation
   *
   * Mục đích: AI tiếp tục hội thoại dựa trên user input
   * Body: { conversationHistory, userInput, topic }
   * Trả về: { response, shouldEnd }
   */
  @Post('continue-conversation')
  @HttpCode(HttpStatus.OK)
  async continueConversation(@Body() dto: ContinueConversationDto) {
    return this.aiService.continueConversation(
      dto.conversationHistory,
      dto.userInput,
      dto.topic,
    );
  }

  /**
   * POST /api/ai/generate-conversation-audio-sse
   *
   * Mục đích: Sinh audio với SSE progress updates
   * Body: { conversation: [{ speaker, text }] }
   * Trả về: SSE stream với events: progress, complete, error
   */
  @Post('generate-conversation-audio-sse')
  async generateConversationAudioSSE(
    @Body() dto: GenerateConversationAudioDto,
    @Res() res: import('express').Response,
  ) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Gọi service với progress callback
    await this.aiService.generateConversationAudioWithProgress(
      dto.conversation,
      (event) => {
        // Gửi SSE event
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
    );

    // Kết thúc stream
    res.end();
  }
}

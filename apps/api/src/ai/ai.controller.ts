import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

/**
 * DTO cho request sinh hội thoại
 */
class GenerateConversationDto {
  topic: string;
  durationMinutes: number;
  numSpeakers?: number;
  keywords?: string;
}

/**
 * DTO cho request TTS
 */
class TextToSpeechDto {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

/**
 * DTO cho request đánh giá phát âm
 */
class EvaluatePronunciationDto {
  originalText: string;
  userTranscript: string;
}

/**
 * AI Controller - API endpoints cho AI features
 *
 * Mục đích: Expose các AI services qua REST API
 * Base path: /api/ai
 */
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

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
    const text = await this.aiService.transcribeAudio(file.buffer);
    return { text };
  }

  /**
   * POST /api/ai/text-to-speech
   *
   * Mục đích: Chuyển text thành audio (OpenAI TTS)
   * Body: { text, voice? }
   * Trả về: Audio file (binary)
   */
  @Post('text-to-speech')
  @HttpCode(HttpStatus.OK)
  async textToSpeech(@Body() dto: TextToSpeechDto) {
    const audioBuffer = await this.aiService.textToSpeech(dto.text, dto.voice);
    // Trả về base64 để dễ xử lý ở frontend
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
  async generateText(
    @Body() dto: { prompt: string; systemPrompt?: string },
  ) {
    const text = await this.aiService.generateText(dto.prompt, dto.systemPrompt);
    return { text };
  }
}

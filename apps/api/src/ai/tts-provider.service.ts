import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { AzureTtsService, AzureTtsOptions, WordTimestamp } from '../azure-tts/azure-tts.service';

// ============================================
// TYPES
// ============================================

/**
 * Provider TTS có sẵn trong hệ thống
 */
export type TtsProvider = 'openai' | 'azure';

/**
 * Cấu hình TTS chung cho cả OpenAI và Azure
 *
 * Mục đích: Unified options cho mọi TTS provider
 * Khi nào sử dụng: Controller truyền vào khi gọi TTS
 */
export interface TtsOptions {
  /** Provider TTS (openai hoặc azure) */
  provider?: TtsProvider;
  /** Tên giọng */
  voice?: string;
  /** Cảm xúc (chỉ Azure) */
  emotion?: string;
  /** Mức độ cảm xúc (chỉ Azure) */
  emotionDegree?: number;
  /** Cao độ (chỉ Azure) */
  pitch?: string;
  /** Tốc độ (chỉ Azure) */
  rate?: string;
  /** Âm lượng (chỉ Azure) */
  volume?: string;
  /** Chọn giọng ngẫu nhiên */
  randomVoice?: boolean;
  /** Chọn cảm xúc ngẫu nhiên */
  randomEmotion?: boolean;
  /** Dùng multi-talker DragonHD (chỉ Azure) */
  multiTalker?: boolean;
  /** Index cặp giọng multi-talker (0 hoặc 1) */
  multiTalkerPairIndex?: number;
}

/**
 * Kết quả TTS conversation
 */
export interface ConversationAudioResult {
  /** Audio buffer */
  audioBuffer: Buffer;
  /** Timestamps theo câu */
  timestamps: { startTime: number; endTime: number }[];
  /** Word timestamps theo câu (chỉ Azure) */
  wordTimestamps?: WordTimestamp[][];
  /** URL audio trên storage */
  audioUrl?: string;
}

// ============================================
// SERVICE
// ============================================

/**
 * TtsProviderService - Router giữa OpenAI và Azure TTS
 *
 * Mục đích: Quyết định TTS provider nào xử lý, giữ OpenAI nguyên vẹn để rollback
 * Tham số đầu vào: Text/Conversation + TtsOptions
 * Tham số đầu ra: Audio buffer + metadata
 * Khi nào sử dụng: AiController gọi thay vì gọi AiService trực tiếp
 */
@Injectable()
export class TtsProviderService {
  private readonly logger = new Logger(TtsProviderService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly azureTtsService: AzureTtsService,
  ) {}

  /**
   * Chuyển văn bản thành giọng nói (unified)
   *
   * Mục đích: Route TTS call theo provider setting
   * Tham số đầu vào:
   *   - text: Văn bản cần đọc
   *   - options: TtsOptions
   * Tham số đầu ra: Audio buffer
   * Khi nào sử dụng: Controller gọi cho text-to-speech endpoint
   */
  async textToSpeech(
    text: string,
    options: TtsOptions = {},
  ): Promise<Buffer> {
    const provider = options.provider || 'openai';
    this.logger.log(`TTS Provider: ${provider}`);

    if (provider === 'azure' && this.azureTtsService.isConfigured()) {
      try {
        const azureOptions: AzureTtsOptions = {
          voice: options.voice,
          emotion: options.emotion,
          emotionDegree: options.emotionDegree,
          pitch: options.pitch,
          rate: options.rate,
          volume: options.volume,
          randomVoice: options.randomVoice,
          randomEmotion: options.randomEmotion,
        };
        return await this.azureTtsService.textToSpeech(text, azureOptions);
      } catch (error) {
        this.logger.error('Azure TTS lỗi, fallback về OpenAI:', error);
        // Fallback về OpenAI
      }
    }

    // OpenAI fallback (code gốc, KHÔNG thay đổi!)
    const openaiVoice = this.mapToOpenAIVoice(options.voice);
    return this.aiService.textToSpeech(text, openaiVoice);
  }

  /**
   * Chuyển văn bản thành giọng nói + word timestamps
   *
   * Mục đích: TTS với word-level timing cho highlight
   * Tham số đầu vào:
   *   - text: Văn bản cần đọc
   *   - options: TtsOptions
   * Tham số đầu ra: { audioBuffer, wordTimestamps }
   * Khi nào sử dụng: Khi frontend cần highlight từ
   */
  async textToSpeechWithTimestamps(
    text: string,
    options: TtsOptions = {},
  ): Promise<{ audioBuffer: Buffer; wordTimestamps: WordTimestamp[] }> {
    const provider = options.provider || 'openai';

    if (provider === 'azure' && this.azureTtsService.isConfigured()) {
      const azureOptions: AzureTtsOptions = {
        voice: options.voice,
        emotion: options.emotion,
        emotionDegree: options.emotionDegree,
        pitch: options.pitch,
        rate: options.rate,
        volume: options.volume,
        randomVoice: options.randomVoice,
        randomEmotion: options.randomEmotion,
      };
      return this.azureTtsService.textToSpeechWithTimestamps(text, azureOptions);
    }

    // OpenAI không hỗ trợ word timestamps → trả về mảng rỗng
    const openaiVoice = this.mapToOpenAIVoice(options.voice);
    const audioBuffer = await this.aiService.textToSpeech(text, openaiVoice);
    return { audioBuffer, wordTimestamps: [] };
  }

  /**
   * Sinh audio cho toàn bộ hội thoại
   *
   * Mục đích: Route conversation audio generation theo provider
   * Tham số đầu vào:
   *   - conversation: Array { speaker, text }
   *   - options: TtsOptions
   * Tham số đầu ra: ConversationAudioResult
   * Khi nào sử dụng: Controller gọi cho generate-conversation-audio endpoint
   */
  async generateConversationAudio(
    conversation: { speaker: string; text: string }[],
    options: TtsOptions = {},
  ): Promise<ConversationAudioResult> {
    const provider = options.provider || 'openai';
    this.logger.log(`Conversation Audio Provider: ${provider}, multi-talker: ${options.multiTalker || false}`);

    if (provider === 'azure' && this.azureTtsService.isConfigured()) {
      try {
        // Multi-talker mode (DragonHD)
        if (options.multiTalker) {
          const result = await this.azureTtsService.generateMultiTalkerAudio(
            conversation,
            options.multiTalkerPairIndex,
          );
          return result;
        }

        // Single-voice mode (nhiều giọng, emotions)
        const azureOptions: AzureTtsOptions = {
          voice: options.voice,
          emotion: options.emotion,
          emotionDegree: options.emotionDegree,
          pitch: options.pitch,
          rate: options.rate,
          volume: options.volume,
          randomVoice: options.randomVoice,
          randomEmotion: options.randomEmotion,
        };
        return await this.azureTtsService.generateConversationAudio(
          conversation,
          azureOptions,
        );
      } catch (error) {
        this.logger.error('Azure conversation audio lỗi, fallback về OpenAI:', error);
        // Fallback về OpenAI
      }
    }

    // OpenAI fallback (code gốc, KHÔNG thay đổi!)
    const result = await this.aiService.generateConversationAudio(conversation);
    return {
      audioBuffer: result.audioBuffer,
      timestamps: result.timestamps,
      audioUrl: result.audioUrl,
    };
  }

  /**
   * Lấy danh sách voices theo provider
   *
   * Mục đích: Frontend hiển thị dropdown chọn voice
   * Tham số đầu vào: provider
   * Tham số đầu ra: Array voice info
   * Khi nào sử dụng: GET /ai/voices endpoint
   */
  getAvailableVoices(provider: TtsProvider = 'openai') {
    if (provider === 'azure') {
      return {
        voices: this.azureTtsService.getAvailableVoices(),
        multiTalker: this.azureTtsService.getMultiTalkerVoices(),
      };
    }

    // OpenAI voices
    return {
      voices: [
        { name: 'alloy', displayName: 'Alloy', gender: 'neutral', styles: [] },
        { name: 'echo', displayName: 'Echo', gender: 'male', styles: [] },
        { name: 'fable', displayName: 'Fable', gender: 'male', styles: [] },
        { name: 'onyx', displayName: 'Onyx', gender: 'male', styles: [] },
        { name: 'nova', displayName: 'Nova', gender: 'female', styles: [] },
        { name: 'shimmer', displayName: 'Shimmer', gender: 'female', styles: [] },
      ],
      multiTalker: [],
    };
  }

  // ============================================
  // HELPER
  // ============================================

  /**
   * Map voice name về OpenAI voice format
   *
   * Mục đích: Chuyển tên giọng Azure/chung về định dạng OpenAI
   * Tham số đầu vào: voice name (bất kỳ)
   * Tham số đầu ra: OpenAI voice name
   * Khi nào sử dụng: Khi fallback về OpenAI
   */
  private mapToOpenAIVoice(
    voice?: string,
  ): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    const openaiVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
    if (voice && openaiVoices.includes(voice as any)) {
      return voice as (typeof openaiVoices)[number];
    }
    return 'nova'; // Mặc định
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TtsProviderService } from './tts-provider.service';
import { AzureTtsService } from '../azure-tts/azure-tts.service';
import { StorageService } from '../storage/storage.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ConfigService } from '@nestjs/config';

/**
 * Integration Test cho AiController + TtsProviderService + AzureTtsService
 *
 * Mục đích: Kiểm tra module wiring — các service inject đúng,
 *           data flow từ Controller → TtsProviderService → AzureTtsService/AiService
 * Khi nào sử dụng: CI pipeline, sau khi thay đổi module dependencies
 */

// Mock dependencies bên ngoài (OpenAI, Azure SDK, Storage)
const mockAiService = {
  textToSpeech: jest.fn().mockResolvedValue(Buffer.from('openai-audio')),
  generateConversationAudio: jest.fn().mockResolvedValue({
    audioBuffer: Buffer.from('openai-conv-audio'),
    timestamps: [{ startTime: 0, endTime: 1 }],
    audioUrl: 'https://storage.test/openai.mp3',
  }),
  generateConversation: jest.fn(),
  transcribeAudio: jest.fn(),
  evaluatePronunciation: jest.fn(),
  generateText: jest.fn(),
  generateInteractiveConversation: jest.fn(),
  continueConversation: jest.fn(),
};

const mockStorageService = {
  uploadAudio: jest.fn().mockResolvedValue('https://storage.test/audio.mp3'),
};

// Mock Azure SDK hoàn toàn
jest.mock('microsoft-cognitiveservices-speech-sdk', () => {
  return {
    SpeechConfig: {
      fromSubscription: jest.fn().mockReturnValue({
        speechSynthesisOutputFormat: null,
      }),
    },
    AudioOutputStream: { createPullStream: jest.fn().mockReturnValue({}) },
    AudioConfig: { fromStreamOutput: jest.fn().mockReturnValue({}) },
    SpeechSynthesizer: jest.fn().mockImplementation(() => ({
      speakSsmlAsync: jest.fn((ssml, cbSuccess) => {
        cbSuccess({
          reason: 1, // SynthesizingAudioCompleted
          audioData: new ArrayBuffer(50),
        });
      }),
      wordBoundary: null,
      close: jest.fn(),
    })),
    ResultReason: { SynthesizingAudioCompleted: 1, Canceled: 2 },
    SpeechSynthesisOutputFormat: { Audio16Khz128KBitRateMonoMp3: 4 },
    SpeechSynthesisBoundaryType: { Word: 0 },
  };
});

describe('AiController Integration Test', () => {
  let controller: AiController;
  let ttsProviderService: TtsProviderService;
  let azureTtsService: AzureTtsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.AZURE_SPEECH_KEY = 'test-integration-key';
    process.env.AZURE_SPEECH_REGION = 'eastus';

    /**
     * Tạo module test với wiring thật giữa:
     *   AiController → TtsProviderService → AzureTtsService
     * Chỉ mock AiService (OpenAI) và StorageService (external)
     */
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        TtsProviderService,
        AzureTtsService,
        SupabaseAuthGuard,
        { provide: AiService, useValue: mockAiService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    ttsProviderService = module.get<TtsProviderService>(TtsProviderService);
    azureTtsService = module.get<AzureTtsService>(AzureTtsService);
  });

  afterEach(() => {
    delete process.env.AZURE_SPEECH_KEY;
    delete process.env.AZURE_SPEECH_REGION;
  });

  // ============================================
  // MODULE WIRING
  // ============================================

  describe('Module Wiring', () => {
    it('controller nên inject được TtsProviderService', () => {
      expect(controller).toBeDefined();
      expect((controller as any).ttsProviderService).toBeDefined();
    });

    it('TtsProviderService nên inject được AzureTtsService', () => {
      expect(ttsProviderService).toBeDefined();
      expect((ttsProviderService as any).azureTtsService).toBeDefined();
    });

    it('TtsProviderService nên inject được AiService', () => {
      expect((ttsProviderService as any).aiService).toBeDefined();
    });

    it('AzureTtsService nên khởi tạo với config hợp lệ', () => {
      expect(azureTtsService.isConfigured()).toBe(true);
    });
  });

  // ============================================
  // DATA FLOW: Controller → TtsProviderService → Service
  // ============================================

  describe('Data Flow - TTS OpenAI Path', () => {
    it('TTS với OpenAI nên đi qua AiService', async () => {
      const result = await controller.textToSpeech({
        text: 'Hello world',
        voice: 'nova',
        // không chỉ định provider → mặc định OpenAI
      });

      // Kết quả phải là base64
      expect(result.audio).toBeDefined();
      expect(result.contentType).toBe('audio/mpeg');
      // OpenAI service phải được gọi
      expect(mockAiService.textToSpeech).toHaveBeenCalledWith('Hello world', 'nova');
    });
  });

  describe('Data Flow - TTS Azure Path', () => {
    it('TTS với Azure nên đi qua AzureTtsService + trả về wordTimestamps', async () => {
      const result = await controller.textToSpeech({
        text: 'Hello world',
        voice: 'en-US-AriaNeural',
        provider: 'azure',
        emotion: 'cheerful',
      });

      // Kết quả Azure: có word timestamps
      expect(result.audio).toBeDefined();
      expect(result.contentType).toBe('audio/mpeg');
      expect(result.wordTimestamps).toBeDefined();
      // OpenAI KHÔNG được gọi
      expect(mockAiService.textToSpeech).not.toHaveBeenCalled();
    });
  });

  describe('Data Flow - Conversation Audio', () => {
    const conversation = [
      { speaker: 'A', text: 'Hi there!' },
      { speaker: 'B', text: 'Hello!' },
    ];

    it('conversation audio OpenAI nên đi qua AiService', async () => {
      const result = await controller.generateConversationAudio({
        conversation,
        // không chỉ định provider → OpenAI
      });

      expect(result.audio).toBeDefined();
      expect(result.timestamps).toBeDefined();
      expect(mockAiService.generateConversationAudio).toHaveBeenCalledWith(conversation);
    });

    it('conversation audio Azure nên đi qua AzureTtsService', async () => {
      const result = await controller.generateConversationAudio({
        conversation,
        provider: 'azure',
        emotion: 'cheerful',
      });

      expect(result.audio).toBeDefined();
      expect(result.timestamps).toBeDefined();
      expect(result.wordTimestamps).toBeDefined();
      // OpenAI KHÔNG được gọi
      expect(mockAiService.generateConversationAudio).not.toHaveBeenCalled();
    });
  });

  describe('Data Flow - Get Voices', () => {
    it('GET voices OpenAI nên trả về 6 voices', () => {
      const result = controller.getAvailableVoices('openai');
      expect(result.voices.length).toBe(6);
      expect(result.multiTalker).toEqual([]);
    });

    it('GET voices Azure nên trả về voices thật từ AzureTtsService', () => {
      const result = controller.getAvailableVoices('azure');
      expect(result.voices.length).toBeGreaterThan(0);
      expect(result.multiTalker).toBeDefined();
      // Kiểm tra structure
      expect(result.voices[0]).toHaveProperty('name');
      expect(result.voices[0]).toHaveProperty('displayName');
      expect(result.voices[0]).toHaveProperty('gender');
      expect(result.voices[0]).toHaveProperty('styles');
    });
  });

  // ============================================
  // FALLBACK LOGIC
  // ============================================

  describe('Fallback Logic', () => {
    it('nên fallback về OpenAI khi Azure chưa cấu hình', async () => {
      // Force AzureTtsService thành unconfigured
      (azureTtsService as any).speechConfig = null;

      const result = await controller.textToSpeech({
        text: 'Fallback test',
        provider: 'azure',
      });

      // Phải fallback về OpenAI
      expect(result.audio).toBeDefined();
      expect(mockAiService.textToSpeech).toHaveBeenCalled();
    });
  });
});

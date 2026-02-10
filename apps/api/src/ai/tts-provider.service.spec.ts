import { Test, TestingModule } from '@nestjs/testing';
import { TtsProviderService, TtsOptions } from './tts-provider.service';
import { AiService } from './ai.service';
import { AzureTtsService } from '../azure-tts/azure-tts.service';

// Mock AiService (OpenAI)
const mockAiService = {
  textToSpeech: jest.fn().mockResolvedValue(Buffer.from('openai-audio')),
  generateConversationAudio: jest.fn().mockResolvedValue({
    audioBuffer: Buffer.from('openai-conv-audio'),
    timestamps: [{ startTime: 0, endTime: 1 }],
    audioUrl: 'https://storage.example.com/openai.mp3',
  }),
};

// Mock AzureTtsService
const mockAzureTtsService = {
  isConfigured: jest.fn().mockReturnValue(true),
  textToSpeech: jest.fn().mockResolvedValue(Buffer.from('azure-audio')),
  textToSpeechWithTimestamps: jest.fn().mockResolvedValue({
    audioBuffer: Buffer.from('azure-audio-ts'),
    wordTimestamps: [
      { word: 'Hello', startTime: 0, endTime: 0.3 },
      { word: 'world', startTime: 0.35, endTime: 0.7 },
    ],
  }),
  generateConversationAudio: jest.fn().mockResolvedValue({
    audioBuffer: Buffer.from('azure-conv-audio'),
    timestamps: [{ startTime: 0, endTime: 1 }, { startTime: 1.3, endTime: 2 }],
    wordTimestamps: [
      [{ word: 'Hi', startTime: 0, endTime: 0.2 }],
      [{ word: 'Hello', startTime: 1.3, endTime: 1.6 }],
    ],
    audioUrl: 'https://storage.example.com/azure.mp3',
  }),
  generateMultiTalkerAudio: jest.fn().mockResolvedValue({
    audioBuffer: Buffer.from('azure-multitalker'),
    timestamps: [{ startTime: 0, endTime: 2 }],
    wordTimestamps: [[{ word: 'Hi', startTime: 0, endTime: 0.2 }]],
    audioUrl: 'https://storage.example.com/multitalker.mp3',
  }),
  getAvailableVoices: jest.fn().mockReturnValue([
    { name: 'en-US-AriaNeural', displayName: 'Aria', gender: 'female', styles: ['cheerful'] },
  ]),
  getMultiTalkerVoices: jest.fn().mockReturnValue([
    { name: 'DragonHD', speakers: ['Ava', 'Andrew'] },
  ]),
};

describe('TtsProviderService', () => {
  let service: TtsProviderService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtsProviderService,
        { provide: AiService, useValue: mockAiService },
        { provide: AzureTtsService, useValue: mockAzureTtsService },
      ],
    }).compile();

    service = module.get<TtsProviderService>(TtsProviderService);
  });

  it('nên khởi tạo service thành công', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // textToSpeech
  // ============================================

  describe('textToSpeech', () => {
    it('nên dùng OpenAI mặc định khi không chỉ định provider', async () => {
      const result = await service.textToSpeech('Hello');

      expect(mockAiService.textToSpeech).toHaveBeenCalledWith('Hello', 'nova');
      expect(mockAzureTtsService.textToSpeech).not.toHaveBeenCalled();
      expect(result.toString()).toBe('openai-audio');
    });

    it('nên dùng OpenAI khi provider = openai', async () => {
      const result = await service.textToSpeech('Hello', { provider: 'openai' });

      expect(mockAiService.textToSpeech).toHaveBeenCalled();
      expect(mockAzureTtsService.textToSpeech).not.toHaveBeenCalled();
    });

    it('nên dùng Azure khi provider = azure', async () => {
      const result = await service.textToSpeech('Hello', {
        provider: 'azure',
        voice: 'en-US-AriaNeural',
        emotion: 'cheerful',
      });

      expect(mockAzureTtsService.textToSpeech).toHaveBeenCalledWith('Hello', {
        voice: 'en-US-AriaNeural',
        emotion: 'cheerful',
        emotionDegree: undefined,
        pitch: undefined,
        rate: undefined,
        volume: undefined,
        randomVoice: undefined,
        randomEmotion: undefined,
      });
      expect(mockAiService.textToSpeech).not.toHaveBeenCalled();
      expect(result.toString()).toBe('azure-audio');
    });

    it('nên fallback về OpenAI khi Azure lỗi', async () => {
      mockAzureTtsService.textToSpeech.mockRejectedValueOnce(new Error('Azure lỗi'));

      const result = await service.textToSpeech('Hello', { provider: 'azure' });

      // Đã thử Azure → lỗi → fallback OpenAI
      expect(mockAzureTtsService.textToSpeech).toHaveBeenCalled();
      expect(mockAiService.textToSpeech).toHaveBeenCalled();
      expect(result.toString()).toBe('openai-audio');
    });

    it('nên fallback về OpenAI khi Azure chưa cấu hình', async () => {
      mockAzureTtsService.isConfigured.mockReturnValueOnce(false);

      const result = await service.textToSpeech('Hello', { provider: 'azure' });

      expect(mockAzureTtsService.textToSpeech).not.toHaveBeenCalled();
      expect(mockAiService.textToSpeech).toHaveBeenCalled();
    });

    it('nên map voice sang OpenAI format khi fallback', async () => {
      await service.textToSpeech('Hello', { provider: 'openai', voice: 'nova' });
      expect(mockAiService.textToSpeech).toHaveBeenCalledWith('Hello', 'nova');

      await service.textToSpeech('Hello', { provider: 'openai', voice: 'echo' });
      expect(mockAiService.textToSpeech).toHaveBeenCalledWith('Hello', 'echo');
    });

    it('nên map voice không hợp lệ về nova khi fallback', async () => {
      await service.textToSpeech('Hello', { provider: 'openai', voice: 'en-US-AriaNeural' });
      // AriaNeural không phải OpenAI voice → mặc định nova
      expect(mockAiService.textToSpeech).toHaveBeenCalledWith('Hello', 'nova');
    });
  });

  // ============================================
  // textToSpeechWithTimestamps
  // ============================================

  describe('textToSpeechWithTimestamps', () => {
    it('nên trả về word timestamps khi dùng Azure', async () => {
      const result = await service.textToSpeechWithTimestamps('Hello world', {
        provider: 'azure',
      });

      expect(result.wordTimestamps.length).toBe(2);
      expect(result.wordTimestamps[0].word).toBe('Hello');
      expect(result.audioBuffer).toBeInstanceOf(Buffer);
    });

    it('nên trả về mảng rỗng wordTimestamps khi dùng OpenAI', async () => {
      const result = await service.textToSpeechWithTimestamps('Hello world', {
        provider: 'openai',
      });

      expect(result.wordTimestamps).toEqual([]);
      expect(result.audioBuffer).toBeInstanceOf(Buffer);
    });
  });

  // ============================================
  // generateConversationAudio
  // ============================================

  describe('generateConversationAudio', () => {
    const conversation = [
      { speaker: 'A', text: 'Hi there' },
      { speaker: 'B', text: 'Hello!' },
    ];

    it('nên dùng OpenAI mặc định', async () => {
      const result = await service.generateConversationAudio(conversation);

      expect(mockAiService.generateConversationAudio).toHaveBeenCalledWith(conversation);
      expect(mockAzureTtsService.generateConversationAudio).not.toHaveBeenCalled();
      expect(result.audioUrl).toBe('https://storage.example.com/openai.mp3');
    });

    it('nên dùng Azure khi provider = azure', async () => {
      const result = await service.generateConversationAudio(conversation, {
        provider: 'azure',
        emotion: 'cheerful',
      });

      expect(mockAzureTtsService.generateConversationAudio).toHaveBeenCalled();
      expect(mockAiService.generateConversationAudio).not.toHaveBeenCalled();
      expect(result.wordTimestamps).toBeDefined();
      expect(result.wordTimestamps!.length).toBe(2);
    });

    it('nên dùng multi-talker khi option bật', async () => {
      const result = await service.generateConversationAudio(conversation, {
        provider: 'azure',
        multiTalker: true,
        multiTalkerPairIndex: 0,
      });

      expect(mockAzureTtsService.generateMultiTalkerAudio).toHaveBeenCalledWith(conversation, 0);
      expect(mockAzureTtsService.generateConversationAudio).not.toHaveBeenCalled();
    });

    it('nên fallback về OpenAI khi Azure conversation lỗi', async () => {
      mockAzureTtsService.generateConversationAudio.mockRejectedValueOnce(new Error('Azure lỗi'));

      const result = await service.generateConversationAudio(conversation, {
        provider: 'azure',
      });

      // Fallback → OpenAI
      expect(mockAiService.generateConversationAudio).toHaveBeenCalledWith(conversation);
      expect(result.audioUrl).toBe('https://storage.example.com/openai.mp3');
      // wordTimestamps không có (OpenAI)
      expect(result.wordTimestamps).toBeUndefined();
    });
  });

  // ============================================
  // getAvailableVoices
  // ============================================

  describe('getAvailableVoices', () => {
    it('nên trả về Azure voices khi provider = azure', () => {
      const result = service.getAvailableVoices('azure');
      expect(result.voices.length).toBeGreaterThan(0);
      expect(result.multiTalker.length).toBeGreaterThan(0);
      expect(mockAzureTtsService.getAvailableVoices).toHaveBeenCalled();
    });

    it('nên trả về OpenAI voices mặc định', () => {
      const result = service.getAvailableVoices('openai');
      expect(result.voices.length).toBe(6); // alloy, echo, fable, onyx, nova, shimmer
      expect(result.multiTalker).toEqual([]);
      expect(mockAzureTtsService.getAvailableVoices).not.toHaveBeenCalled();
    });

    it('nên trả về OpenAI khi không chỉ định provider', () => {
      const result = service.getAvailableVoices();
      expect(result.voices.length).toBe(6);
    });
  });
});

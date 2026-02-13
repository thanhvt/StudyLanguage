import { Test, TestingModule } from '@nestjs/testing';
import { AzureTtsService } from './azure-tts.service';
import { StorageService } from '../storage/storage.service';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Mock Azure Speech SDK
jest.mock('microsoft-cognitiveservices-speech-sdk', () => {
  const mockSpeechConfig = {
    speechSynthesisOutputFormat: null,
  };

  return {
    SpeechConfig: {
      fromSubscription: jest.fn().mockReturnValue(mockSpeechConfig),
    },
    AudioOutputStream: {
      createPullStream: jest.fn().mockReturnValue({}),
    },
    AudioConfig: {
      fromStreamOutput: jest.fn().mockReturnValue({}),
    },
    SpeechSynthesizer: jest.fn().mockImplementation(() => ({
      speakSsmlAsync: jest.fn(),
      wordBoundary: null,
      close: jest.fn(),
    })),
    ResultReason: {
      SynthesizingAudioCompleted: 1,
      Canceled: 2,
    },
    SpeechSynthesisOutputFormat: {
      Audio16Khz128KBitRateMonoMp3: 4,
    },
    SpeechSynthesisBoundaryType: {
      Word: 0,
    },
  };
});

// Mock StorageService
const mockStorageService = {
  uploadAudio: jest.fn().mockResolvedValue('https://storage.example.com/audio.mp3'),
};

describe('AzureTtsService', () => {
  let service: AzureTtsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Giả lập env vars
    process.env.AZURE_SPEECH_KEY = 'test-key-123';
    process.env.AZURE_SPEECH_REGION = 'eastus';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureTtsService,
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<AzureTtsService>(AzureTtsService);
  });

  afterEach(() => {
    delete process.env.AZURE_SPEECH_KEY;
    delete process.env.AZURE_SPEECH_REGION;
  });

  it('nên khởi tạo service thành công', () => {
    expect(service).toBeDefined();
  });

  it('nên trả về isConfigured = true khi có env vars', () => {
    expect(service.isConfigured()).toBe(true);
  });

  // ============================================
  // SSML BUILDER
  // ============================================

  describe('buildSSML', () => {
    it('nên tạo SSML cơ bản chỉ với text', () => {
      const ssml = service.buildSSML('Hello world');
      expect(ssml).toContain('Hello world');
      expect(ssml).toContain('<speak');
      expect(ssml).toContain('<voice name="en-US-AriaNeural"');
      expect(ssml).toContain('</speak>');
    });

    it('nên dùng voice được chỉ định', () => {
      const ssml = service.buildSSML('Hello', { voice: 'en-US-GuyNeural' });
      expect(ssml).toContain('voice name="en-US-GuyNeural"');
    });

    it('nên thêm emotion wrap khi có emotion', () => {
      const ssml = service.buildSSML('Hello', {
        voice: 'en-US-AriaNeural',
        emotion: 'cheerful',
      });
      expect(ssml).toContain('mstts:express-as style="cheerful"');
    });

    it('nên thêm emotionDegree khi được cung cấp', () => {
      const ssml = service.buildSSML('Hello', {
        emotion: 'angry',
        emotionDegree: 1.5,
      });
      expect(ssml).toContain('styledegree="1.5"');
    });

    it('nên thêm prosody khi có pitch/rate/volume', () => {
      const ssml = service.buildSSML('Hello', {
        pitch: '+10%',
        rate: '+20%',
        volume: 'loud',
      });
      expect(ssml).toContain('pitch="+10%"');
      expect(ssml).toContain('rate="+20%"');
      expect(ssml).toContain('volume="loud"');
      expect(ssml).toContain('<prosody');
    });

    it('nên escape ký tự XML đặc biệt', () => {
      const ssml = service.buildSSML('Tom & Jerry said "hi" <yes>');
      expect(ssml).toContain('&amp;');
      expect(ssml).toContain('&quot;');
      expect(ssml).toContain('&lt;');
      expect(ssml).toContain('&gt;');
    });

    it('nên dùng random voice khi randomVoice = true', () => {
      const ssml = service.buildSSML('Hello', { randomVoice: true });
      // Kiểm tra vẫn có voice tag hợp lệ
      expect(ssml).toMatch(/voice name="en-US-\w+Neural"/);
    });

    it('nên kết hợp emotion + prosody đúng thứ tự', () => {
      const ssml = service.buildSSML('Hello', {
        voice: 'en-US-AriaNeural',
        emotion: 'cheerful',
        rate: '+20%',
      });
      // emotion nên wrap text, prosody wrap ngoài emotion
      expect(ssml).toContain('<prosody');
      expect(ssml).toContain('mstts:express-as');
      // prosody bên ngoài, emotion bên trong
      const prosodyIdx = ssml.indexOf('<prosody');
      const emotionIdx = ssml.indexOf('mstts:express-as');
      expect(prosodyIdx).toBeLessThan(emotionIdx);
    });
  });

  describe('buildConversationSSML', () => {
    it('nên tạo SSML với nhiều voice tags', () => {
      const conversation = [
        { speaker: 'A', text: 'Hi' },
        { speaker: 'B', text: 'Hello' },
      ];
      const voiceMap = {
        A: 'en-US-AriaNeural',
        B: 'en-US-GuyNeural',
      };

      const ssml = service.buildConversationSSML(conversation, {}, voiceMap);
      expect(ssml).toContain('voice name="en-US-AriaNeural"');
      expect(ssml).toContain('voice name="en-US-GuyNeural"');
      // Phải có break giữa các câu
      expect(ssml).toContain('break time="300ms"');
    });

    it('nên thêm emotions cho từng câu', () => {
      const conversation = [
        { speaker: 'A', text: 'Great!', emotion: 'cheerful' },
        { speaker: 'B', text: 'Bad news', emotion: 'sad' },
      ];
      const voiceMap = {
        A: 'en-US-AriaNeural',
        B: 'en-US-GuyNeural',
      };

      const ssml = service.buildConversationSSML(conversation, {}, voiceMap);
      expect(ssml).toContain('style="cheerful"');
      expect(ssml).toContain('style="sad"');
    });
  });

  describe('buildMultiTalkerSSML', () => {
    it('nên tạo SSML multi-talker với DragonHD', () => {
      const conversation = [
        { speaker: 'Person A', text: 'Hi' },
        { speaker: 'Person B', text: 'Hello' },
      ];

      const ssml = service.buildMultiTalkerSSML(conversation);
      expect(ssml).toContain('DragonHDLatestNeural');
      expect(ssml).toContain('mstts:express-as role=');
    });

    it('nên gán roles đúng cho các speakers', () => {
      const conversation = [
        { speaker: 'Alice', text: 'Hi' },
        { speaker: 'Bob', text: 'Hello' },
        { speaker: 'Alice', text: 'How are you?' },
      ];

      const ssml = service.buildMultiTalkerSSML(conversation);
      // Alice = Ava (role đầu), Bob = Andrew (role sau)
      const roleMatches = ssml.match(/role="(\w+)"/g);
      expect(roleMatches).toBeDefined();
      expect(roleMatches!.length).toBe(3); // 3 câu
      // Alice cùng role ở câu 1 và 3
      expect(roleMatches![0]).toBe(roleMatches![2]);
    });
  });

  // ============================================
  // VOICE & EMOTION HELPERS
  // ============================================

  describe('getRandomVoice', () => {
    it('nên trả về voice name hợp lệ', () => {
      const voice = service.getRandomVoice();
      expect(voice).toMatch(/en-US-\w+Neural/);
    });

    it('nên lọc theo giới tính khi chỉ định', () => {
      const femaleVoice = service.getRandomVoice('female');
      expect(femaleVoice).toMatch(/en-US-(Aria|Jenny|Sara|Jane|Nancy)Neural/);

      const maleVoice = service.getRandomVoice('male');
      expect(maleVoice).toMatch(/en-US-(Guy|Davis|Tony|Jason)Neural/);
    });
  });

  describe('getRandomEmotion', () => {
    it('nên trả về emotion hợp lệ cho Aria', () => {
      const emotion = service.getRandomEmotion('en-US-AriaNeural');
      const validEmotions = [
        'angry', 'chat', 'cheerful', 'customerservice', 'empathetic',
        'excited', 'friendly', 'hopeful', 'narration-professional',
        'newscast-casual', 'newscast-formal', 'sad', 'shouting',
        'terrified', 'unfriendly', 'whispering',
      ];
      expect(validEmotions).toContain(emotion);
    });

    it('nên trả về fallback emotion khi voice không tìm thấy', () => {
      const emotion = service.getRandomEmotion('unknown-voice');
      const conversationEmotions = ['chat', 'cheerful', 'excited', 'friendly', 'hopeful'];
      expect(conversationEmotions).toContain(emotion);
    });
  });

  describe('getAvailableVoices', () => {
    it('nên trả về danh sách voices đầy đủ', () => {
      const voices = service.getAvailableVoices();
      expect(voices.length).toBeGreaterThan(0);

      // Mỗi voice phải có đủ fields
      for (const voice of voices) {
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('displayName');
        expect(voice).toHaveProperty('gender');
        expect(voice).toHaveProperty('styles');
        expect(Array.isArray(voice.styles)).toBe(true);
      }
    });

    it('nên có cả female và male voices', () => {
      const voices = service.getAvailableVoices();
      const females = voices.filter(v => v.gender === 'female');
      const males = voices.filter(v => v.gender === 'male');
      expect(females.length).toBeGreaterThan(0);
      expect(males.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // ASSIGN VOICES TO SPEAKERS (voicePerSpeaker)
  // ============================================

  describe('assignVoicesToSpeakers — voicePerSpeaker', () => {
    const conversation = [
      { speaker: 'Alice', text: 'Hi' },
      { speaker: 'Bob', text: 'Hello' },
      { speaker: 'Alice', text: 'How are you?' },
    ];

    it('nên ưu tiên dùng voicePerSpeaker map khi có', () => {
      const result = (service as any).assignVoicesToSpeakers(conversation, {
        voicePerSpeaker: {
          Alice: 'en-US-JennyNeural',
          Bob: 'en-US-GuyNeural',
        },
      });

      expect(result.Alice).toBe('en-US-JennyNeural');
      expect(result.Bob).toBe('en-US-GuyNeural');
    });

    it('nên fallback random khi speaker thiếu trong voicePerSpeaker', () => {
      const result = (service as any).assignVoicesToSpeakers(conversation, {
        voicePerSpeaker: {
          Alice: 'en-US-JennyNeural',
          // Bob không có → fallback random
        },
      });

      expect(result.Alice).toBe('en-US-JennyNeural');
      // Bob nên có giọng bất kỳ hợp lệ
      expect(result.Bob).toMatch(/en-US-\w+Neural/);
    });

    it('nên dùng auto-assign khi voicePerSpeaker rỗng', () => {
      const result = (service as any).assignVoicesToSpeakers(conversation, {
        voicePerSpeaker: {},
      });

      // Vẫn gán được voice (auto xen kẽ nam-nữ)
      expect(result.Alice).toMatch(/en-US-\w+Neural/);
      expect(result.Bob).toMatch(/en-US-\w+Neural/);
      // Alice và Bob nên có giọng khác nhau
      expect(result.Alice).not.toBe(result.Bob);
    });
  });

  // ============================================
  // TTS METHODS (mock SDK)
  // ============================================

  describe('textToSpeech', () => {
    it('nên throw error khi chưa cấu hình', async () => {
      // Tạo service thiếu config
      const unconfiguredService = new AzureTtsService(mockStorageService as any);
      // Ghi đè speechConfig = null
      (unconfiguredService as any).speechConfig = null;

      await expect(unconfiguredService.textToSpeech('Hello'))
        .rejects.toThrow('Azure Speech chưa được cấu hình');
    });

    it('nên gọi synthesizeFromSSML với SSML đúng', async () => {
      const mockAudioData = new ArrayBuffer(100);
      // Mock synthesizer
      const mockSynthesizer = {
        speakSsmlAsync: jest.fn((ssml, cbSuccess) => {
          cbSuccess({
            reason: sdk.ResultReason.SynthesizingAudioCompleted,
            audioData: mockAudioData,
          });
        }),
        wordBoundary: null,
        close: jest.fn(),
      };
      (sdk.SpeechSynthesizer as unknown as jest.Mock).mockImplementation(() => mockSynthesizer);

      const result = await service.textToSpeech('Hello', {
        voice: 'en-US-AriaNeural',
        emotion: 'cheerful',
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(100);
      expect(mockSynthesizer.speakSsmlAsync).toHaveBeenCalled();
      // Kiểm tra SSML content
      const ssmlArg = mockSynthesizer.speakSsmlAsync.mock.calls[0][0];
      expect(ssmlArg).toContain('AriaNeural');
      expect(ssmlArg).toContain('cheerful');
    });
  });

  describe('textToSpeechWithTimestamps', () => {
    it('nên trả về audio + word timestamps', async () => {
      const mockAudioData = new ArrayBuffer(50);
      const mockSynthesizer = {
        speakSsmlAsync: jest.fn((ssml, cbSuccess) => {
          cbSuccess({
            reason: sdk.ResultReason.SynthesizingAudioCompleted,
            audioData: mockAudioData,
          });
        }),
        wordBoundary: null,
        close: jest.fn(),
      };
      (sdk.SpeechSynthesizer as unknown as jest.Mock).mockImplementation(() => mockSynthesizer);

      const result = await service.textToSpeechWithTimestamps('Hello world');

      expect(result).toHaveProperty('audioBuffer');
      expect(result).toHaveProperty('wordTimestamps');
      expect(result.audioBuffer).toBeInstanceOf(Buffer);
      expect(Array.isArray(result.wordTimestamps)).toBe(true);
    });
  });
});

// ============================================
// TEST SERVICE KHI THIẾU CẤU HÌNH
// ============================================

describe('AzureTtsService (thiếu cấu hình)', () => {
  let service: AzureTtsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Không set env vars → service chưa cấu hình
    delete process.env.AZURE_SPEECH_KEY;
    delete process.env.AZURE_SPEECH_REGION;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureTtsService,
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<AzureTtsService>(AzureTtsService);
  });

  it('isConfigured nên trả về false', () => {
    expect(service.isConfigured()).toBe(false);
  });

  it('textToSpeech nên throw error', async () => {
    await expect(service.textToSpeech('Hello'))
      .rejects.toThrow('Azure Speech chưa được cấu hình');
  });

  it('buildSSML vẫn hoạt động bình thường (không cần config)', () => {
    const ssml = service.buildSSML('Test');
    expect(ssml).toContain('Test');
  });
});

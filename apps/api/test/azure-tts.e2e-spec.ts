/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AiService } from './../src/ai/ai.service';
import { TtsProviderService } from './../src/ai/tts-provider.service';
import { SupabaseAuthGuard } from './../src/auth/supabase-auth.guard';

/**
 * E2E Test cho Azure TTS endpoints
 *
 * Mục đích: Kiểm tra HTTP endpoints mới cho Azure TTS qua full NestJS app
 * Tham số: Dùng supertest gọi REST API thật
 * Khi nào sử dụng: CI pipeline, trước khi deploy
 */

describe('Azure TTS Endpoints (e2e)', () => {
  let app: INestApplication;

  // Mock cả AiService và TtsProviderService — tránh gọi API thật
  const mockAiService = {
    generateConversation: jest.fn().mockResolvedValue({
      topic: 'Test',
      script: [{ speaker: 'A', text: 'Hello' }],
    }),
    transcribeAudio: jest.fn().mockResolvedValue('Transcribed'),
    textToSpeech: jest.fn().mockResolvedValue(Buffer.from('openai-audio')),
    evaluatePronunciation: jest.fn().mockResolvedValue({
      overallScore: 90,
      feedback: [],
    }),
    generateText: jest.fn().mockResolvedValue('Generated'),
    generateConversationAudio: jest.fn().mockResolvedValue({
      audioBuffer: Buffer.from('openai-conv'),
      timestamps: [{ startTime: 0, endTime: 1 }],
      audioUrl: 'https://storage.test/openai.mp3',
    }),
    generateInteractiveConversation: jest.fn().mockResolvedValue({
      scenario: 'Test',
      script: [{ speaker: 'AI', text: 'Hello' }],
    }),
    continueConversation: jest.fn().mockResolvedValue({
      response: 'OK',
      shouldEnd: false,
    }),
  };

  const mockTtsProviderService = {
    textToSpeech: jest.fn().mockResolvedValue(Buffer.from('tts-audio')),
    textToSpeechWithTimestamps: jest.fn().mockResolvedValue({
      audioBuffer: Buffer.from('azure-audio-with-ts'),
      wordTimestamps: [
        { word: 'Hello', startTime: 0, endTime: 0.3 },
        { word: 'world', startTime: 0.35, endTime: 0.7 },
      ],
    }),
    generateConversationAudio: jest.fn().mockResolvedValue({
      audioBuffer: Buffer.from('azure-conv-audio'),
      timestamps: [
        { startTime: 0, endTime: 1 },
        { startTime: 1.3, endTime: 2 },
      ],
      wordTimestamps: [
        [{ word: 'Hi', startTime: 0, endTime: 0.2 }],
        [{ word: 'Hello', startTime: 1.3, endTime: 1.6 }],
      ],
      audioUrl: 'https://storage.test/azure.mp3',
    }),
    getAvailableVoices: jest.fn().mockImplementation((provider: string) => {
      if (provider === 'azure') {
        return {
          voices: [
            { name: 'en-US-AriaNeural', displayName: 'Aria', gender: 'female', styles: ['cheerful', 'sad'] },
            { name: 'en-US-GuyNeural', displayName: 'Guy', gender: 'male', styles: ['cheerful'] },
          ],
          multiTalker: [
            { name: 'DragonHD-Ava-Andrew', speakers: ['Ava', 'Andrew'] },
          ],
        };
      }
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
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue(mockAiService)
      .overrideProvider(TtsProviderService)
      .useValue(mockTtsProviderService)
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();

    // Phải bật ValidationPipe giống app thật
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================
  // POST /ai/text-to-speech — Azure Provider
  // ============================================

  describe('POST /ai/text-to-speech', () => {
    it('nên trả về audio + wordTimestamps khi provider = azure', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({
          text: 'Hello world',
          voice: 'en-US-AriaNeural',
          provider: 'azure',
          emotion: 'cheerful',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('audio');
          expect(res.body).toHaveProperty('contentType', 'audio/mpeg');
          expect(res.body).toHaveProperty('wordTimestamps');
          expect(res.body.wordTimestamps).toHaveLength(2);
          expect(res.body.wordTimestamps[0].word).toBe('Hello');
          expect(res.body.wordTimestamps[1].word).toBe('world');
        });
    });

    it('nên trả về audio không có wordTimestamps khi provider = openai', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({
          text: 'Hello',
          voice: 'nova',
          // Không chỉ định provider → OpenAI mặc định
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('audio');
          expect(res.body).toHaveProperty('contentType', 'audio/mpeg');
          // OpenAI không có word timestamps
          expect(res.body.wordTimestamps).toBeUndefined();
        });
    });

    it('nên trả về audio khi có SSML options', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({
          text: 'Hello',
          voice: 'en-US-AriaNeural',
          provider: 'azure',
          emotion: 'sad',
          pitch: '+10%',
          rate: '-5%',
          volume: 'loud',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.audio).toBeDefined();
          // TtsProviderService phải nhận đúng options
          expect(mockTtsProviderService.textToSpeechWithTimestamps).toHaveBeenCalledWith(
            'Hello',
            expect.objectContaining({
              provider: 'azure',
              emotion: 'sad',
              pitch: '+10%',
              rate: '-5%',
              volume: 'loud',
            }),
          );
        });
    });

    it('nên trả về audio với randomVoice option', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({
          text: 'Hello',
          provider: 'azure',
          randomVoice: true,
          randomEmotion: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.audio).toBeDefined();
        });
    });

    it('nên validate text là bắt buộc', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({
          voice: 'nova',
          // Thiếu text → validation fail
        })
        .expect(400);
    });

    it('nên reject provider không hợp lệ', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({
          text: 'Hello',
          provider: 'google', // Không hợp lệ
        })
        .expect(400);
    });
  });

  // ============================================
  // POST /ai/generate-conversation-audio — Azure Provider
  // ============================================

  describe('POST /ai/generate-conversation-audio', () => {
    it('nên sinh conversation audio với Azure options', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-conversation-audio')
        .send({
          conversation: [
            { speaker: 'A', text: 'Hi there!' },
            { speaker: 'B', text: 'Hello!' },
          ],
          provider: 'azure',
          emotion: 'cheerful',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('audio');
          expect(res.body).toHaveProperty('contentType', 'audio/mpeg');
          expect(res.body).toHaveProperty('timestamps');
          expect(res.body.timestamps).toHaveLength(2);
          expect(res.body).toHaveProperty('wordTimestamps');
          expect(res.body).toHaveProperty('audioUrl');
        });
    });

    it('nên sinh conversation audio với multi-talker option', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-conversation-audio')
        .send({
          conversation: [
            { speaker: 'A', text: 'Hi!' },
            { speaker: 'B', text: 'Hello!' },
          ],
          provider: 'azure',
          multiTalker: true,
          multiTalkerPairIndex: 0,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.audio).toBeDefined();
          expect(mockTtsProviderService.generateConversationAudio).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({
              multiTalker: true,
              multiTalkerPairIndex: 0,
            }),
          );
        });
    });

    it('nên sinh audio OpenAI khi không có provider', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-conversation-audio')
        .send({
          conversation: [
            { speaker: 'A', text: 'Hi' },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.audio).toBeDefined();
          expect(mockTtsProviderService.generateConversationAudio).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({
              provider: undefined,
            }),
          );
        });
    });

    it('nên validate conversation là bắt buộc', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-conversation-audio')
        .send({
          provider: 'azure',
          // Thiếu conversation → validation fail
        })
        .expect(400);
    });

    it('nên validate conversation items có speaker và text', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-conversation-audio')
        .send({
          conversation: [
            { text: 'No speaker!' }, // Thiếu speaker
          ],
        })
        .expect(400);
    });
  });

  // ============================================
  // GET /ai/voices — Danh sách voices
  // ============================================

  describe('GET /ai/voices', () => {
    it('nên trả về OpenAI voices mặc định', () => {
      return request(app.getHttpServer())
        .get('/ai/voices')
        .expect(200)
        .expect((res) => {
          expect(res.body.voices).toHaveLength(6);
          expect(res.body.multiTalker).toEqual([]);
          const voiceNames = res.body.voices.map((v: any) => v.name);
          expect(voiceNames).toContain('alloy');
          expect(voiceNames).toContain('nova');
        });
    });

    it('nên trả về Azure voices với query param', () => {
      return request(app.getHttpServer())
        .get('/ai/voices?provider=azure')
        .expect(200)
        .expect((res) => {
          expect(res.body.voices).toHaveLength(2);
          expect(res.body.voices[0].name).toBe('en-US-AriaNeural');
          expect(res.body.voices[0]).toHaveProperty('styles');
          expect(res.body.multiTalker).toHaveLength(1);
        });
    });

    it('nên trả về OpenAI khi provider=openai', () => {
      return request(app.getHttpServer())
        .get('/ai/voices?provider=openai')
        .expect(200)
        .expect((res) => {
          expect(res.body.voices).toHaveLength(6);
        });
    });
  });
});

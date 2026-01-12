/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AiService } from './../src/ai/ai.service';

describe('AiController (e2e)', () => {
  let app: INestApplication;

  // Mock AI Service to avoid calling OpenAI API
  const mockAiService = {
    generateConversation: jest.fn().mockImplementation((topic, duration) => {
      return {
        topic,
        duration,
        script: [
          { speaker: 'A', text: 'Hello' },
          { speaker: 'B', text: 'Hi there' },
        ],
      };
    }),
    transcribeAudio: jest
      .fn()
      .mockResolvedValue('Hello world, this is a test transcription.'),
    textToSpeech: jest
      .fn()
      .mockResolvedValue(Buffer.from('mock-audio-content')),
    evaluatePronunciation: jest.fn().mockImplementation((original, user) => {
      return {
        overallScore: 85,
        feedback: [{ word: 'world', error: 'mispronounced' }],
      };
    }),
    generateText: jest.fn().mockResolvedValue('This is generated text'),
    generateConversationAudio: jest.fn().mockResolvedValue({
      audioBuffer: Buffer.from('mock-conversation-audio'),
      timestamps: [{ startTime: 0, endTime: 1000 }],
    }),
    generateInteractiveConversation: jest.fn().mockImplementation((topic) => {
      return {
        scenario: `Scenario for ${topic}`,
        script: [
          { speaker: 'AI', text: 'Hello' },
          { speaker: 'User', text: '[YOUR TURN]', isUserTurn: true },
        ],
      };
    }),
    continueConversation: jest.fn().mockResolvedValue({
      response: 'AI response to user',
      shouldEnd: false,
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue(mockAiService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Validate Pipes must be enabled if they represent the actual app
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

  // --- 1. GENERATE CONVERSATION ---
  describe('POST /ai/generate-conversation', () => {
    it('should generate conversation successfully', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-conversation')
        .send({ topic: 'Travel', durationMinutes: 2 })
        .expect(200)
        .expect((res) => {
          expect(res.body.script).toHaveLength(2);
          expect(res.body.topic).toBe('Travel');
        });
    });

    // Note: Since we are mocking the service directly, ValidationPipe handles the DTO validation before service is called.
    // If validation fails, it returns 400.
    // Ensure 'durationMinutes' is required or checked in DTO (if DTO validation is set up).
    // Assuming GenerateConversationDto has class-validator decorators.
  });

  // --- 2. TRANSCRIBE (STT) ---
  describe('POST /ai/transcribe', () => {
    it('should transcribe uploaded audio file', () => {
      return request(app.getHttpServer())
        .post('/ai/transcribe')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(200)
        .expect({
          text: 'Hello world, this is a test transcription.',
        });
    });

    it('should fail if no file is provided', () => {
      // NestJS FileInterceptor throws 400 if validation fails, or 500 if unhandled
      // Here we just check it doesn't return 200
      return request(app.getHttpServer())
        .post('/ai/transcribe')
        .expect((res) => {
          expect(res.status).not.toBe(200);
        });
    });
  });

  // --- 3. TEXT TO SPEECH (TTS) ---
  describe('POST /ai/text-to-speech', () => {
    it('should return base64 audio', () => {
      return request(app.getHttpServer())
        .post('/ai/text-to-speech')
        .send({ text: 'Hello', voice: 'alloy' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('audio');
          expect(res.body.contentType).toBe('audio/mpeg');
          // Base64 of 'mock-audio-content' is 'bW9jay1hdWRpby1jb250ZW50'
          expect(res.body.audio).toBeDefined();
        });
    });
  });

  // --- 4. EVALUATE PRONUNCIATION ---
  describe('POST /ai/evaluate-pronunciation', () => {
    it('should return score and feedback', () => {
      return request(app.getHttpServer())
        .post('/ai/evaluate-pronunciation')
        .send({ originalText: 'Hello world', userTranscript: 'Hello word' })
        .expect(200)
        .expect((res) => {
          expect(res.body.overallScore).toBe(85);
          expect(res.body.feedback).toHaveLength(1);
        });
    });
  });

  // --- 5. INTERACTIVE CONVERSATION ---
  describe('POST /ai/generate-interactive-conversation', () => {
    it('should generate interactive scenario', () => {
      return request(app.getHttpServer())
        .post('/ai/generate-interactive-conversation')
        .send({ topic: 'Shopping' })
        .expect(200)
        .expect((res) => {
          expect(res.body.scenario).toContain('Shopping');
          expect(res.body.script).toBeDefined();
        });
    });
  });

  // --- 6. CONTINUE CONVERSATION ---
  describe('POST /ai/continue-conversation', () => {
    it('should return AI response', () => {
      return request(app.getHttpServer())
        .post('/ai/continue-conversation')
        .send({
          conversationHistory: [],
          userInput: 'How much is this?',
          topic: 'Shopping',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.response).toBeDefined();
          expect(res.body.shouldEnd).toBe(false);
        });
    });
  });
});

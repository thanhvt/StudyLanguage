import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    audio: {
      transcriptions: {
        create: jest.fn(),
      },
      speech: {
        create: jest.fn(),
      },
    },
  }));
});

describe('AiService', () => {
  let service: AiService;
  let openai: OpenAI;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
    // Access the private openai instance using 'any' casting for testing
    openai = (service as any).openai;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello world',
            },
          },
        ],
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateText('hello');
      expect(result).toBe('Hello world');
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([{ role: 'user', content: 'hello' }]),
        })
      );
    });

    it('should handle errors', async () => {
      (openai.chat.completions.create as jest.Mock).mockRejectedValue(new Error('API Error'));
      await expect(service.generateText('hello')).rejects.toThrow('API Error');
    });
  });

  describe('generateConversation', () => {
    it('should generate and parse conversation JSON', async () => {
      const mockScript = {
        script: [
          { speaker: 'Person A', text: 'Hi' },
          { speaker: 'Person B', text: 'Hello' },
        ],
      };
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockScript),
            },
          },
        ],
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateConversation('Greeting', 1);
      expect(result).toEqual(mockScript);
    });

    it('should throw error if JSON not found', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Not JSON' } }],
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.generateConversation('Greeting', 1)).rejects.toThrow('Không thể parse kết quả hội thoại');
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      const mockBuffer = Buffer.from('audio data');
      const mockResponse = { text: 'Transcribed text' };

      (openai.audio.transcriptions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.transcribeAudio(mockBuffer);
      expect(result).toBe('Transcribed text');
    });
  });

  describe('textToSpeech', () => {
    it('should convert text to speech audio buffer', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };

      (openai.audio.speech.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.textToSpeech('Hello');
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(8);
    });
  });

  describe('generateInteractiveConversation', () => {
    it('should generate interactive conversation JSON', async () => {
      const mockResponseData = {
        scenario: 'Testing',
        script: [
          { speaker: 'AI', text: 'Hi', isUserTurn: false },
          { speaker: 'YOU', text: '[Say hello]', isUserTurn: true },
        ],
      };

      const mockResponse = {
        choices: [{ message: { content: JSON.stringify(mockResponseData) } }],
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateInteractiveConversation('Test');
      expect(result).toEqual(mockResponseData);
    });
  });
});

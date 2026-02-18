/**
 * Unit test cho speakingApi service
 *
 * Mục đích: Test Speaking API calls và response mapping
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 */
import {speakingApi} from '@/services/api/speaking';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('speakingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSentences', () => {
    it('gửi prompt đúng cho backend', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          text: '[{"text": "Hello, how are you?", "difficulty": "easy"}]',
        },
      });

      await speakingApi.generateSentences({
        topic: 'Travel',
        level: 'beginner',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-text',
        expect.objectContaining({
          prompt: expect.stringContaining('Travel'),
          systemPrompt: expect.any(String),
        }),
      );
    });

    it('parse JSON response đúng', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          text: JSON.stringify([
            {text: 'Hello world', difficulty: 'easy'},
            {text: 'Nice to meet you', difficulty: 'easy'},
          ]),
        },
      });

      const result = await speakingApi.generateSentences({
        topic: 'Greeting',
        level: 'beginner',
      });

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Hello world');
      expect(result[0].difficulty).toBe('easy');
    });

    it('parse response với markdown fence', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          text: '```json\n[{"text": "Test sentence"}]\n```',
        },
      });

      const result = await speakingApi.generateSentences({
        topic: 'Test',
        level: 'intermediate',
      });

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Test sentence');
    });

    it('fallback khi response không parse được', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {text: 'Invalid response without JSON'},
      });

      const result = await speakingApi.generateSentences({
        topic: 'Test',
        level: 'beginner',
      });

      // Fallback: split theo dòng hoặc trả default
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('transcribeAudio', () => {
    it('gửi FormData với audio file', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {text: 'Hello world'},
      });

      const result = await speakingApi.transcribeAudio('/path/to/audio.m4a');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/transcribe',
        expect.any(FormData),
        expect.objectContaining({
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 30000,
        }),
      );
      expect(result).toBe('Hello world');
    });

    it('trả empty string khi API không có text', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {},
      });

      const result = await speakingApi.transcribeAudio('/path/to/audio.m4a');

      expect(result).toBe('');
    });
  });

  describe('evaluatePronunciation', () => {
    it('gửi đúng payload', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          overallScore: 85,
          fluency: 80,
          pronunciation: 88,
          pace: 90,
          wordByWord: [{word: 'hello', score: 95, correct: true}],
          patterns: [],
          feedback: {
            wrongWords: [],
            tips: [],
            encouragement: 'Tốt lắm!',
          },
        },
      });

      await speakingApi.evaluatePronunciation(
        'Hello world',
        'Hello world',
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/evaluate-pronunciation',
        {originalText: 'Hello world', userTranscript: 'Hello world'},
      );
    });

    it('map response đúng format', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          overallScore: 75,
          fluency: 70,
          pronunciation: 80,
          pace: 72,
          wordByWord: [
            {word: 'hello', score: 90, correct: true},
            {word: 'world', score: 60, correct: false, issue: 'Thiếu /d/'},
          ],
          patterns: ['Luyện âm /θ/'],
          feedback: {
            wrongWords: [{word: 'world', userSaid: 'wor', suggestion: 'Đọc /d/'}],
            tips: ['Đọc chậm hơn'],
            encouragement: 'Tiếp tục!',
          },
        },
      });

      const result = await speakingApi.evaluatePronunciation('hello world', 'hello wor');

      expect(result.overallScore).toBe(75);
      expect(result.wordByWord).toHaveLength(2);
      expect(result.wordByWord[1].issue).toBe('Thiếu /d/');
      expect(result.feedback.tips).toContain('Đọc chậm hơn');
    });

    it('dùng fallback khi thiếu fields', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {overallScore: 60},
      });

      const result = await speakingApi.evaluatePronunciation('test', 'test');

      expect(result.fluency).toBe(60); // fallback từ overallScore
      expect(result.wordByWord).toEqual([]);
      expect(result.feedback.encouragement).toBe('Tiếp tục luyện tập nhé!');
    });
  });

  describe('playAISample', () => {
    it('gửi đúng payload', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audio: 'base64audiodata'},
      });

      const result = await speakingApi.playAISample('Hello world');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/text-to-speech',
        {text: 'Hello world', provider: 'openai'},
      );
      expect(result).toBe('base64audiodata');
    });
  });

  describe('getStats', () => {
    it('trả stats đúng', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          stats: {
            totalSessions: 10,
            totalMinutes: 120,
            thisWeekSessions: 3,
            recentTopics: ['Travel', 'Tech'],
          },
        },
      });

      const result = await speakingApi.getStats();

      expect(result.totalSessions).toBe(10);
      expect(result.totalMinutes).toBe(120);
    });

    it('dùng fallback khi không có data', async () => {
      mockApiClient.get.mockResolvedValue({data: {}});

      const result = await speakingApi.getStats();

      expect(result.totalSessions).toBe(0);
      expect(result.totalMinutes).toBe(0);
    });
  });

  // ============================================
  // Sprint 7A: playAISample với TTS params
  // ============================================

  describe('playAISample — TTS params (Sprint 7A)', () => {
    it('gửi đúng provider và voice khi truyền params', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audio: 'base64data'},
      });

      await speakingApi.playAISample('Hello', 'azure', 'en-US-AriaNeural', 1.5);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/text-to-speech',
        expect.objectContaining({
          text: 'Hello',
          provider: 'azure',
          voice: 'en-US-AriaNeural',
          speed: 1.5,
        }),
      );
    });

    it('mặc định provider là openai khi không truyền', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audio: 'base64data'},
      });

      await speakingApi.playAISample('Test');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/text-to-speech',
        expect.objectContaining({
          text: 'Test',
          provider: 'openai',
        }),
      );
    });

    it('không gửi speed khi speed === 1.0', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audio: 'data'},
      });

      await speakingApi.playAISample('Test', 'openai', 'alloy', 1.0);

      const payload = mockApiClient.post.mock.calls[0][1];
      expect(payload.speed).toBeUndefined();
    });
  });

  // ============================================
  // Sprint 7A: generateCoachAudio với TTS params
  // ============================================

  describe('generateCoachAudio — TTS params (Sprint 7A)', () => {
    it('gửi đúng voice và provider', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audio: 'coachAudioBase64'},
      });

      const result = await speakingApi.generateCoachAudio(
        'How are you?',
        'azure',
        'en-US-DavisNeural',
        0.8,
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          text: 'How are you?',
          voice: 'en-US-DavisNeural',
          provider: 'azure',
          speed: 0.8,
        }),
      );
      expect(result).toBe('coachAudioBase64');
    });

    it('fallback voice khi không truyền voiceId', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audioUrl: 'https://audio.url'},
      });

      const result = await speakingApi.generateCoachAudio('Hello');

      const payload = mockApiClient.post.mock.calls[0][1];
      expect(payload.voice).toBe('en-US-JennyNeural'); // Default
      expect(result).toBe('https://audio.url');
    });
  });

  // ============================================
  // Sprint 7C: cloneAndCorrectVoice
  // ============================================

  describe('cloneAndCorrectVoice (Sprint 7C)', () => {
    it('gửi FormData đúng format', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          correctedAudioUrl: 'https://ai.audio/corrected.mp3',
          improvements: [
            {phoneme: '/θ/', before: '/t/', after: '/θ/'},
            {phoneme: '/ɪ/', before: '/i:/', after: '/ɪ/'},
          ],
        },
      });

      const result = await speakingApi.cloneAndCorrectVoice(
        '/path/to/recording.m4a',
        'The weather is nice',
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/clone-and-correct',
        expect.any(FormData),
        expect.objectContaining({
          headers: {'Content-Type': 'multipart/form-data'},
        }),
      );
      expect(result.correctedAudioUrl).toBe('https://ai.audio/corrected.mp3');
      expect(result.improvements).toHaveLength(2);
      expect(result.improvements[0].phoneme).toBe('/θ/');
    });

    it('fallback TTS khi clone API lỗi', async () => {
      // Lần 1: clone API fail
      // Lần 2: fallback TTS thành công
      mockApiClient.post
        .mockRejectedValueOnce(new Error('Clone API unavailable'))
        .mockResolvedValueOnce({
          data: {audio: 'fallback-tts-audio'},
        });

      const result = await speakingApi.cloneAndCorrectVoice(
        '/path/audio.m4a',
        'Hello world',
      );

      // Phải gọi 2 lần: clone rồi fallback TTS
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
      expect(result.correctedAudioUrl).toBe('fallback-tts-audio');
      expect(result.improvements).toEqual([]);
    });

    it('trả empty improvements khi API không có field', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {audio: 'audio-only'},
      });

      const result = await speakingApi.cloneAndCorrectVoice(
        '/path/audio.m4a',
        'Test',
      );

      expect(result.correctedAudioUrl).toBe('audio-only');
      expect(result.improvements).toEqual([]);
    });
  });
});

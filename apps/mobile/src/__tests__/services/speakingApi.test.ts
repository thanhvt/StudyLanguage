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
});

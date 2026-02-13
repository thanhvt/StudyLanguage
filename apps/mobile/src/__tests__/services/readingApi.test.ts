/**
 * Unit test cho readingApi service
 *
 * Mục đích: Test Reading API calls và response mapping
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 */
import {readingApi} from '@/services/api/reading';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('readingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateArticle', () => {
    it('gửi đúng payload cho backend', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          title: 'Test Article',
          content: 'This is a test article content.',
          wordCount: 200,
          readingTime: 2,
          level: 'intermediate',
        },
      });

      await readingApi.generateArticle({
        topic: 'Technology',
        level: 'intermediate',
        length: 'medium',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/reading/generate-article',
        {
          topic: 'Technology',
          level: 'intermediate',
          wordCount: 400, // 'medium' → 400
        },
      );
    });

    it('map wordCount đúng theo length', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {title: 'T', content: 'C', wordCount: 200},
      });

      // short → 200
      await readingApi.generateArticle({
        topic: 'Test',
        level: 'beginner',
        length: 'short',
      });
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/reading/generate-article',
        expect.objectContaining({wordCount: 200}),
      );

      // long → 600
      await readingApi.generateArticle({
        topic: 'Test',
        level: 'advanced',
        length: 'long',
      });
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/reading/generate-article',
        expect.objectContaining({wordCount: 600}),
      );
    });

    it('map response backend đúng format mobile', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          title: 'AI Future',
          content: 'AI content here',
          wordCount: 150,
          readingTime: 1,
          level: 'beginner',
        },
      });

      const result = await readingApi.generateArticle({
        topic: 'AI',
        level: 'beginner',
        length: 'short',
      });

      expect(result.title).toBe('AI Future');
      expect(result.content).toBe('AI content here');
      expect(result.wordCount).toBe(150);
      expect(result.readingTime).toBe(1);
      expect(result.level).toBe('beginner');
    });

    it('map fallback fields từ backend (article → content, word_count → wordCount)', async () => {
      // Backend dùng tên field khác
      mockApiClient.post.mockResolvedValue({
        data: {
          title: 'Test',
          article: 'Fallback content here',
          word_count: 300,
          reading_time: 3,
          difficulty: 'advanced',
        },
      });

      const result = await readingApi.generateArticle({
        topic: 'Test',
        level: 'advanced',
        length: 'medium',
      });

      expect(result.content).toBe('Fallback content here');
      expect(result.wordCount).toBe(300);
      expect(result.readingTime).toBe(3);
      expect(result.level).toBe('advanced');
    });

    it('tính readingTime tự động nếu backend không trả', async () => {
      // 600 từ / 200 wpm = 3 phút
      const content = Array(600).fill('word').join(' ');
      mockApiClient.post.mockResolvedValue({
        data: {
          title: 'Long Article',
          content,
        },
      });

      const result = await readingApi.generateArticle({
        topic: 'Test',
        level: 'intermediate',
        length: 'long',
      });

      expect(result.readingTime).toBe(3); // ceil(600/200) = 3
    });

    it('throw lỗi khi API fail', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network Error'));

      await expect(
        readingApi.generateArticle({
          topic: 'Test',
          level: 'beginner',
          length: 'short',
        }),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('saveWord', () => {
    it('gửi đúng payload', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {success: true, word: {id: '1', word: 'hello'}},
      });

      await readingApi.saveWord({word: 'hello', meaning: 'xin chào'});

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/reading/saved-words',
        {word: 'hello', meaning: 'xin chào'},
      );
    });
  });

  describe('getSavedWords', () => {
    it('gửi params pagination đúng', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {words: [], total: 0},
      });

      await readingApi.getSavedWords(2, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reading/saved-words',
        {params: {page: 2, limit: 10}},
      );
    });

    it('dùng default page=1, limit=20', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {words: [], total: 0},
      });

      await readingApi.getSavedWords();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reading/saved-words',
        {params: {page: 1, limit: 20}},
      );
    });
  });

  describe('deleteWord', () => {
    it('gọi đúng endpoint', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: {success: true},
      });

      await readingApi.deleteWord('word-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/reading/saved-words/word-123',
      );
    });
  });
});

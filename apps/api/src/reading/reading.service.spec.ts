import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ConversationGeneratorService } from '../conversation-generator/conversation-generator.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  })),
}));

// Mock ConversationGeneratorService
const mockConversationGenerator = {
  generateText: jest.fn(),
};

describe('ReadingService', () => {
  let service: ReadingService;
  let supabase: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingService,
        {
          provide: ConversationGeneratorService,
          useValue: mockConversationGenerator,
        },
      ],
    }).compile();

    service = module.get<ReadingService>(ReadingService);
    supabase = (service as any).supabase;
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('generateArticle', () => {
    it('nên sinh bài đọc thành công từ Groq', async () => {
      // Arrange
      const mockArticle = {
        title: 'The Future of AI',
        content: 'Artificial intelligence is transforming our world...',
        vocabularyHighlights: ['artificial', 'transforming', 'innovation'],
      };
      mockConversationGenerator.generateText.mockResolvedValue(
        JSON.stringify(mockArticle),
      );

      // Act
      const result = await service.generateArticle({
        topic: 'AI',
        level: 'intermediate',
        wordCount: 300,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.article.title).toBe('The Future of AI');
      expect(result.article.level).toBe('intermediate');
      expect(result.article.vocabularyHighlights).toHaveLength(3);
    });

    it('nên xử lý trường hợp Groq trả về non-JSON', async () => {
      // Arrange
      mockConversationGenerator.generateText.mockResolvedValue(
        'This is a plain text article about technology...',
      );

      // Act
      const result = await service.generateArticle({
        topic: 'Technology',
        level: 'beginner',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.article.title).toBe('Technology');
      expect(result.article.content).toContain('plain text article');
    });

    it('nên throw InternalServerErrorException khi Groq lỗi', async () => {
      // Arrange
      mockConversationGenerator.generateText.mockRejectedValue(
        new Error('Groq API error'),
      );

      // Act & Assert
      await expect(
        service.generateArticle({ topic: 'Test', level: 'beginner' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('nên dùng default wordCount = 300 nếu không truyền', async () => {
      // Arrange
      mockConversationGenerator.generateText.mockResolvedValue(
        JSON.stringify({ title: 'Test', content: 'Content', vocabularyHighlights: [] }),
      );

      // Act
      await service.generateArticle({ topic: 'Test', level: 'beginner' });

      // Assert
      expect(mockConversationGenerator.generateText).toHaveBeenCalledWith(
        expect.stringContaining('300 words'),
        expect.any(String),
      );
    });
  });

  describe('analyzePractice', () => {
    it('nên phân tích reading practice thành công', async () => {
      // Arrange
      const mockAnalysis = {
        accuracy: 85,
        fluencyScore: 80,
        errors: [{ word: 'serendipity', issue: 'mispronounced' }],
        feedback: 'Good job overall!',
        tips: ['Practice the "ser" sound'],
      };
      mockConversationGenerator.generateText.mockResolvedValue(
        JSON.stringify(mockAnalysis),
      );

      // Act
      const result = await service.analyzePractice({
        originalText: 'The serendipity of life',
        userTranscript: 'The surendipity of life',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.analysis.accuracy).toBe(85);
      expect(result.analysis.errors).toHaveLength(1);
    });

    it('nên xử lý non-JSON response từ AI', async () => {
      // Arrange
      mockConversationGenerator.generateText.mockResolvedValue(
        'Your reading was mostly accurate.',
      );

      // Act
      const result = await service.analyzePractice({
        originalText: 'Hello world',
        userTranscript: 'Hello world',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.analysis.accuracy).toBe(0);
      expect(result.analysis.feedback).toContain('mostly accurate');
    });
  });

  describe('getSavedWords', () => {
    it('nên lấy danh sách saved words với pagination', async () => {
      // Arrange
      const mockWords = [
        { id: '1', word: 'hello', meaning: 'xin chào', context: 'Hello world', created_at: '2026-01-01' },
        { id: '2', word: 'world', meaning: 'thế giới', context: null, created_at: '2026-01-02' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockWords, error: null, count: 2 }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.getSavedWords('user-123', 1, 20);

      // Assert
      expect(result.success).toBe(true);
      expect(result.words).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('saveWord', () => {
    it('nên lưu từ mới thành công', async () => {
      // Arrange
      const mockSaved = {
        id: 'word-1',
        word: 'serendipity',
        meaning: 'Sự tình cờ',
        context: 'Pure serendipity',
        created_at: '2026-01-01',
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSaved, error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.saveWord('user-123', {
        word: 'serendipity',
        meaning: 'Sự tình cờ',
        context: 'Pure serendipity',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.word.word).toBe('serendipity');
      expect(result.message).toContain('serendipity');
    });
  });

  describe('deleteWord', () => {
    it('nên xóa từ thành công', async () => {
      // Arrange
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      // Chain 2 lần eq
      mockQuery.eq = jest.fn()
        .mockReturnValueOnce(mockQuery) // eq('id', wordId)
        .mockResolvedValueOnce({ error: null }); // eq('user_id', userId)
      mockQuery.delete = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.deleteWord('user-123', 'word-1');

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

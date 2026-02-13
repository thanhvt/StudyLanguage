/**
 * Unit test cho useReadingStore (Zustand)
 *
 * Mục đích: Test Reading store state management
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 */
import {useReadingStore} from '@/store/useReadingStore';

describe('useReadingStore', () => {
  beforeEach(() => {
    // Reset store về trạng thái ban đầu
    useReadingStore.getState().reset();
  });

  describe('Config', () => {
    it('setConfig cập nhật topic', () => {
      useReadingStore.getState().setConfig({topic: 'Technology'});

      expect(useReadingStore.getState().config.topic).toBe('Technology');
    });

    it('setConfig cập nhật level', () => {
      useReadingStore.getState().setConfig({level: 'advanced'});

      expect(useReadingStore.getState().config.level).toBe('advanced');
    });

    it('setConfig cập nhật length', () => {
      useReadingStore.getState().setConfig({length: 'long'});

      expect(useReadingStore.getState().config.length).toBe('long');
    });

    it('setConfig merge đúng, không mất config cũ', () => {
      useReadingStore.getState().setConfig({topic: 'Travel'});
      useReadingStore.getState().setConfig({level: 'beginner'});

      const config = useReadingStore.getState().config;
      expect(config.topic).toBe('Travel');
      expect(config.level).toBe('beginner');
      expect(config.length).toBe('medium'); // Giữ default
    });
  });

  describe('Article', () => {
    const mockArticle = {
      title: 'The Future of AI',
      content: 'Artificial intelligence is transforming the world.',
      wordCount: 200,
      readingTime: 2,
      level: 'intermediate',
    };

    it('setArticle lưu kết quả article', () => {
      useReadingStore.getState().setArticle(mockArticle);

      const state = useReadingStore.getState();
      expect(state.article).toBeDefined();
      expect(state.article?.title).toBe('The Future of AI');
      expect(state.article?.wordCount).toBe(200);
    });

    it('setArticle xóa error khi set article mới', () => {
      useReadingStore.getState().setError('Lỗi test');
      useReadingStore.getState().setArticle(mockArticle);

      expect(useReadingStore.getState().error).toBeNull();
    });

    it('setArticle(null) xóa article', () => {
      useReadingStore.getState().setArticle(mockArticle);
      useReadingStore.getState().setArticle(null);

      expect(useReadingStore.getState().article).toBeNull();
    });
  });

  describe('Generating', () => {
    it('setGenerating cập nhật trạng thái loading', () => {
      useReadingStore.getState().setGenerating(true);
      expect(useReadingStore.getState().isGenerating).toBe(true);

      useReadingStore.getState().setGenerating(false);
      expect(useReadingStore.getState().isGenerating).toBe(false);
    });
  });

  describe('Error', () => {
    it('setError lưu thông báo lỗi', () => {
      useReadingStore.getState().setError('Lỗi kết nối');

      expect(useReadingStore.getState().error).toBe('Lỗi kết nối');
    });

    it('setError(null) xóa lỗi', () => {
      useReadingStore.getState().setError('Lỗi');
      useReadingStore.getState().setError(null);

      expect(useReadingStore.getState().error).toBeNull();
    });
  });

  describe('Font Size', () => {
    it('setFontSize cập nhật cỡ chữ', () => {
      useReadingStore.getState().setFontSize(20);

      expect(useReadingStore.getState().fontSize).toBe(20);
    });

    it('fontSize mặc định là 16', () => {
      expect(useReadingStore.getState().fontSize).toBe(16);
    });
  });

  describe('Saved Words', () => {
    it('addSavedWord thêm từ vào danh sách', () => {
      useReadingStore.getState().addSavedWord('Hello');

      expect(useReadingStore.getState().savedWords).toContain('hello');
    });

    it('addSavedWord không trùng lặp (case-insensitive)', () => {
      useReadingStore.getState().addSavedWord('hello');
      useReadingStore.getState().addSavedWord('Hello');
      useReadingStore.getState().addSavedWord('HELLO');

      expect(useReadingStore.getState().savedWords).toHaveLength(1);
    });

    it('addSavedWord thêm nhiều từ khác nhau', () => {
      useReadingStore.getState().addSavedWord('technology');
      useReadingStore.getState().addSavedWord('innovation');
      useReadingStore.getState().addSavedWord('artificial');

      const words = useReadingStore.getState().savedWords;
      expect(words).toHaveLength(3);
      expect(words).toContain('technology');
      expect(words).toContain('innovation');
      expect(words).toContain('artificial');
    });

    it('removeSavedWord xóa đúng từ', () => {
      useReadingStore.getState().addSavedWord('hello');
      useReadingStore.getState().addSavedWord('world');
      useReadingStore.getState().removeSavedWord('hello');

      const words = useReadingStore.getState().savedWords;
      expect(words).not.toContain('hello');
      expect(words).toContain('world');
    });
  });

  describe('Defaults', () => {
    it('trạng thái mặc định đúng khi khởi tạo', () => {
      const state = useReadingStore.getState();

      expect(state.config.topic).toBe('');
      expect(state.config.level).toBe('intermediate');
      expect(state.config.length).toBe('medium');
      expect(state.article).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.error).toBeNull();
      expect(state.fontSize).toBe(16);
      expect(state.savedWords).toEqual([]);
    });
  });

  describe('Reset', () => {
    it('reset() trả về trạng thái mặc định', () => {
      // Setup: đã có data
      useReadingStore.setState({
        config: {topic: 'Test', level: 'advanced', length: 'long'},
        article: {
          title: 'Test',
          content: 'Content',
          wordCount: 100,
          readingTime: 1,
          level: 'advanced',
        },
        isGenerating: true,
        error: 'Lỗi test',
        fontSize: 22,
        savedWords: ['test', 'word'],
      });

      // Reset
      useReadingStore.getState().reset();

      const state = useReadingStore.getState();
      expect(state.config.topic).toBe('');
      expect(state.config.level).toBe('intermediate');
      expect(state.config.length).toBe('medium');
      expect(state.article).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.error).toBeNull();
      expect(state.fontSize).toBe(16);
      expect(state.savedWords).toEqual([]);
    });
  });
});

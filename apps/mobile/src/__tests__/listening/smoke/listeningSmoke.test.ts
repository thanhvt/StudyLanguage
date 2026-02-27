/**
 * Smoke test cho Listening Feature — Tier 3
 *
 * Mục đích: Kiểm tra các đường chính của feature không bị crash/lỗi critical
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline — chạy đầu tiên trước mọi test khác
 */
import {useListeningStore} from '@/store/useListeningStore';
import {
  TOPIC_CATEGORIES,
  searchScenarios,
  getRandomScenario,
  getTotalScenarios,
} from '@/data/topic-data';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

import {listeningApi, bookmarkApi} from '@/services/api/listening';

describe('Listening Smoke Tests', () => {
  beforeEach(() => {
    useListeningStore.getState().reset();
    jest.clearAllMocks();
  });

  // ================================
  // 1. Store Khởi tạo
  // ================================
  describe('Store khởi tạo không lỗi', () => {
    it('store khởi tạo thành công với giá trị mặc định', () => {
      const state = useListeningStore.getState();
      expect(state).toBeDefined();
      expect(state.config).toBeDefined();
      expect(state.config.topic).toBe('');
      expect(state.config.durationMinutes).toBe(5);
      expect(state.config.level).toBe('intermediate');
      expect(state.isPlaying).toBe(false);
      expect(state.conversation).toBeNull();
      expect(state.audioUrl).toBeNull();
    });

    it('reset() không throw', () => {
      expect(() => useListeningStore.getState().reset()).not.toThrow();
    });

    it('tất cả actions đều callable (không undefined)', () => {
      const state = useListeningStore.getState();
      expect(typeof state.setConfig).toBe('function');
      expect(typeof state.setSelectedTopic).toBe('function');
      expect(typeof state.toggleFavorite).toBe('function');
      expect(typeof state.togglePlaying).toBe('function');
      expect(typeof state.setPlaybackSpeed).toBe('function');
      expect(typeof state.setRandomEmotion).toBe('function');
      expect(typeof state.setRandomVoice).toBe('function');
      expect(typeof state.toggleBookmark).toBe('function');
      expect(typeof state.addSavedWord).toBe('function');
      expect(typeof state.setTtsPitch).toBe('function');
      expect(typeof state.reset).toBe('function');
    });
  });

  // ================================
  // 2. API Service Methods có tồn tại
  // ================================
  describe('API methods tồn tại', () => {
    it('listeningApi có tất cả methods cần thiết', () => {
      expect(typeof listeningApi.generateConversation).toBe('function');
      expect(typeof listeningApi.generateConversationAudio).toBe('function');
      expect(typeof listeningApi.fetchVoices).toBe('function');
      expect(typeof listeningApi.previewVoice).toBe('function');
    });

    it('bookmarkApi có tất cả methods cần thiết', () => {
      expect(typeof bookmarkApi.create).toBe('function');
      expect(typeof bookmarkApi.deleteByIndex).toBe('function');
    });
  });

  // ================================
  // 3. Topic Data Module
  // ================================
  describe('Topic data không lỗi', () => {
    it('TOPIC_CATEGORIES load thành công', () => {
      expect(TOPIC_CATEGORIES).toBeDefined();
      expect(Array.isArray(TOPIC_CATEGORIES)).toBe(true);
      expect(TOPIC_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('getTotalScenarios() trả về number > 0', () => {
      const total = getTotalScenarios();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThan(0);
    });

    it('searchScenarios() không crash với bất kỳ input', () => {
      expect(() => searchScenarios('')).not.toThrow();
      expect(() => searchScenarios('test')).not.toThrow();
      expect(() => searchScenarios('!@#$%')).not.toThrow();
    });

    it('getRandomScenario() trả về object hợp lệ', () => {
      const result = getRandomScenario();
      expect(result).toBeDefined();
      expect(result.scenario).toBeDefined();
    });
  });

  // ================================
  // 4. Pipeline không Crash
  // ================================
  describe('Critical pipeline không crash', () => {
    it('setConfig → setSelectedTopic → không crash', () => {
      expect(() => {
        useListeningStore.getState().setConfig({topic: 'Test', durationMinutes: 5});
        useListeningStore.getState().setSelectedTopic(
          {id: 'test-1', name: 'Test', description: 'Desc'},
          'it',
          'agile',
        );
      }).not.toThrow();
    });

    it('full state mutation cycle không crash', () => {
      expect(() => {
        const store = useListeningStore.getState();
        store.setConfig({topic: 'Test', level: 'advanced', numSpeakers: 3});
        store.setRandomVoice(false);
        store.setVoicePerSpeaker({A: 'en-US-JennyNeural'});
        store.setMultiTalker(true);
        store.setTtsPitch(5);
        store.setTtsRate(-3);
        store.setTtsVolume(80);
        store.setTtsEmotion('cheerful');
        store.setRandomEmotion(true);
        store.togglePlaying();
        store.setPlaybackSpeed(1.5);
        store.toggleBookmark(0);
        store.addSavedWord('hello');
        store.reset();
      }).not.toThrow();
    });
  });

  // ================================
  // 5. Module Exports
  // ================================
  describe('Module exports tồn tại', () => {
    it('useListeningStore export đúng', () => {
      expect(typeof useListeningStore).toBe('function');
    });

    it('listeningApi export đúng', () => {
      expect(typeof listeningApi).toBe('object');
    });

    it('bookmarkApi export đúng', () => {
      expect(typeof bookmarkApi).toBe('object');
    });
  });
});

/**
 * Mục đích: Unit tests cho useShadowingStore
 * Tham số đầu vào: không
 * Tham số đầu ra: Jest test results
 * Khi nào sử dụng: CI/CD hoặc dev chạy test thủ công
 */

import {act} from '@testing-library/react-native';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

// Import sau mock
import {useShadowingStore} from '@/store/useShadowingStore';
import type {ShadowingSentence, ShadowingScore} from '@/store/useShadowingStore';

// =======================
// Helpers
// =======================

const mockSentences: ShadowingSentence[] = [
  {id: 's-1', text: 'Hello world', ipa: '/həˈloʊ wɜːrld/', audioUrl: 'http://test/1.mp3', duration: 2, difficulty: 'easy'},
  {id: 's-2', text: 'How are you', ipa: '/haʊ ɑːr juː/', audioUrl: 'http://test/2.mp3', duration: 3, difficulty: 'medium'},
  {id: 's-3', text: 'Nice to meet you', ipa: '/naɪs tə miːt juː/', audioUrl: 'http://test/3.mp3', duration: 4, difficulty: 'hard'},
];

const mockScore: ShadowingScore = {
  rhythm: 85,
  intonation: 78,
  accuracy: 92,
  overall: 85,
  tips: ['Chú ý linked sounds', 'Giảm tốc độ nói'],
  wordIssues: [{word: 'world', score: 65, issue: 'Phát âm /ɜː/ chưa rõ', ipa: '/wɜːrld/'}],
};

// =======================
// Tests
// =======================

describe('useShadowingStore', () => {
  beforeEach(() => {
    // Reset store trước mỗi test
    act(() => {
      useShadowingStore.getState().reset();
    });
  });

  // ===== Config =====
  describe('Config', () => {
    it('nên có giá trị mặc định đúng', () => {
      const state = useShadowingStore.getState();
      expect(state.config.topic).toBeNull();
      expect(state.config.speed).toBe(1.0);
      expect(state.config.delay).toBe(0.5);
      expect(state.config.scoringMode).toBe('post-recording');
      expect(state.config.hasHeadphones).toBe(false);
    });

    it('nên set speed đúng', () => {
      act(() => useShadowingStore.getState().setSpeed(0.75));
      expect(useShadowingStore.getState().config.speed).toBe(0.75);
    });

    it('nên clamp delay trong khoảng 0-2.0', () => {
      act(() => useShadowingStore.getState().setDelay(3.0));
      expect(useShadowingStore.getState().config.delay).toBe(2.0);

      act(() => useShadowingStore.getState().setDelay(-1));
      expect(useShadowingStore.getState().config.delay).toBe(0);
    });

    it('nên set topic đúng', () => {
      const topic = {id: 'it-1', name: 'Daily Stand-up', description: 'Quick report'};
      act(() => useShadowingStore.getState().setTopic(topic));
      expect(useShadowingStore.getState().config.topic).toEqual(topic);
    });

    it('nên set scoring mode', () => {
      act(() => useShadowingStore.getState().setScoringMode('realtime'));
      expect(useShadowingStore.getState().config.scoringMode).toBe('realtime');
    });
  });

  // ===== Session =====
  describe('Session', () => {
    it('nên startSession với danh sách câu', () => {
      act(() => useShadowingStore.getState().startSession(mockSentences));

      const state = useShadowingStore.getState();
      expect(state.session.sentences).toHaveLength(3);
      expect(state.session.currentIndex).toBe(0);
      expect(state.session.totalSentences).toBe(3);
      expect(state.session.isCompleted).toBe(false);
    });

    it('nên nextSentence chuyển sang câu tiếp', () => {
      act(() => useShadowingStore.getState().startSession(mockSentences));
      act(() => useShadowingStore.getState().nextSentence());

      expect(useShadowingStore.getState().session.currentIndex).toBe(1);
      expect(useShadowingStore.getState().session.isCompleted).toBe(false);
    });

    it('nên isCompleted khi hết câu', () => {
      act(() => useShadowingStore.getState().startSession(mockSentences));
      act(() => useShadowingStore.getState().nextSentence()); // index 1
      act(() => useShadowingStore.getState().nextSentence()); // index 2
      act(() => useShadowingStore.getState().nextSentence()); // hết → completed

      expect(useShadowingStore.getState().session.isCompleted).toBe(true);
    });

    it('nên repeatSentence reset phase nhưng giữ nguyên index', () => {
      act(() => useShadowingStore.getState().startSession(mockSentences));
      act(() => useShadowingStore.getState().nextSentence());
      act(() => useShadowingStore.getState().setPhase('shadow'));
      act(() => useShadowingStore.getState().repeatSentence());

      expect(useShadowingStore.getState().session.currentIndex).toBe(1);
      expect(useShadowingStore.getState().phase.current).toBe('preview');
    });
  });

  // ===== Phase transitions =====
  describe('Phase Machine', () => {
    it('nên bắt đầu ở preview', () => {
      expect(useShadowingStore.getState().phase.current).toBe('preview');
    });

    it('nên chuyển phase đúng', () => {
      const phases = ['preview', 'shadow', 'score', 'action'] as const;
      phases.forEach(p => {
        act(() => useShadowingStore.getState().setPhase(p));
        expect(useShadowingStore.getState().phase.current).toBe(p);
      });
    });

    it('nên track AI playing state', () => {
      act(() => useShadowingStore.getState().setAIPlaying(true));
      expect(useShadowingStore.getState().phase.isAIPlaying).toBe(true);

      act(() => useShadowingStore.getState().setAIPlaying(false));
      expect(useShadowingStore.getState().phase.isAIPlaying).toBe(false);
    });

    it('nên track recording state', () => {
      act(() => useShadowingStore.getState().setRecording(true));
      expect(useShadowingStore.getState().phase.isRecording).toBe(true);
    });
  });

  // ===== Waveform =====
  describe('Waveform', () => {
    it('nên update AI waveform data', () => {
      const data = [0.1, 0.5, 0.8, 0.3];
      act(() => useShadowingStore.getState().updateAIWaveform(data));
      expect(useShadowingStore.getState().waveform.aiData).toEqual(data);
    });

    it('nên append user waveform amplitude', () => {
      act(() => useShadowingStore.getState().appendUserWaveform(0.7));
      act(() => useShadowingStore.getState().appendUserWaveform(0.4));
      expect(useShadowingStore.getState().waveform.userData).toEqual([0.7, 0.4]);
    });
  });

  // ===== Score =====
  describe('Score', () => {
    it('nên set score đúng', () => {
      act(() => useShadowingStore.getState().setScore(mockScore));

      const state = useShadowingStore.getState();
      expect(state.score.current).toEqual(mockScore);
      expect(state.score.isLoading).toBe(false);
    });

    it('nên set loading state', () => {
      act(() => useShadowingStore.getState().setScoreLoading(true));
      expect(useShadowingStore.getState().score.isLoading).toBe(true);
    });

    it('nên lưu session result', () => {
      const result = {
        sentenceId: 's-1',
        text: 'Hello world',
        score: mockScore,
        attempts: 1,
      };
      act(() => useShadowingStore.getState().addSessionResult(result));
      expect(useShadowingStore.getState().sessionResults).toHaveLength(1);
      expect(useShadowingStore.getState().sessionResults[0].sentenceId).toBe('s-1');
    });
  });

  // ===== Reset =====
  describe('Reset', () => {
    it('nên reset toàn bộ state về initial', () => {
      // Set nhiều giá trị
      act(() => {
        useShadowingStore.getState().setSpeed(1.5);
        useShadowingStore.getState().startSession(mockSentences);
        useShadowingStore.getState().setPhase('shadow');
        useShadowingStore.getState().setScore(mockScore);
      });

      // Reset
      act(() => useShadowingStore.getState().reset());

      const state = useShadowingStore.getState();
      expect(state.config.speed).toBe(1.0);
      expect(state.session.sentences).toHaveLength(0);
      expect(state.phase.current).toBe('preview');
      expect(state.score.current).toBeNull();
      expect(state.sessionResults).toHaveLength(0);
    });

    it('nên resetPhase chỉ reset phase/waveform/score', () => {
      act(() => {
        useShadowingStore.getState().setSpeed(1.5);
        useShadowingStore.getState().startSession(mockSentences);
        useShadowingStore.getState().setPhase('shadow');
      });

      act(() => useShadowingStore.getState().resetPhase());

      // Phase reset
      expect(useShadowingStore.getState().phase.current).toBe('preview');
      // Config giữ nguyên
      expect(useShadowingStore.getState().config.speed).toBe(1.5);
      // Session giữ nguyên
      expect(useShadowingStore.getState().session.sentences).toHaveLength(3);
    });
  });
});

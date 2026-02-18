/**
 * Unit test cho useSpeakingStore (Zustand)
 *
 * Mục đích: Test Speaking store state management
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 */
import {useSpeakingStore} from '@/store/useSpeakingStore';

describe('useSpeakingStore', () => {
  beforeEach(() => {
    // Reset store về trạng thái ban đầu
    useSpeakingStore.getState().reset();
  });

  describe('Config', () => {
    it('setConfig cập nhật topic', () => {
      useSpeakingStore.getState().setConfig({topic: 'Technology'});

      expect(useSpeakingStore.getState().config.topic).toBe('Technology');
    });

    it('setConfig cập nhật level', () => {
      useSpeakingStore.getState().setConfig({level: 'advanced'});

      expect(useSpeakingStore.getState().config.level).toBe('advanced');
    });

    it('setConfig merge đúng, không mất config cũ', () => {
      useSpeakingStore.getState().setConfig({topic: 'Travel'});
      useSpeakingStore.getState().setConfig({level: 'beginner'});

      const config = useSpeakingStore.getState().config;
      expect(config.topic).toBe('Travel');
      expect(config.level).toBe('beginner');
    });
  });

  describe('Sentences', () => {
    const mockSentences = [
      {text: 'Hello, how are you?', difficulty: 'easy'},
      {text: 'The weather is nice today.', difficulty: 'easy'},
      {text: 'Technology is revolutionizing our world.', difficulty: 'medium'},
    ];

    it('setSentences lưu danh sách câu và reset index', () => {
      useSpeakingStore.getState().setSentences(mockSentences);

      expect(useSpeakingStore.getState().sentences).toEqual(mockSentences);
      expect(useSpeakingStore.getState().currentIndex).toBe(0);
    });

    it('nextSentence tăng index và xóa feedback', () => {
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().setFeedback({overallScore: 90} as any);
      useSpeakingStore.getState().nextSentence();

      expect(useSpeakingStore.getState().currentIndex).toBe(1);
      expect(useSpeakingStore.getState().feedback).toBeNull();
    });

    it('nextSentence không vượt quá length', () => {
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().nextSentence();
      useSpeakingStore.getState().nextSentence();
      useSpeakingStore.getState().nextSentence(); // Vượt 3 lần nhưng chỉ có 3 câu

      expect(useSpeakingStore.getState().currentIndex).toBe(2); // max = length - 1
    });

    it('prevSentence giảm index', () => {
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().nextSentence();
      useSpeakingStore.getState().nextSentence();
      useSpeakingStore.getState().prevSentence();

      expect(useSpeakingStore.getState().currentIndex).toBe(1);
    });

    it('prevSentence không xuống dưới 0', () => {
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().prevSentence();

      expect(useSpeakingStore.getState().currentIndex).toBe(0);
    });

    it('setCurrentIndex set trực tiếp và xóa feedback', () => {
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().setCurrentIndex(2);

      expect(useSpeakingStore.getState().currentIndex).toBe(2);
      expect(useSpeakingStore.getState().feedback).toBeNull();
    });
  });

  describe('Recording', () => {
    it('startRecording set trạng thái ghi âm', () => {
      useSpeakingStore.getState().startRecording();

      const state = useSpeakingStore.getState();
      expect(state.isRecording).toBe(true);
      expect(state.recordingDuration).toBe(0);
      expect(state.audioUri).toBeNull();
      expect(state.error).toBeNull();
    });

    it('stopRecording lưu audioUri', () => {
      useSpeakingStore.getState().startRecording();
      useSpeakingStore.getState().stopRecording('/path/to/audio.m4a');

      const state = useSpeakingStore.getState();
      expect(state.isRecording).toBe(false);
      expect(state.audioUri).toBe('/path/to/audio.m4a');
    });

    it('setRecordingDuration cập nhật thời gian', () => {
      useSpeakingStore.getState().startRecording();
      useSpeakingStore.getState().setRecordingDuration(5);

      expect(useSpeakingStore.getState().recordingDuration).toBe(5);
    });

    it('clearRecording xóa recording state', () => {
      useSpeakingStore.getState().startRecording();
      useSpeakingStore.getState().stopRecording('/path/audio.m4a');
      useSpeakingStore.getState().setRecordingDuration(10);
      useSpeakingStore.getState().clearRecording();

      const state = useSpeakingStore.getState();
      expect(state.isRecording).toBe(false);
      expect(state.audioUri).toBeNull();
      expect(state.recordingDuration).toBe(0);
    });
  });

  describe('Feedback', () => {
    const mockFeedback = {
      overallScore: 85,
      fluency: 80,
      pronunciation: 88,
      pace: 90,
      wordByWord: [
        {word: 'hello', score: 95, correct: true},
        {word: 'world', score: 72, correct: false, issue: 'Thiếu âm cuối'},
      ],
      patterns: ['Cần luyện âm /θ/'],
      feedback: {
        wrongWords: [{word: 'world', userSaid: 'wor', suggestion: 'Đọc rõ /d/ cuối'}],
        tips: ['Đọc chậm hơn', 'Nhấn âm /ld/'],
        encouragement: 'Tốt lắm!',
      },
    };

    it('setFeedback lưu kết quả', () => {
      useSpeakingStore.getState().setFeedback(mockFeedback);

      const state = useSpeakingStore.getState();
      expect(state.feedback?.overallScore).toBe(85);
      expect(state.feedback?.wordByWord).toHaveLength(2);
      expect(state.isFeedbackLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('setFeedbackLoading cập nhật trạng thái', () => {
      useSpeakingStore.getState().setFeedbackLoading(true);
      expect(useSpeakingStore.getState().isFeedbackLoading).toBe(true);
    });

    it('setFeedback(null) xóa feedback', () => {
      useSpeakingStore.getState().setFeedback(mockFeedback);
      useSpeakingStore.getState().setFeedback(null);

      expect(useSpeakingStore.getState().feedback).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('setGenerating cập nhật isGenerating', () => {
      useSpeakingStore.getState().setGenerating(true);
      expect(useSpeakingStore.getState().isGenerating).toBe(true);

      useSpeakingStore.getState().setGenerating(false);
      expect(useSpeakingStore.getState().isGenerating).toBe(false);
    });

    it('setTranscribing cập nhật isTranscribing', () => {
      useSpeakingStore.getState().setTranscribing(true);
      expect(useSpeakingStore.getState().isTranscribing).toBe(true);
    });
  });

  describe('Error', () => {
    it('setError lưu lỗi', () => {
      useSpeakingStore.getState().setError('Lỗi ghi âm');
      expect(useSpeakingStore.getState().error).toBe('Lỗi ghi âm');
    });

    it('setError(null) xóa lỗi', () => {
      useSpeakingStore.getState().setError('Lỗi');
      useSpeakingStore.getState().setError(null);
      expect(useSpeakingStore.getState().error).toBeNull();
    });
  });

  describe('Defaults', () => {
    it('trạng thái mặc định đúng khi khởi tạo', () => {
      const state = useSpeakingStore.getState();

      expect(state.config.topic).toBe('');
      expect(state.config.level).toBe('intermediate');
      expect(state.sentences).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.isRecording).toBe(false);
      expect(state.recordingDuration).toBe(0);
      expect(state.audioUri).toBeNull();
      expect(state.feedback).toBeNull();
      expect(state.isFeedbackLoading).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.isTranscribing).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Reset', () => {
    it('reset() trả về trạng thái mặc định', () => {
      // Setup state
      useSpeakingStore.setState({
        config: {topic: 'Test', level: 'advanced'},
        sentences: [{text: 'Test', difficulty: 'hard'}],
        currentIndex: 2,
        isRecording: true,
        recordingDuration: 10,
        audioUri: '/path/audio.m4a',
        feedback: {overallScore: 90} as any,
        isFeedbackLoading: true,
        isGenerating: true,
        isTranscribing: true,
        error: 'Lỗi test',
      });

      useSpeakingStore.getState().reset();

      const state = useSpeakingStore.getState();
      expect(state.config.topic).toBe('');
      expect(state.config.level).toBe('intermediate');
      expect(state.sentences).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.isRecording).toBe(false);
      expect(state.feedback).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  // ============================================
  // Sprint 7A: TTS Settings
  // ============================================

  describe('TTS Settings (Sprint 7A)', () => {
    it('trạng thái mặc định TTS đúng', () => {
      const state = useSpeakingStore.getState();

      expect(state.ttsSettings.provider).toBe('openai');
      expect(state.ttsSettings.voiceId).toBe('alloy');
      expect(state.ttsSettings.speed).toBe(1.0);
    });

    it('setTtsSettings merge partial — chỉ cập nhật provider', () => {
      useSpeakingStore.getState().setTtsSettings({provider: 'azure'});

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.provider).toBe('azure');
      // Các field khác giữ nguyên
      expect(ttsSettings.voiceId).toBe('alloy');
      expect(ttsSettings.speed).toBe(1.0);
    });

    it('setTtsSettings merge partial — chỉ cập nhật speed', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 1.5});

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.speed).toBe(1.5);
      expect(ttsSettings.provider).toBe('openai');
    });

    it('setTtsSettings cập nhật nhiều field cùng lúc', () => {
      useSpeakingStore.getState().setTtsSettings({
        provider: 'azure',
        voiceId: 'en-US-AriaNeural',
        speed: 0.8,
      });

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.provider).toBe('azure');
      expect(ttsSettings.voiceId).toBe('en-US-AriaNeural');
      expect(ttsSettings.speed).toBe(0.8);
    });

    it('setTtsSettings liên tiếp merge đúng', () => {
      useSpeakingStore.getState().setTtsSettings({provider: 'azure'});
      useSpeakingStore.getState().setTtsSettings({voiceId: 'en-GB-SoniaNeural'});
      useSpeakingStore.getState().setTtsSettings({speed: 2.0});

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.provider).toBe('azure');
      expect(ttsSettings.voiceId).toBe('en-GB-SoniaNeural');
      expect(ttsSettings.speed).toBe(2.0);
    });
  });
});

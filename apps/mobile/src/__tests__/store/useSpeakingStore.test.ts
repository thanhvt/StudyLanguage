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
    it('setConfig cập nhật topic với TopicScenario', () => {
      const mockTopic = {id: 'it-1', name: 'Daily Stand-up Update', description: 'Quick report'};
      useSpeakingStore.getState().setConfig({topic: mockTopic});

      expect(useSpeakingStore.getState().config.topic).toEqual(mockTopic);
    });

    it('setConfig cập nhật level', () => {
      useSpeakingStore.getState().setConfig({level: 'advanced'});

      expect(useSpeakingStore.getState().config.level).toBe('advanced');
    });

    it('setConfig merge đúng, không mất config cũ', () => {
      const mockTopic = {id: 'daily-1', name: 'Check-in', description: 'Airport check-in'};
      useSpeakingStore.getState().setConfig({topic: mockTopic});
      useSpeakingStore.getState().setConfig({level: 'beginner'});

      const config = useSpeakingStore.getState().config;
      expect(config.topic).toEqual(mockTopic);
      expect(config.level).toBe('beginner');
    });
  });

  describe('Sentences', () => {
    const mockSentences = [
      {id: 's-1', text: 'Hello, how are you?', ipa: '/həˈloʊ/', audioUrl: '', difficulty: 'easy' as const},
      {id: 's-2', text: 'The weather is nice today.', ipa: '', audioUrl: '', difficulty: 'easy' as const},
      {id: 's-3', text: 'Technology is revolutionizing our world.', ipa: '', audioUrl: '', difficulty: 'medium' as const},
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
      grade: 'B+',
      fluency: 80,
      pronunciation: 88,
      pace: 90,
      wordByWord: [
        {word: 'hello', score: 95, phonemes: '/hɛˈloʊ/', issues: []},
        {word: 'world', score: 72, phonemes: '/wɝːld/', issues: ['Thiếu âm cuối']},
      ],
      phonemeHeatmap: [
        {phoneme: '/θ/', accuracy: 65, totalAttempts: 3},
        {phoneme: '/ɹ/', accuracy: 90, totalAttempts: 5},
      ],
      patterns: ['Cần luyện âm /θ/'],
      feedback: {
        wrongWords: [{word: 'world', userSaid: 'wor', suggestion: 'Đọc rõ /d/ cuối'}],
        tips: ['Đọc chậm hơn', 'Nhấn âm /ld/'],
        encouragement: 'Tốt lắm!',
      },
      aiCorrectedAudioUrl: null,
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

      expect(state.config.topic).toBeNull();
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
      expect(state.displaySettings.showIPA).toBe(true);
    });
  });

  describe('Reset', () => {
    it('reset() trả về trạng thái mặc định', () => {
      // Setup state
      useSpeakingStore.setState({
        config: {topic: {id: 'test', name: 'Test', description: ''}, level: 'advanced'},
        sentences: [{id: 's-1', text: 'Test', ipa: '', audioUrl: '', difficulty: 'hard'}],
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
      expect(state.config.topic).toBeNull();
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
    it('trạng thái mặc định TTS đúng (Azure defaults)', () => {
      const state = useSpeakingStore.getState();

      expect(state.ttsSettings.provider).toBe('azure');
      expect(state.ttsSettings.voiceId).toBe('en-US-JennyNeural');
      expect(state.ttsSettings.speed).toBe(1.0);
      expect(state.ttsSettings.pitch).toBe(0);
      expect(state.ttsSettings.emotion).toBe('cheerful');
      expect(state.ttsSettings.autoEmotion).toBe(true);
      expect(state.ttsSettings.randomVoice).toBe(false);
    });

    it('setTtsSettings merge partial — chỉ cập nhật provider', () => {
      useSpeakingStore.getState().setTtsSettings({provider: 'azure'});

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.provider).toBe('azure');
      // Các field khác giữ nguyên
      expect(ttsSettings.voiceId).toBe('en-US-JennyNeural');
      expect(ttsSettings.speed).toBe(1.0);
    });

    it('setTtsSettings pitch clamp trong range -50 đến +50', () => {
      useSpeakingStore.getState().setTtsSettings({pitch: 100});
      expect(useSpeakingStore.getState().ttsSettings.pitch).toBe(50);

      useSpeakingStore.getState().setTtsSettings({pitch: -100});
      expect(useSpeakingStore.getState().ttsSettings.pitch).toBe(-50);

      useSpeakingStore.getState().setTtsSettings({pitch: 25});
      expect(useSpeakingStore.getState().ttsSettings.pitch).toBe(25);
    });

    it('setTtsSettings speed clamp trong range 0.5 đến 2.0', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 5.0});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(2.0);

      useSpeakingStore.getState().setTtsSettings({speed: 0.1});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(0.5);
    });

    it('setTtsSettings emotion và autoEmotion', () => {
      useSpeakingStore.getState().setTtsSettings({emotion: 'newscast', autoEmotion: false});

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.emotion).toBe('newscast');
      expect(ttsSettings.autoEmotion).toBe(false);
    });

    it('setTtsSettings randomVoice toggle', () => {
      useSpeakingStore.getState().setTtsSettings({randomVoice: true});
      expect(useSpeakingStore.getState().ttsSettings.randomVoice).toBe(true);
    });

    it('setTtsSettings merge partial — chỉ cập nhật speed', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 1.5});

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.speed).toBe(1.5);
      expect(ttsSettings.provider).toBe('azure');
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

  // ============================================
  // AI Conversation Actions
  // ============================================

  describe('AI Conversation Actions', () => {
    const mockSetup = {
      mode: 'free-talk' as const,
      topicId: null,
      topicName: 'Daily conversation',
      topicDescription: 'Trò chuyện hàng ngày',
      persona: null,
      durationMinutes: 10,
      totalTurns: 0,
      feedbackSettings: {
        showSuggestions: true,
        inlineGrammarFix: true,
        pronunciationAlert: true,
      },
    } as any;

    it('setConversationSetup lưu setup đúng', () => {
      useSpeakingStore.getState().setConversationSetup(mockSetup);

      const {conversationSetup} = useSpeakingStore.getState();
      expect(conversationSetup).not.toBeNull();
      expect(conversationSetup!.topicName).toBe('Daily conversation');
      expect(conversationSetup!.durationMinutes).toBe(10);
      expect(conversationSetup!.mode).toBe('free-talk');
    });

    it('startConversation khởi tạo session active', () => {
      useSpeakingStore.getState().setConversationSetup(mockSetup);
      useSpeakingStore.getState().startConversation();

      const {conversationSession} = useSpeakingStore.getState();
      expect(conversationSession).not.toBeNull();
      expect(conversationSession!.isActive).toBe(true);
      expect(conversationSession!.messages).toEqual([]);
      expect(conversationSession!.inputMode).toBe('voice');
    });

    it('setConversationInputMode đổi voice ↔ text', () => {
      useSpeakingStore.getState().setConversationSetup(mockSetup);
      useSpeakingStore.getState().startConversation();

      useSpeakingStore.getState().setConversationInputMode('text');
      expect(useSpeakingStore.getState().conversationSession!.inputMode).toBe('text');

      useSpeakingStore.getState().setConversationInputMode('voice');
      expect(useSpeakingStore.getState().conversationSession!.inputMode).toBe('voice');
    });

    it('endConversation set isActive = false', () => {
      useSpeakingStore.getState().setConversationSetup(mockSetup);
      useSpeakingStore.getState().startConversation();

      useSpeakingStore.getState().endConversation();

      const {conversationSession} = useSpeakingStore.getState();
      expect(conversationSession!.isActive).toBe(false);
    });

    it('resetConversation xóa toàn bộ conversation state', () => {
      useSpeakingStore.getState().setConversationSetup(mockSetup);
      useSpeakingStore.getState().startConversation();

      useSpeakingStore.getState().resetConversation();

      const state = useSpeakingStore.getState();
      expect(state.conversationSetup).toBeNull();
      expect(state.conversationSession).toBeNull();
      expect(state.conversationSummary).toBeNull();
    });

    it('Conversation actions an toàn khi session = null (null-safe)', () => {
      // Đảm bảo các action không crash khi conversationSession chưa khởi tạo
      expect(useSpeakingStore.getState().conversationSession).toBeNull();

      // Gọi tất cả actions — không crash
      useSpeakingStore.getState().setConversationInputMode('text');
      useSpeakingStore.getState().tickConversationTimer();
      useSpeakingStore.getState().setAIThinking(true);
      useSpeakingStore.getState().endConversation();
      useSpeakingStore.getState().resetConversation();

      // Vẫn null, không crash
      expect(useSpeakingStore.getState().conversationSession).toBeNull();
    });
  });

  // ============================================
  // Display Settings (showIPA)
  // ============================================

  describe('Display Settings', () => {
    it('trạng thái mặc định showIPA = true', () => {
      expect(useSpeakingStore.getState().displaySettings.showIPA).toBe(true);
    });

    it('setShowIPA toggle đúng', () => {
      useSpeakingStore.getState().setShowIPA(false);
      expect(useSpeakingStore.getState().displaySettings.showIPA).toBe(false);

      useSpeakingStore.getState().setShowIPA(true);
      expect(useSpeakingStore.getState().displaySettings.showIPA).toBe(true);
    });
  });
});

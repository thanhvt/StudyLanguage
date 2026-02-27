/**
 * Unit test cho useListeningStore (Zustand) — Rewrite v3
 *
 * Mục đích: Test toàn diện Listening store state management
 * Bao gồm: config mutations, randomEmotion, voice settings, multiTalker,
 *           bookmarks, savedWords, TTS prosody clamping, reset
 */
import {useListeningStore} from '@/store/useListeningStore';

describe('useListeningStore', () => {
  beforeEach(() => {
    // Reset store về trạng thái mặc định trước mỗi test
    useListeningStore.getState().reset();
  });

  // ================================
  // Config mutations
  // ================================
  describe('Config', () => {
    it('setConfig cập nhật topic', () => {
      useListeningStore.getState().setConfig({topic: 'Coffee Shop'});
      expect(useListeningStore.getState().config.topic).toBe('Coffee Shop');
    });

    it('setConfig cập nhật durationMinutes', () => {
      useListeningStore.getState().setConfig({durationMinutes: 10});
      expect(useListeningStore.getState().config.durationMinutes).toBe(10);
    });

    it('setConfig cập nhật level', () => {
      useListeningStore.getState().setConfig({level: 'advanced'});
      expect(useListeningStore.getState().config.level).toBe('advanced');
    });

    it('setConfig cập nhật numSpeakers', () => {
      useListeningStore.getState().setConfig({numSpeakers: 4});
      expect(useListeningStore.getState().config.numSpeakers).toBe(4);
    });

    it('setConfig cập nhật keywords', () => {
      useListeningStore.getState().setConfig({keywords: 'coffee, meeting'});
      expect(useListeningStore.getState().config.keywords).toBe('coffee, meeting');
    });

    it('setConfig update nhiều fields cùng lúc, giữ giá trị cũ cho fields không update', () => {
      useListeningStore.getState().setConfig({
        topic: 'Travel',
        durationMinutes: 15,
      });
      const config = useListeningStore.getState().config;
      expect(config.topic).toBe('Travel');
      expect(config.durationMinutes).toBe(15);
      expect(config.level).toBe('intermediate'); // Giữ default
      expect(config.numSpeakers).toBe(2); // Giữ default
    });

    it('setConfig với includeVietnamese toggle', () => {
      useListeningStore.getState().setConfig({includeVietnamese: false});
      expect(useListeningStore.getState().config.includeVietnamese).toBe(false);
    });
  });

  // ================================
  // Topic Selection
  // ================================
  describe('Topic Selection', () => {
    const mockTopic = {
      id: 'it-1',
      name: 'Daily Stand-up',
      description: 'Quick report on tasks',
    };

    it('setSelectedTopic lưu topic + cập nhật config.topic', () => {
      useListeningStore.getState().setSelectedTopic(mockTopic, 'it', 'agile');
      const state = useListeningStore.getState();
      expect(state.selectedTopic).toEqual(mockTopic);
      expect(state.selectedCategory).toBe('it');
      expect(state.selectedSubCategory).toBe('agile');
      expect(state.config.topic).toBe('Daily Stand-up');
    });

    it('setSelectedTopic(null) xóa topic + xóa config.topic', () => {
      useListeningStore.getState().setSelectedTopic(mockTopic, 'it', 'agile');
      useListeningStore.getState().setSelectedTopic(null);
      expect(useListeningStore.getState().selectedTopic).toBeNull();
      expect(useListeningStore.getState().config.topic).toBe('');
    });

    it('setSelectedCategory đổi category', () => {
      useListeningStore.getState().setSelectedCategory('daily');
      expect(useListeningStore.getState().selectedCategory).toBe('daily');
    });

    it('setSelectedSubCategory toggle mở/đóng', () => {
      useListeningStore.getState().setSelectedSubCategory('agile');
      expect(useListeningStore.getState().selectedSubCategory).toBe('agile');
      // Toggle lại → đóng
      useListeningStore.getState().setSelectedSubCategory('agile');
      expect(useListeningStore.getState().selectedSubCategory).toBe('');
    });
  });

  // ================================
  // Favorites
  // ================================
  describe('Favorites', () => {
    it('toggleFavorite thêm scenario vào favorites', () => {
      useListeningStore.getState().toggleFavorite('it-1');
      expect(useListeningStore.getState().favoriteScenarioIds).toContain('it-1');
    });

    it('toggleFavorite bỏ scenario khỏi favorites', () => {
      useListeningStore.getState().toggleFavorite('it-1');
      useListeningStore.getState().toggleFavorite('it-1');
      expect(useListeningStore.getState().favoriteScenarioIds).not.toContain('it-1');
    });

    it('toggleFavorite quản lý nhiều favorites', () => {
      useListeningStore.getState().toggleFavorite('it-1');
      useListeningStore.getState().toggleFavorite('daily-5');
      useListeningStore.getState().toggleFavorite('personal-10');
      const ids = useListeningStore.getState().favoriteScenarioIds;
      expect(ids).toHaveLength(3);
      expect(ids).toContain('it-1');
      expect(ids).toContain('daily-5');
      expect(ids).toContain('personal-10');
    });
  });

  // ================================
  // Playback
  // ================================
  describe('Playback', () => {
    it('togglePlaying chuyển đổi play/pause', () => {
      expect(useListeningStore.getState().isPlaying).toBe(false);
      useListeningStore.getState().togglePlaying();
      expect(useListeningStore.getState().isPlaying).toBe(true);
      useListeningStore.getState().togglePlaying();
      expect(useListeningStore.getState().isPlaying).toBe(false);
    });

    it('setPlaying set trực tiếp', () => {
      useListeningStore.getState().setPlaying(true);
      expect(useListeningStore.getState().isPlaying).toBe(true);
    });

    it('setPlaybackSpeed cập nhật tốc độ', () => {
      useListeningStore.getState().setPlaybackSpeed(1.5);
      expect(useListeningStore.getState().playbackSpeed).toBe(1.5);
    });

    it('setPlaybackSpeed clamp 0.25x-4.0x', () => {
      useListeningStore.getState().setPlaybackSpeed(0.1);
      expect(useListeningStore.getState().playbackSpeed).toBe(0.25);
      useListeningStore.getState().setPlaybackSpeed(5.0);
      expect(useListeningStore.getState().playbackSpeed).toBe(4.0);
    });

    it('setCurrentExchangeIndex clamp không âm', () => {
      useListeningStore.getState().setCurrentExchangeIndex(-5);
      expect(useListeningStore.getState().currentExchangeIndex).toBe(0);
    });
  });

  // ================================
  // Random Emotion (New!)
  // ================================
  describe('Random Emotion', () => {
    it('randomEmotion mặc định = false', () => {
      expect(useListeningStore.getState().randomEmotion).toBe(false);
    });

    it('setRandomEmotion(true) bật random emotion', () => {
      useListeningStore.getState().setRandomEmotion(true);
      expect(useListeningStore.getState().randomEmotion).toBe(true);
    });

    it('setRandomEmotion(false) tắt random emotion', () => {
      useListeningStore.getState().setRandomEmotion(true);
      useListeningStore.getState().setRandomEmotion(false);
      expect(useListeningStore.getState().randomEmotion).toBe(false);
    });
  });

  // ================================
  // Voice Settings
  // ================================
  describe('Voice Settings', () => {
    it('setRandomVoice toggle random voice', () => {
      useListeningStore.getState().setRandomVoice(false);
      expect(useListeningStore.getState().randomVoice).toBe(false);
      useListeningStore.getState().setRandomVoice(true);
      expect(useListeningStore.getState().randomVoice).toBe(true);
    });

    it('setVoicePerSpeaker gán voice cho speaker', () => {
      const map = {A: 'en-US-JennyNeural', B: 'en-US-GuyNeural'};
      useListeningStore.getState().setVoicePerSpeaker(map);
      expect(useListeningStore.getState().voicePerSpeaker).toEqual(map);
    });

    it('setMultiTalker toggle multi-talker', () => {
      useListeningStore.getState().setMultiTalker(true);
      expect(useListeningStore.getState().multiTalker).toBe(true);
    });

    it('setMultiTalkerPairIndex đổi cặp giọng', () => {
      useListeningStore.getState().setMultiTalkerPairIndex(1);
      expect(useListeningStore.getState().multiTalkerPairIndex).toBe(1);
    });
  });

  // ================================
  // Bookmarks
  // ================================
  describe('Bookmarks', () => {
    it('toggleBookmark thêm bookmark', () => {
      useListeningStore.getState().toggleBookmark(3);
      expect(useListeningStore.getState().bookmarkedIndexes).toContain(3);
    });

    it('toggleBookmark bỏ bookmark', () => {
      useListeningStore.getState().toggleBookmark(3);
      useListeningStore.getState().toggleBookmark(3);
      expect(useListeningStore.getState().bookmarkedIndexes).not.toContain(3);
    });

    it('setBookmarkedIndexes load từ server', () => {
      useListeningStore.getState().setBookmarkedIndexes([1, 5, 10]);
      expect(useListeningStore.getState().bookmarkedIndexes).toEqual([1, 5, 10]);
    });
  });

  // ================================
  // Saved Words
  // ================================
  describe('Saved Words', () => {
    it('addSavedWord thêm từ (lowercase)', () => {
      useListeningStore.getState().addSavedWord('Coffee');
      expect(useListeningStore.getState().savedWords).toContain('coffee');
    });

    it('addSavedWord không trùng lặp', () => {
      useListeningStore.getState().addSavedWord('hello');
      useListeningStore.getState().addSavedWord('Hello');
      useListeningStore.getState().addSavedWord('HELLO');
      expect(useListeningStore.getState().savedWords).toEqual(['hello']);
    });

    it('removeSavedWord xóa từ', () => {
      useListeningStore.getState().addSavedWord('hello');
      useListeningStore.getState().addSavedWord('world');
      useListeningStore.getState().removeSavedWord('hello');
      expect(useListeningStore.getState().savedWords).toEqual(['world']);
    });
  });

  // ================================
  // TTS Prosody (Pitch/Rate/Volume clamping)
  // ================================
  describe('TTS Prosody', () => {
    it('setTtsPitch clamp -20 to +20', () => {
      useListeningStore.getState().setTtsPitch(-25);
      expect(useListeningStore.getState().ttsPitch).toBe(-20);
      useListeningStore.getState().setTtsPitch(25);
      expect(useListeningStore.getState().ttsPitch).toBe(20);
    });

    it('setTtsRate clamp -20 to +20', () => {
      useListeningStore.getState().setTtsRate(-30);
      expect(useListeningStore.getState().ttsRate).toBe(-20);
      useListeningStore.getState().setTtsRate(30);
      expect(useListeningStore.getState().ttsRate).toBe(20);
    });

    it('setTtsVolume clamp 0-100', () => {
      useListeningStore.getState().setTtsVolume(-10);
      expect(useListeningStore.getState().ttsVolume).toBe(0);
      useListeningStore.getState().setTtsVolume(200);
      expect(useListeningStore.getState().ttsVolume).toBe(100);
    });

    it('setTtsEmotion đổi emotion', () => {
      useListeningStore.getState().setTtsEmotion('cheerful');
      expect(useListeningStore.getState().ttsEmotion).toBe('cheerful');
    });
  });

  // ================================
  // Translation Toggle
  // ================================
  describe('Translation', () => {
    it('toggleTranslation chuyển đổi bật/tắt', () => {
      expect(useListeningStore.getState().showTranslation).toBe(true); // default
      useListeningStore.getState().toggleTranslation();
      expect(useListeningStore.getState().showTranslation).toBe(false);
      useListeningStore.getState().toggleTranslation();
      expect(useListeningStore.getState().showTranslation).toBe(true);
    });
  });

  // ================================
  // Conversation + Audio
  // ================================
  describe('Conversation', () => {
    it('setConversation lưu kết quả', () => {
      const mockResult = {
        conversation: [
          {speaker: 'Alice', text: 'Hello!'},
          {speaker: 'Bob', text: 'Hi!'},
        ],
        title: 'Test',
        vocabulary: ['hello'],
      } as any;
      useListeningStore.getState().setConversation(mockResult);
      expect(useListeningStore.getState().conversation).toEqual(mockResult);
    });

    it('setConversation(null) xóa conversation', () => {
      useListeningStore.getState().setConversation(null);
      expect(useListeningStore.getState().conversation).toBeNull();
    });

    it('setAudioUrl lưu URL', () => {
      useListeningStore.getState().setAudioUrl('https://audio.example.com/test.mp3');
      expect(useListeningStore.getState().audioUrl).toBe('https://audio.example.com/test.mp3');
    });

    it('setTimestamps lưu timestamps', () => {
      const ts = [
        {lineIndex: 0, startTime: 0, endTime: 3.5, speaker: 'Alice'},
        {lineIndex: 1, startTime: 3.5, endTime: 7.2, speaker: 'Bob'},
      ];
      useListeningStore.getState().setTimestamps(ts);
      expect(useListeningStore.getState().timestamps).toEqual(ts);
    });
  });

  // ================================
  // Reset
  // ================================
  describe('Reset', () => {
    it('reset() trả về tất cả state mặc định', () => {
      // Setup: đã thay đổi nhiều state
      useListeningStore.setState({
        config: {
          topic: 'Test',
          durationMinutes: 15,
          level: 'advanced',
          includeVietnamese: false,
          numSpeakers: 4,
          keywords: 'test',
        },
        isPlaying: true,
        playbackSpeed: 2,
        randomEmotion: true,
        multiTalker: true,
        ttsEmotion: 'cheerful',
        ttsPitch: 10,
        ttsRate: -5,
        ttsVolume: 50,
        bookmarkedIndexes: [1, 2, 3],
        savedWords: ['hello', 'world'],
        showTranslation: false,
      });

      // Act
      useListeningStore.getState().reset();

      // Assert
      const state = useListeningStore.getState();
      expect(state.config.topic).toBe('');
      expect(state.config.durationMinutes).toBe(5);
      expect(state.config.level).toBe('intermediate');
      expect(state.isPlaying).toBe(false);
      expect(state.playbackSpeed).toBe(1);
      expect(state.randomEmotion).toBe(false);
      expect(state.multiTalker).toBe(false);
      expect(state.ttsEmotion).toBe('default');
      expect(state.ttsPitch).toBe(0);
      expect(state.ttsRate).toBe(0);
      expect(state.ttsVolume).toBe(100);
      expect(state.bookmarkedIndexes).toEqual([]);
      expect(state.savedWords).toEqual([]);
      expect(state.showTranslation).toBe(true);
      expect(state.conversation).toBeNull();
      expect(state.selectedTopic).toBeNull();
      expect(state.currentExchangeIndex).toBe(0);
    });
  });

  // ================================
  // Visibility Matrix (TTS Settings đặc biệt)
  // ================================
  describe('Visibility Matrix', () => {
    it('randomVoice=true → voicePerSpeaker bị bỏ qua (lý thuyết)', () => {
      useListeningStore.getState().setRandomVoice(true);
      useListeningStore.getState().setVoicePerSpeaker({A: 'en-US-JennyNeural'});
      // randomVoice=true nhưng voicePerSpeaker vẫn lưu (UI sẽ ẩn chứ không xóa)
      const state = useListeningStore.getState();
      expect(state.randomVoice).toBe(true);
      expect(state.voicePerSpeaker).toEqual({A: 'en-US-JennyNeural'});
    });

    it('randomEmotion=true → ttsEmotion vẫn lưu (UI dimmed)', () => {
      useListeningStore.getState().setRandomEmotion(true);
      useListeningStore.getState().setTtsEmotion('cheerful');
      const state = useListeningStore.getState();
      expect(state.randomEmotion).toBe(true);
      expect(state.ttsEmotion).toBe('cheerful'); // Vẫn lưu, UI dimmed
    });

    it('multiTalker=true + randomVoice có thể cùng tồn tại', () => {
      useListeningStore.getState().setMultiTalker(true);
      useListeningStore.getState().setRandomVoice(true);
      const state = useListeningStore.getState();
      expect(state.multiTalker).toBe(true);
      expect(state.randomVoice).toBe(true);
    });
  });
});

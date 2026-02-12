/**
 * Unit test cho useListeningStore (Zustand)
 *
 * Mục đích: Test Listening store state management
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-002: Chọn topic
 *   - MOB-LIS-MVP-HP-003: Chọn duration
 *   - MOB-LIS-MVP-HP-007: Play/Pause toggle
 *   - MOB-LIS-MVP-HP-009: Previous/Next sentence
 *   - MOB-LIS-MVP-HP-010: Speed control
 *   - MOB-LIS-MVP-HP-025: Chọn speakers (2/3/4)
 *   - MOB-LIS-MVP-HP-026: Nhập keywords
 *   - MOB-LIS-MVP-HP-021: Chọn topic từ TopicPicker
 *   - MOB-LIS-MVP-HP-023: Favorite/Star scenario
 */
import {useListeningStore} from '@/store/useListeningStore';

describe('useListeningStore', () => {
  beforeEach(() => {
    // Reset store bằng action reset()
    useListeningStore.getState().reset();
  });

  describe('Config', () => {
    // MOB-LIS-MVP-HP-002: Chọn topic
    it('setConfig cập nhật topic', () => {
      useListeningStore.getState().setConfig({topic: 'Coffee Shop'});

      expect(useListeningStore.getState().config.topic).toBe('Coffee Shop');
    });

    // MOB-LIS-MVP-HP-003: Chọn duration
    it('setConfig cập nhật duration', () => {
      useListeningStore.getState().setConfig({durationMinutes: 10});

      expect(useListeningStore.getState().config.durationMinutes).toBe(10);
    });

    // MOB-LIS-MVP-HP-024: Custom duration
    it('setConfig cập nhật custom duration (7 phút)', () => {
      useListeningStore.getState().setConfig({durationMinutes: 7});

      expect(useListeningStore.getState().config.durationMinutes).toBe(7);
    });

    // Chọn level
    it('setConfig cập nhật level', () => {
      useListeningStore.getState().setConfig({level: 'advanced'});

      expect(useListeningStore.getState().config.level).toBe('advanced');
    });

    // MOB-LIS-MVP-HP-025: Chọn speakers
    it('setConfig cập nhật numSpeakers', () => {
      useListeningStore.getState().setConfig({numSpeakers: 3});
      expect(useListeningStore.getState().config.numSpeakers).toBe(3);

      useListeningStore.getState().setConfig({numSpeakers: 4});
      expect(useListeningStore.getState().config.numSpeakers).toBe(4);
    });

    // MOB-LIS-MVP-HP-026: Nhập keywords
    it('setConfig cập nhật keywords', () => {
      useListeningStore.getState().setConfig({keywords: 'coffee, meeting'});
      expect(useListeningStore.getState().config.keywords).toBe(
        'coffee, meeting',
      );
    });

    // Merge config (không overwrite các field khác)
    it('setConfig merge đúng, không mất config cũ', () => {
      useListeningStore.getState().setConfig({topic: 'Travel'});
      useListeningStore.getState().setConfig({durationMinutes: 15});

      const config = useListeningStore.getState().config;
      expect(config.topic).toBe('Travel');
      expect(config.durationMinutes).toBe(15);
      expect(config.level).toBe('intermediate'); // Giữ default
      expect(config.numSpeakers).toBe(2); // Giữ default
    });
  });

  describe('Topic Selection', () => {
    const mockTopic = {
      id: 'it-1',
      name: 'Daily Stand-up Update',
      description: 'Quick report on yesterday, today, and blockers',
    };

    // MOB-LIS-MVP-HP-021: Chọn topic từ TopicPicker
    it('setSelectedTopic lưu topic và cập nhật config.topic', () => {
      useListeningStore.getState().setSelectedTopic(mockTopic, 'it', 'agile');

      const state = useListeningStore.getState();
      expect(state.selectedTopic).toEqual(mockTopic);
      expect(state.selectedCategory).toBe('it');
      expect(state.selectedSubCategory).toBe('agile');
      expect(state.config.topic).toBe('Daily Stand-up Update');
    });

    it('setSelectedTopic(null) xóa topic', () => {
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

  describe('Favorites', () => {
    // MOB-LIS-MVP-HP-023: Favorite/Star scenario
    it('toggleFavorite thêm scenario vào favorites', () => {
      useListeningStore.getState().toggleFavorite('it-1');

      expect(
        useListeningStore.getState().favoriteScenarioIds,
      ).toContain('it-1');
    });

    it('toggleFavorite xóa scenario khỏi favorites', () => {
      useListeningStore.getState().toggleFavorite('it-1');
      useListeningStore.getState().toggleFavorite('it-1');

      expect(
        useListeningStore.getState().favoriteScenarioIds,
      ).not.toContain('it-1');
    });

    it('toggleFavorite nhiều scenarios', () => {
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

  describe('Playback', () => {
    // MOB-LIS-MVP-HP-007: Play/Pause toggle
    it('togglePlaying chuyển đổi play/pause', () => {
      expect(useListeningStore.getState().isPlaying).toBe(false);

      useListeningStore.getState().togglePlaying();
      expect(useListeningStore.getState().isPlaying).toBe(true);

      useListeningStore.getState().togglePlaying();
      expect(useListeningStore.getState().isPlaying).toBe(false);
    });

    // MOB-LIS-MVP-EC-003: Tap play nhiều lần liên tục
    it('togglePlaying nhiều lần không crash, state cuối đúng', () => {
      for (let i = 0; i < 10; i++) {
        useListeningStore.getState().togglePlaying();
      }
      // 10 lần toggle → false (chẵn lần)
      expect(useListeningStore.getState().isPlaying).toBe(false);
    });

    // MOB-LIS-MVP-HP-009: Previous/Next sentence
    it('setCurrentExchangeIndex cập nhật exchange hiện tại', () => {
      useListeningStore.getState().setCurrentExchangeIndex(5);

      expect(useListeningStore.getState().currentExchangeIndex).toBe(5);
    });

    // MOB-LIS-MVP-HP-010: Speed control
    it('setPlaybackSpeed cập nhật tốc độ phát', () => {
      useListeningStore.getState().setPlaybackSpeed(1.5);

      expect(useListeningStore.getState().playbackSpeed).toBe(1.5);
    });

    // MOB-LIS-MVP-EC-002: Speed extreme values
    it('setPlaybackSpeed chấp nhận giá trị 0.5x và 2.0x', () => {
      useListeningStore.getState().setPlaybackSpeed(0.5);
      expect(useListeningStore.getState().playbackSpeed).toBe(0.5);

      useListeningStore.getState().setPlaybackSpeed(2);
      expect(useListeningStore.getState().playbackSpeed).toBe(2);
    });

    // setPlaying trực tiếp
    it('setPlaying đặt giá trị true/false', () => {
      useListeningStore.getState().setPlaying(true);
      expect(useListeningStore.getState().isPlaying).toBe(true);

      useListeningStore.getState().setPlaying(false);
      expect(useListeningStore.getState().isPlaying).toBe(false);
    });
  });

  describe('Conversation', () => {
    // MOB-LIS-MVP-HP-006: Set conversation result
    it('setConversation lưu kết quả conversation', () => {
      const mockResult = {
        conversation: [
          {speaker: 'Alice', text: 'Hello!'},
          {speaker: 'Bob', text: 'Hi there!'},
        ],
        title: 'Greetings',
        summary: 'Bài hội thoại chào hỏi',
        vocabulary: ['hello', 'greeting'],
      };

      useListeningStore.getState().setConversation(mockResult as any);

      const state = useListeningStore.getState();
      expect(state.conversation).toBeDefined();
      expect(state.conversation?.conversation).toHaveLength(2);
      expect(state.conversation?.title).toBe('Greetings');
    });

    it('setConversation(null) xóa conversation', () => {
      useListeningStore.getState().setConversation({
        conversation: [{speaker: 'A', text: 'test'}],
      } as any);
      useListeningStore.getState().setConversation(null);

      expect(useListeningStore.getState().conversation).toBeNull();
    });
  });

  describe('Audio State', () => {
    it('setAudioUrl lưu URL audio', () => {
      useListeningStore.getState().setAudioUrl('https://audio.example.com/test.mp3');
      expect(useListeningStore.getState().audioUrl).toBe('https://audio.example.com/test.mp3');
    });

    it('setAudioUrl(null) xóa audio URL', () => {
      useListeningStore.getState().setAudioUrl('https://audio.example.com/test.mp3');
      useListeningStore.getState().setAudioUrl(null);
      expect(useListeningStore.getState().audioUrl).toBeNull();
    });

    it('setGeneratingAudio cập nhật trạng thái đang sinh audio', () => {
      useListeningStore.getState().setGeneratingAudio(true);
      expect(useListeningStore.getState().isGeneratingAudio).toBe(true);

      useListeningStore.getState().setGeneratingAudio(false);
      expect(useListeningStore.getState().isGeneratingAudio).toBe(false);
    });

    it('setTimestamps lưu timestamps cho transcript sync', () => {
      const mockTimestamps = [
        {lineIndex: 0, startTime: 0, endTime: 3.5, speaker: 'Person A'},
        {lineIndex: 1, startTime: 3.5, endTime: 7.2, speaker: 'Person B'},
      ];
      useListeningStore.getState().setTimestamps(mockTimestamps);
      expect(useListeningStore.getState().timestamps).toEqual(mockTimestamps);
    });
  });

  describe('Reset', () => {
    it('reset() trả về trạng thái mặc định', () => {
      // Setup: đã có data
      useListeningStore.setState({
        config: {
          topic: 'Test',
          durationMinutes: 15,
          level: 'advanced',
          includeVietnamese: false,
          numSpeakers: 4,
          keywords: 'test keywords',
        },
        conversation: {
          conversation: [{speaker: 'A', text: 'test'}],
        } as any,
        isPlaying: true,
        currentExchangeIndex: 5,
        playbackSpeed: 1.5,
        isGenerating: true,
        selectedTopic: {id: 'it-1', name: 'Test', description: ''},
        selectedCategory: 'daily',
        favoriteScenarioIds: ['it-1', 'daily-5'],
        audioUrl: 'https://audio.example.com/test.mp3',
        isGeneratingAudio: true,
        timestamps: [{lineIndex: 0, startTime: 0, endTime: 3, speaker: 'A'}],
      });

      // Reset
      useListeningStore.getState().reset();

      const state = useListeningStore.getState();
      expect(state.config.topic).toBe('');
      expect(state.config.durationMinutes).toBe(5);
      expect(state.config.level).toBe('intermediate');
      expect(state.config.numSpeakers).toBe(2);
      expect(state.config.keywords).toBe('');
      expect(state.conversation).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.currentExchangeIndex).toBe(0);
      expect(state.playbackSpeed).toBe(1);
      expect(state.selectedTopic).toBeNull();
      expect(state.selectedCategory).toBe('it');
      expect(state.favoriteScenarioIds).toEqual([]);
      // Audio state cũng reset
      expect(state.audioUrl).toBeNull();
      expect(state.isGeneratingAudio).toBe(false);
      expect(state.timestamps).toBeNull();
    });
  });

  describe('Generating', () => {
    // MOB-LIS-MVP-HP-006: Loading state khi generate
    it('setGenerating cập nhật trạng thái loading', () => {
      useListeningStore.getState().setGenerating(true);
      expect(useListeningStore.getState().isGenerating).toBe(true);

      useListeningStore.getState().setGenerating(false);
      expect(useListeningStore.getState().isGenerating).toBe(false);
    });
  });

  describe('Defaults', () => {
    // Trạng thái mặc định
    it('trạng thái mặc định đúng khi khởi tạo', () => {
      const state = useListeningStore.getState();

      expect(state.config.topic).toBe('');
      expect(state.config.durationMinutes).toBe(5);
      expect(state.config.level).toBe('intermediate');
      expect(state.config.includeVietnamese).toBe(true);
      expect(state.config.numSpeakers).toBe(2);
      expect(state.config.keywords).toBe('');
      expect(state.conversation).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.isPlaying).toBe(false);
      expect(state.currentExchangeIndex).toBe(0);
      expect(state.playbackSpeed).toBe(1);
      expect(state.selectedTopic).toBeNull();
      expect(state.selectedCategory).toBe('it');
      expect(state.favoriteScenarioIds).toEqual([]);
      // Audio state defaults
      expect(state.audioUrl).toBeNull();
      expect(state.isGeneratingAudio).toBe(false);
      expect(state.timestamps).toBeNull();
    });
  });
});


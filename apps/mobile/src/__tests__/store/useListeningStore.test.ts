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
 */
import {useListeningStore} from '@/store/useListeningStore';

// Giá trị mặc định ban đầu
const defaultState = {
  config: {
    topic: '',
    durationMinutes: 5,
    level: 'intermediate',
    includeVietnamese: true,
  },
  conversation: null,
  isGenerating: false,
  isPlaying: false,
  currentExchangeIndex: 0,
  playbackSpeed: 1,
};

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

    // Chọn level
    it('setConfig cập nhật level', () => {
      useListeningStore.getState().setConfig({level: 'advanced'});

      expect(useListeningStore.getState().config.level).toBe('advanced');
    });

    // Merge config (không overwrite các field khác)
    it('setConfig merge đúng, không mất config cũ', () => {
      useListeningStore.getState().setConfig({topic: 'Travel'});
      useListeningStore.getState().setConfig({durationMinutes: 15});

      const config = useListeningStore.getState().config;
      expect(config.topic).toBe('Travel');
      expect(config.durationMinutes).toBe(15);
      expect(config.level).toBe('intermediate'); // Giữ default
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

  describe('Reset', () => {
    it('reset() trả về trạng thái mặc định', () => {
      // Setup: đã có data
      useListeningStore.setState({
        config: {topic: 'Test', durationMinutes: 15, level: 'advanced', includeVietnamese: false},
        conversation: {conversation: [{speaker: 'A', text: 'test'}]} as any,
        isPlaying: true,
        currentExchangeIndex: 5,
        playbackSpeed: 1.5,
        isGenerating: true,
      });

      // Reset
      useListeningStore.getState().reset();

      const state = useListeningStore.getState();
      expect(state.config.topic).toBe('');
      expect(state.config.durationMinutes).toBe(5);
      expect(state.config.level).toBe('intermediate');
      expect(state.conversation).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.currentExchangeIndex).toBe(0);
      expect(state.playbackSpeed).toBe(1);
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
      expect(state.conversation).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.isPlaying).toBe(false);
      expect(state.currentExchangeIndex).toBe(0);
      expect(state.playbackSpeed).toBe(1);
    });
  });
});

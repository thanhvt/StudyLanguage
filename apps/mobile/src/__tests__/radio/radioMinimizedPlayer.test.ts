/**
 * Test Radio Minimized Player — Transitions & Dual-mode
 *
 * Mục đích: Verify việc chuyển đổi playerMode khi rời RadioScreen
 *           và MinimizedPlayer đọc data đúng source
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — sau mỗi thay đổi liên quan minimized player
 */

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useRadioStore} from '@/store/useRadioStore';

describe('Radio Minimized Player — Transitions', () => {
  beforeEach(() => {
    // Reset cả 2 store
    useAudioPlayerStore.getState().resetPlayer();
    useRadioStore.getState().reset();
  });

  // ========================
  // activeSource management
  // ========================
  describe('activeSource quản lý nguồn audio', () => {
    it('mặc định activeSource là null', () => {
      expect(useAudioPlayerStore.getState().activeSource).toBeNull();
    });

    it('setActiveSource("radio") đặt nguồn là radio', () => {
      useAudioPlayerStore.getState().setActiveSource('radio');
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
    });

    it('setActiveSource("listening") đặt nguồn là listening', () => {
      useAudioPlayerStore.getState().setActiveSource('listening');
      expect(useAudioPlayerStore.getState().activeSource).toBe('listening');
    });

    it('setActiveSource(null) reset nguồn', () => {
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setActiveSource(null);
      expect(useAudioPlayerStore.getState().activeSource).toBeNull();
    });

    it('resetPlayer cũng reset activeSource về null', () => {
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      useAudioPlayerStore.getState().resetPlayer();
      expect(useAudioPlayerStore.getState().activeSource).toBeNull();
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });
  });

  // ========================
  // Radio blur → minimized transition
  // ========================
  describe('RadioScreen blur → minimized mode', () => {
    it('đang phát Radio + blur → playerMode = minimized', () => {
      // Arrange: Mô phỏng Radio đang phát
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Act: Mô phỏng blur logic (giống RadioScreen useFocusEffect)
      const radioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (radioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      }

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('minimized');
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
    });

    it('Radio paused + blur → playerMode vẫn là full (không minimized)', () => {
      // Arrange: Radio paused
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Act: Mô phỏng blur logic
      const radioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (radioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      }

      // Assert: Không minimized vì không đang phát
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('Radio idle + blur → playerMode hidden (back button logic)', () => {
      // Arrange: Radio idle
      useRadioStore.getState().setPlaybackState('idle');
      useAudioPlayerStore.getState().setIsPlaying(false);

      // Act: Mô phỏng back button logic
      const radioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (radioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });
  });

  // ========================
  // Feature conflict — Radio vs Listening
  // ========================
  describe('Feature conflict handling', () => {
    it('chuyển từ Listening sang Radio → activeSource đổi thành radio', () => {
      // Arrange: Listening đang phát
      useAudioPlayerStore.getState().setActiveSource('listening');
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Act: Radio bắt đầu phát → ghi đè activeSource
      useAudioPlayerStore.getState().setActiveSource('radio');

      // Assert
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
    });

    it('chuyển từ Radio sang Listening → activeSource đổi thành listening', () => {
      // Arrange: Radio đang phát
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');

      // Act: Listening bắt đầu phát
      useAudioPlayerStore.getState().setActiveSource('listening');
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Assert
      expect(useAudioPlayerStore.getState().activeSource).toBe('listening');
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });
  });

  // ========================
  // Close pill behavior
  // ========================
  describe('Close pill behavior', () => {
    it('close pill khi Radio → reset Radio store + global store', () => {
      // Arrange
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Act: Mô phỏng handleClose
      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      useAudioPlayerStore.getState().setIsPlaying(false);
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('idle');
      }
      useAudioPlayerStore.getState().resetPlayer();

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
      expect(useAudioPlayerStore.getState().activeSource).toBeNull();
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useRadioStore.getState().playbackState).toBe('idle');
    });
  });

  // ========================
  // Data source for MinimizedPlayer
  // ========================
  describe('MinimizedPlayer data source routing', () => {
    it('activeSource = radio → đọc track name từ RadioStore', () => {
      // Arrange
      const mockPlaylist = {
        playlist: {id: 'pl-1', name: 'Test Mix', description: '', duration: 30, trackCount: 2},
        items: [
          {id: 'item-1', topic: 'AI Revolution', conversation: [], duration: 15, numSpeakers: 2, category: 'it', subCategory: '', position: 0},
          {id: 'item-2', topic: 'Coffee Chat', conversation: [], duration: 15, numSpeakers: 3, category: 'daily', subCategory: '', position: 1},
        ],
      };
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      useAudioPlayerStore.getState().setActiveSource('radio');

      // Act: Mô phỏng logic MinimizedPlayer
      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      const radioStore = useRadioStore.getState();
      const topicName = isRadio
        ? (radioStore.currentPlaylist?.items[radioStore.currentTrackIndex]?.topic || 'Radio')
        : 'Bài nghe';

      // Assert
      expect(topicName).toBe('Coffee Chat');
    });

    it('activeSource = listening → trả về "Bài nghe" (fallback)', () => {
      useAudioPlayerStore.getState().setActiveSource('listening');

      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      const topicName = isRadio ? 'Radio' : 'Bài nghe';

      expect(topicName).toBe('Bài nghe');
    });

    it('Radio track numSpeakers hiển thị đúng trên pill', () => {
      const mockPlaylist = {
        playlist: {id: 'pl-2', name: 'Mix 2', description: '', duration: 60, trackCount: 1},
        items: [
          {id: 'item-3', topic: 'Tech Talk', conversation: [], duration: 60, numSpeakers: 4, category: 'it', subCategory: '', position: 0},
        ],
      };
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      useAudioPlayerStore.getState().setActiveSource('radio');

      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      const radioStore = useRadioStore.getState();
      const numSpeakers = isRadio
        ? (radioStore.currentPlaylist?.items[radioStore.currentTrackIndex]?.numSpeakers ?? 0)
        : 2;

      expect(numSpeakers).toBe(4);
    });
  });
});

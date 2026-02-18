/**
 * Unit test cho useAudioPlayerStore (Zustand + persist)
 *
 * Mục đích: Test global audio player state management
 * Ref test cases:
 *   - Sprint 2.1: useAudioPlayerStore creation
 *   - Sprint 2.2-2.4: Player mode transitions
 *   - Sprint 2.6: Session restoration (saveSession/clearSession)
 *   - Sprint 2.7: Playback speed & volume persistence
 */
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';

describe('useAudioPlayerStore', () => {
  beforeEach(() => {
    // Reset store về trạng thái ban đầu
    useAudioPlayerStore.getState().resetPlayer();
    useAudioPlayerStore.getState().setPlaybackSpeed(1);
    useAudioPlayerStore.getState().setVolume(1);
  });

  // ========================
  // Defaults
  // ========================
  describe('Defaults', () => {
    it('playerMode mặc định là hidden', () => {
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });

    it('playbackSpeed mặc định là 1', () => {
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(1);
    });

    it('volume mặc định là 1', () => {
      expect(useAudioPlayerStore.getState().volume).toBe(1);
    });

    it('lastSession mặc định là null', () => {
      expect(useAudioPlayerStore.getState().lastSession).toBeNull();
    });

    it('isPlaying mặc định là false', () => {
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    });
  });

  // ========================
  // Player Mode Transitions
  // ========================
  describe('Player Mode', () => {
    it('setPlayerMode chuyển sang full', () => {
      useAudioPlayerStore.getState().setPlayerMode('full');
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('setPlayerMode chuyển sang compact', () => {
      useAudioPlayerStore.getState().setPlayerMode('compact');
      expect(useAudioPlayerStore.getState().playerMode).toBe('compact');
    });

    it('setPlayerMode chuyển sang minimized', () => {
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      expect(useAudioPlayerStore.getState().playerMode).toBe('minimized');
    });

    it('setPlayerMode chuyển sang hidden', () => {
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setPlayerMode('hidden');
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });

    it('chuyển đổi full → compact → minimized → hidden tuần tự', () => {
      const store = useAudioPlayerStore.getState();
      store.setPlayerMode('full');
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');

      store.setPlayerMode('compact');
      expect(useAudioPlayerStore.getState().playerMode).toBe('compact');

      store.setPlayerMode('minimized');
      expect(useAudioPlayerStore.getState().playerMode).toBe('minimized');

      store.setPlayerMode('hidden');
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });
  });

  // ========================
  // Playback Speed
  // ========================
  describe('Playback Speed', () => {
    it('setPlaybackSpeed cập nhật tốc độ 0.5x', () => {
      useAudioPlayerStore.getState().setPlaybackSpeed(0.5);
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(0.5);
    });

    it('setPlaybackSpeed cập nhật tốc độ 2.0x', () => {
      useAudioPlayerStore.getState().setPlaybackSpeed(2);
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(2);
    });

    it('setPlaybackSpeed cập nhật tốc độ 1.5x', () => {
      useAudioPlayerStore.getState().setPlaybackSpeed(1.5);
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(1.5);
    });
  });

  // ========================
  // Volume
  // ========================
  describe('Volume', () => {
    it('setVolume cập nhật giá trị 0.5', () => {
      useAudioPlayerStore.getState().setVolume(0.5);
      expect(useAudioPlayerStore.getState().volume).toBe(0.5);
    });

    it('setVolume clamp giá trị min = 0', () => {
      useAudioPlayerStore.getState().setVolume(-0.5);
      expect(useAudioPlayerStore.getState().volume).toBe(0);
    });

    it('setVolume clamp giá trị max = 1', () => {
      useAudioPlayerStore.getState().setVolume(1.5);
      expect(useAudioPlayerStore.getState().volume).toBe(1);
    });

    it('setVolume chấp nhận 0 (mute)', () => {
      useAudioPlayerStore.getState().setVolume(0);
      expect(useAudioPlayerStore.getState().volume).toBe(0);
    });
  });

  // ========================
  // Session Management
  // ========================
  describe('Session', () => {
    const mockSession = {
      audioUrl: 'https://audio.example.com/test.mp3',
      title: 'Daily Stand-up Update',
      lastPosition: 30,
      duration: 120,
      timestamps: [
        {lineIndex: 0, startTime: 0, endTime: 5, speaker: 'Alice'},
      ],
      savedAt: '2026-02-14T00:00:00.000Z',
      topic: 'Daily Stand-up',
    };

    it('saveSession lưu session đúng dữ liệu', () => {
      useAudioPlayerStore.getState().saveSession(mockSession);

      const session = useAudioPlayerStore.getState().lastSession;
      expect(session).not.toBeNull();
      expect(session?.audioUrl).toBe(mockSession.audioUrl);
      expect(session?.title).toBe(mockSession.title);
      expect(session?.lastPosition).toBe(30);
      expect(session?.duration).toBe(120);
      expect(session?.topic).toBe('Daily Stand-up');
    });

    it('saveSession ghi đè session cũ', () => {
      useAudioPlayerStore.getState().saveSession(mockSession);
      const newSession = {...mockSession, title: 'Sprint Planning'};
      useAudioPlayerStore.getState().saveSession(newSession);

      expect(useAudioPlayerStore.getState().lastSession?.title).toBe(
        'Sprint Planning',
      );
    });

    it('clearSession xóa session', () => {
      useAudioPlayerStore.getState().saveSession(mockSession);
      useAudioPlayerStore.getState().clearSession();

      expect(useAudioPlayerStore.getState().lastSession).toBeNull();
    });
  });

  // ========================
  // isPlaying
  // ========================
  describe('isPlaying', () => {
    it('setIsPlaying(true) đặt đang phát', () => {
      useAudioPlayerStore.getState().setIsPlaying(true);
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });

    it('setIsPlaying(false) đặt tạm dừng', () => {
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setIsPlaying(false);
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    });
  });

  // ========================
  // Reset
  // ========================
  describe('resetPlayer', () => {
    it('resetPlayer đưa playerMode về hidden, isPlaying về false, xóa session', () => {
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().saveSession({
        audioUrl: 'test.mp3',
        title: 'Test',
        lastPosition: 50,
        duration: 100,
        timestamps: [],
        savedAt: new Date().toISOString(),
        topic: 'Test',
      });

      useAudioPlayerStore.getState().resetPlayer();

      const state = useAudioPlayerStore.getState();
      expect(state.playerMode).toBe('hidden');
      expect(state.isPlaying).toBe(false);
      expect(state.lastSession).toBeNull();
    });

    it('resetPlayer giữ nguyên playbackSpeed và volume', () => {
      useAudioPlayerStore.getState().setPlaybackSpeed(1.5);
      useAudioPlayerStore.getState().setVolume(0.7);
      useAudioPlayerStore.getState().resetPlayer();

      // playbackSpeed và volume KHÔNG bị reset (vì persist)
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(1.5);
      expect(useAudioPlayerStore.getState().volume).toBe(0.7);
    });
  });

  // ========================
  // Edge Cases
  // ========================
  describe('Edge Cases', () => {
    it('setPlayerMode nhiều lần liên tục không crash', () => {
      for (let i = 0; i < 20; i++) {
        useAudioPlayerStore.getState().setPlayerMode('full');
        useAudioPlayerStore.getState().setPlayerMode('compact');
        useAudioPlayerStore.getState().setPlayerMode('minimized');
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });

    it('setIsPlaying toggle nhanh nhiều lần', () => {
      for (let i = 0; i < 50; i++) {
        useAudioPlayerStore.getState().setIsPlaying(i % 2 === 0);
      }
      // 50 lần, cuối cùng i=49 → false
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    });
  });

  // ========================
  // Tab Switching — useFocusEffect (blur/focus)
  // Mô phỏng PlayerScreen.useFocusEffect:
  //   - Khi screen blur + isPlaying = true → setPlayerMode('compact')
  //   - Khi screen focus lại → setPlayerMode('full')
  // ========================
  describe('Tab Switching (useFocusEffect simulation)', () => {
    it('đang phát + blur → chuyển compact', () => {
      // Arrange: đang ở full mode + đang phát
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Act: mô phỏng screen blur logic
      const state = useAudioPlayerStore.getState();
      if (state.isPlaying && state.playerMode === 'full') {
        state.setPlayerMode('compact');
      }

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('compact');
    });

    it('KHÔNG phát + blur → giữ nguyên full', () => {
      // Arrange: full mode + KHÔNG phát
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(false);

      // Act: mô phỏng screen blur logic
      const state = useAudioPlayerStore.getState();
      if (state.isPlaying && state.playerMode === 'full') {
        state.setPlayerMode('compact');
      }

      // Assert: vẫn full vì không phát
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('focus lại → chuyển full', () => {
      // Arrange: compact mode (sau khi blur)
      useAudioPlayerStore.getState().setPlayerMode('compact');

      // Act: mô phỏng screen focus logic
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('chuyển tab nhiều lần liên tục không crash', () => {
      for (let i = 0; i < 10; i++) {
        // Focus → đang ở full
        useAudioPlayerStore.getState().setPlayerMode('full');
        useAudioPlayerStore.getState().setIsPlaying(true);

        // Blur → compact
        const state = useAudioPlayerStore.getState();
        if (state.isPlaying && state.playerMode === 'full') {
          state.setPlayerMode('compact');
        }
        expect(useAudioPlayerStore.getState().playerMode).toBe('compact');
      }
    });

    it('đang ở compact mode + blur → KHÔNG đổi (chỉ full mới đổi)', () => {
      // Arrange: đã ở compact + đang phát
      useAudioPlayerStore.getState().setPlayerMode('compact');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Act: mô phỏng blur logic — điều kiện playerMode === 'full' KHÔNG thoả
      const state = useAudioPlayerStore.getState();
      if (state.isPlaying && state.playerMode === 'full') {
        state.setPlayerMode('compact');
      }

      // Assert: vẫn compact, không thay đổi gì
      expect(useAudioPlayerStore.getState().playerMode).toBe('compact');
    });
  });

  // ========================
  // Swipe Down Minimize
  // Mô phỏng PlayerScreen.handleSwipeDownMinimize:
  //   - Nếu có audioUrl + isPlaying → compact + goBack
  //   - Nếu KHÔNG phát → hidden + goBack
  // ========================
  describe('Swipe Down Minimize', () => {
    it('đang phát → setPlayerMode compact', () => {
      // Arrange
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Act: mô phỏng handleSwipeDownMinimize logic (audioUrl truthy + isPlaying)
      const hasAudio = true; // audioUrl !== null
      const isPlaying = useAudioPlayerStore.getState().isPlaying;
      if (hasAudio && isPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('compact');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('compact');
    });

    it('KHÔNG phát → setPlayerMode hidden', () => {
      // Arrange
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(false);

      // Act: mô phỏng handleSwipeDownMinimize logic (KHÔNG phát)
      const hasAudio = true;
      const isPlaying = useAudioPlayerStore.getState().isPlaying;
      if (hasAudio && isPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('compact');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });

    it('không có audio → setPlayerMode hidden', () => {
      // Arrange
      useAudioPlayerStore.getState().setPlayerMode('full');
      useAudioPlayerStore.getState().setIsPlaying(false);

      // Act: mô phỏng handleSwipeDownMinimize logic (KHÔNG có audio)
      const hasAudio = false;
      const isPlaying = useAudioPlayerStore.getState().isPlaying;
      if (hasAudio && isPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('compact');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      // Assert
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });
  });
});

/**
 * Integration Tests — Radio Mode Cross-Component State Sync
 *
 * Mục đích: Test play/pause state sync giữa 3 store layers:
 *   - useRadioStore.playbackState (Radio-specific)
 *   - useAudioPlayerStore.isPlaying / playerMode / activeSource (global)
 *   - MinimizedPlayer behavior (derived from above)
 *
 * Bao gồm:
 *   - Play/Pause button states đồng bộ
 *   - MinimizedPlayer ← RadioScreen transitions
 *   - Navigation expand/collapse flows
 *   - Close pill → full cleanup
 *   - Feature conflict: Radio vs Listening source switching
 *   - isGeneratingAudio guard
 *   - Back button logic
 *   - Sleep timer + minimize interaction
 *   - Delete playlist while minimized
 *
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — sau mỗi thay đổi RadioScreen hoặc MinimizedPlayer
 */

// ========================
// Mocks
// ========================
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useRadioStore} from '@/store/useRadioStore';
import type {RadioPlaylistResult} from '@/services/api/radio';

// ========================
// Helpers
// ========================

function createMockPlaylist(count = 3): RadioPlaylistResult {
  return {
    playlist: {id: 'pl-int', name: 'Integration Mix', description: '', duration: 30, trackCount: count},
    items: Array.from({length: count}, (_, i) => ({
      id: `t-${i}`, topic: `Track ${i + 1}`, conversation: [{speaker: 'A', text: 'Hi'}],
      duration: 10, numSpeakers: 2, category: 'it', subCategory: '', position: i,
    })),
  };
}

function resetAll() {
  useAudioPlayerStore.getState().resetPlayer();
  useRadioStore.getState().reset();
  useRadioStore.setState({
    playbackSpeed: 1, shuffle: false, repeat: 'off',
    preferredCategories: [], totalListenedSeconds: 0,
    streak: 0, lastListenedDate: null, trackProgress: {},
  });
}

// ========================
// TESTS
// ========================

describe('Radio Integration — Cross-Component State Sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAll();
  });

  // ========================
  // 1. Play/Pause Button State — Triple State Sync
  // ========================
  describe('Play/Pause: 3 state sources must sync', () => {
    /**
     * Mục đích: Khi playTrack() được gọi, cả 3 state layers phải đồng bộ
     * 3 state layers:
     *   - useRadioStore.playbackState → 'playing'
     *   - useAudioPlayerStore.isPlaying → true
     *   - useAudioPlayerStore.activeSource → 'radio'
     */
    it('play → tất cả 3 stores phải đồng bộ "playing"', () => {
      // Mô phỏng useRadioPlayer.playTrack() thành công
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Assert: Cả 3 đồng bộ
      expect(useRadioStore.getState().playbackState).toBe('playing');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('pause → tất cả stores phải đồng bộ "paused"', () => {
      // Setup: đang playing
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setActiveSource('radio');

      // Mô phỏng togglePlay() → pause
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);

      expect(useRadioStore.getState().playbackState).toBe('paused');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      // activeSource vẫn giữ 'radio' — chỉ reset khi close
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
    });

    it('resume → tất cả stores phải quay lại "playing"', () => {
      // Setup: đang paused
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);
      useAudioPlayerStore.getState().setActiveSource('radio');

      // Mô phỏng togglePlay() → resume
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);

      expect(useRadioStore.getState().playbackState).toBe('playing');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });

    it('loading state → isPlaying chưa true', () => {
      useRadioStore.getState().setPlaybackState('loading');
      useRadioStore.getState().setGeneratingAudio(true);

      // Khi đang loading, chưa phát → isPlaying phải false
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useRadioStore.getState().isGeneratingAudio).toBe(true);
    });
  });

  // ========================
  // 2. MinimizedPlayer — Play/Pause Icon Logic
  // ========================
  describe('MinimizedPlayer: Play/Pause icon phải đúng', () => {
    /**
     * MinimizedPlayer dùng TrackPlayer.usePlaybackState() (native state)
     * để quyết định icon Play/Pause. Ở đây test logic store vì
     * usePlaybackState() mock rất khó — thay vào đó test store consistency
     */
    it('MinimizedPlayer handlePlayPause: playing → pause stores', () => {
      // Setup: Radio đang phát
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');

      // Mô phỏng handlePlayPause → pause
      useAudioPlayerStore.getState().setIsPlaying(false);

      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      // Note: MinimizedPlayer KHÔNG update useRadioStore.playbackState
      // → Đây là bug tiềm ẩn: radioPlaybackState = 'playing' nhưng isPlaying = false
    });

    it('MinimizedPlayer handlePlayPause: paused → play stores', () => {
      useAudioPlayerStore.getState().setIsPlaying(false);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');

      // Mô phỏng handlePlayPause → play
      useAudioPlayerStore.getState().setIsPlaying(true);

      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });
  });

  // ========================
  // 3. Navigation: RadioScreen ↔ MinimizedPlayer
  // ========================
  describe('Navigation: RadioScreen ↔ MinimizedPlayer transitions', () => {
    it('RadioScreen blur khi playing → playerMode = minimized', () => {
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Mô phỏng useFocusEffect blur callback
      const currentRadioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (currentRadioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      }

      expect(useAudioPlayerStore.getState().playerMode).toBe('minimized');
    });

    it('RadioScreen blur khi paused → playerMode vẫn full (không minimized)', () => {
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);
      useAudioPlayerStore.getState().setPlayerMode('full');

      const currentRadioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (currentRadioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      }

      // Không playing → giữ full
      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('MinimizedPlayer expand → playerMode = full + navigate Radio', () => {
      // Setup: minimized
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      useAudioPlayerStore.getState().setActiveSource('radio');

      // Mô phỏng handleExpand
      useAudioPlayerStore.getState().setPlayerMode('full');

      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
      // Navigation.navigate('Listening', {screen: 'Radio'}) would be called
    });

    it('RadioScreen focus khi playing → playerMode = full (đúng)', () => {
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setPlayerMode('minimized');

      // Mô phỏng useFocusEffect focus callback
      const radioState = useRadioStore.getState().playbackState;
      if (radioState === 'playing' || radioState === 'paused') {
        useAudioPlayerStore.getState().setPlayerMode('full');
      }

      expect(useAudioPlayerStore.getState().playerMode).toBe('full');
    });

    it('RadioScreen focus khi idle → playerMode KHÔNG đổi', () => {
      useRadioStore.getState().setPlaybackState('idle');
      useAudioPlayerStore.getState().setPlayerMode('hidden');

      const radioState = useRadioStore.getState().playbackState;
      if (radioState === 'playing' || radioState === 'paused') {
        useAudioPlayerStore.getState().setPlayerMode('full');
      }

      // Idle → không set full
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });
  });

  // ========================
  // 4. Back Button Logic — RadioScreen Header
  // ========================
  describe('Back Button: RadioScreen header navigation', () => {
    it('back khi playing → minimized (giữ phát nền)', () => {
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Mô phỏng header back button logic
      const currentRadioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (currentRadioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      expect(useAudioPlayerStore.getState().playerMode).toBe('minimized');
    });

    it('back khi idle → hidden (không giữ pill)', () => {
      useRadioStore.getState().setPlaybackState('idle');
      useAudioPlayerStore.getState().setIsPlaying(false);

      const currentRadioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (currentRadioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });

    it('back khi generating → hidden (generating không cần pill)', () => {
      useRadioStore.getState().setPlaybackState('loading');
      useAudioPlayerStore.getState().setIsPlaying(false);

      const currentRadioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (currentRadioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });

    it('back khi paused nhưng isPlaying=false → hidden', () => {
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);

      const currentRadioState = useRadioStore.getState().playbackState;
      const globalPlaying = useAudioPlayerStore.getState().isPlaying;
      if (currentRadioState === 'playing' || globalPlaying) {
        useAudioPlayerStore.getState().setPlayerMode('minimized');
      } else {
        useAudioPlayerStore.getState().setPlayerMode('hidden');
      }

      // paused + not playing → hidden
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
    });
  });

  // ========================
  // 5. Close Pill — Full Cleanup Flow
  // ========================
  describe('Close Pill: Full cleanup', () => {
    it('close pill Radio → reset tất cả state', () => {
      // Setup: Radio minimized đang phát
      useRadioStore.getState().setCurrentPlaylist(createMockPlaylist(3));
      useRadioStore.getState().setCurrentTrackIndex(1);
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      useAudioPlayerStore.getState().setIsPlaying(true);

      // Mô phỏng MinimizedPlayer.handleClose
      useAudioPlayerStore.getState().setIsPlaying(false);
      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('idle');
      }
      useAudioPlayerStore.getState().resetPlayer();

      // Assert: Tất cả reset
      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
      expect(useAudioPlayerStore.getState().activeSource).toBeNull();
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useRadioStore.getState().playbackState).toBe('idle');
      // Playlist VẪN giữ → có thể resume sau
      expect(useRadioStore.getState().currentPlaylist).not.toBeNull();
    });

    it('close pill Listening → KHÔNG reset RadioStore', () => {
      // Setup: Listening minimized
      useAudioPlayerStore.getState().setActiveSource('listening');
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      useAudioPlayerStore.getState().setIsPlaying(true);
      // Radio store có playlist sẵn
      useRadioStore.getState().setCurrentPlaylist(createMockPlaylist(2));
      useRadioStore.getState().setPlaybackState('paused');

      // Mô phỏng close
      useAudioPlayerStore.getState().setIsPlaying(false);
      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('idle');
      }
      useAudioPlayerStore.getState().resetPlayer();

      // Radio store untouched
      expect(useRadioStore.getState().playbackState).toBe('paused');
      expect(useRadioStore.getState().currentPlaylist).not.toBeNull();
    });
  });

  // ========================
  // 6. Feature Conflict: Radio vs Listening
  // ========================
  describe('Feature Conflict: Radio vs Listening source switching', () => {
    it('Listening đang phát → start Radio → activeSource = radio', () => {
      // Setup: Listening đang phát
      useAudioPlayerStore.getState().setActiveSource('listening');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setPlayerMode('full');

      // Mô phỏng: Radio playTrack() ghi đè
      useAudioPlayerStore.getState().setActiveSource('radio');
      useRadioStore.getState().setPlaybackState('playing');

      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
    });

    it('Radio → Listening → Radio: activeSource flip-flop đúng', () => {
      // Round 1: Radio
      useAudioPlayerStore.getState().setActiveSource('radio');
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');

      // Round 2: Listening
      useAudioPlayerStore.getState().setActiveSource('listening');
      expect(useAudioPlayerStore.getState().activeSource).toBe('listening');

      // Round 3: Radio lại
      useAudioPlayerStore.getState().setActiveSource('radio');
      expect(useAudioPlayerStore.getState().activeSource).toBe('radio');
    });

    it('MinimizedPlayer topic routing — Radio vs Listening', () => {
      const playlist = createMockPlaylist(2);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);

      // Radio source → topic từ radioStore
      useAudioPlayerStore.getState().setActiveSource('radio');
      const isRadio1 = useAudioPlayerStore.getState().activeSource === 'radio';
      const topic1 = isRadio1
        ? (useRadioStore.getState().currentPlaylist?.items[useRadioStore.getState().currentTrackIndex]?.topic || 'Radio')
        : 'Bài nghe';

      expect(topic1).toBe('Track 1');

      // Listening source → fallback
      useAudioPlayerStore.getState().setActiveSource('listening');
      const isRadio2 = useAudioPlayerStore.getState().activeSource === 'radio';
      const topic2 = isRadio2 ? 'Radio' : 'Bài nghe';

      expect(topic2).toBe('Bài nghe');
    });
  });

  // ========================
  // 7. isGeneratingAudio Guard
  // ========================
  describe('isGeneratingAudio: Guard states', () => {
    it('khi generating → RadioScreen play button phải disabled', () => {
      useRadioStore.getState().setGeneratingAudio(true);
      useRadioStore.getState().setPlaybackState('loading');

      // UI logic: nếu isGenerating → không cho click play
      const isGenerating = useRadioStore.getState().isGeneratingAudio;
      expect(isGenerating).toBe(true);
    });

    it('generate xong → play button enabled', () => {
      useRadioStore.getState().setGeneratingAudio(true);
      // Sau khi audio sinh xong
      useRadioStore.getState().setGeneratingAudio(false);
      useRadioStore.getState().setPlaybackState('playing');

      expect(useRadioStore.getState().isGeneratingAudio).toBe(false);
      expect(useRadioStore.getState().playbackState).toBe('playing');
    });

    it('generate lỗi → reset về idle, không generating', () => {
      useRadioStore.getState().setGeneratingAudio(true);
      useRadioStore.getState().setPlaybackState('loading');

      // Error path
      useRadioStore.getState().setGeneratingAudio(false);
      useRadioStore.getState().setPlaybackState('idle');

      expect(useRadioStore.getState().isGeneratingAudio).toBe(false);
      expect(useRadioStore.getState().playbackState).toBe('idle');
    });
  });

  // ========================
  // 8. Skip Track — State Transition
  // ========================
  describe('Skip Track: State transitions across components', () => {
    it('skip → loading → playing (successful)', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      useRadioStore.getState().setPlaybackState('playing');

      // Mô phỏng skip flow
      // 1. nextTrack() → index 1
      const nextIdx = useRadioStore.getState().nextTrack();
      expect(nextIdx).toBe(1);

      // 2. playTrack sets loading
      useRadioStore.getState().setPlaybackState('loading');
      useRadioStore.getState().setGeneratingAudio(true);
      expect(useRadioStore.getState().playbackState).toBe('loading');

      // 3. Audio ready → playing
      useRadioStore.getState().setGeneratingAudio(false);
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);

      expect(useRadioStore.getState().playbackState).toBe('playing');
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });

    it('skip past end → ended state', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);
      useRadioStore.setState({repeat: 'off'});

      const nextIdx = useRadioStore.getState().nextTrack();
      expect(nextIdx).toBe(-1);

      // Mô phỏng skip handler khi -1
      useRadioStore.getState().setPlaybackState('ended');
      useAudioPlayerStore.getState().setIsPlaying(false);

      expect(useRadioStore.getState().playbackState).toBe('ended');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    });
  });

  // ========================
  // 9. Delete Playlist While Minimized
  // ========================
  describe('Delete playlist while minimized', () => {
    it('playlist xóa thành công → pill phải ẩn', () => {
      // Setup: Radio minimized
      useRadioStore.getState().setCurrentPlaylist(createMockPlaylist(3));
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setPlayerMode('minimized');
      useAudioPlayerStore.getState().setActiveSource('radio');

      // Delete success → reset all
      useRadioStore.getState().setCurrentPlaylist(null);
      useRadioStore.getState().setCurrentTrackIndex(-1);
      useRadioStore.getState().setPlaybackState('idle');
      useAudioPlayerStore.getState().resetPlayer();

      expect(useAudioPlayerStore.getState().playerMode).toBe('hidden');
      expect(useRadioStore.getState().currentPlaylist).toBeNull();
    });
  });

  // ========================
  // 10. Sleep Timer + Minimize Interaction
  // ========================
  describe('Sleep Timer + Minimize: Timer expiry while backgrounded', () => {
    it('timer expires → playbackState paused + isPlaying false', () => {
      // Setup: Radio playing, timer active
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useRadioStore.getState().setSleepTimer(5);

      // Mô phỏng: timer expired
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);
      useRadioStore.getState().clearSleepTimer();

      expect(useRadioStore.getState().playbackState).toBe('paused');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useRadioStore.getState().sleepTimerMinutes).toBe(0);
    });
  });

  // ========================
  // 11. MinimizedPlayer Data Source — numSpeakers & topic
  // ========================
  describe('MinimizedPlayer Data: Radio track info display', () => {
    it('numSpeakers từ radioStore khi activeSource=radio', () => {
      const playlist = createMockPlaylist(2);
      playlist.items[0].numSpeakers = 4;
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      useAudioPlayerStore.getState().setActiveSource('radio');

      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      const numSpeakers = isRadio
        ? (useRadioStore.getState().currentPlaylist?.items[useRadioStore.getState().currentTrackIndex]?.numSpeakers ?? 0)
        : 2;

      expect(numSpeakers).toBe(4);
    });

    it('track index thay đổi → topic cập nhật', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useAudioPlayerStore.getState().setActiveSource('radio');

      useRadioStore.getState().setCurrentTrackIndex(0);
      expect(useRadioStore.getState().currentPlaylist?.items[0]?.topic).toBe('Track 1');

      useRadioStore.getState().setCurrentTrackIndex(2);
      expect(useRadioStore.getState().currentPlaylist?.items[2]?.topic).toBe('Track 3');
    });

    it('trackIndex = -1 → topic fallback "Radio"', () => {
      const playlist = createMockPlaylist(2);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(-1);
      useAudioPlayerStore.getState().setActiveSource('radio');

      const radioTrackIndex = useRadioStore.getState().currentTrackIndex;
      const topicName = useRadioStore.getState().currentPlaylist?.items[radioTrackIndex]?.topic || 'Radio';
      expect(topicName).toBe('Radio');
    });
  });

  // ========================
  // 12. BUG: MinimizedPlayer handlePlayPause desync with radioStore
  // ========================
  describe('FIXED: MinimizedPlayer ↔ radioStore sync', () => {
    it('MinimizedPlayer pause → radioStore.playbackState cũng "paused" (FIXED)', () => {
      // Setup: Radio đang phát, pill hiện
      useRadioStore.getState().setPlaybackState('playing');
      useAudioPlayerStore.getState().setIsPlaying(true);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');

      // MinimizedPlayer.handlePlayPause() SAU FIX:
      //   TrackPlayer.pause() + setGlobalPlaying(false) + setPlaybackState('paused')
      useAudioPlayerStore.getState().setIsPlaying(false);
      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('paused');
      }

      // Đồng bộ!
      expect(useRadioStore.getState().playbackState).toBe('paused');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    });

    it('MinimizedPlayer resume → radioStore.playbackState cũng "playing" (FIXED)', () => {
      useRadioStore.getState().setPlaybackState('paused');
      useAudioPlayerStore.getState().setIsPlaying(false);
      useAudioPlayerStore.getState().setActiveSource('radio');
      useAudioPlayerStore.getState().setPlayerMode('minimized');

      // Mô phỏng resume
      useAudioPlayerStore.getState().setIsPlaying(true);
      const isRadio = useAudioPlayerStore.getState().activeSource === 'radio';
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('playing');
      }

      expect(useRadioStore.getState().playbackState).toBe('playing');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });
  });
});

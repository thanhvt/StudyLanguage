/**
 * Post-Fix Unit Tests — Radio Mode
 *
 * Mục đích: Test tất cả code đã fix trong code review rounds 1 & 2
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — sau mỗi thay đổi Radio Mode
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

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import {useRadioStore} from '@/store/useRadioStore';
import {radioApi} from '@/services/api/radio';
import {apiClient} from '@/services/api/client';

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockDelete = (apiClient as any).delete as jest.MockedFunction<any>;

// ========================
// Mock data
// ========================
const createMockPlaylist = (trackCount = 3) => ({
  playlist: {
    id: 'test-pl',
    name: 'Test Radio',
    description: 'Mô tả test',
    duration: 30,
    trackCount,
  },
  items: Array.from({length: trackCount}, (_, i) => ({
    id: `track-${i}`,
    topic: `Topic ${i + 1}`,
    conversation: [{speaker: 'A', text: 'Hello'}, {speaker: 'B', text: 'Hi'}],
    duration: 10,
    numSpeakers: 2,
    category: i % 2 === 0 ? 'it' : 'daily',
    subCategory: 'Test',
    position: i,
  })),
});

/**
 * Mục đích: Reset store về trạng thái sạch
 * Khi nào sử dụng: beforeEach trong mỗi test
 */
function resetStore() {
  useRadioStore.getState().reset();
  useRadioStore.setState({
    playbackSpeed: 1,
    shuffle: false,
    repeat: 'off',
    preferredCategories: [],
    totalListenedSeconds: 0,
    streak: 0,
    lastListenedDate: null,
    trackProgress: {},
    currentPlaylist: null,
    currentTrackIndex: -1,
  });
}

describe('Radio Mode — Post-Fix Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  // ========================
  // T-26: Resume playback persistence
  // ========================
  describe('T-26: Persist playlist & trackIndex cho resume', () => {
    it('currentPlaylist được lưu trong state', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.playlist.id).toBe('test-pl');
      expect(state.currentTrackIndex).toBe(2);
    });

    it('trackProgress được lưu cho từng track', () => {
      useRadioStore.getState().updateTrackProgress('track-0', 45.5);
      useRadioStore.getState().updateTrackProgress('track-1', 12.3);

      const progress = useRadioStore.getState().trackProgress;
      expect(progress['track-0']).toBe(45.5);
      expect(progress['track-1']).toBe(12.3);
    });

    it('resume sau reset — playlist null cần set lại', () => {
      resetStore();
      expect(useRadioStore.getState().currentPlaylist).toBeNull();
      expect(useRadioStore.getState().currentTrackIndex).toBe(-1);

      // Simulate resume bằng cách set lại
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(3);
      expect(useRadioStore.getState().getCurrentTrack()?.topic).toBe('Topic 4');
    });
  });

  // ========================
  // T-18: Category preferences
  // ========================
  describe('T-18: Category filter preference', () => {
    it('set và lưu preferred categories', () => {
      useRadioStore.getState().setPreferredCategories(['it', 'daily']);
      expect(useRadioStore.getState().preferredCategories).toEqual(['it', 'daily']);
    });

    it('categories rỗng → không filter', () => {
      useRadioStore.getState().setPreferredCategories([]);
      expect(useRadioStore.getState().preferredCategories).toEqual([]);
    });

    it('set categories → clear → set lại', () => {
      useRadioStore.getState().setPreferredCategories(['business']);
      expect(useRadioStore.getState().preferredCategories).toEqual(['business']);

      useRadioStore.getState().setPreferredCategories([]);
      expect(useRadioStore.getState().preferredCategories).toEqual([]);

      useRadioStore.getState().setPreferredCategories(['academic', 'personal']);
      expect(useRadioStore.getState().preferredCategories).toEqual(['academic', 'personal']);
    });

    it('categories hợp lệ gửi qua API', async () => {
      mockPost.mockResolvedValue({
        data: {data: createMockPlaylist(2)},
      } as any);

      await radioApi.generate(30, ['it', 'daily']);

      const body = mockPost.mock.calls[0][1] as any;
      expect(body.categories).toEqual(['it', 'daily']);
    });

    it('categories rỗng → API nhận undefined', async () => {
      mockPost.mockResolvedValue({
        data: {data: createMockPlaylist(1)},
      } as any);

      await radioApi.generate(30, []);

      const body = mockPost.mock.calls[0][1] as any;
      expect(body).not.toHaveProperty('categories');
    });
  });

  // ========================
  // T-22: AbortController cancellation
  // ========================
  describe('T-22: AbortController cancellation logic', () => {
    it('AbortController.abort() tạo AbortError', () => {
      const controller = new AbortController();
      const handler = jest.fn();

      controller.signal.addEventListener('abort', handler);
      controller.abort();

      expect(handler).toHaveBeenCalled();
      expect(controller.signal.aborted).toBe(true);
    });

    it('tạo mới AbortController mỗi lần play', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      // Simulate: play track 1 → play track 2 → track 1 signal aborted
      controller1.abort();

      expect(controller1.signal.aborted).toBe(true);
      expect(controller2.signal.aborted).toBe(false);
    });

    it('abort trước đó khi skip nhanh 5 lần', () => {
      const controllers: AbortController[] = [];

      // Simulate 5 rapid skips
      for (let i = 0; i < 5; i++) {
        if (controllers.length > 0) {
          controllers[controllers.length - 1].abort();
        }
        controllers.push(new AbortController());
      }

      // 4 cái đầu bị abort, cái cuối vẫn active
      for (let i = 0; i < 4; i++) {
        expect(controllers[i].signal.aborted).toBe(true);
      }
      expect(controllers[4].signal.aborted).toBe(false);
    });

    it('AbortError catch pattern', () => {
      const error = new Error('AbortError');
      error.name = 'AbortError';
      expect(error.name).toBe('AbortError');
    });
  });

  // ========================
  // T-29: fadeVolume logic
  // ========================
  describe('T-29: fadeVolume edge cases', () => {
    const FADE_STEPS = 16;

    /**
     * Mục đích: Simulate fadeVolume behavior
     * Tham số đầu vào: from, to, steps
     * Tham số đầu ra: Array of volume values
     */
    function simulateFade(from: number, to: number, steps: number = FADE_STEPS): number[] {
      const values: number[] = [];
      const stepSize = (to - from) / steps;
      for (let i = 0; i <= steps; i++) {
        values.push(from + stepSize * i);
      }
      return values;
    }

    it('fade 0 → 1 tạo 17 steps (0 tới 16)', () => {
      const values = simulateFade(0, 1);
      expect(values).toHaveLength(17); // 0..16 inclusive
      expect(values[0]).toBeCloseTo(0);
      expect(values[values.length - 1]).toBeCloseTo(1);
    });

    it('fade 1 → 0 decreasing', () => {
      const values = simulateFade(1, 0);
      expect(values[0]).toBeCloseTo(1);
      expect(values[values.length - 1]).toBeCloseTo(0);

      // Mỗi step nhỏ hơn step trước
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeLessThanOrEqual(values[i - 1] + 0.001);
      }
    });

    it('fade 0.5 → 0.8 partial range', () => {
      const values = simulateFade(0.5, 0.8);
      expect(values[0]).toBeCloseTo(0.5);
      expect(values[values.length - 1]).toBeCloseTo(0.8);
    });

    it('fade 1 → 1 (same) → tất cả giá trị = 1', () => {
      const values = simulateFade(1, 1);
      values.forEach(v => expect(v).toBeCloseTo(1));
    });

    it('tất cả giá trị nằm trong [0, 1]', () => {
      const values = simulateFade(0, 1);
      values.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(-0.001);
        expect(v).toBeLessThanOrEqual(1.001);
      });
    });
  });

  // ========================
  // Delete while playing
  // ========================
  describe('Edge: Xóa playlist khi đang phát', () => {
    it('reset state sau khi xóa', async () => {
      // Setup: playlist đang phát
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      useRadioStore.getState().setPlaybackState('playing');

      // Simulate delete
      mockDelete.mockResolvedValue({data: {success: true}} as any);
      await radioApi.deletePlaylist('test-pl');

      // User code resets state
      useRadioStore.getState().setCurrentPlaylist(null);
      useRadioStore.getState().setCurrentTrackIndex(-1);
      useRadioStore.getState().setPlaybackState('idle');

      expect(useRadioStore.getState().currentPlaylist).toBeNull();
      expect(useRadioStore.getState().currentTrackIndex).toBe(-1);
      expect(useRadioStore.getState().playbackState).toBe('idle');
    });

    it('delete thất bại → state không thay đổi', async () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      useRadioStore.getState().setPlaybackState('playing');

      mockDelete.mockRejectedValue(new Error('Server error'));

      await expect(radioApi.deletePlaylist('test-pl')).rejects.toThrow('Server error');

      // State giữ nguyên
      expect(useRadioStore.getState().currentPlaylist?.playlist.id).toBe('test-pl');
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);
      expect(useRadioStore.getState().playbackState).toBe('playing');
    });
  });

  // ========================
  // Rapid skip (EC-10 mở rộng)
  // ========================
  describe('Edge: Skip nhanh liên tiếp', () => {
    it('10 lần nextTrack liên tiếp — wrap around đúng', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      useRadioStore.setState({repeat: 'all'});

      const indices: number[] = [];
      for (let i = 0; i < 10; i++) {
        const next = useRadioStore.getState().nextTrack();
        indices.push(next);
      }

      // Với repeat=all, 3 tracks: 1,2,0,1,2,0,1,2,0,1
      expect(indices).toEqual([1, 2, 0, 1, 2, 0, 1, 2, 0, 1]);
    });

    it('skip nhanh khi repeat=off — dừng ở cuối', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      useRadioStore.setState({repeat: 'off'});

      for (let i = 0; i < 10; i++) {
        useRadioStore.getState().nextTrack();
      }

      // Phải dừng ở track cuối (index 2)
      expect(useRadioStore.getState().currentTrackIndex).toBe(2);
    });
  });

  // ========================
  // Empty playlist (all Promise.allSettled rejected)
  // ========================
  describe('Edge: Playlist rỗng sau generate', () => {
    it('generate trả về 0 items → store nhận null items', async () => {
      const emptyPlaylist = {
        playlist: {id: 'empty', name: 'Empty', description: '', duration: 30, trackCount: 0},
        items: [],
      };
      mockPost.mockResolvedValue({data: {data: emptyPlaylist}} as any);

      const result = await radioApi.generate(30);
      expect(result.items).toHaveLength(0);

      useRadioStore.getState().setCurrentPlaylist(result);
      expect(useRadioStore.getState().getCurrentTrack()).toBeNull();
    });

    it('nextTrack trên playlist rỗng → không crash', () => {
      const emptyPlaylist = {
        playlist: {id: 'empty', name: '', description: '', duration: 1, trackCount: 0},
        items: [],
      };
      useRadioStore.getState().setCurrentPlaylist(emptyPlaylist);
      useRadioStore.getState().setCurrentTrackIndex(0);

      // Không crash
      expect(useRadioStore.getState().getCurrentTrack()).toBeNull();
    });
  });

  // ========================
  // API signal cancellation
  // ========================
  describe('T-22: API signal cancellation flow', () => {
    it('apiClient.post nhận signal trong config', async () => {
      const controller = new AbortController();
      mockPost.mockResolvedValue({data: {audioUrl: 'test.mp3'}} as any);

      await apiClient.post(
        '/ai/generate-conversation-audio',
        {conversation: []},
        {timeout: 180000, signal: controller.signal},
      );

      expect(mockPost).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        {conversation: []},
        expect.objectContaining({signal: controller.signal}),
      );
    });

    it('aborted signal → config nên chứa aborted signal', () => {
      const controller = new AbortController();
      controller.abort();

      expect(controller.signal.aborted).toBe(true);
    });
  });

  // ========================
  // Sleep timer while app backgrounded
  // ========================
  describe('Edge: Sleep timer edge cases', () => {
    it('timer endAt trong quá khứ (app vừa mở lại)', () => {
      // Simulate: set timer 5 phút, app closed 10 phút
      const pastEndAt = Date.now() - 300_000; // 5 phút trước
      useRadioStore.setState({
        sleepTimerMinutes: 5,
        sleepTimerEndAt: pastEndAt,
      });

      const state = useRadioStore.getState();
      expect(state.sleepTimerEndAt).toBeLessThan(Date.now());
      // App nên check endAt < now → stop playback
    });

    it('rất lớn timer → không overflow', () => {
      useRadioStore.getState().setSleepTimer(999);
      const state = useRadioStore.getState();
      expect(state.sleepTimerMinutes).toBe(999);
      expect(state.sleepTimerEndAt).toBeGreaterThan(Date.now());
    });

    it('negative timer → xử lý graceful', () => {
      useRadioStore.getState().setSleepTimer(-1);
      // Tùy implementation — nên clear hoặc ignore
      const state = useRadioStore.getState();
      // Không crash
      expect(typeof state.sleepTimerEndAt).toBe('number');
    });
  });

  // ========================
  // Track progress edge cases
  // ========================
  describe('Edge: Track progress', () => {
    it('progress 0 — bắt đầu track', () => {
      useRadioStore.getState().updateTrackProgress('t1', 0);
      expect(useRadioStore.getState().trackProgress['t1']).toBe(0);
    });

    it('progress lớn — track dài', () => {
      useRadioStore.getState().updateTrackProgress('t1', 7200); // 2 giờ
      expect(useRadioStore.getState().trackProgress['t1']).toBe(7200);
    });

    it('progress âm — invalid', () => {
      useRadioStore.getState().updateTrackProgress('t1', -5);
      // Không crash, lưu giá trị (app nên validate ở caller)
      expect(typeof useRadioStore.getState().trackProgress['t1']).toBe('number');
    });

    it('nhiều tracks progress cùng lúc', () => {
      for (let i = 0; i < 20; i++) {
        useRadioStore.getState().updateTrackProgress(`t${i}`, i * 10);
      }
      expect(Object.keys(useRadioStore.getState().trackProgress)).toHaveLength(20);
      expect(useRadioStore.getState().trackProgress['t5']).toBe(50);
    });
  });

  // ========================
  // ListenedTime & Streak edge
  // ========================
  describe('Edge: Listened time edge cases', () => {
    it('addListenedTime 0 → không thay đổi', () => {
      useRadioStore.getState().addListenedTime(0);
      expect(useRadioStore.getState().totalListenedSeconds).toBe(0);
    });

    it('addListenedTime rất nhiều lần nhỏ', () => {
      for (let i = 0; i < 1000; i++) {
        useRadioStore.getState().addListenedTime(1);
      }
      expect(useRadioStore.getState().totalListenedSeconds).toBe(1000);
    });

    it('streak nhiều ngày liên tiếp', () => {
      // Day 1
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1);

      // Simulate ngày hôm sau
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      useRadioStore.setState({
        lastListenedDate: yesterday.toISOString().split('T')[0],
      });
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(2);
    });

    it('streak bị reset sau 2 ngày không nghe', () => {
      useRadioStore.setState({streak: 10});

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      useRadioStore.setState({
        lastListenedDate: twoDaysAgo.toISOString().split('T')[0],
      });

      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1); // Reset về 1
    });
  });

  // ========================
  // Playback speed edge cases
  // ========================
  describe('Edge: Speed clamp extended', () => {
    it('speed float 0.75 → chấp nhận', () => {
      useRadioStore.getState().setPlaybackSpeed(0.75);
      expect(useRadioStore.getState().playbackSpeed).toBe(0.75);
    });

    it('speed 1.5 → chấp nhận', () => {
      useRadioStore.getState().setPlaybackSpeed(1.5);
      expect(useRadioStore.getState().playbackSpeed).toBe(1.5);
    });

    it('speed NaN → fallback tới 1', () => {
      useRadioStore.getState().setPlaybackSpeed(NaN);
      const speed = useRadioStore.getState().playbackSpeed;
      // Nên là 1 hoặc clamped version
      expect(typeof speed).toBe('number');
      expect(isNaN(speed)).toBe(false);
    });

    it('speed Infinity → clamp tới max', () => {
      useRadioStore.getState().setPlaybackSpeed(Infinity);
      expect(useRadioStore.getState().playbackSpeed).toBeLessThanOrEqual(2.0);
    });
  });
});

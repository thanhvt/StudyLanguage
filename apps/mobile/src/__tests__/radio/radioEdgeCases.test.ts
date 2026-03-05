/**
 * Edge Case + Integration Tests cho Radio Mode
 *
 * Mục đích: Test các trường hợp biên, race conditions, network failures
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — test edge cases mỗi release
 */

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

import {radioApi} from '@/services/api/radio';
import {useRadioStore} from '@/store/useRadioStore';
import {apiClient} from '@/services/api/client';

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPut = (apiClient as any).put as jest.MockedFunction<any>;

describe('Radio Mode — Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    });
  });

  // ========================
  // EC-01: Network failures
  // ========================
  describe('EC-01: Network thất bại', () => {
    it('generate thất bại → throw error', async () => {
      mockPost.mockRejectedValue(new Error('Network Error'));
      await expect(radioApi.generate(30)).rejects.toThrow('Network Error');
    });

    it('getPlaylists thất bại → throw error', async () => {
      mockGet.mockRejectedValue(new Error('Timeout'));
      await expect(radioApi.getPlaylists()).rejects.toThrow('Timeout');
    });

    it('updateTrackAudio thất bại → throw error', async () => {
      mockPut.mockRejectedValue(new Error('502 Bad Gateway'));
      await expect(
        radioApi.updateTrackAudio('pl-1', 'item-1', 'https://audio.test'),
      ).rejects.toThrow('502 Bad Gateway');
    });
  });

  // ========================
  // EC-02: Empty playlist
  // ========================
  describe('EC-02: Playlist rỗng', () => {
    it('generate trả về 0 items', async () => {
      mockPost.mockResolvedValue({
        data: {data: {playlist: {id: 'p', name: '', description: '', duration: 1, trackCount: 0}, items: []}},
      } as any);

      const result = await radioApi.generate(1);
      expect(result.items).toHaveLength(0);
    });

    it('nextTrack trên playlist rỗng → -1', () => {
      useRadioStore.getState().setCurrentPlaylist({
        playlist: {id: 'p', name: '', description: '', duration: 0, trackCount: 0},
        items: [],
      });
      useRadioStore.getState().setCurrentTrackIndex(0);
      expect(useRadioStore.getState().nextTrack()).toBe(-1);
    });

    it('getCurrentTrack trên playlist rỗng → null', () => {
      useRadioStore.getState().setCurrentPlaylist({
        playlist: {id: 'p', name: '', description: '', duration: 0, trackCount: 0},
        items: [],
      });
      useRadioStore.getState().setCurrentTrackIndex(0);
      expect(useRadioStore.getState().getCurrentTrack()).toBeNull();
    });
  });

  // ========================
  // EC-03: Single track playlist
  // ========================
  describe('EC-03: 1 track duy nhất', () => {
    const singlePlaylist = {
      playlist: {id: 'p', name: 'Solo', description: '', duration: 1, trackCount: 1},
      items: [{id: 'solo', topic: 'Solo', conversation: [], duration: 1, numSpeakers: 2, category: 'it', subCategory: '', position: 0}],
    };

    it('nextTrack → -1 (hết)', () => {
      useRadioStore.getState().setCurrentPlaylist(singlePlaylist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      expect(useRadioStore.getState().nextTrack()).toBe(-1);
    });

    it('repeat=one → giữ track 0', () => {
      useRadioStore.setState({repeat: 'one'});
      useRadioStore.getState().setCurrentPlaylist(singlePlaylist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      expect(useRadioStore.getState().nextTrack()).toBe(0);
    });

    it('repeat=all → quay lại 0', () => {
      useRadioStore.setState({repeat: 'all'});
      useRadioStore.getState().setCurrentPlaylist(singlePlaylist);
      useRadioStore.getState().setCurrentTrackIndex(0);
      expect(useRadioStore.getState().nextTrack()).toBe(0);
    });
  });

  // ========================
  // EC-04: Duration boundaries
  // ========================
  describe('EC-04: Duration boundaries', () => {
    it('duration 1 phút', async () => {
      mockPost.mockResolvedValue({
        data: {data: {playlist: {id: 'p', name: '', description: '', duration: 1, trackCount: 1}, items: [{id: '1', topic: 'Quick', conversation: [], duration: 1, numSpeakers: 2, category: 'it', subCategory: '', position: 0}]}},
      } as any);

      const result = await radioApi.generate(1);
      expect(result.playlist.duration).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('duration 120 phút (marathon)', async () => {
      const longItems = Array.from({length: 17}, (_, i) => ({
        id: `t-${i}`, topic: `Topic ${i}`, conversation: [], duration: 7,
        numSpeakers: 2, category: 'it', subCategory: '', position: i,
      }));
      mockPost.mockResolvedValue({
        data: {data: {playlist: {id: 'p', name: '', description: '', duration: 120, trackCount: 17}, items: longItems}},
      } as any);

      const result = await radioApi.generate(120);
      expect(result.playlist.duration).toBe(120);
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  // ========================
  // EC-05: Categories edge cases
  // ========================
  describe('EC-05: Categories', () => {
    it('categories undefined → không gửi trong body', async () => {
      mockPost.mockResolvedValue({data: {data: {playlist: {id: 'p', name: '', description: '', duration: 1, trackCount: 0}, items: []}}} as any);

      await radioApi.generate(30, undefined);
      const body = mockPost.mock.calls[0][1];
      expect(body).not.toHaveProperty('categories');
    });

    it('categories empty → không gửi trong body', async () => {
      mockPost.mockResolvedValue({data: {data: {playlist: {id: 'p', name: '', description: '', duration: 1, trackCount: 0}, items: []}}} as any);

      await radioApi.generate(30, []);
      const body = mockPost.mock.calls[0][1];
      expect(body).not.toHaveProperty('categories');
    });

    it('categories hợp lệ → gửi trong body', async () => {
      mockPost.mockResolvedValue({data: {data: {playlist: {id: 'p', name: '', description: '', duration: 1, trackCount: 0}, items: []}}} as any);

      await radioApi.generate(30, ['it', 'daily']);
      const body = mockPost.mock.calls[0][1];
      expect(body.categories).toEqual(['it', 'daily']);
    });
  });

  // ========================
  // EC-06: Speed boundaries
  // ========================
  describe('EC-06: Playback speed boundaries', () => {
    it('speed 0 → clamp tới 0.5', () => {
      useRadioStore.getState().setPlaybackSpeed(0);
      expect(useRadioStore.getState().playbackSpeed).toBe(0.5);
    });

    it('speed 10 → clamp tới 2.0', () => {
      useRadioStore.getState().setPlaybackSpeed(10);
      expect(useRadioStore.getState().playbackSpeed).toBe(2.0);
    });

    it('speed nhỏ hơn 0 → clamp tới 0.5', () => {
      useRadioStore.getState().setPlaybackSpeed(-1);
      expect(useRadioStore.getState().playbackSpeed).toBe(0.5);
    });
  });

  // ========================
  // EC-07: Streak edge cases
  // ========================
  describe('EC-07: Streak edge cases', () => {
    it('streak trên null lastListenedDate → tạo mới', () => {
      useRadioStore.setState({lastListenedDate: null, streak: 0});
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1);
    });

    it('streak gọi 2 lần cùng ngày → không tăng', () => {
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1);
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1); // Giữ nguyên
    });
  });

  // ========================
  // EC-08: Sleep timer edge
  // ========================
  describe('EC-08: Sleep timer edge', () => {
    it('set 0 → endAt = 0', () => {
      useRadioStore.getState().setSleepTimer(0);
      expect(useRadioStore.getState().sleepTimerEndAt).toBe(0);
    });

    it('set → clear → set lại', () => {
      useRadioStore.getState().setSleepTimer(15);
      expect(useRadioStore.getState().sleepTimerMinutes).toBe(15);

      useRadioStore.getState().clearSleepTimer();
      expect(useRadioStore.getState().sleepTimerMinutes).toBe(0);

      useRadioStore.getState().setSleepTimer(30);
      expect(useRadioStore.getState().sleepTimerMinutes).toBe(30);
    });
  });

  // ========================
  // EC-09: Audio caching
  // ========================
  describe('EC-09: Audio caching', () => {
    it('updateTrackAudio với empty audioUrl → vẫn gửi', async () => {
      mockPut.mockResolvedValue({data: {success: true}} as any);

      await radioApi.updateTrackAudio('pl-1', 'item-1', '');
      expect(mockPut).toHaveBeenCalledWith(
        '/playlists/pl-1/items/item-1/audio',
        {audioUrl: ''},
      );
    });
  });

  // ========================
  // EC-10: Concurrent operations
  // ========================
  describe('EC-10: Concurrent operations', () => {
    it('nhiều nextTrack liên tiếp', () => {
      useRadioStore.getState().setCurrentPlaylist({
        playlist: {id: 'p', name: '', description: '', duration: 30, trackCount: 5},
        items: Array.from({length: 5}, (_, i) => ({
          id: `t-${i}`, topic: `T${i}`, conversation: [], duration: 6,
          numSpeakers: 2, category: 'it', subCategory: '', position: i,
        })),
      });
      useRadioStore.getState().setCurrentTrackIndex(0);

      // Rapid calls
      useRadioStore.getState().nextTrack(); // → 1
      useRadioStore.getState().nextTrack(); // → 2
      useRadioStore.getState().nextTrack(); // → 3

      expect(useRadioStore.getState().currentTrackIndex).toBe(3);
    });
  });
});

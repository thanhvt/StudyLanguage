/**
 * Unit test cho useRadioStore
 *
 * Mục đích: Test Zustand store logic cho Radio Mode
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — sau mỗi thay đổi useRadioStore
 */

// Mock MMKV trước khi import store
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

import {useRadioStore, RepeatMode} from '@/store/useRadioStore';
import type {RadioPlaylistResult} from '@/services/api/radio';

// Helper để reset store giữa các test
function resetStore() {
  useRadioStore.getState().reset();
  useRadioStore.setState({
    playbackSpeed: 1,
    shuffle: false,
    repeat: 'off' as RepeatMode,
    preferredCategories: [],
    totalListenedSeconds: 0,
    streak: 0,
    lastListenedDate: null,
    trackProgress: {},
  });
}

// Mock playlist data
const mockPlaylist: RadioPlaylistResult = {
  playlist: {
    id: 'test-pl',
    name: 'Test Playlist',
    description: 'Test description',
    duration: 30,
    trackCount: 3,
  },
  items: [
    {
      id: 'track-1',
      topic: 'Daily Stand-up',
      conversation: [{speaker: 'Alice', text: 'Hi'}],
      duration: 10,
      numSpeakers: 2,
      category: 'it',
      subCategory: 'Agile',
      position: 0,
    },
    {
      id: 'track-2',
      topic: 'Code Review',
      conversation: [{speaker: 'Bob', text: 'LGTM'}],
      duration: 10,
      numSpeakers: 2,
      category: 'it',
      subCategory: 'Dev',
      position: 1,
    },
    {
      id: 'track-3',
      topic: 'Lunch Chat',
      conversation: [{speaker: 'Carol', text: 'Hungry?'}],
      duration: 10,
      numSpeakers: 3,
      category: 'daily',
      subCategory: 'Food',
      position: 2,
    },
  ],
};

describe('useRadioStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ========================
  // Playlist management
  // ========================
  describe('playlist management', () => {
    it('set và lấy currentPlaylist', () => {
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
      expect(useRadioStore.getState().currentPlaylist?.playlist.id).toBe('test-pl');
    });

    it('set và lấy currentTrackIndex', () => {
      useRadioStore.getState().setCurrentTrackIndex(2);
      expect(useRadioStore.getState().currentTrackIndex).toBe(2);
    });

    it('clamp currentTrackIndex tối thiểu -1', () => {
      useRadioStore.getState().setCurrentTrackIndex(-5);
      expect(useRadioStore.getState().currentTrackIndex).toBe(-1);
    });

    it('getCurrentTrack trả về null khi chưa có playlist', () => {
      expect(useRadioStore.getState().getCurrentTrack()).toBeNull();
    });

    it('getCurrentTrack trả về track đúng index', () => {
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      const track = useRadioStore.getState().getCurrentTrack();
      expect(track?.id).toBe('track-2');
      expect(track?.topic).toBe('Code Review');
    });
  });

  // ========================
  // nextTrack logic
  // ========================
  describe('nextTrack', () => {
    beforeEach(() => {
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
    });

    it('next tuần tự từ 0 → 1', () => {
      useRadioStore.getState().setCurrentTrackIndex(0);
      const next = useRadioStore.getState().nextTrack();
      expect(next).toBe(1);
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);
    });

    it('hết playlist → trả -1 khi repeat=off', () => {
      useRadioStore.getState().setCurrentTrackIndex(2); // Cuối
      const next = useRadioStore.getState().nextTrack();
      expect(next).toBe(-1);
    });

    it('repeat=all → quay lại 0 khi hết', () => {
      useRadioStore.setState({repeat: 'all'});
      useRadioStore.getState().setCurrentTrackIndex(2);
      const next = useRadioStore.getState().nextTrack();
      expect(next).toBe(0);
    });

    it('repeat=one → giữ nguyên track', () => {
      useRadioStore.setState({repeat: 'one'});
      useRadioStore.getState().setCurrentTrackIndex(1);
      const next = useRadioStore.getState().nextTrack();
      expect(next).toBe(1);
    });

    it('shuffle → nhảy random track khác', () => {
      useRadioStore.setState({shuffle: true});
      useRadioStore.getState().setCurrentTrackIndex(0);

      // Chạy nhiều lần để đảm bảo random
      const results = new Set<number>();
      for (let i = 0; i < 20; i++) {
        useRadioStore.getState().setCurrentTrackIndex(0);
        const next = useRadioStore.getState().nextTrack();
        results.add(next);
      }
      // Phải có ít nhất 1 kết quả khác 0 (nếu 3 tracks, phải random 1 hoặc 2)
      expect(results.has(0)).toBe(false);
    });
  });

  // ========================
  // previousTrack logic
  // ========================
  describe('previousTrack', () => {
    beforeEach(() => {
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
    });

    it('previous từ 2 → 1', () => {
      useRadioStore.getState().setCurrentTrackIndex(2);
      const prev = useRadioStore.getState().previousTrack();
      expect(prev).toBe(1);
    });

    it('previous từ 0 → 0 (không xuống âm)', () => {
      useRadioStore.getState().setCurrentTrackIndex(0);
      const prev = useRadioStore.getState().previousTrack();
      expect(prev).toBe(0);
    });
  });

  // ========================
  // Playback speed
  // ========================
  describe('playbackSpeed', () => {
    it('set speed trong khoảng 0.5 - 2.0', () => {
      useRadioStore.getState().setPlaybackSpeed(1.5);
      expect(useRadioStore.getState().playbackSpeed).toBe(1.5);
    });

    it('clamp min 0.5', () => {
      useRadioStore.getState().setPlaybackSpeed(0.1);
      expect(useRadioStore.getState().playbackSpeed).toBe(0.5);
    });

    it('clamp max 2.0', () => {
      useRadioStore.getState().setPlaybackSpeed(5);
      expect(useRadioStore.getState().playbackSpeed).toBe(2.0);
    });
  });

  // ========================
  // Shuffle & Repeat
  // ========================
  describe('shuffle & repeat', () => {
    it('toggle shuffle', () => {
      expect(useRadioStore.getState().shuffle).toBe(false);
      useRadioStore.getState().toggleShuffle();
      expect(useRadioStore.getState().shuffle).toBe(true);
      useRadioStore.getState().toggleShuffle();
      expect(useRadioStore.getState().shuffle).toBe(false);
    });

    it('cycleRepeat: off → all → one → off', () => {
      expect(useRadioStore.getState().repeat).toBe('off');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('all');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('one');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('off');
    });
  });

  // ========================
  // Sleep timer
  // ========================
  describe('sleep timer', () => {
    it('set sleep timer 15 phút', () => {
      const before = Date.now();
      useRadioStore.getState().setSleepTimer(15);
      const state = useRadioStore.getState();
      expect(state.sleepTimerMinutes).toBe(15);
      expect(state.sleepTimerEndAt).toBeGreaterThanOrEqual(before + 15 * 60 * 1000);
    });

    it('clear sleep timer', () => {
      useRadioStore.getState().setSleepTimer(30);
      useRadioStore.getState().clearSleepTimer();
      expect(useRadioStore.getState().sleepTimerMinutes).toBe(0);
      expect(useRadioStore.getState().sleepTimerEndAt).toBe(0);
    });
  });

  // ========================
  // Streak
  // ========================
  describe('streak', () => {
    it('checkAndUpdateStreak tạo streak mới', () => {
      const today = new Date().toISOString().split('T')[0];
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1);
      expect(useRadioStore.getState().lastListenedDate).toBe(today);
    });

    it('không tăng streak nếu đã ghi hôm nay', () => {
      const today = new Date().toISOString().split('T')[0];
      useRadioStore.setState({streak: 3, lastListenedDate: today});
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(3); // Không đổi
    });

    it('tăng streak nếu nghe liên tiếp', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      useRadioStore.setState({streak: 5, lastListenedDate: yesterday});
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(6);
    });

    it('reset streak nếu bỏ lỡ 1 ngày', () => {
      const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
      useRadioStore.setState({streak: 10, lastListenedDate: twoDaysAgo});
      useRadioStore.getState().checkAndUpdateStreak();
      expect(useRadioStore.getState().streak).toBe(1);
    });
  });

  // ========================
  // Track progress
  // ========================
  describe('track progress', () => {
    it('cập nhật progress cho track', () => {
      useRadioStore.getState().updateTrackProgress('track-1', 45);
      expect(useRadioStore.getState().trackProgress['track-1']).toBe(45);
    });

    it('không ghi đè progress track khác', () => {
      useRadioStore.getState().updateTrackProgress('track-1', 45);
      useRadioStore.getState().updateTrackProgress('track-2', 30);
      expect(useRadioStore.getState().trackProgress['track-1']).toBe(45);
      expect(useRadioStore.getState().trackProgress['track-2']).toBe(30);
    });
  });

  // ========================
  // Categories
  // ========================
  describe('preferred categories', () => {
    it('set categories', () => {
      useRadioStore.getState().setPreferredCategories(['it', 'daily']);
      expect(useRadioStore.getState().preferredCategories).toEqual(['it', 'daily']);
    });
  });

  // ========================
  // Reset
  // ========================
  describe('reset', () => {
    it('reset về trạng thái idle', () => {
      useRadioStore.getState().setCurrentPlaylist(mockPlaylist);
      useRadioStore.getState().setCurrentTrackIndex(2);
      useRadioStore.getState().setPlaybackState('playing');
      useRadioStore.getState().reset();

      const state = useRadioStore.getState();
      expect(state.currentPlaylist).toBeNull();
      expect(state.currentTrackIndex).toBe(-1);
      expect(state.playbackState).toBe('idle');
    });

    it('reset giữ lại playbackSpeed và streak (persist)', () => {
      useRadioStore.setState({playbackSpeed: 1.5, streak: 5});
      useRadioStore.getState().reset();
      // reset() chỉ xóa runtime state, không xóa persisted fields
      expect(useRadioStore.getState().playbackSpeed).toBe(1.5);
      expect(useRadioStore.getState().streak).toBe(5);
    });
  });

  // ========================
  // Listened time
  // ========================
  describe('listened time', () => {
    it('tăng tổng thời gian nghe', () => {
      useRadioStore.getState().addListenedTime(10);
      useRadioStore.getState().addListenedTime(20);
      expect(useRadioStore.getState().totalListenedSeconds).toBe(30);
    });
  });
});

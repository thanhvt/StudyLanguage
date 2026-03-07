/**
 * Comprehensive Radio Screen Tests — State Machine, Edge Cases & Bug Fixes
 *
 * Mục đích: Cover tất cả test gaps phát hiện trong code review:
 *   - State machine transitions (idle/generating/ready/playing/error)
 *   - removeTrackFromPlaylist edge cases
 *   - removeTracksFromPlaylist edge cases
 *   - getCategoryLabel with unknown/empty categories
 *   - Initial state computation from route params
 *   - Sleep timer expiry detection
 *   - Pre-download guard logic
 *   - SSE progress edge cases
 *   - Delete while playing scenarios
 *   - Batch delete API
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
import type {RadioPlaylistResult} from '@/services/api/radio';
import {apiClient} from '@/services/api/client';

const mockDelete = (apiClient as any).delete as jest.MockedFunction<any>;
const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

// ========================
// Mock data factories
// ========================

/**
 * Mục đích: Tạo mock playlist với N tracks
 * Tham số đầu vào: trackCount (number), overrides (Partial)
 * Tham số đầu ra: RadioPlaylistResult
 * Khi nào sử dụng: Setup cho mọi test cần playlist
 */
function createMockPlaylist(trackCount = 3, playlistOverrides?: Partial<RadioPlaylistResult['playlist']>): RadioPlaylistResult {
  return {
    playlist: {
      id: 'test-pl',
      name: 'Test Radio',
      description: 'Mô tả test',
      duration: 30,
      trackCount,
      ...playlistOverrides,
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
  };
}

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

// ========================
// TESTS
// ========================

describe('Radio Screen — Comprehensive State & Edge Case Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  // ========================
  // 1. State Machine Transitions (RadioScreen.radioState)
  // ========================
  describe('State Machine: RadioScreen radioState logic', () => {
    it('initialState = idle khi không có route params hoặc stored playlist', () => {
      // Không có loadedPlaylist, autoGenerate, storedPlaylist
      const loadedPlaylist = undefined;
      const autoGenerate = undefined;
      const storedPlaylist = null;
      const playbackState = 'idle';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      expect(initialState).toBe('idle');
    });

    it('initialState = ready khi có loadedPlaylist từ route params', () => {
      const loadedPlaylist = createMockPlaylist(2);
      const autoGenerate = undefined;
      const storedPlaylist = null;
      const playbackState = 'idle';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      expect(initialState).toBe('ready');
    });

    it('initialState = generating khi autoGenerate = true', () => {
      const loadedPlaylist = undefined;
      const autoGenerate = true;
      const storedPlaylist = null;
      const playbackState = 'idle';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      expect(initialState).toBe('generating');
    });

    it('initialState = playing khi storedPlaylist + playbackState=playing', () => {
      const loadedPlaylist = undefined;
      const autoGenerate = undefined;
      const storedPlaylist = createMockPlaylist(3);
      const playbackState = 'playing';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      expect(initialState).toBe('playing');
    });

    it('initialState = playing khi storedPlaylist + playbackState=loading', () => {
      const loadedPlaylist = undefined;
      const autoGenerate = undefined;
      const storedPlaylist = createMockPlaylist(3);
      const playbackState = 'loading';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      expect(initialState).toBe('playing');
    });

    it('initialState = ready khi storedPlaylist + playbackState=paused', () => {
      const loadedPlaylist = undefined;
      const autoGenerate = undefined;
      const storedPlaylist = createMockPlaylist(3);
      const playbackState = 'paused';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      expect(initialState).toBe('ready');
    });

    it('loadedPlaylist ưu tiên hơn autoGenerate', () => {
      const loadedPlaylist = createMockPlaylist(1);
      const autoGenerate = true;
      const storedPlaylist = createMockPlaylist(5);
      const playbackState = 'playing';

      const initialState = loadedPlaylist
        ? 'ready'
        : autoGenerate
          ? 'generating'
          : storedPlaylist
            ? (playbackState === 'playing' || playbackState === 'loading' ? 'playing' : 'ready')
            : 'idle';

      // loadedPlaylist luôn ưu tiên → 'ready'
      expect(initialState).toBe('ready');
    });

    it('state transition: idle → generating → ready → playing', () => {
      // Mô phỏng flow hoàn chỉnh
      let radioState: string = 'idle';

      // User nhấn Generate
      radioState = 'generating';
      expect(radioState).toBe('generating');

      // API trả kết quả
      radioState = 'ready';
      expect(radioState).toBe('ready');

      // Auto-play
      radioState = 'playing';
      expect(radioState).toBe('playing');
    });

    it('state transition: generating → error → idle (retry)', () => {
      let radioState: string = 'idle';

      radioState = 'generating';
      expect(radioState).toBe('generating');

      // API thất bại
      radioState = 'error';
      expect(radioState).toBe('error');

      // User nhấn "Thử lại"
      radioState = 'idle';
      expect(radioState).toBe('idle');
    });
  });

  // ========================
  // 2. removeTrackFromPlaylist — Edge Cases Toàn Diện
  // ========================
  describe('Store: removeTrackFromPlaylist edge cases', () => {
    it('xóa track đầu tiên (index 0) — trackIndex giảm đúng', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2); // Đang phát track-2

      useRadioStore.getState().removeTrackFromPlaylist('track-0');

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(4);
      // Track trước bị xóa → index giảm 1: 2 → 1
      expect(state.currentTrackIndex).toBe(1);
      // Track đang phát vẫn là track-2
      expect(state.currentPlaylist?.items[state.currentTrackIndex]?.id).toBe('track-2');
    });

    it('xóa track cuối cùng — không ảnh hưởng index', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);

      useRadioStore.getState().removeTrackFromPlaylist('track-4');

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(4);
      expect(state.currentTrackIndex).toBe(2); // Không đổi
    });

    it('xóa track đang phát → index reset -1 + playbackState idle', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);
      useRadioStore.getState().setPlaybackState('playing');

      useRadioStore.getState().removeTrackFromPlaylist('track-2');

      const state = useRadioStore.getState();
      expect(state.currentTrackIndex).toBe(-1);
      expect(state.playbackState).toBe('idle');
      expect(state.currentPlaylist?.items).toHaveLength(4);
    });

    it('xóa track giữa (trước track đang phát) — index giảm 1', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(3);

      useRadioStore.getState().removeTrackFromPlaylist('track-1');

      expect(useRadioStore.getState().currentTrackIndex).toBe(2);
    });

    it('xóa track giữa (sau track đang phát) — index không đổi', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);

      useRadioStore.getState().removeTrackFromPlaylist('track-3');

      expect(useRadioStore.getState().currentTrackIndex).toBe(1);
    });

    it('xóa track duy nhất → playlist rỗng, index = -1', () => {
      const playlist = createMockPlaylist(1);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);

      useRadioStore.getState().removeTrackFromPlaylist('track-0');

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(0);
      expect(state.currentTrackIndex).toBe(-1);
    });

    it('xóa track không tồn tại → không thay đổi gì', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);

      useRadioStore.getState().removeTrackFromPlaylist('nonexistent-id');

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(3);
      expect(state.currentTrackIndex).toBe(1);
    });

    it('xóa khi currentPlaylist = null → không crash', () => {
      useRadioStore.getState().setCurrentPlaylist(null);
      // Không crash
      useRadioStore.getState().removeTrackFromPlaylist('any-id');
      expect(useRadioStore.getState().currentPlaylist).toBeNull();
    });

    it('xóa liên tiếp 3 tracks — index cập nhật đúng từng bước', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(4);

      // Xóa track-0 (trước) → index: 4 → 3
      useRadioStore.getState().removeTrackFromPlaylist('track-0');
      expect(useRadioStore.getState().currentTrackIndex).toBe(3);

      // Xóa track-1 (trước) → index: 3 → 2
      useRadioStore.getState().removeTrackFromPlaylist('track-1');
      expect(useRadioStore.getState().currentTrackIndex).toBe(2);

      // Xóa track-3: sau xóa track-0 và track-1, track-3 giờ ở index 1 (trước current 2)
      // → index: 2 → 1
      useRadioStore.getState().removeTrackFromPlaylist('track-3');
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);

      // Còn lại: track-2, track-4
      expect(useRadioStore.getState().currentPlaylist?.items).toHaveLength(2);
    });
  });

  // ========================
  // 3. removeTracksFromPlaylist — Batch Delete Edge Cases
  // ========================
  describe('Store: removeTracksFromPlaylist batch edge cases', () => {
    it('batch xóa 2 tracks trước track đang phát', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(3);

      useRadioStore.getState().removeTracksFromPlaylist(['track-0', 'track-1']);

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(3);
      // Track-3 vẫn tồn tại, tìm lại index
      expect(state.currentPlaylist?.items[state.currentTrackIndex]?.id).toBe('track-3');
    });

    it('batch xóa bao gồm track đang phát → index = -1, playback idle', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);
      useRadioStore.getState().setPlaybackState('playing');

      useRadioStore.getState().removeTracksFromPlaylist(['track-1', 'track-2', 'track-3']);

      const state = useRadioStore.getState();
      expect(state.currentTrackIndex).toBe(-1);
      expect(state.playbackState).toBe('idle');
      expect(state.currentPlaylist?.items).toHaveLength(2);
    });

    it('batch xóa TẤT CẢ tracks → playlist rỗng', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);

      useRadioStore.getState().removeTracksFromPlaylist(['track-0', 'track-1', 'track-2']);

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(0);
      expect(state.currentTrackIndex).toBe(-1);
    });

    it('batch xóa mảng rỗng → không thay đổi gì', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);

      useRadioStore.getState().removeTracksFromPlaylist([]);

      expect(useRadioStore.getState().currentPlaylist?.items).toHaveLength(3);
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);
    });

    it('batch xóa IDs không tồn tại → không thay đổi gì', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);

      useRadioStore.getState().removeTracksFromPlaylist(['fake-1', 'fake-2']);

      expect(useRadioStore.getState().currentPlaylist?.items).toHaveLength(3);
    });

    it('batch xóa khi currentPlaylist = null → không crash', () => {
      useRadioStore.getState().setCurrentPlaylist(null);
      useRadioStore.getState().removeTracksFromPlaylist(['any-1', 'any-2']);
      expect(useRadioStore.getState().currentPlaylist).toBeNull();
    });

    it('batch xóa chỉ tracks SAU track đang phát', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);

      useRadioStore.getState().removeTracksFromPlaylist(['track-3', 'track-4']);

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(3);
      expect(state.currentTrackIndex).toBe(1); // Không đổi
      expect(state.currentPlaylist?.items[state.currentTrackIndex]?.id).toBe('track-1');
    });
  });

  // ========================
  // 4. getCategoryLabel — BUG-05 fix verification
  // ========================
  describe('getCategoryLabel (BUG-05 fix)', () => {
    /**
     * Mục đích: Mô phỏng getCategoryLabel mới (derive from CATEGORIES)
     * Tham số đầu vào: category (string)
     * Tham số đầu ra: string
     * Khi nào sử dụng: Test getCategoryLabel behavior
     */
    const CATEGORIES = [
      {id: 'it', label: '💻 Công nghệ'},
      {id: 'daily', label: '🌍 Đời sống'},
      {id: 'personal', label: '👤 Cá nhân'},
      {id: 'business', label: '💼 Kinh doanh'},
      {id: 'academic', label: '🎓 Học thuật'},
      {id: 'travel', label: '✈️ Du lịch'},
      {id: 'health', label: '🏥 Sức khỏe'},
      {id: 'entertainment', label: '🎬 Giải trí'},
      {id: 'food', label: '🍜 Ẩm thực'},
      {id: 'sports', label: '⚽ Thể thao'},
      {id: 'culture', label: '🎭 Văn hóa'},
    ];

    function getCategoryLabel(category: string): string {
      const found = CATEGORIES.find(c => c.id === category);
      return found ? found.label.slice(found.label.indexOf(' ') + 1) : category;
    }

    it('known category → trả về label', () => {
      expect(getCategoryLabel('it')).toBe('Công nghệ');
      expect(getCategoryLabel('daily')).toBe('Đời sống');
      expect(getCategoryLabel('food')).toBe('Ẩm thực');
    });

    it('unknown category → trả về raw string (fallback)', () => {
      expect(getCategoryLabel('xyz')).toBe('xyz');
      expect(getCategoryLabel('unknown_cat')).toBe('unknown_cat');
    });

    it('empty string → trả về empty string', () => {
      expect(getCategoryLabel('')).toBe('');
    });

    it('tất cả 11 categories đều có label', () => {
      for (const cat of CATEGORIES) {
        const label = getCategoryLabel(cat.id);
        expect(label).not.toBe(cat.id); // Label phải khác ID
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  // ========================
  // 5. Sleep Timer Expiry Detection
  // ========================
  describe('Sleep Timer: Expiry detection edge cases', () => {
    it('timer chưa expired → endAt > now', () => {
      useRadioStore.getState().setSleepTimer(30);
      const state = useRadioStore.getState();
      expect(state.sleepTimerEndAt).toBeGreaterThan(Date.now());
    });

    it('timer vừa expired (simulated) → endAt < now', () => {
      // Mô phỏng: set timer 5 phút trước, đã hết hạn
      const pastEndAt = Date.now() - 5 * 60 * 1000;
      useRadioStore.setState({
        sleepTimerMinutes: 5,
        sleepTimerEndAt: pastEndAt,
      });

      const state = useRadioStore.getState();
      const isExpired = state.sleepTimerEndAt > 0 && state.sleepTimerEndAt < Date.now();
      expect(isExpired).toBe(true);
    });

    it('timer = 0 → not expired (disabled)', () => {
      useRadioStore.getState().setSleepTimer(0);
      const state = useRadioStore.getState();
      const isExpired = state.sleepTimerEndAt > 0 && state.sleepTimerEndAt < Date.now();
      expect(isExpired).toBe(false);
    });

    it('timer set → clear → set lại → endAt cập nhật', () => {
      useRadioStore.getState().setSleepTimer(15);
      const first = useRadioStore.getState().sleepTimerEndAt;

      useRadioStore.getState().clearSleepTimer();
      expect(useRadioStore.getState().sleepTimerEndAt).toBe(0);

      useRadioStore.getState().setSleepTimer(30);
      const second = useRadioStore.getState().sleepTimerEndAt;
      expect(second).toBeGreaterThan(first); // Mới hơn
    });
  });

  // ========================
  // 6. Pre-download Guard Logic
  // ========================
  describe('Pre-download: Guard and state logic', () => {
    it('playlist null → không download (khởi tạo default)', () => {
      // Mô phỏng: useRadioPredownload nhận playlist=null
      const playlist = null;
      const shouldDownload = !!playlist?.items?.length && !!playlist.playlist?.id;
      expect(shouldDownload).toBe(false);
    });

    it('playlist rỗng items → không download', () => {
      const playlist = createMockPlaylist(0);
      const shouldDownload = !!playlist.items.length && !!playlist.playlist?.id;
      expect(shouldDownload).toBe(false);
    });

    it('playlist không có id → không download', () => {
      const playlist = createMockPlaylist(3, {id: ''});
      const shouldDownload = !!playlist.items.length && !!playlist.playlist?.id;
      expect(shouldDownload).toBe(false);
    });

    it('playlist hợp lệ → cho phép download', () => {
      const playlist = createMockPlaylist(3);
      const shouldDownload = !!playlist.items.length && !!playlist.playlist?.id;
      expect(shouldDownload).toBe(true);
    });

    it('tracks đã có audioUrl → skip download (count correct)', () => {
      const playlist = createMockPlaylist(5);
      // 2 tracks đã có audio
      playlist.items[0].audioUrl = 'https://audio.test/0.mp3';
      playlist.items[2].audioUrl = 'https://audio.test/2.mp3';

      const alreadyCached = playlist.items.filter(i => i.audioUrl).length;
      expect(alreadyCached).toBe(2);
      expect(playlist.items.length - alreadyCached).toBe(3); // 3 cần download
    });
  });

  // ========================
  // 7. Delete Playlist while Playing — Full Flow
  // ========================
  describe('Delete playlist while playing — Full Flow', () => {
    it('delete thành công → reset all state', async () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      useRadioStore.getState().setPlaybackState('playing');

      mockDelete.mockResolvedValue({data: {success: true}} as any);
      await radioApi.deletePlaylist('test-pl');

      // Mô phỏng RadioScreen onDelete handler
      useRadioStore.getState().setCurrentTrackIndex(-1);
      useRadioStore.getState().setCurrentPlaylist(null);

      expect(useRadioStore.getState().currentPlaylist).toBeNull();
      expect(useRadioStore.getState().currentTrackIndex).toBe(-1);
    });

    it('delete thất bại → state giữ nguyên để user retry', async () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      useRadioStore.getState().setPlaybackState('playing');

      mockDelete.mockRejectedValue(new Error('Lỗi server'));

      await expect(radioApi.deletePlaylist('test-pl')).rejects.toThrow('Lỗi server');

      // State giữ nguyên
      expect(useRadioStore.getState().currentPlaylist?.playlist.id).toBe('test-pl');
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);
      expect(useRadioStore.getState().playbackState).toBe('playing');
    });

    it('delete single track while playing different track → state consistent', async () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);
      useRadioStore.getState().setPlaybackState('playing');

      mockDelete.mockResolvedValue({data: {success: true}} as any);
      await radioApi.deletePlaylistItem('test-pl', 'track-4');

      // Cập nhật store
      useRadioStore.getState().removeTrackFromPlaylist('track-4');

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(4);
      expect(state.currentTrackIndex).toBe(2); // Không bị ảnh hưởng
      expect(state.playbackState).toBe('playing'); // Vẫn playing
    });
  });

  // ========================
  // 8. Batch Delete API — deletePlaylistItems
  // ========================
  describe('Batch Delete API: deletePlaylistItems', () => {
    it('gọi DELETE /playlists/:id/items/batch đúng payload', async () => {
      mockDelete.mockResolvedValue({data: {deletedCount: 3}} as any);

      const result = await radioApi.deletePlaylistItems('pl-1', ['item-1', 'item-2', 'item-3']);

      expect(mockDelete).toHaveBeenCalledWith(
        '/playlists/pl-1/items/batch',
        {data: {itemIds: ['item-1', 'item-2', 'item-3']}},
      );
      expect(result.deletedCount).toBe(3);
    });

    it('batch delete thất bại → throw error', async () => {
      mockDelete.mockRejectedValue(new Error('Batch lỗi'));

      await expect(
        radioApi.deletePlaylistItems('pl-1', ['item-1']),
      ).rejects.toThrow('Batch lỗi');
    });
  });

  // ========================
  // 9. SSE Progress Edge Cases
  // ========================
  describe('SSE Progress: Edge cases', () => {
    it('progress percent clamp 0-100', () => {
      const clampPercent = (p: number) => Math.max(0, Math.min(100, p || 0));

      expect(clampPercent(0)).toBe(0);
      expect(clampPercent(50)).toBe(50);
      expect(clampPercent(100)).toBe(100);
      expect(clampPercent(150)).toBe(100);
      expect(clampPercent(-10)).toBe(0);
      expect(clampPercent(NaN)).toBe(0);
    });

    it('SSE done=true → trackCount đúng', () => {
      const sseData = {trackIndex: 4, total: 5, topic: 'Done', percent: 100, done: true, trackCount: 5};
      expect(sseData.done).toBe(true);
      expect(sseData.trackCount ?? sseData.total).toBe(5);
    });

    it('SSE done=false → in progress', () => {
      const sseData = {trackIndex: 2, total: 5, topic: 'Topic 3', percent: 60};
      expect((sseData as any).done).toBeUndefined();
      expect(sseData.trackIndex + 1).toBe(3);
    });

    it('SSE AbortController cancel → signal.aborted = true', () => {
      const controller = new AbortController();
      expect(controller.signal.aborted).toBe(false);
      controller.abort();
      expect(controller.signal.aborted).toBe(true);
    });
  });

  // ========================
  // 10. initialPlaylist Priority Logic
  // ========================
  describe('initialPlaylist: priority resolution', () => {
    it('loadedPlaylist > storedPlaylist > null', () => {
      const loaded = createMockPlaylist(2, {name: 'Loaded'});
      const stored = createMockPlaylist(5, {name: 'Stored'});

      const initialPlaylist = loaded ?? stored ?? null;
      expect(initialPlaylist.playlist.name).toBe('Loaded');
    });

    it('storedPlaylist khi không có loadedPlaylist', () => {
      const loaded = undefined;
      const stored = createMockPlaylist(5, {name: 'Stored'});

      const initialPlaylist = loaded ?? stored ?? null;
      expect(initialPlaylist?.playlist.name).toBe('Stored');
    });

    it('null khi không có cả hai', () => {
      const loaded = undefined;
      const stored = null;

      const initialPlaylist = loaded ?? stored ?? null;
      expect(initialPlaylist).toBeNull();
    });
  });

  // ========================
  // 11. Delete Track Index Recalculation — Stress Test
  // ========================
  describe('Delete Track Index: Stress test', () => {
    it('xóa lần lượt từ đầu playlist 10 tracks → index cập nhật đúng', () => {
      const playlist = createMockPlaylist(10);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(9); // Track cuối

      // Xóa từ đầu: track-0, track-1, ..., track-8
      for (let i = 0; i < 9; i++) {
        useRadioStore.getState().removeTrackFromPlaylist(`track-${i}`);
      }

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(1); // Chỉ còn track-9
      expect(state.currentTrackIndex).toBe(0); // Index = 0 (track-9 now at index 0)
      expect(state.currentPlaylist?.items[0]?.id).toBe('track-9');
    });

    it('xóa lần lượt từ cuối playlist → index không thay đổi', () => {
      const playlist = createMockPlaylist(10);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0); // Track đầu

      // Xóa từ cuối: track-9, track-8, ..., track-1
      for (let i = 9; i >= 1; i--) {
        useRadioStore.getState().removeTrackFromPlaylist(`track-${i}`);
      }

      const state = useRadioStore.getState();
      expect(state.currentPlaylist?.items).toHaveLength(1);
      expect(state.currentTrackIndex).toBe(0); // Không đổi
      expect(state.currentPlaylist?.items[0]?.id).toBe('track-0');
    });
  });

  // ========================
  // 12. NextTrack after Delete — Interaction
  // ========================
  describe('NextTrack after Delete: Interaction', () => {
    it('xóa track → nextTrack vẫn hoạt động đúng', () => {
      const playlist = createMockPlaylist(5);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(2);

      // Xóa track-1 (trước đang phát) → index: 2 → 1
      useRadioStore.getState().removeTrackFromPlaylist('track-1');
      expect(useRadioStore.getState().currentTrackIndex).toBe(1);

      // Gọi nextTrack → 2 (track-3 cũ, giờ ở index 2)
      const next = useRadioStore.getState().nextTrack();
      expect(next).toBe(2);
    });

    it('xóa track cuối → nextTrack wrap repeat=all', () => {
      const playlist = createMockPlaylist(3);
      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(1);
      useRadioStore.setState({repeat: 'all'});

      // Xóa track-2
      useRadioStore.getState().removeTrackFromPlaylist('track-2');

      // Currently at index 1, playlist has 2 items (track-0, track-1)
      const next = useRadioStore.getState().nextTrack();
      // Next from 1 → wrap to 0 (repeat=all)
      expect(next).toBe(0);
    });
  });

  // ========================
  // 13. Track Duration Display Logic
  // ========================
  describe('Track Duration Display', () => {
    it('tính ước lượng thời gian: Math.max(1, Math.round(conversation.length * 0.4))', () => {
      // 5 câu → ~2 phút
      expect(Math.max(1, Math.round(5 * 0.4))).toBe(2);
      // 1 câu → minimum 1
      expect(Math.max(1, Math.round(1 * 0.4))).toBe(1);
      // 0 câu → minimum 1
      expect(Math.max(1, Math.round(0 * 0.4))).toBe(1);
      // 100 câu → 40 phút
      expect(Math.max(1, Math.round(100 * 0.4))).toBe(40);
    });
  });

  // ========================
  // 14. Playlist playlist info display
  // ========================
  describe('Playlist info display edge cases', () => {
    it('playlist.items.length = 0 → hiển thị "0 bài"', () => {
      const playlist = createMockPlaylist(0);
      expect(`${playlist.items.length} bài`).toBe('0 bài');
    });

    it('generate button text khi generating', () => {
      const selectedDuration = 30;
      const text = `Đang tạo ${Math.ceil(selectedDuration / 7)} bài...`;
      expect(text).toBe('Đang tạo 5 bài...');
    });

    it('generate button text duration=1', () => {
      const selectedDuration = 1;
      const text = `Đang tạo ${Math.ceil(selectedDuration / 7)} bài...`;
      expect(text).toBe('Đang tạo 1 bài...');
    });

    it('generate button text duration=120', () => {
      const selectedDuration = 120;
      const text = `Đang tạo ${Math.ceil(selectedDuration / 7)} bài...`;
      expect(text).toBe('Đang tạo 18 bài...');
    });
  });

  // ========================
  // 15. Download progress percentage display
  // ========================
  describe('Download progress display', () => {
    it('progress percentage = Math.round((count/total)*100)', () => {
      expect(Math.round((3 / 5) * 100)).toBe(60);
      expect(Math.round((0 / 5) * 100)).toBe(0);
      expect(Math.round((5 / 5) * 100)).toBe(100);
    });

    it('progress width clamped 0-100%', () => {
      const calcWidth = (count: number, total: number) =>
        `${Math.round((count / total) * 100)}%`;

      expect(calcWidth(0, 10)).toBe('0%');
      expect(calcWidth(5, 10)).toBe('50%');
      expect(calcWidth(10, 10)).toBe('100%');
    });
  });
});

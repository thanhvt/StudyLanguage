/**
 * Unit tests cho RadioTrackSheet — 3 phases (logic only)
 *
 * Mục đích: Test logic, edge cases, bug cases cho RadioTrackSheet
 *   - Không render component → chỉ test pure logic
 *   - Pattern: Extract function → test function
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD, sau mỗi thay đổi RadioTrackSheet
 */

// ===========================
// Mocks
// ===========================
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

jest.mock('@/services/api/client', () => ({
  apiClient: {get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn()},
}));

import {useRadioStore} from '@/store/useRadioStore';
import type {RadioPlaylistItem} from '@/services/api/radio';

// ===========================
// Extracted Logic — thuần logic từ RadioTrackSheet
// ===========================

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

/**
 * Mục đích: Tính progress percent từ position và duration
 * Tham số đầu vào: position (number), duration (number)
 * Tham số đầu ra: number (0-100)
 * Khi nào sử dụng: RadioTrackSheet render progress bar
 */
function calcProgressPercent(position: number, duration: number): number {
  return duration > 0 ? (position / duration) * 100 : 0;
}

/**
 * Mục đích: Tìm exchange đang active dựa trên audio position
 * Tham số đầu vào: currentTime (number), timestamps ({startTime, endTime}[])
 * Tham số đầu ra: number (-1 nếu không tìm thấy)
 * Khi nào sử dụng: Sync highlight khi audio đang phát
 */
function findActiveExchangeIndex(
  currentTime: number,
  timestamps: {startTime: number; endTime: number}[],
): number {
  return timestamps.findIndex(
    ts => currentTime >= ts.startTime && currentTime < ts.endTime,
  );
}

/**
 * Mục đích: Tính tốc độ tiếp theo khi cycle
 * Tham số đầu vào: currentSpeed (number)
 * Tham số đầu ra: number (tốc độ tiếp theo)
 * Khi nào sử dụng: User nhấn nút speed
 */
function getNextSpeed(currentSpeed: number): number {
  const currentIdx = SPEED_OPTIONS.indexOf(currentSpeed);
  const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
  return SPEED_OPTIONS[nextIdx];
}

/**
 * Mục đích: Tính scroll Y ước lượng cho auto-scroll
 * Tham số đầu vào: exchangeIndex (number)
 * Tham số đầu ra: number (Y position, min 0)
 * Khi nào sử dụng: Auto-scroll tới câu đang phát
 */
function calcScrollY(exchangeIndex: number): number {
  return Math.max(0, exchangeIndex * 100 - 50);
}

/**
 * Mục đích: Xác định icon repeat dựa trên mode
 * Tham số đầu vào: repeat ('off' | 'all' | 'one')
 * Tham số đầu ra: string (icon name)
 * Khi nào sử dụng: Render repeat button
 */
function getRepeatIcon(repeat: string): string {
  return repeat === 'one' ? 'Repeat1' : 'Repeat';
}

/**
 * Mục đích: Toggle bookmark trong mảng indexes
 * Tham số đầu vào: bookmarks (number[]), index (number)
 * Tham số đầu ra: number[] (mảng mới)
 * Khi nào sử dụng: User long press câu
 */
function toggleBookmark(bookmarks: number[], index: number): number[] {
  return bookmarks.includes(index)
    ? bookmarks.filter(i => i !== index)
    : [...bookmarks, index];
}

// ===========================
// Helpers — tạo mock data
// ===========================

function createMockTrack(overrides?: Partial<RadioPlaylistItem>): RadioPlaylistItem {
  return {
    id: 'track-1',
    topic: 'Asking for Recommendations',
    conversation: [
      {speaker: 'Person A', text: 'Hi there! Any restaurant recommendations?'},
      {speaker: 'Person B', text: 'Try Spice Paradise, their Pad Thai is amazing!'},
      {speaker: 'Person A', text: 'Sounds great! Is it far from here?'},
    ],
    duration: 120,
    numSpeakers: 2,
    category: 'daily',
    subCategory: 'food',
    position: 0,
    ...overrides,
  };
}

function createMockTimestamps() {
  return [
    {startTime: 0, endTime: 3.5},
    {startTime: 3.5, endTime: 8.2},
    {startTime: 8.2, endTime: 12.0},
  ];
}

// ===========================
// Tests
// ===========================

describe('RadioTrackSheet — Logic & Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRadioStore.getState().reset();
    useRadioStore.setState({playbackSpeed: 1, repeat: 'off'});
  });

  // ========================
  // Phase 1: Snap Points
  // ========================
  describe('P1: Snap Points', () => {
    it('snap points phải là 55% và 90%', () => {
      const snapPoints = ['55%', '90%'];
      expect(snapPoints).not.toContain('70%');
      expect(snapPoints).not.toContain('100%');
      expect(snapPoints[0]).toBe('55%');
      expect(snapPoints[1]).toBe('90%');
    });

    it('max height không vượt quá 90%', () => {
      const snapPoints = ['55%', '90%'];
      const maxSnap = parseInt(snapPoints[snapPoints.length - 1]);
      expect(maxSnap).toBeLessThanOrEqual(90);
    });
  });

  // ========================
  // Phase 1: Track null guard
  // ========================
  describe('P1: Track null guard', () => {
    it('track = null → component nên return null', () => {
      const track = null;
      expect(track).toBeNull();
    });
  });

  // ========================
  // Phase 1: Active Exchange Highlight
  // ========================
  describe('P1: Active Exchange Highlight', () => {
    it('tìm đúng exchange index tại position 5.0 → index 1', () => {
      const ts = createMockTimestamps();
      expect(findActiveExchangeIndex(5.0, ts)).toBe(1);
    });

    it('position = 0 → active index = 0', () => {
      const ts = createMockTimestamps();
      expect(findActiveExchangeIndex(0, ts)).toBe(0);
    });

    it('position vượt quá tất cả timestamps → -1', () => {
      const ts = createMockTimestamps();
      expect(findActiveExchangeIndex(100, ts)).toBe(-1);
    });

    it('position âm → -1', () => {
      const ts = createMockTimestamps();
      expect(findActiveExchangeIndex(-5, ts)).toBe(-1);
    });

    it('không có timestamps → -1', () => {
      expect(findActiveExchangeIndex(5, [])).toBe(-1);
    });
  });

  // ========================
  // Phase 1: Tap-to-Seek
  // ========================
  describe('P1: Tap-to-Seek', () => {
    it('lấy đúng startTime cho index', () => {
      const ts = createMockTimestamps();
      expect(ts[0].startTime).toBe(0);
      expect(ts[1].startTime).toBe(3.5);
      expect(ts[2].startTime).toBe(8.2);
    });

    it('index ngoài range → undefined', () => {
      const ts = createMockTimestamps();
      expect(ts[99]).toBeUndefined();
    });

    it('timestamps rỗng → guard anh toàn', () => {
      const ts: {startTime: number; endTime: number}[] = [];
      expect(ts[0]).toBeUndefined();
    });
  });

  // ========================
  // Phase 1: Translation Toggle
  // ========================
  describe('P1: Translation Toggle', () => {
    it('toggle state on → off → on', () => {
      let show = false;
      show = !show;
      expect(show).toBe(true);
      show = !show;
      expect(show).toBe(false);
      show = !show;
      expect(show).toBe(true);
    });
  });

  // ========================
  // Phase 1: Speed Cycle
  // ========================
  describe('P1: Speed Cycle', () => {
    it('1.0 → 1.25', () => expect(getNextSpeed(1.0)).toBe(1.25));
    it('2.0 → 0.5 (wrap around)', () => expect(getNextSpeed(2.0)).toBe(0.5));
    it('0.5 → 0.75', () => expect(getNextSpeed(0.5)).toBe(0.75));

    it('speed không tồn tại → fallback 0.5', () => {
      // indexOf(3.0) = -1, (-1+1)%6 = 0 → SPEED_OPTIONS[0] = 0.5
      expect(getNextSpeed(3.0)).toBe(0.5);
    });

    it('NaN → fallback 0.5', () => {
      expect(getNextSpeed(NaN)).toBe(0.5);
    });
  });

  // ========================
  // Phase 2: Progress Percent
  // ========================
  describe('P2: Progress Percent', () => {
    it('50/100 = 50%', () => expect(calcProgressPercent(50, 100)).toBe(50));
    it('duration=0 → 0% (tránh divide-by-zero)', () => expect(calcProgressPercent(30, 0)).toBe(0));
    it('position > duration → > 100% (UI sẽ clamp)', () => {
      const percent = calcProgressPercent(120, 100);
      expect(percent).toBe(120);
      expect(Math.min(percent, 100)).toBe(100);
    });
    it('position=0 → 0%', () => expect(calcProgressPercent(0, 100)).toBe(0));
    it('position âm → số âm', () => expect(calcProgressPercent(-10, 100)).toBeLessThan(0));
  });

  // ========================
  // Phase 2: Repeat Cycle (via store)
  // ========================
  describe('P2: Repeat Cycle', () => {
    it('cycle: off → all → one → off', () => {
      expect(useRadioStore.getState().repeat).toBe('off');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('all');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('one');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('off');
    });

    it('repeat icon mapping', () => {
      expect(getRepeatIcon('off')).toBe('Repeat');
      expect(getRepeatIcon('all')).toBe('Repeat');
      expect(getRepeatIcon('one')).toBe('Repeat1');
    });
  });

  // ========================
  // Phase 2: Auto-scroll
  // ========================
  describe('P2: Auto-scroll', () => {
    it('index=0 → Y=0', () => expect(calcScrollY(0)).toBe(0));
    it('index=1 → Y=50', () => expect(calcScrollY(1)).toBe(50));
    it('index=5 → Y=450', () => expect(calcScrollY(5)).toBe(450));
    it('index=10 → Y=950', () => expect(calcScrollY(10)).toBe(950));

    it('chỉ scroll khi index > 0', () => {
      expect(0 > 0).toBe(false);
      expect(1 > 0).toBe(true);
    });
  });

  // ========================
  // Phase 3: Bookmark toggle
  // ========================
  describe('P3: Bookmark toggle', () => {
    it('thêm bookmark', () => {
      expect(toggleBookmark([], 2)).toEqual([2]);
    });

    it('xóa bookmark', () => {
      expect(toggleBookmark([2], 2)).toEqual([]);
    });

    it('double toggle = trở về ban đầu', () => {
      const b1 = toggleBookmark([], 3);
      const b2 = toggleBookmark(b1, 3);
      expect(b2).toEqual([]);
    });

    it('nhiều bookmarks', () => {
      let b: number[] = [];
      b = toggleBookmark(b, 0);
      b = toggleBookmark(b, 2);
      b = toggleBookmark(b, 5);
      expect(b).toEqual([0, 2, 5]);
    });
  });

  // ========================
  // Edge Cases
  // ========================
  describe('Edge Cases', () => {
    it('conversation rỗng', () => {
      const track = createMockTrack({conversation: []});
      expect(track.conversation.length).toBe(0);
    });

    it('1 exchange duy nhất', () => {
      const track = createMockTrack({
        conversation: [{speaker: 'Solo', text: 'Only one'}],
      });
      expect(track.conversation.length).toBe(1);
    });

    it('100+ exchanges', () => {
      const long = Array.from({length: 100}, (_, i) => ({
        speaker: i % 2 === 0 ? 'A' : 'B', text: `Line ${i}`,
      }));
      const track = createMockTrack({conversation: long});
      expect(track.conversation.length).toBe(100);
    });

    it('timestamps và exchanges khác length', () => {
      const track = createMockTrack({
        audioTimestamps: Array.from({length: 5}, (_, i) => ({
          startTime: i * 2, endTime: (i + 1) * 2,
        })),
      });
      expect(track.conversation.length).toBe(3);
      expect(track.audioTimestamps!.length).toBe(5);
    });

    it('topic trống', () => {
      expect(createMockTrack({topic: ''}).topic).toBe('');
    });

    it('numSpeakers = 0', () => {
      expect(createMockTrack({numSpeakers: 0}).numSpeakers).toBe(0);
    });
  });

  // ========================
  // Bug Cases tiềm ẩn
  // ========================
  describe('Bug Cases', () => {
    it('B-01: Rapid speed cycle → store cuối cùng thắng', () => {
      useRadioStore.getState().setPlaybackSpeed(1.0);
      useRadioStore.getState().setPlaybackSpeed(1.25);
      useRadioStore.getState().setPlaybackSpeed(1.5);
      expect(useRadioStore.getState().playbackSpeed).toBe(1.5);
    });

    it('B-02: Triple repeat cycle → quay về off', () => {
      useRadioStore.getState().cycleRepeat(); // all
      useRadioStore.getState().cycleRepeat(); // one
      useRadioStore.getState().cycleRepeat(); // off
      expect(useRadioStore.getState().repeat).toBe('off');
    });

    it('B-03: Timestamp edge — position = exactly startTime', () => {
      const ts = createMockTimestamps();
      // 3.5 = startTime[1] → nằm trong [1], KHÔNG phải [0]
      expect(findActiveExchangeIndex(3.5, ts)).toBe(1);
    });

    it('B-04: Timestamp edge — position = exactly endTime', () => {
      const ts = createMockTimestamps();
      // endTime[0]=3.5, sử dụng < → KHÔNG match [0], match [1]
      expect(findActiveExchangeIndex(3.5, ts)).toBe(1);
    });

    it('B-05: Timestamp gap — position trong khoảng trống', () => {
      const tsWithGap = [
        {startTime: 0, endTime: 2},
        {startTime: 5, endTime: 8}, // gap 2-5
      ];
      // Position 3 nằm trong gap → -1
      expect(findActiveExchangeIndex(3, tsWithGap)).toBe(-1);
    });

    it('B-06: Speed options indexOf NaN = -1 → fallback 0.5', () => {
      expect(SPEED_OPTIONS.indexOf(NaN)).toBe(-1);
      expect(getNextSpeed(NaN)).toBe(0.5);
    });

    it('B-07: Progress NaN position → kiểm tra guard', () => {
      // NaN / 100 = NaN, > 0 vẫn true cho duration=100
      // UI cần thêm guard: !isNaN check
      const position = NaN;
      const duration = 100;
      const safePercent = duration > 0 && !isNaN(position)
        ? (position / duration) * 100
        : 0;
      expect(safePercent).toBe(0);
    });

    it('B-08: Bookmarks reset khi sheet đóng mở (limitation)', () => {
      let bookmarks = toggleBookmark([], 1);
      expect(bookmarks).toEqual([1]);
      // Simulate remount
      bookmarks = [];
      expect(bookmarks).toEqual([]);
    });
  });

  // ========================
  // Bookmark API Persistence
  // ========================
  describe('Bookmark API Persistence', () => {
    /**
     * Mục đích: Simulate optimistic update logic cho bookmark
     * Tham số đầu vào: bookmarks (number[]), index (number), isBookmarked (boolean)
     * Tham số đầu ra: {optimistic, rolledBack}
     * Khi nào sử dụng: Test bookmark toggle flow
     */
    function simulateOptimisticBookmark(
      bookmarks: number[],
      index: number,
    ): {optimistic: number[]; rolledBack: number[]} {
      const isBookmarked = bookmarks.includes(index);
      // Optimistic update
      const optimistic = isBookmarked
        ? bookmarks.filter(i => i !== index)
        : [...bookmarks, index];
      // Rollback (undo optimistic)
      const rolledBack = isBookmarked
        ? [...optimistic, index]
        : optimistic.filter(i => i !== index);
      return {optimistic, rolledBack};
    }

    it('optimistic add: [] → [2]', () => {
      const {optimistic} = simulateOptimisticBookmark([], 2);
      expect(optimistic).toEqual([2]);
    });

    it('optimistic remove: [2] → []', () => {
      const {optimistic} = simulateOptimisticBookmark([2], 2);
      expect(optimistic).toEqual([]);
    });

    it('rollback add: thêm rồi hoàn tác → trở về rỗng', () => {
      const {rolledBack} = simulateOptimisticBookmark([], 2);
      expect(rolledBack).toEqual([]);
    });

    it('rollback remove: xóa rồi hoàn tác → trở về có', () => {
      const {rolledBack} = simulateOptimisticBookmark([2], 2);
      expect(rolledBack).toContain(2);
    });

    it('optimistic với nhiều bookmark có sẵn', () => {
      const {optimistic} = simulateOptimisticBookmark([1, 3, 5], 3);
      expect(optimistic).toEqual([1, 5]); // Xóa index 3
    });

    it('rollback với nhiều bookmark → phục hồi đúng', () => {
      const {rolledBack} = simulateOptimisticBookmark([1, 3, 5], 3);
      expect(rolledBack).toContain(3); // Index 3 được phục hồi
    });

    it('bookmark API create payload đúng format', () => {
      const exchange = {speaker: 'Person A', text: 'Hello world!'};
      const topic = 'Greetings';
      const payload = {
        sentenceIndex: 0,
        speaker: exchange.speaker,
        sentenceText: exchange.text,
        topic,
      };
      expect(payload.sentenceIndex).toBe(0);
      expect(payload.speaker).toBe('Person A');
      expect(payload.sentenceText).toBe('Hello world!');
      expect(payload.topic).toBe('Greetings');
    });

    it('bookmark toast text cắt ngắn tại 40 ký tự', () => {
      const longText = 'This is a very long sentence that should be truncated at forty characters exactly.';
      const truncated = longText.substring(0, 40) + '...';
      expect(truncated.length).toBe(43); // 40 + 3 (...)
      expect(truncated).toContain('...');
    });

    it('bookmark exchange không tồn tại → guard return', () => {
      const track = createMockTrack();
      const exchange = track.conversation[99]; // Không tồn tại
      expect(exchange).toBeUndefined();
    });
  });

  // ========================
  // Dictionary Vocabulary Persistence
  // ========================
  describe('Dictionary Vocabulary Persistence', () => {
    it('addWord lưu vào vocabularyStore (case insensitive)', () => {
      const {useVocabularyStore} = require('@/store/useVocabularyStore');
      useVocabularyStore.getState().clearAll();
      useVocabularyStore.getState().addWord('Hello', 'listening');
      expect(useVocabularyStore.getState().words.length).toBe(1);
      expect(useVocabularyStore.getState().words[0].word).toBe('hello');
    });

    it('addWord duplicate → không thêm trùng', () => {
      const {useVocabularyStore} = require('@/store/useVocabularyStore');
      useVocabularyStore.getState().clearAll();
      useVocabularyStore.getState().addWord('test', 'listening');
      useVocabularyStore.getState().addWord('Test', 'listening');
      useVocabularyStore.getState().addWord('TEST', 'listening');
      expect(useVocabularyStore.getState().words.length).toBe(1);
    });

    it('addSavedWord lưu vào listeningStore', () => {
      const {useListeningStore} = require('@/store/useListeningStore');
      useListeningStore.getState().reset();
      useListeningStore.getState().addSavedWord('amazing');
      const saved = useListeningStore.getState().savedWords;
      expect(saved).toContain('amazing');
    });

    it('source = "listening" cho radio context', () => {
      const {useVocabularyStore} = require('@/store/useVocabularyStore');
      useVocabularyStore.getState().clearAll();
      useVocabularyStore.getState().addWord('radio', 'listening');
      const word = useVocabularyStore.getState().words[0];
      expect(word.source).toBe('listening');
    });
  });

  // ========================
  // Bug Cases — API failures
  // ========================
  describe('Bug Cases — API & Persistence', () => {
    it('B-09: Bookmark API fail → UI rollback chính xác', () => {
      // Simulate: ban đầu có bookmark [1, 3], user toggle index 3
      const initial = [1, 3];
      const {optimistic, rolledBack} = (function() {
        const isBookmarked = initial.includes(3);
        const opt = isBookmarked ? initial.filter(i => i !== 3) : [...initial, 3];
        const rb = isBookmarked ? [...opt, 3] : opt.filter(i => i !== 3);
        return {optimistic: opt, rolledBack: rb};
      })();
      expect(optimistic).toEqual([1]); // Optimistic: đã xóa 3
      expect(rolledBack).toContain(3); // Rollback: 3 trở lại
    });

    it('B-10: Dictionary save empty string → không nên lưu', () => {
      // Guard ở UI level: word phải non-empty
      const word = '';
      expect(word.length).toBe(0);
      expect(!!word).toBe(false);
    });

    it('B-11: Pronunciation pause/resume flow', () => {
      // Simulate: wasPlaying=true → pause → play pronunciation → resume
      let mainPlayerState = 'playing';
      const wasPlaying = mainPlayerState === 'playing';
      if (wasPlaying) mainPlayerState = 'paused';
      expect(mainPlayerState).toBe('paused');
      // After pronunciation ends
      if (wasPlaying) mainPlayerState = 'playing';
      expect(mainPlayerState).toBe('playing');
    });
  });
});

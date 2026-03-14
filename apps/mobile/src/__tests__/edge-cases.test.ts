/**
 * Mục đích: Test toàn diện các edge cases phát hiện trong mobile app
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 *
 * Bao gồm edge cases từ phân tích EC-C01 → EC-m15:
 *   - Stores: useSpeakingStore, useListeningStore,
 *             useAudioPlayerStore, useHistoryStore, useAuthStore, useVocabularyStore
 *   - Utils: formatTime, historyHelpers (formatRelativeTime, groupEntriesByDate)
 *   - Hooks: useTtsReader, useDictionary
 */

import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useHistoryStore} from '@/store/useHistoryStore';
import {useAuthStore} from '@/store/useAuthStore';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useShadowingStore} from '@/store/useShadowingStore';
import {formatTime} from '@/utils/formatTime';
import {
  formatRelativeTime,
  formatDateGroup,
  groupEntriesByDate,
  getTypeIcon,
  getTypeLabel,
  getAccentColor,
} from '@/utils/historyHelpers';

// ==============================================================
// 1. formatTime — Edge Cases (EC-M05, EC-m11)
// ==============================================================

describe('formatTime — Edge Cases', () => {
  it('EC-M05: trả "0:00" cho số giây âm', () => {
    expect(formatTime(-5)).toBe('0:00');
    expect(formatTime(-100)).toBe('0:00');
  });

  it('EC-m11: trả "0:00" cho Infinity', () => {
    expect(formatTime(Infinity)).toBe('0:00');
    expect(formatTime(-Infinity)).toBe('0:00');
  });

  it('trả "0:00" cho NaN', () => {
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('trả "0:00" cho 0', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('xử lý số rất lớn (không crash)', () => {
    const result = formatTime(999999);
    expect(result).toBe('16666:39');
  });

  it('xử lý số thập phân', () => {
    expect(formatTime(65.7)).toBe('1:05');
    expect(formatTime(0.5)).toBe('0:00');
  });
});

// ==============================================================
// 2. formatRelativeTime — Edge Cases (EC-M06, EC-M07)
// ==============================================================

describe('formatRelativeTime — Edge Cases', () => {
  it('EC-M06: trả "Không xác định" cho date string không hợp lệ', () => {
    expect(formatRelativeTime('invalid-date')).toBe('Không xác định');
    expect(formatRelativeTime('')).toBe('Không xác định');
    expect(formatRelativeTime('abc123')).toBe('Không xác định');
  });

  it('EC-M07: trả "Sắp tới" cho ngày trong tương lai', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(formatRelativeTime(futureDate.toISOString())).toBe('Sắp tới');
  });

  it('trả "Vừa xong" cho ngày vừa mới (dưới 1 phút)', () => {
    const date = new Date();
    expect(formatRelativeTime(date.toISOString())).toBe('Vừa xong');
  });

  // Fix TEST-2: Dùng regex để tránh flaky ±1 phút khi chạy test ở ranh giới
  it('trả "X phút trước" cho ngày trong 1 giờ', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 30);
    const result = formatRelativeTime(date.toISOString());
    expect(result).toMatch(/^(29|30|31) phút trước$/);
  });

  // Fix TEST-2: Dùng regex để tránh flaky giờ
  it('trả "X giờ trước" cho ngày trong 24 giờ', () => {
    const date = new Date();
    date.setHours(date.getHours() - 5);
    const result = formatRelativeTime(date.toISOString());
    expect(result).toMatch(/^(4|5|6) giờ trước$/);
  });
});

// ==============================================================
// 3. groupEntriesByDate — Edge Cases (EC-m14)
// ==============================================================

describe('groupEntriesByDate — Edge Cases', () => {
  it('EC-m14: trả mảng rỗng khi entries rỗng', () => {
    const result = groupEntriesByDate([]);
    expect(result).toEqual([]);
  });

  it('nhóm đúng khi có entries cùng ngày', () => {
    const now = new Date();
    const entries = [
      {createdAt: now.toISOString(), id: '1'},
      {createdAt: now.toISOString(), id: '2'},
    ];
    const result = groupEntriesByDate(entries);
    expect(result).toHaveLength(1);
    expect(result[0].data).toHaveLength(2);
    expect(result[0].title).toBe('Hôm nay');
  });

  // Fix TEST-3: Thêm test entries khác ngày
  it('nhóm đúng khi có entries khác ngày', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const entries = [
      {createdAt: today.toISOString(), id: '1'},
      {createdAt: yesterday.toISOString(), id: '2'},
    ];
    const result = groupEntriesByDate(entries);
    expect(result.length).toBeGreaterThanOrEqual(2);
    result.forEach(group => {
      expect(group.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Fix TEST-3: Entries với invalid date không crash
  it('xử lý entries có date không hợp lệ không crash', () => {
    const entries = [
      {createdAt: 'invalid-date', id: '1'},
      {createdAt: new Date().toISOString(), id: '2'},
    ];
    expect(() => groupEntriesByDate(entries)).not.toThrow();
  });
});

// ==============================================================
// 4. historyHelpers — getTypeIcon, getTypeLabel, getAccentColor
// ==============================================================

describe('historyHelpers — utility functions', () => {
  it('getTypeIcon trả icon đúng cho từng type', () => {
    expect(getTypeIcon('listening')).toBe('🎧');
    expect(getTypeIcon('speaking')).toBe('🗣️');
  });

  it('getTypeIcon fallback cho type không hợp lệ', () => {
    expect(getTypeIcon('unknown' as any)).toBe('📚');
  });

  it('getTypeLabel trả label đúng', () => {
    expect(getTypeLabel('listening')).toBe('Nghe');
    expect(getTypeLabel('speaking')).toBe('Nói');
  });

  it('getTypeLabel fallback cho type không hợp lệ', () => {
    expect(getTypeLabel('unknown' as any)).toBe('unknown');
  });

  it('getAccentColor trả đúng object cho từng type', () => {
    const result = getAccentColor('speaking');
    expect(result).toHaveProperty('border');
    expect(result).toHaveProperty('bg');
    expect(result).toHaveProperty('text');
    expect(result.border).toBe('#16A34A');
  });

  it('getAccentColor fallback cho type không hợp lệ', () => {
    const result = getAccentColor('unknown' as any);
    // Fallback = listening colors
    expect(result.border).toBe('#4F46E5');
  });
});

// ==============================================================
// 5. useSpeakingStore — Edge Cases (EC-C05, EC-M10, EC-m07)
// ==============================================================

describe('useSpeakingStore — Edge Cases', () => {
  beforeEach(() => {
    useSpeakingStore.getState().reset();
  });

  describe('EC-C05: setCurrentIndex validation', () => {
    const mockSentences = [
      {text: 'Hello', difficulty: 'easy'},
      {text: 'World', difficulty: 'easy'},
      {text: 'Test', difficulty: 'easy'},
    ];

    it('clamp index âm về 0', () => {
      useSpeakingStore.getState().setSentences(mockSentences as any);
      useSpeakingStore.getState().setCurrentIndex(-5);
      expect(useSpeakingStore.getState().currentIndex).toBe(0);
    });

    it('clamp index vượt quá length về max', () => {
      useSpeakingStore.getState().setSentences(mockSentences as any);
      useSpeakingStore.getState().setCurrentIndex(999);
      expect(useSpeakingStore.getState().currentIndex).toBe(2);
    });

    it('clamp hoạt động khi sentences rỗng', () => {
      useSpeakingStore.getState().setCurrentIndex(5);
      expect(useSpeakingStore.getState().currentIndex).toBe(0);
    });
  });

  // Fix T-1: Verify giá trị cuối cùng thay vì chỉ check "không crash"
  describe('EC-m07: nextSentence khi sentences rỗng', () => {
    it('nextSentence không crash và giữ index hợp lệ khi sentences rỗng', () => {
      expect(() => {
        useSpeakingStore.getState().nextSentence();
      }).not.toThrow();
      // currentIndex phải >= 0 (không bị âm)
      const index = useSpeakingStore.getState().currentIndex;
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  describe('EC-M10: setTtsSettings.speed validation', () => {
    it('clamp speed dưới 0.25 về 0.25', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 0});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(0.25);
    });

    it('clamp speed âm về 0.25', () => {
      useSpeakingStore.getState().setTtsSettings({speed: -1});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(0.25);
    });

    it('clamp speed trên 4.0 về 4.0', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 10});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(4.0);
    });

    it('giữ nguyên speed hợp lệ', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 1.5});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(1.5);
    });

    it('không thay đổi speed khi chỉ update provider', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 2.0});
      useSpeakingStore.getState().setTtsSettings({provider: 'azure'});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(2.0);
    });
  });
});

// ==============================================================
// 7. useListeningStore — Edge Cases (EC-M04, EC-m08)
// ==============================================================

describe('useListeningStore — Edge Cases', () => {
  beforeEach(() => {
    useListeningStore.getState().reset();
  });

  describe('EC-M04: setPlaybackSpeed validation', () => {
    it('clamp speed 0 về 0.25', () => {
      useListeningStore.getState().setPlaybackSpeed(0);
      expect(useListeningStore.getState().playbackSpeed).toBe(0.25);
    });

    it('clamp speed âm về 0.25', () => {
      useListeningStore.getState().setPlaybackSpeed(-1);
      expect(useListeningStore.getState().playbackSpeed).toBe(0.25);
    });

    it('clamp speed quá cao về 4.0', () => {
      useListeningStore.getState().setPlaybackSpeed(10);
      expect(useListeningStore.getState().playbackSpeed).toBe(4.0);
    });

    it('giữ nguyên speed hợp lệ', () => {
      useListeningStore.getState().setPlaybackSpeed(1.5);
      expect(useListeningStore.getState().playbackSpeed).toBe(1.5);
    });
  });

  describe('EC-m08: toggleFavorite với ID không tồn tại', () => {
    it('thêm ID mới vào favorites (noop an toàn)', () => {
      useListeningStore.getState().toggleFavorite('non-existent-id');
      expect(
        useListeningStore.getState().favoriteScenarioIds,
      ).toContain('non-existent-id');
    });

    it('toggle lại → xóa ID', () => {
      useListeningStore.getState().toggleFavorite('test-id');
      useListeningStore.getState().toggleFavorite('test-id');
      expect(
        useListeningStore.getState().favoriteScenarioIds,
      ).not.toContain('test-id');
    });
  });

  describe('TTS Settings validation', () => {
    it('clamp ttsPitch ngoài biên', () => {
      useListeningStore.getState().setTtsPitch(-50);
      expect(useListeningStore.getState().ttsPitch).toBe(-20);

      useListeningStore.getState().setTtsPitch(50);
      expect(useListeningStore.getState().ttsPitch).toBe(20);
    });

    it('clamp ttsRate ngoài biên', () => {
      useListeningStore.getState().setTtsRate(-100);
      expect(useListeningStore.getState().ttsRate).toBe(-20);

      useListeningStore.getState().setTtsRate(100);
      expect(useListeningStore.getState().ttsRate).toBe(20);
    });

    it('clamp ttsVolume ngoài biên', () => {
      useListeningStore.getState().setTtsVolume(-10);
      expect(useListeningStore.getState().ttsVolume).toBe(0);

      useListeningStore.getState().setTtsVolume(200);
      expect(useListeningStore.getState().ttsVolume).toBe(100);
    });
  });
});

// ==============================================================
// 8. useAudioPlayerStore — Edge Cases (EC-M04)
// ==============================================================

describe('useAudioPlayerStore — Edge Cases', () => {
  beforeEach(() => {
    useAudioPlayerStore.getState().resetPlayer();
  });

  describe('EC-M04: setPlaybackSpeed validation', () => {
    it('clamp speed 0 về 0.25', () => {
      useAudioPlayerStore.getState().setPlaybackSpeed(0);
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(0.25);
    });

    it('clamp speed quá cao về 4.0', () => {
      useAudioPlayerStore.getState().setPlaybackSpeed(99);
      expect(useAudioPlayerStore.getState().playbackSpeed).toBe(4.0);
    });
  });

  describe('setVolume validation', () => {
    it('clamp volume âm về 0', () => {
      useAudioPlayerStore.getState().setVolume(-1);
      expect(useAudioPlayerStore.getState().volume).toBe(0);
    });

    it('clamp volume quá 1 về 1', () => {
      useAudioPlayerStore.getState().setVolume(5);
      expect(useAudioPlayerStore.getState().volume).toBe(1);
    });
  });
});

// ==============================================================
// 9. useHistoryStore — Edge Cases (EC-M08)
// ==============================================================

describe('useHistoryStore — Edge Cases', () => {
  beforeEach(() => {
    useHistoryStore.getState().reset();
  });

  describe('EC-M08: appendEntries loại trùng lặp', () => {
    it('không thêm entries trùng ID', () => {
      const entries = [
        {id: '1', type: 'listening', topic: 'Test', createdAt: '2024-01-01', isPinned: false, isFavorite: false},
        {id: '2', type: 'speaking', topic: 'Test2', createdAt: '2024-01-01', isPinned: false, isFavorite: false},
      ];
      useHistoryStore.getState().setEntries(entries as any);

      // Append entries có 1 trùng (id: '2') + 1 mới (id: '3')
      const newEntries = [
        {id: '2', type: 'speaking', topic: 'Duplicate', createdAt: '2024-01-02', isPinned: false, isFavorite: false},
        {id: '3', type: 'speaking', topic: 'New', createdAt: '2024-01-02', isPinned: false, isFavorite: false},
      ];
      useHistoryStore.getState().appendEntries(newEntries as any);

      const result = useHistoryStore.getState().entries;
      expect(result).toHaveLength(3); // 2 cũ + 1 mới (không trùng)
      expect(result.map(e => e.id)).toEqual(['1', '2', '3']);
    });

    it('appendEntries với mảng rỗng không thay đổi state', () => {
      const entries = [
        {id: '1', type: 'listening', topic: 'Test', createdAt: '2024-01-01', isPinned: false, isFavorite: false},
      ];
      useHistoryStore.getState().setEntries(entries as any);
      useHistoryStore.getState().appendEntries([]);
      expect(useHistoryStore.getState().entries).toHaveLength(1);
    });
  });

  describe('Optimistic updates', () => {
    it('togglePinLocal toggle đúng entry', () => {
      const entries = [
        {id: '1', isPinned: false, isFavorite: false} as any,
        {id: '2', isPinned: false, isFavorite: false} as any,
      ];
      useHistoryStore.getState().setEntries(entries);

      useHistoryStore.getState().togglePinLocal('1');
      expect(useHistoryStore.getState().entries[0].isPinned).toBe(true);
      expect(useHistoryStore.getState().entries[1].isPinned).toBe(false);
    });

    it('toggleFavoriteLocal toggle đúng entry', () => {
      const entries = [
        {id: '1', isPinned: false, isFavorite: false} as any,
      ];
      useHistoryStore.getState().setEntries(entries);

      useHistoryStore.getState().toggleFavoriteLocal('1');
      expect(useHistoryStore.getState().entries[0].isFavorite).toBe(true);

      useHistoryStore.getState().toggleFavoriteLocal('1');
      expect(useHistoryStore.getState().entries[0].isFavorite).toBe(false);
    });

    it('removeEntryLocal với ID không tồn tại → không crash', () => {
      const entries = [{id: '1', isPinned: false, isFavorite: false} as any];
      useHistoryStore.getState().setEntries(entries);

      useHistoryStore.getState().removeEntryLocal('non-existent');
      expect(useHistoryStore.getState().entries).toHaveLength(1);
    });
  });

  describe('Filters', () => {
    it('setFilters reset page về 1', () => {
      useHistoryStore.getState().setFilters({page: 5} as any);
      useHistoryStore.getState().setFilters({type: 'listening'});
      expect(useHistoryStore.getState().filters.page).toBe(1);
    });

    it('setSearchQuery cập nhật cả searchQuery và filters.search', () => {
      useHistoryStore.getState().setSearchQuery('hello');
      expect(useHistoryStore.getState().searchQuery).toBe('hello');
      expect(useHistoryStore.getState().filters.search).toBe('hello');
      expect(useHistoryStore.getState().filters.page).toBe(1);
    });
  });
});

// ==============================================================
// 10. useAuthStore — Edge Cases (EC-m09)
// ==============================================================

describe('useAuthStore — Edge Cases', () => {
  // Fix T-2: Dùng default state thực tế của store
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    });
  });

  it('EC-m09: reset phải clear isInitialized', () => {
    // Giả lập user đã đăng nhập
    useAuthStore.getState().setUser({id: 'test-user'} as any);
    useAuthStore.getState().setSession({access_token: 'token'} as any);
    useAuthStore.getState().setInitialized();

    expect(useAuthStore.getState().isInitialized).toBe(true);

    // Reset (logout)
    useAuthStore.getState().reset();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isInitialized).toBe(false);
  });
});

// ==============================================================
// 11. useVocabularyStore — Edge Cases (EC-M12)
// ==============================================================

describe('useVocabularyStore — Edge Cases', () => {
  beforeEach(() => {
    useVocabularyStore.getState().clearAll();
  });

  it('addWord không thêm trùng lặp (case-insensitive)', () => {
    useVocabularyStore.getState().addWord('Hello', 'listening');
    useVocabularyStore.getState().addWord('hello', 'listening');
    useVocabularyStore.getState().addWord('HELLO', 'listening');

    expect(useVocabularyStore.getState().words).toHaveLength(1);
    expect(useVocabularyStore.getState().words[0].word).toBe('hello');
  });

  it('addWord trim whitespace', () => {
    useVocabularyStore.getState().addWord('  world  ', 'listening');
    expect(useVocabularyStore.getState().words[0].word).toBe('world');
  });

  it('hasWord kiểm tra đúng (case-insensitive)', () => {
    useVocabularyStore.getState().addWord('test', 'listening');
    expect(useVocabularyStore.getState().hasWord('TEST')).toBe(true);
    expect(useVocabularyStore.getState().hasWord('  test  ')).toBe(true);
    expect(useVocabularyStore.getState().hasWord('other')).toBe(false);
  });

  it('removeWord xóa đúng (case-insensitive)', () => {
    useVocabularyStore.getState().addWord('apple', 'listening');
    useVocabularyStore.getState().addWord('banana', 'listening');

    useVocabularyStore.getState().removeWord('APPLE');
    expect(useVocabularyStore.getState().words).toHaveLength(1);
    expect(useVocabularyStore.getState().words[0].word).toBe('banana');
  });

  it('clearAll xóa tất cả', () => {
    useVocabularyStore.getState().addWord('a', 'listening');
    useVocabularyStore.getState().addWord('b', 'listening');
    useVocabularyStore.getState().addWord('c', 'listening');

    useVocabularyStore.getState().clearAll();
    expect(useVocabularyStore.getState().words).toEqual([]);
  });

  it('addWord lưu metadata đầy đủ', () => {
    useVocabularyStore.getState().addWord(
      'phrase',
      'listening',
      'Cụm từ',
      'This is a common phrase',
    );

    const word = useVocabularyStore.getState().words[0];
    expect(word.word).toBe('phrase');
    expect(word.source).toBe('listening');
    expect(word.meaning).toBe('Cụm từ');
    expect(word.context).toBe('This is a common phrase');
    expect(word.savedAt).toBeTruthy();
  });
});

// ==============================================================
// 12. useSpeakingStore — AI Conversation Edge Cases
// ==============================================================

describe('useSpeakingStore — AI Conversation Edge Cases', () => {
  beforeEach(() => {
    useSpeakingStore.getState().reset();
  });

  it('startConversation khởi tạo session đúng mode', () => {
    useSpeakingStore.getState().setConversationSetup({
      mode: 'free-talk',
      topicId: 'topic-1',
      topicName: 'Travel',
      topicDescription: 'Talking about travel',
      persona: null,
      difficulty: 'medium',
      durationMinutes: 5,
      maxTurns: 0,
      feedbackMode: 'intermediate',
      options: {showSuggestions: true, inlineGrammarFix: true, pronunciationAlert: true},
    });
    useSpeakingStore.getState().startConversation();

    const session = useSpeakingStore.getState().conversationSession;
    expect(session?.isActive).toBe(true);
    expect(session?.messages).toEqual([]);
  });

  it('addConversationMessage thêm message đúng', () => {
    useSpeakingStore.getState().setConversationSetup({
      mode: 'free-talk',
      topicId: null,
      topicName: 'General',
      topicDescription: '',
      persona: null,
      difficulty: 'easy',
      durationMinutes: 3,
      maxTurns: 0,
      feedbackMode: 'beginner',
      options: {showSuggestions: true, inlineGrammarFix: true, pronunciationAlert: true},
    });
    useSpeakingStore.getState().startConversation();

    useSpeakingStore.getState().addConversationMessage({
      id: 'msg-1',
      role: 'user',
      text: 'Hello!',
      timestamp: Date.now(),
    });

    const session = useSpeakingStore.getState().conversationSession;
    expect(session?.messages).toHaveLength(1);
    expect(session?.messages[0].text).toBe('Hello!');
  });

  it('endConversation đặt isActive = false', () => {
    useSpeakingStore.getState().setConversationSetup({
      mode: 'roleplay',
      topicId: 'rp-1',
      topicName: 'Doctor',
      topicDescription: 'Visit doctor',
      persona: {name: 'Dr. Smith', role: 'Doctor', avatar: '👨‍⚕️', greeting: 'Hello!', systemPrompt: 'Be a doctor'},
      difficulty: 'hard',
      durationMinutes: 0,
      maxTurns: 10,
      feedbackMode: 'advanced',
      options: {showSuggestions: false, inlineGrammarFix: true, pronunciationAlert: true},
    });
    useSpeakingStore.getState().startConversation();

    useSpeakingStore.getState().endConversation();
    expect(useSpeakingStore.getState().conversationSession?.isActive).toBe(false);
  });

  it('incrementTurn tăng currentTurn', () => {
    useSpeakingStore.getState().setConversationSetup({
      mode: 'roleplay',
      topicId: null,
      topicName: 'Test',
      topicDescription: '',
      persona: null,
      difficulty: 'easy',
      durationMinutes: 0,
      maxTurns: 8,
      feedbackMode: 'beginner',
      options: {showSuggestions: true, inlineGrammarFix: false, pronunciationAlert: false},
    });
    useSpeakingStore.getState().startConversation();

    useSpeakingStore.getState().incrementTurn();
    useSpeakingStore.getState().incrementTurn();
    expect(useSpeakingStore.getState().conversationSession?.currentTurn).toBe(2);
  });

  it('resetConversation xóa hết state conversation', () => {
    useSpeakingStore.getState().setConversationSetup({
      mode: 'free-talk',
      topicId: null,
      topicName: 'Test',
      topicDescription: '',
      persona: null,
      difficulty: 'easy',
      durationMinutes: 5,
      maxTurns: 0,
      feedbackMode: 'beginner',
      options: {showSuggestions: true, inlineGrammarFix: true, pronunciationAlert: true},
    });
    useSpeakingStore.getState().startConversation();
    useSpeakingStore.getState().addConversationMessage({
      id: 'msg-1', role: 'user', text: 'Hi', timestamp: Date.now(),
    });

    useSpeakingStore.getState().resetConversation();
    expect(useSpeakingStore.getState().conversationSession).toBeNull();
    expect(useSpeakingStore.getState().conversationSetup).toBeNull();
  });
});

// ==============================================================
// 13. useShadowingStore — Edge Cases (TEST-1)
// ==============================================================

describe('useShadowingStore — Edge Cases', () => {
  const mockSentences = [
    {id: 's1', text: 'Hello world', ipa: '/h\u0259\u02c8lo\u028a w\u025c\u02d0ld/', audioUrl: '', duration: 2, difficulty: 'easy' as const},
    {id: 's2', text: 'Good morning', ipa: '/\u0261\u028ad \u02c8m\u0254\u02d0n\u026a\u014b/', audioUrl: '', duration: 3, difficulty: 'medium' as const},
    {id: 's3', text: 'Nice to meet you', ipa: '/na\u026as t\u0259 mi\u02d0t ju\u02d0/', audioUrl: '', duration: 4, difficulty: 'hard' as const},
  ];

  beforeEach(() => {
    useShadowingStore.getState().reset();
  });

  describe('setDelay validation', () => {
    it('clamp delay \u00e2m v\u1ec1 0', () => {
      useShadowingStore.getState().setDelay(-1);
      expect(useShadowingStore.getState().config.delay).toBe(0);
    });

    it('clamp delay > 2.0 v\u1ec1 2.0', () => {
      useShadowingStore.getState().setDelay(5);
      expect(useShadowingStore.getState().config.delay).toBe(2.0);
    });

    it('gi\u1eef delay h\u1ee3p l\u1ec7', () => {
      useShadowingStore.getState().setDelay(1.0);
      expect(useShadowingStore.getState().config.delay).toBe(1.0);
    });

    it('delay boundary: 0 v\u00e0 2.0', () => {
      useShadowingStore.getState().setDelay(0);
      expect(useShadowingStore.getState().config.delay).toBe(0);
      useShadowingStore.getState().setDelay(2.0);
      expect(useShadowingStore.getState().config.delay).toBe(2.0);
    });
  });

  describe('updateSentenceAudioUrl bounds', () => {
    it('index ngo\u00e0i bounds (> length) kh\u00f4ng crash', () => {
      useShadowingStore.getState().startSession(mockSentences);
      expect(() => {
        useShadowingStore.getState().updateSentenceAudioUrl(999, 'http://audio.mp3');
      }).not.toThrow();
      expect(useShadowingStore.getState().session.sentences[0].audioUrl).toBe('');
    });

    it('index \u00e2m kh\u00f4ng crash', () => {
      useShadowingStore.getState().startSession(mockSentences);
      expect(() => {
        useShadowingStore.getState().updateSentenceAudioUrl(-1, 'http://audio.mp3');
      }).not.toThrow();
    });

    it('c\u1eadp nh\u1eadt \u0111\u00fang v\u1edbi index h\u1ee3p l\u1ec7', () => {
      useShadowingStore.getState().startSession(mockSentences);
      useShadowingStore.getState().updateSentenceAudioUrl(1, 'http://new-audio.mp3');
      expect(useShadowingStore.getState().session.sentences[1].audioUrl).toBe('http://new-audio.mp3');
      expect(useShadowingStore.getState().session.sentences[0].audioUrl).toBe('');
    });
  });

  describe('nextSentence boundary', () => {
    it('nextSentence kh\u00f4ng v\u01b0\u1ee3t qu\u00e1 last index', () => {
      useShadowingStore.getState().startSession(mockSentences);
      useShadowingStore.getState().nextSentence();
      useShadowingStore.getState().nextSentence();
      useShadowingStore.getState().nextSentence();
      useShadowingStore.getState().nextSentence();

      const session = useShadowingStore.getState().session;
      expect(session.isCompleted).toBe(true);
      expect(session.currentIndex).toBeLessThan(session.totalSentences);
    });

    it('nextSentence v\u1edbi session r\u1ed7ng kh\u00f4ng crash', () => {
      expect(() => {
        useShadowingStore.getState().nextSentence();
      }).not.toThrow();
    });
  });

  describe('repeatSentence', () => {
    it('gi\u1eef nguy\u00ean currentIndex khi repeat', () => {
      useShadowingStore.getState().startSession(mockSentences);
      useShadowingStore.getState().nextSentence();
      useShadowingStore.getState().repeatSentence();
      expect(useShadowingStore.getState().session.currentIndex).toBe(1);
      expect(useShadowingStore.getState().phase.current).toBe('preview');
    });
  });

  describe('reset', () => {
    it('reset x\u00f3a h\u1ebft state v\u1ec1 initial', () => {
      useShadowingStore.getState().startSession(mockSentences);
      useShadowingStore.getState().setDelay(1.5);
      useShadowingStore.getState().nextSentence();

      useShadowingStore.getState().reset();
      expect(useShadowingStore.getState().session.sentences).toEqual([]);
      expect(useShadowingStore.getState().session.currentIndex).toBe(0);
      expect(useShadowingStore.getState().phase.current).toBe('preview');
      expect(useShadowingStore.getState().sessionResults).toEqual([]);
    });
  });
});

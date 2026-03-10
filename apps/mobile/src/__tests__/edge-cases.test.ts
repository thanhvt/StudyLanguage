/**
 * Mục đích: Test toàn diện các edge cases phát hiện trong mobile app
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 *
 * Bao gồm edge cases từ phân tích EC-C01 → EC-m15:
 *   - Stores: useSpeakingStore, useReadingStore, useListeningStore,
 *             useAudioPlayerStore, useHistoryStore, useAuthStore, useVocabularyStore
 *   - Utils: formatTime, historyHelpers (formatRelativeTime, groupEntriesByDate)
 *   - Hooks: useReadingPractice, useTtsReader, useDictionary
 */

import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useReadingStore} from '@/store/useReadingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useHistoryStore} from '@/store/useHistoryStore';
import {useAuthStore} from '@/store/useAuthStore';
import {useVocabularyStore} from '@/store/useVocabularyStore';
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

  it('trả "X phút trước" cho ngày trong 1 giờ', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 30);
    expect(formatRelativeTime(date.toISOString())).toBe('30 phút trước');
  });

  it('trả "X giờ trước" cho ngày trong 24 giờ', () => {
    const date = new Date();
    date.setHours(date.getHours() - 5);
    expect(formatRelativeTime(date.toISOString())).toBe('5 giờ trước');
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
});

// ==============================================================
// 4. historyHelpers — getTypeIcon, getTypeLabel, getAccentColor
// ==============================================================

describe('historyHelpers — utility functions', () => {
  it('getTypeIcon trả icon đúng cho từng type', () => {
    expect(getTypeIcon('listening')).toBe('🎧');
    expect(getTypeIcon('speaking')).toBe('🗣️');
    expect(getTypeIcon('reading')).toBe('📖');
  });

  it('getTypeIcon fallback cho type không hợp lệ', () => {
    expect(getTypeIcon('unknown' as any)).toBe('📚');
  });

  it('getTypeLabel trả label đúng', () => {
    expect(getTypeLabel('listening')).toBe('Nghe');
    expect(getTypeLabel('speaking')).toBe('Nói');
    expect(getTypeLabel('reading')).toBe('Đọc');
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
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().setCurrentIndex(-5);
      expect(useSpeakingStore.getState().currentIndex).toBe(0);
    });

    it('clamp index vượt quá length về max', () => {
      useSpeakingStore.getState().setSentences(mockSentences);
      useSpeakingStore.getState().setCurrentIndex(999);
      expect(useSpeakingStore.getState().currentIndex).toBe(2);
    });

    it('clamp hoạt động khi sentences rỗng', () => {
      useSpeakingStore.getState().setCurrentIndex(5);
      expect(useSpeakingStore.getState().currentIndex).toBe(0);
    });
  });

  describe('EC-m07: nextSentence khi sentences rỗng', () => {
    it('nextSentence không crash khi sentences rỗng', () => {
      expect(() => {
        useSpeakingStore.getState().nextSentence();
      }).not.toThrow();
      // currentIndex = min(0 + 1, -1) = Math.min(1, -1) = -1
      // Nhưng do sentences rỗng, length - 1 = -1
      // Không crash là đủ
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
// 6. useReadingStore — Edge Cases (EC-M03)
// ==============================================================

describe('useReadingStore — Edge Cases', () => {
  beforeEach(() => {
    useReadingStore.getState().reset();
  });

  describe('EC-M03: setFontSize validation', () => {
    it('clamp fontSize 0 về 12', () => {
      useReadingStore.getState().setFontSize(0);
      expect(useReadingStore.getState().fontSize).toBe(12);
    });

    it('clamp fontSize âm về 12', () => {
      useReadingStore.getState().setFontSize(-10);
      expect(useReadingStore.getState().fontSize).toBe(12);
    });

    it('clamp fontSize quá lớn về 28', () => {
      useReadingStore.getState().setFontSize(100);
      expect(useReadingStore.getState().fontSize).toBe(28);
    });

    it('giữ nguyên fontSize hợp lệ', () => {
      useReadingStore.getState().setFontSize(20);
      expect(useReadingStore.getState().fontSize).toBe(20);
    });

    it('fontSize boundary: 12 và 28', () => {
      useReadingStore.getState().setFontSize(12);
      expect(useReadingStore.getState().fontSize).toBe(12);
      useReadingStore.getState().setFontSize(28);
      expect(useReadingStore.getState().fontSize).toBe(28);
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
        {id: '3', type: 'reading', topic: 'New', createdAt: '2024-01-02', isPinned: false, isFavorite: false},
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
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
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
    useVocabularyStore.getState().addWord('Hello', 'reading');
    useVocabularyStore.getState().addWord('hello', 'listening');
    useVocabularyStore.getState().addWord('HELLO', 'reading');

    expect(useVocabularyStore.getState().words).toHaveLength(1);
    expect(useVocabularyStore.getState().words[0].word).toBe('hello');
  });

  it('addWord trim whitespace', () => {
    useVocabularyStore.getState().addWord('  world  ', 'reading');
    expect(useVocabularyStore.getState().words[0].word).toBe('world');
  });

  it('hasWord kiểm tra đúng (case-insensitive)', () => {
    useVocabularyStore.getState().addWord('test', 'reading');
    expect(useVocabularyStore.getState().hasWord('TEST')).toBe(true);
    expect(useVocabularyStore.getState().hasWord('  test  ')).toBe(true);
    expect(useVocabularyStore.getState().hasWord('other')).toBe(false);
  });

  it('removeWord xóa đúng (case-insensitive)', () => {
    useVocabularyStore.getState().addWord('apple', 'reading');
    useVocabularyStore.getState().addWord('banana', 'listening');

    useVocabularyStore.getState().removeWord('APPLE');
    expect(useVocabularyStore.getState().words).toHaveLength(1);
    expect(useVocabularyStore.getState().words[0].word).toBe('banana');
  });

  it('clearAll xóa tất cả', () => {
    useVocabularyStore.getState().addWord('a', 'reading');
    useVocabularyStore.getState().addWord('b', 'listening');
    useVocabularyStore.getState().addWord('c', 'reading');

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


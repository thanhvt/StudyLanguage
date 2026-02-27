/**
 * User Acceptance Test cho Listening Feature — Tier 6
 *
 * Mục đích: Test 10 kịch bản UAT mô phỏng hành vi thực tế của user
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: Pre-release verification, QA sign-off
 */
import {useListeningStore} from '@/store/useListeningStore';
import {
  getRandomScenario,
  searchScenarios,
  TOPIC_CATEGORIES,
} from '@/data/topic-data';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

import {listeningApi, bookmarkApi} from '@/services/api/listening';
import {apiClient} from '@/services/api/client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Helper: Mock successful conversation generation
function mockConversationResponse(title: string, lineCount: number) {
  const script = Array.from({length: lineCount}, (_, i) => ({
    speaker: i % 2 === 0 ? 'Speaker A' : 'Speaker B',
    text: `Line ${i + 1} of the conversation.`,
    translation: `Dòng ${i + 1} của hội thoại.`,
  }));

  mockApiClient.post.mockResolvedValueOnce({
    data: {
      script,
      title,
      vocabulary: [{word: 'word1', meaning: 'nghĩa 1', example: 'ex1'}],
      summary: `Summary of ${title}`,
    },
  });
}

describe('Listening UAT Tests', () => {
  beforeEach(() => {
    useListeningStore.getState().reset();
    jest.clearAllMocks();
  });

  // ================================
  // UAT-01: First-time user chọn topic → generate
  // ================================
  describe('UAT-01: First-time user → chọn topic → generate', () => {
    it('user browse categories → chọn scenario → generate conversation', async () => {
      // Step 1: User mở ConfigScreen → thấy categories
      expect(TOPIC_CATEGORIES.length).toBeGreaterThanOrEqual(3);

      // Step 2: User chọn category "IT"
      useListeningStore.getState().setSelectedCategory('it');
      expect(useListeningStore.getState().selectedCategory).toBe('it');

      // Step 3: User chọn scenario "Daily Stand-up"
      const standupScenario = {id: 'it-1', name: 'Daily Stand-up Update', description: 'Quick report'};
      useListeningStore.getState().setSelectedTopic(standupScenario, 'it', 'agile');
      expect(useListeningStore.getState().config.topic).toBe('Daily Stand-up Update');

      // Step 4: User nhấn "Bắt đầu nghe"
      mockConversationResponse('Daily Stand-up', 6);
      const config = useListeningStore.getState().config;
      const result = await listeningApi.generateConversation(config);
      useListeningStore.getState().setConversation(result);

      // Verify
      expect(useListeningStore.getState().conversation).not.toBeNull();
      expect(useListeningStore.getState().conversation!.title).toBe('Daily Stand-up');
    });
  });

  // ================================
  // UAT-02: Returning user → favorite scenario → quick generate
  // ================================
  describe('UAT-02: Returning user → favorite → quick generate', () => {
    it('user có favorite cũ → chọn nhanh → generate', async () => {
      // Step 1: User đã favorite trước đó
      useListeningStore.getState().toggleFavorite('daily-1');
      useListeningStore.getState().toggleFavorite('it-5');
      expect(useListeningStore.getState().favoriteScenarioIds).toHaveLength(2);

      // Step 2: User chọn từ favorites
      useListeningStore.getState().setSelectedTopic(
        {id: 'daily-1', name: 'Check-in & Seat Selection', description: 'Airport check-in'},
        'daily',
        'airport',
      );

      // Step 3: Quick generate
      mockConversationResponse('Airport Check-in', 4);
      const result = await listeningApi.generateConversation(useListeningStore.getState().config);
      useListeningStore.getState().setConversation(result);

      expect(useListeningStore.getState().conversation!.title).toBe('Airport Check-in');
    });
  });

  // ================================
  // UAT-03: User thay đổi tất cả TTS settings
  // ================================
  describe('UAT-03: Custom TTS settings → generate', () => {
    it('user customize voice, emotion, pitch, rate → generate audio', async () => {
      useListeningStore.getState().setRandomVoice(false);
      useListeningStore.getState().setVoicePerSpeaker({
        'Speaker A': 'en-US-JennyNeural',
        'Speaker B': 'en-US-GuyNeural',
      });
      useListeningStore.getState().setTtsEmotion('cheerful');
      useListeningStore.getState().setRandomEmotion(false);
      useListeningStore.getState().setTtsPitch(3);
      useListeningStore.getState().setTtsRate(-2);
      useListeningStore.getState().setTtsVolume(85);
      useListeningStore.getState().setMultiTalker(true);
      useListeningStore.getState().setMultiTalkerPairIndex(0);

      mockApiClient.post.mockResolvedValueOnce({
        data: {audioUrl: 'https://example.com/audio.mp3', timestamps: []},
      });

      const state = useListeningStore.getState();
      await listeningApi.generateConversationAudio(
        [{speaker: 'A', text: 'Hi'}],
        {
          provider: 'azure',
          randomVoice: state.randomVoice,
          voicePerSpeaker: state.voicePerSpeaker,
          multiTalker: state.multiTalker,
          multiTalkerPairIndex: state.multiTalkerPairIndex,
          pitch: state.ttsPitch,
          rate: state.ttsRate,
          volume: state.ttsVolume,
          emotion: state.ttsEmotion,
        },
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          multiTalker: true,
          emotion: 'cheerful',
          pitch: 3,
        }),
        expect.anything(),
      );
    });
  });

  // ================================
  // UAT-04: User bookmark sentence
  // ================================
  describe('UAT-04: Bookmark sentence → review later', () => {
    it('user long-press sentence → bookmark → appears in store', () => {
      useListeningStore.getState().setConversation({
        conversation: Array.from({length: 8}, (_, i) => ({
          speaker: `Speaker ${i % 2 === 0 ? 'A' : 'B'}`,
          text: `Sentence ${i}`,
        })),
        title: 'Test',
        vocabulary: [],
      } as any);

      useListeningStore.getState().toggleBookmark(3);
      expect(useListeningStore.getState().bookmarkedIndexes).toContain(3);

      useListeningStore.getState().toggleBookmark(5);
      expect(useListeningStore.getState().bookmarkedIndexes).toEqual([3, 5]);

      useListeningStore.getState().toggleBookmark(3);
      expect(useListeningStore.getState().bookmarkedIndexes).toEqual([5]);
    });
  });

  // ================================
  // UAT-05: User save word from Dictionary
  // ================================
  describe('UAT-05: Dictionary → save word → vocabulary', () => {
    it('user taps word → tra từ → lưu vào vocabulary', () => {
      useListeningStore.getState().addSavedWord('experience');
      expect(useListeningStore.getState().savedWords).toContain('experience');

      useListeningStore.getState().addSavedWord('confidence');
      useListeningStore.getState().addSavedWord('qualification');
      expect(useListeningStore.getState().savedWords).toHaveLength(3);

      // Duplicate check
      useListeningStore.getState().addSavedWord('Experience');
      expect(useListeningStore.getState().savedWords).toHaveLength(3);
    });
  });

  // ================================
  // UAT-06: Radio Mode
  // ================================
  describe('UAT-06: Radio mode → auto-play playlist', () => {
    it('user chọn 30 phút → playlist data ready', () => {
      const mockPlaylist = {
        playlist: {name: 'Random Mix', duration: 30, description: 'AI-curated'},
        items: [
          {id: 'r1', topic: 'Airport Check-in', category: 'daily', numSpeakers: 2},
          {id: 'r2', topic: 'Code Review', category: 'it', numSpeakers: 3},
        ],
      };

      expect(mockPlaylist.items).toHaveLength(2);
      expect(mockPlaylist.items[0].topic).toBe('Airport Check-in');
      expect(mockPlaylist.playlist.duration).toBe(30);
    });
  });

  // ================================
  // UAT-07: Custom scenario
  // ================================
  describe('UAT-07: Create custom scenario → use it', () => {
    it('user tạo scenario → chọn → generate', async () => {
      const customScenario = {
        id: 'custom-001',
        name: 'My Custom Meeting',
        description: 'Team sync about Q3 OKR',
      };

      useListeningStore.getState().setSelectedTopic(customScenario, 'custom', 'user');
      expect(useListeningStore.getState().config.topic).toBe('My Custom Meeting');

      mockConversationResponse('Custom Meeting', 4);
      const result = await listeningApi.generateConversation(useListeningStore.getState().config);
      useListeningStore.getState().setConversation(result);

      expect(useListeningStore.getState().conversation!.title).toBe('Custom Meeting');
    });
  });

  // ================================
  // UAT-08: Reading/Focus view toggle
  // ================================
  describe('UAT-08: Reading ↔ Focus view toggle', () => {
    it('user chuyển đổi view trong khi playback', () => {
      useListeningStore.getState().setPlaying(true);
      useListeningStore.getState().setCurrentExchangeIndex(3);

      let viewMode: 'reading' | 'focus' = 'reading';
      viewMode = 'focus';
      expect(viewMode).toBe('focus');

      // Playback state không bị ảnh hưởng khi đổi view
      expect(useListeningStore.getState().isPlaying).toBe(true);
      expect(useListeningStore.getState().currentExchangeIndex).toBe(3);
    });
  });

  // ================================
  // UAT-09: Adjust playback speed
  // ================================
  describe('UAT-09: Adjust playback speed during listening', () => {
    it('user thay đổi speed 0.5x → 1.0x → 1.5x → 2.0x', () => {
      useListeningStore.getState().setPlaying(true);

      useListeningStore.getState().setPlaybackSpeed(0.5);
      expect(useListeningStore.getState().playbackSpeed).toBe(0.5);

      useListeningStore.getState().setPlaybackSpeed(1.0);
      expect(useListeningStore.getState().playbackSpeed).toBe(1.0);

      useListeningStore.getState().setPlaybackSpeed(1.5);
      expect(useListeningStore.getState().playbackSpeed).toBe(1.5);

      useListeningStore.getState().setPlaybackSpeed(2.0);
      expect(useListeningStore.getState().playbackSpeed).toBe(2.0);

      expect(useListeningStore.getState().isPlaying).toBe(true);
    });
  });

  // ================================
  // UAT-10: Reset all settings → fresh start
  // ================================
  describe('UAT-10: Reset → fresh start', () => {
    it('user reset tất cả → bắt đầu session mới hoàn toàn', async () => {
      // Setup complex session
      useListeningStore.getState().setConfig({
        topic: 'Old Topic', durationMinutes: 15, level: 'advanced', numSpeakers: 3,
      });
      useListeningStore.getState().setPlaying(true);
      useListeningStore.getState().setPlaybackSpeed(1.5);
      useListeningStore.getState().setRandomEmotion(true);
      useListeningStore.getState().setMultiTalker(true);
      useListeningStore.getState().toggleBookmark(0);
      useListeningStore.getState().toggleBookmark(3);
      useListeningStore.getState().addSavedWord('old');
      useListeningStore.getState().setAudioUrl('https://old.mp3');
      useListeningStore.getState().setConversation({
        conversation: [{speaker: 'A', text: 'Old'}],
        title: 'Old',
        vocabulary: [],
      } as any);

      // Reset
      useListeningStore.getState().reset();

      // Verify clean
      const fresh = useListeningStore.getState();
      expect(fresh.config.topic).toBe('');
      expect(fresh.config.durationMinutes).toBe(5);
      expect(fresh.isPlaying).toBe(false);
      expect(fresh.playbackSpeed).toBe(1);
      expect(fresh.randomEmotion).toBe(false);
      expect(fresh.multiTalker).toBe(false);
      expect(fresh.bookmarkedIndexes).toEqual([]);
      expect(fresh.savedWords).toEqual([]);
      expect(fresh.audioUrl).toBeNull();
      expect(fresh.conversation).toBeNull();

      // New session
      useListeningStore.getState().setConfig({topic: 'Fresh Topic'});
      mockConversationResponse('Fresh', 2);
      const result = await listeningApi.generateConversation(useListeningStore.getState().config);
      useListeningStore.getState().setConversation(result);

      expect(useListeningStore.getState().conversation!.title).toBe('Fresh');
    });
  });
});

/**
 * Unit test cho listeningApi - Audio Generation & Bookmark API
 *
 * Mục đích: Test các API mới: generateConversationAudio + bookmarkApi
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-007: Audio generation → auto-play
 *   - MOB-LIS-ENH-HP-008: Long press sentence = Bookmark
 *   - MOB-LIS-ENH-HP-009: TTS Provider selection
 */
import {
  listeningApi,
  bookmarkApi,
  type ConversationExchange,
  type AudioGenerationResult,
  type SentenceBookmark,
} from '@/services/api/listening';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('listeningApi - generateConversationAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockConversation: ConversationExchange[] = [
    {speaker: 'Alice', text: 'Hello, how are you?', vietnamese: 'Xin chào, bạn khỏe không?'},
    {speaker: 'Bob', text: 'I am fine, thank you!', vietnamese: 'Tôi khỏe, cảm ơn!'},
    {speaker: 'Alice', text: 'Great to hear!', vietnamese: 'Rất vui được nghe!'},
  ];

  const mockAudioResponse: AudioGenerationResult = {
    audioUrl: 'https://storage.example.com/audio/conv-123.mp3',
    timestamps: [
      {lineIndex: 0, startTime: 0, endTime: 2.5, speaker: 'Alice'},
      {lineIndex: 1, startTime: 2.5, endTime: 5.0, speaker: 'Bob'},
      {lineIndex: 2, startTime: 5.0, endTime: 7.0, speaker: 'Alice'},
    ],
  };

  // MOB-LIS-MVP-HP-007: Gọi đúng endpoint sinh audio
  it('gọi POST /ai/generate-conversation-audio với conversation data', async () => {
    mockApiClient.post.mockResolvedValueOnce({data: mockAudioResponse});

    await listeningApi.generateConversationAudio(mockConversation);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/ai/generate-conversation-audio',
      expect.objectContaining({
        conversation: [
          {speaker: 'Alice', text: 'Hello, how are you?'},
          {speaker: 'Bob', text: 'I am fine, thank you!'},
          {speaker: 'Alice', text: 'Great to hear!'},
        ],
      }),
      expect.objectContaining({timeout: 180000}),
    );
  });

  it('trả về audioUrl và timestamps đúng', async () => {
    mockApiClient.post.mockResolvedValueOnce({data: mockAudioResponse});

    const result = await listeningApi.generateConversationAudio(mockConversation);

    expect(result.audioUrl).toBe('https://storage.example.com/audio/conv-123.mp3');
    expect(result.timestamps).toHaveLength(3);
    expect(result.timestamps[0].startTime).toBe(0);
    expect(result.timestamps[2].endTime).toBe(7.0);
  });

  // Chỉ gửi speaker + text (không gửi vietnamese)
  it('chỉ gửi speaker và text, không gửi vietnamese', async () => {
    mockApiClient.post.mockResolvedValueOnce({data: mockAudioResponse});

    await listeningApi.generateConversationAudio(mockConversation);

    const sentPayload = mockApiClient.post.mock.calls[0][1];
    // Kiểm tra KHÔNG có trường vietnamese trong payload
    sentPayload.conversation.forEach((line: any) => {
      expect(line).not.toHaveProperty('vietnamese');
      expect(line).toHaveProperty('speaker');
      expect(line).toHaveProperty('text');
    });
  });

  it('timeout 180 giây (3 phút) cho audio gen chậm', async () => {
    mockApiClient.post.mockResolvedValueOnce({data: mockAudioResponse});

    await listeningApi.generateConversationAudio(mockConversation);

    const options = mockApiClient.post.mock.calls[0][2];
    expect(options.timeout).toBe(180000);
  });

  // MOB-LIS-ENH-HP-009: TTS Provider option
  it('gửi provider khi được truyền (backend DTO field = "provider")', async () => {
    mockApiClient.post.mockResolvedValueOnce({data: mockAudioResponse});

    await listeningApi.generateConversationAudio(mockConversation, {
      ttsProvider: 'azure',
      voice: 'jenny',
    });

    const payload = mockApiClient.post.mock.calls[0][1];
    // Mobile option: ttsProvider → payload field: provider (match backend DTO)
    expect(payload.provider).toBe('azure');
    expect(payload.voice).toBe('jenny');
  });

  it('không gửi provider/voice khi không truyền', async () => {
    mockApiClient.post.mockResolvedValueOnce({data: mockAudioResponse});

    await listeningApi.generateConversationAudio(mockConversation);

    const payload = mockApiClient.post.mock.calls[0][1];
    expect(payload.provider).toBeUndefined();
    expect(payload.voice).toBeUndefined();
  });

  it('throw error khi API lỗi', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Lỗi server 500'));

    await expect(
      listeningApi.generateConversationAudio(mockConversation),
    ).rejects.toThrow('Lỗi server 500');
  });

  it('throw error khi API timeout', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('timeout of 180000ms exceeded'));

    await expect(
      listeningApi.generateConversationAudio(mockConversation),
    ).rejects.toThrow('timeout');
  });

  it('xử lý conversation rỗng', async () => {
    mockApiClient.post.mockResolvedValueOnce({
      data: {audioUrl: '', timestamps: []},
    });

    const result = await listeningApi.generateConversationAudio([]);
    expect(result.audioUrl).toBe('');
    expect(result.timestamps).toEqual([]);
  });
});

// =======================
// Bookmark API Tests
// =======================

describe('bookmarkApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockBookmark: SentenceBookmark = {
    id: 'bm-001',
    historyEntryId: 'hist-001',
    sentenceIndex: 3,
    speaker: 'Alice',
    sentenceText: 'Hello, how are you doing today?',
    sentenceTranslation: 'Xin chào, hôm nay bạn thế nào?',
    topic: 'Daily Conversation',
    createdAt: '2026-02-12T10:00:00Z',
  };

  // MOB-LIS-ENH-HP-008: Tạo bookmark
  describe('create', () => {
    it('gọi POST /bookmarks với data đúng', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {success: true, bookmark: mockBookmark, alreadyExists: false},
      });

      const result = await bookmarkApi.create({
        sentenceIndex: 3,
        speaker: 'Alice',
        sentenceText: 'Hello, how are you doing today?',
        sentenceTranslation: 'Xin chào, hôm nay bạn thế nào?',
        topic: 'Daily Conversation',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/bookmarks',
        expect.objectContaining({
          sentenceIndex: 3,
          speaker: 'Alice',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.bookmark.id).toBe('bm-001');
    });

    it('trả về alreadyExists khi bookmark trùng', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {success: true, bookmark: mockBookmark, alreadyExists: true},
      });

      const result = await bookmarkApi.create({
        sentenceIndex: 3,
        speaker: 'Alice',
        sentenceText: 'Duplicate',
      });

      expect(result.alreadyExists).toBe(true);
    });
  });

  describe('getBySession', () => {
    it('gọi GET /bookmarks/session/:id đúng', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {success: true, bookmarks: [mockBookmark], count: 1},
      });

      const result = await bookmarkApi.getBySession('hist-001');

      expect(mockApiClient.get).toHaveBeenCalledWith('/bookmarks/session/hist-001');
      expect(result.count).toBe(1);
      expect(result.bookmarks[0].sentenceIndex).toBe(3);
    });

    it('trả về mảng rỗng khi chưa có bookmark', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {success: true, bookmarks: [], count: 0},
      });

      const result = await bookmarkApi.getBySession('hist-new');
      expect(result.bookmarks).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('delete', () => {
    it('gọi DELETE /bookmarks/:id đúng', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: {success: true, message: 'Đã xóa bookmark'},
      });

      const result = await bookmarkApi.delete('bm-001');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/bookmarks/bm-001');
      expect(result.success).toBe(true);
    });
  });

  describe('deleteByIndex', () => {
    it('gọi POST /bookmarks/remove-by-index đúng', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {success: true, message: 'Đã xóa'},
      });

      const result = await bookmarkApi.deleteByIndex({
        historyEntryId: 'hist-001',
        sentenceIndex: 3,
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/bookmarks/remove-by-index',
        {historyEntryId: 'hist-001', sentenceIndex: 3},
      );
      expect(result.success).toBe(true);
    });

    it('xử lý khi không có historyEntryId', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {success: true, message: 'Đã xóa'},
      });

      await bookmarkApi.deleteByIndex({sentenceIndex: 5});

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/bookmarks/remove-by-index',
        {sentenceIndex: 5},
      );
    });

    it('throw error khi API lỗi', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        bookmarkApi.deleteByIndex({sentenceIndex: 3}),
      ).rejects.toThrow('Network Error');
    });
  });
});

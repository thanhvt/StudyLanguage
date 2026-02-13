/**
 * Unit test cho listeningApi + bookmarkApi service
 *
 * Mục đích: Test API integration layer + mapping layer cho Listening feature
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-006: Start session → gọi API generate
 *   - MOB-LIS-MVP-ERR-002: Start khi mất mạng → error
 *   - MOB-LIS-MVP-ERR-003: API timeout → error
 *   - MAP-001: Backend script[] → mobile conversation[]
 *   - MAP-002: Backend translation → mobile vietnamese
 *   - MAP-003: Backend vocabulary objects → mobile strings
 *   - MAP-004: Duration clamping (5-15)
 *   - MOB-LIS-ENH-HP-008: Bookmark sentence API
 *   - MOB-LIS-ENH-HP-009: TTS provider
 *   - MOB-LIS-ENH-HP-010: TTS voice
 */
import {listeningApi, bookmarkApi} from '@/services/api/listening';
import {apiClient} from '@/services/api/client';

// Mock apiClient — bao gồm cả delete cho bookmark API
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('listeningApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateConversation', () => {
    // MOB-LIS-MVP-HP-006 + MAP-001/002/003: Generate thành công + mapping đúng
    it('map backend "script" thành "conversation" và "translation" thành "vietnamese"', async () => {
      // Mock response đúng format backend thực tế
      const mockResponse = {
        data: {
          script: [
            {
              speaker: 'Person A',
              text: 'Hello! How are you?',
              translation: 'Xin chào! Bạn khỏe không?',
              keyPhrases: ['How are you - Bạn khỏe không'],
            },
            {
              speaker: 'Person B',
              text: "I'm doing great, thanks!",
              translation: 'Tôi rất khỏe, cảm ơn!',
              keyPhrases: ["I'm doing great - Tôi rất khỏe"],
            },
          ],
          vocabulary: [
            {
              word: 'how are you',
              meaning: 'bạn khỏe không (lời chào)',
              example: 'How are you doing today?',
            },
          ],
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const config = {
        topic: 'Coffee Shop',
        durationMinutes: 10,
        level: 'intermediate' as const,
        includeVietnamese: true,
      };

      const result = await listeningApi.generateConversation(config);

      // Kiểm tra API được gọi đúng endpoint
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conversation-generator/generate',
        expect.objectContaining({
          topic: 'Coffee Shop',
          durationMinutes: 10,
          level: 'intermediate',
        }),
      );

      // Kiểm tra mapping: script → conversation
      expect(result.conversation).toHaveLength(2);
      expect(result.conversation[0].speaker).toBe('Person A');
      expect(result.conversation[0].text).toBe('Hello! How are you?');

      // Kiểm tra mapping: translation → vietnamese
      expect(result.conversation[0].vietnamese).toBe(
        'Xin chào! Bạn khỏe không?',
      );

      // Kiểm tra mapping: keyPhrases giữ nguyên
      expect(result.conversation[0].keyPhrases).toEqual([
        'How are you - Bạn khỏe không',
      ]);

      // Kiểm tra mapping: vocabulary objects → strings
      expect(result.vocabulary).toEqual([
        'how are you — bạn khỏe không (lời chào)',
      ]);
    });

    // MAP-004: Clamp durationMinutes về 5-15
    it('clamp durationMinutes khi nhỏ hơn 5 hoặc lớn hơn 15', async () => {
      const mockResponse = {data: {script: []}};
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Test duration < 5 → clamp lên 5
      await listeningApi.generateConversation({
        topic: 'Test',
        durationMinutes: 3,
        level: 'beginner',
      });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conversation-generator/generate',
        expect.objectContaining({durationMinutes: 5}),
      );

      // Test duration > 15 → clamp xuống 15
      await listeningApi.generateConversation({
        topic: 'Test',
        durationMinutes: 30,
        level: 'beginner',
      });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conversation-generator/generate',
        expect.objectContaining({durationMinutes: 15}),
      );
    });

    // MAP-005: Xử lý khi vocabulary đã là string[]
    it('giữ nguyên vocabulary nếu đã là string[]', async () => {
      const mockResponse = {
        data: {
          script: [],
          vocabulary: ['hello', 'world'],
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await listeningApi.generateConversation({
        topic: 'Test',
        durationMinutes: 5,
        level: 'beginner',
      });

      expect(result.vocabulary).toEqual(['hello', 'world']);
    });

    // MOB-LIS-MVP-ERR-002: Mất mạng
    it('throw error khi API không truy cập được', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network Error'),
      );

      await expect(
        listeningApi.generateConversation({
          topic: 'Test',
          durationMinutes: 5,
          level: 'beginner',
        }),
      ).rejects.toThrow('Network Error');
    });

    // MOB-LIS-MVP-ERR-003: API timeout
    it('throw error khi API timeout', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('timeout of 30000ms exceeded'),
      );

      await expect(
        listeningApi.generateConversation({
          topic: 'Test',
          durationMinutes: 5,
          level: 'beginner',
        }),
      ).rejects.toThrow('timeout');
    });
  });

  describe('generateScenario', () => {
    // Generate scenario thành công + mapping
    it('gọi GET scenario và map response đúng', async () => {
      const mockResponse = {
        data: {
          script: [
            {
              speaker: 'Waiter',
              text: 'Welcome to our restaurant!',
              translation: 'Chào mừng đến nhà hàng!',
            },
          ],
          vocabulary: [
            {
              word: 'welcome',
              meaning: 'chào mừng',
              example: 'Welcome home!',
            },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await listeningApi.generateScenario('restaurant');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/conversation-generator/scenario',
        {params: {type: 'restaurant'}},
      );

      // Kiểm tra mapping
      expect(result.conversation).toHaveLength(1);
      expect(result.conversation[0].vietnamese).toBe(
        'Chào mừng đến nhà hàng!',
      );
      expect(result.vocabulary).toEqual(['welcome — chào mừng']);
    });

    // Generate scenario với customContext
    it('truyền customContext qua params', async () => {
      const mockResponse = {data: {script: []}};
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await listeningApi.generateScenario('hotel', 'luxury 5-star hotel');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/conversation-generator/scenario',
        {params: {type: 'hotel', customContext: 'luxury 5-star hotel'}},
      );
    });

    it('không có customContext nếu không truyền', async () => {
      const mockResponse = {data: {script: []}};
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await listeningApi.generateScenario('airport');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/conversation-generator/scenario',
        {params: {type: 'airport'}},
      );
    });
  });

  // ========================
  // generateConversationAudio — TTS params
  // MOB-LIS-ENH-HP-009, 010
  // ========================
  describe('generateConversationAudio', () => {
    const mockConversation = [
      {speaker: 'A', text: 'Hello!'},
      {speaker: 'B', text: 'Hi there!'},
    ];

    const mockAudioResult = {
      audioUrl: 'https://example.com/audio.mp3',
      timestamps: [
        {lineIndex: 0, startTime: 0, endTime: 2, speaker: 'A'},
        {lineIndex: 1, startTime: 2, endTime: 4, speaker: 'B'},
      ],
    };

    // MOB-LIS-ENH-HP-009: Gửi ttsProvider trong request body
    it('gửi ttsProvider trong request body khi truyền', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({data: mockAudioResult});

      await listeningApi.generateConversationAudio(mockConversation, {
        ttsProvider: 'azure',
        voice: 'jenny',
      });

      const callPayload = (apiClient.post as jest.Mock).mock.calls[0][1];
      expect(callPayload.ttsProvider).toBe('azure');
      expect(callPayload.voice).toBe('jenny');
    });

    // MOB-LIS-ENH-HP-010: Gửi voice trong request body
    it('gửi OpenAI voice trong request body', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({data: mockAudioResult});

      await listeningApi.generateConversationAudio(mockConversation, {
        ttsProvider: 'openai',
        voice: 'alloy',
      });

      const callPayload = (apiClient.post as jest.Mock).mock.calls[0][1];
      expect(callPayload.ttsProvider).toBe('openai');
      expect(callPayload.voice).toBe('alloy');
    });

    it('không gửi ttsProvider/voice khi không truyền ttsOptions', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({data: mockAudioResult});

      await listeningApi.generateConversationAudio(mockConversation);

      const callPayload = (apiClient.post as jest.Mock).mock.calls[0][1];
      expect(callPayload.ttsProvider).toBeUndefined();
      expect(callPayload.voice).toBeUndefined();
    });

    it('trả về audioUrl và timestamps đúng', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({data: mockAudioResult});

      const result = await listeningApi.generateConversationAudio(mockConversation);

      expect(result.audioUrl).toBe('https://example.com/audio.mp3');
      expect(result.timestamps).toHaveLength(2);
      expect(result.timestamps[0].speaker).toBe('A');
    });

    it('gửi conversation đúng format (chỉ speaker + text)', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({data: mockAudioResult});

      await listeningApi.generateConversationAudio([
        {speaker: 'A', text: 'Hello!', vietnamese: 'Xin chào!', keyPhrases: ['hello']},
      ]);

      const callPayload = (apiClient.post as jest.Mock).mock.calls[0][1];
      expect(callPayload.conversation[0]).toEqual({speaker: 'A', text: 'Hello!'});
      expect(callPayload.conversation[0].vietnamese).toBeUndefined();
    });
  });
});

// ========================
// bookmarkApi — Sentence Bookmarks
// MOB-LIS-ENH-HP-008: Long press sentence = Bookmark
// ========================
describe('bookmarkApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockBookmarkData = {
      sentenceIndex: 3,
      speaker: 'Person A',
      sentenceText: 'Hello, how are you today?',
      sentenceTranslation: 'Xin chào, hôm nay bạn khỏe không?',
      topic: 'Daily Conversation',
    };

    const mockCreateResponse = {
      data: {
        success: true,
        bookmark: {
          id: 'bm-uuid-1',
          sentenceIndex: 3,
          speaker: 'Person A',
          sentenceText: 'Hello, how are you today?',
          sentenceTranslation: 'Xin chào, hôm nay bạn khỏe không?',
          topic: 'Daily Conversation',
          createdAt: '2026-02-12T14:00:00Z',
        },
        alreadyExists: false,
      },
    };

    // MOB-LIS-ENH-HP-008: Tạo bookmark thành công
    it('gọi POST /bookmarks với đúng payload', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockCreateResponse);

      const result = await bookmarkApi.create(mockBookmarkData);

      expect(apiClient.post).toHaveBeenCalledWith('/bookmarks', mockBookmarkData);
      expect(result.success).toBe(true);
      expect(result.bookmark.id).toBe('bm-uuid-1');
      expect(result.bookmark.sentenceIndex).toBe(3);
      expect(result.alreadyExists).toBe(false);
    });

    it('gửi historyEntryId khi có', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockCreateResponse);

      await bookmarkApi.create({
        ...mockBookmarkData,
        historyEntryId: 'history-uuid-1',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/bookmarks',
        expect.objectContaining({historyEntryId: 'history-uuid-1'}),
      );
    });

    it('xử lý duplicate → alreadyExists = true', async () => {
      const duplicateResponse = {
        data: {
          success: true,
          bookmark: mockCreateResponse.data.bookmark,
          alreadyExists: true,
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(duplicateResponse);

      const result = await bookmarkApi.create(mockBookmarkData);

      expect(result.alreadyExists).toBe(true);
    });

    it('throw error khi API lỗi', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network Error'),
      );

      await expect(bookmarkApi.create(mockBookmarkData)).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('getBySession', () => {
    const mockSessionResponse = {
      data: {
        success: true,
        bookmarks: [
          {
            id: 'bm-1',
            sentenceIndex: 2,
            speaker: 'A',
            sentenceText: 'Test sentence 1',
            createdAt: '2026-02-12T14:00:00Z',
          },
          {
            id: 'bm-2',
            sentenceIndex: 5,
            speaker: 'B',
            sentenceText: 'Test sentence 2',
            createdAt: '2026-02-12T14:01:00Z',
          },
        ],
        count: 2,
      },
    };

    it('gọi GET /bookmarks/session/:id đúng endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockSessionResponse);

      const result = await bookmarkApi.getBySession('history-uuid-123');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/bookmarks/session/history-uuid-123',
      );
      expect(result.success).toBe(true);
      expect(result.bookmarks).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it('trả về mảng rỗng khi session chưa có bookmark', async () => {
      const emptyResponse = {
        data: {success: true, bookmarks: [], count: 0},
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(emptyResponse);

      const result = await bookmarkApi.getBySession('no-bookmarks-session');

      expect(result.bookmarks).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('delete', () => {
    it('gọi DELETE /bookmarks/:id đúng endpoint', async () => {
      const mockDeleteResponse = {
        data: {success: true, message: 'Đã xóa bookmark'},
      };
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(mockDeleteResponse);

      const result = await bookmarkApi.delete('bm-uuid-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/bookmarks/bm-uuid-1');
      expect(result.success).toBe(true);
    });

    it('throw error khi bookmark không tồn tại', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValueOnce(
        new Error('Not Found'),
      );

      await expect(bookmarkApi.delete('non-existent')).rejects.toThrow(
        'Not Found',
      );
    });
  });

  describe('deleteByIndex', () => {
    it('gọi POST /bookmarks/remove-by-index đúng payload', async () => {
      const mockResponse = {
        data: {success: true, message: 'Đã xóa bookmark'},
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await bookmarkApi.deleteByIndex({
        historyEntryId: 'history-uuid-1',
        sentenceIndex: 3,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/bookmarks/remove-by-index',
        {historyEntryId: 'history-uuid-1', sentenceIndex: 3},
      );
      expect(result.success).toBe(true);
    });

    it('gọi không cần historyEntryId', async () => {
      const mockResponse = {
        data: {success: true, message: 'Đã xóa bookmark'},
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      await bookmarkApi.deleteByIndex({sentenceIndex: 7});

      expect(apiClient.post).toHaveBeenCalledWith(
        '/bookmarks/remove-by-index',
        {sentenceIndex: 7},
      );
    });
  });
});

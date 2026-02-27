/**
 * Integration test cho Listening Flow — Tier 2
 *
 * Mục đích: Test luồng Store ↔ API — config → generate → audio pipeline
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau khi thay đổi store hoặc API layer
 */
import {useListeningStore} from '@/store/useListeningStore';

// Mock apiClient (axios) — phải khai báo trước khi import listeningApi
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

describe('Listening Integration — Store ↔ API', () => {
  beforeEach(() => {
    useListeningStore.getState().reset();
    jest.clearAllMocks();
  });

  // ================================
  // 1. Config → Generate Conversation
  // ================================
  describe('Config → generateConversation pipeline', () => {
    it('store config được map đúng vào API payload', async () => {
      // Arrange: Set config trong store
      useListeningStore.getState().setConfig({
        topic: 'Coffee Shop Order',
        durationMinutes: 10,
        level: 'advanced',
        numSpeakers: 3,
        includeVietnamese: true,
      });

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          script: [
            {speaker: 'Alice', text: 'Hi!', translation: 'Xin chào!'},
          ],
          title: 'Coffee Chat',
          vocabulary: ['order'],
          summary: 'Test summary',
        },
      });

      // Act: Gọi API với config từ store
      const config = useListeningStore.getState().config;
      const result = await listeningApi.generateConversation(config);

      // Assert: Payload đúng
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/conversation-generator/generate',
        expect.objectContaining({
          topic: 'Coffee Shop Order',
          durationMinutes: 10,
          level: 'advanced',
          numSpeakers: 3,
        }),
      );
      expect(result.conversation).toHaveLength(1);
    });

    it('kết quả generate được lưu vào store', async () => {
      // Arrange
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          script: [
            {speaker: 'A', text: 'Hello', translation: 'Xin chào'},
            {speaker: 'B', text: 'World', translation: 'Thế giới'},
          ],
          title: 'Test Conv',
          vocabulary: ['hello', 'world'],
          summary: 'Hai người nói chuyện',
        },
      });

      // Act
      const config = useListeningStore.getState().config;
      const result = await listeningApi.generateConversation({...config, topic: 'Test'});
      useListeningStore.getState().setConversation(result);

      // Assert
      const state = useListeningStore.getState();
      expect(state.conversation).not.toBeNull();
      expect(state.conversation!.conversation).toHaveLength(2);
    });
  });

  // ================================
  // 2. Voice Settings → Audio Generation
  // ================================
  describe('Voice Settings → generateConversationAudio', () => {
    it('voicePerSpeaker từ store được gửi trong audio payload', async () => {
      // Arrange: Set voice settings
      useListeningStore.getState().setVoicePerSpeaker({
        A: 'en-US-JennyNeural',
        B: 'en-US-GuyNeural',
      });
      useListeningStore.getState().setRandomVoice(false);
      useListeningStore.getState().setRandomEmotion(true);

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          audioUrl: 'https://example.com/audio.mp3',
          timestamps: [],
        },
      });

      // Act
      const state = useListeningStore.getState();
      await listeningApi.generateConversationAudio(
        [{speaker: 'A', text: 'Hi'}],
        {
          provider: 'azure',
          randomVoice: state.randomVoice,
          voicePerSpeaker: state.voicePerSpeaker,
          randomEmotion: state.randomEmotion,
        },
      );

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          randomVoice: false,
          voicePerSpeaker: {A: 'en-US-JennyNeural', B: 'en-US-GuyNeural'},
          randomEmotion: true,
        }),
        expect.anything(),
      );
    });

    it('prosody settings từ store được gửi đúng', async () => {
      // Arrange
      useListeningStore.getState().setTtsPitch(5);
      useListeningStore.getState().setTtsRate(-3);
      useListeningStore.getState().setTtsVolume(80);
      useListeningStore.getState().setTtsEmotion('cheerful');

      mockApiClient.post.mockResolvedValueOnce({
        data: {audioUrl: '', timestamps: []},
      });

      // Act
      const state = useListeningStore.getState();
      await listeningApi.generateConversationAudio(
        [{speaker: 'A', text: 'Test'}],
        {
          provider: 'azure',
          pitch: state.ttsPitch,
          rate: state.ttsRate,
          volume: state.ttsVolume,
          emotion: state.ttsEmotion,
        },
      );

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          pitch: 5,
          rate: -3,
          volume: 80,
          emotion: 'cheerful',
        }),
        expect.anything(),
      );
    });

    it('audio URL được lưu vào store sau khi generate', async () => {
      // Arrange
      const audioUrl = 'https://blob.storage/audio-xyz.mp3';
      const timestamps = [
        {lineIndex: 0, startTime: 0, endTime: 3.5, speaker: 'A'},
      ];

      mockApiClient.post.mockResolvedValueOnce({
        data: {audioUrl, timestamps},
      });

      // Act
      const result = await listeningApi.generateConversationAudio(
        [{speaker: 'A', text: 'Hello'}],
        {provider: 'azure'},
      );
      useListeningStore.getState().setAudioUrl(result.audioUrl);
      useListeningStore.getState().setTimestamps(result.timestamps);

      // Assert
      expect(useListeningStore.getState().audioUrl).toBe(audioUrl);
      expect(useListeningStore.getState().timestamps).toHaveLength(1);
    });
  });

  // ================================
  // 3. Bookmark Flow
  // ================================
  describe('Bookmark → Store integration', () => {
    it('toggleBookmark + API create đồng bộ', async () => {
      // Arrange: Store bookmark
      useListeningStore.getState().toggleBookmark(3);
      mockApiClient.post.mockResolvedValueOnce({
        data: {success: true, bookmark: {id: 'bm-123'}, alreadyExists: false},
      });

      // Act: API create
      await bookmarkApi.create({
        sentenceIndex: 3,
        speaker: 'Alice',
        sentenceText: 'Hello there!',
      });

      // Assert — store và API call đều thành công
      expect(useListeningStore.getState().bookmarkedIndexes).toContain(3);
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('toggleBookmark unbookmark + API delete đồng bộ', async () => {
      // Arrange: Bookmark trước
      useListeningStore.getState().toggleBookmark(3);
      expect(useListeningStore.getState().bookmarkedIndexes).toContain(3);

      // Act: Unbookmark store
      useListeningStore.getState().toggleBookmark(3);
      // Act: API delete
      mockApiClient.post.mockResolvedValueOnce({
        data: {success: true, message: 'Đã xóa'},
      });
      await bookmarkApi.deleteByIndex({sentenceIndex: 3});

      // Assert
      expect(useListeningStore.getState().bookmarkedIndexes).not.toContain(3);
    });
  });

  // ================================
  // 4. Error Propagation
  // ================================
  describe('Error Propagation', () => {
    it('API error không làm crash store', async () => {
      // Arrange
      mockApiClient.post.mockRejectedValueOnce(new Error('Lỗi server 500'));

      // Act & Assert
      await expect(
        listeningApi.generateConversation(useListeningStore.getState().config),
      ).rejects.toThrow();

      // Store vẫn ở trạng thái bình thường
      expect(useListeningStore.getState().conversation).toBeNull();
    });

    it('network timeout không làm crash store', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        listeningApi.generateConversation(useListeningStore.getState().config),
      ).rejects.toThrow('Network timeout');
    });
  });

  // ================================
  // 5. Multi-talker Flow
  // ================================
  describe('Multi-talker Configuration', () => {
    it('multiTalker + pairIndex được gửi đúng trong audio payload', async () => {
      // Arrange
      useListeningStore.getState().setMultiTalker(true);
      useListeningStore.getState().setMultiTalkerPairIndex(2);

      mockApiClient.post.mockResolvedValueOnce({
        data: {audioUrl: '', timestamps: []},
      });

      // Act
      const state = useListeningStore.getState();
      await listeningApi.generateConversationAudio(
        [{speaker: 'A', text: 'Hi'}],
        {
          provider: 'azure',
          multiTalker: state.multiTalker,
          multiTalkerPairIndex: state.multiTalkerPairIndex,
        },
      );

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          multiTalker: true,
          multiTalkerPairIndex: 2,
        }),
        expect.anything(),
      );
    });
  });
});

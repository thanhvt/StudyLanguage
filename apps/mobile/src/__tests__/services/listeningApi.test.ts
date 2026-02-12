/**
 * Unit test cho listeningApi service
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
 */
import {listeningApi} from '@/services/api/listening';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
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

    // Không truyền customContext → params chỉ có type
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
});


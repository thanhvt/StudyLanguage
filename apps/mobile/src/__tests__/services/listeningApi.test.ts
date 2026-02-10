/**
 * Unit test cho listeningApi service
 *
 * Mục đích: Test API integration layer cho Listening feature
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-006: Start session → gọi API generate
 *   - MOB-LIS-MVP-ERR-002: Start khi mất mạng → error
 *   - MOB-LIS-MVP-ERR-003: API timeout → error
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
    // MOB-LIS-MVP-HP-006: Generate thành công
    it('gọi POST /conversation-generator/generate với config đúng', async () => {
      const mockResponse = {
        data: {
          conversation: [
            {speaker: 'Alice', text: 'Hello!'},
            {speaker: 'Bob', text: 'Hi there!'},
          ],
          title: 'Greetings',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const config = {
        topic: 'Coffee Shop',
        durationMinutes: 10 as const,
        level: 'intermediate' as const,
        includeVietnamese: true,
      };

      const result = await listeningApi.generateConversation(config);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/conversation-generator/generate',
        config,
      );
      expect(result.conversation).toHaveLength(2);
      expect(result.title).toBe('Greetings');
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
    // Generate scenario thành công
    it('gọi GET /conversation-generator/scenario với type đúng', async () => {
      const mockResponse = {
        data: {
          conversation: [{speaker: 'Waiter', text: 'Welcome!'}],
          title: 'Restaurant',
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await listeningApi.generateScenario('restaurant');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/conversation-generator/scenario',
        {params: {type: 'restaurant'}},
      );
      expect(result.title).toBe('Restaurant');
    });

    // Generate scenario với customContext
    it('truyền customContext qua params', async () => {
      const mockResponse = {data: {conversation: [], title: 'Custom'}};
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await listeningApi.generateScenario('hotel', 'luxury 5-star hotel');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/conversation-generator/scenario',
        {params: {type: 'hotel', customContext: 'luxury 5-star hotel'}},
      );
    });

    // Không truyền customContext → params chỉ có type
    it('không có customContext nếu không truyền', async () => {
      const mockResponse = {data: {conversation: []}};
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await listeningApi.generateScenario('airport');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/conversation-generator/scenario',
        {params: {type: 'airport'}},
      );
    });
  });
});

/**
 * Unit test cho Settings API service
 *
 * Mục đích: Test API calls đồng bộ settings giữa mobile và server
 * Ref: Implementation plan — settings sync feature
 */
import {settingsApi} from '@/services/api/settings';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPut = apiClient.put as jest.MockedFunction<typeof apiClient.put>;

// Payload mẫu dùng chung cho các test
const mockPayload = {
  theme: 'dark' as const,
  accentColor: 'ocean-scholar',
  language: 'vi',
  audio: {
    backgroundMusic: {enabled: true, volume: 50},
    musicDucking: true,
    soundEffects: true,
    autoPlay: true,
  },
  privacy: {
    saveRecordings: true,
    dataSync: true,
  },
};

describe('settingsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // getSettings
  // ========================
  describe('getSettings', () => {
    it('gọi GET /user/settings', async () => {
      mockGet.mockResolvedValue({
        data: {success: true, settings: mockPayload, updatedAt: '2026-03-04T00:00:00Z'},
      } as any);

      await settingsApi.getSettings();

      expect(mockGet).toHaveBeenCalledWith('/user/settings');
    });

    it('trả về settings và updatedAt khi server có data', async () => {
      const serverResponse = {
        success: true,
        settings: mockPayload,
        updatedAt: '2026-03-04T00:00:00Z',
      };
      mockGet.mockResolvedValue({data: serverResponse} as any);

      const result = await settingsApi.getSettings();

      expect(result.success).toBe(true);
      expect(result.settings).toEqual(mockPayload);
      expect(result.updatedAt).toBe('2026-03-04T00:00:00Z');
    });

    it('trả về settings rỗng khi server chưa có data', async () => {
      const serverResponse = {
        success: true,
        settings: {},
        updatedAt: null,
      };
      mockGet.mockResolvedValue({data: serverResponse} as any);

      const result = await settingsApi.getSettings();

      expect(result.settings).toEqual({});
      expect(result.updatedAt).toBeNull();
    });

    it('throw error khi API thất bại', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      await expect(settingsApi.getSettings()).rejects.toThrow('Network error');
    });
  });

  // ========================
  // updateSettings
  // ========================
  describe('updateSettings', () => {
    it('gọi PUT /user/settings với payload bọc trong { settings }', async () => {
      mockPut.mockResolvedValue({
        data: {success: true, message: 'Đã đồng bộ settings'},
      } as any);

      await settingsApi.updateSettings(mockPayload);

      expect(mockPut).toHaveBeenCalledWith('/user/settings', {
        settings: mockPayload,
      });
    });

    it('trả về success khi update thành công', async () => {
      mockPut.mockResolvedValue({
        data: {success: true, message: 'Đã đồng bộ settings'},
      } as any);

      const result = await settingsApi.updateSettings(mockPayload);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã đồng bộ settings');
    });

    it('gửi đúng toàn bộ fields trong payload', async () => {
      mockPut.mockResolvedValue({
        data: {success: true, message: 'ok'},
      } as any);

      const customPayload = {
        ...mockPayload,
        theme: 'light' as const,
        accentColor: 'sunset-focus',
        language: 'en',
      };

      await settingsApi.updateSettings(customPayload);

      const sentPayload = mockPut.mock.calls[0][1];
      expect(sentPayload).toEqual({settings: customPayload});
    });

    it('throw error khi API thất bại', async () => {
      mockPut.mockRejectedValue(new Error('Server error'));

      await expect(settingsApi.updateSettings(mockPayload)).rejects.toThrow('Server error');
    });
  });
});

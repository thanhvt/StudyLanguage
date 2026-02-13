/**
 * Unit test cho Radio API service
 *
 * Mục đích: Test API calls cho Radio Mode
 * Ref test cases:
 *   - Sprint 2.8: Radio Mode UI + Playlist
 *   - Sprint 3.3: Radio Continuous Playback
 */
import {radioApi} from '@/services/api/radio';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

describe('radioApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // getPreview
  // ========================
  describe('getPreview', () => {
    it('gọi GET /radio/preview', async () => {
      const mockData = {
        duration: 30,
        trackCount: 10,
        estimatedTime: '~30 giây',
      };
      mockGet.mockResolvedValue({data: {data: mockData}} as any);

      const result = await radioApi.getPreview();

      expect(mockGet).toHaveBeenCalledWith('/radio/preview');
      expect(result).toEqual(mockData);
    });

    it('trả về duration, trackCount, estimatedTime', async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {duration: 60, trackCount: 20, estimatedTime: '~60 giây'},
        },
      } as any);

      const result = await radioApi.getPreview();

      expect(result.duration).toBe(60);
      expect(result.trackCount).toBe(20);
      expect(result.estimatedTime).toBe('~60 giây');
    });
  });

  // ========================
  // generate
  // ========================
  describe('generate', () => {
    const mockPlaylist = {
      playlist: {
        id: 'radio-1',
        name: 'Radio Mix 30 phút',
        description: 'Playlist nghe thụ động',
        duration: 30,
        trackCount: 10,
      },
      items: [
        {
          id: 'track-1',
          topic: 'Daily Stand-up',
          conversation: [
            {speaker: 'Alice', text: 'Good morning!'},
            {speaker: 'Bob', text: 'Hi!'},
          ],
          duration: 3,
          numSpeakers: 2,
          category: 'it',
          subCategory: 'Agile',
          position: 0,
        },
      ],
    };

    it('gọi POST /radio/generate với duration', async () => {
      mockPost.mockResolvedValue({data: {data: mockPlaylist}} as any);

      await radioApi.generate(30);

      expect(mockPost).toHaveBeenCalledWith(
        '/radio/generate',
        {duration: 30},
        {timeout: 120000},
      );
    });

    it('trả về playlist object với items', async () => {
      mockPost.mockResolvedValue({data: {data: mockPlaylist}} as any);

      const result = await radioApi.generate(30);

      expect(result.playlist.id).toBe('radio-1');
      expect(result.playlist.trackCount).toBe(10);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].topic).toBe('Daily Stand-up');
    });

    it('gửi timeout 120000ms cho request dài', async () => {
      mockPost.mockResolvedValue({data: {data: mockPlaylist}} as any);

      await radioApi.generate(120);

      const callArgs = mockPost.mock.calls[0];
      expect(callArgs[2]).toEqual({timeout: 120000});
    });

    it('truyền đúng duration (1, 30, 60, 120)', async () => {
      mockPost.mockResolvedValue({data: {data: mockPlaylist}} as any);

      for (const dur of [1, 30, 60, 120]) {
        await radioApi.generate(dur);
        const lastCall = mockPost.mock.calls[mockPost.mock.calls.length - 1];
        expect(lastCall[1]).toEqual({duration: dur});
      }
    });

    it('throw error khi API thất bại', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(radioApi.generate(30)).rejects.toThrow('Network error');
    });
  });
});

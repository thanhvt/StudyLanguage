/**
 * Unit test cho Radio API service
 *
 * Mục đích: Test API calls cho Radio Mode
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — sau mỗi thay đổi radio API service
 */
import {radioApi} from '@/services/api/radio';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockPut = (apiClient as any).put as jest.MockedFunction<any>;
const mockDelete = (apiClient as any).delete as jest.MockedFunction<any>;

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

    it('gửi categories khi có', async () => {
      mockPost.mockResolvedValue({data: {data: mockPlaylist}} as any);

      await radioApi.generate(30, ['it', 'daily']);

      expect(mockPost).toHaveBeenCalledWith(
        '/radio/generate',
        {duration: 30, categories: ['it', 'daily']},
        {timeout: 120000},
      );
    });

    it('không gửi categories khi mảng rỗng', async () => {
      mockPost.mockResolvedValue({data: {data: mockPlaylist}} as any);

      await radioApi.generate(30, []);

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

  // ========================
  // getPlaylists (T-01)
  // ========================
  describe('getPlaylists', () => {
    it('gọi GET /playlists', async () => {
      const mockPlaylists = [
        {
          id: 'pl-1',
          name: 'Radio Mix',
          description: 'Playlist test',
          created_at: '2026-03-06',
          updated_at: '2026-03-06',
          itemCount: 5,
        },
      ];
      mockGet.mockResolvedValue({data: {playlists: mockPlaylists}} as any);

      const result = await radioApi.getPlaylists();

      expect(mockGet).toHaveBeenCalledWith('/playlists');
      expect(result).toEqual(mockPlaylists);
    });

    it('trả về mảng rỗng khi không có playlists', async () => {
      mockGet.mockResolvedValue({data: {playlists: []}} as any);

      const result = await radioApi.getPlaylists();

      expect(result).toEqual([]);
    });

    it('trả về mảng rỗng khi playlists undefined', async () => {
      mockGet.mockResolvedValue({data: {}} as any);

      const result = await radioApi.getPlaylists();

      expect(result).toEqual([]);
    });
  });

  // ========================
  // getPlaylistById (T-02)
  // ========================
  describe('getPlaylistById', () => {
    it('gọi GET /playlists/:id', async () => {
      const mockPlaylist = {
        id: 'pl-1',
        name: 'Radio Mix',
        items: [{id: 'item-1', topic: 'Test'}],
      };
      mockGet.mockResolvedValue({data: {playlist: mockPlaylist}} as any);

      const result = await radioApi.getPlaylistById('pl-1');

      expect(mockGet).toHaveBeenCalledWith('/playlists/pl-1');
      expect(result.id).toBe('pl-1');
      expect(result.items).toHaveLength(1);
    });
  });

  // ========================
  // deletePlaylist
  // ========================
  describe('deletePlaylist', () => {
    it('gọi DELETE /playlists/:id', async () => {
      mockDelete.mockResolvedValue({data: {success: true}} as any);

      await radioApi.deletePlaylist('pl-1');

      expect(mockDelete).toHaveBeenCalledWith('/playlists/pl-1');
    });

    it('throw error khi xóa thất bại', async () => {
      mockDelete.mockRejectedValue(new Error('Not found'));

      await expect(radioApi.deletePlaylist('invalid')).rejects.toThrow(
        'Not found',
      );
    });
  });

  // ========================
  // updateTrackAudio (T-03)
  // ========================
  describe('updateTrackAudio', () => {
    it('gọi PUT /playlists/:id/items/:itemId/audio', async () => {
      mockPut.mockResolvedValue({data: {success: true}} as any);

      await radioApi.updateTrackAudio(
        'pl-1',
        'item-1',
        'https://audio.example.com/test.mp3',
      );

      expect(mockPut).toHaveBeenCalledWith(
        '/playlists/pl-1/items/item-1/audio',
        {audioUrl: 'https://audio.example.com/test.mp3'},
      );
    });

    it('gửi kèm audioTimestamps khi có', async () => {
      mockPut.mockResolvedValue({data: {success: true}} as any);

      const timestamps = [
        {startTime: 0, endTime: 5},
        {startTime: 5, endTime: 10},
      ];

      await radioApi.updateTrackAudio(
        'pl-1',
        'item-1',
        'https://audio.test.mp3',
        timestamps,
      );

      expect(mockPut).toHaveBeenCalledWith(
        '/playlists/pl-1/items/item-1/audio',
        {
          audioUrl: 'https://audio.test.mp3',
          audioTimestamps: timestamps,
        },
      );
    });

    it('không gửi audioTimestamps khi undefined', async () => {
      mockPut.mockResolvedValue({data: {success: true}} as any);

      await radioApi.updateTrackAudio('pl-1', 'item-1', 'https://test.mp3');

      const callArgs = mockPut.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('audioTimestamps');
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsService } from './playlists.service';

/**
 * Unit Tests cho PlaylistsService
 *
 * Mục đích: Test các CRUD operations cho Playlists và Playlist Items
 * Coverage: getPlaylists, createPlaylist, updatePlaylist, deletePlaylist,
 *           getPlaylistWithItems, addItemToPlaylist, removeItemFromPlaylist, reorderItems
 */

// Mock Supabase client
const mockSupabaseFrom = jest.fn();
const mockSupabase = {
  from: mockSupabaseFrom,
};

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('PlaylistsService', () => {
  let service: PlaylistsService;
  const mockUserId = 'test-user-id-123';
  const mockPlaylistId = 'playlist-id-456';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistsService],
    }).compile();

    service = module.get<PlaylistsService>(PlaylistsService);
  });

  // ============================================
  // getPlaylists Tests
  // ============================================

  describe('getPlaylists', () => {
    it('nên trả về danh sách playlists với itemCount', async () => {
      // Arrange
      const mockPlaylists = [
        { id: '1', name: 'Playlist 1', user_id: mockUserId },
        { id: '2', name: 'Playlist 2', user_id: mockUserId },
      ];

      // Mock select playlists
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPlaylists,
              error: null,
            }),
          }),
        }),
      });

      // Mock count for each playlist - cần mock đúng chain select('*', {...}).eq()
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3 }),
        }),
      });
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 5 }),
        }),
      });

      // Act
      const result = await service.getPlaylists(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.playlists).toHaveLength(2);
    });

    it('nên trả về mảng rỗng khi không có playlists', async () => {
      // Arrange
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.getPlaylists(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.playlists).toEqual([]);
    });
  });

  // ============================================
  // createPlaylist Tests
  // ============================================

  describe('createPlaylist', () => {
    const mockDto = {
      name: 'My New Playlist',
      description: 'Test description',
    };

    it('nên tạo playlist thành công', async () => {
      // Arrange
      const mockCreatedPlaylist = {
        id: 'new-playlist-id',
        user_id: mockUserId,
        ...mockDto,
      };

      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreatedPlaylist,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.createPlaylist(mockUserId, mockDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.playlist).toEqual(mockCreatedPlaylist);
    });

    it('nên throw error khi tạo thất bại', async () => {
      // Arrange
      const mockError = { message: 'Create failed' };
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(service.createPlaylist(mockUserId, mockDto)).rejects.toEqual(mockError);
    });
  });

  // ============================================
  // updatePlaylist Tests
  // ============================================

  describe('updatePlaylist', () => {
    const mockUpdateDto = { name: 'Updated Name' };

    it('nên cập nhật playlist thành công', async () => {
      // Arrange
      const mockUpdatedPlaylist = {
        id: mockPlaylistId,
        user_id: mockUserId,
        name: 'Updated Name',
      };

      mockSupabaseFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUpdatedPlaylist,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await service.updatePlaylist(mockUserId, mockPlaylistId, mockUpdateDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.playlist.name).toBe('Updated Name');
    });
  });

  // ============================================
  // deletePlaylist Tests
  // ============================================

  describe('deletePlaylist', () => {
    it('nên xóa playlist thành công', async () => {
      // Arrange
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.deletePlaylist(mockUserId, mockPlaylistId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã xóa playlist');
    });

    it('nên throw error khi xóa thất bại', async () => {
      // Arrange
      const mockError = { message: 'Delete failed' };
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: mockError,
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(service.deletePlaylist(mockUserId, mockPlaylistId)).rejects.toEqual(mockError);
    });
  });

  // ============================================
  // getPlaylistWithItems Tests
  // ============================================

  describe('getPlaylistWithItems', () => {
    it('nên trả về playlist kèm items', async () => {
      // Arrange
      const mockPlaylist = { id: mockPlaylistId, name: 'Test Playlist' };
      const mockItems = [
        { id: '1', topic: 'Topic 1', position: 0 },
        { id: '2', topic: 'Topic 2', position: 1 },
      ];

      // Mock get playlist
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockPlaylist,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock get items
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockItems,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.getPlaylistWithItems(mockUserId, mockPlaylistId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.playlist.items).toHaveLength(2);
    });
  });

  // ============================================
  // addItemToPlaylist Tests
  // ============================================

  describe('addItemToPlaylist', () => {
    const mockItemDto = {
      topic: 'New Item Topic',
      conversation: [{ speaker: 'A', text: 'Hello' }],
      duration: 5,
      numSpeakers: 2,
    };

    it('nên thêm item vào playlist thành công', async () => {
      // Arrange
      // Mock check playlist exists
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: mockPlaylistId },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock get max position
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ position: 1 }],
              }),
            }),
          }),
        }),
      });

      // Mock insert item
      const mockInsertedItem = { id: 'new-item-id', ...mockItemDto, position: 2 };
      mockSupabaseFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockInsertedItem,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.addItemToPlaylist(mockUserId, mockPlaylistId, mockItemDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.item).toEqual(mockInsertedItem);
    });

    it('nên throw error khi playlist không tồn tại', async () => {
      // Arrange
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(service.addItemToPlaylist(mockUserId, mockPlaylistId, mockItemDto)).rejects.toThrow();
    });
  });

  // ============================================
  // removeItemFromPlaylist Tests
  // ============================================

  describe('removeItemFromPlaylist', () => {
    const mockItemId = 'item-to-remove';

    it('nên xóa item khỏi playlist thành công', async () => {
      // Arrange
      // Mock check playlist exists
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: mockPlaylistId },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock delete item
      mockSupabaseFrom.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.removeItemFromPlaylist(mockUserId, mockPlaylistId, mockItemId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã xóa khỏi playlist');
    });
  });

  // ============================================
  // reorderItems Tests
  // ============================================

  describe('reorderItems', () => {
    const mockReorderDto = {
      items: [
        { id: 'item-1', position: 0 },
        { id: 'item-2', position: 1 },
        { id: 'item-3', position: 2 },
      ],
    };

    it('nên sắp xếp lại items thành công', async () => {
      // Arrange
      // Mock check playlist exists
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: mockPlaylistId },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock update for each item
      mockReorderDto.items.forEach(() => {
        mockSupabaseFrom.mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }),
        });
      });

      // Act
      const result = await service.reorderItems(mockUserId, mockPlaylistId, mockReorderDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã sắp xếp lại playlist');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * Unit Tests cho PlaylistsController
 *
 * Mục đích: Test các API endpoints cho Playlists
 * Coverage: GET, POST, PUT, DELETE endpoints
 */

// Mock Service
const mockPlaylistsService = {
  getPlaylists: jest.fn(),
  createPlaylist: jest.fn(),
  getPlaylistWithItems: jest.fn(),
  updatePlaylist: jest.fn(),
  deletePlaylist: jest.fn(),
  addItemToPlaylist: jest.fn(),
  removeItemFromPlaylist: jest.fn(),
  reorderItems: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockReturnValue('http://mock-url.com'),
};

// Mock AuthGuard để bypass authentication
const mockAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('PlaylistsController', () => {
  let controller: PlaylistsController;
  const mockUserId = 'test-user-id-123';
  const mockPlaylistId = 'playlist-id-456';

  const mockRequest = {
    user: { id: mockUserId },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        { provide: PlaylistsService, useValue: mockPlaylistsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<PlaylistsController>(PlaylistsController);
  });

  // ============================================
  // GET /playlists Tests
  // ============================================

  describe('GET /playlists', () => {
    it('nên trả về danh sách playlists', async () => {
      // Arrange
      const mockResult = {
        success: true,
        playlists: [{ id: '1', name: 'Playlist 1' }],
      };
      mockPlaylistsService.getPlaylists.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getPlaylists(mockRequest);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockPlaylistsService.getPlaylists).toHaveBeenCalledWith(mockUserId);
    });

    it('nên throw HttpException khi không có user', async () => {
      const requestWithoutUser = { user: null };
      await expect(controller.getPlaylists(requestWithoutUser)).rejects.toThrow(HttpException);
    });
  });

  // ============================================
  // POST /playlists Tests
  // ============================================

  describe('POST /playlists', () => {
    const mockDto = { name: 'New Playlist' };

    it('nên tạo playlist thành công', async () => {
      const mockResult = { success: true, playlist: { id: 'new-id', ...mockDto } };
      mockPlaylistsService.createPlaylist.mockResolvedValue(mockResult);

      const result = await controller.createPlaylist(mockRequest, mockDto);

      expect(result).toEqual(mockResult);
      expect(mockPlaylistsService.createPlaylist).toHaveBeenCalledWith(mockUserId, mockDto);
    });
  });

  // ============================================
  // GET /playlists/:id Tests
  // ============================================

  describe('GET /playlists/:id', () => {
    it('nên trả về playlist kèm items', async () => {
      const mockResult = {
        success: true,
        playlist: { id: mockPlaylistId, items: [] },
      };
      mockPlaylistsService.getPlaylistWithItems.mockResolvedValue(mockResult);

      const result = await controller.getPlaylistWithItems(mockRequest, mockPlaylistId);

      expect(result).toEqual(mockResult);
      expect(mockPlaylistsService.getPlaylistWithItems).toHaveBeenCalledWith(mockUserId, mockPlaylistId);
    });
  });

  // ============================================
  // PUT /playlists/:id Tests
  // ============================================

  describe('PUT /playlists/:id', () => {
    const mockUpdateDto = { name: 'Updated Name' };

    it('nên cập nhật playlist thành công', async () => {
      const mockResult = { success: true, playlist: { id: mockPlaylistId, ...mockUpdateDto } };
      mockPlaylistsService.updatePlaylist.mockResolvedValue(mockResult);

      const result = await controller.updatePlaylist(mockRequest, mockPlaylistId, mockUpdateDto);

      expect(result).toEqual(mockResult);
      expect(mockPlaylistsService.updatePlaylist).toHaveBeenCalledWith(mockUserId, mockPlaylistId, mockUpdateDto);
    });
  });

  // ============================================
  // DELETE /playlists/:id Tests
  // ============================================

  describe('DELETE /playlists/:id', () => {
    it('nên xóa playlist thành công', async () => {
      const mockResult = { success: true, message: 'Đã xóa' };
      mockPlaylistsService.deletePlaylist.mockResolvedValue(mockResult);

      const result = await controller.deletePlaylist(mockRequest, mockPlaylistId);

      expect(result).toEqual(mockResult);
    });
  });

  // ============================================
  // POST /playlists/:id/items Tests
  // ============================================

  describe('POST /playlists/:id/items', () => {
    const mockItemDto = {
      topic: 'Test Topic',
      conversation: [],
      duration: 5,
      numSpeakers: 2,
    };

    it('nên thêm item vào playlist thành công', async () => {
      const mockResult = { success: true, item: { id: 'new-item-id' } };
      mockPlaylistsService.addItemToPlaylist.mockResolvedValue(mockResult);

      const result = await controller.addItemToPlaylist(mockRequest, mockPlaylistId, mockItemDto);

      expect(result).toEqual(mockResult);
      expect(mockPlaylistsService.addItemToPlaylist).toHaveBeenCalledWith(mockUserId, mockPlaylistId, mockItemDto);
    });
  });

  // ============================================
  // DELETE /playlists/:id/items/:itemId Tests
  // ============================================

  describe('DELETE /playlists/:id/items/:itemId', () => {
    const mockItemId = 'item-to-remove';

    it('nên xóa item khỏi playlist thành công', async () => {
      const mockResult = { success: true, message: 'Đã xóa' };
      mockPlaylistsService.removeItemFromPlaylist.mockResolvedValue(mockResult);

      const result = await controller.removeItemFromPlaylist(mockRequest, mockPlaylistId, mockItemId);

      expect(result).toEqual(mockResult);
    });
  });

  // ============================================
  // PUT /playlists/:id/reorder Tests
  // ============================================

  describe('PUT /playlists/:id/reorder', () => {
    const mockReorderDto = {
      items: [{ id: '1', position: 0 }, { id: '2', position: 1 }],
    };

    it('nên sắp xếp lại items thành công', async () => {
      const mockResult = { success: true, message: 'Đã sắp xếp lại' };
      mockPlaylistsService.reorderItems.mockResolvedValue(mockResult);

      const result = await controller.reorderItems(mockRequest, mockPlaylistId, mockReorderDto);

      expect(result).toEqual(mockResult);
      expect(mockPlaylistsService.reorderItems).toHaveBeenCalledWith(mockUserId, mockPlaylistId, mockReorderDto);
    });
  });
});

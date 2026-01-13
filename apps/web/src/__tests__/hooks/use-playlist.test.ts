/**
 * Unit Tests cho usePlaylist hook
 *
 * Mục đích: Test các operations của hook Playlist
 * Coverage: fetchPlaylists, createPlaylist, updatePlaylist, deletePlaylist,
 *           addItemToPlaylist, removeItemFromPlaylist, reorderItems
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlaylist } from '@/hooks/use-playlist';

// Mock API
const mockApi = jest.fn();
jest.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}));

describe('usePlaylist', () => {
  const mockPlaylists = [
    { id: '1', name: 'Playlist 1', itemCount: 3 },
    { id: '2', name: 'Playlist 2', itemCount: 5 },
  ];

  const mockPlaylistWithItems = {
    id: '1',
    name: 'Playlist 1',
    items: [
      { id: 'item-1', topic: 'Topic 1', position: 0 },
      { id: 'item-2', topic: 'Topic 2', position: 1 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock response for initial fetch
    mockApi.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
    });
  });

  // ============================================
  // Initial Fetch Tests
  // ============================================

  describe('initial fetch', () => {
    it('nên fetch danh sách playlists khi mount', async () => {
      const { result } = renderHook(() => usePlaylist());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.playlists).toEqual(mockPlaylists);
      expect(mockApi).toHaveBeenCalledWith('/playlists');
    });
  });

  // ============================================
  // createPlaylist Tests
  // ============================================

  describe('createPlaylist', () => {
    it('nên tạo playlist thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: [] }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock POST
      const newPlaylist = { id: 'new-id', name: 'New Playlist' };
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlist: newPlaylist }),
      });

      // Act
      let createdPlaylist;
      await act(async () => {
        createdPlaylist = await result.current.createPlaylist({ name: 'New Playlist' });
      });

      // Assert
      expect(createdPlaylist).toEqual(newPlaylist);
      expect(result.current.playlists).toContainEqual(expect.objectContaining({ id: 'new-id' }));
    });

    it('nên trả về null khi tạo thất bại', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: [] }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed POST
      mockApi.mockResolvedValueOnce({
        ok: false,
        json: jest.fn(),
      });

      let createdPlaylist;
      await act(async () => {
        createdPlaylist = await result.current.createPlaylist({ name: 'New Playlist' });
      });

      expect(createdPlaylist).toBeNull();
      expect(result.current.error).not.toBeNull();
    });
  });

  // ============================================
  // updatePlaylist Tests
  // ============================================

  describe('updatePlaylist', () => {
    it('nên cập nhật playlist thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock PUT
      const updatedPlaylist = { id: '1', name: 'Updated Playlist' };
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlist: updatedPlaylist }),
      });

      await act(async () => {
        await result.current.updatePlaylist('1', { name: 'Updated Playlist' });
      });

      expect(result.current.playlists.find((p) => p.id === '1')?.name).toBe('Updated Playlist');
    });
  });

  // ============================================
  // deletePlaylist Tests
  // ============================================

  describe('deletePlaylist', () => {
    it('nên xóa playlist thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.playlists).toHaveLength(2);

      // Mock DELETE
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      let success;
      await act(async () => {
        success = await result.current.deletePlaylist('1');
      });

      expect(success).toBe(true);
      expect(result.current.playlists).toHaveLength(1);
      expect(result.current.playlists.find((p) => p.id === '1')).toBeUndefined();
    });
  });

  // ============================================
  // fetchPlaylistWithItems Tests
  // ============================================

  describe('fetchPlaylistWithItems', () => {
    it('nên fetch playlist kèm items', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock GET /playlists/:id
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlist: mockPlaylistWithItems }),
      });

      let playlist;
      await act(async () => {
        playlist = await result.current.fetchPlaylistWithItems('1');
      });

      expect(playlist).toEqual(mockPlaylistWithItems);
      expect(result.current.currentPlaylist).toEqual(mockPlaylistWithItems);
    });
  });

  // ============================================
  // addItemToPlaylist Tests
  // ============================================

  describe('addItemToPlaylist', () => {
    const newItem = {
      topic: 'New Topic',
      conversation: [{ speaker: 'A', text: 'Hello' }],
      duration: 5,
      numSpeakers: 2,
    };

    it('nên thêm item vào playlist thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialItemCount = mockPlaylists[0].itemCount;

      // Mock POST /playlists/:id/items
      const addedItem = { id: 'new-item-id', ...newItem };
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ item: addedItem }),
      });

      let item;
      await act(async () => {
        item = await result.current.addItemToPlaylist('1', newItem);
      });

      expect(item).toEqual(addedItem);
      // Item count should increase
      expect(result.current.playlists.find((p) => p.id === '1')?.itemCount).toBe(initialItemCount + 1);
    });
  });

  // ============================================
  // removeItemFromPlaylist Tests
  // ============================================

  describe('removeItemFromPlaylist', () => {
    it('nên xóa item khỏi playlist thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialItemCount = mockPlaylists[0].itemCount;

      // Mock DELETE /playlists/:id/items/:itemId
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      let success;
      await act(async () => {
        success = await result.current.removeItemFromPlaylist('1', 'item-1');
      });

      expect(success).toBe(true);
      expect(result.current.playlists.find((p) => p.id === '1')?.itemCount).toBe(initialItemCount - 1);
    });
  });

  // ============================================
  // reorderItems Tests
  // ============================================

  describe('reorderItems', () => {
    it('nên sắp xếp lại items thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlists: mockPlaylists }),
      });

      const { result } = renderHook(() => usePlaylist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock PUT /playlists/:id/reorder
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Mock fetch playlist with items (called after reorder)
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ playlist: mockPlaylistWithItems }),
      });

      const newOrder = [
        { id: 'item-2', position: 0 },
        { id: 'item-1', position: 1 },
      ];

      let success;
      await act(async () => {
        success = await result.current.reorderItems('1', newOrder);
      });

      expect(success).toBe(true);
    });
  });
});

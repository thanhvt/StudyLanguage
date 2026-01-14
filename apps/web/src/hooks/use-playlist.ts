'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Playlist,
  PlaylistItem,
  CreatePlaylistDto,
  AddPlaylistItemDto,
} from '@/types/listening-types';

/**
 * usePlaylist - Hook quản lý Playlists
 * 
 * Mục đích: CRUD operations cho Playlists với Supabase backend
 * Tham số đầu ra: playlists, loading states, và các methods
 * Khi nào sử dụng: Trong các components liên quan đến Playlists
 */
export function usePlaylist() {
  const { user, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track đã fetch lần đầu chưa - tránh infinite loop
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  /**
   * Lấy danh sách playlists từ API
   */
  /**
   * Lấy danh sách playlists từ API
   */
  const fetchPlaylists = useCallback(async () => {
    // Không có user = chưa đăng nhập
    if (!user) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await api('/playlists', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Handle 401 specifically - token có thể đã hết hạn
      if (response.status === 401) {
        // console.warn('[usePlaylist] Token hết hạn, đang xử lý refresh...');
        // Không xóa playlists ngay để tránh flash loading nếu refresh thành công sau đó
        // setPlaylists([]); 
        return;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`[usePlaylist] Lỗi ${response.status}: ${errorText}`);
        setError(`Lỗi ${response.status}: Không thể lấy danh sách playlists`);
        return;
      }

      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err) {
      clearTimeout(timeoutId);
      
      // Ignore abort errors (component unmount or timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[usePlaylist] Fetch aborted');
        return;
      }
      
      console.error('[usePlaylist] Lỗi fetch:', err);
      // Chỉ set error nếu không phải là lỗi network (để tránh báo lỗi khi offline tạm thời)
      if (err instanceof Error && err.message !== 'Failed to fetch') {
         setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Lấy chi tiết playlist kèm items
   * 
   * @param playlistId - ID của playlist
   * @returns Playlist với items hoặc null nếu lỗi
   */
  const fetchPlaylistWithItems = useCallback(async (playlistId: string) => {
    try {
      const response = await api(`/playlists/${playlistId}`);
      if (!response.ok) {
        throw new Error('Lỗi lấy chi tiết playlist');
      }

      const data = await response.json();
      setCurrentPlaylist(data.playlist);
      return data.playlist as Playlist;
    } catch (err) {
      console.error('[usePlaylist] Lỗi fetchWithItems:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    }
  }, []);

  /**
   * Tạo playlist mới
   * 
   * @param dto - Dữ liệu playlist cần tạo
   * @returns Playlist vừa tạo hoặc null nếu lỗi
   */
  const createPlaylist = useCallback(async (dto: CreatePlaylistDto) => {
    if (!user) {
      setError('Vui lòng đăng nhập để tạo playlist');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await api('/playlists', {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Lỗi tạo playlist');
      }

      const data = await response.json();
      
      // Cập nhật local state
      setPlaylists(prev => [{ ...data.playlist, itemCount: 0 }, ...prev]);

      return data.playlist as Playlist;
    } catch (err) {
      console.error('[usePlaylist] Lỗi create:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Cập nhật playlist
   * 
   * @param playlistId - ID của playlist
   * @param dto - Dữ liệu cập nhật
   * @returns Playlist đã cập nhật hoặc null nếu lỗi
   */
  const updatePlaylist = useCallback(async (playlistId: string, dto: Partial<CreatePlaylistDto>) => {
    try {
      const response = await api(`/playlists/${playlistId}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Lỗi cập nhật playlist');
      }

      const data = await response.json();
      
      // Cập nhật local state
      setPlaylists(prev =>
        prev.map(p => (p.id === playlistId ? { ...p, ...data.playlist } : p))
      );

      return data.playlist as Playlist;
    } catch (err) {
      console.error('[usePlaylist] Lỗi update:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    }
  }, []);

  /**
   * Xóa playlist
   * 
   * @param playlistId - ID của playlist cần xóa
   * @returns true nếu thành công, false nếu lỗi
   */
  const deletePlaylist = useCallback(async (playlistId: string) => {
    try {
      const response = await api(`/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa playlist');
      }

      // Cập nhật local state
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
      }

      return true;
    } catch (err) {
      console.error('[usePlaylist] Lỗi delete:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, [currentPlaylist?.id]);

  /**
   * Thêm item vào playlist
   * 
   * @param playlistId - ID của playlist
   * @param dto - Dữ liệu item cần thêm
   * @returns Item vừa thêm hoặc null nếu lỗi
   */
  const addItemToPlaylist = useCallback(async (playlistId: string, dto: AddPlaylistItemDto) => {
    try {
      const response = await api(`/playlists/${playlistId}/items`, {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Lỗi thêm vào playlist');
      }

      const data = await response.json();
      
      // Cập nhật item count trong local state
      setPlaylists(prev =>
        prev.map(p =>
          p.id === playlistId
            ? { ...p, itemCount: (p.itemCount || 0) + 1 }
            : p
        )
      );

      // Cập nhật current playlist nếu đang xem
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(prev =>
          prev
            ? { ...prev, items: [...(prev.items || []), data.item] }
            : null
        );
      }

      return data.item as PlaylistItem;
    } catch (err) {
      console.error('[usePlaylist] Lỗi addItem:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    }
  }, [currentPlaylist?.id]);

  /**
   * Xóa item khỏi playlist
   * 
   * @param playlistId - ID của playlist
   * @param itemId - ID của item cần xóa
   * @returns true nếu thành công, false nếu lỗi
   */
  const removeItemFromPlaylist = useCallback(async (playlistId: string, itemId: string) => {
    try {
      const response = await api(`/playlists/${playlistId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa khỏi playlist');
      }

      // Cập nhật item count
      setPlaylists(prev =>
        prev.map(p =>
          p.id === playlistId
            ? { ...p, itemCount: Math.max(0, (p.itemCount || 0) - 1) }
            : p
        )
      );

      // Cập nhật current playlist nếu đang xem
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(prev =>
          prev
            ? { ...prev, items: (prev.items || []).filter(i => i.id !== itemId) }
            : null
        );
      }

      return true;
    } catch (err) {
      console.error('[usePlaylist] Lỗi removeItem:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, [currentPlaylist?.id]);

  /**
   * Sắp xếp lại items trong playlist
   * 
   * @param playlistId - ID của playlist
   * @param items - Danh sách items với position mới
   * @returns true nếu thành công, false nếu lỗi
   */
  const reorderItems = useCallback(async (
    playlistId: string,
    items: { id: string; position: number }[]
  ) => {
    try {
      const response = await api(`/playlists/${playlistId}/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Lỗi sắp xếp lại playlist');
      }

      // Refresh playlist items
      await fetchPlaylistWithItems(playlistId);

      return true;
    } catch (err) {
      console.error('[usePlaylist] Lỗi reorder:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, [fetchPlaylistWithItems]);

  /**
   * Sắp xếp lại thứ tự playlists (client-side only)
   * 
   * @param reorderedPlaylists - Danh sách playlists đã sắp xếp lại
   */
  const reorderPlaylists = useCallback((reorderedPlaylists: Playlist[]) => {
    setPlaylists(reorderedPlaylists);
    // TODO: Nếu cần persist order lên server, thêm API call ở đây
  }, []);

  // Fetch khi auth đã sẵn sàng và user thay đổi
  useEffect(() => {
    // Đợi auth khởi tạo xong
    if (authLoading) {
      return;
    }

    // Nếu user thay đổi (login/logout), reset flag và fetch lại
    const currentUserId = user?.id || null;
    if (currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      hasFetchedRef.current = false;
    }

    // Chỉ fetch 1 lần cho mỗi user
    if (!hasFetchedRef.current && user) {
      hasFetchedRef.current = true;
      fetchPlaylists();
    } else if (!user) {
      // Clear playlists khi logout
      setPlaylists([]);
    }
  }, [authLoading, user, fetchPlaylists]);

  return {
    playlists,
    currentPlaylist,
    isLoading,
    isCreating,
    error,
    fetchPlaylists,
    fetchPlaylistWithItems,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addItemToPlaylist,
    removeItemFromPlaylist,
    reorderItems,
    reorderPlaylists,
    setCurrentPlaylist,
  };
}

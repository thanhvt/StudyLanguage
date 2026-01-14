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

// ============================================================================
// MODULE-LEVEL CACHE - Persist across component remounts
// ============================================================================

interface PlaylistCache {
  data: Playlist[];
  userId: string | null;
  timestamp: number;
}

// Cache toàn cục - không bị reset khi component remount
let playlistCache: PlaylistCache | null = null;

// Thời gian cache hợp lệ (5 phút)
const CACHE_TTL_MS = 5 * 60 * 1000;

// Track request đang chạy để tránh duplicate
let pendingRequest: Promise<Playlist[]> | null = null;

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Kiểm tra cache còn hợp lệ không
 * 
 * @param userId - User ID hiện tại
 * @returns true nếu cache valid cho user này và chưa hết hạn
 */
function isCacheValid(userId: string | null): boolean {
  if (!playlistCache) return false;
  if (playlistCache.userId !== userId) return false;
  if (Date.now() - playlistCache.timestamp > CACHE_TTL_MS) return false;
  return true;
}

/**
 * Cập nhật cache
 * 
 * @param data - Dữ liệu playlists
 * @param userId - User ID
 */
function updateCache(data: Playlist[], userId: string | null): void {
  playlistCache = {
    data,
    userId,
    timestamp: Date.now(),
  };
}

/**
 * Xóa cache (khi logout hoặc cần force refresh)
 */
function clearCache(): void {
  playlistCache = null;
  pendingRequest = null;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * usePlaylist - Hook quản lý Playlists với caching thông minh
 * 
 * Mục đích: CRUD operations cho Playlists với Supabase backend
 * Tham số đầu ra: playlists, loading states, và các methods
 * Khi nào sử dụng: Trong các components liên quan đến Playlists
 * 
 * Features:
 * - Module-level cache (persist across remounts)
 * - Debounce để tránh gọi API quá nhanh
 * - Stale-while-revalidate pattern
 * - Duplicate request prevention
 */
export function usePlaylist() {
  const { user, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    // Khởi tạo từ cache nếu có và hợp lệ
    if (isCacheValid(user?.id || null)) {
      return playlistCache!.data;
    }
    return [];
  });
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track nếu component đã unmount
  const isMountedRef = useRef(true);

  /**
   * Core fetch function - gọi API và cập nhật cache
   */
  const doFetch = useCallback(async (userId: string): Promise<Playlist[]> => {
    const response = await api('/playlists');
    
    // Handle different status codes
    if (response.status === 401) {
      console.warn('[usePlaylist] Token hết hạn');
      return [];
    }
    
    if (response.status === 429) {
      console.warn('[usePlaylist] Rate limited, sử dụng cache');
      // Nếu có cache, trả về cache thay vì báo lỗi
      if (playlistCache?.data) {
        return playlistCache.data;
      }
      throw new Error('Quá nhiều request. Vui lòng đợi một chút.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[usePlaylist] Lỗi ${response.status}: ${errorText}`);
      throw new Error(`Lỗi ${response.status}`);
    }

    const data = await response.json();
    const playlists = data.playlists || [];
    
    // Cập nhật cache
    updateCache(playlists, userId);
    
    return playlists;
  }, []);

  /**
   * Lấy danh sách playlists từ API với debounce và caching
   * 
   * @param forceRefresh - Bỏ qua cache và gọi API mới
   */
  const fetchPlaylists = useCallback(async (forceRefresh = false) => {
    // Không có user = chưa đăng nhập
    if (!user) {
      setPlaylists([]);
      clearCache();
      return;
    }

    const userId = user.id;

    // Kiểm tra cache (trừ khi force refresh)
    if (!forceRefresh && isCacheValid(userId)) {
      // Cache vẫn valid, dùng data từ cache
      setPlaylists(playlistCache!.data);
      return;
    }

    // Nếu đang có request pending, đợi kết quả thay vì gọi mới
    if (pendingRequest) {
      try {
        const result = await pendingRequest;
        if (isMountedRef.current) {
          setPlaylists(result);
        }
      } catch {
        // Ignore - sẽ được handle bởi request gốc
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    // Tạo promise và lưu vào pendingRequest
    pendingRequest = doFetch(userId);

    try {
      const result = await pendingRequest;
      if (isMountedRef.current) {
        setPlaylists(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[usePlaylist] Lỗi fetch:', err);
        // Nếu có cache cũ, vẫn dùng được
        if (playlistCache?.data) {
          setPlaylists(playlistCache.data);
          setError('Không thể cập nhật. Đang hiển thị dữ liệu cũ.');
        } else {
          setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        }
      }
    } finally {
      pendingRequest = null;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, doFetch]);

  /**
   * Debounced fetch - chờ 300ms trước khi thực sự gọi API
   * Tránh gọi API nhiều lần khi chuyển tab nhanh
   */
  const debouncedFetch = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      fetchPlaylists();
    }, 300);
  }, [fetchPlaylists]);

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
      const newPlaylist = { ...data.playlist, itemCount: 0 };
      
      // Cập nhật local state và cache
      setPlaylists(prev => {
        const updated = [newPlaylist, ...prev];
        updateCache(updated, user.id);
        return updated;
      });

      return data.playlist as Playlist;
    } catch (err) {
      console.error('[usePlaylist] Lỗi create:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

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
      
      // Cập nhật local state và cache
      setPlaylists(prev => {
        const updated = prev.map(p => (p.id === playlistId ? { ...p, ...data.playlist } : p));
        if (user) updateCache(updated, user.id);
        return updated;
      });

      return data.playlist as Playlist;
    } catch (err) {
      console.error('[usePlaylist] Lỗi update:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    }
  }, [user]);

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

      // Cập nhật local state và cache
      setPlaylists(prev => {
        const updated = prev.filter(p => p.id !== playlistId);
        if (user) updateCache(updated, user.id);
        return updated;
      });
      
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
      }

      return true;
    } catch (err) {
      console.error('[usePlaylist] Lỗi delete:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, [currentPlaylist?.id, user]);

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
      
      // Cập nhật item count trong local state và cache
      setPlaylists(prev => {
        const updated = prev.map(p =>
          p.id === playlistId
            ? { ...p, itemCount: (p.itemCount || 0) + 1 }
            : p
        );
        if (user) updateCache(updated, user.id);
        return updated;
      });

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
  }, [currentPlaylist?.id, user]);

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

      // Cập nhật item count và cache
      setPlaylists(prev => {
        const updated = prev.map(p =>
          p.id === playlistId
            ? { ...p, itemCount: Math.max(0, (p.itemCount || 0) - 1) }
            : p
        );
        if (user) updateCache(updated, user.id);
        return updated;
      });

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
  }, [currentPlaylist?.id, user]);

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
    if (user) updateCache(reorderedPlaylists, user.id);
  }, [user]);

  // Effect: Fetch data khi auth sẵn sàng
  useEffect(() => {
    isMountedRef.current = true;
    
    // Đợi auth khởi tạo xong
    if (authLoading) {
      return;
    }

    // Logout: Clear cache và state
    if (!user) {
      setPlaylists([]);
      clearCache();
      return;
    }

    // User thay đổi: Clear cache cũ
    if (playlistCache && playlistCache.userId !== user.id) {
      clearCache();
    }

    // Sử dụng debounced fetch để tránh gọi quá nhanh khi chuyển tab
    debouncedFetch();
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [authLoading, user, debouncedFetch]);

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

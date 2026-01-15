'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { api } from '@/lib/api';
import { ListenLaterItem, AddListenLaterDto } from '@/types/listening-types';
import { useAuth } from '@/components/providers/auth-provider';
import { showError, showSuccess } from '@/lib/toast';

// ============================================================================
// MODULE-LEVEL CACHE - Persist across component remounts
// ============================================================================

interface ListenLaterCache {
  items: ListenLaterItem[];
  count: number;
  userId: string | null;
  timestamp: number;
}

// Cache toàn cục - không bị reset khi component remount
let listenLaterCache: ListenLaterCache | null = null;

// Thời gian cache hợp lệ (5 phút)
const CACHE_TTL_MS = 5 * 60 * 1000;

// Track request đang chạy để tránh duplicate
let pendingRequest: Promise<{ items: ListenLaterItem[]; count: number }> | null = null;

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Kiểm tra cache còn hợp lệ không
 */
function isCacheValid(userId: string | null): boolean {
  if (!listenLaterCache) return false;
  if (listenLaterCache.userId !== userId) return false;
  if (Date.now() - listenLaterCache.timestamp > CACHE_TTL_MS) return false;
  return true;
}

/**
 * Cập nhật cache
 */
function updateCache(items: ListenLaterItem[], count: number, userId: string | null): void {
  listenLaterCache = {
    items,
    count,
    userId,
    timestamp: Date.now(),
  };
}

/**
 * Xóa cache
 */
function clearCache(): void {
  listenLaterCache = null;
  pendingRequest = null;
}

// ============================================================================
// CONTEXT & PROVIDER
// ============================================================================

interface ListenLaterContextType {
  items: ListenLaterItem[];
  count: number;
  isLoading: boolean;
  isAdding: boolean;
  // error removed
  fetchListenLater: () => Promise<void>;
  addToListenLater: (dto: AddListenLaterDto) => Promise<ListenLaterItem | null>;
  removeFromListenLater: (itemId: string) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
  updateAudio: (itemId: string, audioUrl: string, audioTimestamps?: { startTime: number; endTime: number }[]) => Promise<boolean>;
}

const ListenLaterContext = createContext<ListenLaterContextType | null>(null);

/**
 * ListenLaterProvider Component với caching thông minh
 * 
 * Features:
 * - Module-level cache (persist across remounts)
 * - Debounce để tránh gọi API quá nhanh
 * - Stale-while-revalidate pattern
 * - Duplicate request prevention
 */
export function ListenLaterProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ListenLaterItem[]>(() => {
    if (isCacheValid(user?.id || null)) {
      return listenLaterCache!.items;
    }
    return [];
  });
  const [count, setCount] = useState(() => {
    if (isCacheValid(user?.id || null)) {
      return listenLaterCache!.count;
    }
    return 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  // error state removed in favor of toast
  
  const isMountedRef = useRef(true);

  /**
   * Core fetch function
   */
  const doFetch = useCallback(async (userId: string): Promise<{ items: ListenLaterItem[]; count: number }> => {
    const response = await api('/listen-later');
    
    if (response.status === 401) {
      console.warn('[ListenLater] Token hết hạn');
      return { items: [], count: 0 };
    }
    
    if (response.status === 429) {
      console.warn('[ListenLater] Rate limited, sử dụng cache');
      if (listenLaterCache) {
        return { items: listenLaterCache.items, count: listenLaterCache.count };
      }
      throw new Error('Quá nhiều request. Vui lòng đợi.');
    }

    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}`);
    }

    const data = await response.json();
    const result = { items: data.items || [], count: data.count || 0 };
    
    updateCache(result.items, result.count, userId);
    
    return result;
  }, []);

  /**
   * Lấy danh sách Listen Later với debounce và caching
   */
  const fetchListenLater = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setItems([]);
      setCount(0);
      clearCache();
      return;
    }

    const userId = user.id;

    if (!forceRefresh && isCacheValid(userId)) {
      setItems(listenLaterCache!.items);
      setCount(listenLaterCache!.count);
      return;
    }

    if (pendingRequest) {
      try {
        const result = await pendingRequest;
        if (isMountedRef.current) {
          setItems(result.items);
          setCount(result.count);
        }
      } catch {
        // Ignore
      }
      return;
    }

    setIsLoading(true);

    pendingRequest = doFetch(userId);

    try {
      const result = await pendingRequest;
      if (isMountedRef.current) {
        setItems(result.items);
        setCount(result.count);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[ListenLater] Lỗi fetch:', err);
        if (listenLaterCache) {
          setItems(listenLaterCache.items);
          setCount(listenLaterCache.count);
          setCount(listenLaterCache.count);
        }
        // showError(err instanceof Error ? err.message : 'Lỗi không xác định');
      }
    } finally {
      pendingRequest = null;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, doFetch]);

  /**
   * Debounced fetch
   */
  const debouncedFetch = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      fetchListenLater();
    }, 300);
  }, [fetchListenLater]);

  /**
   * Thêm item vào Listen Later
   */
  const addToListenLater = useCallback(async (dto: AddListenLaterDto) => {
    if (!user) {
      showError('Vui lòng đăng nhập để sử dụng tính năng này');
      return null;
    }

    setIsAdding(true);

    try {
      const response = await api('/listen-later', {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Lỗi thêm vào Nghe Sau');
      }

      const data = await response.json();
      const newItem = data.item as ListenLaterItem;
      
      setItems(prev => {
        const updated = [newItem, ...prev];
        updateCache(updated, updated.length, user.id);
        return updated;
      });
      setCount(prev => prev + 1);

      showSuccess('Đã thêm vào Nghe Sau');
      return newItem;
    } catch (err) {
      console.error('[ListenLater] Lỗi add:', err);
      showError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setIsAdding(false);
    }
  }, [user]);

  /**
   * Xóa item khỏi Listen Later
   */
  const removeFromListenLater = useCallback(async (itemId: string) => {
    try {
      const response = await api(`/listen-later/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa khỏi Nghe Sau');
      }

      setItems(prev => {
        const updated = prev.filter(item => item.id !== itemId);
        if (user) updateCache(updated, updated.length, user.id);
        return updated;
      });
      setCount(prev => Math.max(0, prev - 1));

      showSuccess('Đã xóa khỏi Nghe Sau');
      return true;
    } catch (err) {
      console.error('[ListenLater] Lỗi remove:', err);
      showError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, [user]);

  /**
   * Xóa tất cả
   */
  const clearAll = useCallback(async () => {
    try {
      const response = await api('/listen-later', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa tất cả');
      }

      setItems([]);
      setCount(0);
      if (user) updateCache([], 0, user.id);

      showSuccess('Đã xóa tất cả Nghe Sau');
      return true;
    } catch (err) {
      console.error('[ListenLater] Lỗi clearAll:', err);
      showError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, [user]);

  /**
   * Cập nhật audio cho item
   */
  const updateAudio = useCallback(async (
    itemId: string, 
    audioUrl: string,
    audioTimestamps?: { startTime: number; endTime: number }[]
  ) => {
    try {
      const response = await api(`/listen-later/${itemId}/audio`, {
        method: 'PATCH',
        body: JSON.stringify({ audioUrl, audioTimestamps }),
      });

      if (!response.ok) {
        throw new Error('Lỗi cập nhật audio');
      }

      setItems(prev => {
        const updated = prev.map(item => {
          if (item.id === itemId) {
            return { ...item, audio_url: audioUrl, audio_timestamps: audioTimestamps };
          }
          return item;
        });
        if (user) updateCache(updated, updated.length, user.id);
        return updated;
      });

      return true;
    } catch (err) {
      console.error('[ListenLater] Lỗi updateAudio:', err);
      return false;
    }
  }, [user]);

  // Effect: Fetch data khi auth sẵn sàng
  useEffect(() => {
    isMountedRef.current = true;
    
    if (authLoading) {
      return;
    }

    if (!user) {
      setItems([]);
      setCount(0);
      clearCache();
      return;
    }

    if (listenLaterCache && listenLaterCache.userId !== user.id) {
      clearCache();
    }

    debouncedFetch();
    
    return () => {
      isMountedRef.current = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [authLoading, user, debouncedFetch]);

  return (
    <ListenLaterContext.Provider 
      value={{
        items,
        count,
        isLoading,
        isAdding,
        fetchListenLater,
        addToListenLater,
        removeFromListenLater,
        clearAll,
        updateAudio,
      }}
    >
      {children}
    </ListenLaterContext.Provider>
  );
}

/**
 * Hook để sử dụng ListenLater context
 */
export function useListenLaterContext() {
  const context = useContext(ListenLaterContext);
  if (!context) {
    throw new Error('useListenLaterContext phải được sử dụng bên trong ListenLaterProvider');
  }
  return context;
}

/**
 * Hook fallback
 */
export function useListenLaterSafe() {
  const context = useContext(ListenLaterContext);
  
  if (context) {
    return context;
  }
  
  console.warn('[useListenLaterSafe] Không tìm thấy ListenLaterProvider');
  return {
    items: [] as ListenLaterItem[],
    count: 0,
    isLoading: false,
    isAdding: false,
    fetchListenLater: async () => {},
    addToListenLater: async () => null,
    removeFromListenLater: async () => false,
    clearAll: async () => false,
    updateAudio: async () => false,
  };
}

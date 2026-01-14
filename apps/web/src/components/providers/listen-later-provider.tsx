'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { api } from '@/lib/api';
import { ListenLaterItem, AddListenLaterDto } from '@/types/listening-types';
import { useAuth } from '@/components/providers/auth-provider';

/**
 * ListenLaterContext - Context để share state Listen Later giữa các components
 * 
 * Mục đích: Giải quyết vấn đề badge count không sync khi xóa item
 * Khi nào sử dụng: Wrap trong AppLayout hoặc ListeningPage
 */

interface ListenLaterContextType {
  items: ListenLaterItem[];
  count: number;
  isLoading: boolean;
  isAdding: boolean;
  error: string | null;
  fetchListenLater: () => Promise<void>;
  addToListenLater: (dto: AddListenLaterDto) => Promise<ListenLaterItem | null>;
  removeFromListenLater: (itemId: string) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
}

const ListenLaterContext = createContext<ListenLaterContextType | null>(null);

/**
 * ListenLaterProvider Component
 * 
 * Mục đích: Cung cấp shared state cho Listen Later feature
 * Tham số đầu vào: children - React nodes
 * Khi nào sử dụng: Wrap ở listening page hoặc app layout
 */
export function ListenLaterProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ListenLaterItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track đã fetch lần đầu chưa - tránh infinite loop
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  /**
   * Lấy danh sách Listen Later từ API
   */
  const fetchListenLater = useCallback(async () => {
    // Không có user = chưa đăng nhập
    if (!user) {
      setItems([]);
      setCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api('/listen-later');
      
      // Handle 401 specifically - token có thể đã hết hạn
      if (response.status === 401) {
        console.warn('[ListenLaterContext] Token hết hạn, cần đăng nhập lại');
        setItems([]);
        setCount(0);
        setError(null); // Không hiển thị lỗi nếu do chưa đăng nhập
        return;
      }

      if (!response.ok) {
        throw new Error('Lỗi lấy danh sách Nghe Sau');
      }

      const data = await response.json();
      setItems(data.items || []);
      setCount(data.count || 0);
    } catch (err) {
      console.error('[ListenLaterContext] Lỗi fetch:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Thêm item vào Listen Later
   */
  const addToListenLater = useCallback(async (dto: AddListenLaterDto) => {
    if (!user) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này');
      return null;
    }

    setIsAdding(true);
    setError(null);

    try {
      const response = await api('/listen-later', {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Lỗi thêm vào Nghe Sau');
      }

      const data = await response.json();
      
      // Cập nhật local state
      setItems(prev => [data.item, ...prev]);
      setCount(prev => prev + 1);

      return data.item as ListenLaterItem;
    } catch (err) {
      console.error('[ListenLaterContext] Lỗi add:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setIsAdding(false);
    }
  }, []);

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

      // Cập nhật local state - đây là nơi count được sync
      setItems(prev => prev.filter(item => item.id !== itemId));
      setCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error('[ListenLaterContext] Lỗi remove:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, []);

  /**
   * Xóa tất cả items trong Listen Later
   */
  const clearAll = useCallback(async () => {
    try {
      const response = await api('/listen-later', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa tất cả Nghe Sau');
      }

      // Cập nhật local state
      setItems([]);
      setCount(0);

      return true;
    } catch (err) {
      console.error('[ListenLaterContext] Lỗi clearAll:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
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
      fetchListenLater();
    } else if (!user) {
      // Clear items khi logout
      setItems([]);
      setCount(0);
    }
  }, [authLoading, user, fetchListenLater]);

  return (
    <ListenLaterContext.Provider 
      value={{
        items,
        count,
        isLoading,
        isAdding,
        error,
        fetchListenLater,
        addToListenLater,
        removeFromListenLater,
        clearAll,
      }}
    >
      {children}
    </ListenLaterContext.Provider>
  );
}

/**
 * Hook để sử dụng ListenLater context
 * 
 * Mục đích: Thay thế useListenLater() hook để share state
 * Tham số đầu ra: ListenLaterContextType
 * Khi nào sử dụng: Trong mọi component cần truy cập listen later state
 */
export function useListenLaterContext() {
  const context = useContext(ListenLaterContext);
  if (!context) {
    throw new Error('useListenLaterContext phải được sử dụng bên trong ListenLaterProvider');
  }
  return context;
}

/**
 * Hook fallback - để không break existing code
 * Sẽ cố dùng context, nếu không có sẽ fallback về standalone state
 */
export function useListenLaterSafe() {
  const context = useContext(ListenLaterContext);
  
  // Nếu có context, dùng context
  if (context) {
    return context;
  }
  
  // Fallback - tạo standalone state (không recommended)
  console.warn('[useListenLaterSafe] Không tìm thấy ListenLaterProvider, sử dụng standalone state');
  return {
    items: [] as ListenLaterItem[],
    count: 0,
    isLoading: false,
    isAdding: false,
    error: null,
    fetchListenLater: async () => {},
    addToListenLater: async () => null,
    removeFromListenLater: async () => false,
    clearAll: async () => false,
  };
}

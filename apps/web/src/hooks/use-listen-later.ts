'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ListenLaterItem, AddListenLaterDto } from '@/types/listening-types';

/**
 * useListenLater - Hook quản lý danh sách Nghe Sau
 * 
 * Mục đích: CRUD operations cho Listen Later với Supabase backend
 * Tham số đầu ra: items, count, loading states, và các methods
 * Khi nào sử dụng: Trong các components liên quan đến Listen Later
 */
export function useListenLater() {
  const [items, setItems] = useState<ListenLaterItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy danh sách Listen Later từ API
   */
  const fetchListenLater = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api('/listen-later');
      if (!response.ok) {
        throw new Error('Lỗi lấy danh sách Nghe Sau');
      }

      const data = await response.json();
      setItems(data.items || []);
      setCount(data.count || 0);
    } catch (err) {
      console.error('[useListenLater] Lỗi fetch:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Thêm item vào Listen Later
   * 
   * @param dto - Dữ liệu item cần thêm
   * @returns Item vừa thêm hoặc null nếu lỗi
   */
  const addToListenLater = useCallback(async (dto: AddListenLaterDto) => {
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
      console.error('[useListenLater] Lỗi add:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setIsAdding(false);
    }
  }, []);

  /**
   * Xóa item khỏi Listen Later
   * 
   * @param itemId - ID của item cần xóa
   * @returns true nếu thành công, false nếu lỗi
   */
  const removeFromListenLater = useCallback(async (itemId: string) => {
    try {
      const response = await api(`/listen-later/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa khỏi Nghe Sau');
      }

      // Cập nhật local state
      setItems(prev => prev.filter(item => item.id !== itemId));
      setCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error('[useListenLater] Lỗi remove:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, []);

  /**
   * Xóa tất cả items trong Listen Later
   * 
   * @returns true nếu thành công, false nếu lỗi
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
      console.error('[useListenLater] Lỗi clearAll:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, []);

  // Fetch lần đầu khi mount
  useEffect(() => {
    fetchListenLater();
  }, [fetchListenLater]);

  return {
    items,
    count,
    isLoading,
    isAdding,
    error,
    fetchListenLater,
    addToListenLater,
    removeFromListenLater,
    clearAll,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ListenLaterItem, AddListenLaterDto } from '@/types/listening-types';
import { showError, showSuccess } from '@/lib/toast';

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
  // error state removed in favor of toast

  /**
   * Lấy danh sách Listen Later từ API
   */
  const fetchListenLater = useCallback(async () => {
    setIsLoading(true);

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
      // showError(err instanceof Error ? err.message : 'Lỗi không xác định');
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

      showSuccess('Đã thêm vào danh sách Nghe sau');
      return data.item as ListenLaterItem;
    } catch (err) {
      console.error('[useListenLater] Lỗi add:', err);
      showError(err instanceof Error ? err.message : 'Lỗi không xác định');
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

      showSuccess('Đã xóa khỏi danh sách Nghe sau');
      return true;
    } catch (err) {
      console.error('[useListenLater] Lỗi remove:', err);
      showError(err instanceof Error ? err.message : 'Lỗi không xác định');
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

      showSuccess('Đã xóa tất cả danh sách Nghe sau');
      return true;
    } catch (err) {
      console.error('[useListenLater] Lỗi clearAll:', err);
      showError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return false;
    }
  }, []);

  /**
   * Cập nhật audio cho item Listen Later
   * 
   * @param itemId - ID của item cần cập nhật
   * @param audioUrl - URL audio trên Supabase Storage
   * @param audioTimestamps - Timestamps cho từng câu
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

      // Cập nhật local state
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, audio_url: audioUrl, audio_timestamps: audioTimestamps };
        }
        return item;
      }));

      return true;
    } catch (err) {
      console.error('[useListenLater] Lỗi updateAudio:', err);
      // Không cần show error toast vì đây là background update
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
    fetchListenLater,
    addToListenLater,
    removeFromListenLater,
    clearAll,
    updateAudio,
  };
}


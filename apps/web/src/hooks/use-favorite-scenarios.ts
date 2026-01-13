'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';

/**
 * Hook quản lý favorite scenarios
 * 
 * Mục đích: Cho phép users ghim/bỏ ghim các scenarios yêu thích
 * Tham số đầu ra:
 *   - favorites: Set of favorite scenario IDs
 *   - isFavorite: Check if a scenario is favorited
 *   - toggleFavorite: Toggle favorite status
 *   - isLoading: Loading state
 * Khi nào sử dụng: Trong TopicPicker component
 */
export function useFavoriteScenarios() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const supabase = createClient();

  /**
   * Fetch danh sách favorites của user hiện tại
   */
  const fetchFavorites = useCallback(async () => {
    if (!session?.user?.id) {
      setFavorites(new Set());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorite_scenarios')
        .select('scenario_id')
        .eq('user_id', session.user.id);

      if (error) {
        // Nếu bảng chưa tồn tại (chưa chạy migration), chỉ log warning
        if (error.code === '42P01' || error.message?.includes('relation') || !error.message) {
          console.warn('[useFavoriteScenarios] Bảng favorite_scenarios chưa tồn tại. Chạy migration: docs/migrations/favorite_scenarios.sql');
        } else {
          console.error('Lỗi khi fetch favorites:', error);
        }
        setFavorites(new Set());
        return;
      }

      const favoriteIds = new Set(data?.map(item => item.scenario_id) || []);
      setFavorites(favoriteIds);
    } catch (err) {
      console.warn('[useFavoriteScenarios] Lỗi fetch:', err);
      setFavorites(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, supabase]);

  /**
   * Toggle favorite status của một scenario
   * @param scenarioId - ID của scenario (e.g., 'it-1', 'daily-25')
   */
  const toggleFavorite = useCallback(async (scenarioId: string) => {
    if (!session?.user?.id) {
      console.warn('Cần đăng nhập để ghim scenario');
      return;
    }

    const isFavorited = favorites.has(scenarioId);

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFavorited) {
        next.delete(scenarioId);
      } else {
        next.add(scenarioId);
      }
      return next;
    });

    try {
      if (isFavorited) {
        // Xóa khỏi favorites
        const { error } = await supabase
          .from('favorite_scenarios')
          .delete()
          .eq('user_id', session.user.id)
          .eq('scenario_id', scenarioId);

        if (error) throw error;
      } else {
        // Thêm vào favorites
        const { error } = await supabase
          .from('favorite_scenarios')
          .insert({
            user_id: session.user.id,
            scenario_id: scenarioId,
          });

        if (error) throw error;
      }
    } catch (err) {
      // Rollback on error
      console.error('Lỗi khi toggle favorite:', err);
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFavorited) {
          next.add(scenarioId);
        } else {
          next.delete(scenarioId);
        }
        return next;
      });
    }
  }, [session?.user?.id, favorites, supabase]);

  /**
   * Check if a scenario is favorited
   */
  const isFavorite = useCallback((scenarioId: string): boolean => {
    return favorites.has(scenarioId);
  }, [favorites]);

  // Fetch favorites khi user đăng nhập
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    favoriteCount: favorites.size,
  };
}

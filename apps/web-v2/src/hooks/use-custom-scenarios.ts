'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiJson, api } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Interface cho custom scenario
 */
export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho API response
 */
interface CustomScenariosResponse {
  success: boolean;
  scenarios: CustomScenario[];
  count: number;
}

/**
 * useCustomScenarios - Hook quản lý custom scenarios
 *
 * Mục đích: Cung cấp state và functions để CRUD custom scenarios
 * Khi nào sử dụng: Trong TopicPicker và các component cần hiển thị/quản lý custom scenarios
 */
export function useCustomScenarios() {
  const [scenarios, setScenarios] = useState<CustomScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch danh sách custom scenarios
   */
  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiJson<CustomScenariosResponse>('/custom-scenarios');
      setScenarios(response.scenarios);
    } catch (err) {
      console.error('[useCustomScenarios] Lỗi fetch scenarios:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo custom scenario mới
   */
  const createScenario = useCallback(async (name: string, description: string) => {
    try {
      const response = await apiJson<{ success: boolean; scenario: CustomScenario }>(
        '/custom-scenarios',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        }
      );

      setScenarios(prev => [response.scenario, ...prev]);
      toast.success('Đã tạo scenario mới');
      return response.scenario;
    } catch (err) {
      console.error('[useCustomScenarios] Lỗi tạo scenario:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  /**
   * Xóa custom scenario
   */
  const deleteScenario = useCallback(async (id: string) => {
    try {
      await api(`/custom-scenarios/${id}`, { method: 'DELETE' });
      setScenarios(prev => prev.filter(s => s.id !== id));
      toast.success('Đã xóa scenario');
    } catch (err) {
      console.error('[useCustomScenarios] Lỗi xóa scenario:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  /**
   * Toggle favorite
   */
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const response = await apiJson<{ success: boolean; isFavorite: boolean }>(
        `/custom-scenarios/${id}/favorite`,
        { method: 'PATCH' }
      );

      setScenarios(prev =>
        prev.map(s => (s.id === id ? { ...s, isFavorite: response.isFavorite } : s))
      );

      return response;
    } catch (err) {
      console.error('[useCustomScenarios] Lỗi toggle favorite:', err);
      toast.error(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  return {
    scenarios,
    loading,
    error,
    createScenario,
    deleteScenario,
    toggleFavorite,
    refresh: fetchScenarios,
  };
}

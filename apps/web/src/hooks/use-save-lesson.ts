/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';

/**
 * Interface cho việc tạo lesson
 */
export interface CreateLessonPayload {
  type: 'listening' | 'speaking' | 'reading' | 'writing';
  topic: string;
  content: any;
  durationMinutes?: number;
  numSpeakers?: number;
  keywords?: string;
  mode?: 'passive' | 'interactive';
  status?: 'draft' | 'completed';
}

/**
 * useSaveLesson - Hook để lưu bài học vào database
 * 
 * Mục đích: Gọi API POST /lessons để lưu bài học
 * Khi nào sử dụng: Trong các trang listening, speaking, reading, writing
 *                  sau khi user hoàn thành hoặc sinh xong bài
 */
export function useSaveLesson() {
  const [isSaving, setIsSaving] = useState(false);
  // error state removed in favor of toast

  /**
   * Lưu bài học vào database
   * 
   * @param data - Dữ liệu bài học cần lưu
   * @returns Promise<{ success: boolean, lesson?: any }>
   */
  const saveLesson = useCallback(async (data: CreateLessonPayload) => {
    setIsSaving(true);

    try {
      const response = await api('/lessons', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lỗi lưu bài học');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi lưu bài học';
      showError(message);
      console.error('[useSaveLesson] Lỗi:', err);
      // Không throw error để không block UI, chỉ log
      return { success: false, error: message };
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveLesson,
    isSaving,
  };
}

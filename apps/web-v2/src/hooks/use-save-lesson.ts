'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface LessonData {
  type: 'listening' | 'speaking' | 'reading';
  topic: string;
  content: object;
  durationMinutes?: number;
  numSpeakers?: number;
  keywords?: string;
  mode?: string;
  status?: string;
}

export interface UseSaveLessonReturn {
  saveLesson: (data: LessonData) => Promise<void>;
  isSaving: boolean;
}

/**
 * useSaveLesson - Hook để lưu bài học vào database
 */
export function useSaveLesson(): UseSaveLessonReturn {
  const [isSaving, setIsSaving] = useState(false);

  const saveLesson = useCallback(async (data: LessonData) => {
    setIsSaving(true);
    
    try {
      console.log('[useSaveLesson] Đang lưu bài học...', data.type, data.topic);
      
      const response = await api('/lessons', {
        method: 'POST',
        body: JSON.stringify({
          type: data.type,
          topic: data.topic,
          content: data.content,
          durationMinutes: data.durationMinutes,
          numSpeakers: data.numSpeakers,
          keywords: data.keywords,
          mode: data.mode,
          status: data.status || 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu bài học');
      }

      console.log('[useSaveLesson] Đã lưu bài học thành công');
      toast.success('Đã lưu bài học');
    } catch (error) {
      console.error('[useSaveLesson] Lỗi khi lưu:', error);
      toast.error('Không thể lưu bài học');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveLesson,
    isSaving,
  };
}

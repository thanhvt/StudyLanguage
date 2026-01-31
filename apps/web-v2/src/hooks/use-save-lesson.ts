'use client';

import { useCallback, useState } from 'react';
import { api, apiJson } from '@/lib/api';
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

export interface SaveLessonResult {
  lessonId: string;
}

export interface UseSaveLessonReturn {
  saveLesson: (data: LessonData) => Promise<SaveLessonResult | null>;
  updateLessonAudio: (lessonId: string, audioUrl: string, timestamps?: { startTime: number; endTime: number }[]) => Promise<void>;
  isSaving: boolean;
}

/**
 * useSaveLesson - Hook để lưu bài học vào database
 * 
 * Mục đích: Lưu lesson và cập nhật audio URL sau khi sinh
 * Tham số đầu vào: LessonData
 * Tham số đầu ra: SaveLessonResult với lessonId
 * Khi nào sử dụng: Sau khi sinh conversation, và sau khi sinh audio
 */
export function useSaveLesson(): UseSaveLessonReturn {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Lưu lesson mới vào database
   * Trả về lessonId để có thể cập nhật audio sau
   */
  const saveLesson = useCallback(async (data: LessonData): Promise<SaveLessonResult | null> => {
    setIsSaving(true);
    
    try {
      console.log('[useSaveLesson] Đang lưu bài học...', data.type, data.topic);
      
      const response = await apiJson<{ success: boolean; lesson: { id: string } }>('/lessons', {
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

      console.log('[useSaveLesson] Đã lưu bài học thành công, lessonId:', response.lesson.id);
      toast.success('Đã lưu bài học');
      
      return { lessonId: response.lesson.id };
    } catch (error) {
      console.error('[useSaveLesson] Lỗi khi lưu:', error);
      toast.error('Không thể lưu bài học');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Cập nhật audio URL và timestamps cho lesson đã lưu
   * 
   * Mục đích: Lưu audio URL sau khi TTS sinh xong để tái sử dụng
   * Tham số:
   *   - lessonId: ID lesson đã lưu
   *   - audioUrl: URL audio từ storage
   *   - timestamps: Timestamps từng câu
   */
  const updateLessonAudio = useCallback(async (
    lessonId: string, 
    audioUrl: string, 
    timestamps?: { startTime: number; endTime: number }[]
  ) => {
    try {
      console.log('[useSaveLesson] Đang cập nhật audio cho lesson:', lessonId);
      
      await api(`/lessons/${lessonId}/audio`, {
        method: 'PATCH',
        body: JSON.stringify({
          audioUrl,
          audioTimestamps: timestamps,
        }),
      });
      
      console.log('[useSaveLesson] Đã lưu audio URL thành công');
    } catch (error) {
      console.error('[useSaveLesson] Lỗi cập nhật audio:', error);
      // Không throw error vì đây là optional update
    }
  }, []);

  return {
    saveLesson,
    updateLessonAudio,
    isSaving,
  };
}


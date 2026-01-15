'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';

/**
 * Interface cho kết quả từ API
 */
interface RadioPlaylistResult {
  playlist: {
    id: string;
    name: string;
    description: string;
    duration: number;
    trackCount: number;
  };
  items: {
    id: string;
    topic: string;
    conversation: { speaker: string; text: string }[];
    duration: number;
    numSpeakers: number;
    category: string;
    subCategory: string;
    position: number;
  }[];
}

/**
 * useRadioMode - Hook quản lý state cho Radio Mode
 *
 * Mục đích: Gọi API preview và generate, quản lý loading states
 * Trả về:
 *   - duration: Thời lượng được random
 *   - trackCount: Số bài ước tính
 *   - isGenerating: Đang generate playlist
 *   - progress: Tiến độ generate (0-100)
 *   - fetchPreview: Lấy preview (duration random)
 *   - generatePlaylist: Tạo playlist
 *   - rerollDuration: Random lại duration
 * Khi nào sử dụng: Trong RadioModeButton component
 */
export function useRadioMode() {
  const [duration, setDuration] = useState(60);
  const [trackCount, setTrackCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Lấy preview từ API (duration random mới)
   */
  const fetchPreview = useCallback(async () => {
    try {
      const response = await api('/radio/preview');
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin preview');
      }
      const data = await response.json();
      setDuration(data.data.duration);
      setTrackCount(data.data.trackCount);
    } catch (error) {
      // Fallback về giá trị mặc định nếu lỗi
      const durations = [30, 60, 120];
      const randomDuration = durations[Math.floor(Math.random() * durations.length)];
      setDuration(randomDuration);
      setTrackCount(Math.ceil(randomDuration / 7));
    }
  }, []);

  /**
   * Random lại duration (gọi lại fetchPreview)
   */
  const rerollDuration = useCallback(async () => {
    await fetchPreview();
  }, [fetchPreview]);

  /**
   * Generate playlist với duration hiện tại
   */
  const generatePlaylist = useCallback(async (): Promise<RadioPlaylistResult | null> => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Giả lập progress vì API generate tuần tự
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 2000);

      // Tính timeout dựa trên số tracks - mỗi track cần ~120s để generate AI (đề phòng)
      // Minimum 6 phút, maximum 30 phút
      const estimatedTimeout = Math.min(Math.max(trackCount * 120000, 360000), 1800000);
      console.log(`[RadioMode] Timeout = ${estimatedTimeout / 1000}s cho ${trackCount} tracks`);
      
      const response = await api('/radio/generate', {
        method: 'POST',
        body: JSON.stringify({ duration }),
      }, estimatedTimeout);

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể tạo playlist');
      }

      const data = await response.json();
      setProgress(100);

      showSuccess(`Đã tạo playlist "${data.data.playlist.name}" với ${data.data.items.length} bài`);

      return data.data as RadioPlaylistResult;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [duration]);

  return {
    duration,
    trackCount,
    isGenerating,
    progress,
    fetchPreview,
    generatePlaylist,
    rerollDuration,
  };
}

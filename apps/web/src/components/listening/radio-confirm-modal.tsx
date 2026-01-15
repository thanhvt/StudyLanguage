'use client';

import { useState } from 'react';
import { Radio, Shuffle, Play, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

/**
 * RadioConfirmModal - Modal xác nhận trước khi tạo Radio playlist
 *
 * Mục đích: Hiển thị duration được random và cho phép user re-roll hoặc confirm
 * Tham số đầu vào:
 *   - isOpen: boolean - Trạng thái mở/đóng modal
 *   - onClose: () => void - Callback khi đóng modal
 *   - duration: number - Thời lượng (30/60/120 phút)
 *   - trackCount: number - Số bài ước tính
 *   - onConfirm: () => void - Callback khi xác nhận tạo
 *   - onReroll: () => void - Callback khi muốn random lại duration
 *   - isLoading: boolean - Đang generate playlist
 *   - progress?: number - Tiến độ generate (0-100)
 * Khi nào sử dụng: Được gọi từ RadioModeButton khi user click
 */
interface RadioConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  trackCount: number;
  onConfirm: () => void;
  onReroll: () => void;
  isLoading: boolean;
  progress?: number;
}

export function RadioConfirmModal({
  isOpen,
  onClose,
  duration,
  trackCount,
  onConfirm,
  onReroll,
  isLoading,
  progress = 0,
}: RadioConfirmModalProps) {
  // Format thời lượng hiển thị
  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}p` : `${hours} tiếng`;
    }
    return `${mins} phút`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            Radio Mode
          </DialogTitle>
          <DialogDescription>
            Tạo playlist nghe thụ động tự động với chủ đề ngẫu nhiên
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Duration Display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Đã chọn ngẫu nhiên:</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(duration)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ~{trackCount} bài • Chủ đề đa dạng
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tạo playlist... {Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isLoading && (
            <>
              <Button
                variant="outline"
                onClick={onReroll}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Đổi khác
              </Button>
              <Button
                onClick={onConfirm}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Play className="w-4 h-4" />
                Tạo playlist
              </Button>
            </>
          )}
          {isLoading && (
            <Button variant="outline" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

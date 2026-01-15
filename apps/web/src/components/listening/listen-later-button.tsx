'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListenLaterContext } from '@/components/providers/listen-later-provider';
import { ConversationLine } from '@/types/listening-types';

/**
 * ListenLaterButton - Nút thêm vào danh sách Nghe Sau
 * 
 * Mục đích: Cho phép user lưu hội thoại để nghe sau
 * Tham số đầu vào:
 *   - topic: Chủ đề hội thoại
 *   - conversation: Nội dung hội thoại
 *   - duration: Thời lượng
 *   - numSpeakers: Số người nói
 *   - category: Category (it/daily/personal)
 *   - subCategory: SubCategory name
 *   - onSuccess: Callback khi thêm thành công
 *   - variant: 'default' hiển thị text, 'icon' chỉ icon
 * Khi nào sử dụng: Trong Listening page sau khi tạo hội thoại
 */
interface ListenLaterButtonProps {
  topic: string;
  conversation: ConversationLine[];
  duration: number;
  numSpeakers: number;
  category?: string;
  subCategory?: string;
  onSuccess?: () => void;
  variant?: 'default' | 'icon';
  audioUrl?: string; // Audio URL nếu đã có
  audioTimestamps?: { startTime: number; endTime: number }[]; // Timestamps nếu đã có
}

export function ListenLaterButton({
  topic,
  conversation,
  duration,
  numSpeakers,
  category,
  subCategory,
  onSuccess,
  variant = 'default',
  ...props
}: ListenLaterButtonProps) {
  // Dùng context để share state
  const { addToListenLater, isAdding } = useListenLaterContext();
  const [isAdded, setIsAdded] = useState(false);

  /**
   * Xử lý khi click nút
   */
  const handleClick = async () => {
    if (isAdded || isAdding) return;

    const result = await addToListenLater({
      topic,
      conversation,
      duration,
      numSpeakers,
      category,
      subCategory,
      audioUrl: props.audioUrl,
      audioTimestamps: props.audioTimestamps,
    });

    if (result) {
      setIsAdded(true);
      onSuccess?.();
      
      // Reset sau 3 giây
      setTimeout(() => setIsAdded(false), 3000);
    }
  };

  // Icon variant - chỉ icon, hiển thị cả trên mobile và desktop khi cần compact
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isAdding}
        className={`
          relative transition-all duration-300
          ${isAdded ? 'text-primary listen-later-success' : 'hover:text-primary'}
        `}
        title={isAdded ? 'Đã thêm vào Nghe Sau' : 'Nghe Sau'}
      >
        {isAdding ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isAdded ? (
          <BookmarkCheck className="w-5 h-5" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </Button>
    );
  }

  // Default variant - có text, responsive trên cả mobile và web
  return (
    <Button
      variant={isAdded ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={isAdding}
      className={`
        gap-2 transition-all duration-300
        ${isAdded ? 'bg-primary text-primary-foreground listen-later-success' : ''}
      `}
    >
      {isAdding ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang lưu...</span>
        </>
      ) : isAdded ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          <span>Đã lưu!</span>
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          <span>Nghe Sau</span>
        </>
      )}
    </Button>
  );
}

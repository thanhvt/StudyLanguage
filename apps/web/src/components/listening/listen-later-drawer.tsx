'use client';

import { useState } from 'react';
import { X, Play, Trash2, Clock, Users, Loader2, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListenLater } from '@/hooks/use-listen-later';
import { ListenLaterItem } from '@/types/listening-types';

/**
 * ListenLaterDrawer - Drawer hiển thị danh sách Nghe Sau
 * 
 * Mục đích: Hiển thị và quản lý danh sách Nghe Sau
 * Tham số đầu vào:
 *   - isOpen: Trạng thái mở/đóng
 *   - onClose: Callback khi đóng
 *   - onPlay: Callback khi play một item
 * Khi nào sử dụng: Slide-out panel từ sidebar hoặc header
 */
interface ListenLaterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: (item: ListenLaterItem) => void;
}

export function ListenLaterDrawer({ isOpen, onClose, onPlay }: ListenLaterDrawerProps) {
  const { items, count, isLoading, removeFromListenLater, clearAll } = useListenLater();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  /**
   * Xử lý xóa item
   */
  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    await removeFromListenLater(itemId);
    setDeletingId(null);
  };

  /**
   * Xử lý xóa tất cả
   */
  const handleClearAll = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả?')) return;
    setIsClearing(true);
    await clearAll();
    setIsClearing(false);
  };

  /**
   * Format thời gian tạo
   */
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity listen-later-backdrop"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl listen-later-drawer">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold">Nghe Sau</h2>
            {count > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground listen-later-badge">
                {count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-destructive hover:text-destructive"
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookmarkX className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100%-64px)] mobile-scroll">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <BookmarkX className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Chưa có bài nào trong danh sách</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nhấn nút &quot;Nghe Sau&quot; để thêm bài vào đây
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="glass-card glass-card-hover p-4 space-y-3 listen-later-item"
              >
                {/* Topic */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm line-clamp-2">{item.topic}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {item.num_speakers} người
                  </span>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {item.category === 'it' ? '💻 IT' : item.category === 'daily' ? '🌍 Daily' : '👤 Personal'}
                    </span>
                  )}
                </div>

                {/* Time created */}
                <p className="text-xs text-muted-foreground">
                  {formatTime(item.created_at)}
                </p>

                {/* Play button */}
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => onPlay?.(item)}
                >
                  <Play className="w-4 h-4" />
                  Nghe ngay
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/**
 * ListenLaterBadge - Badge hiển thị số lượng trong header/sidebar
 */
interface ListenLaterBadgeProps {
  onClick?: () => void;
}

export function ListenLaterBadge({ onClick }: ListenLaterBadgeProps) {
  const { count } = useListenLater();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
      title="Danh sách Nghe Sau"
    >
      <BookmarkX className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-primary text-primary-foreground listen-later-badge-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  );
}

'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { HistoryEntry, getTypeIcon, formatRelativeTime } from '@/hooks/use-history';

/**
 * Props cho HistoryCard component
 */
interface HistoryCardProps {
  entry: HistoryEntry;
  onPin: (id: string) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onOpen: (entry: HistoryEntry) => void;
}

/**
 * HistoryCard - Component hiển thị một bản ghi lịch sử
 * 
 * Mục đích: Hiển thị thông tin tóm tắt của một bài học đã thực hiện
 * Tham số đầu vào:
 *   - entry: Dữ liệu bản ghi lịch sử
 *   - onPin: Callback khi toggle pin
 *   - onFavorite: Callback khi toggle favorite
 *   - onDelete: Callback khi xóa
 *   - onRestore: Callback khi restore (cho deleted items)
 *   - onOpen: Callback khi mở lại bài học
 * Khi nào sử dụng: Trong HistoryPanel để hiển thị danh sách
 */
export function HistoryCard({
  entry,
  onPin,
  onFavorite,
  onDelete,
  onRestore,
  onOpen,
}: HistoryCardProps) {
  const isDeleted = !!entry.deletedAt;

  /**
   * Tạo mô tả phụ dựa trên loại bài học
   */
  const getSubtitle = () => {
    switch (entry.type) {
      case 'listening':
        return `${entry.durationMinutes || 5} phút • ${entry.numSpeakers || 2} người`;
      case 'speaking':
        return entry.mode === 'interactive' ? 'Interactive Mode' : 'Practice Mode';
      case 'reading':
        return entry.keywords || 'Đọc hiểu';
      default:
        return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        className={`p-4 transition-all duration-200 hover:shadow-lg ${
          isDeleted ? 'opacity-60' : ''
        }`}
        hover="lift"
      >
        {/* Header Row */}
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className="text-2xl flex-shrink-0">
            {getTypeIcon(entry.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title với Pin/Favorite badges */}
            <div className="flex items-center gap-2 mb-1">
              {entry.isPinned && (
                <span className="text-xs" title="Đã ghim">📌</span>
              )}
              {entry.isFavorite && (
                <span className="text-xs" title="Yêu thích">⭐</span>
              )}
              <h3 className="font-semibold truncate flex-1">
                {entry.topic}
              </h3>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground truncate">
              {getSubtitle()}
            </p>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(entry.createdAt)}
              {isDeleted && ' • Đã xóa'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
          {!isDeleted ? (
            <>
              {/* Pin Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onPin(entry.id); }}
                className={`h-8 px-2 ${entry.isPinned ? 'text-amber-500' : ''}`}
                title={entry.isPinned ? 'Bỏ ghim' : 'Ghim'}
              >
                📌
              </Button>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onFavorite(entry.id); }}
                className={`h-8 px-2 ${entry.isFavorite ? 'text-red-500' : ''}`}
                title={entry.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                {entry.isFavorite ? '❤️' : '🤍'}
              </Button>

              {/* Open Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onOpen(entry); }}
                className="h-8 px-2 ml-auto"
                title="Mở lại"
              >
                ▶️ Mở
              </Button>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                className="h-8 px-2 text-destructive hover:text-destructive"
                title="Xóa"
              >
                🗑️
              </Button>
            </>
          ) : (
            <>
              {/* Restore Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onRestore?.(entry.id); }}
                className="h-8"
              >
                ♻️ Khôi phục
              </Button>

              {/* Permanent Delete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                className="h-8 text-destructive hover:text-destructive ml-auto"
                title="Xóa vĩnh viễn"
              >
                🗑️ Xóa hẳn
              </Button>
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

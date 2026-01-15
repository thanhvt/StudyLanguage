/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HistoryPanel } from './history-panel';
import { ListeningDetailView } from './listening-detail-view';
import { HistoryEntry, HistoryFilters, useHistory } from '@/hooks/use-history';

/**
 * Props cho HistoryDrawer
 */
interface HistoryDrawerProps {
  /** Trạng thái mở/đóng */
  isOpen: boolean;
  /** Callback đóng drawer */
  onClose: () => void;
  /** Filter theo loại cố định */
  filterType?: HistoryFilters['type'];
  /** Callback khi mở entry (external handling) */
  onOpenEntry?: (entry: HistoryEntry) => void;
}

/**
 * HistoryDrawer - Drawer slide-in từ phải hiển thị lịch sử
 * 
 * Mục đích: Hiển thị panel lịch sử dạng drawer có thể toggle
 * Tham số đầu vào:
 *   - isOpen: Trạng thái mở
 *   - onClose: Callback đóng
 *   - filterType: Filter cố định theo type
 *   - onOpenEntry: Callback khi chọn entry (nếu muốn xử lý bên ngoài)
 * Khi nào sử dụng: Trigger từ button trong các pages hoặc từ Home
 */
export function HistoryDrawer({
  isOpen,
  onClose,
  filterType,
  onOpenEntry,
}: HistoryDrawerProps) {
  // State quản lý entry đang xem chi tiết
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  
  // Hook để get actions cho detail view
  const { togglePin, toggleFavorite, updateNotes } = useHistory();

  // Đóng drawer khi nhấn Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedEntry) {
          // Nếu đang xem detail, quay lại list
          setSelectedEntry(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, selectedEntry]);

  // Chặn scroll body khi drawer mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset selected entry khi đóng drawer
  useEffect(() => {
    if (!isOpen) {
      setSelectedEntry(null);
    }
  }, [isOpen]);

  /**
   * Xử lý khi chọn entry để xem chi tiết
   */
  const handleOpenEntry = useCallback((entry: HistoryEntry) => {
    // Nếu có external handler, gọi nó
    if (onOpenEntry) {
      onOpenEntry(entry);
      return;
    }

    // Nếu là listening, mở detail view trong drawer
    if (entry.type === 'listening') {
      setSelectedEntry(entry);
    } else {
      // Các loại khác có thể mở modal hoặc navigate
      console.log('[HistoryDrawer] Mở entry loại:', entry.type, entry.id);
    }
  }, [onOpenEntry]);

  /**
   * Quay lại danh sách từ detail view
   */
  const handleBackToList = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              if (selectedEntry) {
                setSelectedEntry(null);
              } else {
                onClose();
              }
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header - Thay đổi title dựa trên state */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {selectedEntry ? (
                  <>🎧 Chi tiết bài nghe</>
                ) : (
                  <>📚 Lịch sử học tập</>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedEntry) {
                    setSelectedEntry(null);
                  } else {
                    onClose();
                  }
                }}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {/* Content - Toggle giữa list và detail */}
            <div className="flex-1 p-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedEntry ? (
                  <ListeningDetailView
                    key="detail"
                    entry={selectedEntry}
                    onBack={handleBackToList}
                    onTogglePin={togglePin}
                    onToggleFavorite={toggleFavorite}
                    onUpdateNotes={updateNotes}
                  />
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <HistoryPanel
                      filterType={filterType}
                      onOpenEntry={handleOpenEntry}
                      height="100%"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * HistoryButton - Button để trigger mở HistoryDrawer
 */
interface HistoryButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function HistoryButton({
  onClick,
  className = '',
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}: HistoryButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      title="Xem lịch sử"
    >
      📚 {showLabel && 'Lịch sử'}
    </Button>
  );
}


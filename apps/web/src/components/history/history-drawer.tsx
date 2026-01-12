'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HistoryPanel } from './history-panel';
import { HistoryEntry, HistoryFilters } from '@/hooks/use-history';

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
  /** Callback khi mở entry */
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
 *   - onOpenEntry: Callback khi chọn entry
 * Khi nào sử dụng: Trigger từ button trong các pages Listening/Speaking/Reading/Writing
 */
export function HistoryDrawer({
  isOpen,
  onClose,
  filterType,
  onOpenEntry,
}: HistoryDrawerProps) {
  // Đóng drawer khi nhấn Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📚 Lịch sử học tập
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden">
              <HistoryPanel
                filterType={filterType}
                onOpenEntry={onOpenEntry}
                height="100%"
              />
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

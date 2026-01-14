'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HistoryCard } from './history-card';
import { useHistory, HistoryEntry, HistoryFilters } from '@/hooks/use-history';

/**
 * Props cho HistoryPanel
 */
interface HistoryPanelProps {
  /** Filter theo loại cố định (optional) */
  filterType?: HistoryFilters['type'];
  /** Callback khi user muốn mở lại một entry */
  onOpenEntry?: (entry: HistoryEntry) => void;
  /** Chiều cao panel */
  height?: string;
}

/**
 * FilterTabs - Component tabs để filter theo type
 */
function FilterTabs({
  activeType,
  onChange,
}: {
  activeType: HistoryFilters['type'];
  onChange: (type: HistoryFilters['type']) => void;
}) {
  const types: { type: HistoryFilters['type']; icon: string; label: string }[] = [
    { type: 'all', icon: '📚', label: 'Tất cả' },
    { type: 'listening', icon: '🎧', label: 'Nghe' },
    { type: 'speaking', icon: '🎤', label: 'Nói' },
    { type: 'reading', icon: '📖', label: 'Đọc' },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {types.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant={activeType === type ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(type)}
          className="h-8 text-xs whitespace-nowrap"
        >
          {icon} {label}
        </Button>
      ))}
    </div>
  );
}

/**
 * StatusTabs - Component tabs để filter theo status
 */
function StatusTabs({
  activeStatus,
  onChange,
}: {
  activeStatus: HistoryFilters['status'];
  onChange: (status: HistoryFilters['status']) => void;
}) {
  const statuses: { status: HistoryFilters['status']; icon: string; label: string }[] = [
    { status: 'all', icon: '🔵', label: 'Tất cả' },
    { status: 'pinned', icon: '📌', label: 'Ghim' },
    { status: 'favorite', icon: '⭐', label: 'Yêu thích' },
    { status: 'deleted', icon: '🗑️', label: 'Đã xóa' },
  ];

  return (
    <div className="flex gap-1 border-t border-border/50 pt-2 mt-1">
      {statuses.map(({ status, icon, label }) => (
        <Button
          key={status}
          variant={activeStatus === status ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange(status)}
          className="h-7 text-xs flex-1"
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}

/**
 * HistoryPanel - Panel chính hiển thị danh sách lịch sử
 * 
 * Mục đích: Hiển thị và quản lý lịch sử học tập với filters, search, pagination
 * Tham số đầu vào:
 *   - filterType: Giới hạn hiển thị theo loại cố định
 *   - onOpenEntry: Callback khi mở entry
 *   - height: Chiều cao tùy chỉnh
 * Khi nào sử dụng: Trong HistoryDrawer hoặc standalone
 */
export function HistoryPanel({ filterType, onOpenEntry, height = '100%' }: HistoryPanelProps) {
  const {
    history,
    loading,
    pagination,
    filters,
    setFilters,
    togglePin,
    toggleFavorite,
    deleteEntry,
    restoreEntry,
    goToPage,
    refresh,
  } = useHistory(filterType ? { type: filterType } : undefined);

  const [searchValue, setSearchValue] = useState('');

  /**
   * Handle search với debounce
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    // Simple debounce - trong production nên dùng useDeferredValue hoặc debounce util
    setTimeout(() => {
      setFilters({ search: value });
    }, 300);
  };

  /**
   * Handle mở entry
   */
  const handleOpenEntry = (entry: HistoryEntry) => {
    if (onOpenEntry) {
      onOpenEntry(entry);
    } else {
      // Default behavior - navigate hoặc log
      console.log('[HistoryPanel] Mở entry:', entry.id);
    }
  };

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Header */}
      <div className="flex-shrink-0 space-y-3 pb-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            🔍
          </span>
          <Input
            placeholder="Tìm kiếm theo chủ đề..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Type Filters - Ẩn nếu đã có filterType cố định */}
        {!filterType && (
          <FilterTabs
            activeType={filters.type || 'all'}
            onChange={(type) => setFilters({ type })}
          />
        )}

        {/* Status Filters */}
        <StatusTabs
          activeStatus={filters.status || 'all'}
          onChange={(status) => setFilters({ status })}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          // Loading state
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-muted-foreground">
              {filters.status === 'deleted'
                ? 'Không có bản ghi nào đã xóa'
                : filters.status === 'pinned'
                ? 'Chưa có bản ghi nào được ghim'
                : filters.status === 'favorite'
                ? 'Chưa có bản ghi yêu thích'
                : 'Chưa có lịch sử học tập'}
            </p>
          </div>
        ) : (
          // List
          <AnimatePresence mode="popLayout">
            {history.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                onPin={togglePin}
                onFavorite={toggleFavorite}
                onDelete={deleteEntry}
                onRestore={restoreEntry}
                onOpen={handleOpenEntry}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-border/50 mt-2">
          <p className="text-xs text-muted-foreground">
            Trang {pagination.page}/{pagination.totalPages} • {pagination.total} bản ghi
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="h-7 px-2"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="h-7 px-2"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

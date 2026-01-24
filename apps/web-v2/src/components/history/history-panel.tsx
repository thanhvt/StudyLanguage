"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HistoryCard } from "./history-card"
import { useHistory, HistoryEntry, HistoryFilters, formatDateGroup } from "@/hooks/use-history"
import { Search, BookOpen, Headphones, Mic, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface HistoryPanelProps {
  filterType?: HistoryFilters['type']
  onOpenEntry?: (entry: HistoryEntry) => void
  height?: string
}

/**
 * FilterPills - Pills để filter theo type
 */
function FilterPills({
  activeType,
  onChange,
}: {
  activeType: HistoryFilters['type']
  onChange: (type: HistoryFilters['type']) => void
}) {
  const types = [
    { type: 'all' as const, icon: Filter, label: 'Tất cả' },
    { type: 'listening' as const, icon: Headphones, label: 'Nghe' },
    { type: 'speaking' as const, icon: Mic, label: 'Nói' },
    { type: 'reading' as const, icon: BookOpen, label: 'Đọc' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {types.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            activeType === type
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}

/**
 * StatusTabs - Tabs để filter theo status
 */
function StatusTabs({
  activeStatus,
  onChange,
}: {
  activeStatus: HistoryFilters['status']
  onChange: (status: HistoryFilters['status']) => void
}) {
  const statuses = [
    { status: 'all' as const, label: 'Tất cả' },
    { status: 'pinned' as const, label: '📌 Ghim' },
    { status: 'favorite' as const, label: '❤️ Yêu thích' },
    { status: 'deleted' as const, label: '🗑️ Đã xóa' },
  ]

  return (
    <div className="flex gap-1 border-t border-border/50 pt-2 mt-1">
      {statuses.map(({ status, label }) => (
        <Button
          key={status}
          variant={activeStatus === status ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange(status)}
          className="h-7 text-xs flex-1"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

/**
 * EmptyState - Illustrated empty state
 */
function EmptyState({ status }: { status: HistoryFilters['status'] }) {
  const messages = {
    deleted: { emoji: '🗑️', text: 'Không có bản ghi nào đã xóa' },
    pinned: { emoji: '📌', text: 'Chưa có bản ghi nào được ghim' },
    favorite: { emoji: '❤️', text: 'Chưa có bản ghi yêu thích' },
    all: { emoji: '📭', text: 'Chưa có lịch sử học tập' },
  }

  const { emoji, text } = messages[status || 'all']

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-4">
        <span className="text-4xl">{emoji}</span>
      </div>
      <p className="text-muted-foreground font-medium">{text}</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Bắt đầu học để tạo lịch sử đầu tiên!
      </p>
    </div>
  )
}

/**
 * HistoryPanel - Panel hiển thị danh sách lịch sử với UI improvements
 * 
 * Features:
 * - Filter pills theo type
 * - Instant search với debounce
 * - Date grouping
 * - Illustrated empty state
 * - Pagination
 */
export function HistoryPanel({ filterType, onOpenEntry, height = "100%" }: HistoryPanelProps) {
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
  } = useHistory(filterType ? { type: filterType } : undefined)

  const [searchValue, setSearchValue] = useState('')

  // Debounced search
  const handleSearch = (value: string) => {
    setSearchValue(value)
    const timeoutId = setTimeout(() => {
      setFilters({ search: value })
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Group entries by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: HistoryEntry[] } = {}
    
    history.forEach(entry => {
      const group = formatDateGroup(entry.createdAt)
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(entry)
    })
    
    return groups
  }, [history])

  const handleOpenEntry = (entry: HistoryEntry) => {
    if (onOpenEntry) {
      onOpenEntry(entry)
    } else {
      console.log('[HistoryPanel] Mở entry:', entry.id)
    }
  }

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Header */}
      <div className="flex-shrink-0 space-y-3 pb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo chủ đề..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Type Filters - Hide if fixed filterType */}
        {!filterType && (
          <FilterPills
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
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {loading ? (
          // Shimmer skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-28 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState status={filters.status} />
        ) : (
          // Grouped list
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedHistory).map(([group, entries]) => (
              <motion.div
                key={group}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {/* Date Group Header */}
                <div className="flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                
                {/* Entries */}
                {entries.map((entry) => (
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
              </motion.div>
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
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  StatsCards, 
  LearningHeatmap, 
  PinnedSection, 
  HistorySearch, 
  WeeklyChart, 
  StudyInsights,
  HistoryCard 
} from "@/components/history"
import { 
  useHistory, 
  useHistoryStats, 
  HistoryEntry, 
  HistoryFilters, 
  formatDateGroup 
} from "@/hooks/use-history"
import { 
  History, 
  Filter, 
  Headphones, 
  Mic, 
  BookOpen, 
  Heart, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = NonNullable<HistoryFilters['type']> | 'favorite'

/**
 * FilterTabs - Enhanced filter với Favorites tab
 */
function FilterTabs({
  activeType,
  onChange,
}: {
  activeType: FilterType
  onChange: (type: FilterType) => void
}) {
  const tabs = [
    { type: 'all' as const, icon: Filter, label: 'Tất cả' },
    { type: 'listening' as const, icon: Headphones, label: 'Nghe' },
    { type: 'speaking' as const, icon: Mic, label: 'Nói' },
    { type: 'reading' as const, icon: BookOpen, label: 'Đọc' },
    { type: 'favorite' as const, icon: Heart, label: 'Yêu thích' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            activeType === type
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

/**
 * EmptyState - Illustrated empty state
 */
function EmptyState({ type }: { type: FilterType }) {
  const messages: Record<FilterType, { emoji: string; text: string; subtext: string }> = {
    all: { emoji: '📭', text: 'Chưa có lịch sử học tập', subtext: 'Bắt đầu học để tạo lịch sử đầu tiên!' },
    listening: { emoji: '🎧', text: 'Chưa có bài nghe nào', subtext: 'Thử luyện nghe để bắt đầu!' },
    speaking: { emoji: '🎤', text: 'Chưa có bài nói nào', subtext: 'Thử luyện nói để bắt đầu!' },
    reading: { emoji: '📖', text: 'Chưa có bài đọc nào', subtext: 'Thử luyện đọc để bắt đầu!' },
    favorite: { emoji: '❤️', text: 'Chưa có bài yêu thích', subtext: 'Đánh dấu yêu thích để xem ở đây!' },
  }

  const { emoji, text, subtext } = messages[type || 'all']

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-4">
        <span className="text-4xl">{emoji}</span>
      </div>
      <p className="text-muted-foreground font-medium">{text}</p>
      <p className="text-sm text-muted-foreground/70 mt-1">{subtext}</p>
    </div>
  )
}

/**
 * History Page - Dashboard layout với 10 tính năng
 */
export default function HistoryPage() {
  const router = useRouter()
  
  // State
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Hooks
  const { stats, loading: statsLoading } = useHistoryStats()
  const {
    history,
    loading: historyLoading,
    pagination,
    filters,
    setFilters,
    togglePin,
    toggleFavorite,
    deleteEntry,
    restoreEntry,
    goToPage,
    refresh,
  } = useHistory()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Update filters when type or search changes
  useEffect(() => {
    if (filterType === 'favorite') {
      setFilters({ type: 'all', status: 'favorite', search: debouncedSearch })
    } else {
      setFilters({ type: filterType, status: 'all', search: debouncedSearch })
    }
  }, [filterType, debouncedSearch, setFilters])

  // Separate pinned entries
  const pinnedEntries = useMemo(() => 
    history.filter(e => e.isPinned && !e.deletedAt),
    [history]
  )

  const regularEntries = useMemo(() => 
    history.filter(e => !e.isPinned || e.deletedAt),
    [history]
  )

  // Group by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: HistoryEntry[] } = {}
    
    regularEntries.forEach(entry => {
      const group = formatDateGroup(entry.createdAt)
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(entry)
    })
    
    return groups
  }, [regularEntries])

  // Handlers
  const handleOpenEntry = useCallback((entry: HistoryEntry) => {
    // Navigate to the appropriate page
    switch (entry.type) {
      case 'listening':
        router.push('/listening')
        break
      case 'speaking':
        router.push('/speaking')
        break
      case 'reading':
        router.push('/reading')
        break
    }
  }, [router])

  const handleReviewTopic = useCallback((topic: string) => {
    setSearchValue(topic)
  }, [])

  const handleDateClick = useCallback((date: string) => {
    // Could implement date filtering here
    console.log('Filter by date:', date)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // R to refresh
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        refresh()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [refresh])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-indigo-500 to-purple-600",
            "shadow-lg shadow-indigo-500/25"
          )}>
            <History className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Lịch sử học tập</h1>
            <p className="text-sm text-muted-foreground">Theo dõi tiến độ & ôn tập</p>
          </div>
        </div>

        <HistorySearch
          value={searchValue}
          onChange={setSearchValue}
          className="w-64 hidden md:block"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-7">
          <StatsCards
            todayCount={stats?.todayCount || 0}
            weekCount={stats?.weekCount || 0}
            streak={stats?.streak || 0}
            loading={statsLoading}
          />
        </div>

        {/* Weekly Chart */}
        <div className="lg:col-span-5">
          <WeeklyChart
            data={stats?.weeklyData || []}
            loading={statsLoading}
          />
        </div>
      </div>

      {/* Second Row: Heatmap & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-8">
          <LearningHeatmap
            data={stats?.heatmapData || []}
            loading={statsLoading}
            onDateClick={handleDateClick}
          />
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-4">
          <StudyInsights
            entries={history}
            weeklyData={stats?.heatmapData}
            onReviewTopic={handleReviewTopic}
          />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden">
        <HistorySearch
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>

      {/* Filter Tabs */}
      <FilterTabs activeType={filterType} onChange={setFilterType} />

      {/* Pinned Section */}
      {filterType !== 'favorite' && pinnedEntries.length > 0 && (
        <PinnedSection
          entries={pinnedEntries}
          onPin={togglePin}
          onFavorite={toggleFavorite}
          onDelete={deleteEntry}
          onOpen={handleOpenEntry}
        />
      )}

      {/* History List */}
      <div className="space-y-6">
        {historyLoading ? (
          // Skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-28 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : regularEntries.length === 0 && pinnedEntries.length === 0 ? (
          <EmptyState type={filterType} />
        ) : (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Trang {pagination.page}/{pagination.totalPages} • {pagination.total} bản ghi
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="gap-1"
            >
              Sau
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-full border hidden md:block">
        <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">/</kbd> Tìm kiếm
        <span className="mx-2">•</span>
        <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">R</kbd> Làm mới
      </div>
    </div>
  )
}

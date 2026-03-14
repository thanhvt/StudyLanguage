import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  SectionList,
  RefreshControl,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '@/components/ui';
import {useHistoryStore} from '@/store/useHistoryStore';
import {historyApi} from '@/services/api/history';
import {HistoryCard} from '@/components/history/HistoryCard';
import {StatsBar} from '@/components/history/StatsBar';
import {FilterPills} from '@/components/history/FilterPills';
import {EmptyState} from '@/components/history/EmptyState';
import {HistoryCardSkeleton} from '@/components/history/HistoryCardSkeleton';
import {PinnedSection} from '@/components/history/PinnedSection';
import {BatchActionBar} from '@/components/history/BatchActionBar';
import {DateRangeSheet} from '@/components/history/DateRangeSheet';
import {QuickActionsSheet} from '@/components/history/QuickActionsSheet';
import {DeleteConfirmDialog} from '@/components/history/DeleteConfirmDialog';
import {AIInsightCard} from '@/components/history/AIInsightCard';
import {WeeklyHeatmap} from '@/components/history/WeeklyHeatmap';
import {ProgressChart} from '@/components/history/ProgressChart';
import {SkillDistribution} from '@/components/history/SkillDistribution';
import {SearchSuggestions} from '@/components/history/SearchSuggestions';
import {RecentLessonsPanel} from '@/components/history/RecentLessonsPanel';
import {ExportShareSheet} from '@/components/history/ExportShareSheet';
import {groupEntriesByDate} from '@/utils/historyHelpers';
import {useDebounce} from '@/hooks/useDebounce';
import {useNavigation} from '@react-navigation/native';
import type {HistoryEntry} from '@/services/api/history';
import {VocabularyTab} from '@/components/history/VocabularyTab';

// Định nghĩa section type cho SectionList
interface HistorySection {
  title: string;
  data: HistoryEntry[];
}

// Labels cho date range filter
const DATE_RANGE_LABELS: Record<string, string> = {
  all: 'Tất cả',
  week: 'Tuần này',
  month: 'Tháng này',
  '3months': '3 tháng',
  custom: 'Tùy chỉnh',
};

/**
 * Mục đích: Màn hình chính của History tab — hiển thị lịch sử học tập
 * Tham số đầu vào: không có (tab screen)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab thứ 2 trong MainTabNavigator
 *
 * Tính năng:
 *   - Filter theo loại bài (Nghe/Nói)
 *   - Search theo topic với recent searches
 *   - Stats bar (streak, today, week)
 *   - Date range filter (Tuần/Tháng/3 tháng/Tùy chỉnh)
 *   - Sort order (Mới nhất ↔ Cũ nhất)
 *   - SectionList grouped theo ngày (Hôm nay, Hôm qua, Tuần này)
 *   - Pinned section — bài đã ghim ở đầu
 *   - Pull-to-refresh + pagination (load more)
 *   - Swipe actions trên card (pin/delete)
 *   - Long press → Quick actions bottom sheet
 *   - Batch selection mode (chọn nhiều → xóa/yêu thích)
 *   - Delete confirmation dialog
 *   - Empty state khi chưa có data
 */
export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // ==========================================
  // Store
  // ==========================================
  const {
    entries,
    loading,
    refreshing,
    loadingMore,
    error,
    filters,
    pagination,
    stats,
    statsLoading,
    searchQuery,
    dateRange,
    sortOrder,
    selectionMode,
    selectedIds,
    setEntries,
    appendEntries,
    removeEntryLocal,
    removeEntriesBatch,
    togglePinLocal,
    toggleFavoriteLocal,
    setLoading,
    setRefreshing,
    setLoadingMore,
    setError,
    setFilters,
    setSearchQuery,
    setDateRange,
    toggleSortOrder,
    setPagination,
    setStats,
    setStatsLoading,
    addRecentSearch,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelectEntry,
    selectAllEntries,
  } = useHistoryStore();

  // ==========================================
  // Local UI state
  // ==========================================
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);
  const searchInputRef = useRef<TextInput>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'vocabulary'>('history');

  // Sheets & Dialogs
  const [showDateRange, setShowDateRange] = useState(false);
  const [quickActionEntry, setQuickActionEntry] = useState<HistoryEntry | null>(null);
  const [exportEntry, setExportEntry] = useState<HistoryEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id?: string;
    title?: string;
    isBatch?: boolean;
    count?: number;
  } | null>(null);

  // ==========================================
  // Fetch data
  // ==========================================

  /**
   * Mục đích: Tải danh sách lịch sử từ API
   * Tham số đầu vào: page — trang cần tải (mặc định 1)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mount, filter change, pull-to-refresh
   */
  const fetchHistory = useCallback(
    async (page = 1) => {
      if (page === 1) {
        setLoading(true);
      }
      setError(null);

      try {
        console.log('📜 [HistoryScreen] Đang tải lịch sử trang', page);
        const response = await historyApi.getHistory({
          ...filters,
          page,
        });

        if (page === 1) {
          setEntries(response.entries);
        } else {
          appendEntries(response.entries);
        }
        setPagination(response.pagination);

        console.log(
          `✅ [HistoryScreen] Đã tải ${response.entries.length} entries (trang ${page}/${response.pagination.totalPages})`,
        );
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || 'Lỗi tải lịch sử';
        console.error('❌ [HistoryScreen] Lỗi:', message);
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [
      filters,
      setLoading,
      setError,
      setEntries,
      appendEntries,
      setPagination,
      setRefreshing,
      setLoadingMore,
    ],
  );

  /**
   * Mục đích: Tải thống kê lịch sử từ API
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mount + pull-to-refresh
   */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await historyApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('❌ [HistoryScreen] Lỗi tải stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [setStats, setStatsLoading]);

  // Tải data khi mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload khi filter thay đổi
  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Debounced search
  useEffect(() => {
    setSearchQuery(debouncedSearch);
    // Lưu vào recent searches khi user gõ xong
    if (debouncedSearch.trim().length >= 2) {
      addRecentSearch(debouncedSearch.trim());
    }
  }, [debouncedSearch, setSearchQuery, addRecentSearch]);

  // ==========================================
  // Handlers
  // ==========================================

  /**
   * Mục đích: Xử lý pull-to-refresh
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User kéo list xuống để refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(1);
    fetchStats();
  }, [fetchHistory, fetchStats, setRefreshing]);

  /**
   * Mục đích: Xử lý load more (pagination)
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User scroll tới cuối list
   */
  const handleLoadMore = useCallback(() => {
    if (loadingMore || pagination.page >= pagination.totalPages) {
      return;
    }
    setLoadingMore(true);
    fetchHistory(pagination.page + 1);
  }, [loadingMore, pagination, fetchHistory, setLoadingMore]);

  /**
   * Mục đích: Xử lý filter type thay đổi
   * Tham số đầu vào: type — loại bài học mới
   * Tham số đầu ra: void
   * Khi nào sử dụng: FilterPills → tap pill
   */
  const handleFilterChange = useCallback(
    (type: 'all' | 'listening' | 'speaking') => {
      setFilters({type});
    },
    [setFilters],
  );

  /**
   * Mục đích: Xử lý xóa entry — hiển thị confirm dialog trước
   * Tham số đầu vào: id — ID entry cần xóa
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard swipe left → delete / QuickActions → Delete
   */
  const handleDeleteRequest = useCallback(
    (id: string) => {
      const entry = entries.find(e => e.id === id);
      setDeleteTarget({
        id,
        title: entry?.topic || 'bản ghi này',
        isBatch: false,
        count: 1,
      });
    },
    [entries],
  );

  /**
   * Mục đích: Xử lý xóa hàng loạt — hiển thị confirm dialog
   * Tham số đầu vào: không có (dùng selectedIds từ store)
   * Tham số đầu ra: void
   * Khi nào sử dụng: BatchActionBar → Delete
   */
  const handleBatchDeleteRequest = useCallback(() => {
    setDeleteTarget({
      isBatch: true,
      count: selectedIds.length,
    });
  }, [selectedIds]);

  /**
   * Mục đích: Thực hiện xóa sau khi user confirm
   * Tham số đầu vào: không có (dùng deleteTarget)
   * Tham số đầu ra: void
   * Khi nào sử dụng: DeleteConfirmDialog → Confirm
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    if (deleteTarget.isBatch) {
      // Batch delete
      const idsToDelete = [...selectedIds];
      removeEntriesBatch(idsToDelete);

      // API calls (fire and forget, đã optimistic update)
      for (const id of idsToDelete) {
        historyApi.deleteEntry(id).catch(err => {
          console.error('❌ [HistoryScreen] Lỗi xóa batch:', err);
        });
      }
      console.log(`✅ [HistoryScreen] Đã xóa ${idsToDelete.length} entries`);
    } else if (deleteTarget.id) {
      // Single delete
      removeEntryLocal(deleteTarget.id);
      try {
        await historyApi.deleteEntry(deleteTarget.id);
        console.log('✅ [HistoryScreen] Đã xóa entry:', deleteTarget.id);
      } catch (err) {
        console.error('❌ [HistoryScreen] Lỗi xóa:', err);
        fetchHistory(1);
      }
    }

    setDeleteTarget(null);
  }, [deleteTarget, selectedIds, removeEntriesBatch, removeEntryLocal, fetchHistory]);

  /**
   * Mục đích: Xử lý pin entry (optimistic + API call)
   * Tham số đầu vào: id — ID entry cần pin
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard swipe right → pin / QuickActions → Pin
   */
  const handlePin = useCallback(
    async (id: string) => {
      togglePinLocal(id);
      try {
        await historyApi.togglePin(id);
        console.log('✅ [HistoryScreen] Đã toggle pin:', id);
      } catch (err) {
        console.error('❌ [HistoryScreen] Lỗi pin:', err);
        togglePinLocal(id);
      }
    },
    [togglePinLocal],
  );

  /**
   * Mục đích: Xử lý favorite entry (optimistic + API call)
   * Tham số đầu vào: id — ID entry
   * Tham số đầu ra: void
   * Khi nào sử dụng: QuickActions → Favorite
   */
  const handleFavorite = useCallback(
    async (id: string) => {
      toggleFavoriteLocal(id);
      try {
        await historyApi.toggleFavorite(id);
        console.log('✅ [HistoryScreen] Đã toggle favorite:', id);
      } catch (err) {
        console.error('❌ [HistoryScreen] Lỗi favorite:', err);
        toggleFavoriteLocal(id);
      }
    },
    [toggleFavoriteLocal],
  );

  /**
   * Mục đích: Xử lý tap vào card (navigate tới detail)
   * Tham số đầu vào: entry — HistoryEntry
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard tap (khi không ở selection mode)
   */
  const handlePress = useCallback((entry: HistoryEntry) => {
    // Navigate tới HistoryDetail screen với entryId
    (navigation as any).navigate('HistoryDetail', {entryId: entry.id});
    console.log('📜 [HistoryScreen] Navigate to detail:', entry.id);
  }, []);

  /**
   * Mục đích: Xử lý long press — vào selection mode hoặc show quick actions
   * Tham số đầu vào: entry — HistoryEntry
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard long press (500ms)
   */
  const handleLongPress = useCallback(
    (entry: HistoryEntry) => {
      if (selectionMode) {
        // Đã ở selection mode → toggle select
        toggleSelectEntry(entry.id);
      } else {
        // Hiển thị quick actions sheet
        setQuickActionEntry(entry);
      }
    },
    [selectionMode, toggleSelectEntry],
  );

  /**
   * Mục đích: Xử lý batch favorite
   * Tham số đầu vào: không có (dùng selectedIds)
   * Tham số đầu ra: void
   * Khi nào sử dụng: BatchActionBar → Favorite
   */
  const handleBatchFavorite = useCallback(async () => {
    const idsToFav = [...selectedIds];
    // Optimistic: toggle tất cả
    for (const id of idsToFav) {
      toggleFavoriteLocal(id);
    }
    exitSelectionMode();

    // API calls
    for (const id of idsToFav) {
      historyApi.toggleFavorite(id).catch(err => {
        console.error('❌ [HistoryScreen] Lỗi batch favorite:', err);
      });
    }
    console.log(`✅ [HistoryScreen] Đã favorite ${idsToFav.length} entries`);
  }, [selectedIds, toggleFavoriteLocal, exitSelectionMode]);

  // ==========================================
  // Sorted + Filtered entries
  // ==========================================

  // Lọc entries chưa ghim cho SectionList (pinned hiển thị riêng)
  const unpinnedEntries = entries.filter(e => !e.isPinned);

  // Sắp xếp theo sortOrder
  const sortedEntries =
    sortOrder === 'oldest'
      ? [...unpinnedEntries].reverse()
      : unpinnedEntries;

  // Sections data (grouped by date)
  const sections = groupEntriesByDate(sortedEntries);

  // ==========================================
  // Render functions
  // ==========================================

  /**
   * Mục đích: Render section header (Hôm nay, Hôm qua, Tuần này...)
   * Tham số đầu vào: section title
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: SectionList renderSectionHeader
   */
  const renderSectionHeader = useCallback(
    ({section}: {section: HistorySection}) => (
      <View className="px-4 py-2 bg-background">
        <AppText className="text-neutrals400 font-sans-semibold text-xs uppercase tracking-wider">
          ─── {section.title} ───
        </AppText>
      </View>
    ),
    [],
  );

  /**
   * Mục đích: Render từng HistoryCard trong list
   * Tham số đầu vào: item — HistoryEntry
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: SectionList renderItem
   */
  const renderItem = useCallback(
    ({item}: {item: HistoryEntry}) => (
      <HistoryCard
        entry={item}
        onPress={handlePress}
        onDelete={handleDeleteRequest}
        onPin={handlePin}
        onLongPress={handleLongPress}
        selectionMode={selectionMode}
        isSelected={selectedIds.includes(item.id)}
        onToggleSelect={toggleSelectEntry}
      />
    ),
    [handlePress, handleDeleteRequest, handlePin, handleLongPress, selectionMode, selectedIds, toggleSelectEntry],
  );

  /**
   * Mục đích: Render footer (loading more indicator)
   * Tham số đầu vào: không có
   * Tham số đầu ra: JSX.Element | null
   * Khi nào sử dụng: SectionList ListFooterComponent
   */
  const renderFooter = useCallback(() => {
    if (!loadingMore) {
      return <View style={{height: 80}} />;
    }
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" />
        <AppText className="text-neutrals400 text-xs mt-1">
          Đang tải thêm...
        </AppText>
      </View>
    );
  }, [loadingMore]);

  /**
   * Mục đích: Render header cho SectionList (Stats + Filters + Pinned)
   * Tham số đầu vào: không có
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: SectionList ListHeaderComponent
   */
  const renderListHeader = useCallback(
    () => (
      <>
        {/* Stats Bar */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Filter Pills */}
        <FilterPills
          activeType={filters.type || 'all'}
          onChange={handleFilterChange}
        />

        {/* Date Range + Sort Row */}
        <View className="flex-row items-center gap-2 mx-4 mb-4">
          {/* Date Range Chip */}
          <Pressable
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-neutrals900 border border-border active:scale-[0.95]"
            onPress={() => setShowDateRange(true)}>
            <AppText className="text-sm">📅</AppText>
            <AppText className="text-sm text-foreground font-sans-medium">
              {DATE_RANGE_LABELS[dateRange]}
            </AppText>
            <AppText className="text-neutrals400 text-xs">▼</AppText>
          </Pressable>

          {/* Sort Toggle */}
          <Pressable
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-neutrals900 border border-border active:scale-[0.95]"
            onPress={toggleSortOrder}>
            <AppText className="text-sm">↕</AppText>
            <AppText className="text-sm text-foreground font-sans-medium">
              {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
            </AppText>
          </Pressable>
        </View>

        {/* AI Insight Card */}
        <AIInsightCard />

        {/* Recent Lessons Panel (horizontal scroll) */}
        <RecentLessonsPanel
          entries={entries}
          onPress={handlePress}
        />

        {/* Analytics Section — collapsed by default */}
        <WeeklyHeatmap />
        <ProgressChart />
        <SkillDistribution
          listening={entries.filter(e => e.type === 'listening').length}
          speaking={entries.filter(e => e.type === 'speaking').length}
        />

        {/* Pinned Section */}
        <PinnedSection
          entries={entries}
          onPress={handlePress}
          onDelete={handleDeleteRequest}
          onPin={handlePin}
          onLongPress={handleLongPress}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectEntry}
        />
      </>
    ),
    [
      stats, statsLoading, filters.type, handleFilterChange,
      dateRange, sortOrder, toggleSortOrder, entries,
      handlePress, handleDeleteRequest, handlePin, handleLongPress,
      selectionMode, selectedIds, toggleSelectEntry,
    ],
  );

  // ==========================================
  // Main render
  // ==========================================

  return (
    <View className="flex-1 bg-background" style={{paddingTop: insets.top}}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        {selectionMode ? (
          // Selection mode header
          <>
            <AppText className="text-foreground font-sans-bold text-lg">
              ✓ {selectedIds.length} đã chọn
            </AppText>
            <Pressable
              className="px-3 py-1.5 rounded-lg active:scale-95"
              onPress={exitSelectionMode}>
              <AppText className="text-primary font-sans-medium">Hủy</AppText>
            </Pressable>
          </>
        ) : (
          // Normal header
          <>
            <AppText className="text-foreground font-sans-bold text-2xl">
              📜 Lịch sử
            </AppText>
            <View className="flex-row gap-2">
              {/* Search button */}
              <Pressable
                className="w-10 h-10 rounded-full bg-surface-raised border border-border items-center justify-center active:scale-95"
                onPress={() => {
                  setShowSearch(!showSearch);
                  if (!showSearch) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  } else {
                    setSearchText('');
                  }
                }}>
                <AppText className="text-lg">{showSearch ? '✕' : '🔍'}</AppText>
              </Pressable>

              {/* Batch select button */}
              <Pressable
                className="w-10 h-10 rounded-full bg-surface-raised border border-border items-center justify-center active:scale-95"
                onPress={enterSelectionMode}>
                <AppText className="text-lg">☑</AppText>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Tab switcher */}
      <View className="flex-row mx-4 mb-3 bg-neutrals900 rounded-xl p-1">
        <Pressable
          className={`flex-1 rounded-lg py-2 items-center ${activeTab === 'history' ? 'bg-primary/20' : ''}`}
          onPress={() => setActiveTab('history')}>
          <AppText
            className={`text-sm font-sans-semibold ${
              activeTab === 'history' ? 'text-primary' : 'text-neutrals400'
            }`}>
            📜 Lịch sử
          </AppText>
        </Pressable>
        <Pressable
          className={`flex-1 rounded-lg py-2 items-center ${activeTab === 'vocabulary' ? 'bg-primary/20' : ''}`}
          onPress={() => setActiveTab('vocabulary')}>
          <AppText
            className={`text-sm font-sans-semibold ${
              activeTab === 'vocabulary' ? 'text-primary' : 'text-neutrals400'
            }`}>
            📚 Từ vựng
          </AppText>
        </Pressable>
      </View>

      {/* Tab content */}
      {activeTab === 'vocabulary' ? (
        <VocabularyTab />
      ) : (
        <>
          {/* Search Bar */}
          {showSearch && (
            <View className="mx-4 mb-3">
              <TextInput
                ref={searchInputRef}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Tìm theo chủ đề..."
                placeholderTextColor="#5e5e5e"
                className="bg-neutrals900 border border-border rounded-2xl px-4 py-3 text-foreground font-sans"
                autoFocus
              />
            </View>
          )}

          {/* Search Suggestions — khi search active và chưa gõ gì */}
          <SearchSuggestions
            visible={showSearch && searchText.length === 0}
            onSelectSuggestion={(query) => setSearchText(query)}
          />

          {/* Error */}
          {error && (
            <View className="mx-4 mb-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
              <AppText className="text-red-400 text-sm text-center">
                ❌ {error}
              </AppText>
              <Pressable
                className="mt-2 items-center"
                onPress={() => fetchHistory(1)}>
                <AppText className="text-primary text-sm font-sans-medium">
                  🔄 Thử lại
                </AppText>
              </Pressable>
            </View>
          )}

          {/* Content */}
          {loading && entries.length === 0 ? (
            <HistoryCardSkeleton count={4} />
          ) : entries.length === 0 ? (
            <EmptyState
              filterType={
                filters.type !== 'all' ? filters.type : undefined
              }
            />
          ) : (
            <SectionList<HistoryEntry, HistorySection>
              sections={sections}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              ListHeaderComponent={renderListHeader}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#4ade80"
                />
              }
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Batch Action Bar */}
          {selectionMode && (
            <BatchActionBar
              selectedCount={selectedIds.length}
              onDelete={handleBatchDeleteRequest}
              onFavorite={handleBatchFavorite}
              onSelectAll={selectAllEntries}
              onCancel={exitSelectionMode}
            />
          )}
        </>
      )}

      {/* Bottom Sheets & Dialogs */}
      <DateRangeSheet
        visible={showDateRange}
        activeRange={dateRange}
        onSelect={setDateRange}
        onClose={() => setShowDateRange(false)}
      />

      <QuickActionsSheet
        visible={quickActionEntry !== null}
        entry={quickActionEntry}
        onPin={handlePin}
        onFavorite={handleFavorite}
        onDelete={handleDeleteRequest}
        onShare={(entry) => {
          setQuickActionEntry(null);
          setTimeout(() => setExportEntry(entry), 300);
        }}
        onClose={() => setQuickActionEntry(null)}
      />

      <ExportShareSheet
        visible={exportEntry !== null}
        entry={exportEntry}
        onClose={() => setExportEntry(null)}
      />

      <DeleteConfirmDialog
        visible={deleteTarget !== null}
        title={deleteTarget?.title}
        count={deleteTarget?.count}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

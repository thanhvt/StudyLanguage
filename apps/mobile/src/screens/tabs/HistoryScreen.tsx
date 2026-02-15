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
import {groupEntriesByDate} from '@/utils/historyHelpers';
import {useDebounce} from '@/hooks/useDebounce';
import type {HistoryEntry} from '@/services/api/history';
import {VocabularyTab} from '@/components/history/VocabularyTab';

// Định nghĩa section type cho SectionList
interface HistorySection {
  title: string;
  data: HistoryEntry[];
}

/**
 * Mục đích: Màn hình chính của History tab — hiển thị lịch sử học tập
 * Tham số đầu vào: không có (tab screen)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab thứ 2 trong MainTabNavigator
 *
 * Tính năng:
 *   - Filter theo loại bài (Nghe/Nói/Đọc)
 *   - Search theo topic
 *   - Stats bar (streak, today, week)
 *   - SectionList grouped theo ngày (Hôm nay, Hôm qua, Tuần này)
 *   - Pull-to-refresh + pagination (load more)
 *   - Swipe actions trên card (pin/delete)
 *   - Empty state khi chưa có data
 */
export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  // Store
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
    setEntries,
    appendEntries,
    removeEntryLocal,
    togglePinLocal,
    setLoading,
    setRefreshing,
    setLoadingMore,
    setError,
    setFilters,
    setSearchQuery,
    setPagination,
    setStats,
    setStatsLoading,
  } = useHistoryStore();

  // Search UI state
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);
  const searchInputRef = useRef<TextInput>(null);

  // Tab state: lịch sử hoặc từ vựng
  const [activeTab, setActiveTab] = useState<'history' | 'vocabulary'>('history');

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
  }, [debouncedSearch, setSearchQuery]);

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
    (type: 'all' | 'listening' | 'speaking' | 'reading') => {
      setFilters({type});
    },
    [setFilters],
  );

  /**
   * Mục đích: Xử lý xóa entry (optimistic + API call)
   * Tham số đầu vào: id — ID entry cần xóa
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard swipe left → delete
   */
  const handleDelete = useCallback(
    async (id: string) => {
      // Optimistic update — xóa local trước
      removeEntryLocal(id);

      try {
        await historyApi.deleteEntry(id);
        console.log('✅ [HistoryScreen] Đã xóa entry:', id);
      } catch (err) {
        console.error('❌ [HistoryScreen] Lỗi xóa:', err);
        // Nếu lỗi → reload lại data
        fetchHistory(1);
      }
    },
    [removeEntryLocal, fetchHistory],
  );

  /**
   * Mục đích: Xử lý pin entry (optimistic + API call)
   * Tham số đầu vào: id — ID entry cần pin
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard swipe right → pin
   */
  const handlePin = useCallback(
    async (id: string) => {
      // Optimistic update
      togglePinLocal(id);

      try {
        await historyApi.togglePin(id);
        console.log('✅ [HistoryScreen] Đã toggle pin:', id);
      } catch (err) {
        console.error('❌ [HistoryScreen] Lỗi pin:', err);
        // Revert — toggle lại
        togglePinLocal(id);
      }
    },
    [togglePinLocal],
  );

  /**
   * Mục đích: Xử lý tap vào card (navigate tới detail)
   * Tham số đầu vào: entry — HistoryEntry
   * Tham số đầu ra: void
   * Khi nào sử dụng: HistoryCard tap
   */
  const handlePress = useCallback((_entry: HistoryEntry) => {
    // TODO: Navigate tới session detail screen (Sprint 2)
    console.log('📜 [HistoryScreen] Tap entry:', _entry.id);
  }, []);

  // ==========================================
  // Sections data (grouped by date)
  // ==========================================
  const sections = groupEntriesByDate(entries);

  // ==========================================
  // Render
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
        onDelete={handleDelete}
        onPin={handlePin}
      />
    ),
    [handlePress, handleDelete, handlePin],
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

  return (
    <View className="flex-1 bg-background" style={{paddingTop: insets.top}}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <AppText className="text-foreground font-sans-bold text-2xl">
          📜 Lịch sử
        </AppText>
        <Pressable
          className="w-10 h-10 rounded-full bg-card border border-border/30 items-center justify-center active:scale-95"
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
      {/* Search Bar (animated) */}
      {showSearch && (
        <View className="mx-4 mb-3">
          <TextInput
            ref={searchInputRef}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm theo chủ đề..."
            placeholderTextColor="#9CA3AF"
            className="bg-card border border-border/30 rounded-xl px-4 py-3 text-foreground font-sans"
            autoFocus
          />
        </View>
      )}

      {/* Filter Pills */}
      <FilterPills
        activeType={filters.type || 'all'}
        onChange={handleFilterChange}
      />

      {/* Stats Bar */}
      <StatsBar stats={stats} loading={statsLoading} />

      {/* Error */}
      {error && (
        <View className="mx-4 mb-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AppText className="text-red-500 text-sm text-center">
            ❌ {error}
          </AppText>
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
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6366F1"
            />
          }
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
        </>
      )}
    </View>
  );
}

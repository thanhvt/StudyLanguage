import React, {useState, useCallback} from 'react';
import {
  View,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {speakingApi} from '@/services/api/speaking';

// ============================================
// TYPES & CONSTANTS
// ============================================

interface RecordingEntry {
  id: string;
  sentence: string;
  score: number;
  pronunciation: number;
  fluency: number;
  pace: number;
  duration: number;
  date: string;
  mode: string;
  audioUrl: string | null;
  topic: string | null;
}

interface SectionData {
  title: string;
  data: RecordingEntry[];
}

/** Filter tabs — 5 mode filter */
const FILTER_TABS = [
  {id: 'all', label: 'Tất cả', emoji: '📋'},
  {id: 'practice', label: 'Luyện nói', emoji: '🎙️'},
  {id: 'conversation', label: 'Hội thoại', emoji: '💬'},
  {id: 'shadowing', label: 'Shadowing', emoji: '🎧'},
  {id: 'tongue-twister', label: 'Tongue Tw.', emoji: '👅'},
];

/** Emoji theo mode */
const MODE_EMOJI: Record<string, string> = {
  practice: '🎙️',
  conversation: '💬',
  shadowing: '🎧',
  'tongue-twister': '👅',
};

/** Màu viền trái theo mode (mockup) */
const MODE_BORDER_COLOR: Record<string, string> = {
  practice: '#22C55E',
  conversation: '#F59E0B',
  shadowing: '#3B82F6',
  'tongue-twister': '#EC4899',
};

/** Màu score badge */
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#22C55E';
  if (score >= 70) return '#F59E0B';
  if (score >= 50) return '#F97316';
  return '#EF4444';
};

// ============================================
// MAIN SCREEN
// ============================================

/**
 * Mục đích: Màn hình lịch sử ghi âm Speaking (grouped by date, filter by mode)
 * Tham số đầu vào: navigation (từ SpeakingStack)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Speaking Home → tap "Lịch sử" → navigate RecordingHistory
 */
export default function RecordingHistoryScreen({navigation}: any) {
  const colors = useColors();
  const haptic = useHaptic();

  // State
  const [entries, setEntries] = useState<RecordingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Playing audio state
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Pagination race condition guard
  const loadingFilterRef = React.useRef(activeFilter);

  /**
   * Mục đích: Load recordings từ API
   * Tham số đầu vào: pageNum, resetData flag
   * Tham số đầu ra: void
   * Khi nào sử dụng: Screen mount, filter change, pull refresh, load more
   */
  const loadRecordings = useCallback(async (
    filterMode: string = 'all',
    pageNum: number = 1,
    resetData: boolean = true,
  ) => {
    try {
      if (resetData) {
        if (pageNum === 1) setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await speakingApi.getRecordingHistory(
        filterMode === 'all' ? undefined : filterMode,
        pageNum,
        20,
      );

      // Guard: bỏ qua kết quả nếu filter đã thay đổi (race condition)
      if (loadingFilterRef.current !== filterMode) {
        console.log('⚠️ [History] Bỏ qua kết quả cũ (filter đã đổi)');
        return;
      }

      if (resetData) {
        setEntries(result.entries ?? []);
      } else {
        setEntries(prev => [...prev, ...(result.entries ?? [])]);
      }
      setHasMore(result.hasMore ?? false);
      setPage(pageNum);
      console.log(`✅ [History] Tải ${result.entries?.length ?? 0} entries`);
    } catch (err) {
      console.error('❌ [History] Lỗi tải recordings:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Load khi screen focus
  useFocusEffect(
    useCallback(() => {
      loadRecordings(activeFilter, 1, true);
    }, [activeFilter, loadRecordings]),
  );

  /**
   * Mục đích: Xử lý đổi filter tab
   * Tham số đầu vào: filterId
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap filter tab ở bottom
   */
  const handleFilterChange = (filterId: string) => {
    haptic.light();
    loadingFilterRef.current = filterId;
    setActiveFilter(filterId);
    setPage(1);
    setIsCompareMode(false);
    setSelectedForCompare([]);
    loadRecordings(filterId, 1, true);
  };

  /**
   * Mục đích: Xử lý tap entry — phát audio hoặc chọn so sánh
   * Tham số đầu vào: entry (RecordingEntry)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap 1 recording entry
   */
  const handleEntryPress = (entry: RecordingEntry) => {
    haptic.light();

    if (isCompareMode) {
      // Chọn/bỏ chọn để so sánh — chỉ cho phép cùng mode
      setSelectedForCompare(prev => {
        if (prev.includes(entry.id)) {
          return prev.filter(id => id !== entry.id);
        }
        if (prev.length >= 2) return prev; // Tối đa 2

        // Edge: validate cùng mode với entry đã chọn
        if (prev.length === 1) {
          const firstEntry = entries.find(e => e.id === prev[0]);
          if (firstEntry && firstEntry.mode !== entry.mode) {
            console.log('⚠️ [History] Không thể so sánh khác mode');
            return prev; // Không cho chọn khác mode
          }
        }
        return [...prev, entry.id];
      });
      return;
    }

    // Phát audio entry
    if (entry.audioUrl) {
      setPlayingId(playingId === entry.id ? null : entry.id);
      console.log('🔊 [History] Phát audio:', entry.id);
      // TODO: Tích hợp react-native-audio-recorder-player
    } else {
      // Edge: Audio đã bị xóa
      console.log('⚠️ [History] Không có audio cho entry:', entry.id);
    }
  };

  /**
   * Mục đích: Group entries theo ngày → SectionList format
   * Tham số đầu vào: entries[]
   * Tham số đầu ra: SectionData[]
   * Khi nào sử dụng: Render SectionList với date headers
   */
  const groupByDate = (data: RecordingEntry[]): SectionData[] => {
    const groups: Record<string, RecordingEntry[]> = {};
    data.forEach(entry => {
      const dateKey = entry.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });

    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0])) // Mới nhất lên đầu
      .map(([date, items]) => ({
        title: formatDateHeader(date),
        data: items,
      }));
  };

  const sections = groupByDate(entries);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color="#22C55E" />
        <AppText variant="body" style={{color: colors.neutrals400, marginTop: 12}}>
          Đang tải lịch sử...
        </AppText>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View>
          <AppText variant="heading2" weight="bold">
            Lịch sử ghi âm
          </AppText>
          <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 2}}>
            {entries.length} bản ghi
          </AppText>
        </View>
        {/* B5: Filter icon */}
        <TouchableOpacity
          onPress={() => {
            haptic.light();
            // TODO: Mở filter bottom sheet nâng cao
            console.log('🔽 [History] Open filter sheet');
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AppText variant="body">🔽</AppText>
        </TouchableOpacity>
      </View>

      {/* SectionList */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              loadRecordings(activeFilter, 1, true);
            }}
            tintColor="#22C55E"
          />
        }
        renderSectionHeader={({section}) => (
          <View style={{
            paddingVertical: 10,
            backgroundColor: colors.background,
          }}>
            <AppText variant="caption" weight="semibold" style={{color: colors.neutrals400}}>
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({item}) => (
          <RecordingEntryCard
            entry={item}
            isPlaying={playingId === item.id}
            isCompareMode={isCompareMode}
            isSelectedForCompare={selectedForCompare.includes(item.id)}
            onPress={() => handleEntryPress(item)}
            colors={colors}
          />
        )}
        ListEmptyComponent={
          <View style={{alignItems: 'center', paddingVertical: 60}}>
            <AppText variant="heading2">📭</AppText>
            <AppText variant="body" style={{color: colors.neutrals400, marginTop: 8}}>
              Chưa có bản ghi nào
            </AppText>
            <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 4}}>
              Hãy luyện nói để bắt đầu!
            </AppText>
          </View>
        }
        onEndReached={() => {
          if (hasMore && !isLoadingMore) {
            loadRecordings(activeFilter, page + 1, false);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? (
          <ActivityIndicator size="small" color="#22C55E" style={{paddingVertical: 20}} />
        ) : null}
      />

      {/* Filter Tabs Bottom Bar */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        borderTopWidth: 0.5,
        borderTopColor: colors.neutrals400 + '30',
        paddingBottom: 30,
        paddingTop: 10,
        paddingHorizontal: 10,
      }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleFilterChange(tab.id)}
              style={{
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: activeFilter === tab.id ? '#22C55E15' : 'transparent',
              }}>
              <AppText variant="body">{tab.emoji}</AppText>
              <AppText
                variant="caption"
                weight={activeFilter === tab.id ? 'bold' : 'regular'}
                style={{
                  color: activeFilter === tab.id ? '#22C55E' : colors.neutrals400,
                  fontSize: 10,
                  marginTop: 2,
                }}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Compare FAB */}
      <TouchableOpacity
        onPress={() => {
          haptic.medium();
          if (isCompareMode) {
            // Thực hiện so sánh nếu đã chọn 2
            if (selectedForCompare.length === 2) {
              const compareEntries = entries.filter(e => selectedForCompare.includes(e.id));
              console.log('🔄 [History] So sánh 2 bản ghi:', selectedForCompare);
              // TODO: Navigate tới CompareScreen
            }
            setIsCompareMode(false);
            setSelectedForCompare([]);
          } else {
            setIsCompareMode(true);
          }
        }}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 90,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 24,
          backgroundColor: isCompareMode ? '#EF4444' : '#22C55E',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}>
        <AppText variant="body" style={{color: '#FFF'}}>
          {isCompareMode
            ? (selectedForCompare.length === 2 ? '✅' : '❌')
            : '🔄'
          }
        </AppText>
        <AppText variant="caption" weight="bold" style={{color: '#FFF'}}>
          {isCompareMode
            ? (selectedForCompare.length === 2 ? 'So sánh' : `Huỷ (${selectedForCompare.length}/2)`)
            : 'So sánh'
          }
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// RecordingEntryCard
// ============================================

interface RecordingEntryCardProps {
  entry: RecordingEntry;
  isPlaying: boolean;
  isCompareMode: boolean;
  isSelectedForCompare: boolean;
  onPress: () => void;
  colors: any;
}

/**
 * Mục đích: Card hiển thị 1 bản ghi trong lịch sử
 * Tham số đầu vào: entry data, states, onPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RecordingHistoryScreen SectionList → renderItem
 */
function RecordingEntryCard({
  entry, isPlaying, isCompareMode, isSelectedForCompare, onPress, colors,
}: RecordingEntryCardProps) {
  const modeEmoji = MODE_EMOJI[entry.mode] ?? '🎙️';
  const scoreColor = getScoreColor(entry.score);
  const modeBorderColor = MODE_BORDER_COLOR[entry.mode] ?? '#22C55E';
  const hasAudio = !!entry.audioUrl;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        marginBottom: 8,
        borderRadius: 14,
        backgroundColor: isSelectedForCompare
          ? '#22C55E15'
          : isPlaying
            ? '#3B82F615'
            : colors.surface,
        borderWidth: isSelectedForCompare ? 1.5 : 0,
        borderColor: isSelectedForCompare ? '#22C55E' : 'transparent',
        // B4: Colored left border per mode (mockup)
        borderLeftWidth: 3,
        borderLeftColor: modeBorderColor,
        gap: 12,
      }}>
      {/* Mode Emoji */}
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: modeBorderColor + '15',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <AppText variant="heading3">{modeEmoji}</AppText>
      </View>

      {/* Content */}
      <View style={{flex: 1}}>
        <AppText
          variant="body"
          weight="semibold"
          numberOfLines={1}
          style={{marginBottom: 2}}>
          {entry.sentence}
        </AppText>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          {/* Score badge with "Score:" prefix */}
          <View style={{
            paddingVertical: 2,
            paddingHorizontal: 6,
            borderRadius: 6,
            backgroundColor: scoreColor + '15',
          }}>
            <AppText variant="caption" weight="bold" style={{color: scoreColor}}>
              Score: {entry.score}
            </AppText>
          </View>
          {entry.duration > 0 && (
            <AppText variant="caption" style={{color: colors.neutrals400}}>
              ⏱ {formatDuration(entry.duration)}
            </AppText>
          )}
          <AppText variant="caption" style={{color: colors.neutrals400}}>
            {entry.mode}
          </AppText>
          {isPlaying && (
            <AppText variant="caption" style={{color: '#3B82F6'}}>
              🔊 Đang phát
            </AppText>
          )}
          {!hasAudio && (
            <AppText variant="caption" style={{color: '#EF4444'}}>
              ⚠️ Không có audio
            </AppText>
          )}
        </View>
      </View>

      {/* Compare checkbox */}
      {isCompareMode && (
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelectedForCompare ? '#22C55E' : colors.neutrals400,
          backgroundColor: isSelectedForCompare ? '#22C55E' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isSelectedForCompare && (
            <AppText variant="caption" style={{color: '#FFF', fontSize: 12}}>✓</AppText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// Helpers
// ============================================

/**
 * Mục đích: Format date string thành label header
 * Tham số đầu vào: dateStr (YYYY-MM-DD)
 * Tham số đầu ra: string
 * Khi nào sử dụng: SectionList section header
 */
function formatDateHeader(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) return 'Hôm nay';
  if (dateStr === yesterday) return 'Hôm qua';

  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Mục đích: Format duration seconds → mm:ss
 * Tham số đầu vào: seconds
 * Tham số đầu ra: string
 * Khi nào sử dụng: RecordingEntryCard → hiển thị thời lượng
 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

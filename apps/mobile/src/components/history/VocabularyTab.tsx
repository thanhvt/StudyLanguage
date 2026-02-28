import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useVocabularyStore, VocabWord} from '@/store/useVocabularyStore';
import {bookmarkApi, SentenceBookmark} from '@/services/api/listening';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Tab Từ vựng nâng cao — Spaced Repetition + Filter skill + Detail modal + Stats
 * Tham số đầu vào: không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → tab "📚 Từ vựng" active
 *
 * Tính năng nâng cao (Enhancement):
 *   - Spaced Repetition indicator (đến hạn review)
 *   - Filter theo skill type (Nghe/Đọc)
 *   - Vocabulary detail modal (meaning, context, pronunciation status)
 *   - Stats header (tổng từ, đã review, cần review)
 *   - Search từ vựng
 */

type VocabItem =
  | {type: 'word'; data: VocabWord}
  | {type: 'bookmark'; data: SentenceBookmark};

/**
 * Mục đích: Tính trạng thái Spaced Repetition cho 1 từ
 * Tham số đầu vào: savedAt — ISO date string khi lưu từ
 * Tham số đầu ra: Object {status, label, daysUntilReview}
 * Khi nào sử dụng: renderItem → hiển thị badge SR
 *
 * Lịch review: 1 ngày → 3 ngày → 7 ngày → 14 ngày → 30 ngày
 */
function getSpacedRepetitionStatus(savedAt: string): {
  status: 'new' | 'due' | 'upcoming' | 'mastered';
  label: string;
  color: string;
  bgColor: string;
} {
  const savedDate = new Date(savedAt);
  const now = new Date();
  const daysSinceSave = Math.floor(
    (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // SR intervals: 1, 3, 7, 14, 30
  const intervals = [1, 3, 7, 14, 30];

  if (daysSinceSave < 1) {
    return {status: 'new', label: 'Mới', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.12)'};
  }

  // Kiểm tra xem có đang ở interval nào đến hạn review không
  for (const interval of intervals) {
    if (daysSinceSave >= interval && daysSinceSave < interval + 1) {
      return {status: 'due', label: 'Cần review!', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.12)'};
    }
  }

  // Đã qua interval cuối → mastered
  if (daysSinceSave > 30) {
    return {status: 'mastered', label: 'Thuộc', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.12)'};
  }

  // Giữa các intervals → upcoming
  return {status: 'upcoming', label: 'Sắp review', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.12)'};
}

export function VocabularyTab() {
  const colors = useColors();
  const {words, removeWord, clearAll} = useVocabularyStore();

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<SentenceBookmark[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filter, setFilter] = useState<'all' | 'words' | 'bookmarks'>('all');
  const [skillFilter, setSkillFilter] = useState<'all' | 'listening' | 'reading'>('all');
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Detail modal
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  /**
   * Mục đích: Tải bookmarks từ server
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mount + pull-to-refresh
   */
  const fetchBookmarks = useCallback(async () => {
    try {
      setBookmarksLoading(true);
      const result = await bookmarkApi.getAll(1, 50);
      setBookmarks(result.bookmarks);
      console.log('📚 [VocabularyTab] Đã tải', result.bookmarks.length, 'bookmarks');
    } catch (err) {
      console.warn('⚠️ [VocabularyTab] Lỗi tải bookmarks:', err);
    } finally {
      setBookmarksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookmarks();
    setRefreshing(false);
  }, [fetchBookmarks]);

  // ==========================================
  // Computed data
  // ==========================================

  /**
   * Mục đích: Tính stats cho từ vựng (tổng, cần review, đã thuộc)
   * Tham số đầu vào: words từ store
   * Tham số đầu ra: {total, dueCount, masteredCount, newCount}
   * Khi nào sử dụng: Stats header render
   */
  const stats = useMemo(() => {
    let dueCount = 0;
    let masteredCount = 0;
    let newCount = 0;

    for (const word of words) {
      const sr = getSpacedRepetitionStatus(word.savedAt);
      if (sr.status === 'due') dueCount++;
      else if (sr.status === 'mastered') masteredCount++;
      else if (sr.status === 'new') newCount++;
    }

    return {
      total: words.length + bookmarks.length,
      wordCount: words.length,
      bookmarkCount: bookmarks.length,
      dueCount,
      masteredCount,
      newCount,
    };
  }, [words, bookmarks]);

  // Merge + filter + search data
  const items: VocabItem[] = useMemo(() => {
    const result: VocabItem[] = [];

    if (filter === 'all' || filter === 'words') {
      words
        .filter(w => {
          // Skill filter
          if (skillFilter !== 'all' && w.source !== skillFilter) return false;
          // Search filter
          if (searchText.trim()) {
            const query = searchText.toLowerCase();
            return (
              w.word.includes(query) ||
              (w.meaning || '').toLowerCase().includes(query)
            );
          }
          return true;
        })
        .forEach(w => result.push({type: 'word', data: w}));
    }

    if (filter === 'all' || filter === 'bookmarks') {
      bookmarks
        .filter(b => {
          if (searchText.trim()) {
            const query = searchText.toLowerCase();
            return (
              b.sentenceText.toLowerCase().includes(query) ||
              (b.sentenceTranslation || '').toLowerCase().includes(query)
            );
          }
          return true;
        })
        .forEach(b => result.push({type: 'bookmark', data: b}));
    }

    // Sort mới nhất trước
    result.sort((a, b) => {
      const dateA = a.type === 'word' ? a.data.savedAt : a.data.createdAt;
      const dateB = b.type === 'word' ? b.data.savedAt : b.data.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return result;
  }, [words, bookmarks, filter, skillFilter, searchText]);

  // ==========================================
  // Render functions
  // ==========================================

  /**
   * Mục đích: Render 1 item trong danh sách
   * Tham số đầu vào: item (VocabItem)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderItem = useCallback(
    ({item}: {item: VocabItem}) => {
      if (item.type === 'word') {
        const sr = getSpacedRepetitionStatus(item.data.savedAt);

        return (
          <Pressable
            className="flex-row items-center bg-surface-raised rounded-2xl px-4 py-3.5 mb-2.5 mx-4 border border-border active:scale-[0.97]"
            onPress={() => setSelectedWord(item.data)}>
            {/* Source badge */}
            <View className="bg-primary/10 rounded-xl px-2.5 py-1.5 mr-3">
              <AppText className="text-sm">
                {item.data.source === 'listening' ? '🎧' : '📖'}
              </AppText>
            </View>

            {/* Nội dung */}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <AppText className="text-foreground font-sans-bold text-sm">
                  {item.data.word}
                </AppText>
                {/* SR Badge */}
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{backgroundColor: sr.bgColor}}>
                  <AppText className="text-[10px] font-sans-semibold" style={{color: sr.color}}>
                    {sr.label}
                  </AppText>
                </View>
              </View>
              {item.data.meaning && (
                <AppText className="text-neutrals400 text-xs mt-0.5" numberOfLines={1}>
                  {item.data.meaning}
                </AppText>
              )}
            </View>

            {/* Xóa */}
            <Pressable
              onPress={() => removeWord(item.data.word)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              className="p-2 active:scale-90">
              <Icon name="X" className="w-4 h-4 text-neutrals500" />
            </Pressable>
          </Pressable>
        );
      }

      // Bookmark
      return (
        <View className="flex-row items-start bg-surface-raised rounded-2xl px-4 py-3.5 mb-2.5 mx-4 border border-border">
          {/* Source badge */}
          <View className="bg-amber-500/10 rounded-xl px-2.5 py-1.5 mr-3 mt-0.5">
            <AppText className="text-sm">⭐</AppText>
          </View>

          {/* Nội dung */}
          <View className="flex-1">
            <AppText className="text-neutrals400 text-xs font-sans-medium mb-0.5">
              {item.data.speaker} • {item.data.topic || 'Bài nghe'}
            </AppText>
            <AppText className="text-foreground text-sm" numberOfLines={2}>
              {item.data.sentenceText}
            </AppText>
            {item.data.sentenceTranslation && (
              <AppText className="text-neutrals500 text-xs mt-0.5 italic" numberOfLines={1}>
                {item.data.sentenceTranslation}
              </AppText>
            )}
          </View>
        </View>
      );
    },
    [removeWord],
  );

  const keyExtractor = useCallback(
    (item: VocabItem, index: number) =>
      item.type === 'word'
        ? `word-${item.data.word}`
        : `bm-${item.data.id || index}`,
    [],
  );

  // ==========================================
  // Empty state
  // ==========================================

  if (!bookmarksLoading && items.length === 0 && !searchText) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-2xl bg-surface-raised border border-border items-center justify-center mb-5">
          <AppText className="text-4xl">📚</AppText>
        </View>
        <AppText className="text-foreground font-sans-bold text-lg text-center mb-2">
          Chưa có từ vựng nào
        </AppText>
        <AppText className="text-neutrals400 text-sm text-center leading-5">
          Tap vào từ trong bài nghe hoặc bài đọc → chọn{' '}
          <AppText className="text-primary font-sans-bold">"Lưu từ"</AppText> để
          bắt đầu xây dựng bộ từ vựng!
        </AppText>
      </View>
    );
  }

  // ==========================================
  // Main render
  // ==========================================

  return (
    <View className="flex-1">
      {/* Stats Header */}
      <View className="flex-row mx-4 mb-3 gap-2">
        <View className="flex-1 bg-surface-raised rounded-xl p-3 items-center border border-border">
          <AppText className="text-foreground font-sans-bold text-lg">{stats.wordCount}</AppText>
          <AppText className="text-neutrals400 text-[10px]">Từ vựng</AppText>
        </View>
        <View className="flex-1 bg-surface-raised rounded-xl p-3 items-center border border-border">
          <AppText className="text-amber-400 font-sans-bold text-lg">{stats.dueCount}</AppText>
          <AppText className="text-neutrals400 text-[10px]">Cần review</AppText>
        </View>
        <View className="flex-1 bg-surface-raised rounded-xl p-3 items-center border border-border">
          <AppText className="text-green-400 font-sans-bold text-lg">{stats.masteredCount}</AppText>
          <AppText className="text-neutrals400 text-[10px]">Đã thuộc</AppText>
        </View>
        <View className="flex-1 bg-surface-raised rounded-xl p-3 items-center border border-border">
          <AppText className="text-foreground font-sans-bold text-lg">{stats.bookmarkCount}</AppText>
          <AppText className="text-neutrals400 text-[10px]">Bookmark</AppText>
        </View>
      </View>

      {/* Search + Filter Row */}
      <View className="flex-row items-center px-4 mb-2 gap-2">
        {/* Search toggle */}
        <Pressable
          className={`w-9 h-9 rounded-xl items-center justify-center border ${
            showSearch ? 'bg-primary/10 border-primary/30' : 'bg-surface-raised border-border'
          } active:scale-90`}
          onPress={() => {
            setShowSearch(!showSearch);
            if (showSearch) setSearchText('');
          }}>
          <AppText className="text-sm">{showSearch ? '✕' : '🔍'}</AppText>
        </Pressable>

        {/* Type filter pills */}
        {(['all', 'words', 'bookmarks'] as const).map(f => {
          const isActive = filter === f;
          const labels = {all: 'Tất cả', words: '📝 Từ', bookmarks: '⭐ BM'};
          return (
            <Pressable
              key={f}
              className={`rounded-xl px-3 py-1.5 border ${
                isActive ? 'bg-primary/10 border-primary/30' : 'bg-surface-raised border-border'
              } active:scale-95`}
              onPress={() => setFilter(f)}>
              <AppText
                className={`text-xs font-sans-medium ${isActive ? 'text-primary' : 'text-neutrals400'}`}>
                {labels[f]}
              </AppText>
            </Pressable>
          );
        })}

        <View className="flex-1" />

        {/* Skill filter chips */}
        {filter !== 'bookmarks' && (
          <View className="flex-row gap-1.5">
            {(['all', 'listening', 'reading'] as const).map(s => {
              const isActive = skillFilter === s;
              const icons = {all: '📋', listening: '🎧', reading: '📖'};
              return (
                <Pressable
                  key={s}
                  className={`rounded-lg px-2 py-1 ${isActive ? 'bg-primary/20' : ''} active:scale-90`}
                  onPress={() => setSkillFilter(s)}>
                  <AppText className="text-sm">{icons[s]}</AppText>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Search bar */}
      {showSearch && (
        <View className="mx-4 mb-2">
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm từ vựng..."
            placeholderTextColor="#5e5e5e"
            className="bg-neutrals900 border border-border rounded-xl px-4 py-2.5 text-foreground font-sans text-sm"
            autoFocus
          />
        </View>
      )}

      {/* Due alert */}
      {stats.dueCount > 0 && !showSearch && (
        <View className="mx-4 mb-2 flex-row items-center gap-2 px-3 py-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl">
          <AppText className="text-sm">⏰</AppText>
          <AppText className="text-amber-400 text-xs font-sans-medium flex-1">
            {stats.dueCount} từ cần review hôm nay!
          </AppText>
          <Pressable
            className="bg-amber-500/20 rounded-lg px-2.5 py-1 active:scale-95"
            onPress={() => {/* TODO: Filter only due words */}}>
            <AppText className="text-amber-400 text-xs font-sans-bold">Review →</AppText>
          </Pressable>
        </View>
      )}

      {/* List */}
      {bookmarksLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText className="text-neutrals400 text-xs mt-2">
            Đang tải...
          </AppText>
        </View>
      ) : (
        <FlatList<VocabItem>
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 4, paddingBottom: 100}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            words.length > 0 ? (
              <View className="flex-row justify-end px-4 mb-2">
                <Pressable
                  onPress={clearAll}
                  className="flex-row items-center gap-1 active:scale-95">
                  <Icon name="Trash2" className="w-3 h-3 text-destructive" />
                  <AppText className="text-destructive text-xs">Xóa hết từ</AppText>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            searchText ? (
              <View className="items-center py-8">
                <AppText className="text-neutrals400 text-sm">
                  Không tìm thấy "{searchText}"
                </AppText>
              </View>
            ) : null
          }
        />
      )}

      {/* ==========================================
          Vocabulary Detail Modal
          ========================================== */}
      <Modal
        visible={selectedWord !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedWord(null)}>
        <Pressable
          className="flex-1"
          style={{backgroundColor: 'rgba(0, 0, 0, 0.50)'}}
          onPress={() => setSelectedWord(null)}
        />

        {selectedWord && (
          <View
            className="bg-background rounded-t-3xl"
            style={{paddingBottom: 40}}>
            {/* Handle */}
            <View className="items-center pt-4 mb-4">
              <View className="w-10 h-1 bg-neutrals600 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 mb-5">
              <AppText className="text-foreground font-sans-bold text-xl">
                📖 Chi tiết từ vựng
              </AppText>
              <Pressable
                className="w-8 h-8 rounded-full bg-neutrals900 items-center justify-center active:scale-90"
                onPress={() => setSelectedWord(null)}>
                <AppText className="text-neutrals400 text-sm">✕</AppText>
              </Pressable>
            </View>

            {/* Word card */}
            <View className="mx-6 p-5 bg-surface-raised rounded-2xl border border-border mb-4">
              {/* Từ + Source */}
              <View className="flex-row items-center gap-3 mb-3">
                <View className="bg-primary/10 rounded-xl px-3 py-2">
                  <AppText className="text-lg">
                    {selectedWord.source === 'listening' ? '🎧' : '📖'}
                  </AppText>
                </View>
                <View className="flex-1">
                  <AppText className="text-foreground font-sans-bold text-2xl">
                    {selectedWord.word}
                  </AppText>
                  <AppText className="text-neutrals400 text-xs mt-0.5">
                    Từ {selectedWord.source === 'listening' ? 'bài nghe' : 'bài đọc'}
                  </AppText>
                </View>

                {/* SR Badge */}
                {(() => {
                  const sr = getSpacedRepetitionStatus(selectedWord.savedAt);
                  return (
                    <View className="px-3 py-1.5 rounded-full" style={{backgroundColor: sr.bgColor}}>
                      <AppText className="text-xs font-sans-bold" style={{color: sr.color}}>
                        {sr.label}
                      </AppText>
                    </View>
                  );
                })()}
              </View>

              {/* Nghĩa */}
              {selectedWord.meaning && (
                <View className="mt-2 pt-3 border-t border-border/30">
                  <AppText className="text-neutrals400 text-xs mb-1">📝 Nghĩa</AppText>
                  <AppText className="text-foreground text-sm leading-5">
                    {selectedWord.meaning}
                  </AppText>
                </View>
              )}

              {/* Ngữ cảnh */}
              {selectedWord.context && (
                <View className="mt-3 pt-3 border-t border-border/30">
                  <AppText className="text-neutrals400 text-xs mb-1">💬 Ngữ cảnh</AppText>
                  <AppText className="text-foreground text-sm italic leading-5">
                    "{selectedWord.context}"
                  </AppText>
                </View>
              )}

              {/* Ngày lưu */}
              <View className="mt-3 pt-3 border-t border-border/30">
                <AppText className="text-neutrals400 text-xs">
                  📅 Lưu: {new Date(selectedWord.savedAt).toLocaleDateString('vi-VN')}
                </AppText>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row px-6 gap-3">
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 active:scale-[0.95]"
                onPress={() => {
                  removeWord(selectedWord.word);
                  setSelectedWord(null);
                }}>
                <AppText className="text-red-400 font-sans-semibold text-sm">🗑️ Xóa</AppText>
              </Pressable>
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 border border-primary/20 active:scale-[0.95]">
                <AppText className="text-primary font-sans-semibold text-sm">🔊 Phát âm</AppText>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

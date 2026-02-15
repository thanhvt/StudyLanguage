import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useVocabularyStore, VocabWord} from '@/store/useVocabularyStore';
import {bookmarkApi, SentenceBookmark} from '@/services/api/listening';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Tab Từ vựng trong HistoryScreen — hiển thị saved words + sentence bookmarks
 * Tham số đầu vào: không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → tab "📚 Từ vựng" active
 *   - Saved words từ useVocabularyStore (persist local)
 *   - Sentence bookmarks từ bookmarkApi.getAll() (server)
 */

type VocabItem =
  | {type: 'word'; data: VocabWord}
  | {type: 'bookmark'; data: SentenceBookmark};

export function VocabularyTab() {
  const colors = useColors();
  const {words, removeWord, clearAll} = useVocabularyStore();

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<SentenceBookmark[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active filter
  const [filter, setFilter] = useState<'all' | 'words' | 'bookmarks'>('all');

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

  /**
   * Mục đích: Pull-to-refresh handler
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User kéo list xuống
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookmarks();
    setRefreshing(false);
  }, [fetchBookmarks]);

  // Merge + filter data
  const items: VocabItem[] = [];
  if (filter === 'all' || filter === 'words') {
    words.forEach(w => items.push({type: 'word', data: w}));
  }
  if (filter === 'all' || filter === 'bookmarks') {
    bookmarks.forEach(b => items.push({type: 'bookmark', data: b}));
  }

  // Sort theo thời gian (mới nhất trước)
  items.sort((a, b) => {
    const dateA = a.type === 'word' ? a.data.savedAt : a.data.createdAt;
    const dateB = b.type === 'word' ? b.data.savedAt : b.data.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  /**
   * Mục đích: Render 1 item trong danh sách
   * Tham số đầu vào: item (VocabItem)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderItem = useCallback(
    ({item}: {item: VocabItem}) => {
      if (item.type === 'word') {
        return (
          <View className="flex-row items-center bg-neutrals900 rounded-xl px-4 py-3 mb-2 mx-4">
            {/* Source badge */}
            <View className="bg-primary/15 rounded-lg px-2 py-1 mr-3">
              <AppText className="text-xs">
                {item.data.source === 'listening' ? '🎧' : '📖'}
              </AppText>
            </View>

            {/* Nội dung */}
            <View className="flex-1">
              <AppText className="text-foreground font-sans-semibold text-sm">
                {item.data.word}
              </AppText>
              {item.data.meaning && (
                <AppText className="text-neutrals400 text-xs mt-0.5" numberOfLines={1}>
                  {item.data.meaning}
                </AppText>
              )}
            </View>

            {/* Xóa */}
            <TouchableOpacity
              onPress={() => removeWord(item.data.word)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              className="p-1">
              <Icon name="X" className="w-4 h-4 text-neutrals500" />
            </TouchableOpacity>
          </View>
        );
      }

      // Bookmark
      return (
        <View className="flex-row items-start bg-neutrals900 rounded-xl px-4 py-3 mb-2 mx-4">
          {/* Source badge */}
          <View className="bg-warning/15 rounded-lg px-2 py-1 mr-3 mt-0.5">
            <AppText className="text-xs">⭐</AppText>
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

  // Empty state
  if (!bookmarksLoading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <AppText className="text-4xl mb-3">📚</AppText>
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

  return (
    <View className="flex-1">
      {/* Filter pills */}
      <View className="flex-row px-4 py-2 gap-2">
        {(['all', 'words', 'bookmarks'] as const).map(f => {
          const isActive = filter === f;
          const labels = {all: 'Tất cả', words: '📝 Từ vựng', bookmarks: '⭐ Bookmark'};
          const counts = {
            all: words.length + bookmarks.length,
            words: words.length,
            bookmarks: bookmarks.length,
          };
          return (
            <TouchableOpacity
              key={f}
              className={`rounded-full px-3 py-1.5 ${isActive ? 'bg-primary/20' : 'bg-neutrals900'}`}
              onPress={() => setFilter(f)}>
              <AppText
                className={`text-xs font-sans-medium ${isActive ? 'text-primary' : 'text-neutrals400'}`}>
                {labels[f]} ({counts[f]})
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

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
                <TouchableOpacity
                  onPress={clearAll}
                  className="flex-row items-center gap-1">
                  <Icon name="Trash2" className="w-3 h-3 text-destructive" />
                  <AppText className="text-destructive text-xs">Xóa hết từ</AppText>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

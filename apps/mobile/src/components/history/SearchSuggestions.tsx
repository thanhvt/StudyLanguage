import React from 'react';
import {View, Pressable, FlatList} from 'react-native';
import {AppText} from '@/components/ui';
import {useHistoryStore} from '@/store/useHistoryStore';

/**
 * Mục đích: Panel hiển thị gợi ý tìm kiếm + từ khóa tìm gần đây
 * Tham số đầu vào:
 *   - onSelectSuggestion: Callback khi chọn gợi ý
 *   - visible: boolean — hiển thị khi search đang active
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: HistoryScreen → khi search bar active + search text rỗng
 *
 * Tính năng:
 *   - Từ khóa tìm kiếm gần đây (lưu trong store)
 *   - Gợi ý nhanh theo skill type
 *   - Xóa riêng lẻ hoặc xóa hết recent searches
 */

interface SearchSuggestionsProps {
  onSelectSuggestion: (query: string) => void;
  visible: boolean;
}

// Gợi ý nhanh mặc định
const QUICK_SUGGESTIONS = [
  {icon: '🎧', label: 'Bài nghe gần đây', query: 'listening'},
  {icon: '🗣️', label: 'Bài nói gần đây', query: 'speaking'},
  {icon: '📖', label: 'Bài đọc gần đây', query: 'reading'},
  {icon: '⭐', label: 'Yêu thích', query: 'favorite'},
  {icon: '📌', label: 'Đã ghim', query: 'pinned'},
];

export const SearchSuggestions = React.memo(function SearchSuggestions({
  onSelectSuggestion,
  visible,
}: SearchSuggestionsProps) {
  const recentSearches = useHistoryStore(s => s.recentSearches);
  const removeRecentSearch = useHistoryStore(s => s.removeRecentSearch);
  const clearRecentSearches = useHistoryStore(s => s.clearRecentSearches);

  if (!visible) return null;

  return (
    <View className="mx-4 mb-3">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View className="mb-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <AppText className="text-neutrals400 text-xs font-sans-semibold uppercase tracking-wider">
              Tìm kiếm gần đây
            </AppText>
            <Pressable onPress={clearRecentSearches}>
              <AppText className="text-primary text-xs font-sans-medium">
                Xóa tất cả
              </AppText>
            </Pressable>
          </View>

          {/* Recent items */}
          <View className="gap-1.5">
            {recentSearches.slice(0, 5).map(query => (
              <View key={query} className="flex-row items-center">
                <Pressable
                  className="flex-1 flex-row items-center gap-2 py-2 active:opacity-70"
                  onPress={() => onSelectSuggestion(query)}>
                  <AppText className="text-sm">🕐</AppText>
                  <AppText className="text-foreground text-sm">{query}</AppText>
                </Pressable>
                <Pressable
                  className="px-2 py-1 active:scale-90"
                  onPress={() => removeRecentSearch(query)}>
                  <AppText className="text-neutrals400 text-xs">✕</AppText>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Suggestions */}
      <View>
        <AppText className="text-neutrals400 text-xs font-sans-semibold uppercase tracking-wider mb-2">
          Gợi ý nhanh
        </AppText>
        <FlatList
          horizontal
          data={QUICK_SUGGESTIONS}
          keyExtractor={item => item.query}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: 8}}
          renderItem={({item}) => (
            <Pressable
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-neutrals900 border border-border active:scale-[0.95]"
              onPress={() => onSelectSuggestion(item.query)}>
              <AppText className="text-sm">{item.icon}</AppText>
              <AppText className="text-foreground text-sm font-sans-medium">
                {item.label}
              </AppText>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
});

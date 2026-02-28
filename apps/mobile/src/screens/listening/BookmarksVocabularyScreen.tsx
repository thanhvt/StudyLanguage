import React, {useState, useMemo} from 'react';
import {View, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useListeningStore} from '@/store/useListeningStore';
import {useToast} from '@/components/ui/ToastProvider';

// ========================
// Màu sắc
// ========================
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';

// ========================
// Tabs
// ========================
const TABS = [
  {id: 'vocabulary' as const, label: 'Từ vựng'},
  {id: 'bookmarks' as const, label: 'Câu bookmark'},
];

/**
 * Mục đích: Màn hình Bookmarks & Vocabulary — quản lý từ đã lưu + câu đã bookmark
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: PlayerScreen → nhấn bookmark icon → navigate tới đây
 *   - Tab "Từ vựng": danh sách từ đã lưu (Dictionary Popup → addSavedWord)
 *   - Tab "Câu bookmark": danh sách câu đã bookmark (long press transcript)
 */
export default function BookmarksVocabularyScreen({
  navigation,
}: {
  navigation: any;
}) {
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'bookmarks'>('vocabulary');
  const [searchQuery, setSearchQuery] = useState('');

  const savedWords = useListeningStore(state => state.savedWords);
  const removeSavedWord = useListeningStore(state => state.removeSavedWord);
  const bookmarkedIndexes = useListeningStore(state => state.bookmarkedIndexes);
  const conversation = useListeningStore(state => state.conversation);
  const toggleBookmark = useListeningStore(state => state.toggleBookmark);

  const colors = useColors();
  const haptic = useHaptic();
  const {showSuccess} = useToast();

  // Lọc từ vựng theo search
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) {return savedWords;}
    return savedWords.filter(w =>
      w.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [savedWords, searchQuery]);

  // Lọc bookmark exchanges
  const bookmarkedExchanges = useMemo(() => {
    if (!conversation?.conversation) {return [];}
    return bookmarkedIndexes
      .filter(idx => idx < conversation.conversation.length)
      .map(idx => ({
        index: idx,
        exchange: conversation.conversation[idx],
      }))
      .filter(({exchange}) => {
        if (!searchQuery.trim()) {return true;}
        return exchange.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exchange.vietnamese || '').toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [conversation, bookmarkedIndexes, searchQuery]);

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Header */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText className="font-sans-bold text-lg flex-1 text-center mr-6" style={{color: colors.foreground}}>
          Bookmarks & Từ vựng
        </AppText>
      </View>

      {/* Tabs */}
      <View className="px-6 mb-4">
        <View className="flex-row rounded-xl p-1" style={{backgroundColor: colors.neutrals900}}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                className="flex-1 py-2 rounded-lg items-center"
                style={{backgroundColor: isActive ? LISTENING_BLUE : 'transparent'}}
                onPress={() => {
                  haptic.light();
                  setActiveTab(tab.id);
                }}
                accessibilityLabel={`Tab ${tab.label}${isActive ? ', đang chọn' : ''}`}
                accessibilityRole="tab">
                <AppText
                  className="text-sm font-sans-medium"
                  style={{color: isActive ? '#FFFFFF' : colors.neutrals400}}>
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Search */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center rounded-xl px-4 py-2.5" style={{backgroundColor: colors.neutrals900, borderWidth: 1, borderColor: colors.neutrals800}}>
          <Icon name="Search" className="w-4 h-4 mr-2" style={{color: colors.neutrals500}} />
          <TextInput
            className="flex-1 text-sm"
            style={{color: colors.foreground}}
            placeholder={activeTab === 'vocabulary' ? 'Tìm từ vựng...' : 'Tìm câu bookmark...'}
            placeholderTextColor={colors.neutrals500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Counter */}
      <View className="px-6 mb-3">
        <AppText className="text-xs" style={{color: colors.neutrals400}}>
          {activeTab === 'vocabulary'
            ? `${filteredWords.length} từ đã lưu`
            : `${bookmarkedExchanges.length} câu đã bookmark`}
        </AppText>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {activeTab === 'vocabulary' ? (
          // VOCABULARY TAB
          filteredWords.length === 0 ? (
            <View className="items-center py-16">
              <AppText className="text-3xl mb-3">📚</AppText>
              <AppText className="text-sm text-center" style={{color: colors.neutrals400}}>
                {searchQuery ? 'Không tìm thấy từ' : 'Chưa có từ vựng nào.\nNhấn vào từ trong transcript để lưu!'}
              </AppText>
            </View>
          ) : (
            <View className="gap-2 pb-6">
              {filteredWords.map((word, index) => (
                <View
                  key={`${word}-${index}`}
                  className="flex-row items-center rounded-xl px-4 py-3"
                  style={{backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border}}>
                  <View className="flex-1">
                    <AppText className="font-sans-medium text-sm" style={{color: colors.foreground}}>
                      {word}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      removeSavedWord(word);
                      haptic.light();
                      showSuccess('Đã xóa từ "' + word + '"');
                    }}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    accessibilityLabel={`Xóa từ ${word}`}
                    accessibilityRole="button">
                    <Icon name="X" className="w-4 h-4" style={{color: colors.neutrals500}} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        ) : (
          // BOOKMARKS TAB
          bookmarkedExchanges.length === 0 ? (
            <View className="items-center py-16">
              <AppText className="text-3xl mb-3">⭐</AppText>
              <AppText className="text-sm text-center" style={{color: colors.neutrals400}}>
                {searchQuery ? 'Không tìm thấy câu' : 'Chưa có bookmark nào.\nLong press câu trong transcript để lưu!'}
              </AppText>
            </View>
          ) : (
            <View className="gap-2 pb-6">
              {bookmarkedExchanges.map(({index, exchange}) => (
                <View
                  key={index}
                  className="rounded-xl p-4"
                  style={{backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border}}>
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2"
                      style={{backgroundColor: `${LISTENING_BLUE}20`}}>
                      <AppText className="text-xs" style={{color: LISTENING_BLUE}}>
                        {exchange.speaker.charAt(0)}
                      </AppText>
                    </View>
                    <AppText
                      className="text-xs font-sans-medium flex-1"
                      style={{color: LISTENING_BLUE}}>
                      {exchange.speaker}
                    </AppText>
                    <TouchableOpacity
                      onPress={() => {
                        toggleBookmark(index);
                        haptic.light();
                        showSuccess('Đã bỏ bookmark');
                      }}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                      accessibilityLabel="Bỏ bookmark"
                      accessibilityRole="button">
                      <Icon name="X" className="w-4 h-4" style={{color: colors.neutrals500}} />
                    </TouchableOpacity>
                  </View>
                  <AppText className="text-sm" style={{color: colors.foreground}}>{exchange.text}</AppText>
                  {exchange.vietnamese && (
                    <AppText className="text-xs mt-1 italic" style={{color: colors.neutrals500}}>
                      {exchange.vietnamese}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

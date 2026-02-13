import React, {useState, useCallback} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useReadingStore} from '@/store/useReadingStore';
import {SKILL_COLORS} from '@/config/skillColors';
import DictionaryPopup from '@/components/listening/DictionaryPopup';

/**
 * Mục đích: Màn hình hiển thị bài đọc + tap-to-translate
 * Tham số đầu vào: không có (lấy article từ store)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Sau khi ConfigScreen generate thành công → navigate('Article')
 *   - Hiển thị title + meta (level, wordCount, readingTime)
 *   - Nội dung bài đọc với từng từ tappable
 *   - Tap từ → mở DictionaryPopup (reuse từ Listening)
 *   - Điều chỉnh cỡ chữ
 *   - Nút quay lại / bài mới
 */
export default function ArticleScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const readingColor = SKILL_COLORS.reading.dark;
  const {width: screenWidth} = useWindowDimensions();

  // Zustand store
  const {article, fontSize, setFontSize, addSavedWord, reset} =
    useReadingStore();

  // Dictionary popup state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Phân tách nội dung thành đoạn và từ
  const paragraphs = article?.content?.split('\n').filter(p => p.trim()) ?? [];

  /**
   * Mục đích: Xử lý khi user tap 1 từ trong bài đọc
   * Tham số đầu vào: word (string)
   * Tham số đầu ra: void — mở DictionaryPopup
   * Khi nào sử dụng: User tap bất kỳ từ nào trong article content
   */
  const handleWordTap = useCallback((word: string) => {
    // Loại bỏ dấu câu, chỉ giữ lại ký tự chữ
    const clean = word.replace(/[^a-zA-Z'-]/g, '').trim();
    if (clean.length > 0) {
      console.log('📖 [ArticleScreen] Tap từ:', clean);
      setSelectedWord(clean);
    }
  }, []);

  /**
   * Mục đích: Xử lý lưu từ vào danh sách
   * Tham số đầu vào: word (string)
   * Tham số đầu ra: void — thêm vào store
   * Khi nào sử dụng: User nhấn "Lưu" trong DictionaryPopup
   */
  const handleSaveWord = useCallback(
    (word: string) => {
      addSavedWord(word);
      console.log('💾 [ArticleScreen] Đã lưu từ:', word);
    },
    [addSavedWord],
  );

  /**
   * Mục đích: Bắt đầu bài đọc mới
   * Tham số đầu vào: không có
   * Tham số đầu ra: void — reset store + navigate back
   * Khi nào sử dụng: User nhấn "Bài mới" ở cuối bài
   */
  const handleNewArticle = useCallback(() => {
    reset();
    navigation.goBack();
  }, [reset, navigation]);

  // Nếu không có article (edge case)
  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppText variant="body" className="text-neutrals400" raw>
          Chưa có bài đọc. Vui lòng quay lại tạo bài.
        </AppText>
        <AppButton
          variant="primary"
          className="mt-4"
          onPress={() => navigation.goBack()}
        >
          Quay lại
        </AppButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-neutrals900">
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}
        >
          {''}
        </AppButton>
        <View className="flex-1 mx-3">
          <AppText
            variant="body"
            weight="semibold"
            numberOfLines={1}
            raw
          >
            {article.title}
          </AppText>
        </View>
        {/* Font size controls */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            className="w-8 h-8 items-center justify-center rounded-lg"
            style={{backgroundColor: colors.neutrals800}}
          >
            <AppText variant="bodySmall" weight="bold" raw>
              A-
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            className="w-8 h-8 items-center justify-center rounded-lg"
            style={{backgroundColor: colors.neutrals800}}
          >
            <AppText variant="body" weight="bold" raw>
              A+
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Article Meta */}
      <View className="flex-row items-center px-4 py-3 gap-4">
        <View
          className="px-2 py-1 rounded-md"
          style={{backgroundColor: readingColor + '20'}}
        >
          <AppText
            variant="bodySmall"
            weight="semibold"
            style={{color: readingColor}}
            raw
          >
            {article.level === 'beginner'
              ? 'A1-A2'
              : article.level === 'intermediate'
                ? 'B1-B2'
                : 'C1-C2'}
          </AppText>
        </View>
        <AppText variant="bodySmall" className="text-neutrals400" raw>
          {article.wordCount} từ
        </AppText>
        <AppText variant="bodySmall" className="text-neutrals400" raw>
          ~{article.readingTime} phút
        </AppText>
      </View>

      {/* Article Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {paragraphs.map((paragraph, pIndex) => (
          <View key={pIndex} className="mb-4 flex-row flex-wrap">
            {paragraph.split(/(\s+)/).map((token, tIndex) => {
              // Bỏ qua khoảng trắng thuần
              if (/^\s+$/.test(token)) {
                return (
                  <AppText
                    key={`${pIndex}-${tIndex}`}
                    style={{fontSize, lineHeight: fontSize * 1.7}}
                    raw
                  >
                    {' '}
                  </AppText>
                );
              }

              return (
                <TouchableOpacity
                  key={`${pIndex}-${tIndex}`}
                  onPress={() => handleWordTap(token)}
                  activeOpacity={0.6}
                >
                  <AppText
                    style={{
                      fontSize,
                      lineHeight: fontSize * 1.7,
                      color: colors.foreground,
                    }}
                    raw
                  >
                    {token}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Bài mới button ở cuối */}
        <View className="py-8 items-center">
          <AppButton
            variant="outline"
            onPress={handleNewArticle}
            style={{borderColor: readingColor}}
          >
            📖 Đọc bài mới
          </AppButton>
        </View>

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {/* Dictionary Popup — reuse từ Listening module */}
      <DictionaryPopup
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onSaveWord={handleSaveWord}
      />
    </SafeAreaView>
  );
}

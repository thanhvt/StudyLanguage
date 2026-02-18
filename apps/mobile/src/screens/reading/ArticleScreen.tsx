import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated as RNAnimated,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Gesture, GestureDetector, GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useReadingStore} from '@/store/useReadingStore';
import {SKILL_COLORS} from '@/config/skillColors';
import DictionaryPopup from '@/components/listening/DictionaryPopup';
import {useTtsReader} from '@/hooks/useTtsReader';
import {usePinchZoom} from '@/hooks/usePinchZoom';
import {readingApi} from '@/services/api/reading';

/**
 * Mục đích: Màn hình hiển thị bài đọc + tap-to-translate + TTS + highlight + focus mode
 * Tham số đầu vào: không có (lấy article từ store)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Sau khi ConfigScreen generate thành công → navigate('Article')
 *   - Hiển thị title + meta (level, wordCount, readingTime)
 *   - Nội dung bài đọc với từng từ tappable
 *   - Tap từ → mở DictionaryPopup (reuse từ Listening)
   *   - Highlight từ đã lưu (amber badge)
   *   - TTS auto-read (đọc bài tự động, highlight đoạn đang đọc)
   *   - Focus Mode (ẩn header/bottom, tăng font)
   *   - Pinch-to-zoom text (điều chỉnh fontSize bằng gesture)
   *   - Direct save bài đọc vào History
   *   - Điều chỉnh cỡ chữ A+/A-
   *   - Nút quay lại / bài mới
 */
export default function ArticleScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const readingColor = SKILL_COLORS.reading.dark;

  // Zustand store
  const {
    article,
    fontSize,
    setFontSize,
    addSavedWord,
    savedWords,
    isFocusMode,
    toggleFocusMode,
    isArticleSaved,
    setArticleSaved,
    reset,
  } = useReadingStore();

  // Dictionary popup state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  // Trạng thái đang lưu bài
  const [isSaving, setIsSaving] = useState(false);

  // Focus Mode animation
  const chromeOpacity = useRef(new RNAnimated.Value(1)).current;
  const focusHintOpacity = useRef(new RNAnimated.Value(0)).current;
  const focusHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ScrollView ref cho auto-scroll khi TTS đọc
  const scrollViewRef = useRef<ScrollView>(null);
  // Lưu vị trí Y của từng paragraph
  const paragraphYPositions = useRef<Record<number, number>>({});

  // Phân tách nội dung thành đoạn và từ
  const paragraphs = useMemo(
    () => article?.content?.split('\n').filter(p => p.trim()) ?? [],
    [article?.content],
  );

  // TTS reader hook
  const tts = useTtsReader(paragraphs);

  // Pinch-to-zoom hook
  const pinchZoom = usePinchZoom();
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => pinchZoom.onPinchStart())
    .onUpdate(event => pinchZoom.onPinchUpdate(event.scale))
    .onFinalize(() => pinchZoom.onPinchEnd());

  // =======================
  // Focus Mode Effects
  // =======================

  useEffect(() => {
    if (isFocusMode) {
      // Ẩn chrome (header + bottom bar)
      RNAnimated.timing(chromeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Hiện hint "Tap để thoát" rồi ẩn sau 3 giây
      RNAnimated.timing(focusHintOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      focusHintTimer.current = setTimeout(() => {
        RNAnimated.timing(focusHintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);
    } else {
      // Hiện chrome
      RNAnimated.timing(chromeOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(focusHintOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (focusHintTimer.current) clearTimeout(focusHintTimer.current);
    };
  }, [isFocusMode, chromeOpacity, focusHintOpacity]);

  // Auto-scroll tới đoạn đang đọc (TTS)
  useEffect(() => {
    if (tts.currentParagraphIndex >= 0) {
      const y = paragraphYPositions.current[tts.currentParagraphIndex];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({y: y - 20, animated: true});
      }
    }
  }, [tts.currentParagraphIndex]);

  // Cleanup TTS khi rời screen
  useEffect(() => {
    return () => {
      tts.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================
  // Callbacks
  // =======================

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
   * Mục đích: Phát âm từ — dùng audio URL từ Dictionary API
   * Tham số đầu vào: audioUrl (string) — URL file mp3 phát âm
   * Tham số đầu ra: void — mở URL để phát audio
   * Khi nào sử dụng: User nhấn 🔊 trong DictionaryPopup
   */
  const handlePlayPronunciation = useCallback((audioUrl: string) => {
    console.log('🔊 [ArticleScreen] Phát âm từ URL:', audioUrl);
    Linking.openURL(audioUrl).catch(err =>
      console.error('❌ [ArticleScreen] Lỗi phát âm:', err),
    );
  }, []);

  /**
   * Mục đích: Bắt đầu bài đọc mới
   * Tham số đầu vào: không có
   * Tham số đầu ra: void — reset store + navigate back
   * Khi nào sử dụng: User nhấn "Bài mới" ở cuối bài
   */
  const handleNewArticle = useCallback(() => {
    tts.stop();
    reset();
    navigation.goBack();
  }, [reset, navigation, tts]);

  /**
   * Mục đích: Toggle TTS play/pause
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút 🔊/⏸️ ở header
   */
  const handleTtsToggle = useCallback(() => {
    if (tts.isReading) {
      tts.pause();
    } else {
      tts.play();
    }
  }, [tts]);

  /**
   * Mục đích: Toggle Focus Mode khi tap vào content area
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi đang ở Focus Mode, tap để thoát
   */
  const handleContentAreaTap = useCallback(() => {
    if (isFocusMode) {
      toggleFocusMode();
    }
  }, [isFocusMode, toggleFocusMode]);

  /**
   * Mục đích: Kiểm tra 1 từ có phải là từ đã lưu hay không
   * Tham số đầu vào: token (string) — từ cần kiểm tra
   * Tham số đầu ra: boolean
   * Khi nào sử dụng: Render mỗi token trong bài đọc
   */
  const isWordHighlighted = useCallback(
    (token: string) => {
      const clean = token.toLowerCase().replace(/[^a-z'-]/g, '');
      return clean.length > 0 && savedWords.includes(clean);
    },
    [savedWords],
  );

  /**
   * Mục đích: Lưu bài đọc hiện tại vào History
   * Tham số đầu vào: không có (dùng article từ store)
   * Tham số đầu ra: void — gọi API + cập nhật isArticleSaved
   * Khi nào sử dụng: User nhấn nút "Lưu bài" ở bottom bar
   */
  const handleSaveArticle = useCallback(async () => {
    if (!article || isArticleSaved || isSaving) return;
    setIsSaving(true);
    try {
      await readingApi.saveReadingSession(article, savedWords.length);
      setArticleSaved(true);
      console.log('💾 [ArticleScreen] Đã lưu bài đọc vào lịch sử');
      Alert.alert('Đã lưu!', 'Bài đọc đã được lưu vào lịch sử học tập.');
    } catch (err) {
      console.error('❌ [ArticleScreen] Lỗi lưu bài:', err);
      Alert.alert('Lỗi', 'Không thể lưu bài đọc. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }, [article, isArticleSaved, isSaving, savedWords.length, setArticleSaved]);

  // Font size điều chỉnh theo Focus Mode
  const activeFontSize = isFocusMode ? fontSize + 2 : fontSize;

  // =======================
  // Render
  // =======================

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
    <GestureHandlerRootView style={{flex: 1}}>
    <SafeAreaView className="flex-1 bg-background">
      {/* Ẩn status bar khi Focus Mode */}
      <StatusBar hidden={isFocusMode} />

      {/* Header — ẩn khi Focus Mode */}
      <RNAnimated.View
        style={{opacity: chromeOpacity}}
        pointerEvents={isFocusMode ? 'none' : 'auto'}
      >
        <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-neutrals900">
          <AppButton
            variant="ghost"
            size="icon"
            onPress={() => {
              tts.stop();
              navigation.goBack();
            }}
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
          {/* TTS toggle + Font size controls */}
          <View className="flex-row items-center gap-1">
            {/* Nút TTS auto-read */}
            <TouchableOpacity
              onPress={handleTtsToggle}
              className="w-8 h-8 items-center justify-center rounded-lg"
              style={{
                backgroundColor: tts.isReading || tts.isPaused
                  ? readingColor + '30'
                  : colors.neutrals800,
              }}
              accessibilityLabel={tts.isReading ? 'Tạm dừng đọc' : 'Đọc bài tự động'}
              accessibilityRole="button"
            >
              <Icon
                name={tts.isReading ? 'Pause' : 'Volume2'}
                className="w-4 h-4"
                style={{
                  color: tts.isReading || tts.isPaused
                    ? readingColor
                    : colors.foreground,
                }}
              />
            </TouchableOpacity>
            {/* Nút giảm font */}
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
              className="w-8 h-8 items-center justify-center rounded-lg"
              style={{backgroundColor: colors.neutrals800}}
            >
              <AppText variant="bodySmall" weight="bold" raw>
                A-
              </AppText>
            </TouchableOpacity>
            {/* Nút tăng font */}
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(28, fontSize + 2))}
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
          {/* Số từ đã lưu */}
          {savedWords.length > 0 && (
            <View className="flex-row items-center gap-1">
              <Icon name="Bookmark" className="w-3 h-3" style={{color: readingColor}} />
              <AppText variant="bodySmall" style={{color: readingColor}} raw>
                {savedWords.length}
              </AppText>
            </View>
          )}
        </View>
      </RNAnimated.View>

      {/* Article Content — wrapped trong GestureDetector cho pinch-to-zoom */}
      <GestureDetector gesture={pinchGesture}>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        onTouchEnd={isFocusMode ? handleContentAreaTap : undefined}
      >
        {paragraphs.map((paragraph, pIndex) => (
          <TouchableOpacity
            key={pIndex}
            activeOpacity={1}
            onPress={() => {
              // Tap vào paragraph khi đang đọc TTS → nhảy tới đoạn đó
              if (tts.isReading || tts.isPaused) {
                tts.skipTo(pIndex);
              }
            }}
            onLayout={event => {
              // Lưu Y position để auto-scroll
              paragraphYPositions.current[pIndex] = event.nativeEvent.layout.y;
            }}
          >
            <View
              className="mb-4 flex-row flex-wrap"
              style={
                tts.currentParagraphIndex === pIndex
                  ? {
                      borderLeftWidth: 3,
                      borderLeftColor: readingColor,
                      paddingLeft: 8,
                      backgroundColor: readingColor + '08',
                      borderRadius: 4,
                    }
                  : undefined
              }
            >
              {paragraph.split(/(\s+)/).map((token, tIndex) => {
                // Bỏ qua khoảng trắng thuần
                if (/^\s+$/.test(token)) {
                  return (
                    <AppText
                      key={`${pIndex}-${tIndex}`}
                      style={{
                        fontSize: activeFontSize,
                        lineHeight: activeFontSize * 1.7,
                      }}
                      raw
                    >
                      {' '}
                    </AppText>
                  );
                }

                // Kiểm tra từ đã lưu → highlight
                const highlighted = isWordHighlighted(token);

                return (
                  <TouchableOpacity
                    key={`${pIndex}-${tIndex}`}
                    onPress={() => handleWordTap(token)}
                    activeOpacity={0.6}
                  >
                    <AppText
                      style={{
                        fontSize: activeFontSize,
                        lineHeight: activeFontSize * 1.7,
                        color: highlighted ? readingColor : colors.foreground,
                        backgroundColor: highlighted
                          ? readingColor + '20'
                          : 'transparent',
                        borderRadius: highlighted ? 3 : 0,
                        paddingHorizontal: highlighted ? 2 : 0,
                      }}
                      raw
                    >
                      {token}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        ))}

        {/* Nút hành động ở cuối bài */}
        <View className="py-8 items-center gap-3">
          <AppButton
            variant="primary"
            onPress={() => navigation.navigate('Practice')}
            style={{backgroundColor: readingColor}}
          >
            🎤 Luyện đọc to
          </AppButton>
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
      </GestureDetector>

      {/* Bottom Action Bar — ẩn khi Focus Mode */}
      <RNAnimated.View
        style={{opacity: chromeOpacity}}
        pointerEvents={isFocusMode ? 'none' : 'auto'}
      >
        <View
          className="flex-row items-center justify-around px-4 py-3 border-t border-neutrals900"
          style={{backgroundColor: colors.background}}
        >
          {/* Focus Mode toggle */}
          <TouchableOpacity
            onPress={toggleFocusMode}
            className="items-center gap-1"
            accessibilityLabel="Chế độ tập trung"
          >
            <Icon name="Eye" className="w-5 h-5" style={{color: colors.neutrals400}} />
            <AppText variant="bodySmall" className="text-neutrals400" raw>
              Tập trung
            </AppText>
          </TouchableOpacity>

          {/* TTS control */}
          <TouchableOpacity
            onPress={handleTtsToggle}
            className="items-center gap-1"
            accessibilityLabel="Đọc bài tự động"
          >
            <Icon
              name={tts.isReading ? 'Pause' : 'Volume2'}
              className="w-5 h-5"
              style={{color: tts.isReading ? readingColor : colors.neutrals400}}
            />
            <AppText
              variant="bodySmall"
              style={{color: tts.isReading ? readingColor : colors.neutrals400}}
              raw
            >
              {tts.isReading ? 'Đang đọc' : 'Đọc bài'}
            </AppText>
          </TouchableOpacity>

          {/* Saved words count */}
          <TouchableOpacity
            className="items-center gap-1"
            accessibilityLabel={`${savedWords.length} từ đã lưu`}
          >
            <View className="relative">
              <Icon
                name="BookOpen"
                className="w-5 h-5"
                style={{color: colors.neutrals400}}
              />
              {savedWords.length > 0 && (
                <View
                  className="absolute -top-1 -right-2 w-4 h-4 rounded-full items-center justify-center"
                  style={{backgroundColor: readingColor}}
                >
                  <AppText
                    variant="bodySmall"
                    style={{fontSize: 10, color: '#000', fontWeight: '700'}}
                    raw
                  >
                    {savedWords.length}
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="bodySmall" className="text-neutrals400" raw>
              Từ vựng
            </AppText>
          </TouchableOpacity>

          {/* Direct Save button */}
          <TouchableOpacity
            onPress={handleSaveArticle}
            className="items-center gap-1"
            disabled={isArticleSaved || isSaving}
            accessibilityLabel={isArticleSaved ? 'Đã lưu bài' : 'Lưu bài đọc'}
          >
            <Icon
              name={isArticleSaved ? 'BookmarkCheck' : 'Download'}
              className="w-5 h-5"
              style={{color: isArticleSaved ? readingColor : colors.neutrals400}}
            />
            <AppText
              variant="bodySmall"
              style={{color: isArticleSaved ? readingColor : colors.neutrals400}}
              raw
            >
              {isSaving ? 'Đang lưu...' : isArticleSaved ? 'Đã lưu' : 'Lưu bài'}
            </AppText>
          </TouchableOpacity>
        </View>
      </RNAnimated.View>

      {/* Focus Mode hint — hiện rồi tự ẩn sau 3s */}
      {isFocusMode && (
        <RNAnimated.View
          style={{
            opacity: focusHintOpacity,
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
          pointerEvents="none"
        >
          <View
            className="px-4 py-2 rounded-full"
            style={{backgroundColor: colors.neutrals800 + 'CC'}}
          >
            <AppText variant="bodySmall" className="text-neutrals300" raw>
              Tap bất kỳ đâu để thoát Focus Mode
            </AppText>
          </View>
        </RNAnimated.View>
      )}

      {/* Dictionary Popup — reuse từ Listening module */}
      <DictionaryPopup
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onSaveWord={handleSaveWord}
        onPlayPronunciation={handlePlayPronunciation}
      />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useInsets} from '@/hooks/useInsets';
import {useHaptic} from '@/hooks/useHaptic';
import {useDictionary} from '@/hooks/useDictionary';
import type {DictionaryMeaning} from '@/hooks/useDictionary';

const LISTENING_BLUE = '#2563EB';

interface DictionaryPopupProps {
  /** Từ đang tra (null = đóng popup) */
  word: string | null;
  /** Callback khi đóng popup */
  onClose: () => void;
  /** Callback khi user lưu từ */
  onSaveWord?: (word: string) => void;
  /** Callback phát âm từ qua Azure TTS — parent xử lý pause/resume audio chính */
  onPronounce?: (word: string) => Promise<void>;
}

/**
 * Mục đích: BottomSheet popup tra từ điển — hiển thị IPA, nghĩa, ví dụ, phát âm
 * Tham số đầu vào: word (string | null), onClose, onSaveWord, onPronounce
 * Tham số đầu ra: JSX.Element (BottomSheetModal)
 * Khi nào sử dụng: PlayerScreen / ArticleScreen → user tap từ trong transcript
 *   - Gọi useDictionary() để tra nghĩa từ backend
 *   - Hiển thị: word, IPA, partOfSpeech badges, definitions, examples
 *   - Nút phát âm 🔊 (luôn hiện — dùng Azure TTS qua onPronounce callback)
 *   - Nút lưu từ 💾
 *   - Khi tap từ mới khi popup đang mở → cập nhật nội dung (MOB-LIS-MVP-EC-005)
 */
export default function DictionaryPopup({
  word,
  onClose,
  onSaveWord,
  onPronounce,
}: DictionaryPopupProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const colors = useColors();
  const insets = useInsets();
  const haptic = useHaptic();
  const {result, isLoading, error, lookup, clear} = useDictionary();
  const [isPronouncing, setIsPronouncing] = useState(false);

  // Khi word thay đổi → mở popup + tra từ
  useEffect(() => {
    if (word) {
      lookup(word);
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      clear();
    }
  }, [word, lookup, clear]);

  /**
   * Mục đích: Xử lý khi popup bị đóng (swipe down hoặc tap backdrop)
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: BottomSheet dismiss
   */
  const handleDismiss = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  /**
   * Mục đích: Phát âm từ qua Azure TTS
   * Tham số đầu vào: không có (dùng result.word)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút 🔊 trong popup
   */
  const handlePlayAudio = useCallback(async () => {
    if (!result?.word || !onPronounce || isPronouncing) {
      return;
    }
    setIsPronouncing(true);
    haptic.light();
    console.log('🔊 [DictionaryPopup] Phát âm từ qua Azure TTS:', result.word);
    try {
      await onPronounce(result.word);
    } catch (err) {
      console.error('❌ [DictionaryPopup] Lỗi phát âm:', err);
    } finally {
      setIsPronouncing(false);
    }
  }, [result, onPronounce, isPronouncing, haptic]);

  /**
   * Mục đích: Lưu từ vào danh sách Saved Words
   * Tham số đầu vào: không có (dùng result.word)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút "Lưu từ" trong popup
   */
  const handleSaveWord = useCallback(() => {
    if (result?.word && onSaveWord) {
      haptic.success();
      onSaveWord(result.word);
      console.log('💾 [DictionaryPopup] Đã lưu từ:', result.word);
    }
  }, [result, onSaveWord, haptic]);

  /**
   * Mục đích: Mở Google để tra thêm khi API không có kết quả
   * Tham số đầu vào: không có (dùng word)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap "Tìm trên Google" khi lỗi
   */
  const handleGoogleFallback = useCallback(() => {
    if (word) {
      const url = `https://www.google.com/search?q=define+${encodeURIComponent(word)}`;
      Linking.openURL(url);
    }
  }, [word]);

  /**
   * Mục đích: Render backdrop bán trong suốt cho BottomSheet
   * Tham số đầu vào: props (BottomSheet backdrop props)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: BottomSheetModal backdropComponent
   */
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    [],
  );

  /**
   * Mục đích: Trả về màu badge theo loại từ
   * Tham số đầu vào: partOfSpeech (string)
   * Tham số đầu ra: { bg: string, text: string }
   * Khi nào sử dụng: Render partOfSpeech badges (noun, verb, adj...)
   */
  const getPartOfSpeechColor = (partOfSpeech: string) => {
    switch (partOfSpeech) {
      case 'noun':
        return {bg: 'bg-blue-500/20', text: 'text-blue-400'};
      case 'verb':
        return {bg: 'bg-green-500/20', text: 'text-green-400'};
      case 'adjective':
        return {bg: 'bg-amber-500/20', text: 'text-amber-400'};
      case 'adverb':
        return {bg: 'bg-orange-500/20', text: 'text-orange-400'};
      default:
        return {bg: colors.neutrals700, text: colors.neutrals300};
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // Glass border — premium style giống TtsSettingsSheet
        borderTopWidth: 1,
        borderTopColor: colors.glassBorderStrong,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderLeftColor: colors.glassBorderStrong,
        borderRightColor: colors.glassBorderStrong,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.neutrals600,
        width: 40,
        height: 4,
      }}
      style={{
        // Shadow — tạo depth cho bottom sheet
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -8},
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 16,
      }}>
      <BottomSheetScrollView
        style={{maxHeight: 400, paddingBottom: insets.bottom + 16}}>
        {/* Header */}
        <View className="px-5 pt-2 pb-4">
          {/* Từ + IPA + nút phát âm */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              {word && (
                <AppText className="font-sans-bold text-2xl capitalize" style={{color: colors.foreground}}>
                  {isLoading ? word : result?.word || word}
                </AppText>
              )}
              {result?.ipa && (
                <AppText className="text-sm font-mono mt-1" style={{color: colors.neutrals400}}>
                  {result.ipa}
                </AppText>
              )}
            </View>

            {/* Nút hành động: phát âm + lưu từ + Google — top-right */}
            <View className="flex-row items-center gap-2 ml-3">
              {/* Nút phát âm — luôn hiện khi có result */}
              {result && onPronounce && (
                <TouchableOpacity
                  onPress={handlePlayAudio}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{backgroundColor: `${LISTENING_BLUE}20`}}
                  disabled={isPronouncing}
                  accessibilityLabel="Phát âm từ"
                  accessibilityRole="button">
                  {isPronouncing ? (
                    <ActivityIndicator size="small" color={LISTENING_BLUE} />
                  ) : (
                    <Icon name="Volume2" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
                  )}
                </TouchableOpacity>
              )}
              {/* Nút lưu từ */}
              {result && onSaveWord && (
                <TouchableOpacity
                  onPress={handleSaveWord}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{backgroundColor: `${LISTENING_BLUE}20`}}
                  accessibilityLabel="Lưu từ vào danh sách"
                  accessibilityRole="button">
                  <Icon name="Bookmark" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
                </TouchableOpacity>
              )}
              {/* Nút Google fallback */}
              {result && (
                <TouchableOpacity
                  onPress={handleGoogleFallback}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{backgroundColor: colors.neutrals800}}
                  accessibilityLabel="Xem thêm trên Google"
                  accessibilityRole="link">
                  <Icon name="ExternalLink" className="w-5 h-5" style={{color: colors.neutrals400}} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="px-5 py-8 items-center">
            <ActivityIndicator size="small" color={LISTENING_BLUE} />
            <AppText className="text-sm mt-3" style={{color: colors.neutrals400}}>
              Đang tra từ...
            </AppText>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="px-5 pb-4">
            <View className="bg-error/10 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Icon name="TriangleAlert" className="w-4 h-4 text-error mr-2" />
                <AppText className="text-error text-sm font-sans-semibold">
                  {error}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={handleGoogleFallback}
                className="flex-row items-center justify-center rounded-lg py-2.5 mt-2"
                style={{backgroundColor: colors.neutrals800}}>
                <AppText className="text-sm mr-1" style={{color: colors.foreground}}>
                  Tìm trên Google
                </AppText>
                <Icon
                  name="ExternalLink"
                  className="w-3.5 h-3.5"
                  style={{color: colors.neutrals400}}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Result — Meanings */}
        {result && (
          <View className="px-5 pb-4">
            {result.meanings.map((meaning: DictionaryMeaning, idx: number) => (
              <View key={idx} className="mb-4">
                {/* Part of Speech badge */}
                <View
                  className={`self-start rounded-md px-2.5 py-1 mb-2 ${getPartOfSpeechColor(meaning.partOfSpeech).bg}`}>
                  <AppText
                    className={`text-xs font-sans-bold ${getPartOfSpeechColor(meaning.partOfSpeech).text}`}>
                    {meaning.partOfSpeech}
                  </AppText>
                </View>

                {/* Definitions */}
                {meaning.definitions.map((def, defIdx) => (
                  <View
                    key={defIdx}
                    className="ml-1 pl-3 mb-2.5"
                    style={{borderLeftWidth: 2, borderLeftColor: colors.neutrals700}}>
                    <AppText className="text-sm leading-5" style={{color: colors.foreground}}>
                      {def.definition}
                    </AppText>
                    {def.example && (
                      <AppText className="text-xs italic mt-1" style={{color: colors.neutrals500}}>
                        "{def.example}"
                      </AppText>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

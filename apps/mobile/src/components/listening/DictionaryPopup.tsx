import React, {useCallback, useEffect, useRef} from 'react';
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
  /** Callback khi user tap phát âm — cần pause audio chính */
  onPlayPronunciation?: (audioUrl: string) => void;
}

/**
 * Mục đích: BottomSheet popup tra từ điển — hiển thị IPA, nghĩa, ví dụ, phát âm
 * Tham số đầu vào: word (string | null), onClose, onSaveWord, onPlayPronunciation
 * Tham số đầu ra: JSX.Element (BottomSheetModal)
 * Khi nào sử dụng: PlayerScreen → user tap từ trong transcript
 *   - Gọi useDictionary() để tra nghĩa từ backend
 *   - Hiển thị: word, IPA, partOfSpeech badges, definitions, examples
 *   - Nút phát âm 🔊 (dùng audio URL từ Free Dictionary)
 *   - Nút lưu từ 💾
 *   - Khi tap từ mới khi popup đang mở → cập nhật nội dung (MOB-LIS-MVP-EC-005)
 */
export default function DictionaryPopup({
  word,
  onClose,
  onSaveWord,
  onPlayPronunciation,
}: DictionaryPopupProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const colors = useColors();
  const insets = useInsets();
  const haptic = useHaptic();
  const {result, isLoading, error, lookup, clear} = useDictionary();

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
   * Mục đích: Phát âm từ bằng audio URL từ API
   * Tham số đầu vào: không có (dùng result.audio)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút 🔊 trong popup
   */
  const handlePlayAudio = useCallback(() => {
    if (result?.audio && onPlayPronunciation) {
      haptic.light();
      onPlayPronunciation(result.audio);
      console.log('🔊 [DictionaryPopup] Phát âm từ:', result.word);
    }
  }, [result, onPlayPronunciation, haptic]);

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
        return {bg: 'bg-neutrals700', text: 'text-neutrals300'};
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{backgroundColor: colors.background}}
      handleIndicatorStyle={{backgroundColor: colors.neutrals600}}
      style={{marginHorizontal: 8}}>
      <BottomSheetScrollView
        style={{maxHeight: 400, paddingBottom: insets.bottom + 16}}>
        {/* Header */}
        <View className="px-5 pt-2 pb-4">
          {/* Từ + IPA + nút phát âm */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              {word && (
                <AppText className="text-foreground font-sans-bold text-2xl capitalize">
                  {isLoading ? word : result?.word || word}
                </AppText>
              )}
              {result?.ipa && (
                <AppText className="text-neutrals400 text-sm font-mono mt-1">
                  {result.ipa}
                </AppText>
              )}
            </View>

            {/* Nút hành động: phát âm + lưu từ + Google — top-right */}
            <View className="flex-row items-center gap-2 ml-3">
              {/* Nút phát âm */}
              {result?.audio && (
                <TouchableOpacity
                  onPress={handlePlayAudio}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{backgroundColor: `${LISTENING_BLUE}20`}}
                  accessibilityLabel="Phát âm từ"
                  accessibilityRole="button">
                  <Icon name="Volume2" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
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
                  className="w-10 h-10 rounded-full bg-neutrals800 items-center justify-center"
                  accessibilityLabel="Xem thêm trên Google"
                  accessibilityRole="link">
                  <Icon name="ExternalLink" className="w-5 h-5 text-neutrals400" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="px-5 py-8 items-center">
            <ActivityIndicator size="small" color={LISTENING_BLUE} />
            <AppText className="text-neutrals400 text-sm mt-3">
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
                className="flex-row items-center justify-center bg-neutrals800 rounded-lg py-2.5 mt-2">
                <AppText className="text-foreground text-sm mr-1">
                  Tìm trên Google
                </AppText>
                <Icon
                  name="ExternalLink"
                  className="w-3.5 h-3.5 text-neutrals400"
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
                    className="ml-1 pl-3 border-l-2 border-neutrals700 mb-2.5">
                    <AppText className="text-foreground text-sm leading-5">
                      {def.definition}
                    </AppText>
                    {def.example && (
                      <AppText className="text-neutrals500 text-xs italic mt-1">
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

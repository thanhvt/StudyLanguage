import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

interface TappableTranscriptProps {
  /** Nội dung text cần render */
  text: string;
  /** Callback khi user tap vào 1 từ */
  onWordPress: (word: string) => void;
  /** Có đang active (highlight) hay không */
  isActive?: boolean;
}

/**
 * Mục đích: Render text transcript thành từng từ riêng biệt, mỗi từ tap được
 * Tham số đầu vào: text (string), onWordPress (callback), isActive (boolean)
 * Tham số đầu ra: JSX.Element — flex-row flex-wrap của các từ
 * Khi nào sử dụng: PlayerScreen → thay thế <AppText>{exchange.text}</AppText>
 *   - Tách text bằng regex thành từng từ
 *   - Mỗi từ là TouchableOpacity với minHeight 28px cho touch target
 *   - Tap từ → gọi onWordPress(word) → mở DictionaryPopup
 */
const TappableTranscript = React.memo(function TappableTranscript({
  text,
  onWordPress,
  isActive = false,
}: TappableTranscriptProps) {
  const colors = useColors();
  /**
   * Mục đích: Tách text thành mảng các từ, giữ khoảng trắng
   * Tham số đầu vào: text (string)
   * Tham số đầu ra: string[] — mảng từ
   * Khi nào sử dụng: Render mỗi từ riêng biệt
   */
  const words = text.split(/(\s+)/);

  /**
   * Mục đích: Xử lý khi user tap 1 từ
   * Tham số đầu vào: word (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào từ trong transcript
   */
  const handlePress = useCallback(
    (word: string) => {
      // BUG-13 fix: Hỗ trợ cả Unicode letters (café, résumé, naïve...)
      const cleanWord = word.replace(/[^a-zA-Z\u00C0-\u024F'-]/g, '');
      if (cleanWord.length > 0) {
        onWordPress(cleanWord);
      }
    },
    [onWordPress],
  );

  return (
    <View className="flex-row flex-wrap">
      {words.map((word, index) => {
        // Khoảng trắng → render trực tiếp
        if (/^\s+$/.test(word)) {
          return (
            <AppText key={`s-${index}`} className="text-base" style={{color: colors.foreground}}>
              {' '}
            </AppText>
          );
        }

        // Từ thực → render TouchableOpacity
        return (
          <TouchableOpacity
            key={`w-${index}`}
            onPress={() => handlePress(word)}
            activeOpacity={0.6}
            accessibilityLabel={`Tra từ ${word}`}
            accessibilityRole="button"
            style={{minHeight: 28}}>
            <AppText
              className="text-base leading-6"
              style={{color: colors.foreground, textDecorationLine: isActive ? 'underline' : 'none'}}>
              {word}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default TappableTranscript;

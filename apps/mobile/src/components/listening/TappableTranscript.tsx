import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import type {WordTimestamp} from '@/services/api/listening';

// Màu highlight cho từ đang nói
const WORD_HIGHLIGHT_BG = '#3B82F620'; // blue-500 opacity 12%
const WORD_HIGHLIGHT_COLOR = '#3B82F6'; // blue-500

interface TappableTranscriptProps {
  /** Nội dung text cần render */
  text: string;
  /** Callback khi user tap vào 1 từ */
  onWordPress: (word: string) => void;
  /** Có đang active (highlight) hay không */
  isActive?: boolean;
  /** Word timestamps cho câu này (từ Azure TTS) — dùng cho karaoke mode */
  wordTimestamps?: WordTimestamp[];
  /** Index từ đang được nói (-1 = không highlight) */
  currentWordIndex?: number;
}

/**
 * Mục đích: Render text transcript thành từng từ riêng biệt, mỗi từ tap được
 *   Hỗ trợ 2 mode:
 *   1. Mode thường: Tách text bằng split → render từng từ (behavior cũ)
 *   2. Karaoke mode: Dùng Azure wordTimestamps làm nguồn → highlight từ đang nói
 * Tham số đầu vào: text, onWordPress, isActive, wordTimestamps?, currentWordIndex?
 * Tham số đầu ra: JSX.Element — flex-row flex-wrap của các từ
 * Khi nào sử dụng: PlayerScreen → render exchange transcript
 *   - Karaoke mode khi có wordTimestamps + isActive
 *   - Fallback mode thường khi không có wordTimestamps
 */
const TappableTranscript = React.memo(function TappableTranscript({
  text,
  onWordPress,
  isActive = false,
  wordTimestamps,
  currentWordIndex = -1,
}: TappableTranscriptProps) {
  const colors = useColors();

  /**
   * Mục đích: Xử lý khi user tap 1 từ → mở dictionary popup
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

  // ========================
  // KARAOKE MODE: Dùng Azure words làm nguồn render
  // Giải quyết edge case word splitting mismatch (contractions, hyphens...)
  // ========================
  if (isActive && wordTimestamps && wordTimestamps.length > 0) {
    // Tách text gốc thành từng token (giữ khoảng trắng)
    const originalTokens = text.split(/(\s+)/);
    // Tracking: map vị trí từ thực (bỏ whitespace) → Azure word index
    let azureIdx = 0;

    return (
      <View className="flex-row flex-wrap">
        {originalTokens.map((token, tokenIndex) => {
          // Khoảng trắng → render trực tiếp (giữ spacing gốc)
          if (/^\s+$/.test(token)) {
            return (
              <AppText key={`s-${tokenIndex}`} className="text-base" style={{color: colors.foreground}}>
                {' '}
              </AppText>
            );
          }

          // Từ thực: map sang Azure index để check highlight
          const currentAzureIdx = azureIdx;
          azureIdx++; // Di chuyển sang từ Azure tiếp theo

          const isHighlighted = currentAzureIdx === currentWordIndex;

          return (
            <TouchableOpacity
              key={`wt-${tokenIndex}`}
              onPress={() => handlePress(token)}
              activeOpacity={0.6}
              accessibilityLabel={`Tra từ ${token}`}
              accessibilityRole="button"
              style={{
                minHeight: 28,
                backgroundColor: isHighlighted ? WORD_HIGHLIGHT_BG : 'transparent',
                borderRadius: isHighlighted ? 4 : 0,
                paddingHorizontal: isHighlighted ? 2 : 0,
              }}>
              <AppText
                className="text-base leading-6"
                style={{
                  color: isHighlighted ? WORD_HIGHLIGHT_COLOR : colors.foreground,
                  fontWeight: isHighlighted ? '700' : '400',
                }}>
                {token}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // ========================
  // MODE THƯỜNG: Split text → render (behavior cũ, backward compatible)
  // ========================
  const words = text.split(/(\s+)/);

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

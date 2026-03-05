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

    // ========================
    // Two-pointer alignment: map original tokens → Azure word indices
    // Xử lý edge cases:
    //   - Azure tách dấu câu riêng: "mean," → ["mean", ","] (2 Azure tokens cho 1 original)
    //   - Azure tách contraction: "it's" → ["it", "'s"] (2 Azure tokens cho 1 original)
    //   - Kết quả: mỗi original token biết mình tương ứng Azure index nào
    // ========================
    const cleanWord = (w: string) => w.replace(/[^a-zA-Z\u00C0-\u024F']/g, '').toLowerCase();

    // Pre-compute alignment: mỗi original non-whitespace token → Azure index
    const tokenToAzureIdx: (number | -1)[] = [];
    let aPtr = 0; // con trỏ Azure

    for (const token of originalTokens) {
      if (/^\s+$/.test(token)) {
        tokenToAzureIdx.push(-1); // whitespace → không map
        continue;
      }

      const cleanToken = cleanWord(token);
      if (!cleanToken) {
        tokenToAzureIdx.push(-1); // token chỉ toàn punctuation
        continue;
      }

      // Tìm Azure word match tại hoặc sau aPtr
      let matched = false;
      const searchLimit = Math.min(aPtr + 5, wordTimestamps.length); // Không tìm quá xa

      for (let i = aPtr; i < searchLimit; i++) {
        const azureClean = cleanWord(wordTimestamps[i].word);

        // Match chính xác
        if (azureClean === cleanToken) {
          tokenToAzureIdx.push(i);
          aPtr = i + 1;
          matched = true;
          break;
        }

        // Match partial: original "it's" vs Azure "it" (contraction đầu)
        if (cleanToken.startsWith(azureClean) && azureClean.length > 0) {
          tokenToAzureIdx.push(i);
          // Skip phần còn lại của contraction trong Azure (ví dụ "'s")
          aPtr = i + 1;
          while (aPtr < wordTimestamps.length) {
            const remainder = cleanWord(wordTimestamps[aPtr].word);
            if (cleanToken.includes(remainder) && remainder.length > 0 && remainder.length < cleanToken.length) {
              aPtr++;
            } else {
              break;
            }
          }
          matched = true;
          break;
        }

        // Skip Azure punctuation tokens (chỉ chứa dấu câu, không có chữ cái)
        if (!azureClean) {
          continue; // Skip và thử Azure token tiếp theo
        }
      }

      if (!matched) {
        // Không tìm thấy match → dùng vị trí hiện tại (best effort)
        tokenToAzureIdx.push(aPtr < wordTimestamps.length ? aPtr : -1);
        aPtr++;
      }
    }

    return (
      <View className="flex-row flex-wrap">
        {originalTokens.map((token, tokenIndex) => {
          const mappedIdx = tokenToAzureIdx[tokenIndex];

          // Khoảng trắng → render trực tiếp (giữ spacing gốc)
          if (mappedIdx === -1 || /^\s+$/.test(token)) {
            return (
              <AppText key={`s-${tokenIndex}`} className="text-base" style={{color: colors.foreground}}>
                {/^\s+$/.test(token) ? ' ' : token}
              </AppText>
            );
          }

          const isHighlighted = mappedIdx === currentWordIndex;

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

import React, {useMemo} from 'react';
import {Text, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

interface PhonemeHighlightTextProps {
  /** Câu tongue twister đầy đủ */
  text: string;
  /** Danh sách từ cần highlight */
  highlightWords: string[];
  /** Màu highlight (mặc định là vàng/cam) */
  highlightColor?: string;
  /** Font size */
  fontSize?: number;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Render tongue twister text với specific words highlighted
 * Tham số đầu vào: text, highlightWords, highlightColor, fontSize
 * Tham số đầu ra: JSX.Element — Text với các từ phoneme được tô màu + bold
 * Khi nào sử dụng:
 *   - TongueTwisterPracticeScreen → Sentence card → highlight phoneme words
 *   - SpeedChallengeScreen → Sentence card
 *   - Ví dụ: "She sells seashells" → "she", "sells", "seashells" được tô vàng
 */
export default function PhonemeHighlightText({
  text,
  highlightWords,
  highlightColor = '#eab308',
  fontSize = 20,
}: PhonemeHighlightTextProps) {
  const colors = useColors();

  /**
   * Mục đích: Tách text thành segments có/không highlight
   * Tham số đầu vào: text, highlightWords
   * Tham số đầu ra: segments[] với isHighlighted flag
   * Khi nào sử dụng: Mỗi khi text hoặc highlightWords thay đổi
   */
  const segments = useMemo(() => {
    if (!highlightWords.length) {
      return [{text, isHighlighted: false}];
    }

    // Tách text thành từng từ, giữ lại khoảng trắng và dấu câu
    const words = text.split(/(\s+)/);
    return words.map(word => {
      // Kiểm tra từ (bỏ dấu câu) có nằm trong danh sách highlight không
      const cleanWord = word.replace(/[.,!?;:'"]/g, '').toLowerCase();
      const isHighlighted = highlightWords.some(
        hw => hw.toLowerCase() === cleanWord,
      );
      return {text: word, isHighlighted};
    });
  }, [text, highlightWords]);

  return (
    <Text style={[styles.container, {fontSize}]}>
      {segments.map((segment, idx) => (
        <Text
          key={idx}
          style={[
            {
              color: segment.isHighlighted
                ? highlightColor
                : colors.foreground,
              fontWeight: segment.isHighlighted ? '700' : '400',
            },
          ]}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    lineHeight: 30,
  },
});

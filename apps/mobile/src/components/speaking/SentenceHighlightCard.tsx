import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface SentenceHighlightCardProps {
  /** Câu tiếng Anh */
  text: string;
  /** Phiên âm IPA */
  ipa?: string;
  /** Vị trí highlight hiện tại (word index, -1 = chưa highlight) */
  highlightIndex?: number;
  /** Glassmorphism variant */
  variant?: 'default' | 'compact';
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card glassmorphism hiển thị câu tiếng Anh + IPA, highlight từng từ
 * Tham số đầu vào: text, ipa, highlightIndex, variant
 * Tham số đầu ra: JSX.Element — card với text + IPA + word highlight
 * Khi nào sử dụng:
 *   - ShadowingSessionScreen Phase 1 (Preview): hiện câu mẫu, highlight theo audio timing
 *   - ShadowingSessionScreen Phase 2 (Shadow): hiện câu đang shadow
 *   - ShadowingFeedbackScreen: hiện câu vừa practice
 */
export default function SentenceHighlightCard({
  text,
  ipa,
  highlightIndex = -1,
  variant = 'default',
}: SentenceHighlightCardProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Tách câu thành từng từ
  const words = useMemo(() => text.split(/\s+/).filter(w => w.length > 0), [text]);

  const isCompact = variant === 'compact';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.glassBg,
          borderColor: colors.glassBorderStrong,
          padding: isCompact ? 12 : 20,
        },
      ]}>
      {/* Text với highlight */}
      <View style={styles.textContainer}>
        {words.map((word, index) => {
          const isHighlighted = index === highlightIndex;
          const isPast = highlightIndex >= 0 && index < highlightIndex;

          return (
            <AppText
              key={`${word}-${index}`}
              style={[
                styles.wordText,
                {
                  fontSize: isCompact ? 16 : 20,
                  color: isHighlighted
                    ? speakingColor
                    : isPast
                      ? colors.foreground
                      : highlightIndex >= 0
                        ? colors.neutrals500
                        : colors.foreground,
                  fontWeight: isHighlighted ? '700' : '500',
                  // Highlight effect
                  ...(isHighlighted && {
                    textDecorationLine: 'underline',
                    textDecorationColor: speakingColor,
                  }),
                },
              ]}
              raw>
              {word}{' '}
            </AppText>
          );
        })}
      </View>

      {/* IPA */}
      {ipa && (
        <AppText
          style={[
            styles.ipaText,
            {
              color: colors.neutrals400,
              fontSize: isCompact ? 11 : 13,
              marginTop: isCompact ? 6 : 10,
            },
          ]}
          raw>
          {ipa}
        </AppText>
      )}
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordText: {
    lineHeight: 32,
  },
  ipaText: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

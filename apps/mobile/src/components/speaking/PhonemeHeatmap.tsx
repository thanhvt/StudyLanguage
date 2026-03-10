import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

interface WordScore {
  /** Từ */
  word: string;
  /** Điểm 0-100 */
  score: number;
  /** Lỗi cụ thể (nếu có) */
  issue?: string;
  /** Phonemes IPA (nếu có) */
  phonemes?: string;
}

interface PhonemeHeatmapProps {
  /** Danh sách từ + điểm */
  words: WordScore[];
  /** Callback khi user chạm vào từ — gọi TTS phát âm từ đó */
  onWordTap?: (word: string) => void;
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Lấy màu text/underline dựa trên điểm
 * Tham số đầu vào: score (0-100)
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: Tô màu chữ và underline cho mỗi từ
 */
function getWordColor(score: number): string {
  if (score >= 80) return '#22c55e'; // Xanh lá — tốt
  if (score >= 60) return '#f59e0b'; // Vàng cam — trung bình
  return '#ef4444'; // Đỏ — yếu
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị phân tích từng từ — inline words với score% bên dưới
 * Tham số đầu vào: words — {word, score, issue}[]
 * Tham số đầu ra: JSX.Element — inline word grid + heatmap bar
 * Khi nào sử dụng:
 *   - FeedbackScreen: phân tích word-by-word
 *   - ShadowingFeedbackScreen: kết quả shadow
 */
export default function PhonemeHeatmap({words, onWordTap}: PhonemeHeatmapProps) {
  const colors = useColors();
  // Từ đang được phát âm (visual feedback)
  const [activeWord, setActiveWord] = useState<string | null>(null);

  if (!words || words.length === 0) return null;

  /**
   * Mục đích: Xử lý khi user chạm vào 1 từ trong heatmap
   * Tham số đầu vào: word (string) — từ được chạm
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào từ → phát TTS
   */
  const handleTap = (word: string) => {
    // Loại bỏ dấu chấm câu để TTS phát âm đúng
    const cleanWord = word.replace(/[^a-zA-Z'\-]/g, '');
    if (!cleanWord) return;

    setActiveWord(cleanWord);
    onWordTap?.(cleanWord);
    // Tắt highlight sau 1.5s
    setTimeout(() => setActiveWord(null), 1500);
  };

  // Tìm các từ có điểm thấp nhất để hiển thị trong phoneme issues
  const lowScoreWords = words
    .filter(w => w.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Header */}
      <AppText variant="body" weight="semibold" style={{color: colors.foreground, marginBottom: 12}} raw>
        Phân tích từng từ
      </AppText>

      {/* Inline words — mỗi từ có text + score% bên dưới */}
      <View style={styles.wordGrid}>
        {words.map((w, i) => {
          const wordColor = getWordColor(w.score);
          const isActive = activeWord === w.word.replace(/[^a-zA-Z'\-]/g, '');
          return (
            <TouchableOpacity
              key={`${w.word}-${i}`}
              activeOpacity={0.7}
              onPress={() => handleTap(w.word)}
              style={[
                styles.wordItem,
                isActive && {backgroundColor: `${wordColor}15`, borderRadius: 8},
              ]}>
              {/* Từ — underline nếu điểm < 70 (lỗi cần chú ý) */}
              <AppText
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: wordColor,
                  textDecorationLine: w.score < 70 ? 'underline' : 'none',
                  textDecorationColor: wordColor,
                }}
                raw>
                {w.word}
              </AppText>
              {/* Score % */}
              <AppText
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: wordColor,
                  marginTop: 2,
                }}
                raw>
                {w.score}%
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hint text */}
      <AppText variant="caption" style={{textAlign: 'center', color: colors.neutrals400, marginTop: 10}} raw>
        Chạm vào từ để nghe phát âm chuẩn
      </AppText>

      {/* Phoneme Heatmap bar — gradient Yếu → Tốt */}
      <View style={styles.heatmapSection}>
        <AppText variant="body" weight="semibold" style={{color: colors.foreground, marginBottom: 8}} raw>
          Phoneme Heatmap
        </AppText>
        <View style={styles.gradientRow}>
          <View style={styles.gradient}>
            {['#ef4444', '#fb923c', '#f59e0b', '#facc15', '#a3e635', '#4ade80', '#22c55e'].map(
              (c, i) => (
                <View key={i} style={{flex: 1, height: 8, backgroundColor: c}} />
              ),
            )}
          </View>
        </View>

        {/* Phoneme issues — hiển thị các âm cần cải thiện */}
        {lowScoreWords.length > 0 && (
          <View style={styles.phonemeIssues}>
            {lowScoreWords.map((w, i) => (
              <View key={i} style={[styles.phonemeBadge, {backgroundColor: `${getWordColor(w.score)}20`}]}>
                <View style={[styles.phonemeDot, {backgroundColor: getWordColor(w.score)}]} />
                <AppText style={{fontSize: 12, fontWeight: '600', color: colors.foreground}} raw>
                  {w.phonemes || w.word} {w.score}%
                </AppText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  wordItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heatmapSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  gradientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  phonemeIssues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  phonemeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  phonemeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

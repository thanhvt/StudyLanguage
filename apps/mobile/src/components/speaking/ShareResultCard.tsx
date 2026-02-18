import React, {useRef} from 'react';
import {View, StyleSheet, Share, Platform} from 'react-native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface ShareResultCardProps {
  /** Điểm tổng */
  score: number;
  /** Câu đã luyện */
  sentence: string;
  /** Sub-scores */
  pronunciation: number;
  fluency: number;
  pace: number;
  /** Ngày */
  date?: string;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card kết quả có thể share dưới dạng text/ảnh
 * Tham số đầu vào: score, sentence, pronunciation, fluency, pace, date
 * Tham số đầu ra: JSX.Element — card + nút share
 * Khi nào sử dụng:
 *   - FeedbackScreen: sau khi xem kết quả → share
 *   - RecordingHistoryScreen: share kết quả cũ
 */
export default function ShareResultCard({
  score,
  sentence,
  pronunciation,
  fluency,
  pace,
  date,
}: ShareResultCardProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  /**
   * Mục đích: Lấy emoji + label theo score
   * Tham số đầu vào: s (number 0-100)
   * Tham số đầu ra: { emoji, label }
   * Khi nào sử dụng: Hiển thị đánh giá
   */
  const getScoreLabel = (s: number) => {
    if (s >= 90) return {emoji: '🎉', label: 'Xuất sắc!'};
    if (s >= 75) return {emoji: '👏', label: 'Tốt lắm!'};
    if (s >= 60) return {emoji: '💪', label: 'Khá ổn!'};
    return {emoji: '📖', label: 'Cần cải thiện'};
  };

  const info = getScoreLabel(score);

  /**
   * Mục đích: Share kết quả qua hệ thống share native
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút Share
   */
  const handleShare = async () => {
    try {
      const message = [
        `${info.emoji} Kết quả luyện nói: ${score}/100`,
        `📝 "${sentence}"`,
        `🎯 Phát âm: ${pronunciation} | 💬 Trôi chảy: ${fluency} | ⚡ Tốc độ: ${pace}`,
        `📱 StudyLanguage App`,
      ].join('\n');

      await Share.share({
        message,
        title: 'Kết quả luyện nói',
      });
      console.log('📤 [Share] Đã mở dialog share');
    } catch (err) {
      console.error('❌ [Share] Lỗi share:', err);
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: colors.surface}]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="body" weight="semibold" className="text-foreground" raw>
          {info.emoji} {info.label}
        </AppText>
        {date && (
          <AppText variant="caption" className="text-neutrals400" raw>
            {date}
          </AppText>
        )}
      </View>

      {/* Score */}
      <View style={styles.scoreRow}>
        <AppText variant="heading1" weight="bold" style={{color: speakingColor, fontSize: 44}} raw>
          {score}
        </AppText>
        <AppText variant="bodySmall" className="text-neutrals400 ml-1" raw>
          / 100
        </AppText>
      </View>

      {/* Sentence */}
      <AppText variant="body" className="text-foreground mb-3" numberOfLines={2} raw>
        📝 "{sentence}"
      </AppText>

      {/* Sub-scores */}
      <View style={styles.subScores}>
        {[
          {label: 'Phát âm', value: pronunciation, icon: '🎯'},
          {label: 'Trôi chảy', value: fluency, icon: '💬'},
          {label: 'Tốc độ', value: pace, icon: '⚡'},
        ].map(s => (
          <View key={s.label} style={[styles.subItem, {backgroundColor: `${speakingColor}10`}]}>
            <AppText variant="caption" raw>{s.icon} {s.label}</AppText>
            <AppText variant="body" weight="bold" style={{color: speakingColor}} raw>
              {s.value}
            </AppText>
          </View>
        ))}
      </View>

      {/* Share button */}
      <AppButton
        variant="outline"
        size="default"
        onPress={handleShare}
        icon={<Icon name="Share2" className="w-4 h-4 text-foreground" />}>
        Chia sẻ kết quả
      </AppButton>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  subScores: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    gap: 2,
  },
});

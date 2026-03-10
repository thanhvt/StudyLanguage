import React, {useCallback} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {getConversationColor} from '@/config/skillColors';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Helper
// =======================

/**
 * Mục đích: Format thời gian seconds → chuỗi dễ đọc
 * Tham số đầu vào: seconds (number)
 * Tham số đầu ra: string
 * Khi nào sử dụng: Hiển thị tổng thời gian session
 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m} phút ${s > 0 ? `${s}s` : ''}`;
  return `${s} giây`;
}

/**
 * Mục đích: Lấy emoji grade dựa trên điểm
 * Tham số đầu vào: grade (string)
 * Tham số đầu ra: string (emoji)
 * Khi nào sử dụng: Hiển thị grade badge
 */
function gradeEmoji(grade: string): string {
  const map: Record<string, string> = {
    'A+': '🏆', A: '🥇', 'B+': '🥈', B: '🥉',
    'C+': '⭐', C: '👍', D: '💪', F: '📚',
  };
  return map[grade] ?? '📊';
}

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình tổng kết sau khi kết thúc AI Conversation session
 * Tham số đầu vào: không có (đọc state từ useSpeakingStore)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConversationScreen → session kết thúc → navigate SessionSummary
 *   Hiển thị stats + pronunciation + grammar + AI feedback + action buttons
 */
export default function SessionSummaryScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();

  // Store
  const setup = useSpeakingStore(s => s.conversationSetup);
  const summary = useSpeakingStore(s => s.conversationSummary);
  const resetConversation = useSpeakingStore(s => s.resetConversation);

  const mode = setup?.mode ?? 'free-talk';
  const accentColor = getConversationColor(mode);

  /**
   * Mục đích: Quay lại Setup để luyện lại
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Luyện lại"
   */
  const handleRetry = useCallback(() => {
    resetConversation();
    navigation.navigate('ConversationSetup');
  }, [resetConversation, navigation]);

  /**
   * Mục đích: Quay về Speaking Home
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Về Home"
   */
  const handleGoHome = useCallback(() => {
    resetConversation();
    navigation.navigate('Config');
  }, [resetConversation, navigation]);

  if (!summary) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.emptyState}>
          <AppText variant="body" style={{color: colors.neutrals400}} raw>
            Đang tải kết quả...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>

        {/* Header */}
        <View style={styles.headerSection}>
          <AppText variant="heading2" weight="bold" style={{textAlign: 'center'}} raw>
            🎉 Chúc mừng!
          </AppText>
          <AppText variant="body" style={{color: colors.neutrals400, textAlign: 'center', marginTop: 4}} raw>
            Bạn đã hoàn thành session {mode === 'free-talk' ? 'Free Talk' : 'Roleplay'}
          </AppText>

          {/* Scenario Badge — Roleplay only */}
          {summary.scenarioBadge && (
            <View style={[styles.scenarioBadge, {backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40`}]}>
              <AppText variant="caption" weight="bold" style={{color: accentColor}} raw>
                🎭 {summary.scenarioBadge}
              </AppText>
            </View>
          )}
        </View>

        {/* Stats Card Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText variant="heading3" weight="bold" style={{color: accentColor}} raw>
              {formatDuration(summary.totalTime)}
            </AppText>
            <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 2}} raw>
              Thời gian
            </AppText>
          </View>

          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText variant="heading3" weight="bold" style={{color: accentColor}} raw>
              {summary.totalTurns}
            </AppText>
            <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 2}} raw>
              Lượt nói
            </AppText>
          </View>

          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText variant="heading3" weight="bold" style={{color: accentColor}} raw>
              {gradeEmoji(summary.grade)} {summary.grade}
            </AppText>
            <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 2}} raw>
              Xếp loại
            </AppText>
          </View>
        </View>

        {/* Overall Score */}
        <View style={[styles.scoreCard, {backgroundColor: `${accentColor}10`, borderColor: `${accentColor}25`}]}>
          <AppText variant="caption" weight="semibold" style={{color: accentColor}} raw>
            ĐIỂM TỔNG
          </AppText>
          <AppText variant="heading1" weight="bold" style={{color: accentColor, fontSize: 48}} raw>
            {summary.overallScore}
          </AppText>
          <AppText variant="caption" style={{color: colors.neutrals400}} raw>
            /100
          </AppText>
        </View>

        {/* Pronunciation Issues */}
        {summary.pronunciationIssues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="Volume2" className="w-4 h-4" style={{color: '#EA580C'}} />
              <AppText variant="body" weight="bold" style={{marginLeft: 6}} raw>
                Phát âm cần cải thiện
              </AppText>
            </View>
            {summary.pronunciationIssues.map((issue, idx) => (
              <View key={`pronun-${idx}`} style={[styles.issueRow, {backgroundColor: colors.surface}]}>
                <View style={{flex: 1}}>
                  <AppText variant="body" weight="semibold" raw>
                    {issue.word}
                  </AppText>
                  <AppText variant="caption" style={{color: colors.neutrals400}} raw>
                    {issue.ipa}
                  </AppText>
                </View>
                <View style={[
                  styles.scoreBadge,
                  {backgroundColor: issue.accuracy >= 70 ? '#22C55E20' : '#EF444420'},
                ]}>
                  <AppText
                    variant="bodySmall"
                    weight="bold"
                    style={{color: issue.accuracy >= 70 ? '#22C55E' : '#EF4444'}}
                    raw>
                    {issue.accuracy}%
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Grammar Fixes */}
        {summary.grammarFixes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="PenLine" className="w-4 h-4" style={{color: '#3B82F6'}} />
              <AppText variant="body" weight="bold" style={{marginLeft: 6}} raw>
                Sửa ngữ pháp ({summary.grammarFixes.length})
              </AppText>
            </View>
            {summary.grammarFixes.map((fix, idx) => (
              <View key={`grammar-${idx}`} style={[styles.fixRow, {backgroundColor: colors.surface}]}>
                <AppText variant="bodySmall" raw>
                  <AppText variant="bodySmall" style={{textDecorationLine: 'line-through', color: '#EF4444'}} raw>
                    {fix.original}
                  </AppText>
                  {' → '}
                  <AppText variant="bodySmall" weight="semibold" style={{color: '#22C55E'}} raw>
                    {fix.correction}
                  </AppText>
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* AI Feedback */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="MessageCircle" className="w-4 h-4" style={{color: accentColor}} />
            <AppText variant="body" weight="bold" style={{marginLeft: 6}} raw>
              Nhận xét AI
            </AppText>
          </View>
          <View style={[styles.feedbackCard, {backgroundColor: `${accentColor}08`, borderColor: `${accentColor}20`}]}>
            <AppText variant="body" style={{color: colors.foreground, lineHeight: 22}} raw>
              {summary.aiFeedback}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons — sticky bottom */}
      <View style={[styles.footer, {borderTopColor: colors.glassBorder, backgroundColor: colors.background}]}>
        <View style={styles.actionRow}>
          <AppButton
            variant="default"
            size="lg"
            style={{flex: 1, backgroundColor: colors.surface}}
            onPress={handleGoHome}>
            🏠 Về Home
          </AppButton>
          <AppButton
            variant="primary"
            size="lg"
            style={{flex: 1, backgroundColor: accentColor}}
            onPress={handleRetry}>
            🔄 Luyện lại
          </AppButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scenarioBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fixRow: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

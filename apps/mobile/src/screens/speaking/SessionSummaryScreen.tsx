import React, {useCallback, useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
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
import {saveSpeakingSession} from '@/services/speaking/saveSpeakingSession';
import type {ConversationSessionData} from '@/services/speaking/saveSpeakingSession';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// Mảng rỗng stable — tránh tạo mới mỗi render gây infinite loop Zustand
const EMPTY_MESSAGES: never[] = [];

// =======================
// Helper
// =======================

/**
 * Mục đích: Format thời gian seconds → m:ss
 * Tham số đầu vào: seconds (number)
 * Tham số đầu ra: string (m:ss)
 * Khi nào sử dụng: Stat card hiển thị tổng thời gian
 */
function formatDurationCard(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Mục đích: Lấy màu badge dựa trên accuracy %
 * Tham số đầu vào: accuracy (number)
 * Tham số đầu ra: {bg: string, text: string}
 * Khi nào sử dụng: Pronunciation issue row
 */
function getAccuracyColors(accuracy: number): {bg: string; text: string} {
  if (accuracy >= 70) return {bg: '#22C55E20', text: '#22C55E'};
  if (accuracy >= 50) return {bg: '#F59E0B20', text: '#F59E0B'};
  return {bg: '#EF444420', text: '#EF4444'};
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
  // BUG-H02 FIX: Đọc messages từ conversationSession (trước khi reset)
  // BUG-H10 FIX: Trả stable ref EMPTY_MESSAGES thay vì `?? []` — tránh infinite loop
  const conversationMessages = useSpeakingStore(s => s.conversationSession?.messages ?? EMPTY_MESSAGES);
  const resetConversation = useSpeakingStore(s => s.resetConversation);

  const mode = setup?.mode ?? 'free-talk';
  const accentColor = getConversationColor(mode);

  // Auto-save vào history khi summary screen mount (fire-and-forget)
  const savedRef = useRef(false);
  // BUG-H09 FIX: Ref giữ data mới nhất — tránh object deps
  const setupRef = useRef(setup);
  const summaryRef = useRef(summary);
  const messagesRef = useRef(conversationMessages);
  useEffect(() => { setupRef.current = setup; }, [setup]);
  useEffect(() => { summaryRef.current = summary; }, [summary]);
  useEffect(() => { messagesRef.current = conversationMessages; }, [conversationMessages]);

  // BUG-H09 FIX: Boolean dep thay vì object dep
  const hasSummary = !!summary;
  useEffect(() => {
    if (savedRef.current || !hasSummary) return;
    savedRef.current = true;
    const s = summaryRef.current!;
    const st = setupRef.current;
    const msgs = messagesRef.current;

    const sessionData: ConversationSessionData = {
      topic: st?.topicName ?? 'AI Conversation',
      subMode: mode as 'free-talk' | 'roleplay',
      // BUG-H02 FIX: Đọc messages thực tế từ conversationSession store
      messages: msgs.map(m => ({
        role: (m.role === 'ai' ? 'assistant' : m.role) as 'user' | 'assistant',
        content: m.text,
      })),
      pronunciationAlerts: s.pronunciationIssues?.map((p: any) => ({
        word: p.word,
        ipa: p.ipa,
        tip: p.tip ?? '',
      })) ?? [],
      grammarCorrections: s.grammarFixes?.map((g: any) => ({
        wrong: g.original,
        correct: g.correction,
        explanation: g.explanation ?? '',
      })) ?? [],
      summary: {
        totalTurns: s.totalTurns ?? 0,
        score: s.overallScore ?? 0,
        aiNotes: s.aiFeedback ?? '',
      },
      durationSeconds: s.totalTime ?? 0,
      persona: st?.persona
        ? {name: st.persona.name, role: st.persona.role}
        : undefined,
      difficulty: st?.difficulty,
    };
    saveSpeakingSession(
      mode === 'roleplay' ? 'conversation-roleplay' : 'conversation-freetalk',
      sessionData,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSummary, mode]);

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
    navigation.navigate('SpeakingHome');
  }, [resetConversation, navigation]);

  /**
   * Mục đích: Chia sẻ kết quả
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Chia sẻ"
   */
  const handleShare = useCallback(() => {
    // TODO: Implement capture card → share sheet
    console.log('📤 [SessionSummary] Chia sẻ kết quả');
  }, []);

  // Fallback nếu summary chưa load (EC-09)
  if (!summary) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.emptyState}>
          <Icon name="Loader" className="w-8 h-8" style={{color: colors.neutrals400, marginBottom: 12}} />
          <AppText variant="body" style={{color: colors.neutrals400}} raw>
            Đang tạo tổng kết...
          </AppText>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <AppText variant="body" weight="semibold" style={{color: accentColor}} raw>
              ← Quay lại
            </AppText>
          </TouchableOpacity>
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

        {/* Header — "Tổng kết" + back button (UI-07) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleGoHome} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="ChevronLeft" className="w-6 h-6 text-foreground" />
          </TouchableOpacity>
          <AppText variant="heading2" weight="bold" raw>
            Tổng kết
          </AppText>
          <View style={{width: 24}} />
        </View>

        {/* Confetti placeholder — emoji fallback (UI-07) */}
        <View style={styles.confettiRow}>
          <AppText style={{fontSize: 20}} raw>
            🎉🎊✨🎉🎊✨🎉🎊✨
          </AppText>
        </View>

        {/* Stats Card Row (UI-08: mm:ss format) */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText variant="caption" style={{color: colors.neutrals400}} raw>
              Thời gian
            </AppText>
            <AppText variant="heading3" weight="bold" style={{color: accentColor, marginTop: 4}} raw>
              {formatDurationCard(summary.totalTime)}
            </AppText>
          </View>

          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText variant="caption" style={{color: colors.neutrals400}} raw>
              Lượt nói
            </AppText>
            <AppText variant="heading3" weight="bold" style={{color: accentColor, marginTop: 4}} raw>
              {summary.totalTurns} lượt
            </AppText>
          </View>

          <View style={[styles.statCard, {backgroundColor: `${accentColor}15`}]}>
            <AppText variant="caption" style={{color: colors.neutrals400}} raw>
              Điểm {summary.grade}
            </AppText>
            <AppText variant="heading3" weight="bold" style={{color: accentColor, marginTop: 4}} raw>
              {summary.overallScore}/100
            </AppText>
          </View>
        </View>

        {/* Pronunciation Issues (UI-09: play button) */}
        {summary.pronunciationIssues.length > 0 && (
          <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
            <AppText variant="body" weight="bold" style={{marginBottom: 10}} raw>
              Phát âm cần cải thiện
            </AppText>
            {summary.pronunciationIssues.map((issue, idx) => {
              const accColors = getAccuracyColors(issue.accuracy);
              return (
                <View key={`pronun-${idx}`} style={styles.issueRow}>
                  {/* Accuracy badge */}
                  <View style={[styles.accuracyBadge, {backgroundColor: accColors.bg}]}>
                    <AppText variant="caption" weight="bold" style={{color: accColors.text}} raw>
                      {issue.accuracy}%
                    </AppText>
                  </View>
                  {/* Word + IPA */}
                  <View style={{flex: 1, marginLeft: 8}}>
                    <AppText variant="body" weight="semibold" raw>
                      {issue.word}
                    </AppText>
                    <AppText variant="caption" style={{color: colors.neutrals400}} raw>
                      {issue.ipa}
                    </AppText>
                  </View>
                  {/* Play button (UI-09) */}
                  <TouchableOpacity
                    style={[styles.playBtn, {backgroundColor: `${accentColor}15`}]}
                    onPress={() => console.log('🔊 Phát mẫu:', issue.word)}
                    activeOpacity={0.7}>
                    <Icon name="Volume2" className="w-4 h-4" style={{color: accentColor}} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Grammar Fixes */}
        {summary.grammarFixes.length > 0 && (
          <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
            <AppText variant="body" weight="bold" style={{marginBottom: 10}} raw>
              Sửa ngữ pháp
            </AppText>
            {summary.grammarFixes.map((fix, idx) => (
              <View key={`grammar-${idx}`} style={styles.fixRow}>
                <AppText variant="bodySmall" raw>
                  <AppText variant="bodySmall" style={{color: '#EF4444'}} raw>
                    ✗{' '}
                  </AppText>
                  <AppText variant="bodySmall" style={{textDecorationLine: 'line-through', color: '#EF4444'}} raw>
                    {fix.original}
                  </AppText>
                  {' → '}
                  <AppText variant="bodySmall" style={{color: '#22C55E'}} raw>
                    ✅ {fix.correction}
                  </AppText>
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* AI Feedback */}
        <View style={[styles.sectionCard, {backgroundColor: `${accentColor}08`, borderColor: `${accentColor}20`, borderWidth: 1}]}>
          <View style={styles.sectionHeader}>
            <AppText style={{fontSize: 18, marginRight: 6}} raw>🤖</AppText>
            <AppText variant="body" weight="bold" raw>
              AI Feedback
            </AppText>
          </View>
          <AppText variant="body" style={{color: colors.foreground, lineHeight: 22, marginTop: 8}} raw>
            {summary.aiFeedback}
          </AppText>
        </View>

        {/* Scenario Badge — Roleplay only */}
        {summary.scenarioBadge && (
          <View style={[styles.scenarioBadgeRow]}>
            <AppText variant="body" style={{color: colors.foreground}} raw>
              🤖 Hoàn thành: {summary.scenarioBadge} ✅
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons — 3 buttons (UI-06) */}
      <View style={[styles.footer, {borderTopColor: colors.glassBorder, backgroundColor: colors.background}]}>
        <View style={styles.actionRow}>
          <AppButton
            variant="outline"
            size="lg"
            style={{flex: 1}}
            onPress={handleShare}>
            📤 Chia sẻ
          </AppButton>
          <AppButton
            variant="outline"
            size="lg"
            style={{flex: 1}}
            onPress={handleRetry}>
            🔄 Luyện lại
          </AppButton>
          <AppButton
            variant="primary"
            size="lg"
            style={{flex: 1, backgroundColor: accentColor}}
            onPress={handleGoHome}>
            Về Home
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  confettiRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  sectionCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accuracyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 48,
    alignItems: 'center',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixRow: {
    paddingVertical: 4,
  },
  scenarioBadgeRow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

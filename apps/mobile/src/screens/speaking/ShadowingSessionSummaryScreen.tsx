import React, {useMemo, useCallback, useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {SKILL_COLORS} from '@/config/skillColors';
import {useShadowingStore} from '@/store/useShadowingStore';
import {calculateGrade} from '@/services/api/speaking';
import {ScoreRing} from '@/components/speaking';
import {saveSpeakingSession} from '@/services/speaking/saveSpeakingSession';
import type {ShadowingSessionData} from '@/services/speaking/saveSpeakingSession';

// =======================
// Component
// =======================

/**
 * Mục đích: Tổng kết session Shadowing — hiển thị avg score, thời gian, tips
 * Tham số đầu vào: không (đọc từ useShadowingStore.sessionResults)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - ShadowingFeedbackScreen: câu cuối → nhấn "Xem tổng kết" → navigate tới đây
 *   - Hoặc user nhấn "Kết thúc" bất cứ lúc nào
 */
export default function ShadowingSessionSummaryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const colors = useColors();
  const haptic = useHaptic();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Store
  const sessionResults = useShadowingStore(s => s.sessionResults);
  const config = useShadowingStore(s => s.config);
  const reset = useShadowingStore(s => s.reset);

  // Auto-save vào history khi summary screen mount (fire-and-forget)
  const savedRef = useRef(false);
  // BUG-H06 FIX: Track thời gian thực tế thay vì ước tính
  const sessionStartRef = useRef(Date.now());
  useEffect(() => {
    if (savedRef.current || sessionResults.length === 0) return;
    savedRef.current = true;

    const sessionData: ShadowingSessionData = {
      topic: config.topic?.name ?? 'Shadowing',
      sentences: sessionResults.map(r => ({text: r.text})),
      scores: sessionResults.map((r, i) => ({
        sentenceIndex: i,
        rhythm: r.score.rhythm,
        intonation: r.score.intonation,
        accuracy: r.score.accuracy,
        overall: r.score.overall,
        tips: r.score.tips,
      })),
      speed: config.speed,
      // BUG-H06 FIX: Tính duration thực tế
      durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
    };
    saveSpeakingSession('shadowing', sessionData);
  }, [sessionResults, config]);

  // Tính avg scores
  const avgScores = useMemo(() => {
    if (sessionResults.length === 0) {
      return {rhythm: 0, intonation: 0, accuracy: 0, overall: 0};
    }
    const sum = sessionResults.reduce(
      (acc, r) => ({
        rhythm: acc.rhythm + r.score.rhythm,
        intonation: acc.intonation + r.score.intonation,
        accuracy: acc.accuracy + r.score.accuracy,
        overall: acc.overall + r.score.overall,
      }),
      {rhythm: 0, intonation: 0, accuracy: 0, overall: 0},
    );
    const count = sessionResults.length;
    return {
      rhythm: Math.round(sum.rhythm / count),
      intonation: Math.round(sum.intonation / count),
      accuracy: Math.round(sum.accuracy / count),
      overall: Math.round(sum.overall / count),
    };
  }, [sessionResults]);

  // Top tips (unique)
  const topTips = useMemo(() => {
    const allTips = sessionResults.flatMap(r => r.score.tips);
    const unique = [...new Set(allTips)];
    return unique.slice(0, 5);
  }, [sessionResults]);

  // Sentence-by-sentence results
  const sentenceScores = useMemo(() =>
    sessionResults.map(r => ({
      text: r.text.length > 40 ? r.text.substring(0, 40) + '...' : r.text,
      score: r.score.overall,
      grade: calculateGrade(r.score.overall),
    })),
  [sessionResults]);

  /**
   * Mục đích: Quay về Config screen (session mới)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Session mới"
   */
  const handleNewSession = useCallback(() => {
    haptic.medium();
    reset();
    // Pop tới Config screen
    navigation.popToTop();
  }, [haptic, reset, navigation]);

  /**
   * Mục đích: Quay về Speaking Home
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Về trang chủ"
   */
  const handleGoHome = useCallback(() => {
    haptic.medium();
    reset();
    // Pop toàn bộ stack
    navigation.popToTop();
    navigation.goBack();
  }, [haptic, reset, navigation]);

  const grade = calculateGrade(avgScores.overall);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{width: 24}} />
        <AppText style={{fontSize: 18, fontWeight: '700', color: colors.foreground}} raw>
          🏆 Tổng kết Session
        </AppText>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}>

        {/* ===== Overall Score ===== */}
        <View style={styles.overallSection}>
          <ScoreRing
            value={avgScores.overall}
            size={130}
            strokeWidth={10}
          />
          <AppText
            style={{fontSize: 28, fontWeight: '800', color: colors.foreground, marginTop: 12}}
            raw>
            {grade}
          </AppText>
          <AppText style={{fontSize: 14, color: colors.neutrals400, marginTop: 4}} raw>
            Điểm trung bình
          </AppText>
        </View>

        {/* ===== Stats Cards ===== */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText style={{fontSize: 24, fontWeight: '800', color: speakingColor}} raw>
              {sessionResults.length}
            </AppText>
            <AppText style={{fontSize: 11, color: colors.neutrals400, marginTop: 2}} raw>
              Câu đã luyện
            </AppText>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText style={{fontSize: 24, fontWeight: '800', color: speakingColor}} raw>
              {config.speed}x
            </AppText>
            <AppText style={{fontSize: 11, color: colors.neutrals400, marginTop: 2}} raw>
              Tốc độ
            </AppText>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
            <AppText style={{fontSize: 24, fontWeight: '800', color: speakingColor}} raw>
              {config.delay}s
            </AppText>
            <AppText style={{fontSize: 11, color: colors.neutrals400, marginTop: 2}} raw>
              Delay
            </AppText>
          </View>
        </View>

        {/* ===== Sub-scores ===== */}
        <View style={styles.subScoresRow}>
          <ScoreRing value={avgScores.rhythm} label="Nhịp điệu" icon="🎵" size={65} strokeWidth={5} />
          <ScoreRing value={avgScores.intonation} label="Ngữ điệu" icon="🎶" size={65} strokeWidth={5} />
          <ScoreRing value={avgScores.accuracy} label="Độ chính xác" icon="🎯" size={65} strokeWidth={5} />
        </View>

        {/* ===== Sentence-by-sentence ===== */}
        <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
          <AppText style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10}} raw>
            📋 Kết quả từng câu
          </AppText>
          {sentenceScores.map((item, i) => (
            <View key={i} style={styles.sentenceRow}>
              <View style={{flex: 1}}>
                <AppText style={{fontSize: 12, color: colors.neutrals300}} raw>
                  Câu {i + 1}
                </AppText>
                <AppText style={{fontSize: 13, color: colors.foreground, marginTop: 2}} numberOfLines={1} raw>
                  {item.text}
                </AppText>
              </View>
              <View style={{alignItems: 'center'}}>
                <AppText
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: item.score >= 70 ? '#22c55e' : item.score >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                  raw>
                  {item.score}
                </AppText>
                <AppText style={{fontSize: 10, color: colors.neutrals400}} raw>
                  {item.grade}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {/* ===== Tips ===== */}
        {topTips.length > 0 && (
          <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
            <AppText style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8}} raw>
              💡 Lời khuyên chung
            </AppText>
            {topTips.map((tip, i) => (
              <View key={i} style={{flexDirection: 'row', marginBottom: 4}}>
                <AppText style={{fontSize: 12, color: speakingColor, marginRight: 6}} raw>•</AppText>
                <AppText style={{fontSize: 13, color: colors.neutrals300, flex: 1, lineHeight: 20}} raw>
                  {tip}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ===== Bottom Actions ===== */}
      <View style={[styles.actions, {borderTopColor: colors.glassDivider, backgroundColor: colors.background}]}>
        <TouchableOpacity
          style={[styles.homeBtn, {borderColor: colors.glassBorderStrong}]}
          onPress={handleGoHome}
          activeOpacity={0.7}>
          <Icon name="House" className="w-5 h-5" style={{color: colors.foreground}} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.newSessionBtn, {backgroundColor: speakingColor}]}
          onPress={handleNewSession}
          activeOpacity={0.8}>
          <AppText style={{fontSize: 15, fontWeight: '700', color: '#FFF'}} raw>
            🔊 Session Mới
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  overallSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  subScoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  homeBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newSessionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

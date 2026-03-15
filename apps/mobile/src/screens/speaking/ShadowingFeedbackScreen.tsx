import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {SKILL_COLORS} from '@/config/skillColors';
import {useShadowingStore} from '@/store/useShadowingStore';
import type {SentenceResult} from '@/store/useShadowingStore';
import {useShadowingTrackPlayer} from '@/hooks/useShadowingTrackPlayer';
import {calculateGrade} from '@/services/api/speaking';
import {
  ScoreRing,
  SentenceHighlightCard,
} from '@/components/speaking';

// =======================
// Score Ring Colors (per mockup)
// =======================

/** Rhythm = vàng, Intonation = xanh lá, Accuracy = xanh dương-teal */
const SCORE_COLORS = {
  rhythm: '#FACC15',
  intonation: '#22C55E',
  accuracy: '#14B8A6',
};

// =======================
// Component
// =======================

/**
 * Mục đích: Màn hình feedback sau khi shadow 1 câu
 * Tham số đầu vào: không (đọc score từ useShadowingStore)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - ShadowingSessionScreen: sau evaluate → navigate tới đây
 *   - Hiển thị: overall score ring, breakdown, waveform comparison, playback compare, word issues, tips
 *   - Actions: "Shadow lại" / "Câu tiếp" / "Share"
 */
export default function ShadowingFeedbackScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const colors = useColors();
  const haptic = useHaptic();
  const insets = useSafeAreaInsets();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Store
  const score = useShadowingStore(s => s.score);
  const session = useShadowingStore(s => s.session);
  const waveform = useShadowingStore(s => s.waveform);
  const repeatSentence = useShadowingStore(s => s.repeatSentence);
  const nextSentence = useShadowingStore(s => s.nextSentence);
  const addSessionResult = useShadowingStore(s => s.addSessionResult);

  // Track player cho playback compare
  const trackPlayer = useShadowingTrackPlayer();

  // State
  const [activePlayback, setActivePlayback] = useState<'ai' | 'user' | 'alternate' | null>(null);

  // Fix B5: useRef guard để tránh addSessionResult duplicate
  const hasAddedResult = useRef(false);

  const currentSentence = session.sentences[session.currentIndex];
  const scoreData = score.current;
  const isLastSentence = session.currentIndex >= session.totalSentences - 1;

  // Lưu kết quả câu này (Fix B5: chỉ chạy 1 lần)
  React.useEffect(() => {
    if (scoreData && currentSentence && !hasAddedResult.current) {
      hasAddedResult.current = true;
      const result: SentenceResult = {
        sentenceId: currentSentence.id,
        text: currentSentence.text,
        score: scoreData,
        attempts: 1,
      };
      addSessionResult(result);
    }
  }, [scoreData, currentSentence, addSessionResult]);

  // Reset guard khi sentence changes
  React.useEffect(() => {
    hasAddedResult.current = false;
  }, [session.currentIndex]);

  /**
   * Mục đích: Phát audio AI (Playback Compare)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Nghe AI" trong Playback Compare section
   */
  const playAI = useCallback(async () => {
    if (!score.aiAudioUrl) return;
    haptic.light();
    setActivePlayback('ai');
    try {
      await trackPlayer.playAI(score.aiAudioUrl, 1.0);
    } catch (err) {
      console.error('❌ [Feedback] Lỗi phát AI:', err);
    }
    setActivePlayback(null);
  }, [score.aiAudioUrl, haptic, trackPlayer]);

  /**
   * Mục đích: Phát audio User (Playback Compare)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Nghe bạn" trong Playback Compare section
   */
  const playUser = useCallback(async () => {
    if (!score.userAudioUri) return;
    haptic.light();
    setActivePlayback('user');
    try {
      await trackPlayer.playAI(score.userAudioUri, 1.0);
    } catch (err) {
      console.error('❌ [Feedback] Lỗi phát User:', err);
    }
    setActivePlayback(null);
  }, [score.userAudioUri, haptic, trackPlayer]);

  /**
   * Mục đích: Phát xen kẽ AI → User (Playback Compare)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Xen kẽ" trong Playback Compare section
   */
  const playAlternate = useCallback(async () => {
    if (!score.aiAudioUrl || !score.userAudioUri) return;
    haptic.light();
    setActivePlayback('alternate');
    try {
      await trackPlayer.playAI(score.aiAudioUrl, 1.0);
      // Đợi AI xong rồi phát User
      setTimeout(async () => {
        try {
          await trackPlayer.playAI(score.userAudioUri!, 1.0);
        } catch {} // eslint-disable-line no-empty
        setActivePlayback(null);
      }, 3000);
    } catch (err) {
      console.error('❌ [Feedback] Lỗi phát xen kẽ:', err);
      setActivePlayback(null);
    }
  }, [score.aiAudioUrl, score.userAudioUri, haptic, trackPlayer]);

  /**
   * Mục đích: Shadow lại câu hiện tại
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Shadow lại"
   */
  const handleRepeat = useCallback(() => {
    haptic.medium();
    repeatSentence();
    navigation.goBack();
  }, [haptic, repeatSentence, navigation]);

  /**
   * Mục đích: Chuyển sang câu tiếp theo
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Câu tiếp"
   */
  const handleNext = useCallback(() => {
    haptic.medium();
    if (isLastSentence) {
      navigation.navigate('ShadowingSessionSummary');
    } else {
      nextSentence();
      navigation.goBack();
    }
  }, [haptic, isLastSentence, nextSentence, navigation]);



  if (!scoreData) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}}>
        <AppText style={{color: colors.neutrals400}} raw>Đang tải kết quả...</AppText>
      </SafeAreaView>
    );
  }

  const grade = calculateGrade(scoreData.overall);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText style={{fontSize: 16, fontWeight: '700', color: colors.foreground}} raw>
          Kết quả Shadow
        </AppText>
        <AppText style={{fontSize: 13, color: colors.neutrals400}} raw>
          Câu {session.currentIndex + 1}/{session.totalSentences}
        </AppText>
      </View>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}>

        {/* ===== Overall Score Ring (mockup: 82/100, B+ inside ring) ===== */}
        <View style={styles.overallSection}>
          <ScoreRing
            value={scoreData.overall}
            size={120}
            strokeWidth={8}
            showGrade={false}
          />
          <AppText
            style={{fontSize: 22, fontWeight: '800', color: colors.foreground, marginTop: 12}}
            raw>
            {grade}
          </AppText>
          <AppText style={{fontSize: 13, color: colors.neutrals400, marginTop: 4}} raw>
            {scoreData.overall >= 85
              ? '🌟 Xuất sắc! Gần như native speaker!'
              : scoreData.overall >= 70
                ? '👍 Khá tốt! Cần cải thiện nhịp nói'
                : scoreData.overall >= 50
                  ? '💪 Cần cải thiện thêm'
                  : '📚 Hãy nghe lại mẫu và thử lại'}
          </AppText>
        </View>

        {/* ===== Score Breakdown — 3 rings (mockup: colored per type) ===== */}
        <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
          <AppText style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 12}} raw>
            Score Breakdown
          </AppText>
          <View style={styles.subScoresRow}>
            <ScoreRing
              value={scoreData.rhythm}
              label="Rhythm"
              icon="🎵"
              size={65}
              strokeWidth={5}
              color={SCORE_COLORS.rhythm}
            />
            <ScoreRing
              value={scoreData.intonation}
              label="Intonation"
              icon="🎶"
              size={65}
              strokeWidth={5}
              color={SCORE_COLORS.intonation}
            />
            <ScoreRing
              value={scoreData.accuracy}
              label="Accuracy"
              icon="🎯"
              size={65}
              strokeWidth={5}
              color={SCORE_COLORS.accuracy}
            />
          </View>
        </View>

        {/* ===== Waveform Comparison ===== */}
        {waveform.aiData.length > 0 && waveform.userData.length > 0 && (
          <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
            <AppText style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8}} raw>
              Waveform Comparison
            </AppText>
            {/* Legend */}
            <View style={{flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#E879F9'}} />
                <AppText variant="caption" style={{color: colors.neutrals400}} raw>AI</AppText>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80'}} />
                <AppText variant="caption" style={{color: colors.neutrals400}} raw>Bạn</AppText>
              </View>
            </View>
            {/* Placeholder waveform overlay */}
            <View style={{height: 50, borderRadius: 8, backgroundColor: colors.glassBg, justifyContent: 'center', alignItems: 'center'}}>
              <AppText style={{fontSize: 11, color: colors.neutrals500}} raw>
                ℹ️ Tap any section of the waveform to hear that specific segment.
              </AppText>
            </View>
          </View>
        )}

        {/* ===== Playback Compare (mockup 22: 3 buttons) ===== */}
        <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
          <AppText style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10}} raw>
            Playback Compare
          </AppText>
          <View style={styles.playbackRow}>
            <TouchableOpacity
              style={[
                styles.playbackBtn,
                {
                  backgroundColor: activePlayback === 'ai' ? `${speakingColor}20` : colors.glassBg,
                  borderColor: activePlayback === 'ai' ? speakingColor : colors.glassBorderStrong,
                },
              ]}
              onPress={playAI}
              activeOpacity={0.7}>
              <AppText style={{fontSize: 12, color: '#E879F9', marginRight: 4}} raw>▶</AppText>
              <AppText style={{fontSize: 12, fontWeight: '600', color: colors.foreground}} raw>
                Nghe AI
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playbackBtn,
                {
                  backgroundColor: activePlayback === 'user' ? '#4ADE8020' : colors.glassBg,
                  borderColor: activePlayback === 'user' ? '#4ADE80' : colors.glassBorderStrong,
                },
              ]}
              onPress={playUser}
              activeOpacity={0.7}>
              <AppText style={{fontSize: 12, color: '#4ADE80', marginRight: 4}} raw>💚</AppText>
              <AppText style={{fontSize: 12, fontWeight: '600', color: colors.foreground}} raw>
                Nghe bạn
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playbackBtn,
                {
                  backgroundColor: activePlayback === 'alternate' ? `${speakingColor}20` : colors.glassBg,
                  borderColor: activePlayback === 'alternate' ? speakingColor : colors.glassBorderStrong,
                },
              ]}
              onPress={playAlternate}
              activeOpacity={0.7}>
              <AppText style={{fontSize: 12, color: speakingColor, marginRight: 4}} raw>⟺</AppText>
              <AppText style={{fontSize: 12, fontWeight: '600', color: colors.foreground}} raw>
                Nghe xen kẽ
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== Word Issues (with colored bar per mockup) ===== */}
        {scoreData.wordIssues.length > 0 && (
          <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
            <AppText
              style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10}}
              raw>
              Từ cần cải thiện
            </AppText>
            {scoreData.wordIssues
              .filter(w => w.score < 70)
              .slice(0, 5)
              .map((word, index) => {
                const barColor = word.score >= 50 ? '#FACC15' : '#EF4444';
                return (
                  <View key={`${word.word}-${index}`} style={styles.issueRow}>
                    <View style={{flex: 1}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <AppText style={{fontSize: 14, fontWeight: '600', color: colors.foreground}} raw>
                          {word.word}
                        </AppText>
                        {/* Score bar (per mockup) */}
                        <View style={[styles.scoreBar, {backgroundColor: `${barColor}20`}]}>
                          <View
                            style={{
                              width: `${word.score}%`,
                              height: '100%',
                              backgroundColor: barColor,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                        <AppText style={{fontSize: 13, fontWeight: '700', color: barColor}} raw>
                          {word.score}%
                        </AppText>
                      </View>
                      {word.issue && (
                        <AppText style={{fontSize: 11, color: colors.neutrals400, marginTop: 2}} raw>
                          {word.issue}{word.ipa ? ` ${word.ipa}` : ''}
                        </AppText>
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* ===== Tips ===== */}
        {scoreData.tips.length > 0 && (
          <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
            <AppText
              style={{fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8}}
              raw>
              💡 Gợi ý cải thiện
            </AppText>
            {scoreData.tips.map((tip, i) => (
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

      {/* ===== Bottom Actions (mockup: Shadow lại + Câu tiếp) ===== */}
      <View style={[styles.actions, {borderTopColor: colors.glassDivider, backgroundColor: colors.background, paddingBottom: Math.max(12, insets.bottom + 60)}]}>
        <View style={{flexDirection: 'row', flex: 1, gap: 10}}>

          {/* Shadow lại */}
          <TouchableOpacity
            style={[styles.repeatBtn, {borderColor: speakingColor}]}
            onPress={handleRepeat}
            activeOpacity={0.7}>
            <AppText style={{fontSize: 13, fontWeight: '600', color: speakingColor}} raw>
              Shadow lại
            </AppText>
          </TouchableOpacity>

          {/* Câu tiếp / Xem tổng kết */}
          <TouchableOpacity
            style={[styles.nextBtn, {backgroundColor: speakingColor}]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <AppText style={{fontSize: 14, fontWeight: '700', color: '#FFF'}} raw>
              {isLastSentence ? '✅ Xem tổng kết' : '→ Câu tiếp'}
            </AppText>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  subScoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  playbackRow: {
    flexDirection: 'row',
    gap: 8,
  },
  playbackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
  },
  issueRow: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    maxWidth: 120,
  },
  actions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },

  repeatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  nextBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
});

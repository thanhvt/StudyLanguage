import React, {useCallback, useRef, useState, useEffect} from 'react';
import {View, ScrollView, Pressable, Animated, Platform, Alert, StyleSheet, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {VoiceVisualizer, RoundCard, StatChip} from '@/components/speaking';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useTongueTwisterStore} from '@/store/useTongueTwisterStore';
import {speakingApi} from '@/services/api/speaking';
import {
  SPEED_ROUNDS_CONFIG,
  PHONEME_CATEGORIES,
  calculateWPM,
  calculateSpeedScore,
  formatTimerDisplay,
} from '@/types/tongueTwister.types';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';

// Optional modules
let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule = require('react-native-audio-recorder-player').default;
} catch {
  console.warn('⚠️ [SpeedChallenge] react-native-audio-recorder-player chưa install');
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [SpeedChallenge] react-native-fs chưa install');
}

const audioRecorderPlayer = AudioRecorderPlayerModule ? new AudioRecorderPlayerModule() : null;

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;
type ScreenProps = NativeStackScreenProps<SpeakingStackParamList, 'SpeedChallenge'>;

/** Số lần retry tối đa cho mỗi round */
const MAX_RETRIES = 3;

// =======================
// Screen
// =======================

/**
 * Mục đích: Speed Challenge — 4 rounds tốc độ tăng dần (0.8x → 1.0x → 1.2x → 1.5x)
 * Tham số đầu vào: route.params { twisterId, phonemeCategory }
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - TongueTwisterPracticeScreen → score ≥ 60 → navigate SpeedChallenge
 *   - Flow: Round 1 (0.8x) → Round 2 (1.0x) → Round 3 (1.2x) → Round 4 (1.5x) → Final
 */
export default function SpeedChallengeScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ScreenProps['route']>();
  const colors = useColors();
  const haptic = useHaptic();

  const {phonemeCategory} = route.params;

  // Store
  const {
    session,
    recording,
    speedChallenge,
    startSpeedChallenge,
    completeRound,
    retryRound,
    exitSpeedChallenge,
    startRecording,
    stopRecording,
    setRecordingDuration,
    clearRecording,
  } = useTongueTwisterStore();

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundResult, setRoundResult] = useState<{
    score: number;
    wpm: number;
    accuracy: number;
    passed: boolean;
  } | null>(null);

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  /** BUG-01 FIX: Ref cho handleStopRecord — tránh stale closure */
  const stopRecordRef = useRef<() => void>(() => {});

  // Dữ liệu
  const currentTwister = session.twisters[session.currentIndex];
  const currentRoundConfig = SPEED_ROUNDS_CONFIG[speedChallenge.currentRound - 1];
  const currentRoundData = speedChallenge.rounds[speedChallenge.currentRound - 1];
  const phonemeInfo = PHONEME_CATEGORIES.find(p => p.key === phonemeCategory);

  // Khởi tạo Speed Challenge khi vào screen
  useEffect(() => {
    startSpeedChallenge();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kiểm tra hoàn thành tất cả rounds
  const allRoundsCompleted = speedChallenge.rounds.every(r => r.status === 'completed');

  // Pulse animation cho mic
  useEffect(() => {
    if (recording.isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.15, duration: 350, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 350, useNativeDriver: true}),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [recording.isRecording, pulseAnim]);

  /**
   * Mục đích: Bắt đầu ghi âm cho round hiện tại
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút mic trong Speed Challenge
   */
  const handleStartRecord = useCallback(async () => {
    haptic.medium();
    setRoundResult(null);
    startRecording();
    startTimeRef.current = Date.now();

    try {
      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speed_record.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speed_record.mp4`,
      })!;
      await audioRecorderPlayer?.startRecorder(path);

      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 0.1;
        setRecordingDuration(Math.round(elapsed * 10) / 10);
        // Tự dừng sau 10 giây
        if (elapsed >= 10) {
          // BUG-01 FIX: Dùng ref tránh stale closure
          stopRecordRef.current();
        }
      }, 100);
    } catch (err: any) {
      console.error('\u274c [SpeedChallenge] Lỗi ghi âm:', err);
      clearRecording();
      // EC-04 FIX: Mic permission denied
      if (err?.message?.includes('permission') || err?.code === 'E_AUDIO_NOPERMISSION') {
        Alert.alert(
          'Cần quyền microphone',
          'Vui lòng cấp quyền microphone trong Cài đặt để ghi âm.',
          [
            {text: 'Hủy', style: 'cancel'},
            {text: 'Mở Cài đặt', onPress: () => Linking.openSettings()},
          ],
        );
      }
    }
  }, [haptic, startRecording, setRecordingDuration, clearRecording]);

  /**
   * Mục đích: Dừng ghi → tính WPM + accuracy → kiểm tra pass/fail
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn stop hoặc hết thời gian
   */
  const handleStopRecord = useCallback(async () => {
    haptic.light();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const uri = (await audioRecorderPlayer?.stopRecorder()) || '';
      stopRecording(uri);
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSec = elapsedMs / 1000;

      // BUG-04 FIX: Guard recording quá ngắn (< 1s)
      if (elapsedSec < 1) {
        clearRecording();
        Alert.alert('Quá ngắn', 'Nói lâu hơn nhé! Ghi âm tối thiểu 1 giây.');
        return;
      }

      setIsSubmitting(true);

      // Transcribe + evaluate
      const transcript = await speakingApi.transcribeAudio(uri);
      const evalResult = await speakingApi.evaluatePronunciation(
        currentTwister.text,
        transcript,
      );

      const accuracy = evalResult.pronunciation || evalResult.overallScore;
      const wordCount = currentTwister.text.split(/\s+/).length;
      const wpm = calculateWPM(wordCount, elapsedSec, accuracy);
      const roundScore = calculateSpeedScore(accuracy, wpm, currentRoundConfig.targetWPM);
      const passed = accuracy >= currentRoundConfig.passThreshold;

      setRoundResult({score: roundScore, wpm, accuracy, passed});

      // EC-03 FIX: Guard round 4 — không increment nếu đã ở round cuối
      completeRound(roundScore, wpm, accuracy);

      if (passed) {
        haptic.success();
        console.log(`\u2705 [SpeedChallenge] Round ${speedChallenge.currentRound} PASSED — WPM: ${wpm}, Accuracy: ${accuracy}%`);
      } else {
        haptic.warning();
        console.log(`\u274c [SpeedChallenge] Round ${speedChallenge.currentRound} FAILED — Accuracy: ${accuracy}% < ${currentRoundConfig.passThreshold}%`);
      }
    } catch (err) {
      console.error('\u274c [SpeedChallenge] Lỗi xử lý:', err);
      setRoundResult({score: 0, wpm: 0, accuracy: 0, passed: false});
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTwister, currentRoundConfig, speedChallenge.currentRound, haptic, stopRecording, completeRound, clearRecording]);

  // BUG-01 FIX: Cập nhật ref mỗi khi handleStopRecord thay đổi
  useEffect(() => {
    stopRecordRef.current = handleStopRecord;
  }, [handleStopRecord]);

  /**
   * Mục đích: Retry round hiện tại
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User fail round và muốn thử lại (max 3 lần)
   */
  const handleRetry = useCallback(() => {
    if (speedChallenge.retryCount >= MAX_RETRIES) {
      Alert.alert(
        'Hãy luyện thêm',
        'Bạn đã thử lại 3 lần. Hãy luyện thêm ở tốc độ thấp hơn nhé!',
        [{text: 'Quay về Practice', onPress: () => navigation.goBack()}],
      );
      return;
    }
    haptic.light();
    retryRound();
    setRoundResult(null);
  }, [speedChallenge.retryCount, haptic, retryRound, navigation]);

  /**
   * Mục đích: Thoát Speed Challenge
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn back hoặc hoàn thành tất cả rounds
   */
  const handleExit = useCallback(() => {
    exitSpeedChallenge();
    navigation.goBack();
  }, [exitSpeedChallenge, navigation]);

  if (!currentTwister) {
    // EC-01 FIX: Exit speed challenge state khi không có dữ liệu
    exitSpeedChallenge();
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <AppText className="text-center text-neutrals400 mt-20">
          Không có dữ liệu. Quay lại nhé!
        </AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.backButton}>
          <Icon name="ChevronLeft" className="w-5 h-5" style={{color: '#22c55e'}} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText variant="heading3" weight="bold">
            Speed Challenge 🏁
          </AppText>
        </View>
        <View style={[styles.roundBadge, {backgroundColor: '#eab30820'}]}>
          <AppText variant="caption" weight="bold" style={{color: '#eab308'}} raw>
            Round {speedChallenge.currentRound}/4
          </AppText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Tongue Twister text */}
        <View style={styles.twisterLabel}>
          <AppText variant="caption" className="text-neutrals400" raw>
            Tongue Twister
          </AppText>
        </View>
        <View style={[styles.sentenceCard, {backgroundColor: `${colors.foreground}08`, borderColor: `${colors.foreground}15`}]}>
          <AppText variant="heading2" weight="bold" className="text-foreground" raw>
            {currentTwister.text}
          </AppText>
        </View>

        {/* Speed Tracker — 4 rounds */}
        <AppText variant="bodySmall" weight="semibold" className="text-neutrals400 mb-2" raw>
          Speed Tracker
        </AppText>
        <View style={styles.roundsList}>
          {speedChallenge.rounds.map(round => (
            <RoundCard
              key={round.round}
              round={round}
              isActive={round.round === speedChallenge.currentRound && round.status === 'active'}
            />
          ))}
        </View>

        {/* Stats Row */}
        <AppText variant="bodySmall" weight="semibold" className="text-neutrals400 mt-3 mb-2" raw>
          Stats Row
        </AppText>
        <View style={styles.statsRow}>
          <StatChip
            icon="🏃"
            label="WPM"
            value={roundResult?.wpm ?? '--'}
            valueColor={roundResult?.wpm ? '#22c55e' : undefined}
          />
          <StatChip
            icon="🎯"
            label="Accuracy"
            value={roundResult?.accuracy ? `${roundResult.accuracy}%` : '--'}
            valueColor={roundResult?.accuracy ? (roundResult.accuracy >= 70 ? '#22c55e' : '#f97316') : undefined}
          />
          <StatChip
            icon="⚡"
            label="Best"
            value={speedChallenge.bestWPM > 0 ? `${speedChallenge.bestWPM} WPM` : '--'}
            valueColor="#eab308"
          />
        </View>

        {/* Mic + Waveform + Timer */}
        {!allRoundsCompleted && (
          <View style={styles.micSection}>
            {/* UI-03 FIX: Waveform + Timer nằm ngang như mockup */}
            {recording.isRecording && (
              <View style={styles.waveformRow}>
                <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                  <Pressable
                    onPress={handleStopRecord}
                    style={[
                      styles.micButton,
                      {
                        backgroundColor: '#ef4444',
                        shadowColor: '#ef4444',
                      },
                    ]}>
                    <Icon
                      name="Square"
                      className="w-8 h-8 text-white"
                    />
                  </Pressable>
                </Animated.View>
                <View style={styles.waveformTimerCol}>
                  <VoiceVisualizer isRecording height={35} color="#22c55e" />
                  <AppText variant="heading3" weight="bold" className="text-foreground" raw>
                    {formatTimerDisplay(recording.duration)}
                  </AppText>
                </View>
              </View>
            )}

            {/* Mic button khi chưa ghi */}
            {!recording.isRecording && (
              <View style={{alignItems: 'center'}}>
                <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                  <Pressable
                    onPress={handleStartRecord}
                    disabled={isSubmitting}
                    style={[
                      styles.micButton,
                      {
                        backgroundColor: '#eab308',
                        shadowColor: '#eab308',
                        opacity: isSubmitting ? 0.5 : 1,
                      },
                    ]}>
                    <Icon
                      name="Mic"
                      className="w-8 h-8 text-white"
                    />
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {/* BUG-02 / UI-04 FIX: Label chính xác cho trạng thái */}
            <AppText variant="caption" className="mt-2 text-neutrals400" raw>
              {recording.isRecording ? 'Nhấn để dừng' : 'Nhấn để ghi âm'}
            </AppText>

            {/* Kết quả round */}
            {roundResult && (
              <View style={styles.roundResultSection}>
                {roundResult.passed ? (
                  <AppText variant="body" weight="bold" style={{color: '#22c55e'}} raw>
                    ✅ Đạt! Score: {roundResult.score}
                  </AppText>
                ) : (
                  <View style={{alignItems: 'center'}}>
                    <AppText variant="body" weight="bold" style={{color: '#ef4444'}} raw>
                      ❌ Chưa đạt — thử lại!
                    </AppText>
                    <AppText variant="caption" className="text-neutrals400 mt-1" raw>
                      Accuracy cần ≥ {currentRoundConfig.passThreshold}% (đạt: {roundResult.accuracy}%)
                    </AppText>
                    <AppButton
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      style={{borderColor: '#eab308'}}
                      onPress={handleRetry}>
                      🔄 Thử lại ({MAX_RETRIES - speedChallenge.retryCount} lượt còn lại)
                    </AppButton>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Hoàn thành tất cả rounds */}
        {allRoundsCompleted && (
          <View style={styles.completionSection}>
            <AppText variant="heading2" weight="bold" style={{color: '#eab308'}} raw>
              🏆 Hoàn thành!
            </AppText>
            <AppText variant="body" className="text-foreground mt-2" raw>
              Best WPM: {speedChallenge.bestWPM}
            </AppText>
            <AppText variant="bodySmall" className="text-neutrals400 mt-1" raw>
              Bạn đã hoàn thành tất cả 4 rounds!
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* CTA — Leaderboard */}
      <View style={[styles.footer, {borderTopColor: colors.surface}]}>
        <AppButton
          variant="outline"
          size="lg"
          className="w-full"
          style={{borderColor: '#eab308'}}
          onPress={() => {
            // TODO: Navigate tới Leaderboard (P2)
            Alert.alert('🏆 Leaderboard', 'Tính năng Leaderboard sẽ có trong phiên bản tới!');
          }}>
          🏆 Leaderboard
        </AppButton>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22c55e15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  roundBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  twisterLabel: {
    marginBottom: 8,
  },
  sentenceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  roundsList: {
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  micSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  /** UI-03 FIX: Cột waveform + timer */
  waveformTimerCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  roundResultSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  completionSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

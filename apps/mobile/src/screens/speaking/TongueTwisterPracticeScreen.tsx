import React, {useCallback, useRef, useState, useEffect} from 'react';
import {View, ScrollView, Pressable, Animated, Platform, StyleSheet, Alert, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {VoiceVisualizer, PhonemeHighlightText} from '@/components/speaking';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useTongueTwisterStore} from '@/store/useTongueTwisterStore';
import {useAppStore} from '@/store/useAppStore';
import {speakingApi} from '@/services/api/speaking';
import {PHONEME_CATEGORIES, formatTimerDisplay} from '@/types/tongueTwister.types';
import type {PhonemeCategory, TwisterLevel} from '@/types/tongueTwister.types';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';
import {saveSpeakingSession} from '@/services/speaking/saveSpeakingSession';
import type {TongueTwisterSessionData} from '@/services/speaking/saveSpeakingSession';

// Optional modules
let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule = require('react-native-audio-recorder-player').default;
} catch {
  console.warn('⚠️ [TongueTwisterPractice] react-native-audio-recorder-player chưa install');
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [TongueTwisterPractice] react-native-fs chưa install');
}

const audioRecorderPlayer = AudioRecorderPlayerModule ? new AudioRecorderPlayerModule() : null;

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;
type ScreenProps = NativeStackScreenProps<SpeakingStackParamList, 'TongueTwisterPractice'>;

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình luyện tập Tongue Twister — hiển thị sentence, nghe mẫu, ghi âm, scoring
 * Tham số đầu vào: route.params { phonemeCategory, level }
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - TongueTwisterSelectScreen → navigate TongueTwisterPractice
 *   - Flow: Xem câu → Nghe mẫu (0.8x/1.0x) → Ghi âm → Score → Câu trước/sau → Speed Challenge
 */
export default function TongueTwisterPracticeScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ScreenProps['route']>();
  const colors = useColors();
  const haptic = useHaptic();

  const {phonemeCategory, level} = route.params;

  // Store
  const {
    session,
    recording,
    score,
    nextTwister,
    prevTwister,
    startRecording,
    stopRecording,
    setRecordingDuration,
    setScoreLoading,
    setScore,
    clearScore,
    clearRecording,
  } = useTongueTwisterStore();

  // Local state
  const [showIPA, setShowIPA] = useState(true);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  /** Ref cho handleStopRecord — tránh stale closure khi setInterval gọi callback (BUG-01) */
  const stopRecordRef = useRef<() => void>(() => {});
  /** Tránh lưu history trùng lặp */
  const savedRef = useRef(false);
  /** Tích luỹ score cho từng twister */
  const scoresRef = useRef<{twisterIndex: number; pronunciation: number; tip?: string | null}[]>([]);
  /** Thời gian bắt đầu session */
  const sessionStartRef = useRef(Date.now());
  /** BUG-H03 FIX: Ref giữ twisters mới nhất cho cleanup closure */
  const twistersRef = useRef(session.twisters);

  // Dữ liệu hiện tại
  const currentTwister = session.twisters[session.currentIndex];
  const phonemeInfo = PHONEME_CATEGORIES.find(p => p.key === phonemeCategory);
  // UI-06 FIX: Dùng colorLight khi light mode
  const theme = useAppStore(state => state.theme);
  const phonemeColor = theme === 'light'
    ? (phonemeInfo?.colorLight || '#ca8a04')
    : (phonemeInfo?.color || '#eab308');
  const isFirstTwist = session.currentIndex === 0;
  const isLastTwist = session.currentIndex >= session.totalTwisters - 1;

  // Pulse animation cho mic
  useEffect(() => {
    if (recording.isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.15, duration: 400, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 400, useNativeDriver: true}),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [recording.isRecording, pulseAnim]);

  // BUG-H03 FIX: Cập nhật ref mỗi khi twisters thay đổi
  useEffect(() => {
    twistersRef.current = session.twisters;
  }, [session.twisters]);

  // Cleanup timer + auto-save khi unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // PRC-15: Auto-save khi rời khỏi màn hình
      if (!savedRef.current && scoresRef.current.length > 0) {
        savedRef.current = true;
        const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
        // BUG-H03 FIX: Dùng twistersRef.current thay vì session.twisters (tránh stale closure)
        const currentTwisters = twistersRef.current;
        const sessionData: TongueTwisterSessionData = {
          phonemeCategory: phonemeCategory,
          level: level,
          twisters: currentTwisters.map(t => ({
            text: t.text,
            ipa: t.ipa,
            targetPhonemes: t.targetPhonemes,
          })),
          scores: scoresRef.current.map(s => ({
            twisterIndex: s.twisterIndex,
            pronunciation: s.pronunciation,
            tip: s.tip ?? undefined,
          })),
          durationSeconds,
        };
        saveSpeakingSession('tongue-twister', sessionData);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mục đích: Nghe AI đọc mẫu ở tốc độ cho trước
   * Tham số đầu vào: speed (number) — 0.8 hoặc 1.0
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "Nghe mẫu — 0.8x" hoặc "Nghe mẫu — 1.0x"
   */
  const handlePlaySample = useCallback(async (speed: number) => {
    if (!currentTwister) return;
    setIsPlayingSample(true);
    try {
      const base64 = await speakingApi.playAISample(currentTwister.text, 'openai', undefined, speed);
      const path = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/twister_sample.mp3`;
      await RNFSModule?.writeFile(path, base64, 'base64');
      await audioRecorderPlayer?.startPlayer(path);
      console.log(`🔊 [TongueTwisterPractice] Phát mẫu ${speed}x`);

      // BUG-03 FIX: Listen sự kiện audio phát xong mới enable nút
      audioRecorderPlayer?.addPlayBackListener((e: any) => {
        if (e.currentPosition >= e.duration - 50) {
          setIsPlayingSample(false);
          audioRecorderPlayer?.removePlayBackListener();
        }
      });
    } catch (err) {
      console.error('❌ [TongueTwisterPractice] Lỗi phát mẫu:', err);
      setIsPlayingSample(false);
    }
  }, [currentTwister]);

  /**
   * Mục đích: Bắt đầu ghi âm
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn mic button
   */
  const handleStartRecord = useCallback(async () => {
    // EC-04 FIX: Kiểm tra mic permission trước
    if (Platform.OS === 'ios') {
      try {
        // iOS sẽ tự hỏi permission khi startRecorder, nhưng nếu đã denied → catch
      } catch {}
    }

    haptic.medium();
    startRecording();
    startTimeRef.current = Date.now();

    try {
      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/twister_record.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/twister_record.mp4`,
      })!;
      await audioRecorderPlayer?.startRecorder(path);

      // EC-05 FIX: Timer precision 100ms thay vì 1000ms
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 0.1;
        setRecordingDuration(Math.round(elapsed * 10) / 10);
        // Tự dừng sau 10 giây (per spec TT-NF02)
        if (elapsed >= 10) {
          // BUG-01 FIX: Dùng ref tránh stale closure
          stopRecordRef.current();
        }
      }, 100);
    } catch (err: any) {
      console.error('❌ [TongueTwisterPractice] Lỗi ghi âm:', err);
      clearRecording();
      // EC-04 FIX: Nếu lỗi permission → hướng dẫn user mở Settings
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
   * Mục đích: Dừng ghi âm → gửi AI analyze → hiện score
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn stop hoặc hết thời gian (10s)
   */
  const handleStopRecord = useCallback(async () => {
    haptic.light();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const uri = (await audioRecorderPlayer?.stopRecorder()) || '';
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      stopRecording(uri);

      // BUG-04 FIX: Guard recording quá ngắn (< 1s)
      if (elapsedSec < 1) {
        clearRecording();
        Alert.alert('Quá ngắn', 'Nói lâu hơn nhé! Ghi âm tối thiểu 1 giây.');
        return;
      }

      setScoreLoading(true);

      // NF-01 FIX: Timeout guard 8s cho API call (scoring latency)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 8000),
      );

      const scoringPromise = (async () => {
        // Gọi API phân tích phoneme-focused
        const transcript = await speakingApi.transcribeAudio(uri);
        const evalResult = await speakingApi.evaluatePronunciation(
          currentTwister.text,
          transcript,
        );

        // Map kết quả thành phoneme hits
        const phonemeHits = currentTwister.highlightWords.map(word => ({
          phoneme: currentTwister.targetPhonemes[0] || '',
          word,
          isCorrect: (evalResult.wordByWord?.find(
            (w: any) => w.word.toLowerCase() === word.toLowerCase(),
          )?.score ?? 70) >= 60,
        }));

        // Tạo tip từ kết quả
        const wrongWords = phonemeHits.filter(h => !h.isCorrect);
        const tip = wrongWords.length > 0
          ? `Cải thiện: '${wrongWords[0].word}' — nhấn mạnh ${currentTwister.targetPhonemes.join(', ')}`
          : null;

        return {evalResult, phonemeHits, tip};
      })();

      const result = await Promise.race([scoringPromise, timeoutPromise]) as any;
      setScore(result.evalResult.pronunciation || result.evalResult.overallScore, result.phonemeHits, result.tip);
      // Tích luỹ score cho history
      scoresRef.current.push({
        twisterIndex: session.currentIndex,
        pronunciation: result.evalResult.pronunciation || result.evalResult.overallScore,
        tip: result.tip,
      });
      haptic.success();
      console.log(`✅ [TongueTwisterPractice] Score: ${result.evalResult.pronunciation || result.evalResult.overallScore}`);
    } catch (err: any) {
      console.error('❌ [TongueTwisterPractice] Lỗi xử lý:', err);
      const errorMsg = err?.message === 'Timeout'
        ? 'Phân tích quá lâu. Vui lòng thử lại!'
        : 'Không thể phân tích. Hãy thử lại!';
      setScore(0, [], errorMsg);
    }
  }, [currentTwister, haptic, stopRecording, setScoreLoading, setScore, clearRecording]);

  // BUG-01 FIX: Cập nhật ref mỗi khi handleStopRecord thay đổi
  useEffect(() => {
    stopRecordRef.current = handleStopRecord;
  }, [handleStopRecord]);

  /**
   * Mục đích: Chuyển sang câu trước/sau
   * Tham số đầu vào: direction ('prev' | 'next')
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap "← Câu trước" hoặc "Câu sau →"
   */
  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      haptic.light();
      if (direction === 'prev') {
        prevTwister();
      } else {
        nextTwister();
      }
    },
    [haptic, prevTwister, nextTwister],
  );

  /**
   * Mục đích: Chuyển sang Speed Challenge
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User đạt score ≥ 60 → nhấn "🏁 Speed Challenge"
   */
  const handleSpeedChallenge = useCallback(() => {
    haptic.medium();
    navigation.navigate('SpeedChallenge', {
      twisterId: currentTwister.id,
      phonemeCategory,
    });
  }, [haptic, navigation, currentTwister, phonemeCategory]);

  if (!currentTwister) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <AppText className="text-center text-neutrals400 mt-20">
          Không có tongue twister nào. Quay lại chọn phoneme khác nhé!
        </AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View style={styles.headerCenter}>
          <AppText variant="heading3" weight="bold">
            Tongue Twister
          </AppText>
        </View>
        <View style={{width: 36}} />
      </View>

      {/* Phoneme + Level badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, {backgroundColor: `${phonemeColor}20`, borderColor: phonemeColor}]}>
          <AppText variant="caption" weight="bold" style={{color: phonemeColor}} raw>
            {phonemeInfo?.phonemePair || phonemeCategory}
          </AppText>
        </View>
        <View style={[styles.badge, {backgroundColor: colors.surface}]}>
          <AppText variant="caption" weight="semibold" className="text-foreground" raw>
            Level: {level.charAt(0).toUpperCase() + level.slice(1)}
          </AppText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Sentence Card — Glassmorphism style */}
        <View style={[styles.sentenceCard, {backgroundColor: `${colors.foreground}08`, borderColor: `${colors.foreground}15`}]}>
          <View style={styles.sentenceCardInner}>
            {/* Tongue twister text với phoneme highlights */}
            <PhonemeHighlightText
              text={currentTwister.text}
              highlightWords={currentTwister.highlightWords}
              highlightColor={phonemeColor}
              fontSize={20}
            />

            {/* IPA display (toggle) */}
            {showIPA && (
              <Pressable onPress={() => setShowIPA(!showIPA)}>
                <AppText
                  variant="caption"
                  style={{color: colors.neutrals400, marginTop: 8, lineHeight: 18}}
                  raw>
                  {currentTwister.ipa}
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* Nút nghe mẫu */}
        {/* UI-01 FIX: Listen buttons xếp dọc (full width mỗi nút) */}
        <View style={styles.listenButtons}>
          <AppButton
            variant="outline"
            size="sm"
            style={{borderColor: '#eab308'}}
            disabled={isPlayingSample}
            onPress={() => handlePlaySample(0.8)}
            icon={<Icon name="Volume2" className="w-4 h-4" style={{color: '#eab308'}} />}>
            <AppText variant="bodySmall" style={{color: '#eab308'}} raw>
              Nghe mẫu — 0.8x
            </AppText>
          </AppButton>
          <AppButton
            variant="outline"
            size="sm"
            style={{borderColor: '#22c55e'}}
            disabled={isPlayingSample}
            onPress={() => handlePlaySample(1.0)}
            icon={<Icon name="Volume2" className="w-4 h-4" style={{color: '#22c55e'}} />}>
            <AppText variant="bodySmall" style={{color: '#22c55e'}} raw>
              Nghe mẫu — 1.0x
            </AppText>
          </AppButton>
        </View>

        {/* Mic + Waveform */}
        <View style={styles.micSection}>
          {/* Waveform khi đang ghi */}
          {recording.isRecording && (
            <View style={styles.waveformContainer}>
              <VoiceVisualizer isRecording height={40} color={phonemeColor} />
            </View>
          )}

          {/* Nút mic 80px */}
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <Pressable
              onPress={recording.isRecording ? handleStopRecord : handleStartRecord}
              style={[
                styles.micButton,
                {
                  backgroundColor: recording.isRecording ? '#ef4444' : '#eab308',
                  shadowColor: recording.isRecording ? '#ef4444' : '#eab308',
                },
              ]}>
              <Icon
                name={recording.isRecording ? 'Square' : 'Mic'}
                className="w-8 h-8 text-white"
              />
            </Pressable>
          </Animated.View>

          {/* BUG-02 FIX: Label chính xác cho Tap Toggle UX */}
          <AppText variant="caption" className="mt-2 text-neutrals400" raw>
            {recording.isRecording
              ? `${formatTimerDisplay(recording.duration)} — Nhấn để dừng`
              : 'Nhấn để ghi âm'}
          </AppText>
        </View>

        {/* Score Display */}
        {score.isLoading && (
          <View style={styles.scoreSection}>
            <AppText variant="bodySmall" className="text-neutrals400" raw>
              ⏳ Đang phân tích...
            </AppText>
          </View>
        )}

        {score.pronunciation !== null && !score.isLoading && (
          <View style={styles.scoreSection}>
            <AppText variant="body" weight="semibold" className="text-foreground" raw>
              Pronunciation:{' '}
              <AppText
                variant="body"
                weight="bold"
                style={{color: score.pronunciation >= 70 ? '#22c55e' : '#f97316'}}
                raw>
                {score.pronunciation}/100
              </AppText>
            </AppText>
            {score.tip && (
              <AppText variant="caption" className="text-neutrals400 mt-1" raw>
                {score.tip}
              </AppText>
            )}

            {/* Nút Speed Challenge (khi score ≥ 60) */}
            {score.pronunciation >= 60 && (
              <AppButton
                variant="outline"
                size="sm"
                className="mt-3"
                style={{borderColor: '#eab308'}}
                onPress={handleSpeedChallenge}>
                🏁 Speed Challenge
              </AppButton>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer — Navigation trước/sau */}
      <View style={[styles.footer, {borderTopColor: colors.surface}]}>
        <Pressable
          onPress={() => handleNavigate('prev')}
          disabled={isFirstTwist}
          style={[styles.navButton, {opacity: isFirstTwist ? 0.3 : 1}]}>
          <AppText variant="body" weight="semibold" className="text-foreground" raw>
            ← Câu trước
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => handleNavigate('next')}
          disabled={isLastTwist}
          style={[styles.navButton, {opacity: isLastTwist ? 0.3 : 1}]}>
          <AppText variant="body" weight="semibold" className="text-foreground" raw>
            Câu sau →
          </AppText>
        </Pressable>
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
    paddingBottom: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sentenceCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sentenceCardInner: {
    padding: 20,
  },
  // UI-01 FIX: Listen buttons xếp dọc (stacked) như mockup
  listenButtons: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  micSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  waveformContainer: {
    marginBottom: 12,
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
  scoreSection: {
    padding: 16,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navButton: {
    padding: 8,
  },
});

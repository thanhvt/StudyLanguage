import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  AppState,
  type AppStateStatus,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useHeadphoneDetection} from '@/hooks/useHeadphoneDetection';
import {SKILL_COLORS} from '@/config/skillColors';
import {useShadowingStore} from '@/store/useShadowingStore';
import {useShadowingTrackPlayer} from '@/hooks/useShadowingTrackPlayer';
import {useShadowingRecorder} from '@/hooks/useShadowingRecorder';
import {speakingApi} from '@/services/api/speaking';
import {
  DualWaveformVisualizer,
  SentenceHighlightCard,
} from '@/components/speaking';

// =======================
// Constants
// =======================

/** Thời gian timeout chấm điểm (ms) — nếu quá lâu sẽ cancel */
const SCORE_TIMEOUT_MS = 15_000;
/** Ngưỡng amplitude thấp — cảnh báo user nói quá nhỏ */
const LOW_AMPLITUDE_THRESHOLD = 0.05;
/** Số lần amplitude thấp liên tiếp để hiện cảnh báo */
const LOW_AMPLITUDE_COUNT = 10;

// =======================
// Component
// =======================

/**
 * Mục đích: Màn hình chính Shadowing Session — 4-phase flow
 *   Phase 1 (Preview): AI phát câu mẫu + AI waveform + text highlight + media controls
 *   Phase 2 (Shadow): Dual waveform + phát AI + ghi âm user đồng thời
 *   Auto-navigate → Feedback khi score loaded
 * Tham số đầu vào: không (đọc từ useShadowingStore)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Sau ShadowingConfigScreen → navigate tới đây
 */
export default function ShadowingSessionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const colors = useColors();
  const haptic = useHaptic();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Store — chỉ select cần thiết
  const phase = useShadowingStore(s => s.phase);
  const session = useShadowingStore(s => s.session);
  const config = useShadowingStore(s => s.config);
  const waveform = useShadowingStore(s => s.waveform);
  const setPhase = useShadowingStore(s => s.setPhase);
  const setScoreLoading = useShadowingStore(s => s.setScoreLoading);
  const setScore = useShadowingStore(s => s.setScore);
  const setAudioUrls = useShadowingStore(s => s.setAudioUrls);
  const updateAIWaveform = useShadowingStore(s => s.updateAIWaveform);
  const updateUserWaveform = useShadowingStore(s => s.updateUserWaveform);
  const updateSentenceAudioUrl = useShadowingStore(s => s.updateSentenceAudioUrl);

  // Hooks
  const trackPlayer = useShadowingTrackPlayer();
  const recorder = useShadowingRecorder();
  const {isConnected: headphoneConnected} = useHeadphoneDetection();

  // Refs — stable across renders (Fix B4)
  const isAIPlayingRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isEvaluatingRef = useRef(false);
  const hasAutoStartedShadow = useRef(false);
  const highlightTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lowAmplitudeCounter = useRef(0);
  const scoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Ref lưu delay timer để cleanup khi unmount (Fix M-3) */
  const delayRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Ref cho timestamp kiểm tra amplitude gần nhất (Fix M-4) */
  const lastAmpCheckRef = useRef(0);

  // Local state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showLowAmplitude, setShowLowAmplitude] = useState(false);
  const [aiTimer, setAITimer] = useState('00:00.0');
  const [aiDuration, setAIDuration] = useState('00:00.0');
  const [aiProgressPercent, setAIProgressPercent] = useState(0);
  const [headphoneDisconnected, setHeadphoneDisconnected] = useState(false);

  // Sync refs (Fix B4 — stabilize refs for effect deps)
  useEffect(() => {
    isAIPlayingRef.current = trackPlayer.isPlaying;
  }, [trackPlayer.isPlaying]);

  useEffect(() => {
    isRecordingRef.current = recorder.isRecording;
  }, [recorder.isRecording]);

  // Câu hiện tại
  const currentSentence = session.sentences[session.currentIndex];

  // ===== Edge Case: HeadPhone disconnect mid-session (9.1.2) =====
  const prevHeadphoneRef = useRef(headphoneConnected);
  useEffect(() => {
    if (prevHeadphoneRef.current && !headphoneConnected) {
      // Tai nghe vừa bị rút
      console.log('⚠️ [ShadowingSession] Tai nghe bị ngắt giữa session');
      setHeadphoneDisconnected(true);
      // Auto-pause nếu đang recording
      if (isRecordingRef.current) {
        recorder.stopRecording();
      }
      if (isAIPlayingRef.current) {
        trackPlayer.stopAI();
      }
      // Fix BUG-7: Auto-dismiss toast sau 5s nếu user không cắm lại
      setTimeout(() => setHeadphoneDisconnected(false), 5000);
    } else if (!prevHeadphoneRef.current && headphoneConnected) {
      // Tai nghe vừa kết nối lại
      setHeadphoneDisconnected(false);
    }
    prevHeadphoneRef.current = headphoneConnected;
  }, [headphoneConnected, recorder, trackPlayer]);

  // ===== Edge Case: App minimize (9.2.4) =====
  useEffect(() => {
    /**
     * Mục đích: Auto-stop recording khi app minimize
     * Tham số đầu vào: nextState (AppStateStatus)
     * Tham số đầu ra: void
     * Khi nào sử dụng: User switch app hoặc lock screen
     */
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        console.log('📱 [ShadowingSession] App minimize — dừng recording');
        if (isRecordingRef.current) {
          recorder.stopRecording();
        }
        if (isAIPlayingRef.current) {
          trackPlayer.stopAI();
        }
      }
    };
    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [recorder, trackPlayer]);

  // ===== Waveform data cho AI khi đang phát =====
  useEffect(() => {
    if (phase.isAIPlaying) {
      const interval = setInterval(() => {
        const fakeAmplitudes = Array.from({length: 24}, () => Math.random() * 0.8 + 0.1);
        updateAIWaveform(fakeAmplitudes);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [phase.isAIPlaying, updateAIWaveform]);

  // ===== Edge Case: Low amplitude detection (9.1.4) — Fix M-4: throttle 300ms =====
  useEffect(() => {
    if (phase.isRecording && waveform.userData.length > 0) {
      const now = Date.now();
      if (now - lastAmpCheckRef.current < 300) return;
      lastAmpCheckRef.current = now;

      const lastAmp = waveform.userData[waveform.userData.length - 1];
      if (lastAmp < LOW_AMPLITUDE_THRESHOLD) {
        lowAmplitudeCounter.current++;
        if (lowAmplitudeCounter.current >= LOW_AMPLITUDE_COUNT && !showLowAmplitude) {
          setShowLowAmplitude(true);
          haptic.light();
          // Tự ẩn sau 3s
          setTimeout(() => setShowLowAmplitude(false), 3000);
        }
      } else {
        lowAmplitudeCounter.current = 0;
        setShowLowAmplitude(false);
      }
    }
  }, [waveform.userData, phase.isRecording, showLowAmplitude, haptic]);

  /**
   * Mục đích: Format thời gian mm:ss.d
   * Tham số đầu vào: ms — milliseconds
   * Tham số đầu ra: string — "00:02.1"
   * Khi nào sử dụng: Hiển thị AI timer + duration
   */
  const formatTime = useCallback((ms: number): string => {
    // Fix M-1: Validate NaN, Infinity, âm
    if (!Number.isFinite(ms) || ms < 0) return '00:00.0';
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSecs % 60).toString().padStart(2, '0');
    const dec = Math.floor((totalSecs % 1) * 10);
    return `${mins}:${secs}.${dec}`;
  }, []);

  // ===== Timer update — Fix BUG-1: progress/duration là number, không phải object =====
  useEffect(() => {
    if (trackPlayer.isPlaying && trackPlayer.duration > 0) {
      setAITimer(formatTime(trackPlayer.progress * 1000));
      setAIDuration(formatTime(trackPlayer.duration * 1000));
      setAIProgressPercent(
        Math.round((trackPlayer.progress / trackPlayer.duration) * 100),
      );
    }
  }, [trackPlayer.isPlaying, trackPlayer.progress, trackPlayer.duration, formatTime]);

  /**
   * Mục đích: Cleanup tất cả setTimeout cho word highlight (Fix M2)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Trước playPreview mới hoặc unmount
   */
  const clearHighlightTimers = useCallback(() => {
    highlightTimers.current.forEach(clearTimeout);
    highlightTimers.current = [];
    setHighlightIndex(-1);
  }, []);

  // Cleanup on unmount — Fix M-3: cũng cleanup delay record timer
  useEffect(() => {
    return () => {
      clearHighlightTimers();
      if (scoreTimeoutRef.current) clearTimeout(scoreTimeoutRef.current);
      if (delayRecordTimerRef.current) clearTimeout(delayRecordTimerRef.current);
    };
  }, [clearHighlightTimers]);

  /**
   * Mục đích: Phát câu mẫu AI (Preview phase)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Phase 1 mở đầu hoặc user nhấn "Replay"
   */
  const playPreview = useCallback(async () => {
    if (!currentSentence) return;

    clearHighlightTimers();

    try {
      // Generate TTS nếu chưa có audioUrl (Fix B1: immutable update)
      let audioUrl = currentSentence.audioUrl;
      if (!audioUrl) {
        audioUrl = await speakingApi.generateShadowingTTS(
          currentSentence.text,
          config.speed,
        );
        updateSentenceAudioUrl(session.currentIndex, audioUrl);
      }

      // Phát audio (Fix M4: wrapped in try/catch)
      await trackPlayer.playAI(audioUrl, config.speed);

      // Word highlight (Fix M2: store timers for cleanup)
      const words = currentSentence.text.split(/\s+/);
      // Fix BUG-6: Tính cả speed vào duration highlight
      const estimatedDuration = (words.length * 400) / config.speed;
      words.forEach((_, i) => {
        const timer = setTimeout(
          () => setHighlightIndex(i),
          i * (estimatedDuration / words.length),
        );
        highlightTimers.current.push(timer);
      });
      const endTimer = setTimeout(() => setHighlightIndex(-1), estimatedDuration);
      highlightTimers.current.push(endTimer);
    } catch (err) {
      console.error('❌ [ShadowingSession] Lỗi phát preview:', err);
      haptic.error();
    }
  }, [currentSentence, config.speed, trackPlayer, clearHighlightTimers, updateSentenceAudioUrl, session.currentIndex, haptic]);

  /**
   * Mục đích: Pause/Resume audio — xử lý riêng Preview vs Shadow
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn Pause ở Preview hoặc Shadow phase
   */
  const togglePause = useCallback(async () => {
    try {
      if (trackPlayer.isPlaying) {
        // Pause AI audio
        await trackPlayer.pauseAI();
        clearHighlightTimers();
        // Fix BUG-4: Nếu đang ở Shadow phase, cũng pause recording
        if (phase.current === 'shadow' && isRecordingRef.current) {
          await recorder.stopRecording();
        }
      } else if (phase.current === 'shadow') {
        // Fix BUG-4: Resume shadow — phát AI + bắt đầu ghi âm lại
        const audioUrl = currentSentence?.audioUrl;
        if (audioUrl) {
          await trackPlayer.playAI(audioUrl, config.speed);
          // Delay nhỏ rồi ghi âm lại
          setTimeout(async () => {
            try {
              await recorder.startRecording();
            } catch (recErr) {
              console.error('❌ [ShadowingSession] Lỗi resume ghi âm:', recErr);
            }
          }, 200);
        }
      } else {
        // Preview phase — replay bình thường
        await playPreview();
      }
    } catch (err) {
      console.error('❌ [ShadowingSession] Lỗi toggle pause:', err);
    }
  }, [trackPlayer, clearHighlightTimers, playPreview, phase, recorder, currentSentence, config.speed]);

  // Auto-play preview khi câu mới load
  useEffect(() => {
    if (phase.current === 'preview' && currentSentence) {
      hasAutoStartedShadow.current = false;
      const timer = setTimeout(() => playPreview(), 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.current, session.currentIndex]);

  /**
   * Mục đích: Bắt đầu Shadow phase — phát AI + ghi âm user đồng thời
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu Shadow" ở Preview phase
   */
  const startShadowing = useCallback(async () => {
    // Fix BUG-3: Guard chặt hơn — dùng check + set atomic-like
    if (!currentSentence || hasAutoStartedShadow.current) return;
    hasAutoStartedShadow.current = true;
    haptic.medium();

    updateUserWaveform([]);
    clearHighlightTimers();
    lowAmplitudeCounter.current = 0;

    try {
      // Generate TTS nếu cần (Fix B2: immutable update)
      let audioUrl = currentSentence.audioUrl;
      if (!audioUrl) {
        audioUrl = await speakingApi.generateShadowingTTS(
          currentSentence.text,
          config.speed,
        );
        updateSentenceAudioUrl(session.currentIndex, audioUrl);
      }

      await trackPlayer.playAI(audioUrl, config.speed);

      // Fix M-2: Set phase SAU khi playAI thành công
      setPhase('shadow');

      // Fix M-3: Lưu delay timer vào ref để cleanup khi unmount
      delayRecordTimerRef.current = setTimeout(async () => {
        try {
          await recorder.startRecording();
        } catch (recErr) {
          console.error('❌ [ShadowingSession] Lỗi bắt đầu ghi âm:', recErr);
        }
      }, config.delay * 1000);
    } catch (err) {
      console.error('❌ [ShadowingSession] Lỗi bắt đầu shadow:', err);
      // Fix BUG-3: Reset guard khi lỗi
      hasAutoStartedShadow.current = false;
      // Fix M-2: Rollback phase nếu playAI fail
      setPhase('preview');
    }
  }, [currentSentence, config, haptic, setPhase, updateUserWaveform, clearHighlightTimers, trackPlayer, recorder, updateSentenceAudioUrl, session.currentIndex]);

  /**
   * Mục đích: Dừng recording + gửi evaluate + navigate feedback
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: AI kết thúc phát (auto) hoặc user nhấn "Dừng & Chấm điểm"
   */
  const handleStopAndEvaluate = useCallback(async () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    setIsEvaluating(true);

    try {
      const audioUri = await recorder.stopRecording();
      await trackPlayer.stopAI();

      if (!audioUri || !currentSentence) {
        isEvaluatingRef.current = false;
        setIsEvaluating(false);
        return;
      }

      setPhase('score');
      setScoreLoading(true);
      setAudioUrls(currentSentence.audioUrl, audioUri);

      // Timeout protection (Edge case 9.3.3)
      scoreTimeoutRef.current = setTimeout(() => {
        console.warn('⏱️ [ShadowingSession] Score timeout > 15s');
        isEvaluatingRef.current = false;
        setIsEvaluating(false);
        setScoreLoading(false);
        haptic.error();
      }, SCORE_TIMEOUT_MS);

      const result = await speakingApi.evaluateShadowingWithAudio(
        audioUri,
        currentSentence.text,
        config.speed,
      );

      // Clear timeout — đã nhận kết quả
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
        scoreTimeoutRef.current = null;
      }

      setScore({
        rhythm: result.rhythm,
        intonation: result.intonation,
        accuracy: result.accuracy,
        overall: result.overall,
        tips: result.tips,
        wordIssues: result.wordIssues,
      });

      navigation.navigate('ShadowingFeedback');
    } catch (err) {
      console.error('❌ [ShadowingSession] Lỗi evaluate:', err);
      haptic.error();
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
        scoreTimeoutRef.current = null;
      }
    } finally {
      isEvaluatingRef.current = false;
      setIsEvaluating(false);
    }
  }, [
    recorder, trackPlayer, currentSentence, config.speed,
    setPhase, setScoreLoading, setAudioUrls, setScore, navigation, haptic,
  ]);

  // Fix BUG-2: Dùng ref cho handleStopAndEvaluate để tránh stale closure
  const handleStopAndEvaluateRef = useRef(handleStopAndEvaluate);
  useEffect(() => {
    handleStopAndEvaluateRef.current = handleStopAndEvaluate;
  }, [handleStopAndEvaluate]);

  // Auto-stop recording khi AI kết thúc (Fix B4: dùng ref thay vì hook value)
  useEffect(() => {
    // Kiểm tra bằng ref + interval thay vì effect dependency trực tiếp
    if (phase.current !== 'shadow' || !hasAutoStartedShadow.current) return;

    const checkInterval = setInterval(() => {
      if (!isAIPlayingRef.current && isRecordingRef.current) {
        clearInterval(checkInterval);
        // AI đã kết thúc → dừng recording sau 1s buffer
        setTimeout(async () => {
          if (!isEvaluatingRef.current) {
            // Fix BUG-2: Gọi qua ref — luôn lấy closure mới nhất
            await handleStopAndEvaluateRef.current();
          }
        }, 1000);
      }
    }, 200);

    return () => clearInterval(checkInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.current]);

  /**
   * Mục đích: Thoát session — cleanup tất cả audio
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn back/X
   */
  const handleExit = useCallback(async () => {
    clearHighlightTimers();
    try {
      await trackPlayer.stopAI();
      if (isRecordingRef.current) {
        await recorder.stopRecording();
      }
    } catch (e) {
      // Bỏ qua lỗi cleanup
    }
    navigation.goBack();
  }, [trackPlayer, recorder, navigation, clearHighlightTimers]);

  // ===== Render =====

  if (!currentSentence) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}}>
        <AppText style={{color: colors.neutrals400}} raw>Không có câu nào</AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText style={{fontSize: 16, fontWeight: '700', color: colors.foreground}} raw>
          Shadowing
        </AppText>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <AppText style={{fontSize: 13, color: colors.neutrals400}} raw>
            Câu {session.currentIndex + 1}/{session.totalSentences}
          </AppText>
          {/* Headphone chip (mockup 21) */}
          {headphoneConnected && (
            <View style={[styles.headphoneChip, {backgroundColor: '#22c55e20'}]}>
              <AppText style={{fontSize: 10}} raw>🎧</AppText>
              <View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginLeft: 3}} />
            </View>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, {backgroundColor: colors.glassBg}]}>
        <View
          style={{
            height: 3,
            backgroundColor: speakingColor,
            borderRadius: 2,
            width: `${((session.currentIndex + 1) / session.totalSentences) * 100}%`,
          }}
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Sentence Card */}
        <SentenceHighlightCard
          text={currentSentence.text}
          ipa={currentSentence.ipa}
          highlightIndex={highlightIndex}
        />

        {/* AI Waveform — hiện cả Preview và Shadow (mockup 20) */}
        {(phase.current === 'preview' || phase.current === 'shadow') && (
          <View style={[styles.trackSection, {backgroundColor: colors.surface}]}>
            {/* AI Track Header */}
            <View style={styles.trackHeader}>
              <AppText style={{fontSize: 13, fontWeight: '600', color: colors.foreground}} raw>
                AI Audio
              </AppText>
              <View style={{flexDirection: 'row', gap: 8}}>
                <View style={[styles.inlineBadge, {backgroundColor: `${speakingColor}15`}]}>
                  <AppText style={{fontSize: 10, fontWeight: '700', color: speakingColor}} raw>
                    ⚡ {config.speed}x
                  </AppText>
                </View>
                <View style={[styles.inlineBadge, {backgroundColor: `${speakingColor}15`}]}>
                  <AppText style={{fontSize: 10, fontWeight: '700', color: speakingColor}} raw>
                    ⏱️ {config.delay}s
                  </AppText>
                </View>
              </View>
            </View>

            {/* AI Waveform bars */}
            <DualWaveformVisualizer
              aiData={waveform.aiData}
              userData={phase.current === 'shadow' ? waveform.userData : []}
              isAIPlaying={phase.isAIPlaying}
              isUserRecording={phase.isRecording}
              trackHeight={45}
            />

            {/* Timer */}
            <View style={styles.timerRow}>
              <AppText style={{fontSize: 11, color: colors.neutrals400}} raw>
                {aiProgressPercent}%
              </AppText>
              <AppText style={{fontSize: 11, color: colors.neutrals400}} raw>
                {aiTimer} / {aiDuration}
              </AppText>
            </View>

            {/* Status indicators (mockup 21) */}
            {phase.current === 'shadow' && (
              <View style={styles.statusRow}>
                <View style={[styles.statusChip, {backgroundColor: '#E879F920'}]}>
                  <AppText style={{fontSize: 10, color: '#E879F9'}} raw>
                    🔊 AI đang phát
                  </AppText>
                </View>
                <AppText style={{fontSize: 10, color: colors.neutrals500}} raw>•</AppText>
                <View style={[styles.statusChip, {backgroundColor: '#4ADE8020'}]}>
                  <AppText style={{fontSize: 10, color: '#4ADE80'}} raw>
                    🎤 Đang ghi âm
                  </AppText>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Low amplitude toast (Edge case 9.1.4) */}
        {showLowAmplitude && (
          <View style={[styles.lowAmpToast, {backgroundColor: '#f59e0b20', borderColor: '#f59e0b40'}]}>
            <AppText style={{fontSize: 12, color: '#f59e0b', fontWeight: '600'}} raw>
              🔇 Hãy nói to hơn nhé! Mic không bắt được âm thanh
            </AppText>
          </View>
        )}

        {/* Headphone disconnect toast (Edge case 9.1.2) */}
        {headphoneDisconnected && (
          <View style={[styles.lowAmpToast, {backgroundColor: '#ef444420', borderColor: '#ef444440'}]}>
            <AppText style={{fontSize: 12, color: '#ef4444', fontWeight: '600'}} raw>
              🎧 Tai nghe bị ngắt! Phiên đã tạm dừng.
            </AppText>
          </View>
        )}

        {/* Evaluating indicator */}
        {isEvaluating && (
          <View style={styles.evaluatingContainer}>
            <ActivityIndicator color={speakingColor} size="large" />
            <AppText style={{color: colors.neutrals400, marginTop: 12, fontSize: 14}} raw>
              🧠 Đang phân tích giọng nói...
            </AppText>
          </View>
        )}
      </View>

      {/* Phase label (mockup 20) */}
      {phase.current === 'preview' && (
        <View style={{alignItems: 'center', marginBottom: 8}}>
          <AppText style={{fontSize: 14, fontWeight: '700', color: colors.foreground}} raw>
            🎧 Nghe trước — Lần 1
          </AppText>
          <AppText style={{fontSize: 12, color: colors.neutrals400, marginTop: 2}} raw>
            Nghe qua 1 lần rồi bắt đầu shadow
          </AppText>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={[styles.controls, {borderTopColor: colors.glassDivider}]}>
        {phase.current === 'preview' && (
          <>
            {/* Media controls row (mockup 20: Replay / Pause / Skip) */}
            <View style={styles.mediaRow}>
              <TouchableOpacity
                style={[styles.mediaBtn, {backgroundColor: colors.glassBg}]}
                onPress={playPreview}
                activeOpacity={0.7}>
                <Icon name="SkipBack" className="w-5 h-5" style={{color: colors.foreground}} />
                <AppText style={{fontSize: 10, color: colors.neutrals400, marginTop: 2}} raw>Replay</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mediaBtnLarge, {backgroundColor: colors.glassBg}]}
                onPress={togglePause}
                activeOpacity={0.7}>
                <Icon
                  name={trackPlayer.isPlaying ? 'Pause' : 'Play'}
                  className="w-6 h-6"
                  style={{color: colors.foreground}}
                />
                <AppText style={{fontSize: 10, color: colors.neutrals400, marginTop: 2}} raw>
                  {trackPlayer.isPlaying ? 'Pause' : 'Play'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mediaBtn, {backgroundColor: colors.glassBg}]}
                onPress={startShadowing}
                activeOpacity={0.7}>
                <Icon name="SkipForward" className="w-5 h-5" style={{color: colors.foreground}} />
                <AppText style={{fontSize: 10, color: colors.neutrals400, marginTop: 2}} raw>Skip</AppText>
              </TouchableOpacity>

              {/* Speed badge */}
              <View style={[styles.speedBadgeInline, {backgroundColor: `${speakingColor}20`}]}>
                <AppText style={{fontSize: 12, fontWeight: '700', color: speakingColor}} raw>
                  {config.speed}x
                </AppText>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.primaryBtn, {backgroundColor: speakingColor}]}
              onPress={startShadowing}
              activeOpacity={0.8}>
              <AppText style={{fontSize: 15, fontWeight: '700', color: '#FFFFFF'}} raw>
                🎤 Bắt đầu Shadow câu này
              </AppText>
            </TouchableOpacity>

            {/* Sub-text (mockup 20) */}
            <TouchableOpacity onPress={playPreview} style={{alignSelf: 'center', marginTop: 6}}>
              <AppText style={{fontSize: 12, color: colors.neutrals400}} raw>
                Hoặc nghe thêm lần nữa
              </AppText>
            </TouchableOpacity>
          </>
        )}

        {phase.current === 'shadow' && (
          <>
            {/* Pause button (mockup 21) — Fix BUG-4: icon phản ánh trạng thái */}
            <TouchableOpacity
              style={[styles.outlineBtn, {borderColor: colors.glassBorderStrong}]}
              onPress={togglePause}
              activeOpacity={0.7}>
              <Icon name={trackPlayer.isPlaying ? 'Pause' : 'Play'} className="w-4 h-4" style={{color: colors.foreground}} />
              <AppText style={{fontSize: 13, fontWeight: '600', color: colors.foreground, marginLeft: 6}} raw>
                {trackPlayer.isPlaying ? 'Pause' : 'Resume'}
              </AppText>
            </TouchableOpacity>

            {/* Stop & Score button */}
            <TouchableOpacity
              style={[styles.primaryBtn, {backgroundColor: '#EF4444'}]}
              onPress={handleStopAndEvaluate}
              disabled={isEvaluating}
              activeOpacity={0.8}>
              <AppText style={{fontSize: 15, fontWeight: '700', color: '#FFFFFF'}} raw>
                ⏹️ Dừng & Chấm điểm
              </AppText>
            </TouchableOpacity>
          </>
        )}

        {/* Fix BUG-5: Score phase — hiện loading + retry khi timeout */}
        {phase.current === 'score' && (
          <>
            {isEvaluating ? (
              <View style={styles.evaluatingContainer}>
                <ActivityIndicator color={speakingColor} size="large" />
                <AppText style={{color: colors.neutrals400, marginTop: 12, fontSize: 14}} raw>
                  🧠 Đang phân tích giọng nói...
                </AppText>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, {backgroundColor: speakingColor}]}
                onPress={() => {
                  setPhase('preview');
                  hasAutoStartedShadow.current = false;
                }}
                activeOpacity={0.8}>
                <AppText style={{fontSize: 15, fontWeight: '700', color: '#FFFFFF'}} raw>
                  🔄 Thử lại câu này
                </AppText>
              </TouchableOpacity>
            )}
          </>
        )}
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
    paddingVertical: 10,
  },
  headphoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressBar: {
    height: 3,
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  trackSection: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inlineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowAmpToast: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  evaluatingContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  mediaBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaBtnLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBadgeInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    position: 'absolute',
    right: 0,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
  },
});

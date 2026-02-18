import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Pressable, Animated, Platform, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import {
  VoiceVisualizer,
  CountdownOverlay,
  WaveformComparison,
  ScoreBreakdown,
  PhonemeHeatmap,
  ConfettiAnimation,
} from '@/components/speaking';

// Khai báo optional modules
let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule = require('react-native-audio-recorder-player').default;
} catch {
  console.warn('⚠️ [Shadowing] react-native-audio-recorder-player chưa install');
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [Shadowing] react-native-fs chưa install');
}

const speakingColor = SKILL_COLORS.speaking.dark;
const audioRecorderPlayer = AudioRecorderPlayerModule
  ? new AudioRecorderPlayerModule()
  : null;

// =======================
// Types
// =======================

type ShadowPhase = 'listen' | 'countdown' | 'record' | 'result';

/**
 * Mục đích: Chế độ Shadowing — nghe AI → lặp lại → so sánh waveform + điểm
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → navigate Shadowing
 *   Flow: Nghe AI → Countdown → Ghi âm → So sánh kết quả
 */
export default function ShadowingScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const {sentences, currentIndex, nextSentence, clearRecording} = useSpeakingStore();

  const currentSentence = sentences[currentIndex];
  const progress = `${currentIndex + 1} / ${sentences.length}`;

  // State chính
  const [phase, setPhase] = useState<ShadowPhase>('listen');
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Kết quả
  const [result, setResult] = useState<{
    overallScore: number;
    scores: {label: string; value: number; icon: string}[];
    wordByWord: {word: string; score: number; issue?: string}[];
  } | null>(null);

  // Waveform data (giả lập — trong thực tế sẽ lấy từ audio analysis)
  const [aiWaveform] = useState(() =>
    Array.from({length: 40}, () => 0.2 + Math.random() * 0.8),
  );
  const [userWaveform, setUserWaveform] = useState<number[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation cho mic
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.15, duration: 500, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [isRecording, pulseAnim]);

  /**
   * Mục đích: Phát audio AI mẫu
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Phase "listen" — user nhấn play
   */
  const handlePlayAI = useCallback(async () => {
    if (isPlayingAI || !currentSentence) return;
    try {
      setIsPlayingAI(true);
      console.log('🔊 [Shadowing] Phát AI mẫu...');
      const base64 = await speakingApi.playAISample(currentSentence.text);
      const path = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/shadow_ai.mp3`;
      await RNFSModule?.writeFile(path, base64, 'base64');
      await audioRecorderPlayer?.startPlayer(path);

      audioRecorderPlayer?.addPlayBackListener((e: any) => {
        if (e.currentPosition >= e.duration) {
          audioRecorderPlayer?.stopPlayer();
          audioRecorderPlayer?.removePlayBackListener();
          setIsPlayingAI(false);
        }
      });
    } catch (err) {
      console.error('❌ [Shadowing] Lỗi phát mẫu:', err);
      setIsPlayingAI(false);
    }
  }, [isPlayingAI, currentSentence]);

  /**
   * Mục đích: Chuyển sang phase countdown → record
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu lặp lại"
   */
  const handleStartShadow = useCallback(() => {
    setPhase('countdown');
    console.log('⏱️ [Shadowing] Bắt đầu countdown...');
  }, []);

  /**
   * Mục đích: Bắt đầu ghi âm sau countdown
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Countdown hoàn tất
   */
  const handleCountdownDone = useCallback(async () => {
    setPhase('record');
    setIsRecording(true);
    setRecordDuration(0);

    try {
      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/shadow_record.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/shadow_record.mp4`,
      })!;
      await audioRecorderPlayer?.startRecorder(path);
      console.log('🎙️ [Shadowing] Ghi âm bắt đầu');

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs += 1;
        setRecordDuration(secs);
        if (secs >= 15) {
          handleStopRecord();
        }
      }, 1000);
    } catch (err) {
      console.error('❌ [Shadowing] Lỗi ghi âm:', err);
      setIsRecording(false);
      setPhase('listen');
    }
  }, []);

  /**
   * Mục đích: Dừng ghi âm → evaluate → hiện kết quả
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn stop hoặc hết 15s
   */
  const handleStopRecord = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const uri = (await audioRecorderPlayer?.stopRecorder()) || '';
      setIsRecording(false);
      setIsProcessing(true);
      console.log('⏹️ [Shadowing] Dừng ghi âm, đang xử lý...');

      // Tạo waveform giả cho user
      setUserWaveform(Array.from({length: 40}, () => 0.2 + Math.random() * 0.8));

      // Transcribe + Evaluate
      const transcript = await speakingApi.transcribeAudio(uri);
      const evalResult = await speakingApi.evaluatePronunciation(
        currentSentence.text,
        transcript,
      );

      setResult({
        overallScore: evalResult.overallScore,
        scores: [
          {label: 'Phát âm', value: evalResult.pronunciation, icon: '🎯'},
          {label: 'Trôi chảy', value: evalResult.fluency, icon: '💬'},
          {label: 'Tốc độ', value: evalResult.pace, icon: '⚡'},
        ],
        wordByWord: evalResult.wordByWord,
      });

      if (evalResult.overallScore >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }

      setPhase('result');
      console.log('✅ [Shadowing] Kết quả:', evalResult.overallScore);
    } catch (err: any) {
      console.error('❌ [Shadowing] Lỗi xử lý:', err);
      setPhase('listen');
    } finally {
      setIsProcessing(false);
    }
  }, [currentSentence]);

  /**
   * Mục đích: Thử lại cùng câu
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Thử lại"
   */
  const handleRetry = useCallback(() => {
    setPhase('listen');
    setResult(null);
    clearRecording();
  }, [clearRecording]);

  /**
   * Mục đích: Chuyển sang câu tiếp
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Câu tiếp"
   */
  const handleNext = useCallback(() => {
    nextSentence();
    clearRecording();
    setPhase('listen');
    setResult(null);
  }, [nextSentence, clearRecording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!currentSentence) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppText variant="body" raw>Không có câu. Vui lòng quay lại.</AppText>
        <AppButton variant="outline" className="mt-4" onPress={() => navigation.goBack()}>
          Quay lại
        </AppButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Confetti */}
      <ConfettiAnimation visible={showConfetti} />

      {/* Countdown */}
      <CountdownOverlay
        visible={phase === 'countdown'}
        from={3}
        onComplete={handleCountdownDone}
        sentencePreview={currentSentence.text}
      />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost" size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">🎧 Shadowing</AppText>
          <AppText variant="caption" className="text-neutrals400">{progress}</AppText>
        </View>
        <View className="w-9" />
      </View>

      {/* Progress bar */}
      <View className="mx-4 mb-4">
        <View className="h-1 rounded-full bg-neutrals200 overflow-hidden">
          <View
            className="h-1 rounded-full"
            style={{
              width: `${((currentIndex + 1) / sentences.length) * 100}%`,
              backgroundColor: speakingColor,
            }}
          />
        </View>
      </View>

      {/* === PHASE: LISTEN === */}
      {phase === 'listen' && (
        <View className="flex-1 px-6 justify-center items-center">
          <AppText variant="heading2" weight="semibold" className="text-center text-foreground mb-6" raw>
            {currentSentence.text}
          </AppText>
          {currentSentence.ipa && (
            <AppText variant="bodySmall" className="text-neutrals400 mb-8 text-center" raw>
              {currentSentence.ipa}
            </AppText>
          )}

          {/* Nút nghe */}
          <AppButton
            variant="outline" size="default"
            onPress={handlePlayAI}
            disabled={isPlayingAI}
            icon={<Icon name="Volume2" className="w-5 h-5 text-foreground" />}>
            {isPlayingAI ? 'Đang phát...' : '🔊 Nghe AI mẫu'}
          </AppButton>

          <View className="h-8" />

          {/* Nút bắt đầu shadow */}
          <AppButton
            variant="primary" size="lg"
            style={{backgroundColor: speakingColor}}
            onPress={handleStartShadow}>
            🎙️ Bắt đầu lặp lại
          </AppButton>
        </View>
      )}

      {/* === PHASE: RECORD === */}
      {phase === 'record' && (
        <View className="flex-1 px-6 justify-center items-center">
          <AppText variant="heading2" weight="semibold" className="text-center text-foreground mb-4" raw>
            {currentSentence.text}
          </AppText>

          <VoiceVisualizer isRecording={isRecording} height={50} color={speakingColor} />

          <AppText variant="heading3" weight="bold" className="text-foreground mt-3" raw>
            {formatTime(recordDuration)}
          </AppText>

          <View className="mt-6">
            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
              <Pressable
                onPress={handleStopRecord}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: '#ef4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#ef4444',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }}>
                <Icon name="Square" className="w-7 h-7 text-white" />
              </Pressable>
            </Animated.View>
          </View>

          <AppText variant="bodySmall" className="text-neutrals400 mt-3" raw>
            Nhấn để dừng ghi âm
          </AppText>
        </View>
      )}

      {/* === PROCESSING === */}
      {isProcessing && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={speakingColor} />
          <AppText variant="body" className="text-neutrals400 mt-4" raw>
            Đang so sánh phát âm...
          </AppText>
        </View>
      )}

      {/* === PHASE: RESULT === */}
      {phase === 'result' && result && (
        <View className="flex-1">
          <View style={{paddingTop: 16}}>
            {/* Score lớn */}
            <View className="items-center mb-4">
              <AppText variant="heading1" weight="bold" style={{color: speakingColor, fontSize: 52}} raw>
                {result.overallScore}
              </AppText>
              <AppText variant="bodySmall" className="text-neutrals400" raw>/ 100</AppText>
            </View>

            {/* Waveform so sánh */}
            <WaveformComparison aiWaveform={aiWaveform} userWaveform={userWaveform} height={70} />

            {/* Score breakdown */}
            <ScoreBreakdown scores={result.scores} />

            {/* Phoneme heatmap */}
            <PhonemeHeatmap words={result.wordByWord} />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 px-4 pb-4 mt-auto">
            <AppButton variant="outline" size="lg" className="flex-1" onPress={handleRetry}>
              🔁 Thử lại
            </AppButton>
            <AppButton
              variant="primary" size="lg" className="flex-1"
              style={{backgroundColor: speakingColor}}
              onPress={currentIndex >= sentences.length - 1 ? () => navigation.popToTop() : handleNext}>
              {currentIndex >= sentences.length - 1 ? '✅ Hoàn thành' : '➡️ Câu tiếp'}
            </AppButton>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

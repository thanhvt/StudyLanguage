import React, {useCallback, useRef, useState} from 'react';
import {View, FlatList, Pressable, Animated, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import {speakingApi} from '@/services/api/speaking';
import SpeedChallengeMeter from '@/components/speaking/SpeedChallengeMeter';
import {VoiceVisualizer, ConfettiAnimation, ScoreBreakdown} from '@/components/speaking';

// Optional modules
let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule = require('react-native-audio-recorder-player').default;
} catch {
  console.warn('⚠️ [TongueTwister] react-native-audio-recorder-player chưa install');
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [TongueTwister] react-native-fs chưa install');
}

const speakingColor = SKILL_COLORS.speaking.dark;
const audioRecorderPlayer = AudioRecorderPlayerModule ? new AudioRecorderPlayerModule() : null;

// =======================
// Mock data
// =======================

interface TongueTwister {
  id: string;
  text: string;
  targetWPM: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const TWISTERS: TongueTwister[] = [
  {id: '1', text: 'She sells seashells by the seashore.', targetWPM: 80, difficulty: 'easy'},
  {id: '2', text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?', targetWPM: 90, difficulty: 'medium'},
  {id: '3', text: 'Peter Piper picked a peck of pickled peppers.', targetWPM: 85, difficulty: 'easy'},
  {id: '4', text: 'Unique New York, you know you need unique New York.', targetWPM: 100, difficulty: 'medium'},
  {id: '5', text: 'The sixth sick sheik\'s sixth sheep\'s sick.', targetWPM: 70, difficulty: 'hard'},
  {id: '6', text: 'A big black bear sat on a big black rug.', targetWPM: 90, difficulty: 'easy'},
  {id: '7', text: 'Pad kid poured curd pulled cod.', targetWPM: 80, difficulty: 'hard'},
  {id: '8', text: 'Red lorry, yellow lorry, red lorry, yellow lorry.', targetWPM: 100, difficulty: 'medium'},
];

// =======================
// Screen
// =======================

/**
 * Mục đích: Tongue Twister challenge — đọc nhanh + đúng
 * Tham số đầu vào: không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → navigate TongueTwister
 *   Flow: Chọn câu → Ghi âm → AI chấm tốc độ + phát âm → Xem kết quả
 */
export default function TongueTwisterScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();

  // State
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [phase, setPhase] = useState<'select' | 'practice' | 'result'>('select');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Kết quả
  const [result, setResult] = useState<{
    wpm: number;
    score: number;
    scores: {label: string; value: number; icon: string}[];
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentTwister = TWISTERS[selectedIdx];

  // Pulse animation
  React.useEffect(() => {
    if (isRecording) {
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
  }, [isRecording, pulseAnim]);

  /**
   * Mục đích: Nghe AI đọc mẫu câu tongue twister
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Nghe mẫu"
   */
  const handlePlaySample = useCallback(async () => {
    try {
      const base64 = await speakingApi.playAISample(currentTwister.text);
      const path = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/twister_sample.mp3`;
      await RNFSModule?.writeFile(path, base64, 'base64');
      await audioRecorderPlayer?.startPlayer(path);
      console.log('🔊 [TongueTwister] Phát mẫu');
    } catch (err) {
      console.error('❌ [TongueTwister] Lỗi phát mẫu:', err);
    }
  }, [currentTwister]);

  /**
   * Mục đích: Bắt đầu ghi âm
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn mic
   */
  const handleStartRecord = useCallback(async () => {
    setIsRecording(true);
    setRecordDuration(0);
    startTimeRef.current = Date.now();

    try {
      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/twister_record.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/twister_record.mp4`,
      })!;
      await audioRecorderPlayer?.startRecorder(path);

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs += 1;
        setRecordDuration(secs);
        if (secs >= 15) handleStopRecord();
      }, 1000);
    } catch (err) {
      console.error('❌ [TongueTwister] Lỗi ghi âm:', err);
      setIsRecording(false);
    }
  }, []);

  /**
   * Mục đích: Dừng ghi → tính WPM → evaluate
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn stop
   */
  const handleStopRecord = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const uri = (await audioRecorderPlayer?.stopRecorder()) || '';
      setIsRecording(false);

      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedMin = elapsedMs / 60000;
      const wordCount = currentTwister.text.split(' ').length;
      const wpm = Math.round(wordCount / elapsedMin);

      // Transcribe + evaluate
      const transcript = await speakingApi.transcribeAudio(uri);
      const evalResult = await speakingApi.evaluatePronunciation(
        currentTwister.text,
        transcript,
      );

      setResult({
        wpm,
        score: evalResult.overallScore,
        scores: [
          {label: 'Phát âm', value: evalResult.pronunciation, icon: '🎯'},
          {label: 'Tốc độ', value: Math.min(Math.round((wpm / currentTwister.targetWPM) * 100), 100), icon: '⚡'},
          {label: 'Trôi chảy', value: evalResult.fluency, icon: '💬'},
        ],
      });

      if (evalResult.overallScore >= 80 && wpm >= currentTwister.targetWPM * 0.8) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }

      setPhase('result');
      console.log(`✅ [TongueTwister] WPM: ${wpm} | Score: ${evalResult.overallScore}`);
    } catch (err) {
      console.error('❌ [TongueTwister] Lỗi xử lý:', err);
      setIsRecording(false);
    }
  }, [currentTwister]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ConfettiAnimation visible={showConfetti} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost" size="icon"
          onPress={() => phase === 'select' ? navigation.goBack() : setPhase('select')}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">👅 Tongue Twister</AppText>
        </View>
        <View className="w-9" />
      </View>

      {/* === SELECT PHASE === */}
      {phase === 'select' && (
        <FlatList
          data={TWISTERS}
          renderItem={({item, index}) => (
            <Pressable
              onPress={() => {
                setSelectedIdx(index);
                setPhase('practice');
                setResult(null);
              }}
              style={({pressed}) => ({
                padding: 14,
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 14,
                backgroundColor: pressed ? `${speakingColor}15` : colors.surface,
                flexDirection: 'row',
                alignItems: 'center',
              })}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: `${speakingColor}15`,
                alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <AppText variant="bodySmall" weight="bold" style={{color: speakingColor}} raw>
                  {index + 1}
                </AppText>
              </View>
              <View style={{flex: 1}}>
                <AppText variant="body" className="text-foreground" numberOfLines={2} raw>
                  {item.text}
                </AppText>
                <AppText variant="caption" className="text-neutrals400 mt-1" raw>
                  Mục tiêu: {item.targetWPM} wpm · {item.difficulty === 'easy' ? 'Dễ' : item.difficulty === 'medium' ? 'TB' : 'Khó'}
                </AppText>
              </View>
              <Icon name="ChevronRight" className="w-4 h-4" style={{color: colors.neutrals400}} />
            </Pressable>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingTop: 8, paddingBottom: 24}}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* === PRACTICE PHASE === */}
      {phase === 'practice' && (
        <View className="flex-1 px-6 justify-center items-center">
          {/* Câu tongue twister */}
          <AppText
            variant="heading2"
            weight="bold"
            className="text-center text-foreground mb-2"
            raw>
            {currentTwister.text}
          </AppText>
          <AppText variant="caption" className="text-neutrals400 mb-8" raw>
            Mục tiêu: {currentTwister.targetWPM} wpm
          </AppText>

          {/* Nút nghe mẫu */}
          <AppButton
            variant="outline" size="sm"
            onPress={handlePlaySample}
            icon={<Icon name="Volume2" className="w-4 h-4 text-foreground" />}
            className="mb-8">
            Nghe mẫu
          </AppButton>

          {/* Waveform + timer khi đang ghi */}
          {isRecording && (
            <View className="mb-4 items-center">
              <VoiceVisualizer isRecording height={40} color={speakingColor} />
              <AppText variant="heading3" weight="bold" className="text-foreground mt-2" raw>
                {formatTime(recordDuration)}
              </AppText>
            </View>
          )}

          {/* Nút mic */}
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <Pressable
              onPress={isRecording ? handleStopRecord : handleStartRecord}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isRecording ? '#ef4444' : speakingColor,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isRecording ? '#ef4444' : speakingColor,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.4,
                shadowRadius: 12,
              }}>
              <Icon
                name={isRecording ? 'Square' : 'Mic'}
                className="w-8 h-8 text-white"
              />
            </Pressable>
          </Animated.View>

          <AppText variant="bodySmall" className="mt-4 text-neutrals400" raw>
            {isRecording ? 'Nhấn để dừng' : 'Nhấn để bắt đầu'}
          </AppText>
        </View>
      )}

      {/* === RESULT PHASE === */}
      {phase === 'result' && result && (
        <View className="flex-1">
          <View className="items-center pt-6 mb-4">
            <AppText variant="heading1" weight="bold" style={{color: speakingColor, fontSize: 48}} raw>
              {result.score}
            </AppText>
            <AppText variant="bodySmall" className="text-neutrals400" raw>/ 100</AppText>
          </View>

          {/* Speed meter */}
          <SpeedChallengeMeter
            currentWPM={result.wpm}
            targetWPM={currentTwister.targetWPM}
          />

          {/* Score breakdown */}
          <ScoreBreakdown scores={result.scores} />

          {/* Câu đã luyện */}
          <View className="mx-4 p-4 rounded-2xl mb-4" style={{backgroundColor: colors.surface}}>
            <AppText variant="bodySmall" weight="semibold" className="text-neutrals400 mb-1" raw>
              Câu đã luyện
            </AppText>
            <AppText variant="body" className="text-foreground" raw>
              {currentTwister.text}
            </AppText>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 px-4 mt-auto pb-4">
            <AppButton variant="outline" size="lg" className="flex-1"
              onPress={() => {
                setPhase('practice');
                setResult(null);
              }}>
              🔁 Thử lại
            </AppButton>
            <AppButton
              variant="primary" size="lg" className="flex-1"
              style={{backgroundColor: speakingColor}}
              onPress={() => setPhase('select')}>
              📋 Chọn câu khác
            </AppButton>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

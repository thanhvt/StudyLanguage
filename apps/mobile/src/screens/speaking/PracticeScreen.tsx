import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {useColors} from '@/hooks/useColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import {SKILL_COLORS} from '@/config/skillColors';
import Icon from '@/components/ui/Icon';

// Khai báo type cho optional native modules
// Sẽ hoạt động khi install react-native-audio-recorder-player
let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule = require('react-native-audio-recorder-player').default;
} catch {
  console.warn('⚠️ [Speaking] react-native-audio-recorder-player chưa install');
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [Speaking] react-native-fs chưa install');
}

// =======================
// Constants
// =======================

const MAX_RECORD_SECONDS = 15;
const speakingColor = SKILL_COLORS.speaking.dark;

// =======================
// Audio Recorder
// =======================

const audioRecorderPlayer = AudioRecorderPlayerModule ? new AudioRecorderPlayerModule() : null;

/**
 * Mục đích: Màn hình luyện phát âm chính — hiển thị câu + hold-to-record
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → sinh câu thành công → navigate Practice
 *   Flow: Xem câu → nghe AI mẫu → giữ nút mic → nói → thả → AI chấm → navigate Feedback
 */
export default function PracticeScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();

  // Store
  const {
    sentences,
    currentIndex,
    isRecording,
    recordingDuration,
    isTranscribing,
    isFeedbackLoading,
    error,
    startRecording,
    stopRecording,
    setRecordingDuration,
    setTranscribing,
    setFeedbackLoading,
    setFeedback,
    setError,
  } = useSpeakingStore();

  const currentSentence = sentences[currentIndex];
  const progress = `${currentIndex + 1} / ${sentences.length}`;

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing animation khi ghi âm
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  /**
   * Mục đích: Bắt đầu ghi âm khi user nhấn giữ nút mic
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: onPressIn trên nút mic
   */
  const handlePressIn = useCallback(async () => {
    try {
      setError(null);
      startRecording();

      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speaking_record.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speaking_record.mp4`,
      })!;

      await audioRecorderPlayer?.startRecorder(path);
      console.log('🎙️ [Practice] Bắt đầu ghi âm tại:', path);

      // Timer đếm giây
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
        if (seconds >= MAX_RECORD_SECONDS) {
          handlePressOut();
        }
      }, 1000);
    } catch (err) {
      console.error('❌ [Practice] Lỗi bắt đầu ghi âm:', err);
      setError('Không thể truy cập microphone');
      stopRecording('');
    }
  }, [startRecording, setRecordingDuration, setError, stopRecording]);

  /**
   * Mục đích: Dừng ghi âm + gửi transcribe + evaluate
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: onPressOut trên nút mic hoặc khi đạt max time
   */
  const handlePressOut = useCallback(async () => {
    try {
      // Xóa timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const audioUri = await audioRecorderPlayer?.stopRecorder() || '';
      stopRecording(audioUri);
      console.log('⏹️ [Practice] Dừng ghi âm:', audioUri);

      if (!audioUri || recordingDuration < 1) {
        setError('Ghi âm quá ngắn, hãy thử lại');
        return;
      }

      // Bước 1: Transcribe audio → text
      setTranscribing(true);
      console.log('🔄 [Practice] Đang transcribe...');
      const userTranscript = await speakingApi.transcribeAudio(audioUri);
      setTranscribing(false);

      if (!userTranscript.trim()) {
        setError('Không nghe được gì, thử nói to hơn nhé!');
        return;
      }

      // Bước 2: Evaluate pronunciation
      setFeedbackLoading(true);
      console.log('🔄 [Practice] Đang đánh giá phát âm...');
      const result = await speakingApi.evaluatePronunciation(
        currentSentence.text,
        userTranscript,
      );
      setFeedback(result);
      console.log('✅ [Practice] Đánh giá xong! Điểm:', result.overallScore);

      // Navigate qua Feedback
      navigation.navigate('Feedback');
    } catch (err: any) {
      console.error('❌ [Practice] Lỗi xử lý:', err);
      setTranscribing(false);
      setFeedbackLoading(false);
      setError(err?.message || 'Lỗi xử lý ghi âm');
    }
  }, [
    stopRecording,
    recordingDuration,
    setTranscribing,
    setFeedbackLoading,
    setFeedback,
    setError,
    currentSentence,
    navigation,
  ]);

  /**
   * Mục đích: Phát audio mẫu từ AI TTS
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút 🔊 "Nghe mẫu"
   */
  const handlePlayAISample = useCallback(async () => {
    if (isPlayingAI) return;
    try {
      setIsPlayingAI(true);
      console.log('🔊 [Practice] Phát audio mẫu...');
      const base64Audio = await speakingApi.playAISample(currentSentence.text);

      // Lưu base64 → file → phát
      const tempPath = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/ai_sample.mp3`;
      await RNFSModule?.writeFile(tempPath, base64Audio, 'base64');
      await audioRecorderPlayer?.startPlayer(tempPath);

      audioRecorderPlayer?.addPlayBackListener((e: any) => {
        if (e.currentPosition >= e.duration) {
          audioRecorderPlayer?.stopPlayer();
          audioRecorderPlayer?.removePlayBackListener();
          setIsPlayingAI(false);
        }
      });
    } catch (err) {
      console.error('❌ [Practice] Lỗi phát mẫu:', err);
      setIsPlayingAI(false);
    }
  }, [isPlayingAI, currentSentence]);

  // Trạng thái đang xử lý
  const isProcessing = isTranscribing || isFeedbackLoading;

  // Format timer
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!currentSentence) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppText variant="body" raw>
          Không có câu nào để luyện. Vui lòng quay lại.
        </AppText>
        <AppButton variant="outline" className="mt-4" onPress={() => navigation.goBack()}>
          Quay lại
        </AppButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}
        >
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="bodySmall" weight="semibold" className="text-foreground" raw>
            {progress}
          </AppText>
        </View>
        <View className="w-9" />
      </View>

      {/* Progress bar */}
      <View className="mx-4 mb-6">
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

      {/* Nội dung chính */}
      <View className="flex-1 px-6 justify-center">
        {/* Câu practice */}
        <View className="items-center mb-8">
          <AppText
            variant="heading2"
            weight="semibold"
            className="text-center text-foreground leading-9"
            raw
          >
            {currentSentence.text}
          </AppText>

          {/* IPA (nếu có) */}
          {currentSentence.ipa && (
            <AppText
              variant="bodySmall"
              className="mt-2 text-neutrals400 text-center"
              raw
            >
              {currentSentence.ipa}
            </AppText>
          )}
        </View>

        {/* Nút nghe mẫu */}
        <View className="items-center mb-10">
          <AppButton
            variant="outline"
            size="sm"
            onPress={handlePlayAISample}
            disabled={isPlayingAI}
            icon={<Icon name="Volume2" className="w-4 h-4 text-foreground" />}
          >
            {isPlayingAI ? 'Đang phát...' : 'Nghe mẫu'}
          </AppButton>
        </View>
      </View>

      {/* Khu vực ghi âm (bottom) */}
      <View className="items-center pb-8 px-6">
        {/* Trạng thái xử lý */}
        {isProcessing && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color={speakingColor} />
            <AppText variant="bodySmall" className="ml-2 text-neutrals400" raw>
              {isTranscribing ? 'Đang nhận diện giọng nói...' : 'Đang đánh giá phát âm...'}
            </AppText>
          </View>
        )}

        {/* Error */}
        {error && (
          <View className="mb-4 px-4 py-2 rounded-xl bg-red-500/10">
            <AppText variant="bodySmall" className="text-red-400 text-center" raw>
              {error}
            </AppText>
          </View>
        )}

        {/* Timer khi ghi âm */}
        {isRecording && (
          <View className="mb-4 items-center">
            <AppText
              variant="heading3"
              weight="bold"
              className="text-foreground"
              raw
            >
              {formatTime(recordingDuration)}
            </AppText>
            <AppText variant="bodySmall" className="text-neutrals400" raw>
              Thả để kết thúc
            </AppText>
          </View>
        )}

        {/* Nút MIC - hold to record */}
        <Animated.View style={{transform: [{scale: pulseAnim}]}}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isProcessing}
            style={({pressed}) => ({
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isRecording
                ? '#ef4444'
                : pressed
                  ? `${speakingColor}DD`
                  : speakingColor,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isProcessing ? 0.5 : 1,
              // Shadow
              shadowColor: isRecording ? '#ef4444' : speakingColor,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            })}
          >
            <Icon
              name={isRecording ? 'MicOff' : 'Mic'}
              className="w-8 h-8 text-white"
            />
          </Pressable>
        </Animated.View>

        {/* Hướng dẫn */}
        {!isRecording && !isProcessing && (
          <AppText
            variant="bodySmall"
            className="mt-4 text-neutrals400 text-center"
            raw
          >
            Giữ nút mic và đọc to, rõ ràng
          </AppText>
        )}
      </View>
    </SafeAreaView>
  );
}

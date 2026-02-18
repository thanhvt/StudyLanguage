import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
  TouchableOpacity,
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
import {
  CountdownOverlay,
  RecordingPreview,
  IPAPopup,
  VoiceVisualizer,
} from '@/components/speaking';

// Khai báo type cho optional native modules
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
 * Mục đích: Màn hình luyện phát âm chính — countdown → record → preview → submit
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → sinh câu thành công → navigate Practice
 *   Flow: Xem câu → countdown 3-2-1 → ghi âm → preview → submit → Feedback
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
    audioUri,
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
    clearRecording,
  } = useSpeakingStore();

  const currentSentence = sentences[currentIndex];
  const progress = `${currentIndex + 1} / ${sentences.length}`;

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sprint 2: Các state mới
  const [showCountdown, setShowCountdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPlaybackPreview, setIsPlaybackPreview] = useState(false);
  const [ipaPopup, setIpaPopup] = useState<{visible: boolean; word: string; ipa: string}>({
    visible: false,
    word: '',
    ipa: '',
  });

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
   * Mục đích: Bắt đầu countdown trước khi ghi âm
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút mic
   */
  const handleMicPress = useCallback(() => {
    setError(null);
    setShowCountdown(true);
    console.log('🗣️ [Practice] Bắt đầu countdown...');
  }, [setError]);

  /**
   * Mục đích: Bắt đầu ghi âm sau countdown
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Countdown kết thúc → auto-start recording
   */
  const handleCountdownComplete = useCallback(async () => {
    setShowCountdown(false);
    try {
      startRecording();
      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speaking_record.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speaking_record.mp4`,
      })!;

      await audioRecorderPlayer?.startRecorder(path);
      console.log('🎙️ [Practice] Bắt đầu ghi âm tại:', path);

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
        if (seconds >= MAX_RECORD_SECONDS) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('❌ [Practice] Lỗi bắt đầu ghi âm:', err);
      setError('Không thể truy cập microphone');
      stopRecording('');
    }
  }, [startRecording, setRecordingDuration, setError, stopRecording]);

  /**
   * Mục đích: Dừng ghi âm → hiện preview
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút stop hoặc đạt max time
   */
  const handleStopRecording = useCallback(async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const uri = await audioRecorderPlayer?.stopRecorder() || '';
      stopRecording(uri);
      console.log('⏹️ [Practice] Dừng ghi âm:', uri);

      if (uri && recordingDuration >= 1) {
        setShowPreview(true);
      } else {
        setError('Ghi âm quá ngắn, hãy thử lại');
      }
    } catch (err) {
      console.error('❌ [Practice] Lỗi dừng ghi âm:', err);
      stopRecording('');
    }
  }, [stopRecording, recordingDuration, setError]);

  /**
   * Mục đích: Phát lại recording preview
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn play trên RecordingPreview
   */
  const handlePlaybackPreview = useCallback(async () => {
    if (!audioUri) return;
    try {
      if (isPlaybackPreview) {
        await audioRecorderPlayer?.stopPlayer();
        setIsPlaybackPreview(false);
      } else {
        setIsPlaybackPreview(true);
        await audioRecorderPlayer?.startPlayer(audioUri);
        audioRecorderPlayer?.addPlayBackListener((e: any) => {
          if (e.currentPosition >= e.duration) {
            audioRecorderPlayer?.stopPlayer();
            audioRecorderPlayer?.removePlayBackListener();
            setIsPlaybackPreview(false);
          }
        });
      }
    } catch (err) {
      console.error('❌ [Practice] Lỗi phát lại:', err);
      setIsPlaybackPreview(false);
    }
  }, [audioUri, isPlaybackPreview]);

  /**
   * Mục đích: Ghi lại (discard recording hiện tại)
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Ghi lại" trên RecordingPreview
   */
  const handleReRecord = useCallback(() => {
    setShowPreview(false);
    clearRecording();
    console.log('🔄 [Practice] Ghi lại...');
  }, [clearRecording]);

  /**
   * Mục đích: Submit recording → transcribe → evaluate → navigate Feedback
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Gửi" trên RecordingPreview
   */
  const handleSubmitRecording = useCallback(async () => {
    if (!audioUri) return;

    try {
      setShowPreview(false);

      // Bước 1: Transcribe
      setTranscribing(true);
      console.log('🔄 [Practice] Đang transcribe...');
      const userTranscript = await speakingApi.transcribeAudio(audioUri);
      setTranscribing(false);

      if (!userTranscript.trim()) {
        setError('Không nghe được gì, thử nói to hơn nhé!');
        return;
      }

      // Bước 2: Evaluate
      setFeedbackLoading(true);
      console.log('🔄 [Practice] Đang đánh giá phát âm...');
      const result = await speakingApi.evaluatePronunciation(
        currentSentence.text,
        userTranscript,
      );
      setFeedback(result);
      console.log('✅ [Practice] Đánh giá xong! Điểm:', result.overallScore);

      navigation.navigate('Feedback');
    } catch (err: any) {
      console.error('❌ [Practice] Lỗi xử lý:', err);
      setTranscribing(false);
      setFeedbackLoading(false);
      setError(err?.message || 'Lỗi xử lý ghi âm');
    }
  }, [
    audioUri,
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

  /**
   * Mục đích: Mở IPA popup khi tap vào từ
   * Tham số đầu vào: word (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 từ trong câu practice
   */
  const handleWordTap = useCallback((word: string) => {
    setIpaPopup({
      visible: true,
      word,
      ipa: `/${word.toLowerCase()}/`,
    });
  }, []);

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
      {/* Countdown Overlay */}
      <CountdownOverlay
        visible={showCountdown}
        from={3}
        onComplete={handleCountdownComplete}
        sentencePreview={currentSentence.text}
      />

      {/* IPA Popup */}
      <IPAPopup
        visible={ipaPopup.visible}
        onClose={() => setIpaPopup(prev => ({...prev, visible: false}))}
        word={ipaPopup.word}
        ipa={ipaPopup.ipa}
        onPlaySample={async (word) => {
          try {
            const audio = await speakingApi.playAISample(word);
            const path = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/ipa_sample.mp3`;
            await RNFSModule?.writeFile(path, audio, 'base64');
            await audioRecorderPlayer?.startPlayer(path);
          } catch (err) {
            console.error('❌ Lỗi phát IPA sample:', err);
          }
        }}
      />

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
        {/* Câu practice — từng từ tap-able để xem IPA */}
        <View className="items-center mb-8">
          <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
            {currentSentence.text.split(' ').map((word, i) => (
              <TouchableOpacity
                key={`${word}-${i}`}
                onPress={() => handleWordTap(word)}
                activeOpacity={0.6}>
                <AppText
                  variant="heading2"
                  weight="semibold"
                  className="text-foreground leading-9"
                  style={{marginHorizontal: 3}}
                  raw>
                  {word}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

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

        {/* Recording Preview (Sprint 2) */}
        {showPreview && audioUri ? (
          <RecordingPreview
            audioUri={audioUri}
            duration={recordingDuration}
            isPlaying={isPlaybackPreview}
            onPlayback={handlePlaybackPreview}
            onReRecord={handleReRecord}
            onSubmit={handleSubmitRecording}
            isSubmitting={isProcessing}
          />
        ) : (
          <>
            {/* Waveform khi đang ghi âm */}
            {isRecording && (
              <View className="mb-4 items-center">
                <VoiceVisualizer isRecording={isRecording} height={40} />
                <AppText
                  variant="heading3"
                  weight="bold"
                  className="text-foreground mt-2"
                  raw>
                  {formatTime(recordingDuration)}
                </AppText>
                <AppText variant="bodySmall" className="text-neutrals400" raw>
                  Nhấn để dừng
                </AppText>
              </View>
            )}

            {/* Nút MIC */}
            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
              <Pressable
                onPress={isRecording ? handleStopRecording : handleMicPress}
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
                  shadowColor: isRecording ? '#ef4444' : speakingColor,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                })}
              >
                <Icon
                  name={isRecording ? 'Square' : 'Mic'}
                  className="w-8 h-8 text-white"
                />
              </Pressable>
            </Animated.View>

            {/* Hướng dẫn */}
            {!isRecording && !isProcessing && (
              <AppText
                variant="bodySmall"
                className="mt-4 text-neutrals400 text-center"
                raw>
                Nhấn để bắt đầu ghi âm
              </AppText>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

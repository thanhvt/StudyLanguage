import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
  TouchableOpacity,
  AppState,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {useColors} from '@/hooks/useColors';
import {useSkillColor} from '@/hooks/useSkillColor';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import Icon from '@/components/ui/Icon';
import {
  CountdownOverlay,
  RecordingPreview,
  IPAPopup,
  VoiceVisualizer,
} from '@/components/speaking';
import LinearGradient from 'react-native-linear-gradient';

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
  const speakingColor = useSkillColor('speaking');

  // Store
  const {
    sentences,
    currentIndex,
    isRecording,
    recordingDuration,
    audioUri,
    isTranscribing,
    isFeedbackLoading,
    feedback,
    error,
    displaySettings,
    startRecording,
    stopRecording,
    setRecordingDuration,
    setTranscribing,
    setFeedbackLoading,
    setFeedback,
    setError,
    clearRecording,
    setShowIPA,
    nextSentence: storeNextSentence,
    prevSentence: storePrevSentence,
  } = useSpeakingStore();

  const currentSentence = sentences[currentIndex];
  const progress = `${currentIndex + 1} / ${sentences.length}`;

  // Ref cho duration — tránh stale closure trong handleStopRecording (C2 fix)
  const durationRef = useRef(0);
  useEffect(() => { durationRef.current = recordingDuration; }, [recordingDuration]);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

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

  // Timer cleanup khi unmount (E7 fix)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // AppState handler — auto-stop recording khi app vào background (E3 fix)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active' && isRecordingRef.current) {
        console.log('⚠️ [Practice] App vào background, auto-stop recording');
        handleStopRecording();
      }
    });
    return () => subscription.remove();
  }, []);

  /**
   * Mục đích: Bắt đầu countdown trước khi ghi âm
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút mic
   */
  const handleMicPress = useCallback(async () => {
    setError(null);

    // Check mic permission (E1 fix)
    if (Platform.OS === 'android') {
      try {
        const {PermissionsAndroid} = require('react-native');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Cần quyền microphone',
            message: 'Ứng dụng cần quyền truy cập micro để ghi âm giọng nói của bạn',
            buttonPositive: 'Cho phép',
            buttonNegative: 'Từ chối',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Cần quyền micro', 'Vui lòng cấp quyền micro trong Cài đặt để sử dụng chức năng ghi âm.', [
            {text: 'Đóng'},
          ]);
          return;
        }
      } catch (err) {
        console.error('❌ [Practice] Lỗi xin quyền micro:', err);
        return;
      }
    }

    // Guard audioRecorderPlayer null (A7 fix)
    if (!audioRecorderPlayer) {
      Alert.alert('Lỗi', 'Module ghi âm chưa sẵn sàng. Vui lòng khởi động lại ứng dụng.');
      return;
    }

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

      // Dùng durationRef thay vì recordingDuration (C2 fix — tránh stale closure)
      if (uri && durationRef.current >= 1) {
        setShowPreview(true);
      } else {
        setError('Ghi âm quá ngắn, hãy thử lại');
      }
    } catch (err) {
      console.error('❌ [Practice] Lỗi dừng ghi âm:', err);
      stopRecording('');
    }
  }, [stopRecording, setError]);

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

      // Guard feedback không null trước khi navigate (C1 fix)
      if (result) {
        navigation.navigate('Feedback');
      } else {
        setError('Không nhận được kết quả đánh giá. Vui lòng thử lại.');
      }
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
          <AppText variant="body" weight="bold" className="text-foreground" raw>
            Practice
          </AppText>
          <AppText variant="caption" className="text-neutrals400" raw>
            Câu {currentIndex + 1}/{sentences.length}
          </AppText>
        </View>
        {/* Toggle IPA */}
        <TouchableOpacity
          onPress={() => setShowIPA(!displaySettings.showIPA)}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: displaySettings.showIPA ? `${speakingColor}20` : undefined,
          }}
          accessibilityRole="button"
          accessibilityLabel={displaySettings.showIPA ? 'Ẩn IPA' : 'Hiện IPA'}>
          <AppText variant="caption" weight="semibold"
            style={{color: displaySettings.showIPA ? speakingColor : colors.neutrals400}}
            raw>
            {displaySettings.showIPA ? '👁️ IPA' : '👁️‍🗨️ IPA'}
          </AppText>
        </TouchableOpacity>
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
        {/* B5: Glassmorphism card cho câu practice */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            borderRadius: 24,
            padding: 24,
            marginBottom: 32,
          }}>
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

          {/* IPA — toggleable theo displaySettings.showIPA */}
          {displaySettings.showIPA && currentSentence.ipa && (
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
            {/* B8: Mic button green gradient */}
            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
              <Pressable
                onPress={isRecording ? handleStopRecording : handleMicPress}
                disabled={isProcessing}>
                <LinearGradient
                  colors={
                    isRecording
                      ? ['#ef4444', '#dc2626']
                      : ['#22c55e', '#16a34a']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignItems: 'center' as const,
                    justifyContent: 'center' as const,
                    opacity: isProcessing ? 0.5 : 1,
                    shadowColor: isRecording ? '#ef4444' : '#22c55e',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}>
                  <Icon
                    name={isRecording ? 'Square' : 'Mic'}
                    className="w-8 h-8 text-white"
                  />
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Hướng dẫn — match mockup: "Giữ để ghi âm" + "Vuốt lên để hủy" */}
            {!isRecording && !isProcessing && (
              <AppText
                variant="bodySmall"
                className="mt-4 text-neutrals400 text-center"
                raw>
                Giữ để ghi âm • Tối đa {MAX_RECORD_SECONDS}s
              </AppText>
            )}
            {isRecording && (
              <AppText
                variant="caption"
                className="mt-2 text-neutrals400 text-center"
                raw>
                ↑ Vuốt lên để hủy
              </AppText>
            )}
          </>
        )}
      </View>

      {/* Sentence Navigation — ← Câu trước / Câu sau → (B6 fix) */}
      {!isRecording && !isProcessing && !showPreview && sentences.length > 1 && (
        <View className="flex-row justify-between px-6 pb-4">
          <TouchableOpacity
            onPress={() => { storePrevSentence(); clearRecording(); }}
            disabled={currentIndex === 0}
            style={{opacity: currentIndex === 0 ? 0.3 : 1}}
            accessibilityLabel="Câu trước">
            <AppText variant="bodySmall" weight="semibold"
              style={{color: speakingColor}} raw>
              ← Câu trước
            </AppText>
          </TouchableOpacity>

          <AppText variant="caption" className="text-neutrals400" raw>
            Vuốt lên để hủy
          </AppText>

          <TouchableOpacity
            onPress={() => { storeNextSentence(); clearRecording(); }}
            disabled={currentIndex >= sentences.length - 1}
            style={{opacity: currentIndex >= sentences.length - 1 ? 0.3 : 1}}
            accessibilityLabel="Câu sau">
            <AppText variant="bodySmall" weight="semibold"
              style={{color: speakingColor}} raw>
              Câu sau →
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

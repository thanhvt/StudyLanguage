import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
  TouchableOpacity,
  AppState,
  Alert,
  StyleSheet,
  PanResponder,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {useColors} from '@/hooks/useColors';
import {useSkillColor} from '@/hooks/useSkillColor';
import {useAppStore} from '@/store/useAppStore';
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
import {isLiquidGlassSupported} from '@/utils/LiquidGlass';
import TrackPlayer from 'react-native-track-player';
import {setupPlayer} from '@/services/audio/trackPlayer';

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

  // Theme detection
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // Store
  const {
    config,
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
    bestScores,
    startRecording,
    stopRecording,
    setRecordingDuration,
    setTranscribing,
    setFeedbackLoading,
    setFeedback,
    setError,
    clearRecording,
    setShowIPA,
    setShowStress,
    setBestScore,
    nextSentence: storeNextSentence,
    prevSentence: storePrevSentence,
  } = useSpeakingStore();

  const currentSentence = sentences[currentIndex];
  const progress = `${currentIndex + 1} / ${sentences.length}`;
  const currentBestScore = currentSentence ? (bestScores[currentSentence.id] ?? 0) : 0;
  const topicName = config?.topic?.name || '';

  /**
   * Mục đích: Parse IPA string để tìm các từ có trọng âm chính (ˈ)
   * Cách hoạt động: IPA chia theo dấu cách, mỗi đoạn tương ứng 1 từ trong câu.
   *   Nếu đoạn chứa ˈ (primary stress) → từ đó có trọng âm chính → highlight
   *   VD: IPA "/ɪts bɪn soʊ lɔŋ sɪns wi ˈlæst mɛt/" → "last" (ˈlæst) có stress
   * Tham số đầu vào: ipa (string), wordCount (number)
   * Tham số đầu ra: Set<number> — set các word index có stress
   * Khi nào sử dụng: render từng từ trong sentence card khi Stress toggle bật
   */
  const stressedIndices = useMemo(() => {
    if (!currentSentence?.ipa) return new Set<number>();
    const ipa = currentSentence.ipa.replace(/^\/?/, '').replace(/\/?$/, '').trim();
    const ipaTokens = ipa.split(/\s+/);
    const words = currentSentence.text.split(' ');
    const stressed = new Set<number>();

    // Mạnh sử dụng 2 chiến lược:
    // 1. IPA tokens == words count → map 1-1
    // 2. Content words (nouns, verbs, adj, adv) thường có stress
    if (ipaTokens.length === words.length) {
      ipaTokens.forEach((token, idx) => {
        if (token.includes('\u02C8')) stressed.add(idx); // \u02C8 = ˈ (primary stress)
      });
    } else {
      // Fallback: đánh dấu các content words (>= 4 chars, không phải function words)
      const functionWords = new Set([
        'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
        'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'and', 'or', 'but',
        'it', 'its', 'i', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'his', 'our', 'your', 'their', 'this', 'that', 'so', 'if', 'as',
        'do', 'did', 'has', 'had', 'have', 'not', 'no', 'can', 'will', 'would',
      ]);
      words.forEach((w, idx) => {
        const lower = w.toLowerCase().replace(/[^a-z]/g, '');
        if (lower.length >= 4 && !functionWords.has(lower)) {
          stressed.add(idx);
        }
      });
    }
    return stressed;
  }, [currentSentence?.ipa, currentSentence?.text]);

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

  // TrackPlayer: auto-reset isPlaybackPreview khi audio kết thúc
  useEffect(() => {
    const sub = TrackPlayer.addEventListener('playback-queue-ended' as any, () => {
      setIsPlaybackPreview(false);
      setIsPlayingAI(false);
    });
    return () => sub.remove();
  }, []);

  // ===== Swipe-to-cancel recording =====
  const swipeY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 10,
      onPanResponderMove: (_, gs) => {
        // Chỉ cho swipe lên (dy < 0)
        if (gs.dy < 0) {
          swipeY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -80) {
          // Swipe đủ xa (>80px lên) → huỷ recording
          console.log('❌ [Practice] Swipe up → huỷ ghi âm');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          audioRecorderPlayer?.removeRecordBackListener?.();
          audioRecorderPlayer?.stopRecorder?.().catch(() => {});
          stopRecording('');
          clearRecording();
          setShowPreview(false);
        }
        // Reset vị trí
        Animated.spring(swipeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;
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
        // Dừng timer trước
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Dừng recorder — catch silent vì có thể đã nil
        audioRecorderPlayer?.stopRecorder().catch(() => {
          console.log('ℹ️ [Practice] Recorder đã dừng trước đó, bỏ qua');
        });
        stopRecording('');
        isRecordingRef.current = false;
      }
    });
    return () => subscription.remove();
  }, [stopRecording]);

  /**
   * Mục đích: Chặn back navigation khi user có dữ liệu chưa lưu
   * Tham số đầu vào: không (dùng beforeRemove event từ React Navigation)
   * Tham số đầu ra: void (hiện Alert confirm hoặc cho thoát)
   * Khi nào sử dụng:
   *   User nhấn nút back hoặc swipe-back gesture trên iOS
   *   Chỉ chặn khi có dữ liệu đáng mất: đang ghi âm, đã ghi âm, hoặc đã luyện qua >=1 câu
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      const hasUnsavedData = !!audioUri || currentIndex > 0 || isRecordingRef.current;
      if (!hasUnsavedData) return; // Cho thoát bình thường

      // Chặn navigation mặc định
      e.preventDefault();

      Alert.alert(
        'Thoát luyện tập?',
        'Tiến trình hiện tại sẽ không được lưu.',
        [
          {text: 'Tiếp tục luyện', style: 'cancel'},
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, audioUri, currentIndex]);

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
      // Cleanup: stop TrackPlayer + recorder trước khi start mới
      // TrackPlayer giờ dùng cùng iosCategory .playAndRecord → không conflict nữa
      try {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        setIsPlayingAI(false);
      } catch {
        // TrackPlayer chưa setup thì bỏ qua
      }
      try {
        await audioRecorderPlayer?.stopRecorder();
      } catch {
        // Recorder chưa start thì bỏ qua
      }
      try {
        audioRecorderPlayer?.removeRecordBackListener?.();
      } catch {
        // Bỏ qua
      }

      // Chờ iOS xử lý chuyển đổi audio session (200ms)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 200));

      startRecording();
      // FIX: Chỉ truyền TÊN FILE, KHÔNG truyền full path
      // Native Swift setAudioFileURL() làm: cachesDirectory.appendingPathComponent(path)
      // Nếu path = "/var/.../Caches/speaking_record.m4a" → kết quả sai:
      //   "/var/.../Caches/var/.../Caches/speaking_record.m4a" (thư mục không tồn tại)
      // → AVAudioRecorder.record() trả false → "Error occurred during initiating recorder"
      const path = Platform.select({
        ios: 'speaking_record.m4a',
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/speaking_record.mp4`,
      })!;

      // Start recorder với retry 1 lần (safety net)
      try {
        await audioRecorderPlayer?.startRecorder(path);
      } catch (initErr) {
        console.warn('⚠️ [Practice] Recorder init fail lần 1, retry sau 300ms...');
        await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
        await audioRecorderPlayer?.startRecorder(path);
      }
      console.log('🎙️ [Practice] Bắt đầu ghi âm tại:', path);

      // Register listener cho native rn-recordback events
      // → tránh warning "Sending rn-recordback with no listeners registered"
      // → cũng giữ native timer tham chiếu đúng
      audioRecorderPlayer?.addRecordBackListener?.((e: any) => {
        // Có thể dùng e.currentPosition nếu cần precision cao hơn
      });

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
      setError('Không thể truy cập microphone. Thử thoát app và mở lại.');
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
    // Dừng timer trước
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Guard: nếu không đang recording thì bỏ qua (tránh stop trên recorder nil)
    if (!isRecordingRef.current) {
      console.log('ℹ️ [Practice] Không đang ghi âm, bỏ qua stop');
      return;
    }

    try {
      // Remove listener trước khi stop → tránh leak + warning
      audioRecorderPlayer?.removeRecordBackListener?.();

      let uri = (await audioRecorderPlayer?.stopRecorder()) || '';

      // JS stopRecorder() trả 'Already stopped' khi _isRecording flag = false (out of sync)
      // → native recorder timer vẫn chạy → phải force gọi native trực tiếp
      if (uri === 'Already stopped') {
        try {
          const {NativeModules} = require('react-native');
          uri = (await NativeModules.RNAudioRecorderPlayer?.stopRecorder()) || '';
        } catch {
          // Native recorder đã nil → bỏ qua, timer sẽ tự hết
        }
      }
      stopRecording(uri);
      console.log('⏹️ [Practice] Dừng ghi âm:', uri);

      // Dùng durationRef thay vì recordingDuration (C2 fix — tránh stale closure)
      if (uri && uri !== 'Already stopped' && durationRef.current >= 1) {
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
        await TrackPlayer.pause();
        setIsPlaybackPreview(false);
      } else {
        setIsPlaybackPreview(true);
        await setupPlayer();
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: `preview-${Date.now()}`,
          url: audioUri,
          title: 'Bản ghi âm',
          artist: 'Bạn',
        });
        await TrackPlayer.play();
        console.log('▶️ [Practice] Phát lại recording preview qua TrackPlayer');
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
      console.log('🔊 [Practice] Phát audio mẫu qua TrackPlayer...');
      const base64Audio = await speakingApi.playAISample(currentSentence.text);

      if (!base64Audio) {
        console.warn('⚠️ [Practice] Không nhận được audio từ server');
        setError('Không nhận được audio mẫu. Kiểm tra kết nối mạng.');
        setIsPlayingAI(false);
        return;
      }

      console.log(`🔊 [Practice] Audio base64 length: ${base64Audio.length} chars`);

      // Ghi file base64 → mp3
      const tempPath = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/ai_sample.mp3`;
      await RNFSModule?.writeFile(tempPath, base64Audio, 'base64');

      // Phát qua TrackPlayer (routing ra speaker đúng cách)
      await setupPlayer();
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `ai-sample-${Date.now()}`,
        url: `file://${tempPath}`,
        title: 'AI Mẫu',
        artist: 'AI Teacher',
      });
      await TrackPlayer.play();
      console.log('🔊 [Practice] TrackPlayer đã start phát mẫu');

      // Tự reset isPlayingAI sau khi phát xong (ước tính ~5s, hoặc dùng event)
      // TrackPlayer events được xử lý global, ở đây dùng timeout đơn giản
      setTimeout(() => {
        setIsPlayingAI(false);
      }, 8000);
    } catch (err: any) {
      console.error('❌ [Practice] Lỗi phát mẫu:', err);
      const isNetworkError = err?.message?.includes('Network Error') || err?.code === 'ECONNABORTED';
      setError(
        isNetworkError
          ? 'Mất kết nối mạng. Không thể phát audio mẫu.'
          : 'Lỗi phát audio mẫu. Thử lại sau.',
      );
      setIsPlayingAI(false);
    }
  }, [isPlayingAI, currentSentence, setError]);

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

  // Glassmorphism card style — theo design mockup
  const glassCardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    // Hiệu ứng shadow cho light mode
    ...(isDark ? {} : {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    }),
  };

  if (!currentSentence) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
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
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* ======================== */}
      {/* GLASSMORPHISM BACKGROUND — Green palette (giống ConfigScreen) */}
      {/* ======================== */}
      {isLiquidGlassSupported && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Lớp 1: Green-to-dark gradient */}
          <LinearGradient
            colors={['#14532DB3', '#16A34A40', 'transparent', '#15803D20']}
            locations={[0, 0.15, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 2: Emerald ambient glow */}
          <LinearGradient
            colors={['transparent', '#05966950', '#04785730', 'transparent']}
            locations={[0.1, 0.35, 0.55, 0.85]}
            start={{x: 0, y: 0.2}}
            end={{x: 1, y: 0.8}}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 3: Spotlight top */}
          <LinearGradient
            colors={['rgba(200,255,220,0.12)', 'transparent']}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 0.25}}
            style={[StyleSheet.absoluteFill, {height: '25%'}]}
          />
        </View>
      )}

      <SafeAreaView style={styles.container}>
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
              // Dùng TrackPlayer để routing ra speaker
              await setupPlayer();
              await TrackPlayer.reset();
              await TrackPlayer.add({id: `ipa-${Date.now()}`, url: `file://${path}`, title: word, artist: 'AI'});
              await TrackPlayer.play();
            } catch (err) {
              console.error('❌ Lỗi phát IPA sample:', err);
            }
          }}
        />

        {/* ======================== */}
        {/* HEADER: ← Practice (left) | TopicName (right) */}
        {/* ======================== */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              // Dùng goBack() — logic confirm đã được xử lý qua beforeRemove event
              navigation.goBack();
            }}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityLabel="Quay lại"
            accessibilityRole="button">
            <Icon name="ArrowLeft" className="w-5 h-5" style={{color: colors.foreground}} />
          </TouchableOpacity>
          <AppText
            style={{fontSize: 17, fontWeight: '700', color: colors.foreground, marginLeft: 12}}>
            Practice
          </AppText>
          <View style={{flex: 1}} />
          {/* Topic name — căn bên phải */}
          {topicName ? (
            <View style={[
              styles.topicBadge,
              {borderColor: `${speakingColor}60`, backgroundColor: `${speakingColor}15`},
            ]}>
              <AppText style={{fontSize: 12, fontWeight: '600', color: speakingColor}}>
                {topicName}
              </AppText>
            </View>
          ) : (
            <AppText style={{fontSize: 13, color: colors.neutrals400}}>
              Câu {currentIndex + 1}/{sentences.length}
            </AppText>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarTrack, {backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${((currentIndex + 1) / sentences.length) * 100}%`,
                  backgroundColor: speakingColor,
                },
              ]}
            />
          </View>
        </View>

        {/* ======================== */}
        {/* NỘI DUNG CHÍNH — Glassmorphism Card */}
        {/* ======================== */}
        <View style={styles.contentArea}>
          {/* Glassmorphism sentence card — theo design mockup */}
          <View style={glassCardStyle}>
            {/* Card header: "Sentence x of y" + Best Score */}
            <View style={styles.cardHeader}>
              <AppText style={{fontSize: 12, color: colors.neutrals400}}>
                Sentence {currentIndex + 1} of {sentences.length}
              </AppText>
              {currentBestScore > 0 && (
                <View style={styles.bestScoreBadge}>
                  <AppText style={{fontSize: 12, fontWeight: '700', color: '#fbbf24'}}>
                    ⭐ Best: {currentBestScore}
                  </AppText>
                </View>
              )}
            </View>

            {/* Từng từ tap-able để xem IPA — highlight stressed words khi Stress toggle bật */}
            <View style={styles.sentenceWordsWrap}>
              {currentSentence.text.split(' ').map((word: string, i: number) => {
                const isStressed = displaySettings.showStress && stressedIndices.has(i);
                return (
                  <TouchableOpacity
                    key={`${word}-${i}`}
                    onPress={() => handleWordTap(word)}
                    activeOpacity={0.6}>
                    <AppText
                      style={{
                        fontSize: 26,
                        fontWeight: isStressed ? '800' : '600',
                        color: isStressed ? speakingColor : colors.foreground,
                        lineHeight: 38,
                        marginHorizontal: 3,
                        textDecorationLine: isStressed ? 'underline' : 'none',
                        textDecorationColor: isStressed ? speakingColor : undefined,
                      }}>
                      {word}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* IPA — toggleable */}
            {displaySettings.showIPA && currentSentence.ipa && (
              <AppText
                style={{
                  fontSize: 14,
                  color: speakingColor,
                  textAlign: 'center',
                  marginTop: 12,
                  fontStyle: 'italic',
                }}>
                {currentSentence.ipa}
              </AppText>
            )}

            {/* Action chips — IPA / Stress / Listen (equal width, icons) */}
            <View style={styles.actionChipsRow}>
              {/* IPA chip */}
              <TouchableOpacity
                style={[
                  styles.actionChip,
                  displaySettings.showIPA && {backgroundColor: `${speakingColor}20`, borderColor: speakingColor},
                  !displaySettings.showIPA && {borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'},
                ]}
                onPress={() => setShowIPA(!displaySettings.showIPA)}
                accessibilityLabel={displaySettings.showIPA ? 'Ẩn IPA' : 'Hiện IPA'}>
                <AppText style={{fontSize: 13, fontWeight: '600', color: displaySettings.showIPA ? speakingColor : colors.foreground}}>
                  IPA
                </AppText>
                <Icon name="Languages" className="w-3.5 h-3.5 ml-1" style={{color: displaySettings.showIPA ? speakingColor : colors.foreground, marginLeft: 5}} />
              </TouchableOpacity>

              {/* Stress chip */}
              <TouchableOpacity
                style={[
                  styles.actionChip,
                  displaySettings.showStress && {backgroundColor: `${speakingColor}20`, borderColor: speakingColor},
                  !displaySettings.showStress && {borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'},
                ]}
                onPress={() => setShowStress(!displaySettings.showStress)}
                accessibilityLabel={displaySettings.showStress ? 'Ẩn Stress' : 'Hiện Stress'}>
                <AppText style={{fontSize: 13, fontWeight: '600', color: displaySettings.showStress ? speakingColor : colors.foreground}}>
                  Stress
                </AppText>
                <Icon name="Underline" className="w-3.5 h-3.5 ml-1" style={{color: displaySettings.showStress ? speakingColor : colors.foreground, marginLeft: 5}} />
              </TouchableOpacity>

              {/* Listen chip */}
              <TouchableOpacity
                style={[
                  styles.actionChip,
                  isPlayingAI && {backgroundColor: `${speakingColor}20`, borderColor: speakingColor},
                  !isPlayingAI && {borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'},
                ]}
                onPress={handlePlayAISample}
                disabled={isPlayingAI}
                accessibilityLabel={isPlayingAI ? 'Đang phát' : 'Nghe mẫu'}>
                <AppText style={{fontSize: 13, fontWeight: '600', color: isPlayingAI ? speakingColor : colors.foreground}}>
                  {isPlayingAI ? 'Đang phát...' : 'Listen'}
                </AppText>
                <Icon name="Volume2" className="w-3.5 h-3.5 ml-1" style={{color: isPlayingAI ? speakingColor : colors.foreground, marginLeft: 5}} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ======================== */}
        {/* KHU VỰC GHI ÂM (bottom) */}
        {/* ======================== */}
        <View style={styles.recordingArea}>
          {/* Trạng thái xử lý */}
          {isProcessing && (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={speakingColor} />
              <AppText style={{fontSize: 13, color: colors.neutrals400, marginLeft: 8}}>
                {isTranscribing ? 'Đang nhận diện giọng nói...' : 'Đang đánh giá phát âm...'}
              </AppText>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={[styles.errorBox, {backgroundColor: 'rgba(239,68,68,0.1)'}]}>
              <AppText style={{fontSize: 13, color: '#f87171', textAlign: 'center'}}>
                {error}
              </AppText>
            </View>
          )}

          {/* Recording Preview */}
          {showPreview && audioUri ? (
            <View style={{width: '100%'}}>
              <RecordingPreview
                audioUri={audioUri}
                duration={recordingDuration}
                isPlaying={isPlaybackPreview}
                onPlayback={handlePlaybackPreview}
                onReRecord={handleReRecord}
                onSubmit={handleSubmitRecording}
                isSubmitting={isProcessing}
              />
            </View>
          ) : (
            <>
              {/* Waveform khi đang ghi âm — có swipe-to-cancel */}
              {isRecording && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.waveformArea,
                    {
                      transform: [{translateY: swipeY}],
                      opacity: swipeY.interpolate({
                        inputRange: [-120, -80, 0],
                        outputRange: [0.3, 0.6, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}>
                  <VoiceVisualizer isRecording={isRecording} height={60} />
                  <AppText
                    style={{fontSize: 24, fontWeight: '800', color: speakingColor, marginTop: 10}}>
                    Đang ghi âm... {formatTime(recordingDuration)}
                  </AppText>
                  <AppText style={{fontSize: 12, color: colors.neutrals400, marginTop: 4}}>
                    ↑ Vuốt lên để huỷ
                  </AppText>
                </Animated.View>
              )}

              {/* Nút MIC — green gradient 80px (theo design: Diameter 80px) */}
              <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                <Pressable
                  onPress={isRecording ? handleStopRecording : handleMicPress}
                  disabled={isProcessing}>
                  {/* Wrapper View nhận shadow — tránh warning BVLinearGradient */}
                  <View style={[
                    styles.micShadow,
                    {
                      opacity: isProcessing ? 0.5 : 1,
                      shadowColor: isRecording ? '#ef4444' : '#22c55e',
                    },
                  ]}>
                    <LinearGradient
                      colors={
                        isRecording
                          ? ['#ef4444', '#dc2626']
                          : ['#22c55e', '#16a34a']
                      }
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.micButton}>
                      <Icon
                        name={isRecording ? 'Square' : 'Mic'}
                        className="w-8 h-8 text-white"
                      />
                    </LinearGradient>
                  </View>
                </Pressable>
              </Animated.View>


            </>
          )}
        </View>

        {/* ======================== */}
        {/* SENTENCE NAV — ← Câu trước | Vuốt lên để hủy | Câu sau → */}
        {/* ======================== */}
        {!isRecording && !isProcessing && !showPreview && sentences.length > 1 && (
          <View style={styles.sentenceNav}>
            {/* Previous */}
            <TouchableOpacity
              onPress={() => { storePrevSentence(); clearRecording(); }}
              disabled={currentIndex === 0}
              style={[styles.navButton, {opacity: currentIndex === 0 ? 0.3 : 1}]}
              accessibilityLabel="Câu trước">
              <Icon name="SkipBack" className="w-4 h-4" style={{color: speakingColor}} />
              <AppText
                style={{fontSize: 13, fontWeight: '600', color: speakingColor, marginLeft: 4}}>
                Previous
              </AppText>
            </TouchableOpacity>

            {/* Center: Nhấn để ghi âm */}
            <AppText style={{fontSize: 12, color: colors.neutrals400}}>
              Nhấn để ghi âm
            </AppText>

            {/* Next */}
            <TouchableOpacity
              onPress={() => { storeNextSentence(); clearRecording(); }}
              disabled={currentIndex >= sentences.length - 1}
              style={[styles.navButton, {opacity: currentIndex >= sentences.length - 1 ? 0.3 : 1}]}
              accessibilityLabel="Câu sau">
              <AppText
                style={{fontSize: 13, fontWeight: '600', color: speakingColor, marginRight: 4}}>
                Next
              </AppText>
              <Icon name="SkipForward" className="w-4 h-4" style={{color: speakingColor}} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  topicBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentenceWordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recordingArea: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorBox: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  waveformArea: {
    marginBottom: 16,
    alignItems: 'center',
  },
  micShadow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sentenceNavWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  sentenceNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});


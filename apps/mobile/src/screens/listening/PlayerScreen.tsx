import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi} from '@/services/api/listening';
import {bookmarkApi} from '@/services/api/listening';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from 'react-native-track-player';
import {setupPlayer, addTrack} from '@/services/audio/trackPlayer';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';
import {useHaptic} from '@/hooks/useHaptic';
import {usePlayerGestures} from '@/hooks/usePlayerGestures';
import {TappableTranscript, DictionaryPopup, WaveformVisualizer, PocketMode, TourTooltip, usePlayerTour} from '@/components/listening';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useVocabularyStore} from '@/store/useVocabularyStore';

// Tốc độ có thể chọn
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Số bước tour
const TOUR_TOTAL = 5;

// State: Pocket Mode
// Đặt ở ngoài component vì chỉ cần boolean đơn giản

/**
 * Mục đích: Màn hình phát bài nghe + hiển thị transcript
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Sau khi ConfigScreen generate conversation thành công
 *   - Hiển thị transcript hội thoại
 *   - Gọi API sinh audio TTS → load vào TrackPlayer → auto-play
 *   - Highlight exchange đang phát (dựa trên timestamps)
 *   - Điều khiển play/pause, skip, đổi tốc độ
 */
export default function ListeningPlayerScreen({
  navigation,
}: {
  navigation: any;
}) {
  const conversation = useListeningStore(state => state.conversation);
  const currentExchangeIndex = useListeningStore(
    state => state.currentExchangeIndex,
  );
  const setCurrentExchangeIndex = useListeningStore(
    state => state.setCurrentExchangeIndex,
  );
  const playbackSpeed = useListeningStore(state => state.playbackSpeed);
  const setPlaybackSpeed = useListeningStore(state => state.setPlaybackSpeed);
  const config = useListeningStore(state => state.config);
  const reset = useListeningStore(state => state.reset);

  // Audio state từ store
  const audioUrl = useListeningStore(state => state.audioUrl);
  const isGeneratingAudio = useListeningStore(
    state => state.isGeneratingAudio,
  );
  const timestamps = useListeningStore(state => state.timestamps);
  const setAudioUrl = useListeningStore(state => state.setAudioUrl);
  const setGeneratingAudio = useListeningStore(
    state => state.setGeneratingAudio,
  );
  const setTimestamps = useListeningStore(state => state.setTimestamps);

  // TTS settings (Azure-only)
  const randomVoice = useListeningStore(state => state.randomVoice);
  const voicePerSpeaker = useListeningStore(state => state.voicePerSpeaker);
  const multiTalker = useListeningStore(state => state.multiTalker);
  const multiTalkerPairIndex = useListeningStore(state => state.multiTalkerPairIndex);
  const ttsEmotion = useListeningStore(state => state.ttsEmotion);
  const ttsPitch = useListeningStore(state => state.ttsPitch);
  const ttsRate = useListeningStore(state => state.ttsRate);
  const ttsVolume = useListeningStore(state => state.ttsVolume);

  // Bookmark state
  const bookmarkedIndexes = useListeningStore(
    state => state.bookmarkedIndexes,
  );
  const toggleBookmark = useListeningStore(state => state.toggleBookmark);

  // Dictionary Popup state
  const addSavedWord = useListeningStore(state => state.addSavedWord);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [pocketMode, setPocketMode] = useState(false);

  // Translation toggle
  const showTranslation = useListeningStore(state => state.showTranslation);
  const toggleTranslation = useListeningStore(state => state.toggleTranslation);

  // TrackPlayer state
  const playbackState = usePlaybackState();
  const progress = useProgress(500); // Cập nhật mỗi 500ms
  const isTrackPlaying = playbackState.state === State.Playing;
  const isTrackReady =
    playbackState.state === State.Ready ||
    playbackState.state === State.Playing ||
    playbackState.state === State.Paused;

  const {showError, showInfo, showSuccess} = useToast();
  const {showConfirm} = useDialog();
  const haptic = useHaptic();

  // Ref để tránh duplicate audio generation
  const audioGenRequestedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Audio Player Store (persistent) — đồng bộ speed và lưu session
  const persistedSpeed = useAudioPlayerStore(state => state.playbackSpeed);
  const setPersistedSpeed = useAudioPlayerStore(state => state.setPlaybackSpeed);
  const saveSession = useAudioPlayerStore(state => state.saveSession);
  const setGlobalPlaying = useAudioPlayerStore(state => state.setIsPlaying);
  const setPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);

  // Khởi tạo Track Player khi vào màn hình
  useEffect(() => {
    setupPlayer();
    // Đồng bộ tốc độ từ persistent store → listening store
    if (persistedSpeed !== playbackSpeed) {
      setPlaybackSpeed(persistedSpeed);
    }
    // Set player mode = full khi vào PlayerScreen
    setPlayerMode('full');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ trạng thái playing sang global store
  useEffect(() => {
    setGlobalPlaying(isTrackPlaying);
  }, [isTrackPlaying, setGlobalPlaying]);

  // Lưu session khi unmount (để restore sau)
  useEffect(() => {
    return () => {
      if (audioUrl && timestamps) {
        saveSession({
          audioUrl,
          title: conversation?.title || config.topic || 'Bài nghe',
          lastPosition: progress.position,
          duration: progress.duration,
          timestamps,
          savedAt: new Date().toISOString(),
          topic: config.topic || '',
          // Lưu kèm conversation data để restore khi "Tiếp tục nghe"
          conversationData: conversation || undefined,
        });
        console.log('💾 [Player] Đã lưu session + conversation data cho restore');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, timestamps]);

  /**
   * Mục đích: Gọi API sinh audio TTS khi có conversation nhưng chưa có audioUrl
   * Tham số đầu vào: không (dùng conversation từ store)
   * Tham số đầu ra: void
   * Khi nào sử dụng: useEffect khi mount, nếu chưa có audioUrl
   *   - Gọi listeningApi.generateConversationAudio()
   *   - Set audioUrl + timestamps vào store
   *   - Load track vào TrackPlayer → auto-play
   */
  useEffect(() => {
    if (
      !conversation?.conversation?.length ||
      audioUrl ||
      audioGenRequestedRef.current
    ) {
      return;
    }

    audioGenRequestedRef.current = true;

    const generateAudio = async () => {
      setGeneratingAudio(true);
      console.log('🔊 [PlayerScreen] Bắt đầu sinh audio TTS...');

      try {
        const result = await listeningApi.generateConversationAudio(
          conversation.conversation,
          // Azure-only: gửi provider cố định + tuỳ chọn voice mới
          {
            provider: 'azure',
            randomVoice,
            voicePerSpeaker: randomVoice ? undefined : voicePerSpeaker,
            multiTalker,
            multiTalkerPairIndex: multiTalker ? multiTalkerPairIndex : undefined,
            emotion: ttsEmotion,
            pitch: ttsPitch,
            rate: ttsRate,
            volume: ttsVolume,
          },
        );

        setAudioUrl(result.audioUrl);
        setTimestamps(result.timestamps);

        console.log('✅ [PlayerScreen] Audio đã sẵn sàng, đang load vào player...');

        // Load track vào TrackPlayer
        await addTrack(
          result.audioUrl,
          conversation.title || config.topic || 'Bài nghe',
        );

        // Auto-play
        await TrackPlayer.play();
        haptic.success();
      } catch (error: any) {
        console.error('❌ [PlayerScreen] Lỗi sinh audio:', error);
        showError(
          'Không thể tạo audio',
          'Bạn vẫn có thể đọc transcript. Thử lại bằng nút Play.',
        );
      } finally {
        setGeneratingAudio(false);
      }
    };

    generateAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  /**
   * Mục đích: Sync transcript highlight theo thời gian phát audio
   * Tham số đầu vào: progress.position (giây hiện tại), timestamps
   * Tham số đầu ra: void — cập nhật currentExchangeIndex
   * Khi nào sử dụng: Mỗi 500ms khi đang phát audio (useProgress hook)
   */
  useEffect(() => {
    if (!timestamps?.length || !isTrackPlaying) {
      return;
    }

    const currentTime = progress.position;

    // Tìm exchange đang phát dựa trên timestamps
    const activeIndex = timestamps.findIndex(
      ts => currentTime >= ts.startTime && currentTime < ts.endTime,
    );

    if (activeIndex !== -1 && activeIndex !== currentExchangeIndex) {
      setCurrentExchangeIndex(activeIndex);
    }
  }, [
    progress.position,
    timestamps,
    isTrackPlaying,
    currentExchangeIndex,
    setCurrentExchangeIndex,
  ]);

  if (!conversation) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Icon name="Headphones" className="w-16 h-16 text-neutrals300 mb-4" />
        <AppText className="text-foreground font-sans-bold text-xl mb-2 text-center">
          Chưa có bài nghe
        </AppText>
        <AppText className="text-neutrals400 text-center text-sm mb-6 leading-5">
          Quay lại màn hình cấu hình để chọn chủ đề và tạo bài nghe mới
        </AppText>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-primary px-6 py-3 rounded-xl"
          activeOpacity={0.7}>
          <AppText className="text-white font-sans-semibold text-sm">
            ← Quay lại chọn chủ đề
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const exchanges = conversation.conversation || [];

  /**
   * Mục đích: Xử lý khi user nhấn vào 1 exchange trong transcript
   * Tham số đầu vào: index (number) - vị trí exchange
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào 1 câu trong transcript để nhảy tới
   *   - Nếu có timestamps → seek audio tới vị trí tương ứng
   *   - Nếu chưa có audio → chỉ highlight exchange
   */
  const handleExchangePress = async (index: number) => {
    setCurrentExchangeIndex(index);
    haptic.light();

    // Seek audio tới timestamp của exchange nếu có
    if (timestamps?.[index] && isTrackReady) {
      try {
        await TrackPlayer.seekTo(timestamps[index].startTime);
        console.log(
          '📍 [Player] Seek đến exchange:',
          index,
          'tại',
          timestamps[index].startTime,
          'giây',
        );
      } catch (error) {
        console.log('📍 [Player] Nhảy đến exchange:', index);
      }
    }
  };

  /**
   * Mục đích: Xử lý long press câu → toggle bookmark (thêm/bỏ ⭐)
   * Tham số đầu vào: index (number) - vị trí exchange trong transcript
   * Tham số đầu ra: void
   * Khi nào sử dụng: User long press 1 câu trong transcript
   *   - Nếu chưa bookmark → tạo bookmark + hiện ⭐ + toast
   *   - Nếu đã bookmark → xóa bookmark + ẩn ⭐ + toast
   */
  const handleBookmarkToggle = async (index: number) => {
    const exchange = exchanges[index];
    if (!exchange) {
      return;
    }

    const isCurrentlyBookmarked = bookmarkedIndexes.includes(index);
    haptic.medium();

    // Toggle local state ngay lập tức (optimistic update)
    toggleBookmark(index);

    try {
      if (isCurrentlyBookmarked) {
        // Bỏ bookmark → gọi API xóa theo index
        await bookmarkApi.deleteByIndex({
          sentenceIndex: index,
        });
        showInfo('Đã bỏ bookmark', exchange.text.substring(0, 40) + '...');
        console.log('⭐ [Player] Bỏ bookmark câu index:', index);
      } else {
        // Thêm bookmark → gọi API tạo
        await bookmarkApi.create({
          sentenceIndex: index,
          speaker: exchange.speaker,
          sentenceText: exchange.text,
          sentenceTranslation: exchange.vietnamese,
          topic: config.topic || conversation?.title,
        });
        showSuccess('Đã lưu bookmark ⭐', exchange.text.substring(0, 40) + '...');
        console.log('⭐ [Player] Bookmark câu index:', index);
      }
    } catch (error) {
      // Rollback nếu API lỗi
      toggleBookmark(index);
      showError('Lỗi', 'Không thể lưu bookmark, thử lại sau');
      console.error('❌ [Player] Lỗi toggle bookmark:', error);
    }
  };

  /**
   * Mục đích: Quay lại ConfigScreen và reset listening state
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "Bài mới"
   */
  const handleNewConversation = () => {
    showConfirm(
      'Tạo bài mới?',
      'Bài nghe hiện tại sẽ bị xóa. Bạn có chắc muốn tiếp tục?',
      async () => {
        haptic.medium();
        // Dừng và reset TrackPlayer
        try {
          await TrackPlayer.reset();
        } catch {
          // Bỏ qua nếu player chưa setup
        }
        setPlayerMode('hidden'); // Reset global player
        audioGenRequestedRef.current = false;
        reset();
        navigation.goBack();
      },
    );
  };

  /**
   * Mục đích: Chuyển sang tốc độ tiếp theo trong danh sách SPEEDS
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút tốc độ phát
   */
  const cycleSpeed = async () => {
    const currentIdx = SPEEDS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEEDS.length;
    const newSpeed = SPEEDS[nextIdx];
    setPlaybackSpeed(newSpeed);
    setPersistedSpeed(newSpeed); // Persist qua phiên tiếp theo
    try {
      await TrackPlayer.setRate(newSpeed);
      haptic.light();
      console.log('🎵 [Player] Đổi tốc độ:', newSpeed);
    } catch (error) {
      showError('Lỗi đổi tốc độ', 'Không thể thay đổi tốc độ phát');
      console.error('Lỗi đổi tốc độ:', error);
    }
  };

  /**
   * Mục đích: Xử lý Play/Pause — toggle TrackPlayer thực sự
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút Play/Pause
   *   - Nếu có audio → play/pause TrackPlayer
   *   - Nếu chưa có audio và đã gen xong → retry load track
   *   - Nếu đang gen → không làm gì (disabled)
   */
  const handlePlayPause = useCallback(async () => {
    haptic.light();

    try {
      if (isTrackPlaying) {
        // Đang phát → pause
        await TrackPlayer.pause();
        console.log('⏸️ [Player] Pause');
      } else if (isTrackReady) {
        // Track sẵn sàng → play
        await TrackPlayer.play();
        console.log('▶️ [Player] Play');
      } else if (audioUrl) {
        // Có URL nhưng track chưa load → retry load
        console.log('🔄 [Player] Retry load track...');
        await addTrack(
          audioUrl,
          conversation?.title || config.topic || 'Bài nghe',
        );
        await TrackPlayer.play();
      } else {
        // Chưa có audio → thông báo
        showInfo('Đang chuẩn bị', 'Audio chưa sẵn sàng, vui lòng đợi...');
      }
    } catch (error) {
      console.error('❌ [Player] Lỗi play/pause:', error);
      showError('Lỗi phát audio', 'Vui lòng thử lại');
    }
  }, [
    isTrackPlaying,
    isTrackReady,
    audioUrl,
    conversation,
    config.topic,
    haptic,
    showInfo,
    showError,
  ]);

  /**
   * Mục đích: Skip tới exchange trước đó hoặc lùi 10s
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút skip back
   */
  const handleSkipBack = useCallback(async () => {
    if (timestamps?.length && currentExchangeIndex > 0) {
      // Có timestamps → nhảy exchange trước
      const prevIndex = currentExchangeIndex - 1;
      setCurrentExchangeIndex(prevIndex);
      if (isTrackReady && timestamps[prevIndex]) {
        // Pause → seek → resume để tránh nghe audio câu cũ bị lọt
        const wasPlaying = isTrackPlaying;
        if (wasPlaying) { await TrackPlayer.pause(); }
        await TrackPlayer.seekTo(timestamps[prevIndex].startTime);
        if (wasPlaying) {
          setTimeout(() => TrackPlayer.play(), 50);
        }
      }
    } else if (isTrackReady) {
      // Không có timestamps → lùi 10 giây
      const newPos = Math.max(0, progress.position - 10);
      await TrackPlayer.seekTo(newPos);
    } else if (currentExchangeIndex > 0) {
      setCurrentExchangeIndex(currentExchangeIndex - 1);
    }
  }, [timestamps, currentExchangeIndex, isTrackReady, isTrackPlaying, progress.position, setCurrentExchangeIndex]);

  /**
   * Mục đích: Skip tới exchange tiếp theo hoặc tới 10s
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút skip forward
   */
  const handleSkipForward = useCallback(async () => {
    if (timestamps?.length && currentExchangeIndex < exchanges.length - 1) {
      // Có timestamps → nhảy exchange tiếp
      const nextIndex = currentExchangeIndex + 1;
      setCurrentExchangeIndex(nextIndex);
      if (isTrackReady && timestamps[nextIndex]) {
        // Pause → seek → resume để tránh nghe audio câu cũ bị lọt
        const wasPlaying = isTrackPlaying;
        if (wasPlaying) { await TrackPlayer.pause(); }
        await TrackPlayer.seekTo(timestamps[nextIndex].startTime);
        if (wasPlaying) {
          setTimeout(() => TrackPlayer.play(), 50);
        }
      }
    } else if (isTrackReady) {
      // Không có timestamps → tới 10 giây
      const newPos = Math.min(progress.duration, progress.position + 10);
      await TrackPlayer.seekTo(newPos);
    } else if (currentExchangeIndex < exchanges.length - 1) {
      setCurrentExchangeIndex(currentExchangeIndex + 1);
    }
  }, [
    timestamps,
    currentExchangeIndex,
    exchanges.length,
    isTrackReady,
    isTrackPlaying,
    progress.duration,
    progress.position,
    setCurrentExchangeIndex,
  ]);

  /**
   * Mục đích: Xử lý swipe down minimize — placeholder
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User swipe down trên player (MOB-LIS-ENH-HP-006)
   *   - TODO: Chuyển sang Mini Player mode khi implement xong
   */
  const handleSwipeDownMinimize = useCallback(() => {
    // TODO: Implement mini player mode — chuyển sang compact/minimized view
    console.log('🔽 [Player] Swipe down — placeholder minimize (chưa implement)');
  }, []);

  // ========================
  // Gesture Handler — swipe left/right/down + double tap
  // MOB-LIS-ENH-HP-004 → 007
  // ========================
  const {gesture: playerGesture, animatedStyle: gestureAnimatedStyle} =
    usePlayerGestures({
      onSwipeLeft: handleSkipBack,
      onSwipeRight: handleSkipForward,
      onSwipeDown: handleSwipeDownMinimize,
      onDoubleTap: handlePlayPause,
    });

  /**
   * Mục đích: Format thời gian từ giây sang m:ss
   * Tham số đầu vào: seconds (number)
   * Tham số đầu ra: string (vd: "2:05")
   * Khi nào sử dụng: Hiển thị current time / duration ở thanh progress
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Tính progress percentage cho progress bar
  const progressPercent =
    progress.duration > 0
      ? (progress.position / progress.duration) * 100
      : 0;

  // Tour walkthrough — hướng dẫn người dùng mới
  const tour = usePlayerTour();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            // Nếu đang phát audio → chuyển sang compact mode (audio vẫn phát)
            if (isTrackPlaying && audioUrl) {
              setPlayerMode('compact');
              navigation.goBack();
            } else {
              setPlayerMode('hidden');
              navigation.goBack();
            }
          }}
          className="p-2 -ml-2">
          <Icon name="ArrowLeft" className="w-6 h-6 text-foreground" />
        </TouchableOpacity>
        <AppText className="text-foreground font-sans-bold text-lg flex-1 text-center">
          {conversation.title || config.topic || 'Bài nghe'}
        </AppText>
        {/* Nút Pocket Mode — bỏ túi nghe thụ động */}
        <TourTooltip
          stepId="pocket"
          activeStepId={tour.currentStepId}
          onNext={tour.nextStep}
          onSkip={tour.skipTour}
          stepIndex={4}
          totalSteps={TOUR_TOTAL}>
          <TouchableOpacity
            onPress={() => setPocketMode(true)}
            className="p-2 -mr-2"
            accessibilityLabel="Bật Pocket Mode"
            accessibilityRole="button">
            <Icon name="Smartphone" className="w-5 h-5 text-neutrals400" />
          </TouchableOpacity>
        </TourTooltip>
      </View>

      {/* Audio generation status banner */}
      {isGeneratingAudio && (
        <View className="mx-6 mb-3 bg-primary/10 rounded-xl px-4 py-3 flex-row items-center">
          <ActivityIndicator size="small" color="#10b981" />
          <AppText className="text-primary text-sm ml-3 flex-1">
            Đang tạo audio... Bạn có thể đọc transcript trước
          </AppText>
        </View>
      )}

      {/* Transcript — vùng hiển thị hội thoại */}
      <GestureDetector gesture={playerGesture}>
        <Animated.View style={[{flex: 1}, gestureAnimatedStyle]}>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 160}}>

        {/* Tour tooltip cho transcript — bọc summary thay vì toàn bộ ScrollView */}
        <TourTooltip
          stepId="transcript"
          activeStepId={tour.currentStepId}
          onNext={tour.nextStep}
          onSkip={tour.skipTour}
          stepIndex={0}
          totalSteps={TOUR_TOTAL}>
          <View>
        {/* Summary */}
        {conversation.summary && (
          <View className="bg-neutrals900 rounded-2xl p-4 mb-4">
            <AppText className="text-neutrals400 text-sm">
              {conversation.summary}
            </AppText>
          </View>
        )}
          </View>
        </TourTooltip>

        {/* Danh sách exchanges */}
        <View className="gap-3">
          {exchanges.map((exchange, index) => {
            const isActive = index === currentExchangeIndex;
            const isEvenSpeaker = index % 2 === 0;
            const isBookmarked = bookmarkedIndexes.includes(index);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleExchangePress(index)}
                onLongPress={() => handleBookmarkToggle(index)}
                delayLongPress={400}
                activeOpacity={0.7}
                className={`rounded-2xl p-4 border ${
                  isActive
                    ? 'bg-primary/10 border-primary/30'
                    : isBookmarked
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-neutrals950 border-transparent'
                }`}>
                {/* Speaker label */}
                <View className="flex-row items-center mb-2">
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center mr-2 ${
                      isEvenSpeaker ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                    <AppText className="text-xs">
                      {isEvenSpeaker ? '👤' : '👥'}
                    </AppText>
                  </View>
                  <AppText
                    className={`text-sm font-sans-semibold ${
                      isEvenSpeaker ? 'text-blue-400' : 'text-green-400'
                    }`}>
                    {exchange.speaker}
                  </AppText>
                  {isActive && (
                    <View className="ml-auto flex-row items-center">
                      <View className="flex-row items-end gap-0.5 h-3">
                        <View className="w-0.5 h-1 bg-primary rounded-full animate-pulse" />
                        <View className="w-0.5 h-2 bg-primary rounded-full" />
                        <View className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                        <View className="w-0.5 h-1.5 bg-primary rounded-full" />
                      </View>
                    </View>
                  )}
                  {isBookmarked && (
                    <View className={isActive ? 'ml-1' : 'ml-auto'}>
                      <AppText className="text-xs">⭐</AppText>
                    </View>
                  )}
                </View>

                {/* Nội dung tiếng Anh — từng từ tap được để tra nghĩa */}
                <TappableTranscript
                  text={exchange.text}
                  onWordPress={setSelectedWord}
                  isActive={isActive}
                />

                {/* Bản dịch tiếng Việt — chỉ hiển khi bật translation toggle */}
                {showTranslation && exchange.vietnamese && (
                  <AppText className="text-neutrals500 text-sm mt-1 italic">
                    {exchange.vietnamese}
                  </AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Từ vựng */}
        {conversation.vocabulary && conversation.vocabulary.length > 0 && (
          <View className="mt-6">
            <AppText className="text-foreground font-sans-bold text-base mb-3">
              📝 Từ vựng đáng chú ý
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {conversation.vocabulary.map((word, i) => (
                <View
                  key={i}
                  className="bg-neutrals900 rounded-xl px-3 py-2">
                  <AppText className="text-foreground text-sm">
                    {word}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
        </Animated.View>
      </GestureDetector>

      {/* Playback controls */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-neutrals900 px-6 pb-safe-offset-4 pt-3">
        {/* Progress bar + waveform (chỉ hiện khi có audio) */}
        {(audioUrl || isTrackReady) && (
          <View className="mb-3">
            {/* Waveform + thanh progress */}
            <View className="flex-row items-center gap-2">
              <WaveformVisualizer isPlaying={isTrackPlaying} height={20} />
              <View className="flex-1 h-1 bg-neutrals800 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{width: `${progressPercent}%`}}
                />
              </View>
            </View>
            {/* Thời gian */}
            <View className="flex-row justify-between mt-1">
              <AppText className="text-neutrals500 text-xs">
                {formatTime(progress.position)}
              </AppText>
              <AppText className="text-neutrals500 text-xs">
                {formatTime(progress.duration)}
              </AppText>
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-center">
          {/* Tốc độ — trái */}
          <TourTooltip
            stepId="speed"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={2}
            totalSteps={TOUR_TOTAL}>
            <TouchableOpacity
              className="bg-neutrals900 rounded-full px-3 py-2"
              onPress={cycleSpeed}>
              <AppText className="text-foreground font-sans-bold text-sm">
                {playbackSpeed}x
              </AppText>
            </TouchableOpacity>
          </TourTooltip>

          {/* Toggle bản dịch tiếng Việt — trái */}
          <TourTooltip
            stepId="translation"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={3}
            totalSteps={TOUR_TOTAL}>
            <TouchableOpacity
              className={`rounded-full px-3 py-2 ml-2 ${showTranslation ? 'bg-primary/20' : 'bg-neutrals900'}`}
              onPress={() => {
                toggleTranslation();
                haptic.light();
              }}>
              <AppText className={`text-sm font-sans-bold ${showTranslation ? 'text-primary' : 'text-neutrals500'}`}>
                🇻🇳
              </AppText>
            </TouchableOpacity>
          </TourTooltip>

          {/* Điều khiển phát — CHÍNH GIỮA */}
          <TourTooltip
            stepId="playback"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={1}
            totalSteps={TOUR_TOTAL}>
          <View className="flex-row items-center gap-5 mx-4">
            {/* Lùi */}
            <TouchableOpacity onPress={handleSkipBack}>
              <Icon
                name="SkipBack"
                className="w-6 h-6 text-neutrals300"
              />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              className="w-14 h-14 bg-primary rounded-full items-center justify-center"
              onPress={handlePlayPause}
              disabled={isGeneratingAudio}>
              {isGeneratingAudio ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Icon
                  name={isTrackPlaying ? 'Pause' : 'Play'}
                  className="w-7 h-7 text-white"
                />
              )}
            </TouchableOpacity>

            {/* Tới */}
            <TouchableOpacity onPress={handleSkipForward}>
              <Icon
                name="SkipForward"
                className="w-6 h-6 text-neutrals300"
              />
            </TouchableOpacity>
          </View>
          </TourTooltip>

          {/* Nút bài mới — phải */}
          <TouchableOpacity
            className="bg-neutrals900 rounded-full px-3 py-2"
            onPress={handleNewConversation}>
            <Icon name="RefreshCw" className="w-4 h-4 text-neutrals300" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Dictionary Popup — tra từ khi tap vào từ trong transcript */}
      <DictionaryPopup
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onSaveWord={word => {
          addSavedWord(word);
          // Persist vào VocabularyStore (AsyncStorage) — hiện trong tab Từ vựng
          useVocabularyStore.getState().addWord(word, 'listening');
          showSuccess('Đã lưu từ "' + word + '"');
        }}
        onPlayPronunciation={async (pronunciationUrl) => {
          try {
            console.log('🔊 [PlayerScreen] Phát âm từ, URL:', pronunciationUrl);
            // Tạm pause main audio nếu đang phát
            const wasPlaying = isTrackPlaying;
            if (wasPlaying) {
              await TrackPlayer.pause();
            }
            // Dùng TrackPlayer tạm thời phát pronunciation
            // Lưu vị trí hiện tại trước
            const currentProgress = await TrackPlayer.getProgress();
            // Phát pronunciation bằng cách fetch audio URL
            const Audio = require('react-native-audio-recorder-player').default;
            const audioRecorderPlayer = new Audio();
            await audioRecorderPlayer.startPlayer(pronunciationUrl);
            audioRecorderPlayer.addPlayBackListener((e: any) => {
              if (e.currentPosition >= e.duration - 100) {
                audioRecorderPlayer.stopPlayer();
                audioRecorderPlayer.removePlayBackListener();
                console.log('✅ [PlayerScreen] Đã phát xong pronunciation');
              }
            });
          } catch (error) {
            console.error('❌ [PlayerScreen] Lỗi phát âm:', error);
            showError('Lỗi phát âm', 'Không thể phát âm từ này');
          }
        }}
      />
      {/* Pocket Mode — full-screen overlay đen */}
      {pocketMode && (
        <View className="absolute inset-0" style={{zIndex: 999}}>
          <PocketMode onExit={() => setPocketMode(false)} />
        </View>
      )}
    </View>
  );
}

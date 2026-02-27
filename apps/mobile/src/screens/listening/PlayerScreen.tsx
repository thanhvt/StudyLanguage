import React, {useEffect, useRef, useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
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
import {
  TappableTranscript,
  DictionaryPopup,
  WaveformVisualizer,
  PocketMode,
  TourTooltip,
  usePlayerTour,
} from '@/components/listening';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {formatTime} from '@/utils/formatTime';

// ========================
// Constants
// ========================
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const TOUR_TOTAL = 5;
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';
const {width: SCREEN_WIDTH} = Dimensions.get('window');

/**
 * Mục đích: Màn hình phát bài nghe — redesign v3 với Reading/Focus View toggle
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Sau khi ConfigScreen generate conversation thành công
 *   - Reading View: Full transcript chat-bubble layout
 *   - Focus View: Large current sentence only
 */
export default function ListeningPlayerScreen({
  navigation,
}: {
  navigation: any;
}) {
  // ========================
  // Store selectors
  // ========================
  const conversation = useListeningStore(state => state.conversation);
  const currentExchangeIndex = useListeningStore(state => state.currentExchangeIndex);
  const setCurrentExchangeIndex = useListeningStore(state => state.setCurrentExchangeIndex);
  const playbackSpeed = useListeningStore(state => state.playbackSpeed);
  const setPlaybackSpeed = useListeningStore(state => state.setPlaybackSpeed);
  const config = useListeningStore(state => state.config);
  const reset = useListeningStore(state => state.reset);

  // Audio state
  const audioUrl = useListeningStore(state => state.audioUrl);
  const isGeneratingAudio = useListeningStore(state => state.isGeneratingAudio);
  const timestamps = useListeningStore(state => state.timestamps);
  const setAudioUrl = useListeningStore(state => state.setAudioUrl);
  const setGeneratingAudio = useListeningStore(state => state.setGeneratingAudio);
  const setTimestamps = useListeningStore(state => state.setTimestamps);

  // TTS settings
  const randomVoice = useListeningStore(state => state.randomVoice);
  const voicePerSpeaker = useListeningStore(state => state.voicePerSpeaker);
  const multiTalker = useListeningStore(state => state.multiTalker);
  const multiTalkerPairIndex = useListeningStore(state => state.multiTalkerPairIndex);
  const ttsEmotion = useListeningStore(state => state.ttsEmotion);
  const ttsPitch = useListeningStore(state => state.ttsPitch);
  const ttsRate = useListeningStore(state => state.ttsRate);
  const ttsVolume = useListeningStore(state => state.ttsVolume);
  const randomEmotion = useListeningStore(state => state.randomEmotion);

  // Bookmark + Dictionary
  const bookmarkedIndexes = useListeningStore(state => state.bookmarkedIndexes);
  const toggleBookmark = useListeningStore(state => state.toggleBookmark);
  const addSavedWord = useListeningStore(state => state.addSavedWord);

  // Translation toggle
  const showTranslation = useListeningStore(state => state.showTranslation);
  const toggleTranslation = useListeningStore(state => state.toggleTranslation);

  // ========================
  // Local state
  // ========================
  const [viewMode, setViewMode] = useState<'reading' | 'focus'>('reading');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [pocketMode, setPocketMode] = useState(false);

  // ========================
  // TrackPlayer hooks
  // ========================
  const playbackState = usePlaybackState();
  const progress = useProgress(500);
  const isTrackPlaying = playbackState.state === State.Playing;
  const isTrackReady =
    playbackState.state === State.Ready ||
    playbackState.state === State.Playing ||
    playbackState.state === State.Paused;

  const {showError, showInfo, showSuccess} = useToast();
  const {showConfirm} = useDialog();
  const haptic = useHaptic();

  const audioGenRequestedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Audio Player Store
  const persistedSpeed = useAudioPlayerStore(state => state.playbackSpeed);
  const setPersistedSpeed = useAudioPlayerStore(state => state.setPlaybackSpeed);
  const saveSession = useAudioPlayerStore(state => state.saveSession);
  const setGlobalPlaying = useAudioPlayerStore(state => state.setIsPlaying);
  const setPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);

  // Tour
  const tour = usePlayerTour();

  // ========================
  // Effects
  // ========================

  // Khởi tạo TrackPlayer
  useEffect(() => {
    setupPlayer();
    if (persistedSpeed !== playbackSpeed) {
      setPlaybackSpeed(persistedSpeed);
    }
    setPlayerMode('full');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus/blur — chuyển compact mode
  useFocusEffect(
    useCallback(() => {
      setPlayerMode('full');
      return () => {
        const currentState = useAudioPlayerStore.getState();
        if (currentState.isPlaying && currentState.playerMode === 'full') {
          setPlayerMode('compact');
        }
      };
    }, [setPlayerMode]),
  );

  // Đồng bộ playing state
  useEffect(() => {
    setGlobalPlaying(isTrackPlaying);
  }, [isTrackPlaying, setGlobalPlaying]);

  // Lưu session khi unmount
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
          conversationData: conversation || undefined,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, timestamps]);

  /**
   * Mục đích: Gọi API sinh audio TTS khi có conversation nhưng chưa có audioUrl
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: useEffect khi mount, nếu chưa có audioUrl
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
            randomEmotion,
          },
        );
        setAudioUrl(result.audioUrl);
        setTimestamps(result.timestamps);
        await addTrack(
          result.audioUrl,
          conversation.title || config.topic || 'Bài nghe',
        );
        await TrackPlayer.play();
        haptic.success();
      } catch (error: any) {
        console.error('❌ [PlayerScreen] Lỗi sinh audio:', error);
        showError('Không thể tạo audio', 'Bạn vẫn có thể đọc transcript.');
      } finally {
        setGeneratingAudio(false);
      }
    };
    generateAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  // Sync transcript highlight theo audio position
  useEffect(() => {
    if (!timestamps?.length || !isTrackPlaying) {return;}
    const currentTime = progress.position;
    const activeIndex = timestamps.findIndex(
      ts => currentTime >= ts.startTime && currentTime < ts.endTime,
    );
    if (activeIndex !== -1 && activeIndex !== currentExchangeIndex) {
      setCurrentExchangeIndex(activeIndex);
    }
  }, [progress.position, timestamps, isTrackPlaying, currentExchangeIndex, setCurrentExchangeIndex]);

  // ========================
  // Empty state
  // ========================
  if (!conversation) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Icon name="Headphones" className="w-16 h-16 text-neutrals300 mb-4" />
        <AppText className="text-foreground font-sans-bold text-xl mb-2 text-center">
          Chưa có bài nghe
        </AppText>
        <AppText className="text-neutrals400 text-center text-sm mb-6">
          Quay lại cấu hình để tạo bài nghe mới
        </AppText>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="px-6 py-3 rounded-xl"
          style={{backgroundColor: LISTENING_BLUE}}
          activeOpacity={0.7}>
          <AppText className="text-white font-sans-semibold text-sm">
            ← Quay lại
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const exchanges = conversation.conversation || [];

  // ========================
  // Handlers
  // ========================

  /**
   * Mục đích: Nhấn vào 1 exchange → seek audio tới đó
   * Tham số đầu vào: index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào câu trong transcript
   */
  const handleExchangePress = async (index: number) => {
    setCurrentExchangeIndex(index);
    haptic.light();
    if (timestamps?.[index] && isTrackReady) {
      try {
        await TrackPlayer.seekTo(timestamps[index].startTime);
      } catch {}
    }
  };

  /**
   * Mục đích: Long press → toggle bookmark
   * Tham số đầu vào: index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User long press câu trong transcript
   */
  const handleBookmarkToggle = async (index: number) => {
    const exchange = exchanges[index];
    if (!exchange) {return;}
    const isCurrentlyBookmarked = bookmarkedIndexes.includes(index);
    haptic.medium();
    toggleBookmark(index);
    try {
      if (isCurrentlyBookmarked) {
        await bookmarkApi.deleteByIndex({sentenceIndex: index});
        showInfo('Đã bỏ bookmark', exchange.text.substring(0, 40) + '...');
      } else {
        await bookmarkApi.create({
          sentenceIndex: index,
          speaker: exchange.speaker,
          sentenceText: exchange.text,
          sentenceTranslation: exchange.vietnamese,
          topic: config.topic || conversation?.title,
        });
        showSuccess('Đã lưu bookmark ⭐', exchange.text.substring(0, 40) + '...');
      }
    } catch {
      toggleBookmark(index);
      showError('Lỗi', 'Không thể lưu bookmark');
    }
  };

  const handleNewConversation = () => {
    showConfirm(
      'Tạo bài mới?',
      'Bài nghe hiện tại sẽ bị xóa.',
      async () => {
        haptic.medium();
        try { await TrackPlayer.reset(); } catch {}
        setPlayerMode('hidden');
        audioGenRequestedRef.current = false;
        reset();
        navigation.goBack();
      },
    );
  };

  const cycleSpeed = async () => {
    const currentIdx = SPEEDS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEEDS.length;
    const newSpeed = SPEEDS[nextIdx];
    setPlaybackSpeed(newSpeed);
    setPersistedSpeed(newSpeed);
    try {
      await TrackPlayer.setRate(newSpeed);
      haptic.light();
    } catch {}
  };

  const handlePlayPause = useCallback(async () => {
    haptic.light();
    try {
      if (isTrackPlaying) {
        await TrackPlayer.pause();
      } else if (isTrackReady) {
        await TrackPlayer.play();
      } else if (audioUrl) {
        await addTrack(audioUrl, conversation?.title || config.topic || 'Bài nghe');
        await TrackPlayer.play();
      } else {
        showInfo('Đang chuẩn bị', 'Audio chưa sẵn sàng...');
      }
    } catch {
      showError('Lỗi phát audio', 'Vui lòng thử lại');
    }
  }, [isTrackPlaying, isTrackReady, audioUrl, conversation, config.topic, haptic, showInfo, showError]);

  const handleSkipBack = useCallback(async () => {
    if (timestamps?.length && currentExchangeIndex > 0) {
      const prevIndex = currentExchangeIndex - 1;
      setCurrentExchangeIndex(prevIndex);
      if (isTrackReady && timestamps[prevIndex]) {
        const wasPlaying = isTrackPlaying;
        if (wasPlaying) {await TrackPlayer.pause();}
        await TrackPlayer.seekTo(timestamps[prevIndex].startTime);
        if (wasPlaying) {setTimeout(() => TrackPlayer.play(), 150);}
      }
    } else if (isTrackReady) {
      await TrackPlayer.seekTo(Math.max(0, progress.position - 10));
    }
  }, [timestamps, currentExchangeIndex, isTrackReady, isTrackPlaying, progress.position, setCurrentExchangeIndex]);

  const handleSkipForward = useCallback(async () => {
    if (timestamps?.length && currentExchangeIndex < exchanges.length - 1) {
      const nextIndex = currentExchangeIndex + 1;
      setCurrentExchangeIndex(nextIndex);
      if (isTrackReady && timestamps[nextIndex]) {
        const wasPlaying = isTrackPlaying;
        if (wasPlaying) {await TrackPlayer.pause();}
        await TrackPlayer.seekTo(timestamps[nextIndex].startTime);
        if (wasPlaying) {setTimeout(() => TrackPlayer.play(), 150);}
      }
    } else if (isTrackReady) {
      await TrackPlayer.seekTo(Math.min(progress.duration, progress.position + 10));
    }
  }, [timestamps, currentExchangeIndex, exchanges.length, isTrackReady, isTrackPlaying, progress.duration, progress.position, setCurrentExchangeIndex]);

  const handleSwipeDownMinimize = useCallback(() => {
    haptic.light();
    if (audioUrl && isTrackPlaying) {
      setPlayerMode('compact');
    } else {
      setPlayerMode('hidden');
    }
    navigation.goBack();
  }, [haptic, audioUrl, isTrackPlaying, setPlayerMode, navigation]);

  // Gesture handler
  const {gesture: playerGesture, animatedStyle: gestureAnimatedStyle} =
    usePlayerGestures({
      onSwipeLeft: handleSkipForward,
      onSwipeRight: handleSkipBack,
      onSwipeDown: handleSwipeDownMinimize,
      onDoubleTap: handlePlayPause,
    });

  const progressPercent =
    progress.duration > 0
      ? (progress.position / progress.duration) * 100
      : 0;

  // Current exchange cho Focus View
  const currentExchange = exchanges[currentExchangeIndex];

  return (
    <View className="flex-1 bg-background">
      {/* ======================== */}
      {/* HEADER */}
      {/* ======================== */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center justify-between">
        {/* Back */}
        <TouchableOpacity
          onPress={() => {
            if (isTrackPlaying && audioUrl) {
              setPlayerMode('compact');
            } else {
              setPlayerMode('hidden');
            }
            navigation.goBack();
          }}
          className="p-2 -ml-2"
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Icon name="ArrowLeft" className="w-6 h-6 text-foreground" />
        </TouchableOpacity>

        {/* Title */}
        <AppText
          className="text-foreground font-sans-bold text-base flex-1 text-center mx-3"
          numberOfLines={1}>
          {conversation.title || config.topic || 'Bài nghe'}
        </AppText>

        {/* Right actions: View Toggle + Bookmark + Pocket */}
        <View className="flex-row items-center gap-1">
          {/* Reading/Focus toggle */}
          <TouchableOpacity
            onPress={() => {
              haptic.light();
              setViewMode(viewMode === 'reading' ? 'focus' : 'reading');
            }}
            className="p-2"
            accessibilityLabel={viewMode === 'reading' ? 'Chuyển Focus View' : 'Chuyển Reading View'}
            accessibilityRole="button">
            <Icon
              name={viewMode === 'reading' ? 'Maximize2' : 'List'}
              className="w-5 h-5"
              style={{color: LISTENING_BLUE}}
            />
          </TouchableOpacity>

          {/* Bookmark list → navigate */}
          <TouchableOpacity
            onPress={() => navigation.navigate('BookmarksVocabulary')}
            className="p-2"
            accessibilityLabel="Bookmarks & Từ vựng"
            accessibilityRole="button">
            <Icon name="Bookmark" className="w-5 h-5 text-neutrals400" />
          </TouchableOpacity>

          {/* Pocket Mode */}
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
      </View>

      {/* Audio generation banner */}
      {isGeneratingAudio && (
        <View
          className="mx-6 mb-3 rounded-xl px-4 py-3 flex-row items-center"
          style={{backgroundColor: `${LISTENING_BLUE}15`}}>
          <ActivityIndicator size="small" color={LISTENING_BLUE} />
          <AppText className="text-sm ml-3 flex-1" style={{color: LISTENING_BLUE}}>
            Đang tạo audio... Bạn có thể đọc transcript trước
          </AppText>
        </View>
      )}

      {/* ======================== */}
      {/* CONTENT: Reading View hoặc Focus View */}
      {/* ======================== */}
      <GestureDetector gesture={playerGesture}>
        <Animated.View style={[{flex: 1}, gestureAnimatedStyle]}>
          {viewMode === 'reading' ? (
            // ========================
            // READING VIEW — Full transcript chat-bubble layout
            // ========================
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 180}}>

              {/* Summary */}
              <TourTooltip
                stepId="transcript"
                activeStepId={tour.currentStepId}
                onNext={tour.nextStep}
                onSkip={tour.skipTour}
                stepIndex={0}
                totalSteps={TOUR_TOTAL}>
                <View>
                  {conversation.summary && (
                    <View className="bg-neutrals900 rounded-2xl p-4 mb-4">
                      <AppText className="text-neutrals400 text-sm">
                        {conversation.summary}
                      </AppText>
                    </View>
                  )}
                </View>
              </TourTooltip>

              {/* Exchanges — chat bubble style */}
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
                      className="rounded-2xl p-4 border"
                      style={{
                        backgroundColor: isActive
                          ? `${LISTENING_BLUE}15`
                          : isBookmarked
                            ? `${LISTENING_ORANGE}08`
                            : 'rgba(255,255,255,0.03)',
                        borderColor: isActive
                          ? `${LISTENING_BLUE}40`
                          : isBookmarked
                            ? `${LISTENING_ORANGE}30`
                            : 'transparent',
                      }}>
                      {/* Speaker label */}
                      <View className="flex-row items-center mb-2">
                        <View
                          className="w-7 h-7 rounded-full items-center justify-center mr-2"
                          style={{
                            backgroundColor: isEvenSpeaker
                              ? `${LISTENING_BLUE}20`
                              : `${LISTENING_ORANGE}20`,
                          }}>
                          <AppText className="text-xs">
                            {isEvenSpeaker ? '👤' : '👥'}
                          </AppText>
                        </View>
                        <AppText
                          className="text-sm font-sans-semibold"
                          style={{color: isEvenSpeaker ? LISTENING_BLUE : LISTENING_ORANGE}}>
                          {exchange.speaker}
                        </AppText>
                        {isActive && (
                          <View className="ml-auto flex-row items-end gap-0.5 h-3">
                            <View className="w-0.5 h-1 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
                            <View className="w-0.5 h-2 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
                            <View className="w-0.5 h-3 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
                            <View className="w-0.5 h-1.5 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
                          </View>
                        )}
                        {isBookmarked && (
                          <View className={isActive ? 'ml-1' : 'ml-auto'}>
                            <AppText className="text-xs">⭐</AppText>
                          </View>
                        )}
                      </View>

                      {/* Nội dung tiếng Anh */}
                      <TappableTranscript
                        text={exchange.text}
                        onWordPress={setSelectedWord}
                        isActive={isActive}
                      />

                      {/* Bản dịch tiếng Việt */}
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
                      <View key={i} className="bg-neutrals900 rounded-xl px-3 py-2">
                        <AppText className="text-foreground text-sm">{word}</AppText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            // ========================
            // FOCUS VIEW — Large current sentence only
            // ========================
            <View className="flex-1 items-center justify-center px-8">
              {currentExchange && (
                <Animated.View
                  key={currentExchangeIndex}
                  entering={SlideInRight.duration(300)}
                  className="items-center">
                  {/* Speaker badge */}
                  <View
                    className="flex-row items-center px-4 py-1.5 rounded-full mb-6"
                    style={{
                      backgroundColor: currentExchangeIndex % 2 === 0
                        ? `${LISTENING_BLUE}20`
                        : `${LISTENING_ORANGE}20`,
                    }}>
                    <AppText className="text-sm mr-1.5">
                      {currentExchangeIndex % 2 === 0 ? '👤' : '👥'}
                    </AppText>
                    <AppText
                      className="text-sm font-sans-semibold"
                      style={{
                        color: currentExchangeIndex % 2 === 0 ? LISTENING_BLUE : LISTENING_ORANGE,
                      }}>
                      {currentExchange.speaker}
                    </AppText>
                  </View>

                  {/* Câu tiếng Anh lớn */}
                  <AppText className="text-foreground text-2xl font-sans-bold text-center leading-9 mb-4">
                    {currentExchange.text}
                  </AppText>

                  {/* Bản dịch tiếng Việt */}
                  {showTranslation && currentExchange.vietnamese && (
                    <AppText className="text-neutrals500 text-base text-center italic">
                      {currentExchange.vietnamese}
                    </AppText>
                  )}

                  {/* Progress: câu hiện tại / tổng */}
                  <AppText className="text-neutrals600 text-xs mt-6">
                    {currentExchangeIndex + 1} / {exchanges.length}
                  </AppText>
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* ======================== */}
      {/* PLAYBACK CONTROLS — bottom fixed */}
      {/* ======================== */}
      <View className="bg-background border-t border-neutrals900 px-6 pb-safe-offset-4 pt-3">
        {/* Progress bar + waveform */}
        {(audioUrl || isTrackReady) && (
          <View className="mb-3">
            <View className="flex-row items-center gap-2">
              <WaveformVisualizer isPlaying={isTrackPlaying} height={20} />
              <View className="flex-1 h-1 bg-neutrals800 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{width: `${progressPercent}%`, backgroundColor: LISTENING_BLUE}}
                />
              </View>
            </View>
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

        {/* Control row */}
        <View className="flex-row items-center justify-center">
          {/* Tốc độ */}
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

          {/* Translation toggle */}
          <TourTooltip
            stepId="translation"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={3}
            totalSteps={TOUR_TOTAL}>
            <TouchableOpacity
              className="rounded-full px-3 py-2 ml-2"
              style={{backgroundColor: showTranslation ? `${LISTENING_BLUE}20` : 'rgba(255,255,255,0.05)'}}
              onPress={() => {
                toggleTranslation();
                haptic.light();
              }}>
              <AppText
                className="text-sm font-sans-bold"
                style={{color: showTranslation ? LISTENING_BLUE : '#6b7280'}}>
                VI
              </AppText>
            </TouchableOpacity>
          </TourTooltip>

          {/* Playback controls — center */}
          <TourTooltip
            stepId="playback"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={1}
            totalSteps={TOUR_TOTAL}>
            <View className="flex-row items-center gap-5 mx-4">
              <TouchableOpacity onPress={handleSkipBack}>
                <Icon name="SkipBack" className="w-6 h-6 text-neutrals300" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{backgroundColor: LISTENING_BLUE}}
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

              <TouchableOpacity onPress={handleSkipForward}>
                <Icon name="SkipForward" className="w-6 h-6 text-neutrals300" />
              </TouchableOpacity>
            </View>
          </TourTooltip>

          {/* Nút bài mới */}
          <TouchableOpacity
            className="bg-neutrals900 rounded-full px-3 py-2"
            onPress={handleNewConversation}>
            <Icon name="RefreshCw" className="w-4 h-4 text-neutrals300" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dictionary Popup */}
      <DictionaryPopup
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onSaveWord={word => {
          addSavedWord(word);
          useVocabularyStore.getState().addWord(word, 'listening');
          showSuccess('Đã lưu từ "' + word + '"');
        }}
        onPlayPronunciation={async (pronunciationUrl) => {
          try {
            const wasPlaying = isTrackPlaying;
            if (wasPlaying) {await TrackPlayer.pause();}
            const currentProgress = await TrackPlayer.getProgress();
            const Audio = require('react-native-audio-recorder-player').default;
            const audioRecorderPlayer = new Audio();
            await audioRecorderPlayer.startPlayer(pronunciationUrl);
            audioRecorderPlayer.addPlayBackListener(async (e: any) => {
              if (e.currentPosition >= e.duration - 100) {
                audioRecorderPlayer.stopPlayer();
                audioRecorderPlayer.removePlayBackListener();
                if (wasPlaying) {
                  try {
                    await TrackPlayer.seekTo(currentProgress.position);
                    await TrackPlayer.play();
                  } catch {}
                }
              }
            });
          } catch {
            showError('Lỗi phát âm', 'Không thể phát âm từ này');
          }
        }}
      />

      {/* Pocket Mode overlay */}
      {pocketMode && (
        <View className="absolute inset-0" style={{zIndex: 999}}>
          <PocketMode onExit={() => setPocketMode(false)} />
        </View>
      )}
    </View>
  );
}

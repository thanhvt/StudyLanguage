import React, {useEffect, useRef, useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  SlideInRight,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';

// ========================
// Map voiceId → tên hiển thị cho Azure voices
// ========================
const VOICE_DISPLAY_NAMES: Record<string, string> = {
  'en-US-AriaNeural': 'Aria',
  'en-US-JennyNeural': 'Jenny',
  'en-US-SaraNeural': 'Sara',
  'en-US-JaneNeural': 'Jane',
  'en-US-NancyNeural': 'Nancy',
  'en-US-GuyNeural': 'Guy',
  'en-US-DavisNeural': 'Davis',
  'en-US-TonyNeural': 'Tony',
  'en-US-JasonNeural': 'Jason',
  // OpenAI voices (fallback)
  alloy: 'Alloy',
  echo: 'Echo',
  fable: 'Fable',
  onyx: 'Onyx',
  nova: 'Nova',
  shimmer: 'Shimmer',
};

/**
 * Lấy tên giọng đọc thực tế thay vì tên nhân vật
 *
 * Mục đích: Hiển thị tên voice (Jenny, Guy) thay vì tên AI đặt (Sarah, Mike)
 * Tham số đầu vào:
 *   - speakerLabel: Tên nhân vật từ conversation (ví dụ: 'Sarah')
 *   - voiceMap: Map speaker → voiceId từ API response
 * Tham số đầu ra: Tên giọng đọc để hiển thị (ví dụ: 'Jenny')
 * Khi nào sử dụng: Render speaker name trong Reading/Focus view
 */
function getVoiceDisplayName(
  speakerLabel: string,
  voiceMap: Record<string, string>,
): string {
  const voiceId = voiceMap[speakerLabel];
  if (voiceId) {
    // Tìm displayName từ map, fallback lấy phần tên từ voiceId
    return VOICE_DISPLAY_NAMES[voiceId]
      || voiceId.split('-').pop()?.replace('Neural', '') || speakerLabel;
  }
  // Fallback: giữ tên nhân vật nếu chưa có voiceMap (audio chưa sinh)
  return speakerLabel;
}

import {listeningApi, bookmarkApi} from '@/services/api/listening';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from 'react-native-track-player';
import {setupPlayer, addTrack} from '@/services/audio/trackPlayer';
import {useToast} from '@/components/ui/ToastProvider';
import {useHaptic} from '@/hooks/useHaptic';
import {useColors} from '@/hooks/useColors';
import MarqueeText from '@/components/ui/MarqueeText';
import {
  ExchangeItem,
  DictionaryPopup,
  WaveformVisualizer,
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
const TOUR_TOTAL = 4;
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';


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
  const setWordTimestamps = useListeningStore(state => state.setWordTimestamps);
  const wordTimestamps = useListeningStore(state => state.wordTimestamps);

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
  const activeVoiceMap = useListeningStore(state => state.activeVoiceMap);
  const setActiveVoiceMap = useListeningStore(state => state.setActiveVoiceMap);

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
  const [isLooping, setIsLooping] = useState(false);


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
  const haptic = useHaptic();
  const colors = useColors();

  const audioGenRequestedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  // Lưu vị trí Y thực tế của từng exchange (đo bằng onLayout)
  const exchangeYPositions = useRef<Record<number, number>>({});
  // Offset của exchanges container trong ScrollView
  const exchangeContainerOffsetY = useRef(0);

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
    // Đánh dấu nguồn audio là Listening — để MinimizedPlayer biết đọc data từ useListeningStore
    useAudioPlayerStore.getState().setActiveSource('listening');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus/blur — chuyển minimized mode + auto-scroll tới câu đang phát
  useFocusEffect(
    useCallback(() => {
      setPlayerMode('full');

      // Auto-scroll tới câu đang phát khi quay lại từ MinimizedPlayer
      // Cơ chế 2 bước:
      //   Bước 1: Scroll ước lượng ngay (để user thấy phản hồi nhanh)
      //   Bước 2: Scroll chính xác sau khi onLayout đã fire (500ms)
      const interactionPromise = require('react-native').InteractionManager.runAfterInteractions(() => {
        const idx = useListeningStore.getState().currentExchangeIndex;
        if (idx > 0 && scrollViewRef.current) {
          // Bước 1: Scroll ước lượng ngay lập tức
          scrollViewRef.current.scrollTo({y: idx * 120, animated: false});
        }
      });

      // Bước 2: Sau 500ms — onLayout đã fire → scroll chính xác
      const preciseScrollTimer = setTimeout(() => {
        const idx = useListeningStore.getState().currentExchangeIndex;
        if (idx > 0 && scrollViewRef.current) {
          const measuredY = exchangeYPositions.current[idx];
          if (measuredY !== undefined) {
            const scrollY = exchangeContainerOffsetY.current + measuredY - 20;
            scrollViewRef.current.scrollTo({y: Math.max(0, scrollY), animated: true});
          }
        }
      }, 500);

      return () => {
        interactionPromise.cancel();
        clearTimeout(preciseScrollTimer);
        const currentState = useAudioPlayerStore.getState();
        if (currentState.isPlaying && currentState.playerMode === 'full') {
          setPlayerMode('minimized');
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
        // Lưu word timestamps cho word-level karaoke highlight (nếu có)
        if (result.wordTimestamps) {
          setWordTimestamps(result.wordTimestamps);
        }
        // Lưu voice map thực tế từ API response (để hiển thị tên giọng đọc)
        if (result.voiceMap) {
          setActiveVoiceMap(result.voiceMap);
        }
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
  // LƯU Ý: KHÔNG đưa currentExchangeIndex vào deps — nó tự thay đổi chính nó → infinite loop
  useEffect(() => {
    if (!timestamps?.length || !isTrackPlaying) {return;}
    const currentTime = progress.position;
    const activeIndex = timestamps.findIndex(
      ts => currentTime >= ts.startTime && currentTime < ts.endTime,
    );
    // So sánh với store value trực tiếp thay vì reactive dep
    const currentIdx = useListeningStore.getState().currentExchangeIndex;
    if (activeIndex !== -1 && activeIndex !== currentIdx) {
      setCurrentExchangeIndex(activeIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.position, timestamps, isTrackPlaying]);

  // ========================
  // Empty state
  // ========================
  if (!conversation) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{backgroundColor: colors.background}}>
        <Icon name="Headphones" className="w-16 h-16 mb-4" style={{color: colors.neutrals300}} />
        <AppText className="font-sans-bold text-xl mb-2 text-center" style={{color: colors.foreground}}>
          Chưa có bài nghe
        </AppText>
        <AppText className="text-center text-sm mb-6" style={{color: colors.neutrals400}}>
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

  const progressPercent =
    progress.duration > 0
      ? (progress.position / progress.duration) * 100
      : 0;

  // Current exchange cho Focus View
  const currentExchange = exchanges[currentExchangeIndex];

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* ======================== */}
      {/* HEADER */}
      {/* ======================== */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center justify-between">
        {/* Back */}
        <TouchableOpacity
          onPress={() => {
            if (isTrackPlaying && audioUrl) {
              setPlayerMode('minimized');
            } else {
              setPlayerMode('hidden');
            }
            navigation.goBack();
          }}
          className="p-2 -ml-2"
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>

        {/* Title — marquee khi text dài */}
        <View className="flex-1 mx-3">
          <MarqueeText
            text={conversation.title || config.topic || 'Bài nghe'}
            textColor={colors.foreground}
            textClassName="font-sans-bold text-base"
            speed={35}
            gap={60}
          />
        </View>

        {/* Right actions: View Toggle + Translation + Bookmark */}
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
            <Icon name="Bookmark" className="w-5 h-5" style={{color: colors.neutrals400}} />
          </TouchableOpacity>

          {/* Translation toggle (VI) */}
          <TourTooltip
            stepId="translation"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={3}
            totalSteps={TOUR_TOTAL}>
            <TouchableOpacity
              onPress={() => {
                toggleTranslation();
                haptic.light();
              }}
              className="p-2"
              accessibilityLabel={showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Hiện bản dịch tiếng Việt'}
              accessibilityRole="button">
              <AppText
                className="text-base font-sans-bold"
                style={{color: showTranslation ? LISTENING_BLUE : colors.neutrals400}}>
                VI
              </AppText>
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
      <View style={{flex: 1}}>
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
                    <View className="rounded-2xl p-4 mb-4" style={{backgroundColor: colors.neutrals900}}>
                      <AppText className="text-sm" style={{color: colors.neutrals400}}>
                        {conversation.summary}
                      </AppText>
                    </View>
                  )}
                </View>
              </TourTooltip>

              {/* Exchanges — chat bubble style */}
              <View
                className="gap-3"
                onLayout={(e) => {
                  // Ghi lại offset của container trong ScrollView
                  exchangeContainerOffsetY.current = e.nativeEvent.layout.y;
                }}>
                {exchanges.map((exchange, index) => {
                  const isActive = index === currentExchangeIndex;
                  const isEvenSpeaker = index % 2 === 0;
                  const isBookmarked = bookmarkedIndexes.includes(index);

                  return (
                    <ExchangeItem
                      key={index}
                      exchange={exchange}
                      index={index}
                      isActive={isActive}
                      isEvenSpeaker={isEvenSpeaker}
                      isBookmarked={isBookmarked}
                      speakerDisplayName={getVoiceDisplayName(exchange.speaker, activeVoiceMap)}
                      showTranslation={showTranslation}
                      isPlaying={isTrackPlaying}
                      playbackSpeed={playbackSpeed}
                      wordTimestamps={wordTimestamps?.[index]}
                      onPress={handleExchangePress}
                      onLongPress={handleBookmarkToggle}
                      onWordPress={setSelectedWord}
                      onLayout={(idx, y) => {
                        exchangeYPositions.current[idx] = y;
                      }}
                      foregroundColor={colors.foreground}
                      glassHoverColor={colors.glassHover}
                      neutrals500Color={colors.neutrals500}
                    />
                  );
                })}
              </View>

              {/* Từ vựng */}
              {conversation.vocabulary && conversation.vocabulary.length > 0 && (
                <View className="mt-6">
                  <AppText className="font-sans-bold text-base mb-3" style={{color: colors.foreground}}>
                    📝 Từ vựng đáng chú ý
                  </AppText>
                  <View className="flex-row flex-wrap gap-2">
                    {conversation.vocabulary.map((word, i) => (
                      <View key={i} className="rounded-xl px-3 py-2" style={{backgroundColor: colors.neutrals900}}>
                        <AppText className="text-sm" style={{color: colors.foreground}}>{word}</AppText>
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
            <ScrollView
              className="flex-1 px-8"
              contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32}}
              showsVerticalScrollIndicator={false}>
              {currentExchange && (
                <Animated.View
                  key={currentExchangeIndex}
                  entering={SlideInRight.duration(300)}
                  className="items-center w-full">
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
                      {getVoiceDisplayName(currentExchange.speaker, activeVoiceMap)}
                    </AppText>
                  </View>

                  {/* Câu tiếng Anh lớn */}
                  <AppText className="text-2xl font-sans-bold text-center leading-9 mb-4" style={{color: colors.foreground}}>
                    {currentExchange.text}
                  </AppText>

                  {/* Bản dịch tiếng Việt */}
                  {showTranslation && currentExchange.vietnamese && (
                    <AppText className="text-base text-center italic" style={{color: colors.neutrals500}}>
                      {currentExchange.vietnamese}
                    </AppText>
                  )}

                  {/* Progress: câu hiện tại / tổng */}
                  <AppText className="text-xs mt-6" style={{color: colors.neutrals600}}>
                    {currentExchangeIndex + 1} / {exchanges.length}
                  </AppText>
                </Animated.View>
              )}
            </ScrollView>
          )}
      </View>

      <View
        className="mx-4 mb-safe-offset-1 mt-2 rounded-2xl px-5 pt-4 pb-3"
        style={{
          backgroundColor: 'transparent',
        }}>
        {/* Row 1: Waveform + Thời gian */}
        {(audioUrl || isTrackReady) && (
          <View className="mb-3">
            <View className="flex-row items-end justify-between">
              {/* Waveform xanh/cam */}
              <WaveformVisualizer isPlaying={isTrackPlaying} height={36} />
              {/* Thời gian: current / total */}
              <AppText className="text-sm font-sans-semibold" style={{color: colors.foreground}}>
                {formatTime(progress.position)}
                <AppText className="text-sm font-sans-medium" style={{color: colors.neutrals400}}>
                  {' / '}{formatTime(progress.duration)}
                </AppText>
              </AppText>
            </View>

            {/* Progress bar với chấm cam */}
            <View className="mt-2 h-1.5 rounded-full overflow-visible" style={{backgroundColor: colors.neutrals800}}>
              <View
                className="h-full rounded-full"
                style={{width: `${Math.min(progressPercent, 100)}%`, backgroundColor: LISTENING_BLUE}}
              />
              {/* Chấm cam indicator */}
              <View
                style={{
                  position: 'absolute',
                  left: `${Math.min(progressPercent, 100)}%`,
                  top: -4,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#F97316',
                  marginLeft: -7,
                  shadowColor: '#F97316',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              />
            </View>
          </View>
        )}

        {/* Row 2: Controls */}
        <View className="flex-row items-center justify-between">
          {/* Tốc độ */}
          <TourTooltip
            stepId="speed"
            activeStepId={tour.currentStepId}
            onNext={tour.nextStep}
            onSkip={tour.skipTour}
            stepIndex={2}
            totalSteps={TOUR_TOTAL}>
            <TouchableOpacity
              className="rounded-xl px-3 py-1.5"
              style={{backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder}}
              onPress={cycleSpeed}>
              <AppText className="font-sans-bold text-sm" style={{color: colors.foreground}}>
                {playbackSpeed}x
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
            <View className="flex-row items-center gap-4">
              {/* Skip Back */}
              <TouchableOpacity onPress={handleSkipBack} className="items-center">
                <Icon name="Rewind" className="w-5 h-5" style={{color: colors.neutrals400}} />
              </TouchableOpacity>

              {/* Play/Pause */}
              <TouchableOpacity
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: LISTENING_BLUE,
                  shadowColor: '#2563EB',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 6,
                }}
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

              {/* Skip Forward */}
              <TouchableOpacity onPress={handleSkipForward} className="items-center">
                <Icon name="FastForward" className="w-5 h-5" style={{color: colors.neutrals400}} />
              </TouchableOpacity>
            </View>
          </TourTooltip>

          {/* Loop button */}
          <TouchableOpacity
            className="rounded-xl p-2"
            style={{
              backgroundColor: isLooping ? `${LISTENING_BLUE}20` : colors.glassBg,
              borderWidth: 1,
              borderColor: isLooping ? `${LISTENING_BLUE}40` : colors.glassBorder,
            }}
            onPress={async () => {
              const newLoop = !isLooping;
              setIsLooping(newLoop);
              haptic.light();
              try {
                // Bật/tắt loop cho TrackPlayer
                const RepeatMode = require('react-native-track-player').RepeatMode;
                await TrackPlayer.setRepeatMode(newLoop ? RepeatMode.Track : RepeatMode.Off);
              } catch {}
            }}
            accessibilityLabel={isLooping ? 'Tắt lặp lại' : 'Bật lặp lại'}
            accessibilityRole="button">
            <Icon name="Repeat" className="w-5 h-5" style={{color: isLooping ? LISTENING_BLUE : colors.neutrals400}} />
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
        onPronounce={async (pronounceWord) => {
          try {
            // Pause audio hội thoại nếu đang phát
            const wasPlaying = isTrackPlaying;
            if (wasPlaying) {await TrackPlayer.pause();}
            const currentProgress = await TrackPlayer.getProgress();

            // Gọi Azure TTS để sinh audio phát âm từ
            console.log('🔊 [PlayerScreen] Phát âm từ qua Azure TTS:', pronounceWord);
            const audioData = await listeningApi.previewVoice(pronounceWord, 'en-US-JennyNeural');

            // Chuyển ArrayBuffer → base64 → ghi file tạm
            const {Buffer} = require('buffer');
            const base64Audio = Buffer.from(audioData).toString('base64');
            const RNFS = require('react-native-fs');
            const tempPath = `${RNFS.CachesDirectoryPath}/dict_pronounce_${pronounceWord}.mp3`;
            await RNFS.writeFile(tempPath, base64Audio, 'base64');

            // Phát audio qua audio recorder player
            const AudioRecorderPlayer = require('react-native-audio-recorder-player').default;
            const player = new AudioRecorderPlayer();
            await player.startPlayer(`file://${tempPath}`);
            player.addPlayBackListener(async (e: any) => {
              if (e.currentPosition >= e.duration - 100) {
                player.stopPlayer();
                player.removePlayBackListener();
                // Resume audio hội thoại nếu trước đó đang phát
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


    </View>
  );
}

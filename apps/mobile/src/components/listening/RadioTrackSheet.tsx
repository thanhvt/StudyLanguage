/**
 * RadioTrackSheet — Bottom Sheet hiển thị transcript cho Radio track
 *
 * Mục đích: Mở sheet 55-90% khi user tap track, hiện transcript chat bubble
 *   + waveform + progress bar (chấm cam) + play/pause/speed/repeat controls
 *   + translation toggle, tap-to-seek, auto-scroll, dictionary, bookmark
 * Tham số đầu vào: RadioTrackSheetProps
 * Tham số đầu ra: JSX.Element (Bottom Sheet)
 * Khi nào sử dụng: RadioScreen → tap track → mở sheet
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import TrackPlayer, {State as TrackPlayerState} from 'react-native-track-player';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useRadioPlayer} from '@/hooks/useRadioPlayer';
import {useRadioStore} from '@/store/useRadioStore';
import {useProgress} from 'react-native-track-player';
import {formatTime} from '@/utils/formatTime';
import {LISTENING_BLUE} from '@/constants/listening';
import {
  ExchangeItem,
  WaveformVisualizer,
  DictionaryPopup,
} from '@/components/listening';
import {bookmarkApi} from '@/services/api/listening';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useListeningStore} from '@/store/useListeningStore';
import {useToast} from '@/components/ui/ToastProvider';
import type {RadioPlaylistItem} from '@/services/api/radio';

const LISTENING_ORANGE = '#F97316';

interface RadioTrackSheetProps {
  /** Track đang hiện trong sheet (null = đóng sheet) */
  track: RadioPlaylistItem | null;
  /** Index của track trong playlist */
  trackIndex: number;
  /** Đang phát audio không */
  isPlaying: boolean;
  /** Đang loading audio không */
  isLoading: boolean;
  /** Callback đóng sheet */
  onClose: () => void;
}

/**
 * Mục đích: Bottom sheet transcript cho Radio Mode — full-featured mini player
 * Tham số đầu vào: RadioTrackSheetProps
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen mở khi user tap vào track
 */
export default function RadioTrackSheet({
  track,
  trackIndex,
  isPlaying,
  isLoading,
  onClose,
}: RadioTrackSheetProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const {togglePlay, skip, previous, setSpeed} = useRadioPlayer();
  const playbackSpeed = useRadioStore(s => s.playbackSpeed);
  const repeat = useRadioStore(s => s.repeat);
  const cycleRepeat = useRadioStore(s => s.cycleRepeat);
  const progress = useProgress(500);
  const {showSuccess, showError, showInfo} = useToast();
  const addSavedWord = useListeningStore(s => s.addSavedWord);
  const sheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<any>(null);
  const navigation = useNavigation<any>();

  // Trạng thái local
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(-1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [bookmarkedIndexes, setBookmarkedIndexes] = useState<number[]>([]);

  // Snap points: 55% mặc định, kéo lên max 90%
  const snapPoints = useMemo(() => ['55%', '90%'], []);

  // Đóng sheet
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Cycle speed
  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const handleSpeedCycle = useCallback(async () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    haptic.light();
    await setSpeed(SPEED_OPTIONS[nextIdx]);
  }, [playbackSpeed, setSpeed, haptic]);

  // Repeat cycle
  const handleRepeatCycle = useCallback(() => {
    haptic.light();
    cycleRepeat();
  }, [cycleRepeat, haptic]);

  // Progress percent
  const progressPercent =
    progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

  // Lấy exchanges + timestamps
  const exchanges = track?.conversation || [];
  const timestamps = track?.audioTimestamps || [];

  /**
   * Mục đích: Đồng bộ currentExchangeIndex theo audio position
   * Tham số đầu vào: progress.position, timestamps
   * Tham số đầu ra: void (set state)
   * Khi nào sử dụng: Mỗi 500ms khi audio đang phát
   */
  useEffect(() => {
    if (!timestamps.length || !isPlaying) return;
    const currentTime = progress.position;
    const activeIndex = timestamps.findIndex(
      ts => currentTime >= ts.startTime && currentTime < ts.endTime,
    );
    if (activeIndex !== -1 && activeIndex !== currentExchangeIndex) {
      setCurrentExchangeIndex(activeIndex);
    }
  }, [progress.position, timestamps, isPlaying, currentExchangeIndex]);

  /**
   * Mục đích: Auto-scroll tới câu đang phát khi index thay đổi
   * Tham số đầu vào: currentExchangeIndex
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi audio chuyển sang câu mới
   */
  useEffect(() => {
    if (currentExchangeIndex > 0 && scrollViewRef.current) {
      // Ước lượng Y = index * 100px (trung bình height 1 exchange)
      const estimatedY = currentExchangeIndex * 100 - 50;
      scrollViewRef.current.scrollTo({
        y: Math.max(0, estimatedY),
        animated: true,
      });
    }
  }, [currentExchangeIndex]);

  /**
   * Mục đích: Tap vào exchange → seek audio tới timestamp
   * Tham số đầu vào: index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào câu trong transcript
   */
  const handleExchangePress = useCallback(
    async (index: number) => {
      setCurrentExchangeIndex(index);
      haptic.light();
      if (timestamps[index]) {
        try {
          await TrackPlayer.seekTo(timestamps[index].startTime);
        } catch {
          console.warn('⚠️ [RadioSheet] Không thể seek tới timestamp');
        }
      }
    },
    [timestamps, haptic],
  );

  /**
   * Mục đích: Long press → toggle bookmark (gọi API + optimistic UI)
   * Tham số đầu vào: index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User long press câu trong transcript
   */
  const handleBookmarkToggle = useCallback(
    async (index: number) => {
      const exchange = exchanges[index];
      if (!exchange) return;

      const isCurrentlyBookmarked = bookmarkedIndexes.includes(index);
      haptic.medium();

      // Optimistic update — cập nhật UI ngay
      setBookmarkedIndexes(prev =>
        isCurrentlyBookmarked
          ? prev.filter(i => i !== index)
          : [...prev, index],
      );

      try {
        if (isCurrentlyBookmarked) {
          // Xóa bookmark
          await bookmarkApi.deleteByIndex({sentenceIndex: index});
          showInfo('Đã bỏ bookmark', exchange.text.substring(0, 40) + '...');
        } else {
          // Tạo bookmark mới
          await bookmarkApi.create({
            sentenceIndex: index,
            speaker: exchange.speaker,
            sentenceText: exchange.text,
            sentenceTranslation: exchange.vietnamese,
            topic: track?.topic,
          });
          showSuccess('Đã lưu bookmark ⭐', exchange.text.substring(0, 40) + '...');
        }
      } catch {
        // Rollback: hoàn tác optimistic update khi API lỗi
        setBookmarkedIndexes(prev =>
          isCurrentlyBookmarked
            ? [...prev, index]
            : prev.filter(i => i !== index),
        );
        showError('Lỗi', 'Không thể lưu bookmark');
        console.warn('⚠️ [RadioSheet] Lỗi bookmark API, đã rollback');
      }
    },
    [exchanges, bookmarkedIndexes, haptic, track?.topic, showSuccess, showError, showInfo],
  );

  // Repeat icon dựa trên mode
  const repeatIcon = repeat === 'one' ? 'Repeat1' : 'Repeat';
  const repeatActive = repeat !== 'off';

  if (!track) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={handleClose}
      handleIndicatorStyle={{backgroundColor: colors.neutrals400, width: 40}}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}>
      {/* Header */}
      <View className="px-5 pb-3 border-b" style={{borderColor: colors.glassBorder}}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <AppText
              className="font-sans-bold text-base"
              style={{color: colors.foreground}}
              numberOfLines={1}>
              {track.topic}
            </AppText>
            <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}}>
              {exchanges.length} câu • {track.numSpeakers} người •{' '}
              Track {trackIndex + 1}
            </AppText>
          </View>

          {/* Nút VI toggle */}
          <TouchableOpacity
            onPress={() => {
              // Kiểm tra xem data có vietnamese không
              const hasVietnamese = exchanges.some(e => !!e.vietnamese);
              if (hasVietnamese) {
                setShowTranslation(prev => !prev);
              } else {
                showInfo('Chưa có bản dịch', 'Playlist này chưa có bản dịch. Hãy tạo playlist mới!');
              }
              haptic.light();
            }}
            className="p-2"
            accessibilityLabel={showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
            accessibilityRole="button">
            <AppText
              className="text-base font-sans-bold"
              style={{color: showTranslation ? LISTENING_BLUE : colors.neutrals400}}>
              VI
            </AppText>
          </TouchableOpacity>

          {/* Nút đóng */}
          <TouchableOpacity
            onPress={handleClose}
            className="p-2 -mr-2"
            accessibilityLabel="Đóng"
            accessibilityRole="button">
            <Icon name="X" className="w-5 h-5" style={{color: colors.neutrals400}} />
          </TouchableOpacity>
        </View>

        {/* Bookmark + Vocabulary count indicators */}
        {bookmarkedIndexes.length > 0 && (
          <TouchableOpacity
            className="flex-row items-center gap-3 mt-1.5"
            onPress={() => {
              // Navigate to BookmarksVocabulary screen
              handleClose();
              setTimeout(() => {
                navigation.navigate('BookmarksVocabulary');
              }, 300);
            }}
            accessibilityLabel="Xem danh sách bookmark"
            accessibilityRole="button">
            <AppText className="text-xs" style={{color: LISTENING_BLUE}}>
              ⭐ {bookmarkedIndexes.length} bookmark • Xem tất cả ›
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Transcript — dùng ExchangeItem component */}
      <BottomSheetScrollView
        ref={scrollViewRef}
        contentContainerStyle={{padding: 16, paddingBottom: 20}}
        showsVerticalScrollIndicator={false}>
        {exchanges.map((exchange, index) => {
          const isActive = index === currentExchangeIndex;
          const isEvenSpeaker = index % 2 === 0;
          const isBookmarked = bookmarkedIndexes.includes(index);

          return (
            <View key={index} className="mb-2.5">
              <ExchangeItem
                exchange={exchange}
                index={index}
                isActive={isActive}
                isEvenSpeaker={isEvenSpeaker}
                isBookmarked={isBookmarked}
                speakerDisplayName={exchange.speaker}
                showTranslation={showTranslation}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onPress={handleExchangePress}
                onLongPress={handleBookmarkToggle}
                onWordPress={setSelectedWord}
                foregroundColor={colors.foreground}
                glassHoverColor={colors.glassHover}
                neutrals500Color={colors.neutrals500}
              />
            </View>
          );
        })}
      </BottomSheetScrollView>

      {/* Footer cố định: Waveform + Progress + Controls */}
      <View
        className="px-5 pt-3"
        style={{
          paddingBottom: 34,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.glassBorder,
        }}>
        {/* Row 1: Waveform + Thời gian */}
        <View className="mb-3">
          <View className="flex-row items-end justify-between">
            {/* Waveform xanh/cam */}
            <WaveformVisualizer isPlaying={isPlaying} height={28} />
            {/* Thời gian: current / total */}
            <AppText className="text-sm font-sans-semibold" style={{color: colors.foreground}}>
              {formatTime(progress.position)}
              <AppText className="text-sm font-sans-medium" style={{color: colors.neutrals400}}>
                {' / '}{formatTime(progress.duration)}
              </AppText>
            </AppText>
          </View>

          {/* Row 2: Progress bar với chấm cam */}
          <View className="mt-2 h-1.5 rounded-full overflow-visible" style={{backgroundColor: colors.neutrals800}}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: LISTENING_BLUE,
              }}
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
                backgroundColor: LISTENING_ORANGE,
                marginLeft: -7,
                shadowColor: LISTENING_ORANGE,
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 4,
              }}
            />
          </View>
        </View>

        {/* Row 3: Controls */}
        <View className="flex-row items-center justify-between">
          {/* Speed */}
          <TouchableOpacity
            onPress={handleSpeedCycle}
            className="rounded-xl px-3 py-1.5"
            style={{
              backgroundColor: colors.glassBg,
              borderWidth: 1,
              borderColor: colors.glassBorder,
            }}
            accessibilityLabel={`Tốc độ ${playbackSpeed}x`}>
            <AppText
              className="text-sm font-sans-bold"
              style={{color: playbackSpeed !== 1.0 ? LISTENING_BLUE : colors.foreground}}>
              {playbackSpeed}x
            </AppText>
          </TouchableOpacity>

          {/* Playback controls — center */}
          <View className="flex-row items-center gap-4">
            {/* Previous / Skip Back */}
            <TouchableOpacity
              onPress={() => { haptic.light(); previous(); }}
              className="items-center"
              accessibilityLabel="Bài trước">
              <Icon name="Rewind" className="w-5 h-5" style={{color: colors.neutrals400}} />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              onPress={() => { haptic.medium(); togglePlay(); }}
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{
                backgroundColor: LISTENING_BLUE,
                shadowColor: '#2563EB',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
              accessibilityLabel={isPlaying ? 'Tạm dừng' : 'Phát'}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon
                  name={isPlaying ? 'Pause' : 'Play'}
                  className="w-7 h-7 text-white"
                />
              )}
            </TouchableOpacity>

            {/* Next / Skip Forward */}
            <TouchableOpacity
              onPress={() => { haptic.light(); skip(); }}
              className="items-center"
              accessibilityLabel="Bài tiếp">
              <Icon name="FastForward" className="w-5 h-5" style={{color: colors.neutrals400}} />
            </TouchableOpacity>
          </View>

          {/* Repeat button */}
          <TouchableOpacity
            onPress={handleRepeatCycle}
            className="rounded-xl p-2"
            style={{
              backgroundColor: repeatActive ? `${LISTENING_BLUE}20` : colors.glassBg,
              borderWidth: 1,
              borderColor: repeatActive ? `${LISTENING_BLUE}40` : colors.glassBorder,
            }}
            accessibilityLabel={`Lặp: ${repeat}`}
            accessibilityRole="button">
            <Icon
              name={repeatIcon}
              className="w-5 h-5"
              style={{color: repeatActive ? LISTENING_BLUE : colors.neutrals400}}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dictionary Popup */}
      <DictionaryPopup
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onSaveWord={(word) => {
          // Lưu từ vào cả 2 store: vocabularyStore (global) + listeningStore (legacy)
          addSavedWord(word);
          useVocabularyStore.getState().addWord(word, 'listening');
          showSuccess('Đã lưu từ "' + word + '" 📚');
          setSelectedWord(null);
        }}
        onPronounce={async (pronounceWord) => {
          try {
            // Pause audio hội thoại nếu đang phát
            const playbackState = await TrackPlayer.getPlaybackState();
            const wasPlaying = playbackState.state === TrackPlayerState.Playing;
            if (wasPlaying) {
              await TrackPlayer.pause();
            }

            const {listeningApi} = require('@/services/api/listening');
            const audioData = await listeningApi.previewVoice(pronounceWord, 'en-US-JennyNeural');
            const {Buffer} = require('buffer');
            const base64Audio = Buffer.from(audioData).toString('base64');
            const RNFS = require('react-native-fs');
            const tempPath = `${RNFS.CachesDirectoryPath}/radio_dict_${pronounceWord}.mp3`;
            await RNFS.writeFile(tempPath, base64Audio, 'base64');
            const AudioRecorderPlayer = require('react-native-audio-recorder-player').default;
            const player = new AudioRecorderPlayer();
            await player.startPlayer(`file://${tempPath}`);
            player.addPlayBackListener(async (e: any) => {
              if (e.currentPosition >= e.duration - 100) {
                player.stopPlayer();
                player.removePlayBackListener();
                // Resume audio hội thoại nếu trước đó đang phát
                if (wasPlaying) {
                  await TrackPlayer.play();
                }
              }
            });
          } catch {
            console.warn('⚠️ [RadioSheet] Lỗi phát âm từ');
          }
        }}
      />
    </BottomSheet>
  );
}

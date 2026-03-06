/**
 * useRadioPlayer — Hook quản lý audio playback cho Radio Mode
 *
 * Mục đích: Đóng gói logic phát audio (TrackPlayer), skip, previous, speed, sleep timer,
 *           fade in/out (T-29), AbortController (T-22), auto pre-download (T-25)
 * Tham số đầu vào: không
 * Tham số đầu ra: object chứa play, skip, previous, setSpeed, togglePlay...
 * Khi nào sử dụng:
 *   - RadioScreen dùng để phát track
 *   - NowPlayingBar dùng để điều khiển phát
 */
import {useCallback, useRef, useEffect} from 'react';
import TrackPlayer, {Event, State} from 'react-native-track-player';
import {setupPlayer, addTrack} from '@/services/audio/trackPlayer';
import {useRadioStore} from '@/store/useRadioStore';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi} from '@/services/api/listening';
import {radioApi} from '@/services/api/radio';
import type {RadioPlaylistItem} from '@/services/api/radio';

// T-29: Hằng số cho fade
const FADE_DURATION_MS = 800;
const FADE_STEPS = 16;

/**
 * Mục đích: Fade volume từ from → to trong duration ms
 * Tham số đầu vào: from (0-1), to (0-1), duration ms
 * Tham số đầu ra: Promise<void>
 * Khi nào sử dụng: Trước khi dừng (fade out) và sau khi play (fade in)
 */
async function fadeVolume(from: number, to: number, duration: number = FADE_DURATION_MS) {
  const stepDuration = duration / FADE_STEPS;
  const stepSize = (to - from) / FADE_STEPS;
  for (let i = 0; i <= FADE_STEPS; i++) {
    try {
      await TrackPlayer.setVolume(from + stepSize * i);
      await new Promise<void>(r => setTimeout(r, stepDuration));
    } catch {
      break; // Player đã bị reset
    }
  }
}

/**
 * Mục đích: Custom hook quản lý Radio audio playback
 * Tham số đầu vào: không
 * Tham số đầu ra: Object với các methods play/skip/previous/togglePlay/setSpeed
 * Khi nào sử dụng: RadioScreen, NowPlayingBar
 */
export function useRadioPlayer() {
  // S-07 fix: Individual selectors instead of destructuring — avoids re-render on unrelated state changes
  const currentPlaylist = useRadioStore(s => s.currentPlaylist);
  const currentTrackIndex = useRadioStore(s => s.currentTrackIndex);
  const playbackState = useRadioStore(s => s.playbackState);
  const isGeneratingAudio = useRadioStore(s => s.isGeneratingAudio);
  const playbackSpeed = useRadioStore(s => s.playbackSpeed);
  const sleepTimerEndAt = useRadioStore(s => s.sleepTimerEndAt);
  const setPlaybackState = useRadioStore(s => s.setPlaybackState);
  const setCurrentTrackIndex = useRadioStore(s => s.setCurrentTrackIndex);
  const setGeneratingAudio = useRadioStore(s => s.setGeneratingAudio);
  const nextTrack = useRadioStore(s => s.nextTrack);
  const previousTrack = useRadioStore(s => s.previousTrack);
  const addListenedTime = useRadioStore(s => s.addListenedTime);
  const checkAndUpdateStreak = useRadioStore(s => s.checkAndUpdateStreak);

  // Global audio player store
  const setGlobalPlaying = useAudioPlayerStore(s => s.setIsPlaying);
  const setPlayerMode = useAudioPlayerStore(s => s.setPlayerMode);

  // TTS settings từ Listening store (T-07)
  const randomVoice = useListeningStore(s => s.randomVoice);
  const voicePerSpeaker = useListeningStore(s => s.voicePerSpeaker);
  const multiTalker = useListeningStore(s => s.multiTalker);
  const multiTalkerPairIndex = useListeningStore(s => s.multiTalkerPairIndex);
  const ttsEmotion = useListeningStore(s => s.ttsEmotion);
  const ttsPitch = useListeningStore(s => s.ttsPitch);
  const ttsRate = useListeningStore(s => s.ttsRate);
  const ttsVolume = useListeningStore(s => s.ttsVolume);
  const randomEmotion = useListeningStore(s => s.randomEmotion);

  // Refs để tránh stale closure
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  // T-22: AbortController ref cho race condition
  const abortRef = useRef<AbortController | null>(null);

  // Sleep timer check interval
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Mục đích: Sinh audio TTS và phát track
   * Tham số đầu vào: item (RadioPlaylistItem), index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi play từ UI hoặc auto-next
   */
  const playTrack = useCallback(
    async (item: RadioPlaylistItem, index: number) => {
      try {
        // T-22: Cancel request trước đó nếu đang chạy
        if (abortRef.current) {
          abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        setCurrentTrackIndex(index);
        setGeneratingAudio(true);
        setPlaybackState('loading');

        // T-29: Fade out track cũ (nếu có)
        try {
          const state = await TrackPlayer.getPlaybackState();
          if (state.state === State.Playing) {
            await fadeVolume(1, 0, 400); // Fade out nhanh
          }
        } catch { /* Không có track cũ */ }

        let audioUrl: string;

        // T-04: Check audio đã cache chưa
        if (item.audioUrl) {
          console.log(`🎵 [RadioPlayer] Dùng audio đã cache: ${item.topic}`);
          audioUrl = item.audioUrl;
        } else {
          console.log(`🎵 [RadioPlayer] Sinh audio mới: ${item.topic}`);

          const audioResult = await listeningApi.generateConversationAudio(
            item.conversation.map(c => ({speaker: c.speaker, text: c.text})),
            {
              provider: 'azure',
              randomVoice,
              ...(Object.keys(voicePerSpeaker).length > 0 && {voicePerSpeaker}),
              multiTalker,
              multiTalkerPairIndex,
              emotion: ttsEmotion,
              pitch: ttsPitch,
              rate: ttsRate,
              volume: ttsVolume,
              randomEmotion,
            },
            abortRef.current?.signal, // T-22: Cancel khi skip nhanh
          );
          audioUrl = audioResult.audioUrl;

          // T-03: Cache audio URL
          const playlist = useRadioStore.getState().currentPlaylist;
          if (playlist?.playlist?.id) {
            radioApi
              .updateTrackAudio(playlist.playlist.id, item.id, audioUrl)
              .then(() => console.log('💾 [RadioPlayer] Đã cache audio'))
              .catch(err => console.warn('⚠️ Cache lỗi:', err?.message));
          }
        }

        // T-16: Dùng TrackPlayer queue thay vì reset
        await setupPlayer();
        const queue = await TrackPlayer.getQueue();
        if (queue.length > 0) {
          // Xóa tracks cũ trước track mới để giữ queue sạch
          await TrackPlayer.removeUpcomingTracks();
        }
        await addTrack(audioUrl, item.topic);

        // Áp dụng playback speed + volume 0 trước khi play
        await TrackPlayer.setRate(playbackSpeed);
        await TrackPlayer.setVolume(0);
        await TrackPlayer.play();

        // T-29: Fade in
        await fadeVolume(0, 1);

        setGeneratingAudio(false);
        setPlaybackState('playing');
        setGlobalPlaying(true);
        setPlayerMode('full');

        // Cập nhật streak
        checkAndUpdateStreak();

        console.log(`✅ [RadioPlayer] Đang phát track ${index + 1}`);
      } catch (error: any) {
        // T-22: Ignore abortion errors
        if (error?.name === 'AbortError') return;
        console.error('❌ [RadioPlayer] Lỗi phát:', error);
        setGeneratingAudio(false);
        setPlaybackState('idle');
      }
    },
    [
      setCurrentTrackIndex, setGeneratingAudio, setPlaybackState,
      setGlobalPlaying, setPlayerMode, playbackSpeed, checkAndUpdateStreak,
      randomVoice, voicePerSpeaker, multiTalker, multiTalkerPairIndex,
      ttsEmotion, ttsPitch, ttsRate, ttsVolume, randomEmotion,
    ],
  );

  /**
   * Mục đích: Skip sang track tiếp theo
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút skip, hoặc track kết thúc tự động
   */
  const skip = useCallback(async () => {
    const nextIdx = nextTrack();
    const playlist = useRadioStore.getState().currentPlaylist;
    if (nextIdx >= 0 && playlist) {
      console.log(`⏭️ [RadioPlayer] Skip → track ${nextIdx + 1}`);
      await playTrack(playlist.items[nextIdx], nextIdx);
    } else {
      console.log('📻 [RadioPlayer] Hết playlist');
      setPlaybackState('ended');
      setGlobalPlaying(false);
    }
  }, [nextTrack, playTrack, setPlaybackState, setGlobalPlaying]);

  /**
   * Mục đích: Quay lại track trước
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút previous
   */
  const previous = useCallback(async () => {
    const prevIdx = previousTrack();
    const playlist = useRadioStore.getState().currentPlaylist;
    if (playlist && prevIdx >= 0) {
      console.log(`⏮️ [RadioPlayer] Previous → track ${prevIdx + 1}`);
      await playTrack(playlist.items[prevIdx], prevIdx);
    }
  }, [previousTrack, playTrack]);

  /**
   * Mục đích: Toggle play/pause
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút play/pause
   */
  const togglePlay = useCallback(async () => {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
      setPlaybackState('paused');
      setGlobalPlaying(false);
    } else {
      await TrackPlayer.play();
      setPlaybackState('playing');
      setGlobalPlaying(true);
    }
  }, [setPlaybackState, setGlobalPlaying]);

  /**
   * Mục đích: Set tốc độ phát
   * Tham số đầu vào: rate (number, 0.5 - 2.0)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User thay đổi playback speed
   */
  const setSpeed = useCallback(async (rate: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    await TrackPlayer.setRate(clamped);
    useRadioStore.getState().setPlaybackSpeed(clamped);
  }, []);

  // T-11: Pre-fetch audio cho track N+1
  const prefetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentPlaylist || currentTrackIndex < 0) {return;}
    const nextIdx = currentTrackIndex + 1;
    if (nextIdx >= currentPlaylist.items.length) {return;}

    const nextItem = currentPlaylist.items[nextIdx];
    // Chỉ pre-fetch nếu chưa có audioUrl và chưa fetch
    if (nextItem.audioUrl || prefetchRef.current === nextItem.id) {return;}

    prefetchRef.current = nextItem.id;
    console.log(`🔮 [RadioPlayer] Pre-fetching audio track ${nextIdx + 1}...`);

    listeningApi
      .generateConversationAudio(
        nextItem.conversation.map(c => ({speaker: c.speaker, text: c.text})),
        {
          provider: 'azure',
          randomVoice,
          ...(Object.keys(voicePerSpeaker).length > 0 && {voicePerSpeaker}),
          multiTalker,
          multiTalkerPairIndex,
          emotion: ttsEmotion,
          pitch: ttsPitch,
          rate: ttsRate,
          volume: ttsVolume,
          randomEmotion,
        },
      )
      .then(result => {
        console.log(`✅ [RadioPlayer] Pre-fetch xong track ${nextIdx + 1}`);
        // Cập nhật audioUrl trong store
        const playlist = useRadioStore.getState().currentPlaylist;
        if (playlist) {
          const items = [...playlist.items];
          items[nextIdx] = {...items[nextIdx], audioUrl: result.audioUrl};
          useRadioStore.getState().setCurrentPlaylist({...playlist, items});
        }
        // Cache vào DB
        if (currentPlaylist.playlist?.id) {
          radioApi
            .updateTrackAudio(currentPlaylist.playlist.id, nextItem.id, result.audioUrl)
            .catch(() => {});
        }
      })
      .catch(err => {
        console.warn('⚠️ Pre-fetch lỗi:', err?.message);
        prefetchRef.current = null; // Reset để thử lại
      });
    // S-04 fix: Include TTS settings so voice changes trigger re-fetch
  }, [currentPlaylist, currentTrackIndex, randomVoice, voicePerSpeaker,
      multiTalker, multiTalkerPairIndex, ttsEmotion, ttsPitch, ttsRate, ttsVolume, randomEmotion]);

  // Sleep timer effect
  useEffect(() => {
    if (sleepTimerEndAt <= 0) {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      return;
    }

    sleepTimerRef.current = setInterval(async () => {
      if (Date.now() >= sleepTimerEndAt) {
        console.log('😴 [RadioPlayer] Sleep timer kết thúc — dừng phát');
        await TrackPlayer.pause();
        setPlaybackState('paused');
        setGlobalPlaying(false);
        useRadioStore.getState().clearSleepTimer();
        if (sleepTimerRef.current) {
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
        }
      }
    }, 5000); // Check mỗi 5 giây

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [sleepTimerEndAt, setPlaybackState, setGlobalPlaying]);

  // Listened time tracking — mỗi 10 giây tăng counter
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useRadioStore.getState();
      if (state.playbackState === 'playing') {
        addListenedTime(10);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [addListenedTime]);

  return {
    // State
    currentPlaylist,
    currentTrackIndex,
    playbackState,
    isGeneratingAudio,
    playbackSpeed,
    currentTrack: currentPlaylist?.items[currentTrackIndex] ?? null,

    // Actions
    playTrack,
    skip,
    previous,
    togglePlay,
    setSpeed,
  };
}

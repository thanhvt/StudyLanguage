import {useCallback, useRef, useEffect, useState} from 'react';
import TrackPlayer, {
  Event,
  State,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import {setupPlayer} from '@/services/audio/trackPlayer';
import {useShadowingStore} from '@/store/useShadowingStore';
import type {ShadowingSpeed} from '@/store/useShadowingStore';

// =======================
// Hook
// =======================

/**
 * Mục đích: Custom hook wrap TrackPlayer cho Shadowing Mode
 *   Phát audio AI mẫu với speed control + sync progress
 * Tham số đầu vào: không có
 * Tham số đầu ra: { playAI, pauseAI, stopAI, isPlaying, progress, duration }
 * Khi nào sử dụng:
 *   - ShadowingSessionScreen: Phase 1 (Preview) → gọi playAI(audioUrl, speed)
 *   - ShadowingSessionScreen: Phase 2 (Shadow) → playAI + kích hoạt recorder
 *   - ShadowingFeedbackScreen: segment playback "Nghe AI"
 */
export function useShadowingTrackPlayer() {
  const isPlayerReady = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Đọc config speed từ store
  const speed = useShadowingStore(s => s.config.speed);
  const setAIPlaying = useShadowingStore(s => s.setAIPlaying);

  // Setup TrackPlayer khi mount
  useEffect(() => {
    /**
     * Mục đích: Khởi tạo TrackPlayer
     * Tham số đầu vào: không
     * Tham số đầu ra: void
     * Khi nào sử dụng: Hook mount lần đầu
     */
    const init = async () => {
      const success = await setupPlayer();
      isPlayerReady.current = success;
      if (success) {
        console.log('🔊 [ShadowingTrack] TrackPlayer sẵn sàng cho Shadowing');
      }
    };
    init();

    return () => {
      // Cleanup
      stopProgressTracking();
      TrackPlayer.reset().catch(() => {});
      isPlayingRef.current = false;
      setIsPlaying(false);
      console.log('🔊 [ShadowingTrack] Đã cleanup TrackPlayer');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mục đích: Bắt đầu tracking progress (position/duration)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Sau playAI thành công
   */
  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(async () => {
      try {
        const pos = await TrackPlayer.getPosition();
        const dur = await TrackPlayer.getDuration();
        setProgress(pos);
        setDuration(dur);
      } catch {
        // Player chưa sẵn sàng
      }
    }, 200); // Cập nhật mỗi 200ms
  }, []);

  /**
   * Mục đích: Dừng tracking progress
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi dừng phát hoặc unmount
   */
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Lắng nghe playback events
  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackError, Event.PlaybackQueueEnded],
    async event => {
      if (event.type === Event.PlaybackError) {
        console.error('❌ [ShadowingTrack] Lỗi playback:', event);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setAIPlaying(false);
        stopProgressTracking();
      }
      if (event.type === Event.PlaybackState) {
        const state = await TrackPlayer.getPlaybackState();
        const playing = state.state === State.Playing;
        isPlayingRef.current = playing;
        setIsPlaying(playing);
        setAIPlaying(playing);
      }
      if (event.type === Event.PlaybackQueueEnded) {
        console.log('🔊 [ShadowingTrack] AI audio kết thúc');
        isPlayingRef.current = false;
        setIsPlaying(false);
        setAIPlaying(false);
        stopProgressTracking();
      }
    },
  );

  /**
   * Mục đích: Phát audio AI mẫu qua TrackPlayer với tốc độ cho trước
   * Tham số đầu vào: audioUrl (string), playbackSpeed (ShadowingSpeed, optional)
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng:
   *   - Phase 1 (Preview): playAI(audioUrl) → nghe mẫu
   *   - Phase 2 (Shadow): playAI(audioUrl) → phát đồng thời với recording
   */
  const playAI = useCallback(
    async (audioUrl: string, playbackSpeed?: ShadowingSpeed) => {
      if (!isPlayerReady.current) {
        console.warn('⚠️ [ShadowingTrack] TrackPlayer chưa sẵn sàng');
        return;
      }

      try {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: `shadowing-${Date.now()}`,
          url: audioUrl,
          title: 'Shadowing — Câu mẫu',
          artist: 'AI Teacher',
        });

        // Set speed
        const targetSpeed = playbackSpeed ?? speed;
        await TrackPlayer.setRate(targetSpeed);
        console.log(`🔊 [ShadowingTrack] Đặt tốc độ: ${targetSpeed}x`);

        await TrackPlayer.play();
        isPlayingRef.current = true;
        setIsPlaying(true);
        setAIPlaying(true);
        startProgressTracking();
        console.log('▶️ [ShadowingTrack] Đang phát audio AI');
      } catch (err) {
        console.error('❌ [ShadowingTrack] Lỗi phát audio:', err);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setAIPlaying(false);
      }
    },
    [speed, setAIPlaying, startProgressTracking],
  );

  /**
   * Mục đích: Tạm dừng audio AI
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn Pause trong Preview/Shadow phase
   */
  const pauseAI = useCallback(async () => {
    try {
      await TrackPlayer.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
      setAIPlaying(false);
      stopProgressTracking();
      console.log('⏸️ [ShadowingTrack] Đã tạm dừng');
    } catch (err) {
      console.error('❌ [ShadowingTrack] Lỗi pause:', err);
    }
  }, [setAIPlaying, stopProgressTracking]);

  /**
   * Mục đích: Dừng hoàn toàn audio AI
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Phase kết thúc hoặc user rời screen
   */
  const stopAI = useCallback(async () => {
    try {
      await TrackPlayer.reset();
      isPlayingRef.current = false;
      setIsPlaying(false);
      setAIPlaying(false);
      stopProgressTracking();
      setProgress(0);
      setDuration(0);
      console.log('⏹️ [ShadowingTrack] Đã dừng và reset');
    } catch (err) {
      console.error('❌ [ShadowingTrack] Lỗi stop:', err);
    }
  }, [setAIPlaying, stopProgressTracking]);

  return {
    playAI,
    pauseAI,
    stopAI,
    isPlaying,
    progress,
    duration,
  };
}

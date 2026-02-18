import {useCallback, useRef, useEffect} from 'react';
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
  State,
} from 'react-native-track-player';
import {setupPlayer} from '@/services/audio/trackPlayer';
import {useSpeakingStore} from '@/store/useSpeakingStore';

/**
 * Mục đích: Custom hook wrap TrackPlayer cho Coach mode — hỗ trợ phát audio AI ở background
 *           + hiển thị notification controls (Play/Pause/Stop)
 * Tham số đầu vào: không có
 * Tham số đầu ra: { playCoachAudio, pauseCoach, resumeCoach, stopCoach, isPlaying }
 * Khi nào sử dụng:
 *   - CoachSessionScreen: AI trả lời → gọi playCoachAudio(audioUrl) → phát qua TrackPlayer
 *   - User minimize app → audio vẫn chạy + notification controls
 *   - Session end → cleanup TrackPlayer
 */
export function useCoachTrackPlayer() {
  const isPlayerReady = useRef(false);
  const isPlayingRef = useRef(false);
  const {coachSession} = useSpeakingStore();

  // Setup TrackPlayer khi mount
  useEffect(() => {
    const init = async () => {
      const success = await setupPlayer();
      isPlayerReady.current = success;
      if (success) {
        console.log('🎵 [CoachTrackPlayer] TrackPlayer sẵn sàng cho Coach mode');
      }
    };
    init();

    // Cleanup khi unmount
    return () => {
      TrackPlayer.reset().catch(() => {});
      isPlayingRef.current = false;
      console.log('🎵 [CoachTrackPlayer] Đã cleanup TrackPlayer');
    };
  }, []);

  // Lắng nghe playback events
  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackError],
    async event => {
      if (event.type === Event.PlaybackError) {
        console.error('❌ [CoachTrackPlayer] Lỗi playback:', event);
        isPlayingRef.current = false;
      }
      if (event.type === Event.PlaybackState) {
        const state = await TrackPlayer.getPlaybackState();
        isPlayingRef.current = state.state === State.Playing;
      }
    },
  );

  /**
   * Mục đích: Phát audio AI Coach qua TrackPlayer (hỗ trợ background + notification)
   * Tham số đầu vào: audioUrl (string) — URL hoặc base64 data URI
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Sau khi AI Coach trả lời → TTS audio → phát qua hook này
   */
  const playCoachAudio = useCallback(async (audioUrl: string) => {
    if (!isPlayerReady.current) {
      console.warn('⚠️ [CoachTrackPlayer] TrackPlayer chưa sẵn sàng');
      return;
    }

    try {
      // Reset queue và thêm track mới
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `coach-${Date.now()}`,
        url: audioUrl,
        title: `AI Coach — ${coachSession?.setup.topic || 'Session'}`,
        artist: 'AI Teacher',
      });
      await TrackPlayer.play();
      isPlayingRef.current = true;
      console.log('▶️ [CoachTrackPlayer] Đang phát audio Coach');
    } catch (err) {
      console.error('❌ [CoachTrackPlayer] Lỗi phát audio:', err);
      isPlayingRef.current = false;
    }
  }, [coachSession?.setup.topic]);

  /**
   * Mục đích: Tạm dừng audio Coach
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn Pause trên notification hoặc trong app
   */
  const pauseCoach = useCallback(async () => {
    try {
      await TrackPlayer.pause();
      isPlayingRef.current = false;
      console.log('⏸️ [CoachTrackPlayer] Đã tạm dừng');
    } catch (err) {
      console.error('❌ [CoachTrackPlayer] Lỗi pause:', err);
    }
  }, []);

  /**
   * Mục đích: Tiếp tục phát audio Coach
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn Play trên notification hoặc trong app
   */
  const resumeCoach = useCallback(async () => {
    try {
      await TrackPlayer.play();
      isPlayingRef.current = true;
      console.log('▶️ [CoachTrackPlayer] Đã tiếp tục phát');
    } catch (err) {
      console.error('❌ [CoachTrackPlayer] Lỗi resume:', err);
    }
  }, []);

  /**
   * Mục đích: Dừng hoàn toàn audio Coach và reset queue
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Session kết thúc hoặc user rời màn hình
   */
  const stopCoach = useCallback(async () => {
    try {
      await TrackPlayer.reset();
      isPlayingRef.current = false;
      console.log('⏹️ [CoachTrackPlayer] Đã dừng và reset');
    } catch (err) {
      console.error('❌ [CoachTrackPlayer] Lỗi stop:', err);
    }
  }, []);

  return {
    playCoachAudio,
    pauseCoach,
    resumeCoach,
    stopCoach,
    isPlaying: isPlayingRef.current,
  };
}

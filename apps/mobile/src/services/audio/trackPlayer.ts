import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
} from 'react-native-track-player';

let isSetup = false;

/**
 * Mục đích: Khởi tạo và cấu hình Track Player cho audio playback
 * Tham số đầu vào: không có
 * Tham số đầu ra: Promise<boolean> - true nếu setup thành công
 * Khi nào sử dụng: Gọi 1 lần khi app khởi động hoặc trước khi phát audio
 *   - App.tsx hoặc ListeningPlayerScreen gọi khi cần phát audio
 *   - Chỉ setup 1 lần, các lần gọi sau sẽ skip
 */
export async function setupPlayer(): Promise<boolean> {
  if (isSetup) {
    console.log('🎵 [TrackPlayer] Đã setup rồi, bỏ qua');
    return true;
  }

  try {
    await TrackPlayer.setupPlayer({
      // Giữ cho audio tiếp tục phát khi app ở background
      autoHandleInterruptions: true,
    });

    // Cấu hình các capability hiển thị trên notification/lock screen
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      progressUpdateEventInterval: 1,
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Off);

    isSetup = true;
    console.log('✅ [TrackPlayer] Setup thành công');
    return true;
  } catch (error) {
    console.error('❌ [TrackPlayer] Lỗi setup:', error);
    return false;
  }
}

/**
 * Mục đích: Thêm track audio vào hàng đợi phát
 * Tham số đầu vào: url (string - URL audio), title (string), artist (string)
 * Tham số đầu ra: Promise<void>
 * Khi nào sử dụng: Khi PlayerScreen nhận được audio URL từ TTS API
 */
export async function addTrack(
  url: string,
  title: string,
  artist: string = 'AI Teacher',
): Promise<void> {
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: `track-${Date.now()}`,
    url,
    title,
    artist,
  });
  console.log('🎵 [TrackPlayer] Đã thêm track:', title);
}

/**
 * Mục đích: Playback service xử lý remote events (notification controls)
 * Tham số đầu vào: không có
 * Tham số đầu ra: void
 * Khi nào sử dụng: Được đăng ký ở index.js để xử lý notification playback controls
 */
export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('⏸️ [TrackPlayer] Remote pause');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('▶️ [TrackPlayer] Remote play');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('⏭️ [TrackPlayer] Remote next');
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('⏮️ [TrackPlayer] Remote previous');
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, event => {
    console.log('⏩ [TrackPlayer] Remote seek:', event.position);
    TrackPlayer.seekTo(event.position);
  });
}

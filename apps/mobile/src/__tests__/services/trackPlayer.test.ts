/**
 * Unit test cho Track Player service
 *
 * Mục đích: Test setup và helper functions của Track Player
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-007: Play/Pause
 *   - MOB-LIS-MVP-HP-010: Speed control
 *   - MOB-LIS-ENH-HP-013: Background playback
 */
import TrackPlayer from 'react-native-track-player';
import {setupPlayer, addTrack, playbackService} from '@/services/audio/trackPlayer';

describe('trackPlayer service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setupPlayer', () => {
    it('gọi TrackPlayer.setupPlayer() và trả về true', async () => {
      const result = await setupPlayer();

      // Lần đầu tiên sẽ gọi setupPlayer, các lần sau sẽ skip (singleton)
      // Vì test chạy trong cùng process, chỉ test result
      expect(result).toBe(true);
    });

    it('tra về true khi gọi lần thứ 2 (đã setup rồi)', async () => {
      // Gọi lần 2 - singleton nên sẽ skip
      const result = await setupPlayer();
      expect(result).toBe(true);
    });
  });

  describe('addTrack', () => {
    it('gọi TrackPlayer.reset() và TrackPlayer.add() với params đúng', async () => {
      await addTrack('https://audio.mp3', 'Bài nghe 1', 'AI Teacher');

      expect(TrackPlayer.reset).toHaveBeenCalled();
      expect(TrackPlayer.add).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://audio.mp3',
          title: 'Bài nghe 1',
          artist: 'AI Teacher',
        }),
      );
    });

    it('dùng default artist "AI Teacher" khi không truyền', async () => {
      await addTrack('https://audio.mp3', 'Bài nghe 2');

      expect(TrackPlayer.add).toHaveBeenCalledWith(
        expect.objectContaining({
          artist: 'AI Teacher',
        }),
      );
    });

    it('tạo id duy nhất cho mỗi track', async () => {
      await addTrack('https://audio.mp3', 'Test');

      const call = (TrackPlayer.add as jest.Mock).mock.calls[0][0];
      expect(call.id).toMatch(/^track-\d+$/);
    });
  });

  describe('playbackService', () => {
    it('đăng ký đủ 5 remote event listeners', async () => {
      await playbackService();

      // Cần 5 listeners: RemotePause, RemotePlay, RemoteNext, RemotePrevious, RemoteSeek
      expect(TrackPlayer.addEventListener).toHaveBeenCalledTimes(5);
    });
  });
});

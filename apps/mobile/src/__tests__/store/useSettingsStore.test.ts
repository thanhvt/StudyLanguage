/**
 * Unit test cho useSettingsStore (Zustand + MMKV persistence)
 *
 * Mục đích: Test toàn bộ audio settings và privacy settings actions
 * Ref test cases:
 *   - MOB-PROF-ENH-HP-011: Background Music bật/tắt + volume
 *   - MOB-PROF-ENH-HP-012: Music ducking
 *   - MOB-PROF-ENH-HP-013: Default playback speed
 *   - MOB-PROF-ENH-HP-014: Sound effects toggle
 *   - MOB-PROF-ENH-HP-015: Auto-play
 *   - MOB-PROF-ENH-HP-016: Hands-free mode
 *   - MOB-PROF-ENH-HP-021: Save recordings
 *   - MOB-PROF-ENH-HP-022: Auto-delete recordings (30/60/90 ngày)
 *   - MOB-PROF-ENH-HP-023: Data sync
 */

// Mock MMKV trước khi import store
jest.mock('react-native-mmkv', () => {
  const storage = new Map<string, string>();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: string) => storage.set(key, value),
      getString: (key: string) => storage.get(key) ?? null,
      delete: (key: string) => storage.delete(key),
    })),
  };
});

import {useSettingsStore} from '@/store/useSettingsStore';

describe('useSettingsStore', () => {
  // Reset store trước mỗi test để đảm bảo độc lập
  beforeEach(() => {
    useSettingsStore.setState({
      audio: {
        backgroundMusic: {enabled: true, volume: 50},
        musicDucking: true,
        soundEffects: true,
        playbackSpeed: 1.0,
        autoPlay: true,
        handsFree: false,
      },
      privacy: {
        saveRecordings: true,
        autoDeleteDays: 60,
        dataSync: true,
      },
    });
  });

  // ============================================================
  // Giá trị mặc định
  // ============================================================
  describe('Giá trị mặc định', () => {
    it('audio settings có giá trị mặc định đúng', () => {
      const {audio} = useSettingsStore.getState();
      expect(audio.backgroundMusic.enabled).toBe(true);
      expect(audio.backgroundMusic.volume).toBe(50);
      expect(audio.musicDucking).toBe(true);
      expect(audio.soundEffects).toBe(true);
      expect(audio.playbackSpeed).toBe(1.0);
      expect(audio.autoPlay).toBe(true);
      expect(audio.handsFree).toBe(false);
    });

    it('privacy settings có giá trị mặc định đúng', () => {
      const {privacy} = useSettingsStore.getState();
      expect(privacy.saveRecordings).toBe(true);
      expect(privacy.autoDeleteDays).toBe(60);
      expect(privacy.dataSync).toBe(true);
    });

    it('audio và privacy là 2 object riêng biệt', () => {
      const state = useSettingsStore.getState();
      expect(state.audio).toBeDefined();
      expect(state.privacy).toBeDefined();
      expect(state.audio).not.toBe(state.privacy);
    });
  });

  // ============================================================
  // Audio: Background Music — MOB-PROF-ENH-HP-011
  // ============================================================
  describe('setBackgroundMusic', () => {
    // MOB-PROF-ENH-HP-011: Bật Background Music
    it('bật background music', () => {
      useSettingsStore
        .getState()
        .setBackgroundMusic(false); // tắt trước
      useSettingsStore.getState().setBackgroundMusic(true);

      expect(
        useSettingsStore.getState().audio.backgroundMusic.enabled,
      ).toBe(true);
    });

    it('tắt background music', () => {
      useSettingsStore.getState().setBackgroundMusic(false);

      expect(
        useSettingsStore.getState().audio.backgroundMusic.enabled,
      ).toBe(false);
    });

    it('không ảnh hưởng volume khi toggle enabled', () => {
      useSettingsStore.getState().setMusicVolume(75);
      useSettingsStore.getState().setBackgroundMusic(false);

      // Volume vẫn giữ nguyên dù đã tắt
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(75);
    });
  });

  // ============================================================
  // Audio: Volume — MOB-PROF-ENH-HP-011
  // ============================================================
  describe('setMusicVolume', () => {
    it('set volume = 0 (mute)', () => {
      useSettingsStore.getState().setMusicVolume(0);

      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(0);
    });

    it('set volume = 100 (max)', () => {
      useSettingsStore.getState().setMusicVolume(100);

      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(
        100,
      );
    });

    it('set volume = 35 (giá trị trung gian)', () => {
      useSettingsStore.getState().setMusicVolume(35);

      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(35);
    });

    it('không ảnh hưởng enabled khi thay đổi volume', () => {
      useSettingsStore.getState().setBackgroundMusic(false);
      useSettingsStore.getState().setMusicVolume(80);

      // enabled vẫn false
      expect(
        useSettingsStore.getState().audio.backgroundMusic.enabled,
      ).toBe(false);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(80);
    });
  });

  // ============================================================
  // Audio: Music Ducking — MOB-PROF-ENH-HP-012
  // ============================================================
  describe('setMusicDucking', () => {
    // MOB-PROF-ENH-HP-012: Smart Ducking bật/tắt
    it('tắt music ducking', () => {
      useSettingsStore.getState().setMusicDucking(false);

      expect(useSettingsStore.getState().audio.musicDucking).toBe(false);
    });

    it('bật music ducking', () => {
      useSettingsStore.getState().setMusicDucking(false);
      useSettingsStore.getState().setMusicDucking(true);

      expect(useSettingsStore.getState().audio.musicDucking).toBe(true);
    });
  });

  // ============================================================
  // Audio: Sound Effects — MOB-PROF-ENH-HP-014
  // ============================================================
  describe('setSoundEffects', () => {
    // MOB-PROF-ENH-HP-014: Tắt Sound Effects → không còn tiếng success/error
    it('tắt sound effects', () => {
      useSettingsStore.getState().setSoundEffects(false);

      expect(useSettingsStore.getState().audio.soundEffects).toBe(false);
    });

    it('bật sound effects', () => {
      useSettingsStore.getState().setSoundEffects(false);
      useSettingsStore.getState().setSoundEffects(true);

      expect(useSettingsStore.getState().audio.soundEffects).toBe(true);
    });
  });

  // ============================================================
  // Audio: Playback Speed — MOB-PROF-ENH-HP-013
  // ============================================================
  describe('setPlaybackSpeed', () => {
    // MOB-PROF-ENH-HP-013: Set speed mặc định
    it('set speed = 0.5x (chậm nhất)', () => {
      useSettingsStore.getState().setPlaybackSpeed(0.5);

      expect(useSettingsStore.getState().audio.playbackSpeed).toBe(0.5);
    });

    it('set speed = 1.0x (bình thường)', () => {
      useSettingsStore.getState().setPlaybackSpeed(1.0);

      expect(useSettingsStore.getState().audio.playbackSpeed).toBe(1.0);
    });

    it('set speed = 2.0x (nhanh nhất)', () => {
      useSettingsStore.getState().setPlaybackSpeed(2.0);

      expect(useSettingsStore.getState().audio.playbackSpeed).toBe(2.0);
    });

    it('set speed = 1.2x (giá trị phổ biến)', () => {
      useSettingsStore.getState().setPlaybackSpeed(1.2);

      expect(useSettingsStore.getState().audio.playbackSpeed).toBeCloseTo(1.2);
    });
  });

  // ============================================================
  // Audio: Auto-play — MOB-PROF-ENH-HP-015
  // ============================================================
  describe('setAutoPlay', () => {
    // MOB-PROF-ENH-HP-015: Bật auto-play → phát câu tiếp theo
    it('tắt auto-play', () => {
      useSettingsStore.getState().setAutoPlay(false);

      expect(useSettingsStore.getState().audio.autoPlay).toBe(false);
    });

    it('bật auto-play', () => {
      useSettingsStore.getState().setAutoPlay(false);
      useSettingsStore.getState().setAutoPlay(true);

      expect(useSettingsStore.getState().audio.autoPlay).toBe(true);
    });
  });

  // ============================================================
  // Audio: Hands-free — MOB-PROF-ENH-HP-016
  // ============================================================
  describe('setHandsFree', () => {
    // MOB-PROF-ENH-HP-016: Bật Hands-free → lesson tự chạy
    it('bật hands-free', () => {
      useSettingsStore.getState().setHandsFree(true);

      expect(useSettingsStore.getState().audio.handsFree).toBe(true);
    });

    it('tắt hands-free', () => {
      useSettingsStore.getState().setHandsFree(true);
      useSettingsStore.getState().setHandsFree(false);

      expect(useSettingsStore.getState().audio.handsFree).toBe(false);
    });
  });

  // ============================================================
  // Privacy: Save Recordings — MOB-PROF-ENH-HP-021
  // ============================================================
  describe('setSaveRecordings', () => {
    // MOB-PROF-ENH-HP-021: Bật Save Recordings → lưu bản ghi âm
    it('tắt save recordings', () => {
      useSettingsStore.getState().setSaveRecordings(false);

      expect(useSettingsStore.getState().privacy.saveRecordings).toBe(false);
    });

    it('bật save recordings', () => {
      useSettingsStore.getState().setSaveRecordings(false);
      useSettingsStore.getState().setSaveRecordings(true);

      expect(useSettingsStore.getState().privacy.saveRecordings).toBe(true);
    });
  });

  // ============================================================
  // Privacy: Auto-delete — MOB-PROF-ENH-HP-022
  // ============================================================
  describe('setAutoDeleteDays', () => {
    // MOB-PROF-ENH-HP-022: Set auto-delete recordings
    it('set 30 ngày', () => {
      useSettingsStore.getState().setAutoDeleteDays(30);

      expect(useSettingsStore.getState().privacy.autoDeleteDays).toBe(30);
    });

    it('set 60 ngày (mặc định)', () => {
      useSettingsStore.getState().setAutoDeleteDays(30);
      useSettingsStore.getState().setAutoDeleteDays(60);

      expect(useSettingsStore.getState().privacy.autoDeleteDays).toBe(60);
    });

    it('set 90 ngày', () => {
      useSettingsStore.getState().setAutoDeleteDays(90);

      expect(useSettingsStore.getState().privacy.autoDeleteDays).toBe(90);
    });
  });

  // ============================================================
  // Privacy: Data Sync — MOB-PROF-ENH-HP-023
  // ============================================================
  describe('setDataSync', () => {
    it('tắt data sync', () => {
      useSettingsStore.getState().setDataSync(false);

      expect(useSettingsStore.getState().privacy.dataSync).toBe(false);
    });

    it('bật data sync', () => {
      useSettingsStore.getState().setDataSync(false);
      useSettingsStore.getState().setDataSync(true);

      expect(useSettingsStore.getState().privacy.dataSync).toBe(true);
    });
  });

  // ============================================================
  // State Isolation: thay đổi audio không ảnh hưởng privacy
  // ============================================================
  describe('State Isolation', () => {
    it('thay đổi audio không ảnh hưởng privacy', () => {
      // Ghi nhớ privacy ban đầu
      const privacyBefore = {...useSettingsStore.getState().privacy};

      // Thay đổi tất cả audio settings
      useSettingsStore.getState().setBackgroundMusic(false);
      useSettingsStore.getState().setMusicVolume(0);
      useSettingsStore.getState().setMusicDucking(false);
      useSettingsStore.getState().setSoundEffects(false);
      useSettingsStore.getState().setPlaybackSpeed(2.0);
      useSettingsStore.getState().setAutoPlay(false);
      useSettingsStore.getState().setHandsFree(true);

      // Privacy vẫn giữ nguyên
      const privacyAfter = useSettingsStore.getState().privacy;
      expect(privacyAfter).toEqual(privacyBefore);
    });

    it('thay đổi privacy không ảnh hưởng audio', () => {
      // Ghi nhớ audio ban đầu
      const audioBefore = {...useSettingsStore.getState().audio};
      audioBefore.backgroundMusic = {
        ...useSettingsStore.getState().audio.backgroundMusic,
      };

      // Thay đổi tất cả privacy settings
      useSettingsStore.getState().setSaveRecordings(false);
      useSettingsStore.getState().setAutoDeleteDays(30);
      useSettingsStore.getState().setDataSync(false);

      // Audio vẫn giữ nguyên
      const audioAfter = useSettingsStore.getState().audio;
      expect(audioAfter.backgroundMusic.enabled).toBe(
        audioBefore.backgroundMusic.enabled,
      );
      expect(audioAfter.backgroundMusic.volume).toBe(
        audioBefore.backgroundMusic.volume,
      );
      expect(audioAfter.musicDucking).toBe(audioBefore.musicDucking);
      expect(audioAfter.soundEffects).toBe(audioBefore.soundEffects);
      expect(audioAfter.playbackSpeed).toBe(audioBefore.playbackSpeed);
      expect(audioAfter.autoPlay).toBe(audioBefore.autoPlay);
      expect(audioAfter.handsFree).toBe(audioBefore.handsFree);
    });
  });
});

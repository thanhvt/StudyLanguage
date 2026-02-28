/**
 * Unit test cho useSettingsStore (Zustand + MMKV persistence)
 *
 * Mục đích: Test toàn bộ audio settings và privacy settings actions
 *           Đã cập nhật: Loại bỏ playbackSpeed, handsFree, autoDeleteDays
 * Ref test cases:
 *   - MOB-PROF-ENH-HP-011: Background Music bật/tắt + volume
 *   - MOB-PROF-ENH-HP-012: Music ducking
 *   - MOB-PROF-ENH-HP-014: Sound effects toggle
 *   - MOB-PROF-ENH-HP-015: Auto-play
 *   - MOB-PROF-ENH-HP-021: Save recordings
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
        autoPlay: true,
      },
      privacy: {
        saveRecordings: true,
        dataSync: true,
      },
    });
  });

  // ============================================================
  // Giá trị mặc định — đảm bảo khớp với spec 08_Profile_Settings.md
  // ============================================================
  describe('Giá trị mặc định', () => {
    it('audio settings có giá trị mặc định đúng theo spec', () => {
      const {audio} = useSettingsStore.getState();
      expect(audio.backgroundMusic.enabled).toBe(true);
      expect(audio.backgroundMusic.volume).toBe(50);
      expect(audio.musicDucking).toBe(true);
      expect(audio.soundEffects).toBe(true);
      expect(audio.autoPlay).toBe(true);
    });

    it('privacy settings có giá trị mặc định đúng theo spec', () => {
      const {privacy} = useSettingsStore.getState();
      expect(privacy.saveRecordings).toBe(true);
      expect(privacy.dataSync).toBe(true);
    });

    it('KHÔNG tồn tại playbackSpeed, handsFree, autoDeleteDays (đã loại bỏ)', () => {
      const {audio, privacy} = useSettingsStore.getState();
      // Các fields đã bị xoá theo updated spec
      expect((audio as any).playbackSpeed).toBeUndefined();
      expect((audio as any).handsFree).toBeUndefined();
      expect((privacy as any).autoDeleteDays).toBeUndefined();
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
  // Hi-fi screen: ps_audio — "Nhạc nền" section, toggle + slider 50%
  // ============================================================
  describe('setBackgroundMusic', () => {
    it('bật background music', () => {
      useSettingsStore.getState().setBackgroundMusic(false);
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
  // Audio: Volume — Hi-fi screen: ps_audio — slider 0-100
  // ============================================================
  describe('setMusicVolume', () => {
    it('set volume = 0 (mute)', () => {
      useSettingsStore.getState().setMusicVolume(0);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(0);
    });

    it('set volume = 100 (max)', () => {
      useSettingsStore.getState().setMusicVolume(100);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(100);
    });

    it('set volume = 35 (giá trị trung gian)', () => {
      useSettingsStore.getState().setMusicVolume(35);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(35);
    });

    it('clamp volume < 0 → 0', () => {
      useSettingsStore.getState().setMusicVolume(-10);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(0);
    });

    it('clamp volume > 100 → 100', () => {
      useSettingsStore.getState().setMusicVolume(200);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(100);
    });

    it('không ảnh hưởng enabled khi thay đổi volume', () => {
      useSettingsStore.getState().setBackgroundMusic(false);
      useSettingsStore.getState().setMusicVolume(80);

      expect(useSettingsStore.getState().audio.backgroundMusic.enabled).toBe(false);
      expect(useSettingsStore.getState().audio.backgroundMusic.volume).toBe(80);
    });
  });

  // ============================================================
  // Audio: Music Ducking — MOB-PROF-ENH-HP-012
  // Hi-fi screen: ps_audio — "Music Ducking" toggle
  // ============================================================
  describe('setMusicDucking', () => {
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
  // Hi-fi screen: ps_audio — "Hiệu ứng âm thanh" toggle
  // ============================================================
  describe('setSoundEffects', () => {
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
  // Audio: Auto-play — MOB-PROF-ENH-HP-015
  // Hi-fi screen: ps_audio — "Tự động phát" toggle
  // ============================================================
  describe('setAutoPlay', () => {
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
  // REMOVED: setPlaybackSpeed — đã loại bỏ theo spec mới
  // REMOVED: setHandsFree — đã loại bỏ theo spec mới
  // ============================================================
  describe('Deprecated actions KHÔNG tồn tại', () => {
    it('setPlaybackSpeed không tồn tại trong store', () => {
      expect((useSettingsStore.getState() as any).setPlaybackSpeed).toBeUndefined();
    });

    it('setHandsFree không tồn tại trong store', () => {
      expect((useSettingsStore.getState() as any).setHandsFree).toBeUndefined();
    });

    it('setAutoDeleteDays không tồn tại trong store', () => {
      expect((useSettingsStore.getState() as any).setAutoDeleteDays).toBeUndefined();
    });
  });

  // ============================================================
  // Privacy: Save Recordings — MOB-PROF-ENH-HP-021
  // Hi-fi screen: ps_privacy — "Lưu bản ghi âm" toggle
  // ============================================================
  describe('setSaveRecordings', () => {
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
  // Privacy: Data Sync — MOB-PROF-ENH-HP-023
  // Hi-fi screen: ps_privacy — "Đồng bộ dữ liệu" toggle
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
      const privacyBefore = {...useSettingsStore.getState().privacy};

      useSettingsStore.getState().setBackgroundMusic(false);
      useSettingsStore.getState().setMusicVolume(0);
      useSettingsStore.getState().setMusicDucking(false);
      useSettingsStore.getState().setSoundEffects(false);
      useSettingsStore.getState().setAutoPlay(false);

      const privacyAfter = useSettingsStore.getState().privacy;
      expect(privacyAfter).toEqual(privacyBefore);
    });

    it('thay đổi privacy không ảnh hưởng audio', () => {
      const audioBefore = {
        ...useSettingsStore.getState().audio,
        backgroundMusic: {...useSettingsStore.getState().audio.backgroundMusic},
      };

      useSettingsStore.getState().setSaveRecordings(false);
      useSettingsStore.getState().setDataSync(false);

      const audioAfter = useSettingsStore.getState().audio;
      expect(audioAfter.backgroundMusic.enabled).toBe(audioBefore.backgroundMusic.enabled);
      expect(audioAfter.backgroundMusic.volume).toBe(audioBefore.backgroundMusic.volume);
      expect(audioAfter.musicDucking).toBe(audioBefore.musicDucking);
      expect(audioAfter.soundEffects).toBe(audioBefore.soundEffects);
      expect(audioAfter.autoPlay).toBe(audioBefore.autoPlay);
    });
  });
});

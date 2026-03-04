import {useEffect, useCallback, useRef} from 'react';
import {useAuthStore} from '@/store/useAuthStore';
import {useAppStore, AccentColorId, Theme} from '@/store/useAppStore';
import {useSettingsStore} from '@/store/useSettingsStore';
import {settingsApi, SettingsPayload} from '@/services/api/settings';
import type {LanguageCode} from '@/config/i18n';

/**
 * Mục đích: Đồng bộ toàn bộ settings giữa local (MMKV) và server (API backend)
 * Tham số đầu vào: không có
 * Tham số đầu ra: { loadPreferences, savePreferences }
 * Khi nào sử dụng:
 *   - Gọi 1 lần trong MoreScreen (đã gọi sẵn)
 *   - Có thể gọi thêm trong RootNavigator nếu muốn sync sớm hơn
 *
 * Luồng:
 *   1. User đăng nhập → loadPreferences() → GET /user/settings → apply vào stores
 *   2. User thay đổi bất kỳ setting nào → debounce 1.5s → PUT /user/settings
 *   3. Nếu server chưa có data → push local settings lên server
 *   4. Nếu server có data → pull về merge vào local (server wins lúc login)
 */
export function usePreferencesSync() {
  // === App Store (theme, accent, language) ===
  const user = useAuthStore((state) => state.user);
  const theme = useAppStore((state) => state.theme);
  const accentColor = useAppStore((state) => state.accentColor);
  const language = useAppStore((state) => state.language);
  const setTheme = useAppStore((state) => state.setTheme);
  const setAccentColor = useAppStore((state) => state.setAccentColor);
  const setLanguage = useAppStore((state) => state.setLanguage);

  // === Settings Store (audio, privacy) ===
  const audio = useSettingsStore((state) => state.audio);
  const privacy = useSettingsStore((state) => state.privacy);
  const setBackgroundMusic = useSettingsStore((state) => state.setBackgroundMusic);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setMusicDucking = useSettingsStore((state) => state.setMusicDucking);
  const setSoundEffects = useSettingsStore((state) => state.setSoundEffects);
  const setAutoPlay = useSettingsStore((state) => state.setAutoPlay);
  const setSaveRecordings = useSettingsStore((state) => state.setSaveRecordings);
  const setDataSync = useSettingsStore((state) => state.setDataSync);

  /**
   * Mục đích: Gom toàn bộ settings hiện tại thành 1 payload để gửi lên server
   * Tham số đầu vào: không có
   * Tham số đầu ra: SettingsPayload
   * Khi nào sử dụng: Trước khi gọi settingsApi.updateSettings()
   */
  const buildPayload = useCallback((): SettingsPayload => {
    return {
      theme,
      accentColor,
      language,
      audio,
      privacy,
    };
  }, [theme, accentColor, language, audio, privacy]);

  /**
   * Mục đích: Áp dụng settings từ server vào local stores
   * Tham số đầu vào: settings - SettingsPayload từ server
   * Tham số đầu ra: void
   * Khi nào sử dụng: Sau khi GET /user/settings trả về data có nội dung
   */
  const applyServerSettings = useCallback(
    (settings: SettingsPayload) => {
      // Áp dụng theme nếu khác local
      if (settings.theme && settings.theme !== theme) {
        console.log('🎨 [SettingsSync] Sync theme từ server:', settings.theme);
        setTheme(settings.theme as Theme);
      }

      // Áp dụng accent color
      if (settings.accentColor && settings.accentColor !== accentColor) {
        console.log('🎨 [SettingsSync] Sync accent từ server:', settings.accentColor);
        setAccentColor(settings.accentColor as AccentColorId);
      }

      // Áp dụng language
      if (settings.language && settings.language !== language) {
        console.log('🌐 [SettingsSync] Sync language từ server:', settings.language);
        setLanguage(settings.language as LanguageCode);
      }

      // Áp dụng audio settings
      if (settings.audio) {
        const serverAudio = settings.audio;
        if (serverAudio.backgroundMusic) {
          setBackgroundMusic(serverAudio.backgroundMusic.enabled);
          setMusicVolume(serverAudio.backgroundMusic.volume);
        }
        setMusicDucking(serverAudio.musicDucking);
        setSoundEffects(serverAudio.soundEffects);
        setAutoPlay(serverAudio.autoPlay);
        console.log('🔊 [SettingsSync] Đã sync audio settings từ server');
      }

      // Áp dụng privacy settings
      if (settings.privacy) {
        setSaveRecordings(settings.privacy.saveRecordings);
        setDataSync(settings.privacy.dataSync);
        console.log('🔒 [SettingsSync] Đã sync privacy settings từ server');
      }
    },
    [
      theme, accentColor, language,
      setTheme, setAccentColor, setLanguage,
      setBackgroundMusic, setMusicVolume, setMusicDucking,
      setSoundEffects, setAutoPlay, setSaveRecordings, setDataSync,
    ],
  );

  /**
   * Mục đích: Tải settings từ server khi user đăng nhập
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tự động gọi khi user.id thay đổi (đăng nhập)
   */
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const response = await settingsApi.getSettings();

      // Server chưa có settings → push local settings lên
      if (
        !response.settings ||
        Object.keys(response.settings).length === 0
      ) {
        console.log('📝 [SettingsSync] Server chưa có settings → push local lên');
        const payload = buildPayload();
        await settingsApi.updateSettings(payload);
        return;
      }

      // Server có settings → áp dụng vào local (server wins lúc login)
      console.log('⬇️ [SettingsSync] Pull settings từ server...');
      applyServerSettings(response.settings as SettingsPayload);
    } catch (err) {
      console.error('❌ [SettingsSync] Lỗi load settings:', err);
    }
  }, [user, buildPayload, applyServerSettings]);

  /**
   * Mục đích: Lưu toàn bộ settings lên server khi thay đổi
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tự động gọi khi bất kỳ setting nào thay đổi (debounce 1.5s)
   */
  const savePreferences = useCallback(async () => {
    if (!user) return;

    try {
      const payload = buildPayload();
      await settingsApi.updateSettings(payload);
      console.log('✅ [SettingsSync] Đã đồng bộ settings lên server');
    } catch (err) {
      console.error('❌ [SettingsSync] Lỗi save settings:', err);
    }
  }, [user, buildPayload]);

  // === Effect: Load settings khi user đăng nhập ===
  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // === Effect: Save settings khi thay đổi (debounce 1.5s) ===
  // Dùng ref để skip lần mount đầu tiên, tránh save thừa
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!user) return;

    // Skip lần đầu tiên (mount) — chỉ save khi user thực sự thay đổi
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      savePreferences();
    }, 1500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, accentColor, language, audio, privacy, user?.id]);

  return {loadPreferences, savePreferences};
}

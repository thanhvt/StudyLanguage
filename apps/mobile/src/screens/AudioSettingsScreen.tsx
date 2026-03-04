import React from 'react';
import {ScrollView, View, Pressable, StyleSheet} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import Switch from '@/components/ui/Switch';
import Slider from '@/components/ui/Slider';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Mục đích: Màn hình cài đặt âm thanh — bám sát mockup ps_audio
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ MoreScreen → "Âm thanh"
 *
 * Hi-fi ref: ps_audio — Obsidian Glass style
 *   Card 1: Nhạc nền toggle + Volume slider + Music Ducking — title TRONG card
 *   Card 2: Phát lại — Hiệu ứng âm thanh + Tự động phát — title TRONG card
 *   Card 3: Giọng AI — link → ListeningConfig — title TRONG card
 *
 * Colors: surface #141414, glassBorder rgba, bg #000000
 */
export default function AudioSettingsScreen() {
  const audio = useSettingsStore(state => state.audio);
  const setBackgroundMusic = useSettingsStore(state => state.setBackgroundMusic);
  const setMusicVolume = useSettingsStore(state => state.setMusicVolume);
  const setMusicDucking = useSettingsStore(state => state.setMusicDucking);
  const setSoundEffects = useSettingsStore(state => state.setSoundEffects);
  const setAutoPlay = useSettingsStore(state => state.setAutoPlay);
  const colors = useColors();
  const navigation = useNavigation();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Nền gradient emerald — tạo depth */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {isDark ? (
          <LinearGradient
            colors={['#064E3B65', '#05201515', 'transparent', '#10b98130']}
            locations={[0, 0.3, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <LinearGradient
            colors={['#f0fdf410', 'transparent', '#ecfdf510']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* ========================================
         * Card 1: Nhạc nền — title TRONG card (ps_audio mockup)
         * ======================================== */}
        <View className="px-4 pt-4">
          <View
            className="rounded-[20px] p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            {/* Title — bold, trong card */}
            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-4"
              raw>
              Nhạc nền
            </AppText>

            {/* Toggle nhạc nền */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <AppText
                  variant="body"
                  style={{color: colors.foreground}}
                  className="font-sans-semibold"
                  raw>
                  Nhạc nền
                </AppText>
                <AppText
                  variant="caption"
                  style={{color: colors.neutrals400}}
                  className="mt-0.5"
                  raw>
                  Phát nhạc nền trong khi học
                </AppText>
              </View>
              <Switch
                value={audio.backgroundMusic.enabled}
                onValueChange={setBackgroundMusic}
              />
            </View>

            {/* Volume — chỉ hiện khi bật */}
            {audio.backgroundMusic.enabled && (
              <View
                className="mt-4 pt-4"
                style={{borderTopWidth: 1, borderTopColor: isDark ? colors.glassDivider : colors.border}}>
                <View className="flex-row items-center justify-between mb-2">
                  <AppText
                    variant="body"
                    style={{color: colors.foreground}}
                    raw>
                    Volume
                  </AppText>
                  <AppText
                    variant="body"
                    style={{color: colors.primary}}
                    className="font-sans-semibold"
                    raw>
                    {audio.backgroundMusic.volume}%
                  </AppText>
                </View>
                <Slider
                  value={audio.backgroundMusic.volume}
                  onValueChange={setMusicVolume}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                />
              </View>
            )}

            {/* Music Ducking */}
            <View
              className="flex-row items-center justify-between mt-4 pt-4"
              style={{borderTopWidth: 1, borderTopColor: isDark ? colors.glassDivider : colors.border}}>
              <View className="flex-1 mr-3">
                <AppText
                  variant="body"
                  style={{color: colors.foreground}}
                  className="font-sans-semibold"
                  raw>
                  Music Ducking
                </AppText>
                <AppText
                  variant="caption"
                  style={{color: colors.neutrals400}}
                  className="mt-0.5"
                  raw>
                  Giảm nhạc khi có lời nói
                </AppText>
              </View>
              <Switch
                value={audio.musicDucking}
                onValueChange={setMusicDucking}
              />
            </View>
          </View>
        </View>

        {/* ========================================
         * Card 2: Phát lại — title TRONG card
         * ======================================== */}
        <View className="px-4 mt-4">
          <View
            className="rounded-[20px] p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-4"
              raw>
              Phát lại
            </AppText>

            {/* Hiệu ứng âm thanh */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <AppText
                  variant="body"
                  style={{color: colors.foreground}}
                  className="font-sans-semibold"
                  raw>
                  Hiệu ứng âm thanh
                </AppText>
                <AppText
                  variant="caption"
                  style={{color: colors.neutrals400}}
                  className="mt-0.5"
                  raw>
                  Âm thanh khi đúng/sai
                </AppText>
              </View>
              <Switch
                value={audio.soundEffects}
                onValueChange={setSoundEffects}
              />
            </View>

            {/* Tự động phát */}
            <View
              className="flex-row items-center justify-between mt-4 pt-4"
              style={{borderTopWidth: 1, borderTopColor: isDark ? colors.glassDivider : colors.border}}>
              <View className="flex-1 mr-3">
                <AppText
                  variant="body"
                  style={{color: colors.foreground}}
                  className="font-sans-semibold"
                  raw>
                  Tự động phát
                </AppText>
                <AppText
                  variant="caption"
                  style={{color: colors.neutrals400}}
                  className="mt-0.5"
                  raw>
                  Tự động phát bài tiếp theo
                </AppText>
              </View>
              <Switch
                value={audio.autoPlay}
                onValueChange={setAutoPlay}
              />
            </View>
          </View>
        </View>

        {/* ========================================
         * Card 3: Giọng AI — title TRONG card (ps_audio mockup)
         * ======================================== */}
        <View className="px-4 mt-4">
          <View
            className="rounded-[20px] p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-3"
              raw>
              Giọng AI
            </AppText>

            <Pressable
              onPress={() => navigation.navigate('ListeningConfig' as any)}
              className="flex-row items-center justify-between active:opacity-80">
              <View className="flex-row items-center flex-1 mr-3">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{backgroundColor: colors.secondary + '20'}}>
                  <Icon
                    name="Mic"
                    className="w-4 h-4"
                    style={{color: colors.secondary}}
                  />
                </View>
                <View className="flex-1">
                  <AppText
                    variant="body"
                    style={{color: colors.foreground}}
                    raw>
                    Cấu hình giọng AI
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{color: colors.neutrals400}}
                    className="mt-0.5"
                    raw>
                    Thay đổi trong cài đặt Listening
                  </AppText>
                </View>
              </View>
              <Icon
                name="ChevronRight"
                className="w-5 h-5"
                style={{color: colors.neutrals400}}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

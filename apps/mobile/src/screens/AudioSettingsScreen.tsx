import React from 'react';
import {ScrollView, View, Pressable} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import Switch from '@/components/ui/Switch';
import Slider from '@/components/ui/Slider';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Màn hình cài đặt âm thanh — Background Music, SFX, Auto-play, AI Voice link
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ ProfileScreen → "Âm thanh"
 *
 * Hi-fi ref: ps_audio — 3 grouped cards:
 *   Card 1: Nhạc nền toggle + Volume slider + Music Ducking
 *   Card 2: Hiệu ứng âm thanh + Tự động phát (section "Phát lại")
 *   Card 3: Giọng AI link → ListeningConfig
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

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* ========================================
       * Card 1: Nhạc nền — toggle + volume + ducking
       * Hi-fi: "Nhạc nền" section, surface #141414
       * ======================================== */}
      <View className="px-4 pt-4">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Nhạc nền
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.surface}}>
          {/* Bật/tắt nhạc nền */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                Nhạc nền
              </AppText>
            </View>
            <Switch
              value={audio.backgroundMusic.enabled}
              onValueChange={setBackgroundMusic}
            />
          </View>

          {/* Âm lượng — chỉ hiện khi bật nhạc nền */}
          {audio.backgroundMusic.enabled && (
            <View className="mt-4 pt-4" style={{borderTopWidth: 1, borderTopColor: colors.neutrals800}}>
              <View className="flex-row items-center justify-between mb-2">
                <AppText variant="body" className="text-foreground" raw>
                  Volume
                </AppText>
                <AppText variant="body" style={{color: colors.primary}} raw>
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

          {/* Music Ducking — cùng card với divider */}
          <View
            className="flex-row items-center justify-between mt-4 pt-4"
            style={{borderTopWidth: 1, borderTopColor: colors.neutrals800}}>
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                Music Ducking
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
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
       * Card 2: Phát lại — SFX + Auto-play (grouped)
       * Hi-fi: "Phát lại" section
       * ======================================== */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Phát lại
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.surface}}>
          {/* Hiệu ứng âm thanh */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                Hiệu ứng âm thanh
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Âm thanh khi đúng/sai
              </AppText>
            </View>
            <Switch
              value={audio.soundEffects}
              onValueChange={setSoundEffects}
            />
          </View>

          {/* Tự động phát — cùng card với divider */}
          <View
            className="flex-row items-center justify-between mt-4 pt-4"
            style={{borderTopWidth: 1, borderTopColor: colors.neutrals800}}>
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                Tự động phát
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
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
       * Card 3: Giọng AI — link to ListeningConfig
       * Hi-fi: "Giọng AI" section
       * ======================================== */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Giọng AI
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('ListeningConfig' as any)}
          className="p-4 rounded-2xl flex-row items-center justify-between active:opacity-80"
          style={{backgroundColor: colors.surface}}>
          <View className="flex-row items-center flex-1 mr-3">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{backgroundColor: colors.primary + '20'}}>
              <Icon name="Mic" className="w-5 h-5" style={{color: colors.primary}} />
            </View>
            <View className="flex-1">
              <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                Cấu hình giọng AI
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Thay đổi trong cài đặt Listening
              </AppText>
            </View>
          </View>
          <Icon name="ChevronRight" className="w-5 h-5 text-neutrals400" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

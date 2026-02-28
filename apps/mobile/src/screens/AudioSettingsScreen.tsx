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
      {/* === Nhạc nền (Background Music) === */}
      <View className="px-4 pt-4">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Nhạc nền
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.neutrals900}}>
          {/* Bật/tắt nhạc nền */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground" raw>
                Nhạc nền
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Phát nhạc nền nhẹ trong khi học
              </AppText>
            </View>
            <Switch
              value={audio.backgroundMusic.enabled}
              onValueChange={setBackgroundMusic}
            />
          </View>

          {/* Âm lượng — chỉ hiện khi bật nhạc nền */}
          {audio.backgroundMusic.enabled && (
            <Slider
              label="Âm lượng"
              value={audio.backgroundMusic.volume}
              onValueChange={setMusicVolume}
              minimumValue={0}
              maximumValue={100}
              step={5}
              showValue
            />
          )}

          {/* Smart Ducking */}
          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-neutrals800">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground" raw>
                Smart Ducking
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Tự giảm nhạc khi phát bài học
              </AppText>
            </View>
            <Switch
              value={audio.musicDucking}
              onValueChange={setMusicDucking}
            />
          </View>
        </View>
      </View>

      {/* === Hiệu ứng âm thanh (Sound Effects) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Hiệu ứng
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.neutrals900}}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground" raw>
                Hiệu ứng âm thanh
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Âm thanh khi đúng/sai, hoàn thành bài
              </AppText>
            </View>
            <Switch
              value={audio.soundEffects}
              onValueChange={setSoundEffects}
            />
          </View>
        </View>
      </View>

      {/* === Chế độ phát (Auto-play only) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Chế độ phát
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.neutrals900}}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground" raw>
                Tự động phát
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Phát câu tiếp theo sau khi hoàn thành
              </AppText>
            </View>
            <Switch
              value={audio.autoPlay}
              onValueChange={setAutoPlay}
            />
          </View>
        </View>
      </View>

      {/* === Cấu hình giọng AI === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Giọng nói AI
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('ListeningConfig' as any)}
          className="p-4 rounded-2xl flex-row items-center justify-between active:opacity-80"
          style={{backgroundColor: colors.neutrals900}}>
          <View className="flex-1 mr-3">
            <AppText variant="body" className="text-foreground" raw>
              Cấu hình giọng AI
            </AppText>
            <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
              Chọn giọng, tốc độ và cảm xúc cho TTS
            </AppText>
          </View>
          <Icon name="ChevronRight" className="w-5 h-5 text-neutrals400" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';

// ============================================
// TYPES & CONSTANTS
// ============================================

interface SpeakingTtsSheetProps {
  /** Sheet có đang mở không */
  visible: boolean;
  /** Callback đóng sheet */
  onClose: () => void;
}

/** Danh sách giọng OpenAI TTS */
const OPENAI_VOICES = [
  {id: 'alloy', label: 'Alloy', emoji: '🤖', desc: 'Trung tính, rõ ràng'},
  {id: 'echo', label: 'Echo', emoji: '🗣️', desc: 'Nam, ấm áp'},
  {id: 'fable', label: 'Fable', emoji: '📖', desc: 'Nam British, kể chuyện'},
  {id: 'onyx', label: 'Onyx', emoji: '🎤', desc: 'Nam, trầm ấm'},
  {id: 'nova', label: 'Nova', emoji: '✨', desc: 'Nữ, trẻ trung'},
  {id: 'shimmer', label: 'Shimmer', emoji: '💫', desc: 'Nữ, nhẹ nhàng'},
];

/** Danh sách giọng Azure Neural Voice */
const AZURE_VOICES = [
  {id: 'en-US-AriaNeural', label: 'Aria', emoji: '💃', desc: 'Nữ US, biểu cảm'},
  {id: 'en-US-JennyNeural', label: 'Jenny', emoji: '👩', desc: 'Nữ US, tự nhiên'},
  {id: 'en-US-GuyNeural', label: 'Guy', emoji: '👨', desc: 'Nam US, chuyên nghiệp'},
  {id: 'en-US-DavisNeural', label: 'Davis', emoji: '🧑', desc: 'Nam US, ấm áp'},
  {id: 'en-GB-SoniaNeural', label: 'Sonia', emoji: '🇬🇧', desc: 'Nữ British'},
  {id: 'en-AU-NatashaNeural', label: 'Natasha', emoji: '🇦🇺', desc: 'Nữ Aussie'},
];

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mục đích: Bottom sheet cài đặt TTS cho Speaking module (provider + voice + speed)
 * Tham số đầu vào: SpeakingTtsSheetProps (visible, onClose)
 * Tham số đầu ra: JSX.Element (Modal bottom-sheet)
 * Khi nào sử dụng: ConfigScreen → nhấn "⚙️ Cài đặt giọng AI" → mở sheet
 */
export default function SpeakingTtsSheet({visible, onClose}: SpeakingTtsSheetProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const {ttsSettings, setTtsSettings} = useSpeakingStore();

  // Trạng thái preview audio
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Danh sách voice dựa theo provider
  const voices = ttsSettings.provider === 'openai' ? OPENAI_VOICES : AZURE_VOICES;

  /**
   * Mục đích: Chuyển đổi TTS provider (OpenAI ↔ Azure)
   * Tham số đầu vào: provider ('openai' | 'azure')
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap chip provider
   */
  const handleProviderChange = (provider: 'openai' | 'azure') => {
    haptic.light();
    const defaultVoice = provider === 'openai' ? 'alloy' : 'en-US-JennyNeural';
    setTtsSettings({provider, voiceId: defaultVoice});
  };

  /**
   * Mục đích: Nghe thử giọng đã chọn
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "Nghe thử"
   */
  const handlePreview = async () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    haptic.medium();

    try {
      console.log('🎤 [TTS] Đang phát preview giọng:', ttsSettings.voiceId);
      await speakingApi.playAISample(
        'Hello! This is a preview of the selected voice.',
        ttsSettings.provider,
        ttsSettings.voiceId,
        ttsSettings.speed,
      );
    } catch (err) {
      console.error('❌ [TTS] Lỗi preview:', err);
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        {/* Backdrop */}
        <Pressable
          style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}
          onPress={onClose}
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
            maxHeight: '80%',
          }}>
          {/* Handle bar */}
          <View style={{alignItems: 'center', paddingVertical: 12}}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.neutrals400,
              }}
            />
          </View>

          {/* Tiêu đề */}
          <View style={{paddingHorizontal: 20, marginBottom: 16}}>
            <AppText variant="heading3" weight="bold">
              ⚙️ Cài đặt giọng AI
            </AppText>
            <AppText
              variant="caption"
              style={{color: colors.neutrals400, marginTop: 4}}>
              Chọn provider và giọng phát âm mẫu
            </AppText>
          </View>

          <ScrollView
            style={{paddingHorizontal: 20}}
            showsVerticalScrollIndicator={false}>
            {/* Provider Toggle */}
            <AppText variant="body" weight="semibold" style={{marginBottom: 10}}>
              🏢 TTS Provider
            </AppText>
            <View style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
              <ProviderChip
                label="OpenAI"
                emoji="🤖"
                selected={ttsSettings.provider === 'openai'}
                onPress={() => handleProviderChange('openai')}
                accentColor="#10B981"
              />
              <ProviderChip
                label="Azure"
                emoji="☁️"
                selected={ttsSettings.provider === 'azure'}
                onPress={() => handleProviderChange('azure')}
                accentColor="#2D9CDB"
              />
            </View>

            {/* Voice Picker */}
            <AppText variant="body" weight="semibold" style={{marginBottom: 10}}>
              🎙️ Giọng đọc
            </AppText>
            <View style={{gap: 8, marginBottom: 20}}>
              {voices.map(voice => (
                <VoiceRow
                  key={voice.id}
                  voice={voice}
                  isSelected={ttsSettings.voiceId === voice.id}
                  onPress={() => {
                    haptic.light();
                    setTtsSettings({voiceId: voice.id});
                  }}
                  accentColor={
                    ttsSettings.provider === 'openai' ? '#10B981' : '#2D9CDB'
                  }
                />
              ))}
            </View>

            {/* Speed Slider */}
            <AppText variant="body" weight="semibold" style={{marginBottom: 6}}>
              ⏩ Tốc độ đọc: {ttsSettings.speed.toFixed(1)}x
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
              }}>
              <AppText variant="caption" style={{color: colors.neutrals400}}>
                0.5x
              </AppText>
              <Slider
                style={{flex: 1, height: 40}}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={ttsSettings.speed}
                onValueChange={(val: number) => setTtsSettings({speed: val})}
                minimumTrackTintColor="#22C55E"
                maximumTrackTintColor={colors.neutrals400}
                thumbTintColor="#22C55E"
              />
              <AppText variant="caption" style={{color: colors.neutrals400}}>
                2.0x
              </AppText>
            </View>

            {/* Preview Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePreview}
              disabled={isPreviewing}
              style={{
                padding: 14,
                borderRadius: 14,
                backgroundColor: isPreviewing
                  ? colors.neutrals400
                  : '#22C55E',
                alignItems: 'center',
                marginBottom: 16,
                opacity: isPreviewing ? 0.6 : 1,
              }}>
              <AppText variant="body" weight="bold" style={{color: '#FFF'}}>
                {isPreviewing ? '⏳ Đang phát...' : '🔊 Nghe thử'}
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// ProviderChip — Chip chọn TTS provider
// ============================================

interface ProviderChipProps {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  accentColor: string;
}

/**
 * Mục đích: Chip hiển thị TTS provider (OpenAI/Azure) với animation
 * Tham số đầu vào: label, emoji, selected, onPress, accentColor
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SpeakingTtsSheet → mỗi provider option
 */
function ProviderChip({label, emoji, selected, onPress, accentColor}: ProviderChipProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}>
      <Animated.View
        style={[
          {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: selected ? accentColor : colors.neutrals400 + '40',
            backgroundColor: selected
              ? accentColor + '15'
              : colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          },
          animStyle,
        ]}>
        <AppText variant="body">{emoji}</AppText>
        <AppText
          variant="body"
          weight={selected ? 'bold' : 'regular'}
          style={{color: selected ? accentColor : colors.foreground}}>
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

// ============================================
// VoiceRow — Mỗi dòng giọng đọc
// ============================================

interface VoiceRowProps {
  voice: {id: string; label: string; emoji: string; desc: string};
  isSelected: boolean;
  onPress: () => void;
  accentColor: string;
}

/**
 * Mục đích: Hiển thị 1 giọng trong danh sách chọn
 * Tham số đầu vào: voice data, isSelected, onPress, accentColor
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SpeakingTtsSheet → voice picker → mỗi voice option
 */
function VoiceRow({voice, isSelected, onPress, accentColor}: VoiceRowProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isSelected ? accentColor : 'transparent',
        backgroundColor: isSelected
          ? accentColor + '10'
          : colors.surface,
        gap: 10,
      }}>
      {/* Emoji icon */}
      <AppText variant="body" style={{fontSize: 20}}>
        {voice.emoji}
      </AppText>

      {/* Tên + mô tả */}
      <View style={{flex: 1}}>
        <AppText
          variant="body"
          weight={isSelected ? 'bold' : 'regular'}
          style={{color: isSelected ? accentColor : colors.foreground}}>
          {voice.label}
        </AppText>
        <AppText variant="caption" style={{color: colors.neutrals400}}>
          {voice.desc}
        </AppText>
      </View>

      {/* Checkmark */}
      {isSelected && (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: accentColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AppText variant="caption" style={{color: '#FFF', fontSize: 12}}>
            ✓
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

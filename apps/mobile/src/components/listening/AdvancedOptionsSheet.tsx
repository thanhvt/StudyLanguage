import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {Switch} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useListeningStore} from '@/store/useListeningStore';

// ============================================
// TYPES & CONSTANTS
// ============================================

interface AdvancedOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Trình độ */
  level: 'beginner' | 'intermediate' | 'advanced';
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  /** Số người nói (2-4), ảnh hưởng UI giọng đọc */
  numSpeakers: number;
  /** Giọng đọc random hay chọn thủ công */
  randomVoice: boolean;
  onRandomVoiceChange: (value: boolean) => void;
  /** Map voice đã chọn cho từng speaker (speakerLabel → voiceId) */
  voicePerSpeaker: Record<string, string>;
  onVoicePerSpeakerChange: (map: Record<string, string>) => void;
  /** Multi-talker (Azure DragonHD) — chỉ cho 2 speakers */
  multiTalker: boolean;
  onMultiTalkerChange: (value: boolean) => void;
  /** Index cặp giọng multi-talker (0 = Ava-Andrew, 1 = Ava-Steffan) */
  multiTalkerPairIndex: number;
  onMultiTalkerPairIndexChange: (index: number) => void;
  /** Disabled khi đang generate */
  disabled?: boolean;
}

/** Tuỳ chọn level với màu riêng biệt */
const LEVELS = [
  {value: 'beginner' as const, label: 'Cơ bản', emoji: '🌱', accentLight: '#22c55e', accentDark: '#4ade80'},
  {value: 'intermediate' as const, label: 'Trung cấp', emoji: '🌿', accentLight: '#2D9CDB', accentDark: '#007BFF'},
  {value: 'advanced' as const, label: 'Nâng cao', emoji: '🌳', accentLight: '#D97706', accentDark: '#fbbf24'},
];

/** Danh sách giọng Azure Neural Voice — sync với backend azure-tts.service.ts */
const AZURE_VOICES = [
  // Nữ
  {id: 'en-US-AriaNeural', label: 'Aria', emoji: '💃', desc: 'Nữ US, biểu cảm', gender: 'female' as const},
  {id: 'en-US-JennyNeural', label: 'Jenny', emoji: '👩', desc: 'Nữ US, đa năng', gender: 'female' as const},
  {id: 'en-US-SaraNeural', label: 'Sara', emoji: '👧', desc: 'Nữ US, trẻ trung', gender: 'female' as const},
  {id: 'en-US-JaneNeural', label: 'Jane', emoji: '👩‍💼', desc: 'Nữ UK, trang trọng', gender: 'female' as const},
  {id: 'en-US-NancyNeural', label: 'Nancy', emoji: '👩‍🦰', desc: 'Nữ US, thân thiện', gender: 'female' as const},
  // Nam
  {id: 'en-US-GuyNeural', label: 'Guy', emoji: '👨', desc: 'Nam US, chuyên nghiệp', gender: 'male' as const},
  {id: 'en-US-DavisNeural', label: 'Davis', emoji: '🕺', desc: 'Nam US, ấm áp', gender: 'male' as const},
  {id: 'en-US-TonyNeural', label: 'Tony', emoji: '👨‍🦱', desc: 'Nam US, năng động', gender: 'male' as const},
  {id: 'en-US-JasonNeural', label: 'Jason', emoji: '👨‍💼', desc: 'Nam UK, rõ ràng', gender: 'male' as const},
];

/** Cặp giọng Multi-talker DragonHD */
const MULTI_TALKER_PAIRS = [
  {index: 0, label: 'Ava — Andrew', emoji: '👩‍❤️‍👨'},
  {index: 1, label: 'Ava — Steffan', emoji: '👫'},
];

/** Tạo label cho speaker dựa trên index */
const getSpeakerLabel = (index: number): string => {
  const labels = ['Speaker A', 'Speaker B', 'Speaker C', 'Speaker D'];
  return labels[index] || `Speaker ${index + 1}`;
};

/** Tạo emoji cho speaker dựa trên index */
const getSpeakerEmoji = (index: number): string => {
  const emojis = ['👤', '👥', '🧑', '🧑‍🤝‍🧑'];
  return emojis[index] || '👤';
};

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mục đích: Bottom sheet chứa tuỳ chọn nâng cao cho bài nghe (Azure TTS only)
 * Tham số đầu vào: AdvancedOptionsSheetProps
 * Tham số đầu ra: JSX.Element (Modal bottom-sheet)
 * Khi nào sử dụng: ConfigScreen → "Tuỳ chọn nâng cao" button → mở sheet này
 *   - Chứa: Difficulty, Voice selection per-speaker, Multi-talker toggle (2 speakers only)
 */
export default function AdvancedOptionsSheet({
  visible,
  onClose,
  level,
  onLevelChange,
  numSpeakers,
  randomVoice,
  onRandomVoiceChange,
  voicePerSpeaker,
  onVoicePerSpeakerChange,
  multiTalker,
  onMultiTalkerChange,
  multiTalkerPairIndex,
  onMultiTalkerPairIndexChange,
  disabled = false,
}: AdvancedOptionsSheetProps) {
  const colors = useColors();
  const haptic = useHaptic();

  // Cập nhật voice cho 1 speaker cụ thể
  const handleVoiceSelect = (speakerLabel: string, voiceId: string) => {
    haptic.light();
    onVoicePerSpeakerChange({
      ...voicePerSpeaker,
      [speakerLabel]: voiceId,
    });
  };

  // Kiểm tra numSpeakers = 4 → bắt buộc random voice
  const forceRandom = numSpeakers >= 4;
  // Multi-talker chỉ khả dụng khi 2 speakers
  const canMultiTalker = numSpeakers === 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
      />
      <View
        className="rounded-t-3xl px-6 pb-safe-offset-6 pt-4"
        style={{
          backgroundColor: colors.background,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
          // Giới hạn chiều cao sheet tối đa 85% màn hình
          maxHeight: '85%',
        }}>
        {/* Thanh kéo */}
        <View className="w-10 h-1 rounded-full self-center mb-4" style={{backgroundColor: colors.neutrals600}} />

        {/* Header */}
        <View className="flex-row items-center justify-between mb-5">
          <AppText className="font-sans-bold text-lg" style={{color: colors.foreground}}>
            ⚙️ Tuỳ chọn nâng cao
          </AppText>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Đóng tuỳ chọn nâng cao"
            accessibilityRole="button">
            <Icon name="X" className="w-6 h-6" style={{color: colors.neutrals400}} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ======================== */}
          {/* Section 1: Trình độ */}
          {/* ======================== */}
          <View className="mb-6">
            <AppText className="font-sans-semibold text-base mb-3" style={{color: colors.foreground}}>
              🎯 Trình độ
            </AppText>
            <View className="flex-row gap-3">
              {LEVELS.map(l => {
                const isDark = colors.background === '#000000';
                const accent = isDark ? l.accentDark : l.accentLight;
                return (
                  <LevelChip
                    key={l.value}
                    emoji={l.emoji}
                    label={l.label}
                    accentColor={accent}
                    selected={level === l.value}
                    onPress={() => {
                      haptic.light();
                      onLevelChange(l.value);
                    }}
                    disabled={disabled}
                    accessibilityLabel={`Trình độ ${l.label}${level === l.value ? ', đang chọn' : ''}`}
                  />
                );
              })}
            </View>
          </View>

          {/* ======================== */}
          {/* Section 2: Giọng đọc */}
          {/* ======================== */}
          <View className="mb-6">
            <AppText className="font-sans-semibold text-base mb-3" style={{color: colors.foreground}}>
              🔊 Giọng đọc
            </AppText>

            {/* Toggle giọng ngẫu nhiên */}
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-2xl px-4 py-3 mb-3"
              style={{backgroundColor: colors.neutrals900}}
              onPress={() => {
                if (!forceRandom) {
                  haptic.light();
                  onRandomVoiceChange(!randomVoice);
                }
              }}
              disabled={disabled || forceRandom}
              activeOpacity={0.7}
              accessibilityLabel={`Giọng ngẫu nhiên, ${randomVoice || forceRandom ? 'bật' : 'tắt'}${forceRandom ? ', bắt buộc với 4 người nói' : ''}`}
              accessibilityRole="switch">
              <View className="flex-1 mr-3">
                <AppText style={{color: colors.foreground}}>🎲 Giọng ngẫu nhiên</AppText>
                <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}}>
                  {forceRandom
                    ? 'Bắt buộc khi 4 người nói — AI tự phân giọng tối ưu'
                    : 'AI tự chọn giọng phù hợp cho từng speaker'}
                </AppText>
              </View>
              <Switch
                value={randomVoice || forceRandom}
                onValueChange={v => {
                  if (!forceRandom) {
                    onRandomVoiceChange(v);
                  }
                }}
                disabled={disabled || forceRandom}
              />
            </TouchableOpacity>

            {/* Danh sách chọn giọng per-speaker — chỉ hiện khi random voice TẮT */}
            {!randomVoice && !forceRandom && (
              <View className="gap-3">
                {Array.from({length: numSpeakers}, (_, i) => {
                  const speakerLabel = getSpeakerLabel(i);
                  const selectedVoiceId = voicePerSpeaker[speakerLabel] || '';
                  return (
                    <SpeakerVoicePicker
                      key={speakerLabel}
                      speakerLabel={speakerLabel}
                      speakerEmoji={getSpeakerEmoji(i)}
                      speakerIndex={i}
                      selectedVoiceId={selectedVoiceId}
                      onVoiceSelect={voiceId => handleVoiceSelect(speakerLabel, voiceId)}
                      disabled={disabled}
                    />
                  );
                })}

                <AppText className="text-xs mt-1 px-1" style={{color: colors.neutrals500}}>
                  ℹ️ 9 giọng Azure Neural Voice (5 nữ + 4 nam)
                </AppText>
              </View>
            )}
          </View>

          {/* ======================== */}
          {/* Section 3: Multi-talker — chỉ hiện khi 2 speakers */}
          {/* ======================== */}
          {canMultiTalker && (
            <View className="mb-4">
              <AppText className="font-sans-semibold text-base mb-3" style={{color: colors.foreground}}>
                🎭 Multi-talker (Azure)
              </AppText>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-2xl px-4 py-3"
                style={{backgroundColor: colors.neutrals900}}
                onPress={() => {
                  haptic.light();
                  onMultiTalkerChange(!multiTalker);
                }}
                disabled={disabled}
                activeOpacity={0.7}
                accessibilityLabel={`Đa giọng nói cùng lúc, ${multiTalker ? 'bật' : 'tắt'}`}
                accessibilityRole="switch">
                <View className="flex-1 mr-3">
                  <AppText style={{color: colors.foreground}}>
                    Đa giọng nói cùng lúc
                  </AppText>
                  <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}}>
                    Gen 1 lần, giọng tự nhiên hơn với DragonHD
                  </AppText>
                </View>
                <Switch
                  value={multiTalker}
                  onValueChange={onMultiTalkerChange}
                  disabled={disabled}
                />
              </TouchableOpacity>

              {/* Chọn cặp giọng multi-talker — chỉ hiện khi bật */}
              {multiTalker && (
                <View className="mt-3 gap-2">
                  <AppText className="text-xs px-1 mb-1" style={{color: colors.neutrals400}}>
                    Chọn cặp giọng:
                  </AppText>
                  {MULTI_TALKER_PAIRS.map(pair => {
                    const isDark = colors.background === '#000000';
                    const accent = isDark ? '#4fc3f7' : '#0078d4';
                    const isSelected = multiTalkerPairIndex === pair.index;
                    return (
                      <TouchableOpacity
                        key={pair.index}
                        className="flex-row items-center rounded-2xl px-4 py-3 border"
                        style={{
                          backgroundColor: isSelected ? `${accent}15` : colors.neutrals900,
                          borderColor: isSelected ? `${accent}40` : 'transparent',
                        }}
                        onPress={() => {
                          haptic.light();
                          onMultiTalkerPairIndexChange(pair.index);
                        }}
                        disabled={disabled}
                        activeOpacity={0.7}
                        accessibilityLabel={`Cặp giọng ${pair.label}${isSelected ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        <AppText className="text-lg mr-3">{pair.emoji}</AppText>
                        <AppText
                          className={`flex-1 font-sans-medium ${
                            isSelected ? 'text-primary' : ''
                          }`}
                          style={!isSelected ? {color: colors.foreground} : undefined}>
                          {pair.label}
                        </AppText>
                        {isSelected && (
                          <Icon name="Check" className="w-5 h-5 text-primary" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* =====================================================
              SECTION 4: TTS Emotion & Prosody Fine-tuning
              Các cài đặt Azure SSML: emotion, pitch, rate, volume
              ===================================================== */}
          <TtsProsodySection disabled={disabled} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ============================================
// SpeakerVoicePicker — Expandable picker cho 1 speaker
// ============================================

interface SpeakerVoicePickerProps {
  speakerLabel: string;
  speakerEmoji: string;
  speakerIndex: number;
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  disabled: boolean;
}

/**
 * Mục đích: Card expandable cho phép chọn giọng cho 1 speaker cụ thể
 * Tham số đầu vào: speakerLabel, speakerIndex, selectedVoiceId, onVoiceSelect
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: AdvancedOptionsSheet → khi random voice TẮT → hiện cho mỗi speaker
 */
function SpeakerVoicePicker({
  speakerLabel,
  speakerEmoji,
  speakerIndex,
  selectedVoiceId,
  onVoiceSelect,
  disabled,
}: SpeakerVoicePickerProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = useColors();
  const haptic = useHaptic();

  // Tìm voice đang chọn để hiển thị tên
  const selectedVoice = AZURE_VOICES.find(v => v.id === selectedVoiceId);
  const displayText = selectedVoice
    ? `${selectedVoice.label} (${selectedVoice.gender === 'female' ? 'Nữ' : 'Nam'})`
    : 'Chưa chọn';

  // Animation cho expand/collapse
  const expandAnim = useSharedValue(0);
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${interpolate(expandAnim.value, [0, 1], [0, 180])}deg`}],
  }));

  const toggleExpand = () => {
    haptic.light();
    const next = !expanded;
    setExpanded(next);
    expandAnim.value = withTiming(next ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };

  // Gợi ý giọng mặc định theo speaker index (xen kẽ nữ/nam)
  const suggestedGender = speakerIndex % 2 === 0 ? 'female' : 'male';

  return (
    <View
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: expanded ? `${colors.primary}50` : colors.neutrals800,
        backgroundColor: colors.neutrals900,
      }}>
      {/* Header — nhấn để mở/đóng danh sách voice */}
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3"
        onPress={toggleExpand}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={`${speakerLabel}, giọng: ${displayText}. Nhấn để ${expanded ? 'đóng' : 'mở'} danh sách`}
        accessibilityRole="button">
        <View className="flex-row items-center flex-1">
          <AppText className="mr-2">{speakerEmoji}</AppText>
          <AppText className="font-sans-medium" style={{color: colors.foreground}}>
            {speakerLabel}
          </AppText>
        </View>
        <View className="flex-row items-center">
          <AppText
            className="text-sm mr-2"
            style={{color: colors.neutrals300}}
            numberOfLines={1}>
            {displayText}
          </AppText>
          <Animated.View style={rotateStyle}>
            <Icon name="ChevronDown" className="w-4 h-4" style={{color: colors.neutrals400}} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Danh sách voice — hiện khi expanded */}
      {expanded && (
        <View className="px-3 pb-3 pt-1">
          {/* Gợi ý giới tính */}
          <AppText className="text-xs mb-2 px-1" style={{color: colors.neutrals500}}>
            💡 Gợi ý: giọng {suggestedGender === 'female' ? 'nữ' : 'nam'} cho {speakerLabel}
          </AppText>

          {/* Nhóm Nữ */}
          <AppText className="text-xs font-sans-semibold mb-1 px-1" style={{color: colors.neutrals400}}>
            Nữ
          </AppText>
          <View className="gap-1 mb-2">
            {AZURE_VOICES.filter(v => v.gender === 'female').map(voice => (
              <VoiceItem
                key={voice.id}
                voice={voice}
                isSelected={selectedVoiceId === voice.id}
                isSuggested={suggestedGender === 'female'}
                onPress={() => onVoiceSelect(voice.id)}
                disabled={disabled}
              />
            ))}
          </View>

          {/* Nhóm Nam */}
          <AppText className="text-xs font-sans-semibold mb-1 px-1" style={{color: colors.neutrals400}}>
            Nam
          </AppText>
          <View className="gap-1">
            {AZURE_VOICES.filter(v => v.gender === 'male').map(voice => (
              <VoiceItem
                key={voice.id}
                voice={voice}
                isSelected={selectedVoiceId === voice.id}
                isSuggested={suggestedGender === 'male'}
                onPress={() => onVoiceSelect(voice.id)}
                disabled={disabled}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================
// VoiceItem — Mỗi dòng giọng trong danh sách
// ============================================

interface VoiceItemProps {
  voice: (typeof AZURE_VOICES)[number];
  isSelected: boolean;
  isSuggested: boolean;
  onPress: () => void;
  disabled: boolean;
}

/**
 * Mục đích: Hiển thị 1 giọng trong danh sách chọn (compact)
 * Tham số đầu vào: voice data, isSelected, onPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SpeakerVoicePicker → expanded → mỗi voice option
 */
function VoiceItem({voice, isSelected, isSuggested, onPress, disabled}: VoiceItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      className={`flex-row items-center rounded-xl px-3 py-2.5 ${
        isSelected
          ? 'bg-primary/10'
          : ''
      }`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={`Giọng ${voice.label}, ${voice.desc}${isSelected ? ', đang chọn' : ''}`}
      accessibilityRole="button">
      <AppText className="mr-2">{voice.emoji}</AppText>
      <View className="flex-1">
        <AppText
          className={`text-sm ${
            isSelected ? 'text-primary font-sans-semibold' : ''
          }`}
          style={!isSelected ? {color: colors.foreground} : undefined}>
          {voice.label}
        </AppText>
        <AppText style={{fontSize: 11, color: colors.neutrals400}}>
          {voice.desc}
        </AppText>
      </View>
      {isSelected && (
        <Icon name="Check" className="w-4 h-4 text-primary" />
      )}
    </TouchableOpacity>
  );
}

// ============================================
// LevelChip — Chip trình độ có animation
// ============================================

interface LevelChipProps {
  emoji: string;
  label: string;
  accentColor: string;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
}

/**
 * Mục đích: Chip hiển thị level với spring animation khi nhấn
 * Tham số đầu vào: emoji, label, selected, onPress, disabled, accessibilityLabel
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: AdvancedOptionsSheet → mỗi option level (Cơ bản/Trung cấp/Nâng cao)
 */
function LevelChip({
  emoji,
  label,
  accentColor,
  selected,
  onPress,
  disabled,
  accessibilityLabel,
}: LevelChipProps) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  return (
    <Animated.View style={animatedStyle} className="flex-1">
      <Pressable
        className="py-3 rounded-2xl items-center border"
        style={{
          backgroundColor: selected ? `${accentColor}15` : undefined,
          borderColor: selected ? accentColor : colors.neutrals800,
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        <AppText className="text-lg mb-1">{emoji}</AppText>
        <AppText
          className={`text-sm ${
            selected ? 'font-sans-bold' : ''
          }`}
          style={{color: selected ? accentColor : colors.foreground}}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

// ==================================================
// AZURE EMOTION STYLES
// ==================================================
const AZURE_EMOTIONS = [
  {value: 'default', label: 'Mặc định', emoji: '🎤'},
  {value: 'cheerful', label: 'Vui vẻ', emoji: '😊'},
  {value: 'sad', label: 'Buồn', emoji: '😢'},
  {value: 'angry', label: 'Tức giận', emoji: '😠'},
  {value: 'friendly', label: 'Thân thiện', emoji: '🤗'},
  {value: 'excited', label: 'Phấn khích', emoji: '🤩'},
];

/**
 * Mục đích: Section điều chỉnh TTS emotion & prosody (Azure SSML)
 * Tham số đầu vào: disabled (boolean)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: AdvancedOptionsSheet → Section 4
 *   - Emotion: chọn style cho <mstts:express-as>
 *   - Pitch/Rate/Volume: điều chỉnh <prosody> element
 */
function TtsProsodySection({disabled}: {disabled?: boolean}) {
  const colors = useColors();
  const haptic = useHaptic();

  const ttsEmotion = useListeningStore(s => s.ttsEmotion);
  const ttsPitch = useListeningStore(s => s.ttsPitch);
  const ttsRate = useListeningStore(s => s.ttsRate);
  const ttsVolume = useListeningStore(s => s.ttsVolume);
  const setTtsEmotion = useListeningStore(s => s.setTtsEmotion);
  const setTtsPitch = useListeningStore(s => s.setTtsPitch);
  const setTtsRate = useListeningStore(s => s.setTtsRate);
  const setTtsVolume = useListeningStore(s => s.setTtsVolume);

  return (
    <View className="mt-6">
      {/* Tiêu đề */}
      <View className="flex-row items-center mb-4">
        <AppText className="text-lg mr-2">🎭</AppText>
        <AppText className="font-sans-bold text-base" style={{color: colors.foreground}}>
          Giọng nói & Biểu cảm
        </AppText>
      </View>

      {/* Emotion picker */}
      <AppText className="text-xs mb-2 px-1" style={{color: colors.neutrals400}}>
        Phong cách đọc (Azure Neural):
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 8, paddingRight: 16}}>
        {AZURE_EMOTIONS.map(em => {
          const isSelected = ttsEmotion === em.value;
          return (
            <TouchableOpacity
              key={em.value}
              className="px-4 py-2 rounded-full border"
              style={{
                backgroundColor: isSelected ? `${colors.primary}15` : colors.neutrals900,
                borderColor: isSelected ? `${colors.primary}40` : 'transparent',
              }}
              onPress={() => {
                haptic.light();
                setTtsEmotion(em.value);
              }}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityLabel={`Phong cách ${em.label}${isSelected ? ', đang chọn' : ''}`}
              accessibilityRole="button">
              <AppText
                className="text-sm"
                style={{color: isSelected ? colors.primary : colors.foreground, fontWeight: isSelected ? '500' : undefined}}>
                {em.emoji} {em.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Prosody sliders */}
      <View className="mt-5 gap-4">
        {/* Pitch */}
        <View>
          <View className="flex-row items-center justify-between mb-1">
            <AppText className="text-xs" style={{color: colors.neutrals400}}>
              Cao độ (Pitch)
            </AppText>
            <TouchableOpacity onPress={() => { haptic.light(); setTtsPitch(0); }}>
              <AppText className="text-primary text-xs">
                {ttsPitch > 0 ? `+${ttsPitch}%` : `${ttsPitch}%`}
              </AppText>
            </TouchableOpacity>
          </View>
          <Slider
            value={ttsPitch}
            minimumValue={-20}
            maximumValue={20}
            step={5}
            onValueChange={setTtsPitch}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.neutrals800}
            thumbTintColor={colors.primary}
            disabled={disabled}
          />
        </View>

        {/* Rate */}
        <View>
          <View className="flex-row items-center justify-between mb-1">
            <AppText className="text-xs" style={{color: colors.neutrals400}}>
              Tốc độ (Rate)
            </AppText>
            <TouchableOpacity onPress={() => { haptic.light(); setTtsRate(0); }}>
              <AppText className="text-primary text-xs">
                {ttsRate > 0 ? `+${ttsRate}%` : `${ttsRate}%`}
              </AppText>
            </TouchableOpacity>
          </View>
          <Slider
            value={ttsRate}
            minimumValue={-20}
            maximumValue={20}
            step={5}
            onValueChange={setTtsRate}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.neutrals800}
            thumbTintColor={colors.primary}
            disabled={disabled}
          />
        </View>

        {/* Volume */}
        <View>
          <View className="flex-row items-center justify-between mb-1">
            <AppText className="text-xs" style={{color: colors.neutrals400}}>
              Âm lượng (Volume)
            </AppText>
            <TouchableOpacity onPress={() => { haptic.light(); setTtsVolume(100); }}>
              <AppText className="text-primary text-xs">
                {ttsVolume}%
              </AppText>
            </TouchableOpacity>
          </View>
          <Slider
            value={ttsVolume}
            minimumValue={0}
            maximumValue={100}
            step={10}
            onValueChange={setTtsVolume}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.neutrals800}
            thumbTintColor={colors.primary}
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
}


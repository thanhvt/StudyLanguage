import React from 'react';
import {Modal, Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {Switch} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';

interface AdvancedOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Difficulty */
  level: 'beginner' | 'intermediate' | 'advanced';
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  /** Giọng đọc random hay chọn */
  randomVoice: boolean;
  onRandomVoiceChange: (value: boolean) => void;
  /** Multi-talker (Azure) */
  multiTalker: boolean;
  onMultiTalkerChange: (value: boolean) => void;
  /** Disabled khi đang generate */
  disabled?: boolean;
}

/** Tuỳ chọn level với màu riêng biệt */
const LEVELS = [
  {value: 'beginner' as const, label: 'Cơ bản', emoji: '🌱', accentLight: '#22c55e', accentDark: '#4ade80'},
  {value: 'intermediate' as const, label: 'Trung cấp', emoji: '🌿', accentLight: '#2D9CDB', accentDark: '#007BFF'},
  {value: 'advanced' as const, label: 'Nâng cao', emoji: '🌳', accentLight: '#D97706', accentDark: '#fbbf24'},
];

/**
 * Mục đích: Bottom sheet chứa tuỳ chọn nâng cao cho bài nghe
 * Tham số đầu vào: AdvancedOptionsSheetProps
 * Tham số đầu ra: JSX.Element (Modal bottom-sheet)
 * Khi nào sử dụng: ConfigScreen → "Tuỳ chọn nâng cao" button → mở sheet này
 *   - Chứa: Difficulty, Voice selection, Multi-talker toggle
 */
export default function AdvancedOptionsSheet({
  visible,
  onClose,
  level,
  onLevelChange,
  randomVoice,
  onRandomVoiceChange,
  multiTalker,
  onMultiTalkerChange,
  disabled = false,
}: AdvancedOptionsSheetProps) {
  const colors = useColors();
  const haptic = useHaptic();

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
        className="bg-background rounded-t-3xl px-6 pb-safe-offset-6 pt-4"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
        }}>
        {/* Thanh kéo */}
        <View className="w-10 h-1 bg-neutrals600 rounded-full self-center mb-4" />

        {/* Header */}
        <View className="flex-row items-center justify-between mb-5">
          <AppText className="text-foreground font-sans-bold text-lg">
            ⚙️ Tuỳ chọn nâng cao
          </AppText>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Đóng tuỳ chọn nâng cao"
            accessibilityRole="button">
            <Icon name="X" className="w-6 h-6 text-neutrals400" />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {/* Trình độ */}
          <View className="mb-6">
            <AppText className="text-foreground font-sans-semibold text-base mb-3">
              🎯 Trình độ
            </AppText>
            <View className="flex-row gap-3">
              {LEVELS.map(l => {
                // Màu accent riêng cho từng level
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

          {/* Giọng đọc */}
          <View className="mb-6">
            <AppText className="text-foreground font-sans-semibold text-base mb-3">
              🔊 Giọng đọc
            </AppText>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
              onPress={() => onRandomVoiceChange(!randomVoice)}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityLabel={`Giọng ngẫu nhiên, ${randomVoice ? 'bật' : 'tắt'}`}
              accessibilityRole="switch">
              <View>
                <AppText className="text-foreground">Giọng ngẫu nhiên</AppText>
                <AppText className="text-neutrals400 text-xs mt-0.5">
                  AI tự chọn giọng phù hợp cho từng speaker
                </AppText>
              </View>
              <Switch
                value={randomVoice}
                onValueChange={onRandomVoiceChange}
                disabled={disabled}
              />
            </TouchableOpacity>
          </View>

          {/* Multi-talker */}
          <View className="mb-4">
            <AppText className="text-foreground font-sans-semibold text-base mb-3">
              👥 Multi-talker (Azure)
            </AppText>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
              onPress={() => onMultiTalkerChange(!multiTalker)}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityLabel={`Đa giọng nói cùng lúc, ${multiTalker ? 'bật' : 'tắt'}`}
              accessibilityRole="switch">
              <View className="flex-1 mr-3">
                <AppText className="text-foreground">
                  Đa giọng nói cùng lúc
                </AppText>
                <AppText className="text-neutrals400 text-xs mt-0.5">
                  Giọng tự nhiên hơn với Azure Neural Voice
                </AppText>
              </View>
              <Switch
                value={multiTalker}
                onValueChange={onMultiTalkerChange}
                disabled={disabled}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ========================
// LevelChip — chip trình độ có animation
// ========================

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
            selected ? 'font-sans-bold' : 'text-foreground'
          }`}
          style={selected ? {color: accentColor} : undefined}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

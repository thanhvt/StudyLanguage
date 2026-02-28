import React, {useEffect, useRef} from 'react';
import {View, Animated, Easing} from 'react-native';
import {AppText} from '@/components/ui';
import {useListeningStore} from '@/store/useListeningStore';
import {useColors} from '@/hooks/useColors';

// ========================
// Màu sắc Listening-specific
// ========================
const LISTENING_BLUE = '#2563EB';

// ========================
// Cấu hình các bước generating
// ========================
const STEPS = [
  {label: 'Phân tích chủ đề...', icon: '📝'},
  {label: 'Xây dựng kịch bản...', icon: '🎭'},
  {label: 'Tạo hội thoại...', icon: '💬'},
  {label: 'Thêm từ vựng...', icon: '📚'},
  {label: 'Hoàn tất!', icon: '✅'},
];

interface GeneratingScreenProps {
  /** Bước hiện tại (0-4) */
  currentStep?: number;
  /** Tên speaker đang xử lý */
  activeSpeaker?: string;
}

/**
 * Mục đích: Overlay full-screen hiển thị progress khi đang generate conversation
 * Tham số đầu vào: currentStep (number), activeSpeaker (string optional)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen nhấn "Bắt đầu nghe" → overlay này hiện
 *   trong khi API đang xử lý generate conversation + TTS audio
 */
export default function GeneratingScreen({
  currentStep = 2,
  activeSpeaker,
}: GeneratingScreenProps) {
  const config = useListeningStore(state => state.config);
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const colors = useColors();

  // Animation cho vòng tròn progress
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Xoay vòng tròn progress
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    // Pulse effect cho speaker bars
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    rotateLoop.start();
    pulseLoop.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, [rotateAnim, pulseAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const levelLabel = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  }[config.level] || config.level;

  return (
    <View className="flex-1 items-center justify-center px-8" style={{backgroundColor: colors.background}}>
      {/* Vòng tròn progress */}
      <View className="w-40 h-40 items-center justify-center mb-8">
        {/* Ring xoay */}
        <Animated.View
          className="absolute w-40 h-40 rounded-full border-4"
          style={{
            borderColor: `${LISTENING_BLUE}30`,
            borderTopColor: LISTENING_BLUE,
            transform: [{rotate: rotateInterpolate}],
          }}
        />
        {/* Nội dung trong ring */}
        <View className="items-center">
          <AppText className="text-3xl mb-1">
            {STEPS[currentStep]?.icon || '⏳'}
          </AppText>
          <AppText className="font-sans-bold text-lg" style={{color: colors.foreground}}>
            {currentStep + 1}/{STEPS.length}
          </AppText>
        </View>
      </View>

      {/* Trạng thái hiện tại */}
      <AppText className="font-sans-bold text-xl mb-2 text-center" style={{color: colors.foreground}}>
        {STEPS[currentStep]?.label || 'Đang xử lý...'}
      </AppText>

      {/* Speaker activity */}
      {activeSpeaker && (
        <Animated.View
          className="flex-row items-center mt-2 px-4 py-2 rounded-full"
          style={{
            backgroundColor: `${LISTENING_BLUE}15`,
            transform: [{scale: pulseAnim}],
          }}>
          <View className="flex-row items-end gap-0.5 h-4 mr-2">
            <View className="w-0.5 h-1 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-3 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-2 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-4 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-1.5 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
          </View>
          <AppText className="text-sm" style={{color: LISTENING_BLUE}}>
            {activeSpeaker} đang nói...
          </AppText>
        </Animated.View>
      )}

      {/* Config summary cards */}
      <View className="w-full mt-10 gap-2">
        <View className="flex-row gap-2">
          <ConfigChip label="📝" value={selectedTopic?.name || config.topic || 'Custom'} flex={2} />
          <ConfigChip label="🎯" value={levelLabel} />
        </View>
        <View className="flex-row gap-2">
          <ConfigChip label="⏱" value={`${config.durationMinutes} phút`} />
          <ConfigChip label="👥" value={`${config.numSpeakers ?? 2} người`} />
        </View>
      </View>
    </View>
  );
}

/**
 * Mục đích: Chip nhỏ hiển thị thông tin config trong GeneratingScreen
 * Tham số đầu vào: label (string emoji), value (string), flex (number optional)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Dùng bên trong GeneratingScreen để show config summary
 */
function ConfigChip({
  label,
  value,
  flex = 1,
}: {
  label: string;
  value: string;
  flex?: number;
}) {
  const colors = useColors();
  return (
    <View
      className="rounded-xl px-3 py-2.5 flex-row items-center"
      style={{flex, backgroundColor: colors.neutrals900}}>
      <AppText className="text-sm mr-1.5">{label}</AppText>
      <AppText className="text-xs font-sans-medium" style={{color: colors.foreground}} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

import React, {useEffect, useRef} from 'react';
import {View, Animated, Easing, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {AppText} from '@/components/ui';
import {useListeningStore} from '@/store/useListeningStore';
import {useColors} from '@/hooks/useColors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// ========================
// Màu sắc Listening-specific
// ========================
const LISTENING_BLUE = '#2563EB';
const LISTENING_TEAL = '#14B8A6';

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
  /** Callback khi user nhấn Huỷ */
  onCancel?: () => void;
}

/**
 * Mục đích: Overlay full-screen hiển thị progress khi đang generate conversation
 *   Glassmorphism design — thick progress ring, speaker bars, 8-field config card
 * Tham số đầu vào: currentStep, activeSpeaker, onCancel
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen nhấn "Bắt đầu nghe" → overlay này hiện
 *   trong khi API đang xử lý generate conversation + TTS audio
 */
export default function GeneratingScreen({
  currentStep = 0,
  activeSpeaker,
  onCancel,
}: GeneratingScreenProps) {
  const config = useListeningStore(state => state.config);
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const voicePerSpeaker = useListeningStore(state => state.voicePerSpeaker);
  const ttsEmotion = useListeningStore(state => state.ttsEmotion);
  const ttsPitch = useListeningStore(state => state.ttsPitch);
  const ttsRate = useListeningStore(state => state.ttsRate);
  const randomVoice = useListeningStore(state => state.randomVoice);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Animation cho vòng tròn progress quay
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // Pulse effect cho speaker bars
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Xoay vòng tròn arc nhẹ nhàng
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    // Pulse cho speaker bar đang active
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
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

  // Tính toán progress
  const progress = (currentStep + 1) / STEPS.length;
  const ringSize = 160;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress);

  // Tính label hiển thị
  const levelLabel = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  }[config.level] || config.level;

  const modeLabel = 'Hội thoại';

  // Lấy tên giọng chính — từ voicePerSpeaker hoặc "AI tự chọn"
  const primaryVoice = randomVoice
    ? 'AI chọn'
    : Object.values(voicePerSpeaker)?.[0]?.replace('en-US-', '').replace('Neural', '') || 'Mặc định';

  const emotionLabel = ttsEmotion === 'default' ? 'Mặc định' : ttsEmotion;

  // Tạo danh sách speakers giả lập — dựa trên numSpeakers
  const numSpeakers = config.numSpeakers ?? 2;
  const speakerNames = numSpeakers === 2
    ? ['Speaker A', 'Speaker B', 'Speaker A', 'Speaker B', 'Speaker A']
    : Array.from({length: 5}, (_, i) => `Speaker ${String.fromCharCode(65 + (i % numSpeakers))}`);

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Phần trên — Progress ring + status */}
      <View className="flex-1 items-center px-8" style={{paddingTop: 60, justifyContent: 'flex-start'}}>
        {/* Thick Progress Ring */}
        <View style={{width: ringSize, height: ringSize, marginBottom: 24}}>
          {/* Track ring (nền) */}
          <Svg width={ringSize} height={ringSize} style={StyleSheet.absoluteFill}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={colors.glassBorder}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
          {/* Progress arc — quay nhẹ */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {transform: [{rotate: rotateInterpolate}]},
            ]}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={LISTENING_TEAL}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${ringSize / 2}, ${ringSize / 2}`}
              />
            </Svg>
          </Animated.View>
          {/* Nội dung giữa ring */}
          <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
            <AppText className="text-3xl mb-0.5">
              {STEPS[currentStep]?.icon || '⏳'}
            </AppText>
            <AppText className="font-sans-bold text-2xl" style={{color: colors.foreground}}>
              {currentStep + 1}
              <AppText className="text-base font-sans-medium" style={{color: colors.neutrals300}}>
                /{STEPS.length}
              </AppText>
            </AppText>
          </View>
        </View>

        {/* Trạng thái hiện tại */}
        <AppText
          className="font-sans-bold text-xl mb-4 text-center"
          style={{color: LISTENING_TEAL}}>
          {activeSpeaker
            ? `${activeSpeaker} đang nói...`
            : STEPS[currentStep]?.label || 'Đang xử lý...'}
        </AppText>

        {/* Speaker Timeline Bars */}
        <View className="w-full max-w-[280px]" style={{gap: 6}}>
          {speakerNames.map((name, idx) => {
            const isBeforeOrCurrent = idx <= currentStep;
            const isCurrent = idx === currentStep;
            // Tính width dựa trên random seed
            const barWidthPercent = 30 + ((idx * 37 + 13) % 50);

            return (
              <View key={`speaker-${idx}`} className="flex-row items-center" style={{gap: 8}}>
                <AppText
                  className="text-xs font-sans-medium w-20 text-right"
                  style={{color: isCurrent ? colors.foreground : colors.neutrals400}}
                  numberOfLines={1}>
                  {name}
                </AppText>
                <View className="flex-1 h-2.5 rounded-full overflow-hidden"
                  style={{backgroundColor: colors.glassBorder}}>
                  {isBeforeOrCurrent && (
                    <Animated.View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: isCurrent ? LISTENING_TEAL : `${LISTENING_TEAL}60`,
                        width: isCurrent ? pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [`${barWidthPercent - 10}%`, `${barWidthPercent}%`],
                        }) : `${barWidthPercent}%`,
                      }}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom Card — Glassmorphism info */}
      <View
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.neutrals900,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          marginBottom: Math.max(insets.bottom, 16) + 40,
        }}>
        <View className="p-4" style={{gap: 8}}>
          {/* Row 1: Chủ đề + Trình độ */}
          <View className="flex-row" style={{gap: 8}}>
            <ConfigChip
              icon="💬"
              label="Chủ đề"
              value={selectedTopic?.name || config.topic || 'Tuỳ chỉnh'}
            />
            <ConfigChip
              icon="🎯"
              label="Trình độ"
              value={levelLabel}
            />
          </View>
          {/* Row 2: Chế độ + Speakers */}
          <View className="flex-row" style={{gap: 8}}>
            <ConfigChip
              icon="🎙"
              label="Chế độ"
              value={modeLabel}
            />
            <ConfigChip
              icon="👥"
              label="Speakers"
              value={`${numSpeakers}`}
            />
          </View>
          {/* Row 3: Giọng + Cảm xúc */}
          <View className="flex-row" style={{gap: 8}}>
            <ConfigChip
              icon="🗣"
              label="Giọng"
              value={primaryVoice}
            />
            <ConfigChip
              icon="😊"
              label="Cảm xúc"
              value={emotionLabel}
            />
          </View>
          {/* Row 4: Thời lượng + Pitch/Rate */}
          <View className="flex-row" style={{gap: 8}}>
            <ConfigChip
              icon="⏱"
              label="Thời lượng"
              value={`${config.durationMinutes} phút`}
            />
            <ConfigChip
              icon="📈"
              label="Pitch/Rate"
              value={`${ttsPitch >= 0 ? '+' : ''}${ttsPitch}/${ttsRate >= 0 ? '+' : ''}${ttsRate}`}
            />
          </View>
        </View>
      </View>

      {/* Nút Huỷ */}
      {onCancel && (
        <TouchableOpacity
          className="items-center pb-2"
          style={{marginBottom: Math.max(insets.bottom, 16)}}
          onPress={onCancel}
          activeOpacity={0.6}
          accessibilityLabel="Huỷ tạo bài nghe"
          accessibilityRole="button">
          <AppText className="text-base font-sans-medium" style={{color: colors.neutrals300}}>
            Huỷ
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Mục đích: Chip nhỏ hiển thị thông tin config trong GeneratingScreen
 *   Glassmorphism style — viền glass, icon + label + value
 * Tham số đầu vào: icon (emoji), label (string), value (string), flex (number)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Dùng bên trong GeneratingScreen để show config summary
 */
function ConfigChip({
  icon,
  label,
  value,
  flex = 1,
}: {
  icon: string;
  label: string;
  value: string;
  flex?: number;
}) {
  const colors = useColors();
  return (
    <View
      className="rounded-xl px-3 py-2.5"
      style={{
        flex,
        backgroundColor: colors.neutrals900,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }}>
      <View className="flex-row items-center mb-0.5">
        <AppText className="text-xs mr-1">{icon}</AppText>
        <AppText className="text-[10px] uppercase tracking-wider" style={{color: colors.neutrals300}}>
          {label}
        </AppText>
      </View>
      <AppText
        className="text-xs font-sans-bold"
        style={{color: colors.foreground}}
        numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

import React from 'react';
import {Pressable, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {cn} from '@/utils';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Card hiển thị 1 phiên học trong History
 * Tham số đầu vào:
 *   - title: tiêu đề bài học
 *   - skillType: loại kỹ năng ('listening' | 'speaking' | 'reading')
 *   - duration: thời gian (string, ví dụ: '15 phút')
 *   - date: ngày tháng (string)
 *   - score: điểm (number, 0-100)
 *   - onPress: callback khi nhấn
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Danh sách lịch sử học trong History screen
 *   - Style_Convention §1.3 SessionCard
 */

interface SessionCardProps {
  title: string;
  skillType: 'listening' | 'speaking' | 'reading';
  duration?: string;
  date?: string;
  score?: number;
  onPress?: () => void;
  className?: string;
}

/**
 * Mục đích: Lấy màu accent theo loại skill
 * Tham số đầu vào: skillType, colors palette
 * Tham số đầu ra: hex color string
 * Khi nào sử dụng: Nội bộ SessionCard, xác định màu border trái
 */
function getSkillColor(skillType: string, colors: any): string {
  switch (skillType) {
    case 'listening':
      return colors.skillListening;
    case 'speaking':
      return colors.skillSpeaking;
    case 'reading':
      return colors.skillReading;
    default:
      return colors.primary;
  }
}

/**
 * Mục đích: Lấy label tiếng Việt cho skill
 * Tham số đầu vào: skillType
 * Tham số đầu ra: string label
 * Khi nào sử dụng: Nội bộ SessionCard, hiển thị tên skill
 */
function getSkillLabel(skillType: string): string {
  switch (skillType) {
    case 'listening':
      return 'Nghe';
    case 'speaking':
      return 'Nói';
    case 'reading':
      return 'Đọc';
    default:
      return skillType;
  }
}

export default function SessionCard({
  title,
  skillType,
  duration,
  date,
  score,
  onPress,
  className,
}: SessionCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const accentColor = getSkillColor(skillType, colors);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
  };

  const content = (
    <Animated.View
      style={[
        animatedStyle,
        {borderLeftWidth: 3, borderLeftColor: accentColor},
      ]}
      className={cn(
        'flex-row items-center p-md rounded-card',
        className,
      )}
    >
      {/* Nội dung chính */}
      <View className="flex-1">
        {/* Skill badge + tiêu đề */}
        <View className="flex-row items-center mb-1">
          <View
            className="px-2 py-0.5 rounded-full mr-2"
            style={{backgroundColor: accentColor + '1A'}}
          >
            <AppText variant="caption" weight="medium" style={{color: accentColor}} raw>
              {getSkillLabel(skillType)}
            </AppText>
          </View>
        </View>

        <AppText variant="body" weight="semibold" className="text-foreground mb-1" raw>
          {title}
        </AppText>

        {/* Metadata row */}
        <View className="flex-row items-center gap-3">
          {date && (
            <AppText variant="caption" className="text-neutrals300" raw>
              {date}
            </AppText>
          )}
          {duration && (
            <AppText variant="caption" className="text-neutrals300" raw>
              ⏱ {duration}
            </AppText>
          )}
        </View>
      </View>

      {/* Điểm (nếu có) */}
      {score !== undefined && (
        <View className="items-center ml-md">
          <AppText
            variant="heading"
            weight="bold"
            style={{color: score >= 80 ? colors.success : score >= 50 ? colors.warning : colors.error}}
            raw
          >
            {score}
          </AppText>
          <AppText variant="caption" className="text-neutrals300" raw>
            điểm
          </AppText>
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

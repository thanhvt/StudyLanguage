import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';
import {SKILL_COLORS, type SkillType} from '@/config/skillColors';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';

// Cấu hình 2 skill cards — horizontal layout theo mockup
const SKILLS: {
  id: SkillType;
  emoji: string;
  label: string;
  time: string;
  route: string;
}[] = [
  {
    id: 'listening',
    emoji: '🎧',
    label: 'Nghe',
    time: '15 phút',
    route: 'Listening',
  },
  {
    id: 'speaking',
    emoji: '🗣️',
    label: 'Nói',
    time: '10 phút',
    route: 'Speaking',
  },
];

/**
 * Mục đích: Widget 2 skill cards nằm ngang (Nghe, Nói) — glassmorphism
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần "Luyện tập nhanh" trên Dashboard
 *   - 2 cards nằm ngang, glassmorphism bg + skill color accent
 *   - Nhấn → navigate đến feature tương ứng
 *   - Animated: mỗi card xuất hiện staggered FadeInDown
 */
export default function QuickActions() {
  const navigation = useNavigation();
  const colors = useColors();
  const theme = useAppStore(state => state.theme);

  /**
   * Mục đích: Xử lý khi user nhấn vào skill card
   * Tham số đầu vào: route (string) - tên screen
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn vào 1 trong 2 skill cards
   */
  const handleSkillPress = (route: string) => {
    navigation.navigate(route as never);
  };

  return (
    <View className="px-4 py-2">
      {/* Section title */}
      <AppText
        className="font-sans-bold text-base mb-3"
        style={{color: colors.foreground}}>
        ⚡ Luyện tập nhanh
      </AppText>

      {/* 2 horizontal skill cards - glassmorphism + staggered animation */}
      <View className="flex-row gap-3">
        {SKILLS.map((skill, index) => {
          // Lấy màu skill theo theme hiện tại
          const skillColor = SKILL_COLORS[skill.id][theme];
          return (
            <Animated.View
              key={skill.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
              className="flex-1">
              <TouchableOpacity
                style={{
                  backgroundColor: colors.glassBg,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  borderRadius: 12,
                  padding: 16,
                }}
                activeOpacity={0.7}
                onPress={() => handleSkillPress(skill.route)}>
                {/* Icon */}
                <AppText className="text-[28px] mb-2">{skill.emoji}</AppText>
                {/* Label — dùng skill color */}
                <AppText
                  className="font-sans-bold text-sm"
                  style={{color: skillColor}}>
                  {skill.label}
                </AppText>
                {/* Thời gian */}
                <AppText
                  className="text-[11px] mt-1"
                  style={{color: colors.neutrals400}}>
                  {skill.time}
                </AppText>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

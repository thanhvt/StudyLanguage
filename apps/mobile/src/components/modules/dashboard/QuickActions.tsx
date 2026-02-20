import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';
import {SKILL_COLORS, type SkillType} from '@/config/skillColors';

// Cấu hình 3 skill cards — horizontal layout theo mockup
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
  {
    id: 'reading',
    emoji: '📖',
    label: 'Đọc',
    time: '5 phút',
    route: 'Reading',
  },
];

/**
 * Mục đích: Widget 3 skill cards nằm ngang (Nghe, Nói, Đọc) theo mockup mới
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần "Luyện tập nhanh" trên Dashboard
 *   - 3 cards nằm ngang, mỗi card có màu nền riêng theo skill
 *   - Nhấn → navigate đến feature tương ứng
 *   - Animated: mỗi card xuất hiện staggered FadeInDown
 */
export default function QuickActions() {
  const navigation = useNavigation();

  /**
   * Mục đích: Xử lý khi user nhấn vào skill card
   * Tham số đầu vào: route (string) - tên screen
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn vào 1 trong 3 skill cards
   */
  const handleSkillPress = (route: string) => {
    navigation.navigate(route as never);
  };

  return (
    <View className="px-4 py-2">
      {/* Section title */}
      <AppText className="text-foreground font-sans-bold text-base mb-3">
        ⚡ Luyện tập nhanh
      </AppText>

      {/* 3 horizontal skill cards - staggered animation */}
      <View className="flex-row gap-3">
        {SKILLS.map((skill, index) => {
          const bgColor = SKILL_COLORS[skill.id].dark;
          return (
            <Animated.View
              key={skill.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
              className="flex-1">
              <TouchableOpacity
                className="rounded-xl p-4"
                style={{
                  backgroundColor: `${bgColor}15`,
                  borderWidth: 1,
                  borderColor: `${bgColor}30`,
                }}
                activeOpacity={0.7}
                onPress={() => handleSkillPress(skill.route)}>
                {/* Icon */}
                <AppText className="text-[28px] mb-2">{skill.emoji}</AppText>
                {/* Label */}
                <AppText
                  className="font-sans-bold text-sm"
                  style={{color: bgColor}}>
                  {skill.label}
                </AppText>
                {/* Thời gian */}
                <AppText className="text-neutrals400 text-[11px] mt-1">
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

import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';

// Cấu hình 3 skill cards
const SKILLS = [
  {
    id: 'listening',
    emoji: '🎧',
    title: 'Luyện Nghe',
    subtitle: 'Nghe hội thoại AI',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    id: 'speaking',
    emoji: '🗣️',
    title: 'Luyện Nói',
    subtitle: 'Hội thoại với AI',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    id: 'reading',
    emoji: '📖',
    title: 'Luyện Đọc',
    subtitle: 'Đọc bài theo level',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
];

/**
 * Mục đích: Widget hiển thị 3 skill cards (Listening, Speaking, Reading) để truy cập nhanh
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần giữa Dashboard HomeScreen
 *   - Nhấn vào card → navigate đến feature tương ứng
 *   - Hiện tại chỉ Listening hoạt động (Phase 1C), Speaking + Reading sẽ thêm sau
 */
export default function QuickActions() {
  const navigation = useNavigation();

  /**
   * Mục đích: Xử lý khi user nhấn vào skill card
   * Tham số đầu vào: skillId (string) - ID của skill
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn vào 1 trong 3 skill cards
   */
  const handleSkillPress = (skillId: string) => {
    switch (skillId) {
      case 'listening':
        navigation.navigate('Listening');
        break;
      case 'speaking':
        navigation.navigate('Speaking');
        break;
      case 'reading':
        navigation.navigate('Reading');
        break;
    }
  };

  return (
    <View className="px-6 py-4">
      <AppText className="text-foreground font-sans-bold text-lg mb-3">
        Bắt đầu học
      </AppText>

      <View className="gap-3">
        {SKILLS.map(skill => (
          <TouchableOpacity
            key={skill.id}
            className={`flex-row items-center p-4 rounded-2xl border ${skill.bgColor} ${skill.borderColor}`}
            activeOpacity={0.7}
            onPress={() => handleSkillPress(skill.id)}>
            <View className="w-12 h-12 rounded-full items-center justify-center bg-neutrals900">
              <AppText className="text-2xl">{skill.emoji}</AppText>
            </View>
            <View className="ml-4 flex-1">
              <AppText className="text-foreground font-sans-semibold text-base">
                {skill.title}
              </AppText>
              <AppText className="text-neutrals400 text-sm mt-0.5">
                {skill.subtitle}
              </AppText>
            </View>
            <AppText className="text-neutrals500 text-xl">→</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

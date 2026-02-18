import React, {useState} from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import ScenarioCard from '@/components/speaking/ScenarioCard';

// =======================
// Types
// =======================

interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  plays: number;
  totalTurns: number;
}

// =======================
// Mock data
// =======================

const SCENARIOS: RoleplayScenario[] = [
  {
    id: '1',
    title: 'Đặt phòng khách sạn',
    description: 'Gọi điện đặt phòng, hỏi giá, dịch vụ và check-in',
    emoji: '🏨',
    difficulty: 'easy',
    plays: 234,
    totalTurns: 6,
  },
  {
    id: '2',
    title: 'Phỏng vấn xin việc',
    description: 'Giới thiệu bản thân, trả lời câu hỏi HR, thảo luận lương',
    emoji: '💼',
    difficulty: 'hard',
    plays: 567,
    totalTurns: 8,
  },
  {
    id: '3',
    title: 'Gọi món nhà hàng',
    description: 'Xem menu, gọi món, hỏi đặc biệt và thanh toán',
    emoji: '🍽️',
    difficulty: 'easy',
    plays: 389,
    totalTurns: 5,
  },
  {
    id: '4',
    title: 'Hỏi đường',
    description: 'Hỏi người bản xứ đường đến một địa điểm cụ thể',
    emoji: '🗺️',
    difficulty: 'easy',
    plays: 178,
    totalTurns: 4,
  },
  {
    id: '5',
    title: 'Khám bệnh',
    description: 'Mô tả triệu chứng, nghe bác sĩ tư vấn và hỏi thuốc',
    emoji: '🏥',
    difficulty: 'medium',
    plays: 156,
    totalTurns: 6,
  },
  {
    id: '6',
    title: 'Đàm phán hợp đồng',
    description: 'Thảo luận điều khoản, giá cả và deadline dự án',
    emoji: '📄',
    difficulty: 'hard',
    plays: 98,
    totalTurns: 8,
  },
  {
    id: '7',
    title: 'Mua sắm quần áo',
    description: 'Hỏi size, màu sắc, thử đồ và trả giá',
    emoji: '👕',
    difficulty: 'easy',
    plays: 312,
    totalTurns: 5,
  },
  {
    id: '8',
    title: 'Báo cáo dự án',
    description: 'Trình bày tiến độ, đề xuất giải pháp và nhận feedback',
    emoji: '📊',
    difficulty: 'medium',
    plays: 145,
    totalTurns: 7,
  },
];

// =======================
// Screen
// =======================

/**
 * Mục đích: Danh sách kịch bản roleplay để user chọn
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → navigate RoleplaySelect → chọn kịch bản → RoleplaySession
 */
export default function RoleplaySelectScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filtered = filter === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.difficulty === filter);

  /**
   * Mục đích: Bắt đầu roleplay với kịch bản đã chọn
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User chọn scenario → nhấn "Bắt đầu"
   */
  const handleStart = () => {
    if (!selectedId) return;
    const scenario = SCENARIOS.find(s => s.id === selectedId);
    if (scenario) {
      navigation.navigate('RoleplaySession', {
        title: scenario.title,
        totalTurns: scenario.totalTurns,
        emoji: scenario.emoji,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost" size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">🎭 Roleplay</AppText>
        </View>
        <View className="w-9" />
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-4 mb-4 gap-2">
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <AppButton
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="sm"
            style={filter === f ? {backgroundColor: speakingColor} : undefined}
            onPress={() => setFilter(f)}>
            {f === 'all' ? 'Tất cả' : f === 'easy' ? 'Dễ' : f === 'medium' ? 'TB' : 'Khó'}
          </AppButton>
        ))}
      </View>

      {/* Scenario list */}
      <FlatList
        data={filtered}
        renderItem={({item}) => (
          <ScenarioCard
            title={item.title}
            description={item.description}
            emoji={item.emoji}
            difficulty={item.difficulty}
            plays={item.plays}
            selected={selectedId === item.id}
            onPress={() => setSelectedId(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <AppText variant="body" className="text-neutrals400" raw>
              Không có kịch bản nào
            </AppText>
          </View>
        }
      />

      {/* CTA */}
      {selectedId && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-2"
          style={{backgroundColor: colors.background}}>
          <AppButton
            variant="primary" size="lg"
            style={{backgroundColor: speakingColor}}
            onPress={handleStart}>
            🎬 Bắt đầu Roleplay
          </AppButton>
        </View>
      )}
    </SafeAreaView>
  );
}

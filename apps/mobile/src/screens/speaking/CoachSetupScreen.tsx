import React, {useState} from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import SegmentedControl from '@/components/ui/SegmentedControl';
import {useColors} from '@/hooks/useColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {SKILL_COLORS} from '@/config/skillColors';
import Icon from '@/components/ui/Icon';

// =======================
// Constants
// =======================

const DURATIONS = ['5 phút', '10 phút', '15 phút'];
const DURATION_VALUES = [5, 10, 15];

const FEEDBACK_MODES = ['Hỗ trợ', 'Cân bằng', 'Thử thách'];
const FEEDBACK_VALUES = ['beginner', 'intermediate', 'advanced'] as const;

/** Gợi ý chủ đề coach */
const COACH_TOPICS = [
  '☕ Cuộc sống hàng ngày',
  '✈️ Du lịch & Trải nghiệm',
  '💼 Công việc & Sự nghiệp',
  '🎬 Phim ảnh & Giải trí',
  '🍽️ Ẩm thực quốc tế',
  '🏋️ Thể thao & Sức khỏe',
  '📱 Công nghệ & Xu hướng',
  '📚 Sách & Học tập',
];

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình setup trước khi bắt đầu Coach Session
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → "AI Coach" button → navigate CoachSetup
 *   User chọn topic, duration, feedback mode → nhấn "Bắt đầu" → navigate CoachSession
 */
export default function CoachSetupScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Store
  const {startCoachSession} = useSpeakingStore();

  // Local state
  const [topic, setTopic] = useState('');
  const [durationIndex, setDurationIndex] = useState(1); // Mặc định 10 phút
  const [feedbackIndex, setFeedbackIndex] = useState(1); // Mặc định "Cân bằng"

  /**
   * Mục đích: Bắt đầu Coach Session
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu trò chuyện"
   */
  const handleStart = () => {
    if (!topic.trim()) {
      return;
    }

    console.log('🗣️ [CoachSetup] Bắt đầu session:', {
      topic: topic.trim(),
      duration: DURATION_VALUES[durationIndex],
      feedbackMode: FEEDBACK_VALUES[feedbackIndex],
    });

    startCoachSession({
      topic: topic.trim(),
      durationMinutes: DURATION_VALUES[durationIndex],
      feedbackMode: FEEDBACK_VALUES[feedbackIndex],
    });

    navigation.navigate('CoachSession');
  };

  /**
   * Mục đích: Set topic từ chip gợi ý
   * Tham số đầu vào: suggestion (string) — text chip kèm emoji
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap chip gợi ý → set topic
   */
  const handleTopicSuggestion = (suggestion: string) => {
    const clean = suggestion.replace(/^[\p{Emoji}\s]+/u, '').trim();
    setTopic(clean);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-4">
          <AppButton
            variant="ghost"
            size="icon"
            onPress={() => navigation.goBack()}
            icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
            {''}
          </AppButton>
          <View className="flex-1 items-center">
            <AppText variant="heading3" weight="bold">
              🤖 AI Coach
            </AppText>
          </View>
          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Chủ đề */}
          <View className="mb-6">
            <AppInput
              label="Chủ đề trò chuyện"
              placeholder="Bạn muốn nói về gì hôm nay?"
              value={topic}
              onChangeText={setTopic}
              required
            />

            {/* Chip gợi ý */}
            <View className="flex-row flex-wrap gap-2 mt-3">
              {COACH_TOPICS.map(suggestion => {
                const cleanText = suggestion
                  .replace(/^[\p{Emoji}\s]+/u, '')
                  .trim();
                const isSelected = topic === cleanText;
                return (
                  <AppButton
                    key={suggestion}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => handleTopicSuggestion(suggestion)}
                    style={
                      isSelected
                        ? {backgroundColor: speakingColor}
                        : undefined
                    }>
                    {suggestion}
                  </AppButton>
                );
              })}
            </View>
          </View>

          {/* Thời lượng */}
          <View className="mb-6">
            <AppText
              variant="body"
              weight="semibold"
              className="mb-2 text-foreground"
              raw>
              ⏱️ Thời lượng
            </AppText>
            <SegmentedControl
              segments={DURATIONS}
              selectedIndex={durationIndex}
              onSelect={setDurationIndex}
            />
          </View>

          {/* Feedback Mode */}
          <View className="mb-6">
            <AppText
              variant="body"
              weight="semibold"
              className="mb-2 text-foreground"
              raw>
              📝 Chế độ sửa lỗi
            </AppText>
            <SegmentedControl
              segments={FEEDBACK_MODES}
              selectedIndex={feedbackIndex}
              onSelect={setFeedbackIndex}
            />
            <AppText
              variant="bodySmall"
              className="mt-2 text-neutrals400"
              raw>
              {feedbackIndex === 0
                ? '💚 AI sẽ gợi ý câu trả lời + sửa nhẹ nhàng'
                : feedbackIndex === 1
                  ? '💛 AI sửa lỗi vừa phải, khuyến khích thử lại'
                  : '❤️ AI sẽ sửa mọi lỗi chi tiết (pronunciation + grammar)'}
            </AppText>
          </View>

          {/* Tip card */}
          <View
            className="p-4 rounded-2xl mb-6"
            style={{backgroundColor: `${speakingColor}15`}}>
            <AppText variant="bodySmall" weight="semibold" raw>
              💡 AI Coach hoạt động như thế nào?
            </AppText>
            <AppText
              variant="bodySmall"
              className="mt-1 text-neutrals400"
              raw>
              AI sẽ trò chuyện với bạn về chủ đề đã chọn.{'\n'}
              Bạn có thể nói hoặc gõ text, AI sẽ sửa lỗi phát âm và ngữ pháp trong quá trình hội thoại.
            </AppText>
          </View>

          <View className="h-8" />
        </ScrollView>

        {/* Nút bắt đầu */}
        <View className="px-4 pb-4">
          <AppButton
            variant="primary"
            size="lg"
            className="w-full"
            style={{backgroundColor: speakingColor}}
            disabled={!topic.trim()}
            onPress={handleStart}>
            🤖 Bắt đầu trò chuyện
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

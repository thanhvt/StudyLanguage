import React, {useState} from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import SegmentedControl from '@/components/ui/SegmentedControl';
import {useColors} from '@/hooks/useColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import {SKILL_COLORS} from '@/config/skillColors';
import Icon from '@/components/ui/Icon';

// =======================
// Constants
// =======================

const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];
const LEVEL_VALUES = ['beginner', 'intermediate', 'advanced'] as const;

/** Gợi ý chủ đề nhanh */
const TOPIC_SUGGESTIONS = [
  '💼 Kinh doanh',
  '🌍 Du lịch',
  '💻 Công nghệ',
  '📚 Học thuật',
  '🍔 Ẩm thực',
  '🏥 Sức khỏe',
  '🎯 Phỏng vấn',
  '💬 Giao tiếp',
];

/**
 * Mục đích: Màn hình chọn chủ đề + level trước khi luyện nói
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   QuickActions "Luyện Nói" → navigate Speaking → ConfigScreen
 *   User chọn topic + level → nhấn "Bắt đầu" → sinh câu → navigate Practice
 */
export default function SpeakingConfigScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Zustand store
  const {
    config,
    setConfig,
    setSentences,
    setGenerating,
    setError,
    isGenerating,
  } = useSpeakingStore();

  // Local state
  const [levelIndex, setLevelIndex] = useState(
    LEVEL_VALUES.indexOf(config.level as any),
  );

  /**
   * Mục đích: Sinh câu practice rồi navigate sang PracticeScreen
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu luyện tập"
   */
  const handleStart = async () => {
    if (!config.topic.trim()) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      console.log('🗣️ [SpeakingConfig] Sinh câu practice...');
      const sentences = await speakingApi.generateSentences(config);

      if (!sentences.length) {
        setError('Không sinh được câu luyện tập. Thử lại nhé!');
        return;
      }

      setSentences(sentences);
      console.log(`✅ [SpeakingConfig] Đã sinh ${sentences.length} câu`);
      navigation.navigate('Practice');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Lỗi sinh câu luyện tập';
      console.error('❌ [SpeakingConfig] Lỗi:', message);
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Mục đích: Set topic từ chip gợi ý
   * Tham số đầu vào: suggestion (string) — text chip kèm emoji
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap chip gợi ý → set topic
   */
  const handleTopicSuggestion = (suggestion: string) => {
    const clean = suggestion.replace(/^[\p{Emoji}\s]+/u, '').trim();
    setConfig({topic: clean});
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-4">
          <AppButton
            variant="ghost"
            size="icon"
            onPress={() => navigation.goBack()}
            icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}
          >
            {''}
          </AppButton>
          <View className="flex-1 items-center">
            <AppText variant="heading3" weight="bold">
              🗣️ Luyện Nói
            </AppText>
          </View>
          <View className="w-9" />
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Chủ đề */}
          <View className="mb-6">
            <AppInput
              label="Chủ đề luyện nói"
              placeholder="Nhập chủ đề bạn muốn luyện..."
              value={config.topic}
              onChangeText={(text: string) => setConfig({topic: text})}
              required
            />

            {/* Chip gợi ý */}
            <View className="flex-row flex-wrap gap-2 mt-3">
              {TOPIC_SUGGESTIONS.map(suggestion => {
                const cleanText = suggestion
                  .replace(/^[\p{Emoji}\s]+/u, '')
                  .trim();
                const isSelected = config.topic === cleanText;
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
                    }
                  >
                    {suggestion}
                  </AppButton>
                );
              })}
            </View>
          </View>

          {/* Trình độ */}
          <View className="mb-6">
            <AppText
              variant="body"
              weight="semibold"
              className="mb-2 text-foreground"
              raw
            >
              Trình độ
            </AppText>
            <SegmentedControl
              segments={LEVELS}
              selectedIndex={levelIndex}
              onSelect={index => {
                setLevelIndex(index);
                setConfig({level: LEVEL_VALUES[index]});
              }}
            />
            <AppText
              variant="bodySmall"
              className="mt-2 text-neutrals400"
              raw
            >
              {levelIndex === 0
                ? 'Câu ngắn, từ vựng cơ bản (A1-A2)'
                : levelIndex === 1
                  ? 'Câu phức hợp, từ vựng đa dạng (B1-B2)'
                  : 'Idioms, phrasal verbs, từ vựng chuyên sâu (C1-C2)'}
            </AppText>
          </View>

          {/* Tip card */}
          <View
            className="p-4 rounded-2xl mb-6"
            style={{backgroundColor: `${speakingColor}15`}}
          >
            <AppText variant="bodySmall" weight="semibold" raw>
              💡 Mẹo luyện nói hiệu quả
            </AppText>
            <AppText
              variant="bodySmall"
              className="mt-1 text-neutrals400"
              raw
            >
              Giữ nút mic và đọc rõ ràng từng từ. AI sẽ chấm điểm phát âm
              của bạn từ 0-100 cho từng từ.
            </AppText>
          </View>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>

        {/* Nút bắt đầu */}
        <View className="px-4 pb-4">
          <AppButton
            variant="primary"
            size="lg"
            className="w-full"
            style={{backgroundColor: speakingColor}}
            disabled={!config.topic.trim()}
            loading={isGenerating}
            onPress={handleStart}
          >
            {isGenerating ? 'Đang tạo câu luyện...' : '🗣️ Bắt đầu luyện tập'}
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

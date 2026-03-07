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
import {useReadingStore} from '@/store/useReadingStore';
import {readingApi} from '@/services/api/reading';
import {useSkillColor} from '@/hooks/useSkillColor';
import Icon from '@/components/ui/Icon';

// =======================
// Constants
// =======================

const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];
const LEVEL_VALUES = ['beginner', 'intermediate', 'advanced'] as const;

const LENGTHS = ['Ngắn', 'Vừa', 'Dài'];
const LENGTH_VALUES = ['short', 'medium', 'long'] as const;

/** Gợi ý chủ đề nhanh */
const TOPIC_SUGGESTIONS = [
  '🌍 Du lịch',
  '💻 Công nghệ',
  '🍔 Ẩm thực',
  '🎬 Phim ảnh',
  '📚 Giáo dục',
  '🏥 Sức khỏe',
  '💼 Kinh doanh',
  '🌿 Môi trường',
];

/**
 * Mục đích: Màn hình cấu hình bài đọc — chọn topic, level, length rồi generate
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: User navigate từ QuickActions "Reading" hoặc Home → Reading
 *   - Chọn chủ đề (nhập tay hoặc chip nhanh)
 *   - Chọn level (SegmentedControl: Cơ bản / Trung cấp / Nâng cao)
 *   - Chọn độ dài (SegmentedControl: Ngắn / Vừa / Dài)
 *   - Nhấn "Tạo bài đọc" → gọi API → navigate sang ArticleScreen
 */
export default function ReadingConfigScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const readingColor = useSkillColor('reading');

  // Zustand store
  const {config, setConfig, setArticle, setGenerating, setError, isGenerating} =
    useReadingStore();

  // Local state cho level/length index
  const [levelIndex, setLevelIndex] = useState(
    LEVEL_VALUES.indexOf(config.level),
  );
  const [lengthIndex, setLengthIndex] = useState(
    LENGTH_VALUES.indexOf(config.length),
  );

  /**
   * Mục đích: Xử lý khi user nhấn "Tạo bài đọc"
   * Tham số đầu vào: không có
   * Tham số đầu ra: void — generate article rồi navigate
   * Khi nào sử dụng: Khi user đã chọn đủ config và nhấn button
   */
  const handleGenerate = async () => {
    if (!config.topic.trim()) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      console.log('📖 [ReadingConfig] Bắt đầu generate bài đọc...');
      const result = await readingApi.generateArticle(config);
      setArticle(result);
      console.log('✅ [ReadingConfig] Generate thành công:', result.title);
      navigation.navigate('Article');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Lỗi tạo bài đọc';
      console.error('❌ [ReadingConfig] Lỗi generate:', message);
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Mục đích: Xử lý khi user chọn chip gợi ý chủ đề
   * Tham số đầu vào: suggestion (string) — text chip (có emoji)
   * Tham số đầu ra: void — set topic vào store
   * Khi nào sử dụng: User tap 1 trong các chip gợi ý
   */
  const handleTopicSuggestion = (suggestion: string) => {
    // Bỏ emoji prefix, lấy text thuần
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
              📖 Luyện Đọc
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
              label="Chủ đề"
              placeholder="Nhập chủ đề bạn muốn đọc..."
              value={config.topic}
              onChangeText={(text: string) => setConfig({topic: text})}
              required
            />

            {/* Chip gợi ý — dùng tint style thay outline (outline invisible trên dark OLED) */}
            <View className="flex-row flex-wrap gap-2 mt-3">
              {TOPIC_SUGGESTIONS.map(suggestion => {
                const isSelected =
                  config.topic ===
                  suggestion.replace(/^[\p{Emoji}\s]+/u, '').trim();
                return (
                  <AppButton
                    key={suggestion}
                    variant={isSelected ? 'primary' : 'default'}
                    size="sm"
                    onPress={() => handleTopicSuggestion(suggestion)}
                    style={
                      isSelected
                        ? {backgroundColor: readingColor}
                        : {
                            backgroundColor: `${readingColor}12`,
                            borderWidth: 1,
                            borderColor: `${readingColor}30`,
                          }
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
                ? 'Từ vựng đơn giản, câu ngắn (A1-A2)'
                : levelIndex === 1
                  ? 'Từ vựng phong phú, câu phức hợp (B1-B2)'
                  : 'Từ vựng nâng cao, chủ đề chuyên sâu (C1-C2)'}
            </AppText>
          </View>

          {/* Độ dài */}
          <View className="mb-6">
            <AppText
              variant="body"
              weight="semibold"
              className="mb-2 text-foreground"
              raw
            >
              Độ dài bài đọc
            </AppText>
            <SegmentedControl
              segments={LENGTHS}
              selectedIndex={lengthIndex}
              onSelect={index => {
                setLengthIndex(index);
                setConfig({length: LENGTH_VALUES[index]});
              }}
            />
            <AppText
              variant="bodySmall"
              className="mt-2 text-neutrals400"
              raw
            >
              {lengthIndex === 0
                ? '~200 từ • 1-2 phút đọc'
                : lengthIndex === 1
                  ? '~400 từ • 3-4 phút đọc'
                  : '~600 từ • 5-6 phút đọc'}
            </AppText>
          </View>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>

        {/* Button Tạo bài đọc */}
        <View className="px-4 pb-4">
          <AppButton
            variant="primary"
            size="lg"
            className="w-full"
            style={{backgroundColor: readingColor}}
            disabled={!config.topic.trim()}
            loading={isGenerating}
            onPress={handleGenerate}
          >
            {isGenerating ? 'Đang tạo bài đọc...' : '📖 Tạo bài đọc'}
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

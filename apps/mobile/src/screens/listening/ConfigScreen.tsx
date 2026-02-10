import React, {useState} from 'react';
import {Alert, ScrollView, TouchableOpacity, View} from 'react-native';
import {AppButton, AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi, type ScenarioType} from '@/services/api/listening';

// Kịch bản nhanh
const SCENARIOS: {type: ScenarioType; emoji: string; label: string}[] = [
  {type: 'restaurant', emoji: '🍽️', label: 'Nhà hàng'},
  {type: 'hotel', emoji: '🏨', label: 'Khách sạn'},
  {type: 'shopping', emoji: '🛍️', label: 'Mua sắm'},
  {type: 'airport', emoji: '✈️', label: 'Sân bay'},
  {type: 'hospital', emoji: '🏥', label: 'Bệnh viện'},
  {type: 'job_interview', emoji: '💼', label: 'Phỏng vấn'},
  {type: 'phone_call', emoji: '📞', label: 'Gọi điện'},
  {type: 'small_talk', emoji: '💬', label: 'Giao tiếp'},
];

// Tuỳ chọn thời lượng
const DURATIONS = [5, 10, 15] as const;

// Tuỳ chọn level
const LEVELS = [
  {value: 'beginner' as const, label: 'Cơ bản', emoji: '🌱'},
  {value: 'intermediate' as const, label: 'Trung cấp', emoji: '🌿'},
  {value: 'advanced' as const, label: 'Nâng cao', emoji: '🌳'},
];

/**
 * Mục đích: Màn hình cấu hình bài nghe trước khi generate
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ListeningStack → màn hình đầu tiên khi user chọn "Luyện Nghe"
 *   - User chọn: topic/scenario, duration, level
 *   - Nhấn "Tạo bài nghe" → gọi API → navigate đến PlayerScreen
 */
export default function ListeningConfigScreen({
  navigation,
}: {
  navigation: any;
}) {
  const config = useListeningStore(state => state.config);
  const setConfig = useListeningStore(state => state.setConfig);
  const setConversation = useListeningStore(state => state.setConversation);
  const isGenerating = useListeningStore(state => state.isGenerating);
  const setGenerating = useListeningStore(state => state.setGenerating);

  const [topicInput, setTopicInput] = useState('');

  /**
   * Mục đích: Tạo bài nghe từ chủ đề tự do
   * Tham số đầu vào: không có (dùng config từ store)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Tạo bài nghe" sau khi nhập topic
   */
  const handleGenerate = async () => {
    if (!topicInput.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chủ đề');
      return;
    }

    try {
      setGenerating(true);
      setConfig({topic: topicInput.trim()});

      const result = await listeningApi.generateConversation({
        ...config,
        topic: topicInput.trim(),
      });

      setConversation(result);
      navigation.navigate('Player');
    } catch (error: any) {
      console.error('❌ [Listening] Lỗi tạo bài nghe:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể tạo bài nghe. Vui lòng thử lại.',
      );
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Mục đích: Tạo bài nghe từ kịch bản có sẵn
   * Tham số đầu vào: scenarioType (ScenarioType)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào 1 trong 8 scenario chips
   */
  const handleScenario = async (scenarioType: ScenarioType) => {
    try {
      setGenerating(true);
      const result = await listeningApi.generateScenario(scenarioType);
      setConversation(result);
      navigation.navigate('Player');
    } catch (error: any) {
      console.error('❌ [Listening] Lỗi tạo scenario:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể tạo bài nghe.',
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{paddingBottom: 40}}>
      <View className="px-6 pt-safe-offset-4">
        <AppText
          variant={'heading1'}
          className="text-2xl font-sans-bold text-foreground">
          🎧 Luyện Nghe
        </AppText>
        <AppText className="text-neutrals400 mt-1">
          Chọn chủ đề và bắt đầu nghe hội thoại AI
        </AppText>
      </View>

      {/* Kịch bản nhanh */}
      <View className="px-6 mt-6">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          Kịch bản nhanh
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {SCENARIOS.map(scenario => (
            <TouchableOpacity
              key={scenario.type}
              className="bg-neutrals900 rounded-2xl px-4 py-3 flex-row items-center"
              activeOpacity={0.7}
              disabled={isGenerating}
              onPress={() => handleScenario(scenario.type)}>
              <AppText className="mr-2">{scenario.emoji}</AppText>
              <AppText className="text-foreground text-sm">
                {scenario.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hoặc nhập chủ đề */}
      <View className="px-6 mt-6">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          Hoặc nhập chủ đề
        </AppText>
        <View className="bg-neutrals900 rounded-2xl px-4 py-3">
          <AppText className="text-neutrals500 text-sm mb-1">
            Ví dụ: ordering coffee, travel tips, job interview...
          </AppText>
          {/* TextInput placeholder - sử dụng AppInput khi có */}
          <View className="border border-neutrals800 rounded-xl mt-2">
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => {
                // TODO: Dùng AppInput component
                Alert.prompt(
                  'Nhập chủ đề',
                  'Nhập chủ đề hội thoại bằng tiếng Anh',
                  (text: string) => setTopicInput(text),
                  'plain-text',
                  topicInput,
                );
              }}>
              <AppText
                className={
                  topicInput
                    ? 'text-foreground text-base'
                    : 'text-neutrals500 text-base'
                }>
                {topicInput || 'Nhập chủ đề...'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Thời lượng */}
      <View className="px-6 mt-6">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          Thời lượng
        </AppText>
        <View className="flex-row gap-3">
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d}
              className={`flex-1 py-3 rounded-2xl items-center border ${
                config.durationMinutes === d
                  ? 'bg-primary/10 border-primary'
                  : 'bg-neutrals900 border-neutrals800'
              }`}
              onPress={() => setConfig({durationMinutes: d})}>
              <AppText
                className={`font-sans-bold text-base ${
                  config.durationMinutes === d
                    ? 'text-primary'
                    : 'text-foreground'
                }`}>
                {d} phút
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Level */}
      <View className="px-6 mt-6">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          Trình độ
        </AppText>
        <View className="flex-row gap-3">
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.value}
              className={`flex-1 py-3 rounded-2xl items-center border ${
                config.level === l.value
                  ? 'bg-primary/10 border-primary'
                  : 'bg-neutrals900 border-neutrals800'
              }`}
              onPress={() => setConfig({level: l.value})}>
              <AppText className="text-lg mb-1">{l.emoji}</AppText>
              <AppText
                className={`text-sm ${
                  config.level === l.value
                    ? 'text-primary font-sans-bold'
                    : 'text-foreground'
                }`}>
                {l.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tiếng Việt toggle */}
      <View className="px-6 mt-6">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
          onPress={() =>
            setConfig({includeVietnamese: !config.includeVietnamese})
          }>
          <View className="flex-row items-center">
            <AppText className="mr-2">🇻🇳</AppText>
            <AppText className="text-foreground">Kèm bản dịch tiếng Việt</AppText>
          </View>
          <Icon
            name={config.includeVietnamese ? 'ToggleRight' : 'ToggleLeft'}
            className={`w-8 h-8 ${
              config.includeVietnamese ? 'text-primary' : 'text-neutrals500'
            }`}
          />
        </TouchableOpacity>
      </View>

      {/* Nút tạo bài nghe */}
      <View className="px-6 mt-8">
        <AppButton
          variant="primary"
          className="w-full rounded-2xl py-4"
          onPress={handleGenerate}
          disabled={isGenerating || !topicInput.trim()}>
          <AppText className="text-white font-sans-bold text-lg">
            {isGenerating ? 'Đang tạo bài nghe...' : '🎧 Tạo bài nghe'}
          </AppText>
        </AppButton>
      </View>
    </ScrollView>
  );
}

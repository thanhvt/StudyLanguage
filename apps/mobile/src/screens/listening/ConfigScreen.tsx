import React, {useState} from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppButton, AppText, Switch} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi} from '@/services/api/listening';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';
import {useColors} from '@/hooks/useColors';
import {getTotalScenarios} from '@/data/topic-data';

// Components mới
import {
  TopicPicker,
  CustomScenarioInput,
  DurationSelector,
  SpeakersSelector,
  KeywordsInput,
  AdvancedOptionsSheet,
} from '@/components/listening';

/**
 * Mục đích: Màn hình cấu hình bài nghe — redesigned để match web-v2 + design doc
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ListeningStack → màn hình đầu tiên khi user chọn "Luyện Nghe"
 *   - User chọn: scenario từ TopicPicker hoặc nhập topic tự do
 *   - Config: duration, speakers, keywords, level, voice, multi-talker
 *   - Nhấn "Bắt đầu nghe" → gọi API → navigate đến PlayerScreen
 */
export default function ListeningConfigScreen({
  navigation,
}: {
  navigation: any;
}) {
  const config = useListeningStore(state => state.config);
  const setConfig = useListeningStore(state => state.setConfig);
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const setConversation = useListeningStore(state => state.setConversation);
  const setSelectedTopic = useListeningStore(state => state.setSelectedTopic);
  const isGenerating = useListeningStore(state => state.isGenerating);
  const setGenerating = useListeningStore(state => state.setGenerating);

  // Local state
  const [topicInput, setTopicInput] = useState('');
  const [showCustomScenario, setShowCustomScenario] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [randomVoice, setRandomVoice] = useState(true);
  const [multiTalker, setMultiTalker] = useState(false);

  const {showError, showWarning, showSuccess} = useToast();
  const {showLoading, hideLoading} = useDialog();
  const colors = useColors();

  // Tổng scenarios
  const totalScenarios = getTotalScenarios();

  /**
   * Mục đích: Lấy topic cuối cùng để gửi API (ưu tiên: selectedTopic > topicInput)
   * Tham số đầu vào: không
   * Tham số đầu ra: string | null
   * Khi nào sử dụng: Trước khi generate, xác định topic
   */
  const getFinalTopic = (): string | null => {
    if (selectedTopic) {
      return `${selectedTopic.name}: ${selectedTopic.description}`;
    }
    if (topicInput.trim()) {
      return topicInput.trim();
    }
    return null;
  };

  /**
   * Mục đích: Tạo bài nghe từ config hiện tại
   * Tham số đầu vào: không (dùng config từ store + topic)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu nghe"
   */
  const handleGenerate = async () => {
    const topic = getFinalTopic();

    if (!topic) {
      showWarning(
        'Chưa chọn chủ đề',
        'Vui lòng chọn kịch bản hoặc nhập chủ đề hội thoại',
      );
      return;
    }

    try {
      setGenerating(true);
      showLoading('Đang tạo bài nghe...', 'AI đang tạo hội thoại cho bạn 🎧');

      const result = await listeningApi.generateConversation({
        ...config,
        topic,
      });

      hideLoading();
      setConversation(result);
      showSuccess('Tạo bài nghe thành công!', 'Bắt đầu nghe nào 🎧');
      navigation.navigate('Player');
    } catch (error: any) {
      hideLoading();
      console.error('❌ [Listening] Lỗi tạo bài nghe:', error);
      showError(
        'Không thể tạo bài nghe',
        error?.message || 'Vui lòng kiểm tra kết nối mạng và thử lại',
      );
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Mục đích: Xử lý Quick Use từ CustomScenarioInput
   * Tham số đầu vào: name, description (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: CustomScenarioInput → "Sử dụng ngay"
   */
  const handleCustomQuickUse = (name: string, description: string) => {
    setShowCustomScenario(false);
    setSelectedTopic(
      {id: `custom-${Date.now()}`, name, description},
      'custom',
      '',
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{paddingBottom: 40}}
      keyboardShouldPersistTaps="handled">
      {/* ======================== */}
      {/* Header */}
      {/* ======================== */}
      <View className="px-6 pt-safe-offset-4">
        <AppText
          variant={'heading1'}
          className="text-2xl font-sans-bold text-foreground">
          🎧 Luyện Nghe
        </AppText>
        <AppText className="text-neutrals400 mt-1">
          {totalScenarios}+ kịch bản • AI-powered
        </AppText>
      </View>

      {/* ======================== */}
      {/* Topic Picker */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          📋 Chọn kịch bản
        </AppText>

        {showCustomScenario ? (
          <View>
            <TouchableOpacity
              className="flex-row items-center mb-3"
              onPress={() => setShowCustomScenario(false)}
              activeOpacity={0.7}>
              <Icon name="ArrowLeft" className="w-4 h-4 text-primary mr-2" />
              <AppText className="text-primary text-sm">
                Quay lại danh sách
              </AppText>
            </TouchableOpacity>
            <CustomScenarioInput
              onQuickUse={handleCustomQuickUse}
              disabled={isGenerating}
            />
          </View>
        ) : (
          <TopicPicker
            disabled={isGenerating}
            onCustomPress={() => setShowCustomScenario(true)}
          />
        )}
      </View>

      {/* ======================== */}
      {/* Hoặc nhập chủ đề tự do */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          📝 Hoặc nhập chủ đề tự do
        </AppText>
        <View className="bg-neutrals900 rounded-2xl px-4 py-3">
          <TextInput
            className="border border-neutrals800 rounded-xl px-4 py-3 text-base"
            style={{color: colors.foreground}}
            placeholder="vd: ordering coffee, travel tips..."
            placeholderTextColor={colors.neutrals500}
            value={topicInput}
            onChangeText={text => {
              setTopicInput(text);
              // Nếu đang nhập, bỏ chọn scenario
              if (text.trim() && selectedTopic) {
                setSelectedTopic(null);
              }
            }}
            returnKeyType="done"
            editable={!isGenerating}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* ======================== */}
      {/* Thời lượng */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          ⏱️ Thời lượng
        </AppText>
        <DurationSelector
          value={config.durationMinutes}
          onChange={d => setConfig({durationMinutes: d})}
          disabled={isGenerating}
        />
      </View>

      {/* ======================== */}
      {/* Số người nói */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          👥 Số người nói
        </AppText>
        <SpeakersSelector
          value={config.numSpeakers ?? 2}
          onChange={n => setConfig({numSpeakers: n})}
          disabled={isGenerating}
        />
      </View>

      {/* ======================== */}
      {/* Từ khóa (optional) */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <AppText className="text-foreground font-sans-semibold text-base mb-3">
          🔑 Từ khóa{' '}
          <AppText className="text-neutrals500 text-sm font-sans-regular">
            (tuỳ chọn)
          </AppText>
        </AppText>
        <KeywordsInput
          value={config.keywords ?? ''}
          onChange={text => setConfig({keywords: text})}
          disabled={isGenerating}
        />
      </View>

      {/* ======================== */}
      {/* Tiếng Việt toggle */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
          onPress={() =>
            setConfig({includeVietnamese: !config.includeVietnamese})
          }
          disabled={isGenerating}
          activeOpacity={0.7}>
          <View className="flex-row items-center">
            <AppText className="mr-2">🇻🇳</AppText>
            <AppText className="text-foreground">
              Kèm bản dịch tiếng Việt
            </AppText>
          </View>
          <Switch
            value={config.includeVietnamese ?? true}
            onValueChange={v => setConfig({includeVietnamese: v})}
            disabled={isGenerating}
          />
        </TouchableOpacity>
      </View>

      {/* ======================== */}
      {/* Tuỳ chọn nâng cao */}
      {/* ======================== */}
      <View className="px-6 mt-5">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
          onPress={() => setShowAdvanced(true)}
          disabled={isGenerating}
          activeOpacity={0.7}>
          <View className="flex-row items-center">
            <AppText className="mr-2">⚙️</AppText>
            <View>
              <AppText className="text-foreground">Tuỳ chọn nâng cao</AppText>
              <AppText className="text-neutrals500 text-xs mt-0.5">
                Trình độ: {config.level === 'beginner' ? '🌱 Cơ bản' : config.level === 'intermediate' ? '🌿 Trung cấp' : '🌳 Nâng cao'}
              </AppText>
            </View>
          </View>
          <Icon name="ChevronRight" className="w-5 h-5 text-neutrals500" />
        </TouchableOpacity>
      </View>

      {/* ======================== */}
      {/* Nút Bắt đầu nghe */}
      {/* ======================== */}
      <View className="px-6 mt-8">
        <AppButton
          variant="primary"
          className="w-full rounded-2xl py-4"
          onPress={handleGenerate}
          disabled={isGenerating}
          loading={isGenerating}>
          🎧 Bắt đầu nghe
        </AppButton>

        {/* Hint cho user */}
        {!selectedTopic && !topicInput.trim() && (
          <AppText className="text-neutrals500 text-xs text-center mt-2">
            Chọn kịch bản hoặc nhập chủ đề để bắt đầu
          </AppText>
        )}
      </View>

      {/* ======================== */}
      {/* Advanced Options Bottom Sheet */}
      {/* ======================== */}
      <AdvancedOptionsSheet
        visible={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        level={config.level}
        onLevelChange={l => setConfig({level: l})}
        randomVoice={randomVoice}
        onRandomVoiceChange={setRandomVoice}
        multiTalker={multiTalker}
        onMultiTalkerChange={setMultiTalker}
        disabled={isGenerating}
      />
    </ScrollView>
  );
}

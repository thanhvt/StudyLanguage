import React, {useRef, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {getTotalScenarios} from '@/data/topic-data';

// Components listening
import {
  CustomScenarioInput,
  DurationSelector,
  SpeakersSelector,
  KeywordsInput,
  AdvancedOptionsSheet,
  TopicPickerModal,
  CollapsibleSection,
} from '@/components/listening';

/**
 * Mục đích: Màn hình cấu hình bài nghe — redesign v2 với UX tối ưu
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ListeningStack → màn hình đầu tiên khi user chọn "Luyện Nghe"
 *   - Layout: TopicPicker modal, compact config, collapsible optional, sticky CTA
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
  const randomVoice = useListeningStore(state => state.randomVoice);
  const setRandomVoice = useListeningStore(state => state.setRandomVoice);
  const voicePerSpeaker = useListeningStore(state => state.voicePerSpeaker);
  const setVoicePerSpeaker = useListeningStore(state => state.setVoicePerSpeaker);
  const multiTalker = useListeningStore(state => state.multiTalker);
  const setMultiTalker = useListeningStore(state => state.setMultiTalker);
  const multiTalkerPairIndex = useListeningStore(state => state.multiTalkerPairIndex);
  const setMultiTalkerPairIndex = useListeningStore(state => state.setMultiTalkerPairIndex);

  // Local state
  const [topicInput, setTopicInput] = useState('');
  const [showCustomScenario, setShowCustomScenario] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const {showError, showWarning} = useToast();
  const {showLoading, hideLoading} = useDialog();
  const colors = useColors();
  const haptic = useHaptic();
  const insets = useInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Theo dõi trạng thái keyboard để ẩn sticky footer khi mở
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  React.useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Tổng scenarios
  const totalScenarios = getTotalScenarios();

  // Sticky footer height: button(56) + padding(32) + safeBottom
  const footerHeight = 56 + 32 + Math.max(insets.bottom, 16);

  // Accent colors cho visual differentiation
  const topicAccent = colors.skillListening; // Indigo
  const ctaGlowColor = colors.primary;

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
      haptic.medium();
      showLoading('Đang tạo bài nghe...', 'AI đang tạo hội thoại cho bạn 🎧');

      const result = await listeningApi.generateConversation({
        ...config,
        topic,
      });

      hideLoading();
      setConversation(result);
      haptic.success();
      // Lưu ý: Không show success toast ở đây vì navigate ngay sẽ che mất
      // Chuyển sang PlayerScreen là feedback rõ ràng nhất cho user
      navigation.navigate('Player');
    } catch (error: any) {
      hideLoading();
      haptic.error();
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

  // Kiểm tra xem có đủ thông tin topic chưa
  const hasValidTopic = !!selectedTopic || !!topicInput.trim();

  return (
    <View className="flex-1 bg-background">
      {/* ======================== */}
      {/* KeyboardAvoidingView cho input không bị che */}
      {/* ======================== */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{paddingBottom: footerHeight + 20}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* ======================== */}
          {/* Header với visual accent */}
          {/* ======================== */}
          <View className="px-6 pt-safe-offset-4 mb-5">
            <View className="flex-row items-center">
              <View
                className="rounded-2xl p-2.5 mr-3"
                style={{backgroundColor: `${topicAccent}20`}}>
                <AppText className="text-2xl">🎧</AppText>
              </View>
              <View className="flex-1">
                <AppText
                  variant={'heading1'}
                  className="text-2xl font-sans-bold text-foreground">
                  Luyện Nghe
                </AppText>
                <AppText className="text-neutrals400 text-sm mt-0.5">
                  {totalScenarios}+ kịch bản • AI-powered
                </AppText>
              </View>
            </View>
          </View>

          {/* ======================== */}
          {/* Section 1: Chọn kịch bản — với accent indigo */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <SectionCard
              accentColor={topicAccent}
              shadowColor={topicAccent}>
              {/* Section label với accent dot */}
              <View className="flex-row items-center mb-3">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{backgroundColor: topicAccent}}
                />
                <AppText
                  className="font-sans-semibold text-base"
                  style={{color: topicAccent}}>
                  Kịch bản hội thoại
                </AppText>
              </View>

              {/* Nút mở TopicPicker Modal */}
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-2xl px-4 py-3.5 border"
                style={{
                  borderColor: selectedTopic ? topicAccent : colors.neutrals800,
                  backgroundColor: selectedTopic
                    ? `${topicAccent}08`
                    : colors.neutrals900,
                }}
                onPress={() => {
                  haptic.light();
                  setShowTopicModal(true);
                }}
                disabled={isGenerating}
                activeOpacity={0.7}
                accessibilityLabel={
                  selectedTopic
                    ? `Đã chọn: ${selectedTopic.name}. Nhấn để đổi`
                    : 'Chọn kịch bản hội thoại'
                }
                accessibilityRole="button">
                <View className="flex-row items-center flex-1 mr-3">
                  {selectedTopic ? (
                    <View className="flex-1">
                      <AppText
                        className="font-sans-bold text-base"
                        style={{color: topicAccent}}>
                        {selectedTopic.name}
                      </AppText>
                      <AppText
                        className="text-neutrals400 text-xs mt-0.5"
                        numberOfLines={1}>
                        {selectedTopic.description}
                      </AppText>
                    </View>
                  ) : (
                    <AppText className="text-neutrals400 text-base">
                      Chọn từ {totalScenarios}+ kịch bản...
                    </AppText>
                  )}
                </View>
                <Icon
                  name="ChevronRight"
                  className="w-5 h-5 text-neutrals400"
                />
              </TouchableOpacity>

              {/* Or-divider styled */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-[1px] bg-border" />
                <AppText className="text-neutrals400 text-xs mx-3">
                  hoặc nhập chủ đề tự do
                </AppText>
                <View className="flex-1 h-[1px] bg-border" />
              </View>

              {/* Free text input */}
              <TextInput
                className="bg-neutrals900 rounded-xl px-4 py-3 text-base border border-neutrals800"
                style={{color: '#1a1a1a'}}
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
                accessibilityLabel="Nhập chủ đề hội thoại tự do"
              />
            </SectionCard>
          </View>

          {/* ======================== */}
          {/* Section 2: Cấu hình cơ bản — compact inline rows */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <SectionCard>
              <View className="gap-4">
                <DurationSelector
                  value={config.durationMinutes}
                  onChange={d => setConfig({durationMinutes: d})}
                  disabled={isGenerating}
                />
                <SpeakersSelector
                  value={config.numSpeakers ?? 2}
                  onChange={n => setConfig({numSpeakers: n})}
                  disabled={isGenerating}
                />
              </View>
            </SectionCard>
          </View>

          {/* ======================== */}
          {/* Section 3: Tuỳ chỉnh thêm (Collapsible) */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <SectionCard>
              <CollapsibleSection
                title="Thêm tuỳ chỉnh"
                icon="🎛️"
                defaultExpanded={false}>
                {/* Từ khóa */}
                <View className="mb-4">
                  <AppText className="text-foreground font-sans-medium text-sm mb-2">
                    🔑 Từ khóa{' '}
                    <AppText className="text-neutrals400 text-xs">
                      (tuỳ chọn)
                    </AppText>
                  </AppText>
                  <KeywordsInput
                    value={config.keywords ?? ''}
                    onChange={text => setConfig({keywords: text})}
                    disabled={isGenerating}
                    onFocus={() => {
                      // Cuộn xuống để input không bị keyboard che
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({animated: true});
                      }, 300);
                    }}
                  />
                </View>

                {/* Tiếng Việt toggle */}
                <View className="mb-4">
                  <TouchableOpacity
                    className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
                    onPress={() => {
                      haptic.light();
                      setConfig({
                        includeVietnamese: !config.includeVietnamese,
                      });
                    }}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                    accessibilityLabel={`Kèm bản dịch tiếng Việt, ${config.includeVietnamese ? 'bật' : 'tắt'}`}
                    accessibilityRole="switch">
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

                {/* Custom Scenario */}
                {showCustomScenario ? (
                  <CustomScenarioInput
                    onQuickUse={handleCustomQuickUse}
                    onClose={() => setShowCustomScenario(false)}
                    disabled={isGenerating}
                  />
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-center bg-neutrals900 rounded-2xl px-4 py-3"
                    onPress={() => {
                      haptic.light();
                      setShowCustomScenario(true);
                    }}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                    accessibilityLabel="Tạo kịch bản tuỳ chỉnh"
                    accessibilityRole="button">
                    <Icon name="Plus" className="w-4 h-4 text-primary mr-2" />
                    <AppText className="text-primary text-sm font-sans-medium">
                      Tạo kịch bản tuỳ chỉnh
                    </AppText>
                  </TouchableOpacity>
                )}
              </CollapsibleSection>
            </SectionCard>
          </View>

          {/* ======================== */}
          {/* Section 4: Tuỳ chọn nâng cao (bottom sheet) */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between bg-surface-raised rounded-2xl px-4 py-3.5 border border-border"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 1,
              }}
              onPress={() => {
                haptic.light();
                setShowAdvanced(true);
              }}
              disabled={isGenerating}
              activeOpacity={0.7}
              accessibilityLabel={`Tuỳ chọn nâng cao. Trình độ: ${config.level === 'beginner' ? 'Cơ bản' : config.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}`}
              accessibilityRole="button">
              <View className="flex-row items-center">
                <AppText className="mr-2">⚙️</AppText>
                <View>
                  <AppText className="text-foreground font-sans-medium">
                    Tuỳ chọn nâng cao
                  </AppText>
                  <AppText className="text-neutrals400 text-xs mt-0.5">
                    Trình độ:{' '}
                    {config.level === 'beginner'
                      ? '🌱 Cơ bản'
                      : config.level === 'intermediate'
                        ? '🌿 Trung cấp'
                        : '🌳 Nâng cao'}
                  </AppText>
                </View>
              </View>
              <Icon name="ChevronRight" className="w-5 h-5 text-neutrals400" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================== */}
      {/* Sticky Footer — ẩn khi keyboard mở để không tạo vùng trắng */}
      {!keyboardVisible && (
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pt-3 border-t border-border bg-background/95"
        style={{paddingBottom: Math.max(insets.bottom, 16)}}>
        <View
          style={
            hasValidTopic
              ? {
                  shadowColor: ctaGlowColor,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 8,
                }
              : undefined
          }>
          <AppButton
            variant="primary"
            size="lg"
            className="w-full rounded-2xl"
            onPress={handleGenerate}
            disabled={isGenerating || !hasValidTopic}
            loading={isGenerating}
            accessibilityLabel={
              hasValidTopic
                ? 'Bắt đầu nghe'
                : 'Chưa chọn chủ đề, không thể bắt đầu'
            }>
            🎧 Bắt đầu nghe
          </AppButton>
        </View>

        {/* Hint */}
        {!hasValidTopic && (
          <AppText className="text-neutrals400 text-xs text-center mt-2">
            Chọn kịch bản hoặc nhập chủ đề để bắt đầu
          </AppText>
        )}
      </View>
      )}

      {/* ======================== */}
      {/* TopicPicker Modal */}
      {/* ======================== */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        disabled={isGenerating}
      />

      {/* ======================== */}
      {/* Advanced Options Bottom Sheet */}
      {/* ======================== */}
      <AdvancedOptionsSheet
        visible={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        level={config.level}
        onLevelChange={l => setConfig({level: l})}
        numSpeakers={config.numSpeakers ?? 2}
        randomVoice={randomVoice}
        onRandomVoiceChange={setRandomVoice}
        voicePerSpeaker={voicePerSpeaker}
        onVoicePerSpeakerChange={setVoicePerSpeaker}
        multiTalker={multiTalker}
        onMultiTalkerChange={setMultiTalker}
        multiTalkerPairIndex={multiTalkerPairIndex}
        onMultiTalkerPairIndexChange={setMultiTalkerPairIndex}
        disabled={isGenerating}
      />
    </View>
  );
}

// ========================
// SectionCard — card wrapper với shadow depth + optional accent
// ========================

interface SectionCardProps {
  children: React.ReactNode;
  /** Mau accent cho left border indicator */
  accentColor?: string;
  /** Màu shadow riêng cho card */
  shadowColor?: string;
}

/**
 * Mục đích: Card container cho mỗi config section, tạo visual depth
 * Tham số đầu vào: children, accentColor (optional), shadowColor (optional)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → wrap mỗi section (Topic, Duration/Speakers, Optional)
 */
function SectionCard({children, accentColor, shadowColor}: SectionCardProps) {
  return (
    <View
      className="bg-surface-raised rounded-2xl p-4 border border-border overflow-hidden"
      style={{
        shadowColor: shadowColor || '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: shadowColor ? 0.15 : 0.06,
        shadowRadius: shadowColor ? 8 : 4,
        elevation: 2,
      }}>
      {/* Left accent bar */}
      {accentColor && (
        <View
          className="absolute left-0 top-3 bottom-3 rounded-r-full"
          style={{
            width: 3,
            backgroundColor: accentColor,
            opacity: 0.6,
          }}
        />
      )}
      {children}
    </View>
  );
}

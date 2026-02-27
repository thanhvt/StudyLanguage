import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {AppText, Switch} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import Slider from '@react-native-community/slider';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi, type VoiceInfo, type MultiTalkerPair} from '@/services/api/listening';
import {useHaptic} from '@/hooks/useHaptic';
import {useColors} from '@/hooks/useColors';
import {useToast} from '@/components/ui/ToastProvider';
import {useInsets} from '@/hooks/useInsets';

// ========================
// Màu sắc
// ========================
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';

// ========================
// Emotion chips
// ========================
const EMOTIONS = [
  {id: 'default', label: 'Mặc định', emoji: '😐'},
  {id: 'cheerful', label: 'Vui', emoji: '😄'},
  {id: 'friendly', label: 'Thân thiện', emoji: '🤗'},
  {id: 'excited', label: 'Phấn khích', emoji: '🤩'},
  {id: 'sad', label: 'Buồn', emoji: '😢'},
  {id: 'angry', label: 'Giận', emoji: '😠'},
  {id: 'whispering', label: 'Thì thầm', emoji: '🤫'},
];

// Preview sample text
const PREVIEW_TEXT = 'Hello, how are you today? Let me tell you something interesting about this topic.';

interface TtsSettingsSheetProps {
  /** Hiển thị bottom sheet */
  visible: boolean;
  /** Callback khi đóng */
  onClose: () => void;
  /** Số speakers hiện tại (2,3,4) */
  numSpeakers: number;
}

/**
 * Mục đích: Bottom sheet cài đặt giọng đọc TTS (Azure)
 * Tham số đầu vào: visible, onClose, numSpeakers
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → nhấn gear icon / PlayerScreen → settings
 *   - Hiển thị danh sách voices với nút preview
 *   - Gán voice cho từng speaker (A, B, C, D)
 *   - Chọn emotion style
 *   - Toggle random voice, random emotion, multi-talker
 *   - Advanced: Pitch / Rate sliders
 */
export default function TtsSettingsSheet({
  visible,
  onClose,
  numSpeakers,
}: TtsSettingsSheetProps) {
  // ========================
  // Store
  // ========================
  const randomVoice = useListeningStore(state => state.randomVoice);
  const setRandomVoice = useListeningStore(state => state.setRandomVoice);
  const voicePerSpeaker = useListeningStore(state => state.voicePerSpeaker);
  const setVoicePerSpeaker = useListeningStore(state => state.setVoicePerSpeaker);
  const multiTalker = useListeningStore(state => state.multiTalker);
  const setMultiTalker = useListeningStore(state => state.setMultiTalker);
  const multiTalkerPairIndex = useListeningStore(state => state.multiTalkerPairIndex);
  const setMultiTalkerPairIndex = useListeningStore(state => state.setMultiTalkerPairIndex);
  const ttsEmotion = useListeningStore(state => state.ttsEmotion);
  const setTtsEmotion = useListeningStore(state => state.setTtsEmotion);
  const ttsPitch = useListeningStore(state => state.ttsPitch);
  const setTtsPitch = useListeningStore(state => state.setTtsPitch);
  const ttsRate = useListeningStore(state => state.ttsRate);
  const setTtsRate = useListeningStore(state => state.setTtsRate);
  const randomEmotion = useListeningStore(state => state.randomEmotion);
  const setRandomEmotion = useListeningStore(state => state.setRandomEmotion);

  // ========================
  // Local state
  // ========================
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [multiTalkerPairs, setMultiTalkerPairs] = useState<MultiTalkerPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const haptic = useHaptic();
  const colors = useColors();
  const {showError} = useToast();
  const insets = useInsets();

  // ========================
  // Fetch voices khi mở sheet
  // ========================
  useEffect(() => {
    if (!visible) {return;}
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await listeningApi.fetchVoices('azure');
        setVoices(result.voices || []);
        setMultiTalkerPairs(result.multiTalker || []);
      } catch (err) {
        console.error('❌ [TtsSettings] Lỗi fetch voices:', err);
        showError('Không thể tải danh sách giọng', 'Thử lại sau');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [visible, showError]);

  /**
   * Mục đích: Preview 1 giọng đọc
   * Tham số đầu vào: voiceId (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút ▶ trên voice item
   */
  const handlePreview = useCallback(async (voiceId: string) => {
    if (previewingVoice) {return;}
    setPreviewingVoice(voiceId);
    haptic.light();
    try {
      await listeningApi.previewVoice(
        PREVIEW_TEXT,
        voiceId,
        ttsEmotion !== 'default' ? ttsEmotion : undefined,
      );
      // Audio playback sẽ được xử lý riêng bằng audio player
      console.log('✅ [TtsSettings] Preview giọng:', voiceId);
    } catch (err) {
      console.error('❌ [TtsSettings] Lỗi preview:', err);
    } finally {
      setPreviewingVoice(null);
    }
  }, [previewingVoice, ttsEmotion, haptic]);

  /**
   * Mục đích: Gán voice cho 1 speaker cụ thể
   * Tham số đầu vào: speakerLabel (string), voiceId (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User chọn voice từ dropdown cho Speaker A/B/C/D
   */
  const assignVoiceToSpeaker = useCallback((speakerLabel: string, voiceId: string) => {
    const newMap = {...voicePerSpeaker, [speakerLabel]: voiceId};
    setVoicePerSpeaker(newMap);
    haptic.light();
  }, [voicePerSpeaker, setVoicePerSpeaker, haptic]);

  // Speaker labels based on numSpeakers
  const speakerLabels = Array.from({length: numSpeakers}, (_, i) =>
    String.fromCharCode(65 + i), // A, B, C, D
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-background rounded-t-3xl border-t border-border max-h-[85%]"
          style={{paddingBottom: Math.max(insets.bottom, 20)}}>

          {/* Handle bar */}
          <View className="items-center pt-3 pb-4">
            <View className="w-10 h-1 rounded-full bg-neutrals600" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 mb-4">
            <AppText className="text-foreground font-sans-bold text-xl">
              Cài đặt giọng đọc
            </AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 -mr-2"
              accessibilityLabel="Đóng"
              accessibilityRole="button">
              <Icon name="X" className="w-5 h-5 text-neutrals400" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-6"
            showsVerticalScrollIndicator={false}>

            {/* ======================== */}
            {/* VOICE LIST */}
            {/* ======================== */}
            <AppText className="text-neutrals400 text-xs font-sans-medium mb-2 uppercase tracking-wider">
              Giọng đọc
            </AppText>

            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={LISTENING_BLUE} />
                <AppText className="text-neutrals400 text-sm mt-3">
                  Đang tải danh sách giọng...
                </AppText>
              </View>
            ) : (
              <View className="gap-2 mb-6">
                {voices.map(voice => (
                  <View
                    key={voice.id}
                    className="flex-row items-center bg-neutrals900 rounded-xl px-4 py-3">
                    {/* Voice info */}
                    <View className="flex-1">
                      <AppText className="text-foreground text-sm font-sans-medium">
                        {voice.name}
                      </AppText>
                      <AppText className="text-neutrals400 text-xs">
                        {voice.gender === 'Female' ? '♀' : '♂'} {voice.description || voice.gender}
                      </AppText>
                    </View>
                    {/* Preview button */}
                    <TouchableOpacity
                      onPress={() => handlePreview(voice.id)}
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{backgroundColor: `${LISTENING_BLUE}15`}}
                      disabled={!!previewingVoice}
                      accessibilityLabel={`Nghe thử giọng ${voice.name}`}
                      accessibilityRole="button">
                      {previewingVoice === voice.id ? (
                        <ActivityIndicator size="small" color={LISTENING_BLUE} />
                      ) : (
                        <Icon name="Play" className="w-3.5 h-3.5" style={{color: LISTENING_BLUE}} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* ======================== */}
            {/* SPEAKER ASSIGNMENT (chỉ hiện khi randomVoice = false) */}
            {/* ======================== */}
            {!randomVoice && (
              <View className="mb-6">
                <AppText className="text-neutrals400 text-xs font-sans-medium mb-2 uppercase tracking-wider">
                  Gán giọng cho Speaker
                </AppText>
                <View className="gap-2">
                  {speakerLabels.map(label => (
                    <View key={label} className="flex-row items-center bg-neutrals900 rounded-xl px-4 py-3">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{backgroundColor: `${LISTENING_BLUE}20`}}>
                        <AppText className="text-sm font-sans-bold" style={{color: LISTENING_BLUE}}>
                          {label}
                        </AppText>
                      </View>
                      <AppText className="text-foreground text-sm flex-1">
                        Speaker {label}
                      </AppText>
                      {/* Voice dropdown (simplified: show name or "Chọn") */}
                      <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg border border-neutrals700 min-w-[100]"
                        onPress={() => {
                          // Cycle qua voices
                          const currentVoice = voicePerSpeaker[label];
                          const currentIdx = voices.findIndex(v => v.id === currentVoice);
                          const nextIdx = (currentIdx + 1) % Math.max(voices.length, 1);
                          if (voices[nextIdx]) {
                            assignVoiceToSpeaker(label, voices[nextIdx].id);
                          }
                        }}
                        accessibilityLabel={`Chọn giọng cho Speaker ${label}`}
                        accessibilityRole="button">
                        <AppText className="text-foreground text-xs text-center" numberOfLines={1}>
                          {voices.find(v => v.id === voicePerSpeaker[label])?.name || 'Chọn'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ======================== */}
            {/* EMOTION CHIPS */}
            {/* ======================== */}
            <AppText className="text-neutrals400 text-xs font-sans-medium mb-2 uppercase tracking-wider">
              Cảm xúc giọng
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6">
              <View className="flex-row gap-2">
                {EMOTIONS.map(emotion => {
                  const isActive = ttsEmotion === emotion.id;
                  const isDimmed = randomEmotion && emotion.id !== 'default';
                  return (
                    <TouchableOpacity
                      key={emotion.id}
                      className="px-3 py-2 rounded-full border flex-row items-center"
                      style={{
                        backgroundColor: isActive ? LISTENING_BLUE : 'transparent',
                        borderColor: isActive ? LISTENING_BLUE : colors.neutrals800,
                        opacity: isDimmed ? 0.4 : 1,
                      }}
                      onPress={() => {
                        if (isDimmed) {return;}
                        haptic.light();
                        setTtsEmotion(emotion.id);
                      }}
                      disabled={isDimmed}
                      accessibilityLabel={`Cảm xúc ${emotion.label}${isActive ? ', đang chọn' : ''}`}
                      accessibilityRole="button">
                      <AppText className="text-sm mr-1">{emotion.emoji}</AppText>
                      <AppText
                        className="text-xs font-sans-medium"
                        style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                        {emotion.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* ======================== */}
            {/* TOGGLES */}
            {/* ======================== */}
            <View className="gap-3 mb-6">
              {/* Random Voice */}
              <SettingToggle
                label="Giọng ngẫu nhiên"
                description="AI tự chọn giọng phù hợp"
                value={randomVoice}
                onValueChange={v => {
                  setRandomVoice(v);
                  haptic.light();
                }}
              />
              {/* Random Emotion */}
              <SettingToggle
                label="Cảm xúc ngẫu nhiên"
                description="AI tự chọn emotion cho từng câu"
                value={randomEmotion}
                onValueChange={v => {
                  setRandomEmotion(v);
                  haptic.light();
                }}
              />
              {/* Multi-talker */}
              <SettingToggle
                label="Multi-talker (DragonHD)"
                description="2 giọng đọc trong 1 audio stream"
                value={multiTalker}
                onValueChange={v => {
                  setMultiTalker(v);
                  haptic.light();
                }}
              />
            </View>

            {/* Multi-talker pair picker */}
            {multiTalker && multiTalkerPairs.length > 0 && (
              <View className="mb-6">
                <AppText className="text-neutrals400 text-xs font-sans-medium mb-2 uppercase tracking-wider">
                  Cặp giọng Multi-talker
                </AppText>
                <View className="gap-2">
                  {multiTalkerPairs.map((pair, idx) => {
                    const isActive = multiTalkerPairIndex === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        className="flex-row items-center bg-neutrals900 rounded-xl px-4 py-3 border"
                        style={{
                          borderColor: isActive ? LISTENING_BLUE : 'transparent',
                        }}
                        onPress={() => {
                          setMultiTalkerPairIndex(idx);
                          haptic.light();
                        }}
                        accessibilityLabel={`Cặp ${pair.pair.join(' & ')}${isActive ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3"
                          style={{borderColor: isActive ? LISTENING_BLUE : colors.neutrals600}}>
                          {isActive && (
                            <View className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
                          )}
                        </View>
                        <AppText className="text-foreground text-sm">
                          {pair.pair.join(' & ')}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ======================== */}
            {/* ADVANCED: Pitch / Rate */}
            {/* ======================== */}
            <TouchableOpacity
              className="flex-row items-center justify-between mb-3"
              onPress={() => {
                setShowAdvanced(!showAdvanced);
                haptic.light();
              }}
              accessibilityLabel="Cài đặt nâng cao"
              accessibilityRole="button">
              <AppText className="text-neutrals400 text-xs font-sans-medium uppercase tracking-wider">
                Nâng cao
              </AppText>
              <Icon
                name={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
                className="w-4 h-4 text-neutrals400"
              />
            </TouchableOpacity>

            {showAdvanced && (
              <View className="gap-4 mb-6">
                {/* Pitch */}
                <View>
                  <View className="flex-row justify-between mb-1">
                    <AppText className="text-foreground text-sm">Pitch</AppText>
                    <AppText className="text-neutrals400 text-xs">
                      {ttsPitch > 0 ? '+' : ''}{ttsPitch}%
                    </AppText>
                  </View>
                  <Slider
                    minimumValue={-20}
                    maximumValue={20}
                    step={1}
                    value={ttsPitch}
                    onValueChange={setTtsPitch}
                    minimumTrackTintColor={LISTENING_BLUE}
                    maximumTrackTintColor={colors.neutrals800}
                    thumbTintColor={LISTENING_BLUE}
                  />
                </View>

                {/* Rate */}
                <View>
                  <View className="flex-row justify-between mb-1">
                    <AppText className="text-foreground text-sm">Rate</AppText>
                    <AppText className="text-neutrals400 text-xs">
                      {ttsRate > 0 ? '+' : ''}{ttsRate}%
                    </AppText>
                  </View>
                  <Slider
                    minimumValue={-20}
                    maximumValue={20}
                    step={1}
                    value={ttsRate}
                    onValueChange={setTtsRate}
                    minimumTrackTintColor={LISTENING_BLUE}
                    maximumTrackTintColor={colors.neutrals800}
                    thumbTintColor={LISTENING_BLUE}
                  />
                </View>

                {/* Reset button */}
                <TouchableOpacity
                  className="self-center px-4 py-2 rounded-lg border border-neutrals700"
                  onPress={() => {
                    setTtsPitch(0);
                    setTtsRate(0);
                    haptic.light();
                  }}
                  accessibilityLabel="Reset Pitch và Rate"
                  accessibilityRole="button">
                  <AppText className="text-neutrals400 text-xs">Reset về mặc định</AppText>
                </TouchableOpacity>
              </View>
            )}

            {/* Spacer cuối */}
            <View className="h-4" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ========================
// SettingToggle — row với label + description + switch
// ========================

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

/**
 * Mục đích: Toggle row dùng trong TtsSettingsSheet
 * Tham số đầu vào: label, description, value, onValueChange
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TtsSettingsSheet → toggles section
 */
function SettingToggle({label, description, value, onValueChange}: SettingToggleProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-neutrals900 rounded-xl px-4 py-3"
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
      accessibilityLabel={`${label}, ${value ? 'bật' : 'tắt'}`}
      accessibilityRole="switch">
      <View className="flex-1 mr-3">
        <AppText className="text-foreground text-sm font-sans-medium">
          {label}
        </AppText>
        <AppText className="text-neutrals400 text-xs">{description}</AppText>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </TouchableOpacity>
  );
}

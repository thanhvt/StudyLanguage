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
import {Slider} from '@/components/ui';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi, type VoiceInfo, type MultiTalkerPair} from '@/services/api/listening';
import {useHaptic} from '@/hooks/useHaptic';
import {useColors} from '@/hooks/useColors';
import {useToast} from '@/components/ui/ToastProvider';
import {useInsets} from '@/hooks/useInsets';
import TrackPlayer from 'react-native-track-player';
import {Platform} from 'react-native';
import {Buffer} from 'buffer';

// Dynamic import RNFS (giống pattern Speaking screens)
let RNFSModule: any;
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [TtsSettings] react-native-fs chưa install');
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
      // Gọi API lấy audio data (ArrayBuffer)
      const audioData = await listeningApi.previewVoice(
        PREVIEW_TEXT,
        voiceId,
        ttsEmotion !== 'default' ? ttsEmotion : undefined,
      );

      // Chuyển ArrayBuffer → base64 string (Buffer polyfill trong RN)
      const base64Audio = Buffer.from(audioData).toString('base64');

      // Ghi file tạm vào cache
      const tempPath = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/tts_preview_${voiceId}.mp3`;
      await RNFSModule?.writeFile(tempPath, base64Audio, 'base64');

      // Đảm bảo TrackPlayer đã được khởi tạo trước khi phát
      try {
        await TrackPlayer.setupPlayer();
      } catch {
        // Đã setup trước đó — bỏ qua lỗi "already initialized"
      }

      // Phát audio qua TrackPlayer
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `preview-${voiceId}`,
        url: Platform.OS === 'ios' ? `file://${tempPath}` : tempPath,
        title: `Preview: ${voiceId}`,
        artist: 'TTS Preview',
      });
      await TrackPlayer.play();

      console.log('✅ [TtsSettings] Đang phát preview giọng:', voiceId);
    } catch (err) {
      console.error('❌ [TtsSettings] Lỗi preview:', err);
      showError('Lỗi phát thử', 'Không thể phát thử giọng đọc này');
    } finally {
      setPreviewingVoice(null);
    }
  }, [previewingVoice, ttsEmotion, haptic, showError]);

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
          className="rounded-t-3xl max-h-[85%]"
          style={{
            paddingBottom: Math.max(insets.bottom, 20),
            backgroundColor: colors.background,
            // L6: Glass-style border — premium matching SectionCards
            borderTopWidth: 1,
            borderTopColor: colors.glassBorderStrong,
            borderLeftWidth: 0.5,
            borderRightWidth: 0.5,
            borderLeftColor: colors.glassBorderStrong,
            borderRightColor: colors.glassBorderStrong,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -8},
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 16,
          }}>

          {/* Handle bar */}
          <View className="items-center pt-3 pb-4">
            <View className="w-10 h-1 rounded-full" style={{backgroundColor: colors.neutrals600}} />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 mb-4">
            <AppText className="font-sans-bold text-xl" style={{color: colors.foreground}}>
              Cài đặt giọng đọc
            </AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 -mr-2"
              accessibilityLabel="Đóng"
              accessibilityRole="button">
              <Icon name="X" className="w-5 h-5" style={{color: colors.neutrals400}} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-6"
            showsVerticalScrollIndicator={false}>

            {/* ======================== */}
            {/* VOICE LIST */}
            {/* ======================== */}
            <AppText className="text-xs font-sans-medium mb-2 uppercase tracking-wider" style={{color: colors.neutrals300}}>
              Giọng đọc
            </AppText>

            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={LISTENING_BLUE} />
                <AppText className="text-sm mt-3" style={{color: colors.neutrals400}}>
                  Đang tải danh sách giọng...
                </AppText>
              </View>
            ) : (
              <View className="flex-row flex-wrap" style={{gap: 8, marginBottom: 24}}>
                {voices.map((voice, idx) => {
                  // Kiểm tra giọng này có đang được gán cho speaker nào không
                  const assignedSpeaker = Object.entries(voicePerSpeaker).find(
                    ([, vid]) => vid === voice.id,
                  )?.[0];
                  const isAssigned = !!assignedSpeaker;
                  return (
                    <View
                      key={`voice-${voice.id || idx}`}
                      className="rounded-xl px-3 py-2.5"
                      style={{
                        width: '48.5%',
                        backgroundColor: isAssigned ? `${LISTENING_BLUE}12` : colors.neutrals900,
                        borderWidth: 1,
                        borderColor: isAssigned ? `${LISTENING_BLUE}40` : colors.glassBorder,
                      }}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-1">
                          <AppText
                            className="text-[13px] font-sans-medium"
                            style={{color: isAssigned ? LISTENING_BLUE : colors.foreground}}
                            numberOfLines={1}>
                            {voice.name.replace('en-US-', '').replace('Neural', '')}
                          </AppText>
                          <AppText className="text-[10px]" style={{color: colors.neutrals300}}>
                            {voice.gender === 'Female' ? '♀ nữ' : '♂ nam'}
                            {voice.description ? ` · ${voice.description}` : ''}
                            {isAssigned ? ` · ${assignedSpeaker}` : ''}
                          </AppText>
                        </View>
                        {/* Preview button */}
                        <TouchableOpacity
                          onPress={() => handlePreview(voice.id)}
                          className="w-7 h-7 rounded-full items-center justify-center"
                          style={{backgroundColor: `${LISTENING_BLUE}20`}}
                          disabled={!!previewingVoice}
                          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                          accessibilityLabel={`Nghe thử giọng ${voice.name}`}
                          accessibilityRole="button">
                          {previewingVoice === voice.id ? (
                            <ActivityIndicator size="small" color={LISTENING_BLUE} />
                          ) : (
                            <Icon name="Play" className="w-3 h-3" style={{color: LISTENING_BLUE}} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ======================== */}
            {/* SPEAKER ASSIGNMENT (chỉ hiện khi randomVoice = false) */}
            {/* ======================== */}
            {!randomVoice && (
              <View className="mb-6">
                <AppText className="text-xs font-sans-medium mb-2 uppercase tracking-wider" style={{color: colors.neutrals300}}>
                  Gán giọng cho Speaker
                </AppText>
                <View className="gap-2">
                  {speakerLabels.map(label => (
                    <View key={label} className="flex-row items-center rounded-xl px-4 py-3" style={{backgroundColor: colors.neutrals900}}>
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{backgroundColor: `${LISTENING_BLUE}20`}}>
                        <AppText className="text-sm font-sans-bold" style={{color: LISTENING_BLUE}}>
                          {label}
                        </AppText>
                      </View>
                      <AppText className="text-sm flex-1" style={{color: colors.foreground}}>
                        Speaker {label}
                      </AppText>
                      {/* Voice dropdown (simplified: show name or "Chọn") */}
                      <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg min-w-[100]"
                        style={{borderWidth: 1, borderColor: colors.neutrals700}}
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
                        <AppText className="text-xs text-center" style={{color: colors.foreground}} numberOfLines={1}>
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
            <AppText className="text-xs font-sans-medium mb-2 uppercase tracking-wider" style={{color: colors.neutrals300}}>
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
                <AppText className="text-xs font-sans-medium mb-2 uppercase tracking-wider" style={{color: colors.neutrals300}}>
                  Cặp giọng Multi-talker
                </AppText>
                <View className="gap-2">
                  {multiTalkerPairs.map((pair, idx) => {
                    const isActive = multiTalkerPairIndex === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        className="flex-row items-center rounded-xl px-4 py-3 border"
                        style={{
                          backgroundColor: colors.neutrals900,
                          borderColor: isActive ? LISTENING_BLUE : 'transparent',
                        }}
                        onPress={() => {
                          setMultiTalkerPairIndex(idx);
                          haptic.light();
                        }}
                        accessibilityLabel={`Cặp ${(pair.pair || pair.speakers || []).join(' & ')}${isActive ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3"
                          style={{borderColor: isActive ? LISTENING_BLUE : colors.neutrals600}}>
                          {isActive && (
                            <View className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
                          )}
                        </View>
                        <AppText className="text-sm" style={{color: colors.foreground}}>
                          {(pair.pair || pair.speakers || []).join(' & ')}
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
              <AppText className="text-xs font-sans-medium uppercase tracking-wider" style={{color: colors.neutrals400}}>
                Nâng cao
              </AppText>
              <Icon
                name={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
                className="w-4 h-4"
                style={{color: colors.neutrals400}}
              />
            </TouchableOpacity>

            {showAdvanced && (
              <View className="gap-4 mb-6">
                {/* Pitch */}
                <View>
                  <View className="flex-row justify-between mb-1">
                    <AppText className="text-sm" style={{color: colors.foreground}}>Pitch</AppText>
                    <AppText className="text-xs" style={{color: colors.neutrals400}}>
                      {ttsPitch > 0 ? '+' : ''}{ttsPitch}%
                    </AppText>
                  </View>
                  <Slider
                    minimumValue={-20}
                    maximumValue={20}
                    step={1}
                    value={ttsPitch}
                    onValueChange={setTtsPitch}
                  />
                </View>

                {/* Rate */}
                <View>
                  <View className="flex-row justify-between mb-1">
                    <AppText className="text-sm" style={{color: colors.foreground}}>Rate</AppText>
                    <AppText className="text-xs" style={{color: colors.neutrals400}}>
                      {ttsRate > 0 ? '+' : ''}{ttsRate}%
                    </AppText>
                  </View>
                  <Slider
                    minimumValue={-20}
                    maximumValue={20}
                    step={1}
                    value={ttsRate}
                    onValueChange={setTtsRate}
                  />
                </View>

                {/* Reset button */}
                <TouchableOpacity
                  className="self-center px-5 py-2.5 rounded-xl"
                  style={{borderWidth: 1, borderColor: colors.neutrals600}}
                  onPress={() => {
                    setTtsPitch(0);
                    setTtsRate(0);
                    haptic.light();
                  }}
                  accessibilityLabel="Reset Pitch và Rate"
                  accessibilityRole="button">
                  <AppText className="text-sm font-sans-medium" style={{color: colors.neutrals300}}>Reset về mặc định</AppText>
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
  const colors = useColors();
  return (
    <TouchableOpacity
      className="flex-row items-center rounded-xl px-4 py-3"
      style={{backgroundColor: colors.neutrals900}}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
      accessibilityLabel={`${label}, ${value ? 'bật' : 'tắt'}`}
      accessibilityRole="switch">
      <View className="flex-1 mr-3">
        <AppText className="text-sm font-sans-medium" style={{color: colors.foreground}}>
          {label}
        </AppText>
        <AppText className="text-xs" style={{color: colors.neutrals300}}>{description}</AppText>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </TouchableOpacity>
  );
}

import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import {SKILL_COLORS} from '@/config/skillColors';
import {
  ChatBubble,
  VoiceVisualizer,
  PronunciationAlert,
  GrammarFix,
  SuggestedResponses,
} from '@/components/speaking';
import type {ChatMessage} from '@/components/speaking/ChatBubble';
import type {PronunciationCorrection} from '@/components/speaking/PronunciationAlert';
import type {GrammarCorrection} from '@/components/speaking/GrammarFix';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {useCoachTrackPlayer} from '@/hooks/useCoachTrackPlayer';

// =======================
// Types
// =======================

/** Item trong FlatList có thể là message, pronunciation fix, hoặc grammar fix */
type ChatItem =
  | {type: 'message'; data: ChatMessage}
  | {type: 'pronunciation'; data: PronunciationCorrection}
  | {type: 'grammar'; data: GrammarCorrection};

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình hội thoại chính với AI Coach
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   CoachSetupScreen → startCoachSession → navigate CoachSession
 *   User nói/gõ text → AI trả lời + sửa lỗi realtime
 */
export default function CoachSessionScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Store
  const {
    coachSession,
    isRecording,
    startRecording: storeStartRecording,
    stopRecording: storeStopRecording,
    addCoachMessage,
    setCoachAIResponding,
    tickCoachTimer,
    endCoachSession,
    setError,
    error,
  } = useSpeakingStore();

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const audioRecorder = useRef(new AudioRecorderPlayer()).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Local state
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  // Coach TrackPlayer — hỗ trợ phát audio AI ở background
  const {playCoachAudio, stopCoach} = useCoachTrackPlayer();

  // Shorthand
  const session = coachSession;
  const inputMode = session?.inputMode || 'voice';
  const isAIResponding = session?.isAIResponding || false;
  const isEnded = session?.isEnded || false;
  const remainingSeconds = session?.remainingSeconds || 0;

  // =======================
  // Timer
  // =======================

  useEffect(() => {
    if (!session || isEnded) return;

    timerRef.current = setInterval(() => {
      tickCoachTimer();
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded]);

  // Gửi welcome message khi bắt đầu
  useEffect(() => {
    if (session && session.messages.length === 0) {
      sendWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================
  // Helpers
  // =======================

  /**
   * Mục đích: Format thời gian từ seconds → mm:ss
   * Tham số đầu vào: seconds (number)
   * Tham số đầu ra: string (mm:ss)
   * Khi nào sử dụng: Hiển thị timer ở header
   */
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * Mục đích: Tạo unique ID cho message
   * Tham số đầu vào: không
   * Tham số đầu ra: string
   * Khi nào sử dụng: Khi tạo ChatMessage mới
   */
  const generateId = (): string => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // =======================
  // AI Communication
  // =======================

  /**
   * Mục đích: Gửi tin nhắn chào đầu tiên từ AI
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi CoachSession mới bắt đầu (messages.length === 0)
   */
  const sendWelcomeMessage = async () => {
    if (!session) return;

    setCoachAIResponding(true);
    try {
      const result = await speakingApi.continueConversation(
        [],
        '',
        session.setup.topic,
      );

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'ai',
        text: result.response,
        timestamp: Date.now(),
      };

      addCoachMessage(aiMessage);
      setChatItems(prev => [...prev, {type: 'message', data: aiMessage}]);
    } catch (err) {
      console.error('❌ [Coach] Lỗi gửi welcome:', err);
      const fallback: ChatMessage = {
        id: generateId(),
        role: 'ai',
        text: `Hi there! Let's talk about "${session.setup.topic}". How about you start by sharing your thoughts?`,
        timestamp: Date.now(),
      };
      addCoachMessage(fallback);
      setChatItems(prev => [...prev, {type: 'message', data: fallback}]);
    } finally {
      setCoachAIResponding(false);
    }
  };

  /**
   * Mục đích: Gửi tin nhắn user → nhận phản hồi AI + corrections
   * Tham số đầu vào: text (string) — nội dung user vừa nói/gõ
   * Tham số đầu ra: void
   * Khi nào sử dụng: Sau khi user gõ text hoặc hoàn tất ghi âm → transcribe
   */
  const sendUserMessage = async (text: string) => {
    if (!session || !text.trim() || isEnded) return;

    // Thêm message user
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };
    addCoachMessage(userMsg);
    setChatItems(prev => [...prev, {type: 'message', data: userMsg}]);
    setTextInput('');

    // Gọi AI
    setCoachAIResponding(true);
    try {
      const history = [...(session.messages || []), userMsg].map(m => ({
        speaker: m.role === 'ai' ? 'assistant' : 'user',
        text: m.text,
      }));

      const result = await speakingApi.continueConversation(
        history,
        text.trim(),
        session.setup.topic,
      );

      // Thêm grammar corrections (nếu có)
      if (result.corrections && result.corrections.length > 0) {
        const grammarItems: ChatItem[] = result.corrections.map(c => ({
          type: 'grammar' as const,
          data: {
            original: c.original,
            correction: c.correction,
            explanation: c.explanation,
          },
        }));
        setChatItems(prev => [...prev, ...grammarItems]);
      }

      // Thêm AI response
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        text: result.response,
        timestamp: Date.now(),
      };
      addCoachMessage(aiMsg);
      setChatItems(prev => [...prev, {type: 'message', data: aiMsg}]);

      // Sinh và phát audio AI response qua TrackPlayer (background capable)
      try {
        const {ttsSettings} = useSpeakingStore.getState();
        const audioUrl = await speakingApi.generateCoachAudio(
          result.response,
          ttsSettings.provider,
          ttsSettings.voiceId,
          ttsSettings.speed,
        );
        if (audioUrl) {
          await playCoachAudio(audioUrl);
        }
      } catch (audioErr) {
        console.warn('⚠️ [Coach] Không phát được audio AI:', audioErr);
      }

      // Kiểm tra kết thúc
      if (result.shouldEnd) {
        endCoachSession();
      }
    } catch (err: any) {
      console.error('❌ [Coach] Lỗi gửi message:', err);
      setError('Lỗi kết nối AI Coach. Thử lại nhé!');
    } finally {
      setCoachAIResponding(false);
    }
  };

  // =======================
  // Recording
  // =======================

  /**
   * Mục đích: Bắt đầu ghi âm voice
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn giữ nút mic
   */
  const handleStartRecording = async () => {
    try {
      storeStartRecording();
      const result = await audioRecorder.startRecorder();
      console.log('🎙️ [Coach] Bắt đầu ghi âm:', result);
    } catch (err) {
      console.error('❌ [Coach] Lỗi ghi âm:', err);
      storeStopRecording('');
    }
  };

  /**
   * Mục đích: Dừng ghi âm → transcribe → gửi message
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User thả nút mic
   */
  const handleStopRecording = async () => {
    try {
      const audioUri = await audioRecorder.stopRecorder();
      storeStopRecording(audioUri);
      console.log('🎙️ [Coach] Dừng ghi âm:', audioUri);

      // Transcribe → gửi message
      const transcript = await speakingApi.transcribeAudio(audioUri);
      if (transcript.trim()) {
        await sendUserMessage(transcript);
      } else {
        console.log('⚠️ [Coach] Transcript rỗng, bỏ qua');
      }
    } catch (err) {
      console.error('❌ [Coach] Lỗi xử lý recording:', err);
      storeStopRecording('');
      setError('Không nhận được giọng nói. Thử lại nhé!');
    }
  };

  /**
   * Mục đích: Gửi text input khi user gõ
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút gửi ở text mode
   */
  const handleSendText = () => {
    if (textInput.trim()) {
      sendUserMessage(textInput);
    }
  };

  /**
   * Mục đích: Phát audio AI response
   * Tham số đầu vào: audioUrl (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút speaker trên AI bubble
   */
  const handlePlayAudio = useCallback(async (audioUrl: string) => {
    try {
      setPlayingMessageId(audioUrl);
      await audioRecorder.startPlayer(audioUrl);
      audioRecorder.addPlayBackListener((e) => {
        if (e.currentPosition >= e.duration) {
          setPlayingMessageId(null);
          audioRecorder.stopPlayer();
        }
      });
    } catch (err) {
      console.error('❌ [Coach] Lỗi phát audio:', err);
      setPlayingMessageId(null);
    }
  }, [audioRecorder]);

  /**
   * Mục đích: Xử lý khi user chọn gợi ý (beginner mode)
   * Tham số đầu vào: suggestion (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap chip gợi ý → auto-send
   */
  const handleSelectSuggestion = (suggestion: string) => {
    sendUserMessage(suggestion);
  };

  /**
   * Mục đích: Kết thúc session thủ công
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút End hoặc hết thời gian
   */
  const handleEndSession = () => {
    Alert.alert(
      'Kết thúc buổi nói chuyện?',
      'Bạn có muốn kết thúc session này không?',
      [
        {text: 'Tiếp tục', style: 'cancel'},
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: () => {
            endCoachSession();
          },
        },
      ],
    );
  };

  // =======================
  // Auto-scroll
  // =======================

  useEffect(() => {
    if (chatItems.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [chatItems.length]);

  // =======================
  // Cleanup
  // =======================

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audioRecorder.stopRecorder().catch(() => {});
      audioRecorder.stopPlayer().catch(() => {});
      // Cleanup TrackPlayer khi rời màn hình
      stopCoach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================
  // Render
  // =======================

  /**
   * Mục đích: Render 1 item trong FlatList (message, pronunciation, grammar)
   * Tham số đầu vào: item (ChatItem)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem callback
   */
  const renderItem = ({item}: {item: ChatItem}) => {
    switch (item.type) {
      case 'message':
        return (
          <ChatBubble
            message={item.data}
            onPlayAudio={handlePlayAudio}
            isPlaying={playingMessageId === item.data.audioUrl}
          />
        );
      case 'pronunciation':
        return (
          <PronunciationAlert
            correction={item.data}
            onPlaySample={async (word: string) => {
              try {
                const audio = await speakingApi.playAISample(word);
                if (audio) {
                  await audioRecorder.startPlayer(audio);
                }
              } catch (err) {
                console.error('❌ [Coach] Lỗi phát mẫu:', err);
              }
            }}
          />
        );
      case 'grammar':
        return <GrammarFix correction={item.data} />;
      default:
        return null;
    }
  };

  const keyExtractor = (item: ChatItem, index: number) => {
    if (item.type === 'message') return item.data.id;
    return `correction_${index}`;
  };

  // Safety check
  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppText variant="body" className="text-neutrals400" raw>
          Chưa có session. Quay lại setup.
        </AppText>
        <AppButton
          variant="primary"
          size="default"
          className="mt-4"
          onPress={() => navigation.goBack()}>
          ← Quay lại
        </AppButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={10}>
        {/* ======= HEADER ======= */}
        <View
          className="flex-row items-center px-4 py-3"
          style={{borderBottomWidth: 0.5, borderBottomColor: colors.border}}>
          <AppButton
            variant="ghost"
            size="icon"
            onPress={() => navigation.goBack()}
            icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
            {''}
          </AppButton>

          <View className="flex-1 items-center">
            <AppText variant="body" weight="bold" raw>
              🤖 {session.setup.topic}
            </AppText>
            <AppText
              variant="caption"
              style={{color: remainingSeconds < 60 ? '#EF4444' : colors.neutrals400}}
              raw>
              ⏱ {formatTime(remainingSeconds)}
            </AppText>
          </View>

          <TouchableOpacity
            onPress={handleEndSession}
            style={[styles.endBtn, {backgroundColor: '#EF444420'}]}>
            <AppText variant="caption" weight="bold" style={{color: '#EF4444'}} raw>
              Kết thúc
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ======= CHAT LIST ======= */}
        <FlatList
          ref={flatListRef}
          data={chatItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={speakingColor} />
              <AppText
                variant="bodySmall"
                className="text-neutrals400 mt-3"
                raw>
                AI Coach đang chuẩn bị...
              </AppText>
            </View>
          }
        />

        {/* Session ended banner */}
        {isEnded && (
          <View style={[styles.endedBanner, {backgroundColor: `${speakingColor}15`}]}>
            <AppText variant="body" weight="semibold" raw>
              🎉 Session kết thúc!
            </AppText>
            <AppText variant="bodySmall" className="text-neutrals400 mt-1" raw>
              Bạn đã nói {session.messages.filter(m => m.role === 'user').length} lượt.
            </AppText>
            <AppButton
              variant="primary"
              size="default"
              className="mt-3"
              style={{backgroundColor: speakingColor}}
              onPress={() => navigation.goBack()}>
              ← Quay lại
            </AppButton>
          </View>
        )}

        {/* ======= INPUT AREA ======= */}
        {!isEnded && (
          <View style={[styles.inputArea, {borderTopColor: colors.border}]}>
            {/* Error */}
            {error && (
              <AppText
                variant="caption"
                style={{color: '#EF4444', paddingHorizontal: 12, paddingBottom: 4}}
                raw>
                ⚠️ {error}
              </AppText>
            )}

            {/* Gợi ý (beginner mode) */}
            {session.setup.feedbackMode === 'beginner' && !isRecording && (
              <SuggestedResponses
                suggestions={[
                  'Yes, I agree.',
                  'Could you say that again?',
                  "That's interesting!",
                  "I'm not sure.",
                ]}
                onSelect={handleSelectSuggestion}
                disabled={isAIResponding}
              />
            )}

            {/* Voice Visualizer khi đang thu */}
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <VoiceVisualizer isRecording={isRecording} height={40} />
                <AppText
                  variant="caption"
                  style={{color: speakingColor, marginTop: 4}}
                  raw>
                  Đang nghe...
                </AppText>
              </View>
            )}

            {/* Input controls */}
            <View style={styles.inputRow}>
              {/* Toggle voice/text */}
              <TouchableOpacity
                onPress={() => {
                  const newMode = inputMode === 'voice' ? 'text' : 'voice';
                  useSpeakingStore.getState().setCoachInputMode(newMode);
                }}
                style={[styles.toggleBtn, {backgroundColor: colors.surface}]}>
                <Icon
                  name={inputMode === 'voice' ? 'Keyboard' : 'Mic'}
                  className="w-5 h-5"
                  style={{color: colors.foreground}}
                />
              </TouchableOpacity>

              {inputMode === 'text' ? (
                /* Text input mode */
                <View style={styles.textInputWrapper}>
                  <TextInput
                    style={[
                      styles.textInput,
                      {color: colors.foreground, backgroundColor: colors.surface},
                    ]}
                    placeholder="Gõ câu trả lời..."
                    placeholderTextColor={colors.neutrals400}
                    value={textInput}
                    onChangeText={setTextInput}
                    returnKeyType="send"
                    onSubmitEditing={handleSendText}
                    editable={!isAIResponding}
                  />
                  <TouchableOpacity
                    onPress={handleSendText}
                    disabled={!textInput.trim() || isAIResponding}
                    style={[
                      styles.sendBtn,
                      {
                        backgroundColor:
                          textInput.trim() && !isAIResponding
                            ? speakingColor
                            : `${speakingColor}30`,
                      },
                    ]}>
                    <Icon name="Send" className="w-4 h-4" style={{color: '#FFFFFF'}} />
                  </TouchableOpacity>
                </View>
              ) : (
                /* Voice input mode — hold to record */
                <TouchableOpacity
                  onPressIn={handleStartRecording}
                  onPressOut={handleStopRecording}
                  disabled={isAIResponding}
                  activeOpacity={0.7}
                  style={[
                    styles.micBtn,
                    {
                      backgroundColor: isRecording
                        ? '#EF4444'
                        : isAIResponding
                          ? `${speakingColor}40`
                          : speakingColor,
                    },
                  ]}>
                  {isAIResponding ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="Mic" className="w-6 h-6" style={{color: '#FFFFFF'}} />
                      <AppText
                        variant="caption"
                        style={{color: '#FFFFFF', marginTop: 2}}
                        raw>
                        {isRecording ? 'Thả để gửi' : 'Giữ để nói'}
                      </AppText>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  chatContent: {
    paddingVertical: 12,
    paddingBottom: 20,
  },
  inputArea: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  endedBanner: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
  },
});

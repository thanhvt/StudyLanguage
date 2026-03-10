import React, {useEffect, useRef, useCallback, useMemo, useState} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import ChatBubble from '@/components/speaking/ChatBubble';
import PronunciationAlert from '@/components/speaking/PronunciationAlert';
import GrammarFix from '@/components/speaking/GrammarFix';
import SuggestedResponses from '@/components/speaking/SuggestedResponses';
import AIThinkingIndicator from '@/components/speaking/AIThinkingIndicator';
import ContextBanner from '@/components/speaking/ContextBanner';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import {getConversationColor} from '@/config/skillColors';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';
import type {ConversationMessage} from '@/store/useSpeakingStore';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Constants
// =======================

/** Timeout cho AI response (EC-04) */
const AI_RESPONSE_TIMEOUT_MS = 10000;

/** Debounce delay cho send button (EC-05) */
const SEND_DEBOUNCE_MS = 500;

// =======================
// Helper
// =======================

/**
 * Mục đích: Format thời gian seconds → mm:ss
 * Tham số đầu vào: seconds (number)
 * Tham số đầu ra: string (mm:ss)
 * Khi nào sử dụng: TimerBadge hiển thị remaining time
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình hội thoại AI — thống nhất cho Free Talk & Roleplay
 * Tham số đầu vào: không có (đọc state từ useSpeakingStore)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConversationSetupScreen → nhấn "Bắt đầu" → setConversationSetup → navigate ConversationSession
 *   Kết thúc session → navigate SessionSummary
 */
export default function ConversationScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const haptic = useHaptic();
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendLockRef = useRef(false); // Debounce lock (EC-05)
  const userScrolledRef = useRef(false); // Smart scroll (EC-08)
  const endingRef = useRef(false); // Prevent double-end (CR-08)

  // Store state
  const setup = useSpeakingStore(s => s.conversationSetup);
  const session = useSpeakingStore(s => s.conversationSession);
  const ai = useSpeakingStore(s => s.conversationAI);

  // Store actions
  const startConversation = useSpeakingStore(s => s.startConversation);
  const addConversationMessage = useSpeakingStore(s => s.addConversationMessage);
  const tickConversationTimer = useSpeakingStore(s => s.tickConversationTimer);
  const incrementTurn = useSpeakingStore(s => s.incrementTurn);
  const setAIThinking = useSpeakingStore(s => s.setAIThinking);
  const setSuggestedResponses = useSpeakingStore(s => s.setSuggestedResponses);
  const setConversationSummary = useSpeakingStore(s => s.setConversationSummary);
  const endConversation = useSpeakingStore(s => s.endConversation);

  // Derived
  const mode = setup?.mode ?? 'free-talk';
  const accentColor = getConversationColor(mode);
  const isActive = session?.isActive ?? false;
  const messages = session?.messages ?? [];

  // Local state
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  // ===========================
  // Khởi tạo conversation
  // ===========================
  useEffect(() => {
    if (!setup) {
      console.error('❌ [Conversation] Không có setup, quay về');
      navigation.goBack();
      return;
    }

    // Bắt đầu session nếu chưa active
    if (!session?.isActive) {
      startConversation();

      // Thêm tin nhắn chào đầu tiên từ AI
      const greetingText = mode === 'roleplay' && setup.persona
        ? setup.persona.greeting
        : `Chào bạn! Hãy cùng trò chuyện về "${setup.topicName}" nhé. Bạn muốn bắt đầu về chủ đề gì?`;

      setTimeout(() => {
        addConversationMessage({
          id: `ai-greeting-${Date.now()}`,
          role: 'ai',
          text: greetingText,
          timestamp: Date.now(),
        });
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================
  // Timer — Free Talk mode (EC-01: cleanup khi hết giờ)
  // ===========================
  useEffect(() => {
    if (mode !== 'free-talk' || !isActive) {
      // Cleanup timer khi session kết thúc hoặc không phải free-talk
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      tickConversationTimer();
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mode, isActive, tickConversationTimer]);

  // ===========================
  // Auto-end khi hết timer/turns (CR-08: prevent double navigate)
  // ===========================
  useEffect(() => {
    if (session && !session.isActive && messages.length > 0 && !endingRef.current) {
      console.log('⏰ [Conversation] Session kết thúc — chuyển sang Summary');
      endingRef.current = true;
      handleEndSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.isActive]);

  // ===========================
  // Smart auto-scroll (EC-08)
  // ===========================
  useEffect(() => {
    if (messages.length > 0 && !userScrolledRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 200);
    }
  }, [messages.length]);

  /**
   * Mục đích: Gửi tin nhắn text và xử lý AI response
   * Tham số đầu vào: text (string) — nội dung tin nhắn
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút gửi hoặc tap suggestion chip
   */
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !isActive || ai.isThinking) return;

    // Debounce (EC-05)
    if (sendLockRef.current) return;
    sendLockRef.current = true;
    setTimeout(() => { sendLockRef.current = false; }, SEND_DEBOUNCE_MS);

    haptic.light();
    setTextInput('');
    userScrolledRef.current = false; // Reset auto-scroll

    // Thêm tin nhắn user
    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };
    addConversationMessage(userMsg);

    // Tăng turn cho Roleplay
    if (mode === 'roleplay') {
      incrementTurn();
    }

    // Gọi API AI trả lời (EC-04: timeout)
    setAIThinking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_RESPONSE_TIMEOUT_MS);

      const result = await speakingApi.continueConversation(
        messages.map(m => ({speaker: m.role, text: m.text})),
        text.trim(),
        setup?.topicName ?? '',
        {
          mode,
          persona: setup?.persona ? {
            name: setup.persona.name,
            role: setup.persona.role,
            systemPrompt: setup.persona.systemPrompt,
          } : undefined,
          difficulty: mode === 'roleplay' ? setup?.difficulty : undefined,
          feedbackMode: setup?.feedbackMode,
        },
      );
      clearTimeout(timeoutId);

      // Thêm tin nhắn AI
      const aiMsg: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: result.response,
        timestamp: Date.now(),
        pronunciationFeedback: result.pronunciationFeedback || undefined,
        grammarCorrections: result.corrections ?? [],
      };
      addConversationMessage(aiMsg);

      // Gợi ý câu trả lời (Free Talk + beginner)
      if (result.suggestedResponses && result.suggestedResponses.length > 0) {
        setSuggestedResponses(result.suggestedResponses);
      }

      // AI yêu cầu kết thúc
      if (result.shouldEnd) {
        console.log('🤖 [Conversation] AI yêu cầu kết thúc session');
        endConversation();
      }
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      console.error('❌ [Conversation] Lỗi gọi API:', isTimeout ? 'Timeout' : err);
      addConversationMessage({
        id: `system-error-${Date.now()}`,
        role: 'system',
        text: isTimeout
          ? 'AI không phản hồi kịp. Vui lòng thử lại.'
          : 'Có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: Date.now(),
      });
    } finally {
      setAIThinking(false);
    }
  }, [
    isActive, ai.isThinking, haptic, addConversationMessage, mode,
    incrementTurn, setAIThinking, messages, setup, setSuggestedResponses, endConversation,
  ]);

  /**
   * Mục đích: Kết thúc session và chuyển sang Summary
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Timer hết, max turns, AI shouldEnd, hoặc user nhấn End
   */
  const handleEndSession = useCallback(async () => {
    endConversation();

    // Sinh summary
    try {
      const summaryData = await speakingApi.generateSessionSummary(
        messages.map(m => ({role: m.role, text: m.text})),
        mode,
        setup?.mode === 'free-talk'
          ? (setup?.durationMinutes ?? 5) * 60
          : messages.filter(m => m.role === 'user').length,
      );

      setConversationSummary({
        totalTime: setup?.mode === 'free-talk' ? (setup?.durationMinutes ?? 5) * 60 : 0,
        totalTurns: messages.filter(m => m.role === 'user').length,
        overallScore: summaryData.overallScore,
        grade: summaryData.grade,
        pronunciationIssues: summaryData.pronunciationIssues,
        grammarFixes: summaryData.grammarFixes,
        aiFeedback: summaryData.aiFeedback,
        scenarioBadge: mode === 'roleplay' ? setup?.topicName ?? null : null,
      });
    } catch {
      console.error('❌ [Conversation] Lỗi sinh summary');
      // EC-09: Navigate anyway — Summary screen sẽ show fallback UI
    }

    navigation.navigate('SessionSummary');
  }, [endConversation, messages, mode, setup, setConversationSummary, navigation]);

  /**
   * Mục đích: Xác nhận thoát session (prevent mất dữ liệu)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút Back
   */
  const handleBack = useCallback(() => {
    if (messages.length > 0 && isActive) {
      Alert.alert(
        'Kết thúc hội thoại?',
        'Bạn có muốn kết thúc và xem kết quả không?',
        [
          {text: 'Tiếp tục', style: 'cancel'},
          {text: 'Kết thúc', style: 'destructive', onPress: handleEndSession},
        ],
      );
    } else {
      navigation.goBack();
    }
  }, [messages.length, isActive, handleEndSession, navigation]);

  // ===========================
  // Render list items
  // ===========================

  /**
   * Mục đích: Render từng item trong chat list (message + inline feedback)
   * Tham số đầu vào: item (ConversationMessage)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderItem = useCallback(({item}: {item: ConversationMessage}) => {
    return (
      <View>
        {/* CR-01: Truyền persona + accentColor cho ChatBubble */}
        <ChatBubble
          message={item}
          persona={setup?.persona || undefined}
          accentColor={accentColor}
          onPlayAudio={audioUrl => {
            console.log('🔊 [Conversation] Phát audio:', audioUrl);
            // TODO: Implement audio playback
          }}
        />

        {/* Inline Pronunciation Alert (UI-02: đã redesign) */}
        {item.pronunciationFeedback && (
          <PronunciationAlert
            correction={item.pronunciationFeedback}
            onPlaySample={word => {
              console.log('🔊 [Conversation] Phát mẫu cho:', word);
            }}
            onReSpeak={word => {
              console.log('🎤 [Conversation] Thử lại nói:', word);
            }}
          />
        )}

        {/* Inline Grammar Fix (UI-03: đã redesign — grouped) */}
        {item.grammarCorrections && item.grammarCorrections.length > 0 && (
          <GrammarFix
            corrections={item.grammarCorrections}
            onDismiss={() => {
              console.log('✅ [Conversation] Đã hiểu grammar fix');
            }}
          />
        )}
      </View>
    );
  }, [setup?.persona, accentColor]);

  const keyExtractor = useCallback((item: ConversationMessage) => item.id, []);

  // ===========================
  // Badge hiển thị Timer / Turn (CR-14: no emoji in title)
  // ===========================
  const statusBadge = useMemo(() => {
    if (mode === 'free-talk') {
      return (
        <View style={[styles.badge, {backgroundColor: `${accentColor}20`}]}>
          <AppText variant="bodySmall" weight="bold" style={{color: accentColor}} raw>
            {formatTime(session?.remainingTime ?? 0)}
          </AppText>
        </View>
      );
    }
    return (
      <View style={[styles.badge, {backgroundColor: `${accentColor}20`}]}>
        <AppText variant="bodySmall" weight="bold" style={{color: accentColor}} raw>
          Turn {session?.currentTurn ?? 0}/{setup?.maxTurns ?? 8}
        </AppText>
      </View>
    );
  }, [mode, accentColor, session?.remainingTime, session?.currentTurn, setup?.maxTurns]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={10}>

        {/* TopBar (CR-14: no emoji) */}
        <View style={[styles.topBar, {borderBottomColor: colors.glassBorder}]}>
          <TouchableOpacity onPress={handleBack} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="ChevronLeft" className="w-6 h-6 text-foreground" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <AppText variant="body" weight="bold" raw>
              {mode === 'free-talk' ? 'Free Talk' : 'Roleplay'}
            </AppText>
            {statusBadge}
          </View>

          <TouchableOpacity
            onPress={handleEndSession}
            style={[styles.endBtn, {backgroundColor: '#EF444420'}]}>
            <AppText variant="caption" weight="bold" style={{color: '#EF4444'}} raw>
              Kết thúc
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Context Banner — Roleplay only (CR-03: use component) */}
        {mode === 'roleplay' && setup && (
          <ContextBanner
            title={setup.topicName}
            description={setup.topicDescription || ''}
            difficulty={setup.difficulty}
            persona={setup.persona ? {
              name: setup.persona.name,
              avatar: setup.persona.avatar,
            } : undefined}
            accentColor={accentColor}
          />
        )}

        {/* Chat List (EC-08: smart scroll) */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{paddingVertical: 12, paddingBottom: 60}}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => { userScrolledRef.current = true; }}
          onScrollToIndexFailed={() => {}}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <AppText variant="body" style={{color: colors.neutrals400, textAlign: 'center'}} raw>
                Hãy bắt đầu cuộc trò chuyện...
              </AppText>
            </View>
          }
        />

        {/* AI Thinking Indicator (CR-02: use component) */}
        {ai.isThinking && (
          <AIThinkingIndicator
            personaName={setup?.persona?.name}
            accentColor={accentColor}
          />
        )}

        {/* Suggested Responses — Free Talk + Beginner (UI-14: icon on chips) */}
        {setup?.options.showSuggestions && ai.suggestedResponses.length > 0 && isActive && (
          <SuggestedResponses
            suggestions={ai.suggestedResponses}
            onSelect={handleSendMessage}
            disabled={ai.isThinking}
          />
        )}

        {/* Input Bar (UI-05: keyboard toggle + "Giữ để nói") */}
        <View style={[styles.inputBar, {borderTopColor: colors.glassBorder, backgroundColor: colors.background}]}>
          <TextInput
            style={[styles.textInput, {backgroundColor: colors.surface, color: colors.foreground}]}
            placeholder="Gõ tin nhắn..."
            placeholderTextColor={colors.neutrals400}
            value={textInput}
            onChangeText={setTextInput}
            editable={isActive && !ai.isThinking}
            onSubmitEditing={() => handleSendMessage(textInput)}
            returnKeyType="send"
          />

          {/* Keyboard/Mic toggle (UI-05) */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setInputMode(prev => prev === 'voice' ? 'text' : 'voice')}
            activeOpacity={0.7}>
            <Icon
              name={inputMode === 'voice' ? 'Keyboard' : 'Mic'}
              className="w-5 h-5"
              style={{color: colors.neutrals400}}
            />
          </TouchableOpacity>

          {/* Nút gửi / mic */}
          {textInput.trim() ? (
            <TouchableOpacity
              style={[styles.sendBtn, {backgroundColor: accentColor}]}
              onPress={() => handleSendMessage(textInput)}
              disabled={ai.isThinking}>
              <Icon name="Send" className="w-5 h-5" style={{color: '#000'}} />
            </TouchableOpacity>
          ) : (
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                style={[styles.sendBtn, {backgroundColor: `${accentColor}20`}]}
                onPress={() => {
                  // TODO: Integrate hold-to-record + RecordingOverlay (CR-04)
                  console.log('🎤 [Conversation] Bắt đầu ghi âm');
                }}
                disabled={ai.isThinking || !isActive}>
                <Icon name="Mic" className="w-5 h-5" style={{color: accentColor}} />
              </TouchableOpacity>
              {/* "Giữ để nói" label (UI-05) */}
              <AppText variant="caption" style={{color: colors.neutrals400, fontSize: 10, marginTop: 2}} raw>
                Giữ để nói
              </AppText>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyState: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

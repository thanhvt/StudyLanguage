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
import RecordingOverlay from '@/components/speaking/RecordingOverlay';
import {useColors} from '@/hooks/useColors';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useConversationSession} from '@/hooks/useConversationSession';
import {useConversationTimer} from '@/hooks/useConversationTimer';
import {useAudioRecorder} from '@/hooks/useAudioRecorder';
import {getConversationColor} from '@/config/skillColors';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';
import type {ConversationMessage} from '@/store/useSpeakingStore';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình hội thoại AI — thống nhất cho Free Talk & Roleplay
 * Tham số đầu vào: không có (đọc state từ useSpeakingStore + hooks)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConversationSetupScreen → nhấn "Bắt đầu" → navigate ConversationSession
 *   Kết thúc session → navigate SessionSummary
 */
export default function ConversationScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const flatListRef = useRef<FlatList>(null);
  const userScrolledRef = useRef(false); // Smart scroll (EC-08)
  const endingRef = useRef(false); // Prevent double-end (CR-08)

  // ===========================
  // Store (UI-only reads)
  // ===========================
  const setup = useSpeakingStore(s => s.conversationSetup);
  const session = useSpeakingStore(s => s.conversationSession);
  const ai = useSpeakingStore(s => s.conversationAI);
  const startConversation = useSpeakingStore(s => s.startConversation);
  const addConversationMessage = useSpeakingStore(s => s.addConversationMessage);
  const tickConversationTimer = useSpeakingStore(s => s.tickConversationTimer);

  // Derived
  const mode = setup?.mode ?? 'free-talk';
  const accentColor = getConversationColor(mode);
  const isActive = session?.isActive ?? false;
  const messages = session?.messages ?? [];

  // ===========================
  // Hooks (CR-06/09/10)
  // ===========================
  const {sendMessage, endSession} = useConversationSession();
  const [recorderState, recorderActions] = useAudioRecorder();
  useConversationTimer(
    setup?.durationMinutes ?? 5,
    mode === 'free-talk' && isActive,
    tickConversationTimer,
    () => {
      // Timer hết giờ → kết thúc
      if (!endingRef.current) {
        endingRef.current = true;
        handleEndAndNavigate();
      }
    },
  );

  // Local UI state
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

    if (!session?.isActive) {
      startConversation();

      // Greeting message
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
  // Auto-end khi store deactivate (turns/shouldEnd)
  // ===========================
  useEffect(() => {
    if (session && !session.isActive && messages.length > 0 && !endingRef.current) {
      endingRef.current = true;
      handleEndAndNavigate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.isActive]);

  // ===========================
  // Smart auto-scroll (EC-08)
  // ===========================
  useEffect(() => {
    if (messages.length > 0 && !userScrolledRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 200);
    }
  }, [messages.length]);

  // ===========================
  // Actions
  // ===========================

  /**
   * Mục đích: Kết thúc session và navigate tới Summary
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Timer hết, max turns reached, AI shouldEnd, user nhấn "Kết thúc"
   */
  const handleEndAndNavigate = useCallback(async () => {
    await endSession();
    navigation.navigate('SessionSummary');
  }, [endSession, navigation]);

  /**
   * Mục đích: Gửi tin nhắn text
   * Tham số đầu vào: text (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Nhấn send button, tap suggestion, hoặc sau STT
   */
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setTextInput('');
    userScrolledRef.current = false;
    await sendMessage(text);
  }, [sendMessage]);

  /**
   * Mục đích: Xử lý khi user thả mic (stop recording + transcribe + send)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: onPressOut trên mic button — kết thúc recording
   */
  const handleRecordingStop = useCallback(async () => {
    const result = await recorderActions.stopRecording();
    if (result?.transcript) {
      userScrolledRef.current = false;
      await sendMessage(result.transcript);
    }
  }, [recorderActions, sendMessage]);

  /**
   * Mục đích: Xác nhận thoát giữa session
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn back button
   */
  const handleBack = useCallback(() => {
    if (messages.length > 0 && isActive) {
      Alert.alert(
        'Kết thúc hội thoại?',
        'Bạn có muốn kết thúc và xem kết quả không?',
        [
          {text: 'Tiếp tục', style: 'cancel'},
          {text: 'Kết thúc', style: 'destructive', onPress: handleEndAndNavigate},
        ],
      );
    } else {
      navigation.goBack();
    }
  }, [messages.length, isActive, handleEndAndNavigate, navigation]);

  // ===========================
  // Render helpers
  // ===========================

  const renderItem = useCallback(({item}: {item: ConversationMessage}) => (
    <View>
      <ChatBubble
        message={item}
        persona={setup?.persona || undefined}
        accentColor={accentColor}
        onPlayAudio={url => console.log('🔊 Phát audio:', url)}
      />
      {item.pronunciationFeedback && (
        <PronunciationAlert
          correction={item.pronunciationFeedback}
          onPlaySample={w => console.log('🔊 Phát mẫu:', w)}
          onReSpeak={w => console.log('🎤 Thử lại:', w)}
        />
      )}
      {item.grammarCorrections && item.grammarCorrections.length > 0 && (
        <GrammarFix
          corrections={item.grammarCorrections}
          onDismiss={() => console.log('✅ Đã hiểu grammar')}
        />
      )}
    </View>
  ), [setup?.persona, accentColor]);

  const keyExtractor = useCallback((item: ConversationMessage) => item.id, []);

  const statusBadge = useMemo(() => {
    if (mode === 'free-talk') {
      const m = Math.floor((session?.remainingTime ?? 0) / 60);
      const s = (session?.remainingTime ?? 0) % 60;
      const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      return (
        <View style={[styles.badge, {backgroundColor: `${accentColor}20`}]}>
          <AppText variant="bodySmall" weight="bold" style={{color: accentColor}} raw>
            {formatted}
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

  // ===========================
  // JSX
  // ===========================
  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={10}>

        {/* TopBar */}
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
            onPress={handleEndAndNavigate}
            style={[styles.endBtn, {backgroundColor: '#EF444420'}]}>
            <AppText variant="caption" weight="bold" style={{color: '#EF4444'}} raw>
              Kết thúc
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Context Banner — Roleplay only */}
        {mode === 'roleplay' && setup && (
          <ContextBanner
            title={setup.topicName}
            description={setup.topicDescription || ''}
            difficulty={setup.difficulty}
            persona={setup.persona ? {name: setup.persona.name, avatar: setup.persona.avatar} : undefined}
            accentColor={accentColor}
          />
        )}

        {/* Chat List */}
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

        {/* AI Thinking Indicator */}
        {ai.isThinking && (
          <AIThinkingIndicator personaName={setup?.persona?.name} accentColor={accentColor} />
        )}

        {/* Suggested Responses */}
        {setup?.options.showSuggestions && ai.suggestedResponses.length > 0 && isActive && (
          <SuggestedResponses
            suggestions={ai.suggestedResponses}
            onSelect={handleSend}
            disabled={ai.isThinking}
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, {borderTopColor: colors.glassBorder, backgroundColor: colors.background}]}>
          <TextInput
            style={[styles.textInput, {backgroundColor: colors.surface, color: colors.foreground}]}
            placeholder="Gõ tin nhắn..."
            placeholderTextColor={colors.neutrals400}
            value={textInput}
            onChangeText={setTextInput}
            editable={isActive && !ai.isThinking && !recorderState.isRecording}
            onSubmitEditing={() => handleSend(textInput)}
            returnKeyType="send"
          />

          {/* Keyboard/Mic toggle */}
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

          {/* Send / Mic button */}
          {textInput.trim() ? (
            <TouchableOpacity
              style={[styles.sendBtn, {backgroundColor: accentColor}]}
              onPress={() => handleSend(textInput)}
              disabled={ai.isThinking}>
              <Icon name="Send" className="w-5 h-5" style={{color: '#000'}} />
            </TouchableOpacity>
          ) : (
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                style={[styles.sendBtn, {backgroundColor: `${accentColor}20`}]}
                onLongPress={recorderActions.startRecording}
                onPressOut={handleRecordingStop}
                delayLongPress={200}
                disabled={ai.isThinking || !isActive}>
                <Icon name="Mic" className="w-5 h-5" style={{color: accentColor}} />
              </TouchableOpacity>
              <AppText variant="caption" style={{color: colors.neutrals400, fontSize: 10, marginTop: 2}} raw>
                Giữ để nói
              </AppText>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Recording Overlay (CR-04) */}
      <RecordingOverlay
        visible={recorderState.isRecording}
        duration={recorderState.duration}
        waveform={recorderState.waveform}
        accentColor={accentColor}
        onStop={handleRecordingStop}
        onCancel={recorderActions.cancelRecording}
      />
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {flex: 1},
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

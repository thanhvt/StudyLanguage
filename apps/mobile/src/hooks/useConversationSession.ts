import {useCallback, useRef} from 'react';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import type {ConversationMessage} from '@/store/useSpeakingStore';

// =======================
// Hook
// =======================

/**
 * Mục đích: Hook tổng hợp logic cho AI Conversation session
 *   - Gửi tin nhắn + nhận AI response
 *   - Check grammar/pronunciation inline
 *   - Quản lý turn counter (Roleplay)
 *   - Kết thúc session + sinh summary
 * Tham số đầu vào: không (đọc state từ useSpeakingStore)
 * Tham số đầu ra: {sendMessage, endSession, isProcessing}
 * Khi nào sử dụng:
 *   ConversationScreen → const {sendMessage, endSession} = useConversationSession()
 *   User gõ text hoặc tap suggestion → sendMessage(text)
 *   Session hết giờ/turn → endSession()
 */
export function useConversationSession() {
  const isProcessingRef = useRef(false);

  // Store selectors
  const setup = useSpeakingStore(s => s.conversationSetup);
  const session = useSpeakingStore(s => s.conversationSession);
  const addMessage = useSpeakingStore(s => s.addConversationMessage);
  const incrementTurn = useSpeakingStore(s => s.incrementTurn);
  const setAIThinking = useSpeakingStore(s => s.setAIThinking);
  const setSuggestedResponses = useSpeakingStore(s => s.setSuggestedResponses);
  const endConversation = useSpeakingStore(s => s.endConversation);
  const setSummary = useSpeakingStore(s => s.setConversationSummary);

  /**
   * Mục đích: Gửi tin nhắn user → AI xử lý → trả response + inline feedback
   * Tham số đầu vào: text (string) — nội dung user
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn send, tap suggestion, hoặc sau khi transcribe xong
   */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessingRef.current || !session?.isActive) return;

    isProcessingRef.current = true;
    const mode = setup?.mode ?? 'free-talk';
    const messages = session?.messages ?? [];

    // 1. Thêm tin nhắn user
    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    // 2. Tăng turn (Roleplay)
    if (mode === 'roleplay') {
      incrementTurn();
    }

    // 3. AI trả lời
    setAIThinking(true);
    try {
      const result = await speakingApi.continueConversation(
        [...messages, userMsg].map(m => ({speaker: m.role, text: m.text})),
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

      // 4. Thêm AI response
      const aiMsg: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: result.response,
        timestamp: Date.now(),
        pronunciationFeedback: result.pronunciationFeedback || undefined,
        grammarCorrections: result.corrections ?? [],
      };
      addMessage(aiMsg);

      // 5. Gợi ý cho beginner
      if (result.suggestedResponses?.length) {
        setSuggestedResponses(result.suggestedResponses);
      }

      // 6. AI yêu cầu kết thúc
      if (result.shouldEnd) {
        console.log('🤖 [ConversationSession] AI yêu cầu kết thúc');
        endConversation();
      }
    } catch (err) {
      console.error('❌ [ConversationSession] Lỗi gọi API:', err);
      addMessage({
        id: `system-error-${Date.now()}`,
        role: 'system',
        text: 'Có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: Date.now(),
      });
    } finally {
      setAIThinking(false);
      isProcessingRef.current = false;
    }
  }, [setup, session, addMessage, incrementTurn, setAIThinking, setSuggestedResponses, endConversation]);

  /**
   * Mục đích: Kết thúc session và sinh AI summary
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Timer hết (Free Talk), max turns (Roleplay), AI shouldEnd, user nhấn "Kết thúc"
   */
  const endSession = useCallback(async () => {
    endConversation();
    const messages = session?.messages ?? [];
    const mode = setup?.mode ?? 'free-talk';

    try {
      const summaryData = await speakingApi.generateSessionSummary(
        messages.map(m => ({role: m.role, text: m.text})),
        mode,
        mode === 'free-talk'
          ? (setup?.durationMinutes ?? 5) * 60
          : messages.filter(m => m.role === 'user').length,
      );

      setSummary({
        totalTime: mode === 'free-talk' ? (setup?.durationMinutes ?? 5) * 60 : 0,
        totalTurns: messages.filter(m => m.role === 'user').length,
        overallScore: summaryData.overallScore,
        grade: summaryData.grade,
        pronunciationIssues: summaryData.pronunciationIssues,
        grammarFixes: summaryData.grammarFixes,
        aiFeedback: summaryData.aiFeedback,
        scenarioBadge: mode === 'roleplay' ? setup?.topicName ?? null : null,
      });
    } catch {
      console.error('❌ [ConversationSession] Lỗi sinh summary');
      setSummary({
        totalTime: 0,
        totalTurns: messages.filter(m => m.role === 'user').length,
        overallScore: 0,
        grade: 'N/A',
        pronunciationIssues: [],
        grammarFixes: [],
        aiFeedback: 'Không thể tạo tổng kết.',
        scenarioBadge: null,
      });
    }
  }, [endConversation, session, setup, setSummary]);

  return {
    sendMessage,
    endSession,
    isProcessing: isProcessingRef.current,
  };
}

import {useCallback, useRef} from 'react';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {speakingApi} from '@/services/api/speaking';
import {useHaptic} from '@/hooks/useHaptic';
import type {ConversationMessage} from '@/store/useSpeakingStore';

// =======================
// Constants
// =======================

/** Timeout cho AI response — tránh spinner vĩnh viễn (EC-04) */
const AI_RESPONSE_TIMEOUT_MS = 10_000;

/** Debounce delay — tránh double message (EC-05) */
const SEND_DEBOUNCE_MS = 500;

/** Số lần retry khi lỗi mạng (EC-03) */
const MAX_RETRIES = 1;

/** Delay trước khi retry (ms) */
const RETRY_DELAY_MS = 3000;

// =======================
// Hook
// =======================

/**
 * Mục đích: Hook tổng hợp logic cho AI Conversation session
 *   - Gửi tin nhắn + nhận AI response (có timeout + debounce)
 *   - Inline pronunciation / grammar feedback
 *   - Quản lý turn counter (Roleplay)
 *   - Kết thúc session + sinh summary (có fallback)
 *   - Network error handling (EC-03)
 * Tham số đầu vào: không (đọc state từ useSpeakingStore)
 * Tham số đầu ra: { sendMessage, endSession, isProcessing }
 * Khi nào sử dụng:
 *   ConversationScreen → const {sendMessage, endSession} = useConversationSession()
 *   User gõ text hoặc tap suggestion → sendMessage(text)
 *   Session hết giờ/turn → endSession()
 */
export function useConversationSession() {
  const sendLockRef = useRef(false); // Debounce guard (EC-05)
  const haptic = useHaptic();

  // Store selectors — dùng getState() cho latest value trong async
  const getSetup = () => useSpeakingStore.getState().conversationSetup;
  const getSession = () => useSpeakingStore.getState().conversationSession;

  // Store actions
  const addMessage = useSpeakingStore(s => s.addConversationMessage);
  const incrementTurn = useSpeakingStore(s => s.incrementTurn);
  const setAIThinking = useSpeakingStore(s => s.setAIThinking);
  const setSuggestedResponses = useSpeakingStore(s => s.setSuggestedResponses);
  const endConversation = useSpeakingStore(s => s.endConversation);
  const setSummary = useSpeakingStore(s => s.setConversationSummary);

  /**
   * Mục đích: Gọi API AI với timeout + retry (internal helper)
   * Tham số đầu vào: messages, text, setup config, retryCount
   * Tham số đầu ra: Promise<API result>
   * Khi nào sử dụng: Được gọi bởi sendMessage()
   */
  const callAIWithTimeout = useCallback(async (
    historyForApi: {speaker: string; text: string}[],
    userText: string,
    topicName: string,
    options: Record<string, unknown>,
    retryCount = 0,
  ): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_RESPONSE_TIMEOUT_MS);

    try {
      const result = await speakingApi.continueConversation(
        historyForApi,
        userText,
        topicName,
        options,
      );
      clearTimeout(timeoutId);
      return result;
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Nếu timeout hoặc network error → retry 1 lần (EC-03)
      const isTimeout = err?.name === 'AbortError';
      const isNetworkError = err?.message?.includes('Network') || err?.message?.includes('fetch');

      if ((isTimeout || isNetworkError) && retryCount < MAX_RETRIES) {
        console.log(`🔄 [ConversationSession] Retry lần ${retryCount + 1}...`);
        await new Promise<void>(resolve => setTimeout(() => resolve(), RETRY_DELAY_MS));
        return callAIWithTimeout(historyForApi, userText, topicName, options, retryCount + 1);
      }

      throw err;
    }
  }, []);

  /**
   * Mục đích: Gửi tin nhắn user → AI xử lý → trả response + inline feedback
   * Tham số đầu vào: text (string) — nội dung user
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn send, tap suggestion, hoặc sau khi transcribe xong
   */
  const sendMessage = useCallback(async (text: string) => {
    const session = getSession();
    const setup = getSetup();

    if (!text.trim() || !session?.isActive) return;

    // Debounce guard (EC-05)
    if (sendLockRef.current) return;
    sendLockRef.current = true;
    setTimeout(() => { sendLockRef.current = false; }, SEND_DEBOUNCE_MS);

    haptic.light();

    const mode = setup?.mode ?? 'free-talk';
    const currentMessages = session?.messages ?? [];

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

    // 3. AI trả lời (có timeout + retry)
    setAIThinking(true);
    try {
      const result = await callAIWithTimeout(
        [...currentMessages, userMsg].map(m => ({speaker: m.role, text: m.text})),
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
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      console.error('❌ [ConversationSession] Lỗi:', isTimeout ? 'Timeout' : err?.message);

      // Hiện system message phân biệt lỗi
      addMessage({
        id: `system-error-${Date.now()}`,
        role: 'system',
        text: isTimeout
          ? '⏰ AI không phản hồi kịp. Vui lòng thử lại.'
          : '⚠️ Lỗi kết nối. Kiểm tra mạng và thử lại.',
        timestamp: Date.now(),
      });
    } finally {
      setAIThinking(false);
    }
  }, [haptic, addMessage, incrementTurn, setAIThinking, setSuggestedResponses, endConversation, callAIWithTimeout]);

  /**
   * Mục đích: Kết thúc session và sinh AI summary
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Timer hết (Free Talk), max turns (Roleplay), AI shouldEnd, user nhấn "Kết thúc"
   */
  const endSession = useCallback(async () => {
    const session = getSession();
    const setup = getSetup();
    const messages = session?.messages ?? [];
    const mode = setup?.mode ?? 'free-talk';

    endConversation();

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
      console.error('❌ [ConversationSession] Lỗi sinh summary — dùng fallback');
      // EC-09: Fallback data để Summary screen không stuck
      setSummary({
        totalTime: mode === 'free-talk' ? (setup?.durationMinutes ?? 5) * 60 : 0,
        totalTurns: messages.filter(m => m.role === 'user').length,
        overallScore: 0,
        grade: 'N/A',
        pronunciationIssues: [],
        grammarFixes: [],
        aiFeedback: 'Không thể tạo tổng kết. Vui lòng thử lại.',
        scenarioBadge: null,
      });
    }
  }, [endConversation, setSummary]);

  return {
    sendMessage,
    endSession,
    /** Kiểm tra đang xử lý — dùng sendLockRef nên luôn sync */
    get isProcessing() { return sendLockRef.current; },
  };
}

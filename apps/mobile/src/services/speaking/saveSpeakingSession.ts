/**
 * Mục đích: Unified helper lưu speaking session vào history DB
 * Tham số đầu vào: mode (string), data (mode-specific payload)
 * Tham số đầu ra: Promise<void> — fire-and-forget, không block UI
 * Khi nào sử dụng: Gọi khi user hoàn thành session ở bất kỳ mode nào:
 *   - Practice → FeedbackScreen → handleFinish / handleNext (câu cuối)
 *   - AI Conversation → SessionSummaryScreen → mount
 *   - Shadowing → ShadowingSessionSummaryScreen → mount
 *   - Tongue Twister → completion handler
 *
 * Luồng: Screen → saveSpeakingSession() → historyApi.createEntry() → POST /history
 */

import {createEntry} from '@/services/api/history';
import type {CreateHistoryParams} from '@/services/api/history';

// =======================
// Types cho từng mode
// =======================

/**
 * Mục đích: Payload Practice mode (PRC-15)
 */
export interface PracticeSessionData {
  topic: string;
  sentences: {text: string; ipa?: string}[];
  scores: {
    sentenceIndex: number;
    overallScore: number;
    grade?: string;
    wordScores?: {word: string; score: number; ipa?: string}[];
  }[];
  durationSeconds: number;
  audioUri?: string;
}

/**
 * Mục đích: Payload AI Conversation mode (Free Talk / Roleplay)
 */
export interface ConversationSessionData {
  topic: string;
  subMode: 'free-talk' | 'roleplay';
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }[];
  pronunciationAlerts?: {word: string; ipa: string; tip: string}[];
  grammarCorrections?: {wrong: string; correct: string; explanation: string}[];
  summary?: {
    totalTurns: number;
    score: number;
    aiNotes: string;
  };
  durationSeconds: number;
  persona?: {name: string; role: string};
  difficulty?: string;
}

/**
 * Mục đích: Payload Shadowing mode
 */
export interface ShadowingSessionData {
  topic: string;
  sentences: {text: string; ipa?: string}[];
  scores: {
    sentenceIndex: number;
    rhythm: number;
    intonation: number;
    accuracy: number;
    overall: number;
    tips?: string[];
  }[];
  speed: number;
  durationSeconds: number;
}

/**
 * Mục đích: Payload Tongue Twister mode
 */
export interface TongueTwisterSessionData {
  phonemeCategory: string;
  level: string;
  twisters: {text: string; ipa?: string; targetPhonemes?: string[]}[];
  scores: {
    twisterIndex: number;
    pronunciation: number;
    phonemeHits?: {phoneme: string; word: string; isCorrect: boolean}[];
    tip?: string;
  }[];
  speedChallenge?: {
    rounds: {round: number; speed: number; wpm: number; accuracy: number}[];
    bestWPM: number;
  };
  durationSeconds: number;
}

// =======================
// Main function
// =======================

/**
 * Mục đích: Lưu speaking session vào history — fire-and-forget
 * Tham số đầu vào:
 *   mode — 'practice' | 'conversation-freetalk' | 'conversation-roleplay' | 'shadowing' | 'tongue-twister'
 *   data — mode-specific payload (xem interfaces ở trên)
 * Tham số đầu ra: void
 * Khi nào sử dụng: Mỗi mode gọi khi session kết thúc, không await/block UI
 */
export async function saveSpeakingSession(
  mode: string,
  data:
    | PracticeSessionData
    | ConversationSessionData
    | ShadowingSessionData
    | TongueTwisterSessionData,
): Promise<void> {
  try {
    const params = mapToHistoryParams(mode, data);
    await createEntry(params);
    console.log('✅ [SpeakingHistory] Đã lưu session:', mode);
  } catch (err) {
    // Fire-and-forget: chỉ log, không throw để không block UI
    console.error('❌ [SpeakingHistory] Lỗi lưu session:', mode, err);
  }
}

/**
 * Mục đích: Map dữ liệu mode-specific → CreateHistoryParams chuẩn
 * Tham số đầu vào: mode, data
 * Tham số đầu ra: CreateHistoryParams (khớp backend CreateHistoryEntryDto)
 * Khi nào sử dụng: Được gọi bởi saveSpeakingSession()
 */
function mapToHistoryParams(
  mode: string,
  data:
    | PracticeSessionData
    | ConversationSessionData
    | ShadowingSessionData
    | TongueTwisterSessionData,
): CreateHistoryParams {
  // BUG-H07 FIX: Dùng Math.ceil thay vì Math.round để không làm tròn xuống 0
  // 30s → 1min, 90s → 2min, 5s → 1min (ceil luôn >= 1 nếu > 0)
  const durationMinutes = Math.max(1, Math.ceil(data.durationSeconds / 60));

  switch (mode) {
    case 'practice': {
      const d = data as PracticeSessionData;
      const avgScore =
        d.scores.length > 0
          ? Math.round(
              d.scores.reduce((sum, s) => sum + s.overallScore, 0) /
                d.scores.length,
            )
          : 0;
      return {
        type: 'speaking',
        topic: d.topic,
        mode: 'practice',
        durationMinutes,
        keywords: `practice,pronunciation,score:${avgScore}`,
        audioUrl: d.audioUri,
        content: {
          sentences: d.sentences,
          scores: d.scores,
          avgScore,
          totalSentences: d.sentences.length,
          completedSentences: d.scores.length,
        } as Record<string, unknown>,
      };
    }

    case 'conversation-freetalk':
    case 'conversation-roleplay': {
      const d = data as ConversationSessionData;
      return {
        type: 'speaking',
        topic: d.topic,
        mode: d.subMode === 'roleplay' ? 'conversation-roleplay' : 'conversation-freetalk',
        durationMinutes,
        keywords: [
          'conversation',
          d.subMode,
          d.persona?.name,
          d.difficulty,
        ]
          .filter(Boolean)
          .join(','),
        content: {
          messages: d.messages,
          pronunciationAlerts: d.pronunciationAlerts || [],
          grammarCorrections: d.grammarCorrections || [],
          summary: d.summary || null,
          persona: d.persona || null,
          difficulty: d.difficulty || null,
          totalTurns: d.messages.filter(m => m.role === 'user').length,
        } as Record<string, unknown>,
      };
    }

    case 'shadowing': {
      const d = data as ShadowingSessionData;
      const avgOverall =
        d.scores.length > 0
          ? Math.round(
              d.scores.reduce((sum, s) => sum + s.overall, 0) /
                d.scores.length,
            )
          : 0;
      return {
        type: 'speaking',
        topic: d.topic,
        mode: 'shadowing',
        durationMinutes,
        keywords: `shadowing,speed:${d.speed}x,score:${avgOverall}`,
        content: {
          sentences: d.sentences,
          scores: d.scores,
          speed: d.speed,
          avgOverall,
          totalSentences: d.sentences.length,
          completedSentences: d.scores.length,
        } as Record<string, unknown>,
      };
    }

    case 'tongue-twister': {
      const d = data as TongueTwisterSessionData;
      const avgScore =
        d.scores.length > 0
          ? Math.round(
              d.scores.reduce((sum, s) => sum + s.pronunciation, 0) /
                d.scores.length,
            )
          : 0;
      return {
        type: 'speaking',
        topic: `Tongue Twister: ${d.phonemeCategory}`,
        mode: 'tongue-twister',
        durationMinutes,
        keywords: [
          'tongue-twister',
          d.phonemeCategory,
          d.level,
          d.speedChallenge ? `wpm:${d.speedChallenge.bestWPM}` : null,
          `score:${avgScore}`,
        ]
          .filter(Boolean)
          .join(','),
        content: {
          phonemeCategory: d.phonemeCategory,
          level: d.level,
          twisters: d.twisters,
          scores: d.scores,
          speedChallenge: d.speedChallenge || null,
          avgScore,
          totalTwisters: d.twisters.length,
          completedTwisters: d.scores.length,
        } as Record<string, unknown>,
      };
    }

    default: {
      // BUG-H08 FIX: Serialize an toàn — tránh circular ref, class instances
      let safeContent: Record<string, unknown> = {};
      try {
        safeContent = JSON.parse(JSON.stringify(data));
      } catch {
        console.warn('⚠️ [SpeakingHistory] Không thể serialize data cho mode:', mode);
        safeContent = {rawMode: mode, error: 'serialize_failed'};
      }
      return {
        type: 'speaking',
        topic: 'Unknown Speaking Session',
        mode,
        durationMinutes,
        content: safeContent,
      };
    }
  }
}

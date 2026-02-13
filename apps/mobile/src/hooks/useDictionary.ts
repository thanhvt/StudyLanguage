import {useState, useCallback} from 'react';
import {apiClient} from '@/services/api/client';

// =======================
// Interfaces
// =======================

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
  }[];
}

export interface DictionaryResult {
  word: string;
  ipa: string | null;
  audio: string | null;
  meanings: DictionaryMeaning[];
}

export interface UseDictionaryReturn {
  result: DictionaryResult | null;
  isLoading: boolean;
  error: string | null;
  lookup: (word: string) => Promise<void>;
  clear: () => void;
}

/**
 * Mục đích: Hook tra từ điển qua Backend API (proxy Free Dictionary API)
 * Tham số đầu vào: không có
 * Tham số đầu ra: UseDictionaryReturn { result, isLoading, error, lookup, clear }
 * Khi nào sử dụng: PlayerScreen → DictionaryPopup khi user tap vào từ trong transcript
 *   - Gọi GET /dictionary/lookup?word=...
 *   - Backend có cache 5 phút, trả về ipa, meanings, audio URL
 *   - Loading + error states cho UI
 */
export function useDictionary(): UseDictionaryReturn {
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mục đích: Tra nghĩa 1 từ tiếng Anh
   * Tham số đầu vào: word (string) — từ cần tra
   * Tham số đầu ra: void — cập nhật state result/error/isLoading
   * Khi nào sử dụng: User tap vào 1 từ trong transcript
   */
  const lookup = useCallback(async (word: string) => {
    const cleanWord = word.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    if (!cleanWord) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📖 [useDictionary] Đang tra từ:', cleanWord);

      const response = await apiClient.get('/dictionary/lookup', {
        params: {word: cleanWord},
      });

      const data = response.data?.result;

      if (!data) {
        throw new Error(`Không tìm thấy từ "${word}"`);
      }

      setResult({
        word: data.word || cleanWord,
        ipa: data.ipa || null,
        audio: data.audio || null,
        meanings: (data.meanings || []).map(
          (m: {
            partOfSpeech: string;
            definitions: {definition: string; example?: string}[];
          }) => ({
            partOfSpeech: m.partOfSpeech,
            definitions: (m.definitions || []).slice(0, 3).map(d => ({
              definition: d.definition,
              example: d.example,
            })),
          }),
        ),
      });

      console.log('✅ [useDictionary] Đã tìm thấy nghĩa cho:', cleanWord);
    } catch (err: any) {
      const message =
        err?.response?.status === 404
          ? `Không tìm thấy từ "${word}"`
          : err?.message || 'Lỗi tra từ điển';
      console.error('❌ [useDictionary] Lỗi:', message);
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mục đích: Reset state về rỗng
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi đóng DictionaryPopup
   */
  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    result,
    isLoading,
    error,
    lookup,
    clear,
  };
}

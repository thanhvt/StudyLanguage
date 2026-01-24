'use client';

import { useState, useCallback } from 'react';

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
  }[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string;
  phoneticAudio?: string;
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
 * useDictionary - Hook để tra từ điển từ Free Dictionary API
 * 
 * API: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 * 
 * Features:
 * - Hiển thị phonetics + pronunciation audio
 * - Multiple definitions với examples
 * - Loading & error states
 * - Google fallback link
 */
export function useDictionary(): UseDictionaryReturn {
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      console.log('[useDictionary] Looking up:', cleanWord);

      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Không tìm thấy từ "${word}"`);
        }
        throw new Error('Lỗi tra từ điển');
      }

      const data = await response.json();
      const entry = data[0];

      // Find phonetic audio
      const phoneticAudio = entry.phonetics?.find(
        (p: { audio?: string }) => p.audio
      )?.audio;

      setResult({
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
        phoneticAudio,
        meanings: entry.meanings.map((m: { 
          partOfSpeech: string; 
          definitions: { definition: string; example?: string }[] 
        }) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions.slice(0, 3).map((d) => ({
            definition: d.definition,
            example: d.example,
          })),
        })),
      });

      console.log('[useDictionary] Found definition for:', cleanWord);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi tra từ điển';
      console.error('[useDictionary] Error:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

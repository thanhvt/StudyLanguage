'use client';

import { useState } from 'react';

interface DictionaryPopupProps {
  word: string;
  onClose: () => void;
}

interface DictionaryResult {
  word: string;
  phonetic: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

/**
 * DictionaryPopup Component
 *
 * Mục đích: Hiển thị nghĩa của từ khi user click vào từ trong bài đọc
 * Tham số:
 *   - word: Từ cần tra
 *   - onClose: Callback đóng popup
 * Khi nào sử dụng: Trong Reading module khi user click vào từ
 */
export function DictionaryPopup({ word, onClose }: DictionaryPopupProps) {
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch definition từ Free Dictionary API
  useState(() => {
    const fetchDefinition = async () => {
      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );

        if (!response.ok) {
          throw new Error('Không tìm thấy từ này');
        }

        const data = await response.json();
        const entry = data[0];

        setResult({
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
          meanings: entry.meanings.map((m: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) => ({
            partOfSpeech: m.partOfSpeech,
            definitions: m.definitions.slice(0, 3).map((d: { definition: string; example?: string }) => ({
              definition: d.definition,
              example: d.example,
            })),
          })),
        });
      } catch {
        setError('Không thể tra từ này. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{word}</h2>
            {result?.phonetic && (
              <p className="text-muted-foreground text-sm">{result.phonetic}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Đang tra từ...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">❌ {error}</p>
              <p className="text-sm text-muted-foreground">
                Thử tìm trên <a 
                  href={`https://www.google.com/search?q=define+${word}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google
                </a>
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.meanings.map((meaning, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-primary capitalize mb-2">
                    {meaning.partOfSpeech}
                  </h3>
                  <ul className="space-y-2">
                    {meaning.definitions.map((def, defIdx) => (
                      <li key={defIdx} className="pl-4 border-l-2 border-muted">
                        <p>{def.definition}</p>
                        {def.example && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            &ldquo;{def.example}&rdquo;
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ClickableText Component
 *
 * Mục đích: Render text với từng từ có thể click để tra từ điển
 */
export function ClickableText({ 
  text, 
  onWordClick 
}: { 
  text: string; 
  onWordClick: (word: string) => void;
}) {
  const words = text.split(/(\s+)/);

  return (
    <span>
      {words.map((word, index) => {
        // Nếu là khoảng trắng, giữ nguyên
        if (/^\s+$/.test(word)) {
          return <span key={index}>{word}</span>;
        }

        // Loại bỏ dấu câu để lấy từ gốc
        const cleanWord = word.replace(/[.,!?;:"'()]/g, '');

        return (
          <span
            key={index}
            onClick={() => cleanWord && onWordClick(cleanWord)}
            className="cursor-pointer hover:bg-primary/20 hover:text-primary rounded px-0.5 transition-colors"
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

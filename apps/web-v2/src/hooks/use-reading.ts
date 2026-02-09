'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface ReadingArticle {
  title?: string;
  article: string;
  questions: {
    question: string;
    options: string[];
    answer: number;
  }[];
}

export interface GenerateReadingParams {
  topic: string;
  difficulty: 'basic' | 'advanced';
}

export interface UseReadingReturn {
  article: ReadingArticle | null;
  isGenerating: boolean;
  error: string | null;
  generateArticle: (params: GenerateReadingParams) => Promise<void>;
  reset: () => void;
}

/**
 * useReading - Hook để sinh bài đọc từ AI
 * 
 * Features:
 * - Gọi API /ai/generate-text để sinh bài đọc
 * - Parse JSON response
 * - Error handling với toast
 */
export function useReading(): UseReadingReturn {
  const [article, setArticle] = useState<ReadingArticle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateArticle = useCallback(async (params: GenerateReadingParams) => {
    const { topic, difficulty } = params;
    
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('[useReading] Generating article for:', topic, difficulty);
      
      const difficultyText = difficulty === 'basic' 
        ? 'cơ bản (A1-A2)' 
        : 'nâng cao (B1-B2)';

      const response = await api('/conversation-generator/generate-text', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Tạo một bài đọc tiếng Anh về chủ đề "${topic}" ở mức độ ${difficultyText}.

Yêu cầu:
1. Bài đọc dài khoảng 150-200 từ
2. Sau bài đọc, tạo 4 câu hỏi trắc nghiệm (4 đáp án A,B,C,D)

Trả về JSON theo format:
{
  "title": "Tiêu đề bài đọc",
  "article": "Nội dung bài đọc...",
  "questions": [
    { "question": "Câu hỏi 1?", "options": ["A", "B", "C", "D"], "answer": 0 }
  ]
}

Chỉ trả về JSON, không có text khác.`,
        }),
      }, 90000); // 90s timeout for AI generation

      if (!response.ok) {
        throw new Error('Lỗi sinh bài đọc');
      }

      const data = await response.json();
      
      // Parse JSON from AI response
      const jsonMatch = data.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không thể parse kết quả từ AI');
      }
      
      const parsed: ReadingArticle = JSON.parse(jsonMatch[0]);
      
      // Validate response
      if (!parsed.article || !parsed.questions || parsed.questions.length === 0) {
        throw new Error('Dữ liệu bài đọc không hợp lệ');
      }

      console.log('[useReading] Article generated successfully');
      setArticle(parsed);
      toast.success('Đã tạo bài đọc thành công!');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      console.error('[useReading] Error:', err);
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setArticle(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    article,
    isGenerating,
    error,
    generateArticle,
    reset,
  };
}

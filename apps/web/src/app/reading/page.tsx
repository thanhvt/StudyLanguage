'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DictionaryPopup, ClickableText } from '@/components/dictionary-popup';

/**
 * Reading Page - Module Luyện Đọc
 *
 * Mục đích: UI cho tính năng đọc hiểu với câu hỏi AI
 * Flow: Chọn topic → AI sinh bài đọc → Làm quiz → Xem đáp án
 */
export default function ReadingPage() {
  // Form state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'basic' | 'advanced'>('basic');

  // Content state
  const [article, setArticle] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{
    question: string;
    options: string[];
    answer: number;
  }[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dictionary state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  /**
   * Sinh bài đọc và câu hỏi
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowResults(false);
    setUserAnswers([]);

    try {
      const response = await fetch('http://localhost:3001/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tạo một bài đọc tiếng Anh về chủ đề "${topic}" ở mức độ ${difficulty === 'basic' ? 'cơ bản (A1-A2)' : 'nâng cao (B1-B2)'}.

Yêu cầu:
1. Bài đọc dài khoảng 150-200 từ
2. Sau bài đọc, tạo 4 câu hỏi trắc nghiệm (4 đáp án A,B,C,D)

Trả về JSON theo format:
{
  "article": "Nội dung bài đọc...",
  "questions": [
    { "question": "Câu hỏi 1?", "options": ["A", "B", "C", "D"], "answer": 0 }
  ]
}

Chỉ trả về JSON, không có text khác.`,
        }),
      });

      if (!response.ok) throw new Error('Lỗi sinh bài đọc');

      const data = await response.json();
      
      // Parse JSON từ response
      const jsonMatch = data.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không thể parse kết quả');
      
      const parsed = JSON.parse(jsonMatch[0]);
      setArticle(parsed.article);
      setQuestions(parsed.questions);
      setUserAnswers(new Array(parsed.questions.length).fill(-1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Chọn đáp án
   */
  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  /**
   * Nộp bài và xem kết quả
   */
  const handleSubmit = () => {
    setShowResults(true);
  };

  /**
   * Tính điểm
   */
  const calculateScore = () => {
    if (!questions) return 0;
    return questions.reduce((score, q, i) => 
      score + (userAnswers[i] === q.answer ? 1 : 0), 0);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">📖 Luyện Đọc - Active Reading</h1>

      {/* Form nhập thông tin */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tạo bài đọc mới</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chủ đề *</label>
            <Input
              placeholder="VD: Technology, Environment, Travel..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Độ khó</label>
            <div className="flex gap-2">
              <Button
                variant={difficulty === 'basic' ? 'default' : 'outline'}
                onClick={() => setDifficulty('basic')}
                size="sm"
              >
                Cơ bản
              </Button>
              <Button
                variant={difficulty === 'advanced' ? 'default' : 'outline'}
                onClick={() => setDifficulty('advanced')}
                size="sm"
              >
                Nâng cao
              </Button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mt-4"
        >
          {isGenerating ? '⏳ Đang tạo...' : '✨ Tạo bài đọc'}
        </Button>
      </Card>

      {/* Bài đọc */}
      {article && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📝 Bài đọc</h2>
          <p className="text-xs text-muted-foreground mb-2">
            💡 Click vào từ để tra từ điển
          </p>
          <div className="p-4 bg-muted rounded-lg leading-relaxed text-lg">
            <ClickableText text={article} onWordClick={setSelectedWord} />
          </div>
        </Card>
      )}

      {/* Dictionary Popup */}
      {selectedWord && (
        <DictionaryPopup word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      {/* Câu hỏi */}
      {questions && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">❓ Câu hỏi đọc hiểu</h2>
          
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="space-y-2">
                <p className="font-medium">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = userAnswers[qIndex] === oIndex;
                    const isCorrect = q.answer === oIndex;
                    
                    let bgClass = 'bg-muted hover:bg-muted/80';
                    if (showResults) {
                      if (isCorrect) bgClass = 'bg-green-100 dark:bg-green-900/30';
                      else if (isSelected && !isCorrect) bgClass = 'bg-red-100 dark:bg-red-900/30';
                    } else if (isSelected) {
                      bgClass = 'bg-primary/20';
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelectAnswer(qIndex, oIndex)}
                        className={`p-3 rounded-lg text-left transition-colors ${bgClass}`}
                        disabled={showResults}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        {opt}
                        {showResults && isCorrect && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!showResults ? (
            <Button
              onClick={handleSubmit}
              className="mt-6"
              disabled={userAnswers.includes(-1)}
            >
              📊 Nộp bài
            </Button>
          ) : (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">
                Điểm: {calculateScore()}/{questions.length}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setArticle(null);
                  setQuestions(null);
                  setShowResults(false);
                }}
                className="mt-4"
              >
                🔄 Làm bài mới
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

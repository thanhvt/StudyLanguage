'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, RotateCcw, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DictionaryPopup, ClickableText } from '@/components/dictionary-popup';
import { AppLayout } from '@/components/layouts/app-layout';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';
import { useSaveLesson } from '@/hooks/use-save-lesson';
import { FadeIn } from '@/components/animations';

/**
 * Reading Page - Module Luyện Đọc (matching live reference)
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

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // Save lesson hook
  const { saveLesson } = useSaveLesson();

  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setHistoryOpen(false);
    setTopic(entry.topic);
    if (entry.content?.article) {
      setArticle(entry.content.article);
    }
    if (entry.content?.questions) {
      setQuestions(entry.content.questions);
      setUserAnswers(new Array(entry.content.questions.length).fill(-1));
    }
    setShowResults(false);
  };

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
      const response = await api('/ai/generate-text', {
        method: 'POST',
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

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setShowResults(true);
    
    // Lưu vào database
    if (article && questions) {
      const score = questions.reduce((s, q, i) => 
        s + (userAnswers[i] === q.answer ? 1 : 0), 0);
      
      await saveLesson({
        type: 'reading',
        topic,
        content: { article, questions, userAnswers, score },
        status: 'completed',
      });
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    return questions.reduce((score, q, i) => 
      score + (userAnswers[i] === q.answer ? 1 : 0), 0);
  };

  const reset = () => {
    setArticle(null);
    setQuestions(null);
    setUserAnswers([]);
    setShowResults(false);
    setTopic('');
    setSelectedWord(null);
  };

  return (
    <AppLayout>
      <>
        {/* Header với History Button */}
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl skill-card-reading flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Luyện Đọc
                </h1>
                <p className="text-sm text-muted-foreground">Active Reading</p>
              </div>
            </div>
            <HistoryButton onClick={() => setHistoryOpen(true)} />
          </div>
        </FadeIn>

        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          filterType="reading"
          onOpenEntry={handleOpenHistoryEntry}
        />

        {/* Form nhập thông tin */}
        {!article && (
          <FadeIn delay={0.1}>
            <Card className="p-6 mb-6">
              <h2 className="font-display text-lg font-semibold mb-6">Tạo bài đọc mới</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="readingTopic">
                    Chủ đề <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="readingTopic"
                    placeholder="Technology, Environment, Travel, Health..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                {/* Difficulty selector - matching reference */}
                <div className="space-y-2">
                  <Label>Độ khó</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={difficulty === 'basic' ? 'default' : 'outline'}
                      onClick={() => setDifficulty('basic')}
                      className="w-full"
                    >
                      Cơ bản (A1-A2)
                    </Button>
                    <Button
                      type="button"
                      variant={difficulty === 'advanced' ? 'default' : 'outline'}
                      onClick={() => setDifficulty('advanced')}
                      className="w-full"
                    >
                      Nâng cao (B1-B2)
                    </Button>
                  </div>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Tạo bài đọc
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Bài đọc */}
        {article && (
          <FadeIn delay={0.1}>
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">📝 Bài đọc</h3>
                <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Làm bài mới
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mb-4">
                💡 Click vào từ để tra từ điển
              </p>

              <div className="p-6 bg-muted/40 rounded-xl leading-relaxed text-lg border border-border/50">
                <ClickableText text={article} onWordClick={setSelectedWord} />
              </div>

              {selectedWord && (
                <div className="mt-4 p-4 bg-muted rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">{selectedWord}</span>
                      <span className="text-muted-foreground text-sm ml-2">/word/</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tra từ điển để xem nghĩa và ví dụ...
                  </p>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {selectedWord && (
          <DictionaryPopup word={selectedWord} onClose={() => setSelectedWord(null)} />
        )}

        {/* Câu hỏi */}
        {questions && (
          <FadeIn delay={0.2}>
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-6">❓ Câu hỏi đọc hiểu</h3>
              
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={qIndex}>
                    <p className="font-medium mb-3">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((option, oIndex) => {
                        const isSelected = userAnswers[qIndex] === oIndex;
                        const isCorrect = q.answer === oIndex;
                        
                        let bgClass = 'bg-muted/30 hover:bg-muted/50 border border-transparent';
                        if (showResults) {
                          if (isCorrect) bgClass = 'bg-green-100 dark:bg-green-900/30 border-green-500/50';
                          else if (isSelected && !isCorrect) bgClass = 'bg-red-100 dark:bg-red-900/30 border-red-500/50';
                        } else if (isSelected) {
                          bgClass = 'bg-primary text-primary-foreground border-primary';
                        }

                        return (
                          <button
                            key={oIndex}
                            onClick={() => handleSelectAnswer(qIndex, oIndex)}
                            className={`p-3 rounded-lg text-sm text-left transition-all ${bgClass}`}
                            disabled={showResults}
                          >
                            <span className="flex items-center gap-2">
                              {showResults && isCorrect && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {showResults && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                              {String.fromCharCode(65 + oIndex)}. {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!showResults ? (
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={userAnswers.includes(-1)}
                >
                  📊 Nộp bài
                </Button>
              ) : (
                <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary">
                    Điểm: {calculateScore()}/{questions.length}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={reset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Làm bài mới
                  </Button>
                </div>
              )}
            </div>
          </FadeIn>
        )}
      </>
    </AppLayout>
  );
}

'use client';

import { useState } from 'react';
import { PenTool, Search, RotateCcw, AlertCircle, Lightbulb, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layouts/app-layout';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';
import { useSaveLesson } from '@/hooks/use-save-lesson';
import { PageTransition, FadeIn } from '@/components/animations';

/**
 * Writing Page - Module Luyện Viết (matching live reference)
 */
export default function WritingPage() {
  // Form state
  const [topic, setTopic] = useState('');
  const [userText, setUserText] = useState('');

  // Feedback state
  const [feedback, setFeedback] = useState<{
    corrections: { original: string; corrected: string; explanation: string }[];
    suggestions: string[];
    improvedVersion: string;
  } | null>(null);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // Save lesson hook
  const { saveLesson } = useSaveLesson();

  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setHistoryOpen(false);
    setTopic(entry.topic);
    if (entry.content?.userText) {
      setUserText(entry.content.userText);
    }
    if (entry.content?.feedback) {
      setFeedback(entry.content.feedback);
    }
  };

  const handleAnalyze = async () => {
    if (!userText.trim()) {
      setError('Vui lòng nhập nội dung bài viết');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await api('/ai/generate-text', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Phân tích và sửa lỗi bài viết tiếng Anh sau:

BÀI VIẾT:
"${userText}"

${topic ? `Chủ đề: ${topic}` : ''}

Yêu cầu:
1. Tìm và sửa các lỗi ngữ pháp, từ vựng
2. Đưa ra gợi ý cách viết hay hơn
3. Viết lại phiên bản cải thiện

Trả về JSON theo format:
{
  "corrections": [
    { "original": "câu sai", "corrected": "câu đúng", "explanation": "giải thích lỗi" }
  ],
  "suggestions": ["gợi ý 1", "gợi ý 2"],
  "improvedVersion": "Phiên bản cải thiện của toàn bộ bài viết..."
}

Chỉ trả về JSON.`,
        }),
      });

      if (!response.ok) throw new Error('Lỗi phân tích');

      const data = await response.json();
      
      const jsonMatch = data.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không thể parse kết quả');
      
      const parsedFeedback = JSON.parse(jsonMatch[0]);
      setFeedback(parsedFeedback);
      
      // Lưu vào database
      await saveLesson({
        type: 'writing',
        topic: topic || 'Bài viết tự do',
        content: { userText, feedback: parsedFeedback },
        status: 'completed',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUserText('');
    setFeedback(null);
    setTopic('');
  };

  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <AppLayout>
      <PageTransition>
        {/* Header với History Button */}
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl skill-card-writing flex items-center justify-center shadow-lg">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Luyện Viết
                </h1>
                <p className="text-sm text-muted-foreground">Writing Assistant</p>
              </div>
            </div>
            <HistoryButton onClick={() => setHistoryOpen(true)} />
          </div>
        </FadeIn>

        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          filterType="writing"
          onOpenEntry={handleOpenHistoryEntry}
        />

        {/* Writing Form */}
        <FadeIn delay={0.1}>
          <div className="glass-card p-6 mb-6">
            <h2 className="font-display text-lg font-semibold mb-6">Viết bài của bạn</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="writingTopic">
                  Chủ đề (tùy chọn)
                </Label>
                <Input
                  id="writingTopic"
                  placeholder="My favorite hobby, A trip I remember, My dream job..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="writingContent">
                  Nội dung bài viết <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="writingContent"
                    placeholder="Viết bài tiếng Anh của bạn tại đây..."
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    className="min-h-[200px] resize-none pb-8"
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                    Số từ: {wordCount}
                  </div>
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!userText.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Search className="w-5 h-5 mr-2 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Phân tích và sửa lỗi
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Viết bài mới
                </Button>
              </div>
            </div>
        </div>
        </FadeIn>

        {/* Analysis Results */}
        {feedback && (
          <>
            {/* Errors */}
            {feedback.corrections.length > 0 && (
              <FadeIn delay={0.2}>
                <div className="glass-card p-6 mb-6 border-l-4 border-destructive">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    Các lỗi cần sửa
                  </h3>
                  <div className="space-y-4">
                    {feedback.corrections.map((error, i) => (
                      <div key={i} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="line-through text-muted-foreground">&quot;{error.original}&quot;</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-primary font-medium">&quot;{error.corrected}&quot;</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-start gap-2">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {error.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Suggestions */}
            {feedback.suggestions.length > 0 && (
              <FadeIn delay={0.3}>
                <div className="glass-card p-6 mb-6">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Gợi ý cải thiện
                  </h3>
                  <ul className="space-y-2">
                    {feedback.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}

            {/* Improved Version */}
            <FadeIn delay={0.4}>
              <div className="glass-card p-6 border-l-4 border-speaking">
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-green-500">
                  <Sparkles className="w-5 h-5" />
                  Phiên bản cải thiện
                </h3>
                <p className="text-foreground leading-relaxed bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  {feedback.improvedVersion}
                </p>
              </div>
            </FadeIn>
          </>
        )}
      </PageTransition>
    </AppLayout>
  );
}

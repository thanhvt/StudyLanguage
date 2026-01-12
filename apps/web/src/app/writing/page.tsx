'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layouts/app-layout';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';

/**
 * Writing Page - Module Luyện Viết
 *
 * Mục đích: UI cho tính năng luyện viết với AI sửa lỗi
 * Flow: Chọn topic → Viết văn bản → AI sửa lỗi và gợi ý
 * NEW: History - Xem lại các bài viết đã làm
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

  /**
   * Xử lý khi mở entry từ history
   */
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
      
      setFeedback(JSON.parse(jsonMatch[0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Reset để viết bài mới
   */
  const handleReset = () => {
    setUserText('');
    setFeedback(null);
    setTopic('');
  };

  return (
    <AppLayout>
      {/* Header với History Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">✍️ Luyện Viết - Writing Assistant</h1>
        <HistoryButton onClick={() => setHistoryOpen(true)} />
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        filterType="writing"
        onOpenEntry={handleOpenHistoryEntry}
      />

      {/* Form viết bài */}
      <GlassCard className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Viết bài của bạn</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chủ đề (tùy chọn)</label>
            <Input
              placeholder="VD: My favorite hobby, A memorable trip..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung bài viết *</label>
            <textarea
              className="w-full min-h-[200px] p-4 border rounded-xl bg-black/20 resize-y focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              placeholder="Viết bài tiếng Anh của bạn ở đây..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              Số từ: {userText.trim().split(/\s+/).filter(Boolean).length}
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !userText.trim()}
          >
            {isAnalyzing ? '⏳ Đang phân tích...' : '🔍 Phân tích và sửa lỗi'}
          </Button>
          {feedback && (
            <Button variant="outline" onClick={handleReset}>
              🔄 Viết bài mới
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Kết quả phân tích */}
      {feedback && (
        <>
          {/* Các lỗi */}
          {feedback.corrections.length > 0 && (
            <GlassCard className="p-6 mb-6 border-red-500/20">
              <h2 className="text-xl font-semibold mb-4 text-red-400">❌ Các lỗi cần sửa</h2>
              <div className="space-y-4">
                {feedback.corrections.map((c, i) => (
                  <div key={i} className="p-4 bg-red-500/10 rounded-xl border border-red-500/10">
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <span className="line-through text-red-400 opacity-70">{c.original}</span>
                      <span>→</span>
                      <span className="text-green-500 font-bold">{c.corrected}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      💡 {c.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Gợi ý */}
          {feedback.suggestions.length > 0 && (
            <GlassCard className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">💡 Gợi ý cải thiện</h2>
              <ul className="list-disc list-inside space-y-2">
                {feedback.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Phiên bản cải thiện */}
          <GlassCard className="p-6 border-green-500/20">
            <h2 className="text-xl font-semibold mb-4 text-green-400">✨ Phiên bản cải thiện</h2>
            <div className="p-6 bg-green-500/10 rounded-xl leading-relaxed border border-green-500/10">
              {feedback.improvedVersion}
            </div>
          </GlassCard>
        </>
      )}
    </AppLayout>
  );
}

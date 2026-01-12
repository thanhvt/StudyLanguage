'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * Listening Page - Module Luyện Nghe
 *
 * Mục đích: UI cho tính năng luyện nghe hội thoại
 * Flow: Chọn topic → AI sinh hội thoại → Nghe audio + xem transcript
 */
export default function ListeningPage() {
  // Form state
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(5);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [keywords, setKeywords] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<{ speaker: string; text: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Gọi API sinh hội thoại
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/ai/generate-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationMinutes: duration,
          numSpeakers,
          keywords: keywords || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi sinh hội thoại');
      }

      const data = await response.json();
      setConversation(data.script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🎧 Luyện Nghe - Smart Conversation</h1>

      {/* Form nhập thông tin */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tạo hội thoại mới</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chủ đề */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chủ đề *</label>
            <Input
              placeholder="VD: Đặt phòng khách sạn, Mua sắm..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Thời lượng */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Thời lượng (phút)</label>
            <Input
              type="number"
              min={1}
              max={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          {/* Số người */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Số người tham gia</label>
            <Input
              type="number"
              min={2}
              max={4}
              value={numSpeakers}
              onChange={(e) => setNumSpeakers(Number(e.target.value))}
            />
          </div>

          {/* Từ khóa */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Từ khóa (tùy chọn)</label>
            <Input
              placeholder="VD: reservation, check-in, room service"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mt-4 w-full md:w-auto"
        >
          {isGenerating ? '⏳ Đang tạo...' : '✨ Tạo hội thoại'}
        </Button>
      </Card>

      {/* Hiển thị hội thoại */}
      {conversation && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Kịch bản hội thoại</h2>
          
          <div className="space-y-3">
            {conversation.map((line, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  line.speaker === 'Person A'
                    ? 'bg-primary/10 ml-0 mr-12'
                    : 'bg-accent/10 ml-12 mr-0'
                }`}
              >
                <span className="font-semibold text-sm text-primary">
                  {line.speaker}:
                </span>
                <p className="mt-1">{line.text}</p>
              </div>
            ))}
          </div>

          {/* TODO: Audio Player sẽ thêm sau */}
          <div className="mt-6 p-4 bg-muted rounded-lg text-center text-muted-foreground">
            🔊 Audio Player sẽ được thêm ở bước tiếp theo
          </div>
        </Card>
      )}
    </div>
  );
}

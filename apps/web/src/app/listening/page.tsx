'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ListeningPlayer } from '@/components/listening-player';
import { InteractiveListening } from '@/components/interactive-listening';

/**
 * Listening Page - Module Luyện Nghe
 *
 * Mục đích: UI cho tính năng luyện nghe hội thoại
 * Flow: Chọn topic → AI sinh hội thoại → Nghe audio + xem transcript
 * NEW: Interactive mode - User tham gia vào hội thoại
 */
export default function ListeningPage() {
  // Mode state
  const [mode, setMode] = useState<'passive' | 'interactive'>('passive');

  // Form state
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(5);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [keywords, setKeywords] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<{ speaker: string; text: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Interactive mode state
  const [showInteractive, setShowInteractive] = useState(false);

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
      const response = await api('/ai/generate-conversation', {
        method: 'POST',
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

  /**
   * Reset để tạo hội thoại mới
   */
  const handleReset = () => {
    setConversation(null);
    setTopic('');
    setKeywords('');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🎧 Luyện Nghe - Smart Conversation</h1>

      {/* Mode Toggle */}
      {!conversation && !showInteractive && (
        <div className="flex gap-3 mb-6">
          <Button
            variant={mode === 'passive' ? 'default' : 'outline'}
            onClick={() => setMode('passive')}
          >
            🎧 Nghe thụ động
          </Button>
          <Button
            variant={mode === 'interactive' ? 'default' : 'outline'}
            onClick={() => setMode('interactive')}
          >
            🎤 Tham gia hội thoại
          </Button>
        </div>
      )}

      {/* Interactive Listening Mode */}
      {showInteractive && (
        <Card className="p-6">
          <InteractiveListening 
            topic={topic} 
            onBack={() => {
              setShowInteractive(false);
              setTopic('');
            }} 
          />
        </Card>
      )}

      {/* Form nhập thông tin - Passive mode */}
      {!conversation && !showInteractive && mode === 'passive' && (
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
      )}

      {/* Form nhập thông tin - Interactive mode */}
      {!conversation && !showInteractive && mode === 'interactive' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎤 Tham gia hội thoại</h2>
          <p className="text-muted-foreground mb-4">
            Chọn chủ đề và AI sẽ tạo một cuộc hội thoại để bạn tham gia. Bạn sẽ được lắng nghe và sau đó nói các câu của mình!
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chủ đề *</label>
              <Input
                placeholder="VD: Đặt phòng khách sạn, Mua cà phê, Hỏi đường..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setShowInteractive(true)}
              disabled={!topic.trim()}
              className="w-full md:w-auto"
            >
              🚀 Bắt đầu tham gia
            </Button>
          </div>
        </Card>
      )}

      {/* Listening Player với Audio + Transcript */}
      {conversation && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">🎧 Nghe hội thoại</h2>
            <Button variant="outline" size="sm" onClick={handleReset}>
              🔄 Tạo mới
            </Button>
          </div>
          
          <ListeningPlayer conversation={conversation} />
        </Card>
      )}
    </div>
  );
}


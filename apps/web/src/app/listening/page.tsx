'use client';

import { useState } from 'react';
import { Headphones, Mic, Clock, Users, Tag, Sparkles, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListeningPlayer } from '@/components/listening-player';
import { InteractiveListening } from '@/components/interactive-listening';
import { AppLayout } from '@/components/layouts/app-layout';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';
import { PageTransition, FadeIn } from '@/components/animations';

/**
 * Listening Page - Module Luyện Nghe (Enhanced với Live Reference style)
 *
 * Mục đích: UI cho tính năng luyện nghe hội thoại
 * Flow: Chọn topic → AI sinh hội thoại → Nghe audio + xem transcript
 * NEW: Tabs UI giống live reference
 */
export default function ListeningPage() {
  // Mode state - controlled by Tabs now
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

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

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

  /**
   * Xử lý khi mở entry từ history
   */
  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setHistoryOpen(false);
    setTopic(entry.topic);
    if (entry.content?.script) {
      setConversation(entry.content.script);
    }
    if (entry.durationMinutes) setDuration(entry.durationMinutes);
    if (entry.numSpeakers) setNumSpeakers(entry.numSpeakers);
    if (entry.keywords) setKeywords(entry.keywords);
  };

  return (
    <AppLayout>
      <PageTransition>
        {/* Header với History Button - Matching Live Reference */}
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl skill-card-listening flex items-center justify-center shadow-lg">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Luyện Nghe
                </h1>
                <p className="text-sm text-muted-foreground">Smart Conversation</p>
              </div>
            </div>
            <HistoryButton onClick={() => setHistoryOpen(true)} />
          </div>
        </FadeIn>

        {/* History Drawer */}
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          filterType="listening"
          onOpenEntry={handleOpenHistoryEntry}
        />

        {/* Tabs - Matching live reference style */}
        {!conversation && !showInteractive && (
          <FadeIn delay={0.1}>
            <Tabs 
              value={mode} 
              onValueChange={(v) => setMode(v as 'passive' | 'interactive')}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="passive" className="gap-2">
                  <Headphones className="w-4 h-4" />
                  Nghe thụ động
                </TabsTrigger>
                <TabsTrigger value="interactive" className="gap-2">
                  <Mic className="w-4 h-4" />
                  Tham gia hội thoại
                </TabsTrigger>
              </TabsList>

              {/* Passive Mode Content */}
              <TabsContent value="passive">
                <Card className="p-6">
                  <h2 className="font-display text-lg font-semibold mb-6">Tạo hội thoại mới</h2>
                  
                  <div className="space-y-4">
                    {/* Chủ đề */}
                    <div className="space-y-2">
                      <Label htmlFor="listeningTopic">
                        Chủ đề <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="listeningTopic"
                        placeholder="VD: Đặt phòng khách sạn, Mua sắm, Hỏi đường..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Thời lượng */}
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Thời lượng (phút)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          min={1}
                          max={15}
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                        />
                      </div>

                      {/* Số người */}
                      <div className="space-y-2">
                        <Label htmlFor="numSpeakers" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Số người
                        </Label>
                        <Input
                          id="numSpeakers"
                          type="number"
                          min={2}
                          max={4}
                          value={numSpeakers}
                          onChange={(e) => setNumSpeakers(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Từ khóa */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Từ khóa (tùy chọn)
                      </Label>
                      <Input
                        id="keywords"
                        placeholder="reservation, check-in, room service..."
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>

                    {error && (
                      <p className="text-destructive text-sm">{error}</p>
                    )}

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !topic.trim()}
                      className="w-full mt-4"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Tạo hội thoại
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Interactive Mode Content */}
              <TabsContent value="interactive">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold">Tham gia hội thoại</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Chọn chủ đề và AI sẽ tạo một cuộc hội thoại để bạn tham gia. Bạn sẽ được lắng nghe và sau đó nói các câu của mình!
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interactiveTopic">
                        Chủ đề <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="interactiveTopic"
                        placeholder="Đặt phòng khách sạn, Mua cà phê, Phỏng vấn xin việc..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={() => setShowInteractive(true)}
                      disabled={!topic.trim()}
                      className="w-full"
                      size="lg"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Bắt đầu tham gia
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </FadeIn>
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

        {/* Listening Player với Audio + Transcript */}
        {conversation && (
          <FadeIn delay={0.1}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">🎧 Nghe hội thoại</h2>
                <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Tạo mới
                </Button>
              </div>
              
              <ListeningPlayer conversation={conversation} />
            </Card>
          </FadeIn>
        )}
      </PageTransition>
    </AppLayout>
  );
}

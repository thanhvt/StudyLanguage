'use client';

import { useState } from 'react';
import { Headphones, Mic, Sparkles, RotateCcw, ListMusic, BookmarkPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListeningPlayer } from '@/components/listening-player';
import { InteractiveListening } from '@/components/interactive-listening';
import { AppLayout } from '@/components/layouts/app-layout';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';
import { useSaveLesson } from '@/hooks/use-save-lesson';
import { FadeIn } from '@/components/animations';
import { showError, showSuccess } from '@/lib/toast';

// New Listening Components
import {
  DurationSelector,
  SpeakersSelector,
  TopicPicker,
  ListenLaterButton,
  ListenLaterDrawer,
  ListenLaterBadge,
  PlaylistManager,
  AddToPlaylistModal,
  PlaylistPlayer,
} from '@/components/listening';
import { usePlaylist } from '@/hooks/use-playlist';
import { Playlist, ListenLaterItem, ConversationLine } from '@/types/listening-types';

/**
 * Listening Page - Module Luyện Nghe (Enhanced với Topic Picker, Listen Later, Playlists)
 *
 * Mục đích: UI cho tính năng luyện nghe hội thoại
 * Flow: Chọn topic → AI sinh hội thoại → Nghe audio + xem transcript
 * NEW: 
 *   - Duration selector pills (5/10/15 hoặc custom max 20)
 *   - Speakers selector (2/3/4)
 *   - Topic picker với 140 scenarios
 *   - Listen Later queue
 *   - Playlist với continuous playback
 */
export default function ListeningPage() {
  // Mode state - controlled by Tabs now
  const [mode, setMode] = useState<'passive' | 'interactive'>('passive');

  // Form state
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(5);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [keywords, setKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>();

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<ConversationLine[] | null>(null);
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  // Interactive mode state
  const [showInteractive, setShowInteractive] = useState(false);

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // Listen Later drawer state
  const [listenLaterOpen, setListenLaterOpen] = useState(false);

  // Playlist states
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  // Hooks
  const { saveLesson } = useSaveLesson();
  const { playlists } = usePlaylist();

  /**
   * Xử lý khi chọn topic từ Topic Picker
   */
  const handleTopicSelect = (selectedTopic: string, category?: string, subCategory?: string) => {
    setTopic(selectedTopic);
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);
    if (selectedTopic) {
      setShowTopicPicker(false);
    }
  };

  /**
   * Gọi API sinh hội thoại
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      showError('Vui lòng nhập hoặc chọn chủ đề');
      return;
    }

    setIsGenerating(true);

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
        // Kiểm tra 401 để hiển thị thông báo đăng nhập rõ ràng
        if (response.status === 401) {
          throw new Error('Vui lòng đăng nhập để sử dụng tính năng này');
        }
        throw new Error('Lỗi sinh hội thoại');
      }

      const data = await response.json();
      setConversation(data.script);

      // Lưu vào database để hiển thị trong History
      await saveLesson({
        type: 'listening',
        topic,
        content: { script: data.script },
        durationMinutes: duration,
        numSpeakers,
        keywords: keywords || undefined,
        mode: mode,
        status: 'completed',
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
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
    setSelectedCategory(undefined);
    setSelectedSubCategory(undefined);
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

  /**
   * Xử lý khi play từ Listen Later
   */
  const handlePlayFromListenLater = (item: ListenLaterItem) => {
    setTopic(item.topic);
    setConversation(item.conversation);
    setDuration(item.duration);
    setNumSpeakers(item.num_speakers);
    setSelectedCategory(item.category);
    setSelectedSubCategory(item.sub_category);
    setListenLaterOpen(false);
  };

  /**
   * Xử lý khi chọn playlist để phát
   */
  const handlePlayPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
  };

  return (
    <AppLayout>
      <>
        {/* Header với History Button và Listen Later Badge */}
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
                <p className="text-sm text-muted-foreground">140 kịch bản • Smart Conversation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ListenLaterBadge onClick={() => setListenLaterOpen(true)} />
              <HistoryButton onClick={() => setHistoryOpen(true)} />
            </div>
          </div>
        </FadeIn>

        {/* Drawers */}
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          filterType="listening"
          onOpenEntry={handleOpenHistoryEntry}
        />
        
        <ListenLaterDrawer
          isOpen={listenLaterOpen}
          onClose={() => setListenLaterOpen(false)}
          onPlay={handlePlayFromListenLater}
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

              <TabsContent value="passive">
                <div className="glass-card p-6 space-y-6 border border-border rounded-2xl">
                  <h2 className="font-display text-lg font-semibold">Tạo hội thoại mới</h2>
                  
                  {/* Duration Selector */}
                  <DurationSelector value={duration} onChange={setDuration} />

                  {/* Speakers Selector */}
                  <SpeakersSelector value={numSpeakers} onChange={setNumSpeakers} />

                  {/* Topic Input với Toggle */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="listeningTopic">
                        Chủ đề <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTopicPicker(!showTopicPicker)}
                        className="text-xs gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {showTopicPicker ? 'Nhập thủ công' : 'Gợi ý 140 kịch bản'}
                      </Button>
                    </div>

                    {showTopicPicker ? (
                      <TopicPicker onSelect={handleTopicSelect} selectedTopic={topic} />
                    ) : (
                      <Input
                        id="listeningTopic"
                        placeholder="VD: Đặt phòng khách sạn, Mua sắm, Hỏi đường..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    )}
                  </div>

                  {/* Keywords (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Từ khóa (tùy chọn)</Label>
                    <Input
                      id="keywords"
                      placeholder="reservation, check-in, room service..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>



                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full"
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

                {/* Playlist Manager */}
                <div className="glass-card p-6 mt-6 border border-border rounded-2xl">
                  <PlaylistManager onSelectPlaylist={handlePlayPlaylist} />
                </div>
              </TabsContent>

              <TabsContent value="interactive">
                <div className="glass-card p-6 border border-border rounded-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold">Tham gia hội thoại</h2>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Chọn chủ đề và AI sẽ tạo một cuộc hội thoại để bạn tham gia. Bạn sẽ được lắng nghe và sau đó nói các câu của mình!
                  </p>
                  
                  {/* Duration Selector - Improvement #5 */}
                  <DurationSelector value={duration} onChange={setDuration} />
                  
                  {/* Topic Input với Toggle - Improvement #3 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="interactiveTopic">
                        Chủ đề <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTopicPicker(!showTopicPicker)}
                        className="text-xs gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {showTopicPicker ? 'Nhập thủ công' : 'Gợi ý 140 kịch bản'}
                      </Button>
                    </div>

                    {showTopicPicker ? (
                      <TopicPicker onSelect={handleTopicSelect} selectedTopic={topic} />
                    ) : (
                      <Input
                        id="interactiveTopic"
                        placeholder="Đặt phòng khách sạn, Mua cà phê, Phỏng vấn xin việc..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    )}
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
              </TabsContent>
            </Tabs>
          </FadeIn>
        )}

        {/* Interactive Listening Mode */}
        {showInteractive && (
          <div className="glass-card p-6">
            <InteractiveListening 
              topic={topic}
              duration={duration}
              onBack={() => {
                setShowInteractive(false);
                setTopic('');
              }} 
            />
          </div>
        )}

        {/* Listening Player với Audio + Transcript */}
        {conversation && (
          <FadeIn delay={0.1}>
            <div className="glass-card p-6 border border-border rounded-2xl">
              {/* Header - buttons cùng hàng với tiêu đề, có text labels */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="font-display text-lg font-semibold">🎧 Nghe hội thoại</h2>
                
                {/* Action buttons - nằm cùng hàng, có text */}
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {/* Listen Later Button - variant default có text */}
                  <ListenLaterButton
                    topic={topic}
                    conversation={conversation}
                    duration={duration}
                    numSpeakers={numSpeakers}
                    category={selectedCategory}
                    subCategory={selectedSubCategory}
                    variant="default"
                  />
                  
                  {/* Add to Playlist Button - có text */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPlaylistModal(true)}
                    className="gap-2"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Playlist</span>
                  </Button>

                  {/* Reset Button */}
                  <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Tạo mới</span>
                  </Button>
                </div>
              </div>
              
              <ListeningPlayer conversation={conversation} />
            </div>
          </FadeIn>
        )}

        {/* Add to Playlist Modal */}
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          topic={topic}
          conversation={conversation || []}
          duration={duration}
          numSpeakers={numSpeakers}
          category={selectedCategory}
          subCategory={selectedSubCategory}
          onSuccess={() => {
            // Toast notification đã có trong modal
          }}
        />

        {/* Playlist Player - cố định bottom */}
        <PlaylistPlayer
          playlist={activePlaylist}
          onClose={() => setActivePlaylist(null)}
        />
      </>
    </AppLayout>
  );
}

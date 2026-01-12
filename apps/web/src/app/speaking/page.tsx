'use client';

import { useState } from 'react';
import { Mic, MessageSquare, Phone, StopCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/layouts/app-layout';
import { WaveformVisualizer } from '@/components/speaking/waveform-visualizer';
import { SessionTranscript } from '@/components/speaking/session-transcript';
import { PronunciationAlert } from '@/components/speaking/pronunciation-alert';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';
import { useSaveLesson } from '@/hooks/use-save-lesson';
import { PageTransition, FadeIn } from '@/components/animations';

/**
 * Speaking Page - Module Luyện Nói (AI Coach - matching live reference)
 */
export default function SpeakingPage() {
  // View State: 'setup' | 'session'
  const [viewMode, setViewMode] = useState<'setup' | 'session'>('setup');

  // Setup State
  const [topic, setTopic] = useState('');
  
  // Session State
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Alert State
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentMistake, setCurrentMistake] = useState<{userSaid: string, suggestion: string} | null>(null);

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // Save lesson hook
  const { saveLesson } = useSaveLesson();

  /**
   * Xử lý khi mở entry từ history
   */
  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setHistoryOpen(false);
    setTopic(entry.topic);
    if (entry.content?.messages) {
      setMessages(entry.content.messages);
      setViewMode('session');
    }
  };

  // Mock function to start session
  const startSession = () => {
    if (!topic) return;
    setViewMode('session');
    setMessages([
      {
        id: '1',
        role: 'ai',
        text: `Hello! I'm your AI Coach. Let's talk about "${topic}". You can start by telling me what you think about it.`,
        timestamp: Date.now()
      }
    ]);
  };

  // Exit session and save to database
  const exitSession = async () => {
    // Lưu vào database nếu có messages
    if (messages.length > 1) {
      await saveLesson({
        type: 'speaking',
        topic,
        content: { messages },
        mode: 'interactive',
        status: 'completed',
      });
    }
    setViewMode('setup');
    setMessages([]);
    setTopic('');
  };

  // Mock function to handle recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsThinking(true);
      
      setTimeout(() => {
        setIsThinking(false);
        const userMsg = {
          id: Date.now().toString(),
          role: 'user',
          text: "I think it is very important for our future.",
          timestamp: Date.now(),
          corrections: Math.random() > 0.5 ? [{ original: "it is", correction: "it's", explanation: "Use contraction for natural speech" }] : []
        };
        setMessages(prev => [...prev, userMsg]);

        if (Math.random() > 0.7) {
            setCurrentMistake({ userSaid: "im-por-tant", suggestion: "important /ɪmˈpɔːrtnt/" });
            setAlertOpen(true);
        }

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "That's a great point! Can you elaborate on why?",
                timestamp: Date.now()
            }]);
        }, 1000);

      }, 1500);

    } else {
      setIsRecording(true);
    }
  };

  return (
    <AppLayout>
      <PageTransition>
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          filterType="speaking"
          onOpenEntry={handleOpenHistoryEntry}
        />

        <div className="h-[calc(100vh-3rem)] flex flex-col relative">
          
          {/* SETUP MODE */}
          {viewMode === 'setup' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full p-6">
              {/* Header với History Button */}
              <FadeIn>
                <div className="flex items-center justify-between w-full mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl skill-card-speaking flex items-center justify-center shadow-lg">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="font-display text-2xl font-bold text-foreground">
                        Luyện Nói
                      </h1>
                      <p className="text-sm text-muted-foreground">AI Speaking Coach</p>
                    </div>
                  </div>
                  <HistoryButton onClick={() => setHistoryOpen(true)} />
                </div>
              </FadeIn>

              {/* Setup Card - Matching live reference */}
              <FadeIn delay={0.1}>
                <Card className="w-full p-8 text-center">
                  <div className="w-20 h-20 rounded-3xl skill-card-speaking mx-auto flex items-center justify-center mb-6 shadow-lg">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="font-display text-xl font-semibold mb-2">AI Speaking Coach 🤖</h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    Chọn chủ đề và bắt đầu hội thoại 1-1 với AI Coach. Bạn sẽ nhận được phản hồi về phát âm và ngữ pháp ngay lập tức.
                  </p>

                  <div className="text-left mb-6">
                    <Label htmlFor="speakingTopic" className="mb-2 block">
                      Bạn muốn nói về chủ đề gì?
                    </Label>
                    <Input
                      id="speakingTopic"
                      placeholder="VD: Daily Routine, My Dream Job, Environmental Issues..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={startSession}
                    disabled={!topic.trim()}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Bắt đầu hội thoại
                  </Button>
                </Card>
              </FadeIn>
            </div>
          )}

          {/* SESSION MODE */}
          {viewMode === 'session' && (
            <div className="flex-1 flex gap-6 h-full overflow-hidden pb-20">
              {/* LEFT COLUMN: VISUALIZER */}
              <div className="flex-1 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl skill-card-speaking flex items-center justify-center">
                       <Mic className="w-5 h-5 text-white" />
                     </div>
                     <div>
                       <h2 className="text-xl font-bold flex items-center gap-2">
                         <span className="text-primary">●</span> {topic}
                       </h2>
                       <p className="text-xs text-muted-foreground">AI Speaking Coach Session</p>
                     </div>
                   </div>
                   <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                     Fluency: 85%
                   </div>
                 </div>

                 <Card className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/60 border-white/10 shadow-inner">
                   <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-20'}`} />
                   <WaveformVisualizer isRecording={isRecording} className="z-10 scale-150" />
                   <div className="absolute bottom-8 text-center">
                     <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`}>
                        {isRecording ? '🔴 Recording...' : isThinking ? '🤔 AI is thinking...' : 'Tap Mic to Speak'}
                     </p>
                   </div>
                 </Card>
              </div>

              {/* RIGHT COLUMN: TRANSCRIPT */}
              <div className="w-[400px] flex flex-col h-full">
                 <SessionTranscript messages={messages} isThinking={isThinking} className="border-white/10 shadow-xl" />
              </div>

              {/* BOTTOM CONTROLS (FIXED) */}
              <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10">
                 <div className="pointer-events-auto flex items-center gap-4 mb-4">
                   <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-black/50 border border-white/10 hover:bg-white/10 text-muted-foreground">
                     <Keyboard className="w-5 h-5" />
                   </Button>
                   
                   <Button 
                     onClick={toggleRecording}
                     className={`rounded-full h-16 w-16 shadow-2xl transition-all duration-300 ${
                         isRecording 
                         ? 'bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-500/30' 
                         : 'bg-primary hover:bg-primary/90 hover:scale-105'
                     }`}
                   >
                     {isRecording ? (
                       <StopCircle className="w-7 h-7" />
                     ) : (
                       <Mic className="w-7 h-7" />
                     )}
                   </Button>

                   <Button 
                     variant="ghost" 
                     className="rounded-full h-12 w-12 bg-black/50 border border-white/10 hover:bg-white/10 text-red-400 hover:text-red-300"
                     onClick={exitSession}
                   >
                     Exit
                   </Button>
                 </div>
              </div>

              <PronunciationAlert 
                 isOpen={alertOpen}
                 userSaid={currentMistake?.userSaid || ''}
                 suggestion={currentMistake?.suggestion || ''}
                 onRetry={() => setAlertOpen(false)}
                 onIgnore={() => setAlertOpen(false)}
              />
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}

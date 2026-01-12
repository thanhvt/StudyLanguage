'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layouts/app-layout';
import { GlassCard, GradientText } from '@/components/ui/glass-card';
import { WaveformVisualizer } from '@/components/speaking/waveform-visualizer';
import { SessionTranscript } from '@/components/speaking/session-transcript';
import { PronunciationAlert } from '@/components/speaking/pronunciation-alert';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Speaking Page - Module Luyện Nói (AI Coach Redesign)
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

  // Mock function to start session
  const startSession = () => {
    if (!topic) return;
    setViewMode('session');
    // Mock initial AI message
    setMessages([
      {
        id: '1',
        role: 'ai',
        text: `Hello! I'm your AI Coach. Let's talk about "${topic}". You can start by telling me what you think about it.`,
        timestamp: Date.now()
      }
    ]);
  };

  // Mock function to handle recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording -> Mock processing
      setIsRecording(false);
      setIsThinking(true);
      
      // Simulate processing delay
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

        // Simulating mistake alert randomly
        if (Math.random() > 0.7) {
            setCurrentMistake({ userSaid: "im-por-tant", suggestion: "important /ɪmˈpɔːrtnt/" });
            setAlertOpen(true);
        }

        // Mock AI response
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
      // Start recording
      setIsRecording(true);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3rem)] flex flex-col relative">
        
        {/* SETUP MODE */}
        {viewMode === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full p-6">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  AI Speaking Coach <span className="text-4xl">🤖</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Chọn chủ đề và bắt đầu hội thoại 1-1 với AI Coach để cải thiện phát âm và phản xạ.
                </p>
             </div>

             <Card className="w-full p-8 shadow-xl border-primary/20 bg-black/40 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-lg font-medium">Bạn muốn nói về chủ đề gì?</label>
                    <Input 
                      placeholder="VD: Daily Routine, My Dream Job, Environmental Issues..." 
                      className="text-lg py-6"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg py-6 font-semibold shadow-glow hover:scale-[1.02] transition-transform"
                    onClick={startSession}
                    disabled={!topic.trim()}
                  >
                    🚀 Bắt đầu hội thoại
                  </Button>
                </div>
             </Card>
          </div>
        )}

        {/* SESSION MODE */}
        {viewMode === 'session' && (
          <div className="flex-1 flex gap-6 h-full overflow-hidden pb-20">
            {/* LEFT COLUMN: VISUALIZER */}
            <div className="flex-1 flex flex-col gap-6">
               {/* Header Info */}
               <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="text-primary">●</span> {topic}
                    </h2>
                    <p className="text-xs text-muted-foreground">AI Speaking Coach Session</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    Fluency: 85%
                  </div>
               </div>

               {/* Waveform Area */}
               <GlassCard className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/60 border-white/10 shadow-inner">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-20'}`} />
                  
                  {/* Visualizer Component */}
                  <WaveformVisualizer isRecording={isRecording} className="z-10 scale-150" />
                  
                  {/* Status Indicator text on visualization */}
                  <div className="absolute bottom-8 text-center">
                    <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`}>
                       {isRecording ? '🔴 Recording...' : isThinking ? '🤔 AI is thinking...' : 'Tap Mic to Speak'}
                    </p>
                  </div>
               </GlassCard>
            </div>

            {/* RIGHT COLUMN: TRANSCRIPT */}
            <div className="w-[400px] flex flex-col h-full">
               <SessionTranscript messages={messages} isThinking={isThinking} className="border-white/10 shadow-xl" />
            </div>

            {/* BOTTOM CONTROLS (FIXED) */}
            <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10">
               <div className="pointer-events-auto flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-black/50 border border-white/10 hover:bg-white/10 text-muted-foreground">
                    ⌨️
                  </Button>
                  
                  <Button 
                    onClick={toggleRecording}
                    className={`rounded-full h-16 w-16 shadow-2xl transition-all duration-300 ${
                        isRecording 
                        ? 'bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-500/30' 
                        : 'bg-primary hover:bg-primary/90 hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl">{isRecording ? '⏹️' : '🎤'}</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-12 w-12 bg-black/50 border border-white/10 hover:bg-white/10 text-red-400 hover:text-red-300"
                    onClick={() => setViewMode('setup')}
                  >
                    Exit
                  </Button>
               </div>
            </div>

            {/* ALERTS */}
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
    </AppLayout>
  );
}

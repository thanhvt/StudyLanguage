'use client';

import { useState, useCallback } from 'react';
import { Mic, MessageSquare, Phone, StopCircle, Keyboard, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layouts/app-layout';
import { WaveformVisualizer } from '@/components/speaking/waveform-visualizer';
import { SessionTranscript } from '@/components/speaking/session-transcript';
import { PronunciationAlert } from '@/components/speaking/pronunciation-alert';
import { HistoryDrawer, HistoryButton } from '@/components/history';
import { HistoryEntry } from '@/hooks/use-history';
import { useSaveLesson } from '@/hooks/use-save-lesson';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { FadeIn } from '@/components/animations';
import { api } from '@/lib/api';

/**
 * Interface cho một message trong cuộc hội thoại
 */
interface ConversationMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  corrections?: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
}

/**
 * Speaking Page - Module Luyện Nói (AI Coach)
 * 
 * Mục đích: Trang luyện nói tiếng Anh với AI Coach
 * Tham số đầu vào: Không có (page component)
 * Tham số đầu ra: JSX Element
 * Khi nào sử dụng: Khi user truy cập route /speaking
 * 
 * Luồng hoạt động:
 *   1. User chọn topic và nhấn "Bắt đầu hội thoại"
 *   2. User nhấn mic để ghi âm (hoặc nhấn keyboard để nhập text)
 *   3. Audio được gửi đến API /ai/transcribe để chuyển thành text
 *   4. Text được gửi đến API /ai/continue-conversation để AI phản hồi
 *   5. Khi exit, cuộc hội thoại được lưu vào database
 */
export default function SpeakingPage() {
  // View State: 'setup' | 'session'
  const [viewMode, setViewMode] = useState<'setup' | 'session'>('setup');

  // Setup State
  const [topic, setTopic] = useState('');
  
  // Session State
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  
  // Input mode: 'voice' (nói) hoặc 'text' (nhập bàn phím)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Alert State cho phát âm sai
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentMistake, setCurrentMistake] = useState<{userSaid: string, suggestion: string} | null>(null);

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // Hooks
  const { saveLesson } = useSaveLesson();
  const { 
    isRecording, 
    duration,
    startRecording, 
    stopRecording, 
    resetRecording 
  } = useAudioRecorder();

  /**
   * Xử lý khi mở entry từ history
   * 
   * Mục đích: Load lại cuộc hội thoại từ lịch sử
   * Tham số đầu vào: entry - HistoryEntry từ database
   * Tham số đầu ra: Không có (side effect: cập nhật state)
   * Khi nào sử dụng: Khi user chọn một entry trong History drawer
   */
  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setHistoryOpen(false);
    setTopic(entry.topic);
    if (entry.content?.messages) {
      setMessages(entry.content.messages);
      setViewMode('session');
    }
  };

  /**
   * Bắt đầu session mới với topic đã chọn
   * 
   * Mục đích: Khởi tạo cuộc hội thoại mới
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Không có
   * Khi nào sử dụng: Khi user nhấn "Bắt đầu hội thoại"
   */
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
    resetRecording();
  };

  /**
   * Kết thúc session và lưu vào database
   * 
   * Mục đích: Lưu cuộc hội thoại vào DB và reset state
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Khi user nhấn nút Exit
   */
  const exitSession = async () => {
    // Lưu vào database nếu có messages (ít nhất 2 để có nội dung)
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
    setInputMode('voice');
    setTextInput('');
    resetRecording();
  };

  /**
   * Gửi user input (text hoặc transcribed audio) đến AI
   * 
   * Mục đích: Gọi API continue-conversation để AI phản hồi
   * Tham số đầu vào: userText - Văn bản user muốn gửi
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Sau khi transcribe audio hoặc khi user gửi text
   */
  const sendToAI = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    // Thêm message của user vào transcript
    const userMsg: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Chuẩn bị conversation history cho API
      const conversationHistory = messages.map(msg => ({
        speaker: msg.role === 'ai' ? 'AI Coach' : 'User',
        text: msg.text,
      }));

      // Gọi API continue-conversation
      console.log('[SpeakingPage] Đang gọi API continue-conversation...');
      const response = await api('/ai/continue-conversation', {
        method: 'POST',
        body: JSON.stringify({
          conversationHistory,
          userInput: userText,
          topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối với AI');
      }

      const data = await response.json();
      console.log('[SpeakingPage] AI phản hồi:', data);

      // Thêm phản hồi của AI
      const aiMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.response || "I'm sorry, I couldn't understand. Could you please try again?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error('[SpeakingPage] Lỗi khi gọi AI:', err);
      // Thêm message lỗi
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, topic]);

  /**
   * Xử lý khi nhấn nút Mic (bắt đầu/dừng ghi âm)
   * 
   * Mục đích: Toggle recording và xử lý transcription
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Khi user nhấn nút mic
   */
  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      // Dừng ghi và xử lý audio
      console.log('[SpeakingPage] Đang dừng ghi âm...');
      const audioBlob = await stopRecording();
      
      if (!audioBlob) {
        console.warn('[SpeakingPage] Không có audio data');
        return;
      }

      setIsThinking(true);
      
      try {
        // Tạo FormData để gửi file audio
        const formData = new FormData();
        // Xác định extension dựa trên MIME type
        const mimeType = audioBlob.type;
        let extension = 'webm';
        if (mimeType.includes('ogg')) extension = 'ogg';
        else if (mimeType.includes('mp4')) extension = 'mp4';
        
        formData.append('audio', audioBlob, `recording.${extension}`);

        // Gọi API transcribe
        console.log('[SpeakingPage] Đang gọi API transcribe...', audioBlob.size, 'bytes');
        const transcribeResponse = await api('/ai/transcribe', {
          method: 'POST',
          body: formData,
          // Khi dùng FormData, browser tự set Content-Type với boundary
        });

        if (!transcribeResponse.ok) {
          const errorData = await transcribeResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Lỗi transcribe audio');
        }

        const transcribeData = await transcribeResponse.json();
        console.log('[SpeakingPage] Transcription result:', transcribeData);

        const transcribedText = transcribeData.text;
        if (!transcribedText || transcribedText.trim() === '') {
          console.warn('[SpeakingPage] Không nhận dạng được giọng nói');
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'ai',
            text: "I couldn't hear you clearly. Please try speaking again.",
            timestamp: Date.now(),
          }]);
          setIsThinking(false);
          return;
        }

        // Gửi text đến AI
        setIsThinking(false);
        await sendToAI(transcribedText);

      } catch (err) {
        console.error('[SpeakingPage] Lỗi xử lý audio:', err);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'ai',
          text: "Sorry, I couldn't process your audio. Please try again.",
          timestamp: Date.now(),
        }]);
        setIsThinking(false);
      }
    } else {
      // Bắt đầu ghi
      console.log('[SpeakingPage] Bắt đầu ghi âm...');
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, sendToAI]);

  /**
   * Xử lý khi gửi text (chế độ keyboard)
   * 
   * Mục đích: Gửi text input đến AI
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Khi user nhấn nút Send hoặc Enter
   */
  const handleSendText = async () => {
    if (!textInput.trim() || isSending) return;
    
    setIsSending(true);
    const text = textInput;
    setTextInput('');
    
    await sendToAI(text);
    setIsSending(false);
  };

  /**
   * Xử lý khi nhấn Enter trong textarea
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  /**
   * Toggle giữa chế độ voice và text
   */
  const toggleInputMode = () => {
    setInputMode(prev => prev === 'voice' ? 'text' : 'voice');
  };

  /**
   * Format duration thành mm:ss
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          filterType="speaking"
          onOpenEntry={handleOpenHistoryEntry}
        />

        <div className="h-[calc(100vh-3rem)] flex flex-col relative">
          
          {/* SETUP MODE */}
          {viewMode === 'setup' && (
            <div className="flex-1 flex flex-col h-full p-4 lg:p-6">
              {/* Header - Full width với History Button góc phải */}
              <FadeIn>
                <div className="flex items-center justify-between w-full mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl skill-card-speaking flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="font-display text-xl font-bold text-foreground">
                        Luyện Nói
                      </h1>
                      <p className="text-sm text-muted-foreground">AI Speaking Coach</p>
                    </div>
                  </div>
                  <HistoryButton onClick={() => setHistoryOpen(true)} />
                </div>
              </FadeIn>

              {/* Setup Card - Centered content với background xám nhẹ */}
              <div className="flex-1 flex items-center justify-center">
                <FadeIn delay={0.1}>
                  <Card className="w-full max-w-lg p-8 text-center bg-muted/30 backdrop-blur-sm border-muted/50">
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
                        className="bg-background"
                      />
                    </div>

                    <Button 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md" 
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
            </div>
          )}

          {/* SESSION MODE */}
          {viewMode === 'session' && (
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 h-full overflow-hidden pb-24">
              {/* LEFT COLUMN: VISUALIZER hoặc TEXT INPUT */}
              <div className="flex-1 flex flex-col gap-4 lg:gap-6 min-h-[250px] lg:min-h-0">
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
                     {inputMode === 'voice' ? '🎤 Voice Mode' : '⌨️ Text Mode'}
                   </div>
                 </div>

                 {/* Voice Mode: Waveform Visualizer */}
                 {inputMode === 'voice' && (
                   <Card className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/60 border-white/10 shadow-inner">
                     <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-20'}`} />
                     <WaveformVisualizer isRecording={isRecording} className="z-10 scale-150" />
                     <div className="absolute bottom-8 text-center">
                       {isRecording && (
                         <p className="text-lg font-mono text-red-400 mb-2">{formatDuration(duration)}</p>
                       )}
                       <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`}>
                          {isRecording ? '🔴 Recording...' : isThinking ? '🤔 AI is thinking...' : 'Tap Mic to Speak'}
                       </p>
                     </div>
                   </Card>
                 )}

                 {/* Text Mode: Text Input Area */}
                 {inputMode === 'text' && (
                   <Card className="flex-1 flex flex-col p-4 bg-black/60 border-white/10 shadow-inner">
                     <div className="flex-1 flex flex-col">
                       <Label className="text-muted-foreground mb-2">Nhập tin nhắn của bạn:</Label>
                       <Textarea
                         value={textInput}
                         onChange={(e) => setTextInput(e.target.value)}
                         onKeyDown={handleKeyPress}
                         placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                         className="flex-1 resize-none bg-background/50 border-white/10"
                         disabled={isSending || isThinking}
                       />
                     </div>
                     <div className="mt-4 flex justify-end">
                       <Button
                         onClick={handleSendText}
                         disabled={!textInput.trim() || isSending || isThinking}
                         className="bg-primary hover:bg-primary/90"
                       >
                         {isSending ? (
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         ) : (
                           <Send className="w-4 h-4 mr-2" />
                         )}
                         Gửi
                       </Button>
                     </div>
                   </Card>
                 )}
              </div>

              {/* RIGHT COLUMN: TRANSCRIPT */}
              <div className="w-full lg:w-[400px] flex flex-col h-[280px] lg:h-full">
                 <SessionTranscript messages={messages} isThinking={isThinking} className="border-white/10 shadow-xl" />
              </div>

              {/* BOTTOM CONTROLS (FIXED) */}
              <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10">
                 <div className="pointer-events-auto flex items-center gap-4 mb-4">
                   {/* Nút Keyboard - Toggle giữa voice và text mode */}
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className={`rounded-full h-12 w-12 border transition-all ${
                       inputMode === 'text' 
                         ? 'bg-primary/20 border-primary/50 text-primary' 
                         : 'bg-black/50 border-white/10 hover:bg-white/10 text-muted-foreground'
                     }`}
                     onClick={toggleInputMode}
                   >
                     <Keyboard className="w-5 h-5" />
                   </Button>
                   
                   {/* Nút Mic - Chỉ active trong voice mode */}
                   <Button 
                     onClick={handleMicClick}
                     disabled={inputMode === 'text' || isThinking}
                     className={`rounded-full h-16 w-16 shadow-2xl transition-all duration-300 ${
                         isRecording 
                         ? 'bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-500/30' 
                         : inputMode === 'text'
                         ? 'bg-muted text-muted-foreground cursor-not-allowed'
                         : 'bg-primary hover:bg-primary/90 hover:scale-105'
                     }`}
                   >
                     {isRecording ? (
                       <StopCircle className="w-7 h-7" />
                     ) : isThinking ? (
                       <Loader2 className="w-7 h-7 animate-spin" />
                     ) : (
                       <Mic className="w-7 h-7" />
                     )}
                   </Button>

                   {/* Nút Exit */}
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
    </AppLayout>
  );
}

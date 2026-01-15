'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { AudioPlayer } from '@/components/audio-player';
import { createClient } from '@/lib/supabase/client';
import { showError } from '@/lib/toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ConversationLine {
  speaker: string;
  text: string;
  audioUrl?: string;
}

interface TranscriptViewerProps {
  conversation: ConversationLine[];
  currentTime?: number;
  audioTimestamps?: { startTime: number; endTime: number }[];
}

/**
 * TranscriptViewer Component
 *
 * Mục đích: Hiển thị transcript với highlight theo thời gian audio
 * Tham số:
 *   - conversation: Danh sách các câu hội thoại
 *   - currentTime: Thời gian hiện tại của audio
 *   - audioTimestamps: Thời gian bắt đầu/kết thúc của mỗi câu
 */
export function TranscriptViewer({ 
  conversation, 
  currentTime = 0,
  audioTimestamps 
}: TranscriptViewerProps) {
  // Tính toán câu đang được phát
  const activeIndex = audioTimestamps 
    ? audioTimestamps.findIndex(
        (ts) => currentTime >= ts.startTime && currentTime < ts.endTime
      )
    : -1;

  // Xác định speaker label (Person A → Speaker A)
  const getSpeakerLabel = (speaker: string) => {
    if (speaker === 'Person A' || speaker === 'A') return 'Person A';
    if (speaker === 'Person B' || speaker === 'B') return 'Person B';
    return speaker;
  };

  const isLeftSpeaker = (speaker: string) => {
    return speaker === 'Person A' || speaker === 'A';
  };

  return (
    <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto mobile-scroll">
      <h3 className="font-medium text-foreground mb-4">Transcript</h3>
      {conversation.map((line, index) => {
        const isActive = index === activeIndex;
        const isPast = audioTimestamps && index < activeIndex;
        const isLeft = isLeftSpeaker(line.speaker);

        return (
          <div
            key={index}
            className={`
              p-3 rounded-xl max-w-full sm:max-w-[85%] transition-all duration-300
              ${isLeft 
                ? 'bg-blue-500/20 mr-auto' 
                : 'bg-green-500/20 ml-auto text-right'
              }
              ${isActive 
                ? 'ring-2 ring-primary shadow-lg' 
                : ''
              }
              ${isPast ? 'opacity-60' : ''}
            `}
          >
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              {getSpeakerLabel(line.speaker)}
            </span>
            <p className={`text-sm ${isActive ? 'font-medium' : ''}`}>
              {line.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

interface ListeningPlayerProps {
  conversation: ConversationLine[];
  audioUrl?: string;
  onAudioGenerated?: (url: string, timestamps?: { startTime: number; endTime: number }[]) => void;
}

/**
 * ListeningPlayer Component
 *
 * Mục đích: Kết hợp Audio Player + Transcript cho module Listening
 */
export function ListeningPlayer({ conversation, audioUrl, onAudioGenerated }: ListeningPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(audioUrl || null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  // Timestamps thật từ server (thay vì estimated)
  const [realTimestamps, setRealTimestamps] = useState<{ startTime: number; endTime: number }[] | null>(null);

  // Estimate timestamps dựa trên độ dài text (rough approximation)
  // Trong thực tế, backend sẽ trả về timestamps chính xác
  const estimatedTimestamps = conversation.map((line, index) => {
    const avgSecondsPerWord = 0.5;
    const words = line.text.split(' ').length;
    const duration = words * avgSecondsPerWord;
    
    const startTime = conversation
      .slice(0, index)
      .reduce((acc, l) => acc + l.text.split(' ').length * avgSecondsPerWord, 0);
    
    return {
      startTime,
      endTime: startTime + duration,
    };
  });

  /**
   * Gọi API SSE để sinh audio từ conversation với real-time progress
   * Sử dụng endpoint mới /api/ai/generate-conversation-audio-sse
   */
  const generateAudio = useCallback(async () => {
    setIsGeneratingAudio(true);
    setProgress(0);
    setProgressMessage('Đang khởi tạo...');

    // Tạo AbortController để có thể cancel request
    abortControllerRef.current = new AbortController();

    try {
      // Lấy token từ Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showError('Chưa đăng nhập');
        setIsGeneratingAudio(false);
        return;
      }

      // Gọi SSE endpoint
      const response = await fetch(`${API_BASE_URL}/ai/generate-conversation-audio-sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Lỗi sinh audio: ${response.status}`);
      }

      // Đọc SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Không thể đọc response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events (format: "data: {...}\n\n")
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Giữ lại phần chưa hoàn chỉnh

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'progress') {
                // Cập nhật progress thực từ server
                const percent = Math.round((event.current / event.total) * 100);
                setProgress(percent);
                setProgressMessage(event.message || `Đang xử lý ${event.current}/${event.total}...`);
              } else if (event.type === 'complete') {
                // Hoàn thành!
                setProgress(100);
                setProgressMessage('Hoàn thành!');

                // Tạo Blob URL từ base64 (robust hơn data URL cho audio lớn)
                const binaryString = atob(event.audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
                const audioBlobUrl = URL.createObjectURL(audioBlob);

                // Đợi xíu cho animation 100%
                setTimeout(() => {
                  setGeneratedAudioUrl(audioBlobUrl);
                  if (event.timestamps && event.timestamps.length > 0) {
                    setRealTimestamps(event.timestamps);
                  }
                  
                  // Gọi callback để parent lưu audio URL
                  if (event.audioUrl && onAudioGenerated) {
                    console.log('Audio generated and saved at:', event.audioUrl);
                    onAudioGenerated(event.audioUrl, event.timestamps);
                  }
                  
                  setIsGeneratingAudio(false);
                }, 300);
                return; // Exit loop
              } else if (event.type === 'error') {
                throw new Error(event.message || 'Lỗi sinh audio');
              }
            } catch (parseError) {
              console.warn('[SSE] Lỗi parse event:', parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[SSE] Request đã bị hủy');
        return;
      }
      showError(err instanceof Error ? err.message : 'Lỗi sinh audio');
      setProgress(0);
      setProgressMessage('');
    } finally {
      setIsGeneratingAudio(false);
      abortControllerRef.current = null;
    }
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Cleanup Blob URL để tránh memory leak
      if (generatedAudioUrl && generatedAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
    };
  }, [generatedAudioUrl]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  return (
    <div className="space-y-6">
      {/* Audio controls */}
      {generatedAudioUrl ? (
        <AudioPlayer
          src={generatedAudioUrl}
          onTimeUpdate={handleTimeUpdate}
        />
      ) : (
        <div className="glass-card p-8 text-center space-y-4">
          {/* Title & Description */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Nhấn để AI chuyển đổi hội thoại thành audio với nhiều giọng nói khác nhau
            </p>
          </div>

          {/* Generate Button hoặc Progress Display */}
          {isGeneratingAudio ? (
            /* Progress Card - Hiển thị khi đang xử lý */
            <div className="w-full max-w-sm mx-auto space-y-4">
              {/* Animated Icon với Pulse Effect */}
              <div className="relative flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 animate-ping" />
                </div>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-primary-foreground animate-pulse"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </div>
              </div>

              {/* Progress Text - Full Width, No Truncation */}
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {progressMessage || 'Đang khởi tạo...'}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {progress}%
                </p>
              </div>

              {/* Progress Bar với Gradient và Animation */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                {/* Actual Progress */}
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* Glow Effect on Progress */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-sm rounded-full" />
                </div>
              </div>

              {/* Step Counter */}
              <p className="text-sm text-muted-foreground text-center">
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          ) : (
            /* Generate Button - Hiển thị khi chưa xử lý */
            <button
              onClick={generateAudio}
              className={`
                inline-flex items-center justify-center gap-2 
                px-8 py-3 rounded-xl font-medium text-primary-foreground
                bg-primary hover:bg-primary/90
                transition-all duration-300 shadow-lg hover:shadow-xl
                hover:scale-105 active:scale-100
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              Sinh Audio
            </button>
          )}


        </div>
      )}

      {/* Transcript */}
      <TranscriptViewer
        conversation={conversation}
        currentTime={currentTime}
        audioTimestamps={realTimestamps || (generatedAudioUrl ? estimatedTimestamps : undefined)}
      />
    </div>
  );
}

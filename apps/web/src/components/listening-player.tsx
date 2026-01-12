'use client';

import { useState, useCallback } from 'react';
import { AudioPlayer } from '@/components/audio-player';

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

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {conversation.map((line, index) => {
        const isActive = index === activeIndex;
        const isPast = audioTimestamps && index < activeIndex;

        return (
          <div
            key={index}
            className={`
              p-4 rounded-lg transition-all duration-300
              ${line.speaker === 'Person A' 
                ? 'bg-primary/10 mr-8' 
                : 'bg-accent/10 ml-8'
              }
              ${isActive 
                ? 'ring-2 ring-primary scale-[1.02] shadow-lg' 
                : ''
              }
              ${isPast ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`
                text-xs font-bold px-2 py-0.5 rounded-full
                ${line.speaker === 'Person A' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-accent-foreground'
                }
              `}>
                {line.speaker}
              </span>
              {isActive && (
                <span className="text-xs animate-pulse">🔊 Đang phát</span>
              )}
            </div>
            <p className={`leading-relaxed ${isActive ? 'font-medium' : ''}`}>
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
}

/**
 * ListeningPlayer Component
 *
 * Mục đích: Kết hợp Audio Player + Transcript cho module Listening
 */
export function ListeningPlayer({ conversation, audioUrl }: ListeningPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(audioUrl || null);
  const [error, setError] = useState<string | null>(null);
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
   * Gọi API để sinh audio từ conversation
   * Sử dụng endpoint mới /api/ai/generate-conversation-audio
   */
  const generateAudio = useCallback(async () => {
    setIsGeneratingAudio(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/ai/generate-conversation-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation }),
      });

      if (!response.ok) throw new Error('Lỗi sinh audio');

      const data = await response.json();
      
      // Tạo data URL từ base64
      const audioDataUrl = `data:audio/mpeg;base64,${data.audio}`;
      setGeneratedAudioUrl(audioDataUrl);
      
      // Cập nhật timestamps thật từ server (không dùng estimated nữa)
      if (data.timestamps && data.timestamps.length > 0) {
        setRealTimestamps(data.timestamps);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi sinh audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [conversation]);

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
        <div className="bg-muted rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Nhấn nút bên dưới để AI sinh audio cho hội thoại
          </p>
          <button
            onClick={generateAudio}
            disabled={isGeneratingAudio}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isGeneratingAudio ? '⏳ Đang sinh audio...' : '🔊 Sinh Audio'}
          </button>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
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

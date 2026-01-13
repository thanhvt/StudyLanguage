'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
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
      const response = await api('/ai/generate-conversation-audio', {
        method: 'POST',
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
        <div className="glass-card p-8 text-center space-y-4">
          {/* Icon Header */}
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/5 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-lg text-foreground">
              Sinh Audio
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Nhấn để AI chuyển đổi hội thoại thành audio với nhiều giọng nói khác nhau
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateAudio}
            disabled={isGeneratingAudio}
            className={`
              inline-flex items-center justify-center gap-2 
              px-8 py-3 rounded-xl font-medium text-white
              bg-gradient-to-r from-primary to-primary/80
              hover:from-primary/90 hover:to-primary/70
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 shadow-lg hover:shadow-xl
              hover:scale-105 active:scale-100
            `}
          >
            {isGeneratingAudio ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang sinh audio...
              </>
            ) : (
              <>
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
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-destructive text-sm mt-2 animate-pulse">{error}</p>
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

'use client';

import { useMusic } from '@/components/providers/music-provider';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/**
 * MusicControlBar Component
 *
 * Mục đích: Thanh điều khiển nhạc nền floating ở góc dưới màn hình
 * Khi nào sử dụng: Hiển thị trên mọi trang để user control nhạc
 */
export function MusicControlBar() {
  const { 
    isPlaying, 
    volume, 
    currentTrack, 
    isDucking,
    toggle, 
    setVolume, 
    nextTrack, 
    prevTrack 
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState(false);

  // Không render nếu chưa có track
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed state - chỉ hiện nút play */}
      {!isExpanded ? (
        <div className="flex items-center gap-2">
          <Button
            onClick={toggle}
            size="lg"
            className={`
              w-14 h-14 rounded-full shadow-lg transition-all
              ${isPlaying 
                ? 'bg-primary animate-pulse' 
                : 'bg-muted hover:bg-primary'
              }
            `}
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
          >
            {isPlaying ? '🎵' : '🎶'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="rounded-full"
          >
            ⚙️
          </Button>
        </div>
      ) : (
        /* Expanded state - full controls */
        <div className="bg-card/95 backdrop-blur-sm border rounded-2xl shadow-xl p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${isPlaying ? 'animate-bounce' : ''}`}>
                🎧
              </span>
              <div>
                <p className="font-medium text-sm">Nhạc nền</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {currentTrack.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="rounded-full"
            >
              ✕
            </Button>
          </div>

          {/* Status */}
          {isDucking && (
            <div className="text-xs text-amber-500 mb-2 flex items-center gap-1">
              🔉 Đang giảm volume (AI đang nói)
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTrack}
              className="rounded-full"
            >
              ⏮️
            </Button>
            <Button
              onClick={toggle}
              size="lg"
              className={`
                w-12 h-12 rounded-full text-xl
                ${isPlaying ? 'bg-primary' : 'bg-muted'}
              `}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              className="rounded-full"
            >
              ⏭️
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-sm">🔈</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
            />
            <span className="text-sm">🔊</span>
          </div>

          {/* Track info */}
          <p className="text-xs text-center text-muted-foreground mt-2">
            Volume: {Math.round(volume * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}

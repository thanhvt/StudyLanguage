'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  src: string;
  transcript?: { text: string; startTime: number; endTime: number }[];
  onTimeUpdate?: (currentTime: number) => void;
}

/**
 * AudioPlayer Component
 *
 * Mục đích: Player audio với các điều khiển Play/Pause, Seek, Volume
 * Tham số:
 *   - src: URL của file audio
 *   - transcript: Mảng các câu với thời gian (cho sync)
 *   - onTimeUpdate: Callback khi thời gian thay đổi (cho sync)
 */
export function AudioPlayer({ src, transcript, onTimeUpdate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Cập nhật duration khi audio load xong
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  /**
   * Toggle Play/Pause
   */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Seek tới vị trí mới
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  /**
   * Thay đổi volume
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = Number(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  /**
   * Thay đổi tốc độ phát
   */
  const handleRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  /**
   * Lùi 10 giây
   */
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  /**
   * Tiến 10 giây
   */
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  /**
   * Format thời gian mm:ss
   */
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      {/* Audio element ẩn */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={skipBackward} title="Lùi 10s">
          ⏪
        </Button>

        <Button
          onClick={togglePlay}
          size="lg"
          className="w-14 h-14 rounded-full text-2xl"
        >
          {isPlaying ? '⏸' : '▶️'}
        </Button>

        <Button variant="ghost" size="sm" onClick={skipForward} title="Tiến 10s">
          ⏩
        </Button>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between">
        {/* Volume */}
        <div className="flex items-center gap-2 w-1/3">
          <span className="text-sm">🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
          />
        </div>

        {/* Playback Rate */}
        <div className="flex gap-1">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <Button
              key={rate}
              variant={playbackRate === rate ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleRateChange(rate)}
              className="text-xs px-2"
            >
              {rate}x
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

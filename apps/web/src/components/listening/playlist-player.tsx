'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  ListMusic,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlaylist } from '@/hooks/use-playlist';
import { PlaylistItem, Playlist } from '@/types/listening-types';
import { api } from '@/lib/api';

/**
 * PlaylistPlayer - Mini player bar cho phát liên tục playlist
 * 
 * Mục đích: Cho phép user nghe liên tục các bài trong playlist
 * Tham số đầu vào:
 *   - playlist: Playlist đang phát
 *   - onClose: Callback khi đóng player
 * Khi nào sử dụng: Khi user chọn phát playlist
 */
interface PlaylistPlayerProps {
  playlist: Playlist | null;
  onClose: () => void;
}

export function PlaylistPlayer({ playlist, onClose }: PlaylistPlayerProps) {
  const { fetchPlaylistWithItems } = usePlaylist();

  // State
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load playlist items khi playlist thay đổi
  useEffect(() => {
    if (!playlist) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      setIsLoading(true);
      const result = await fetchPlaylistWithItems(playlist.id);
      if (result?.items) {
        setItems(result.items);
        setCurrentIndex(0);
      }
      setIsLoading(false);
    };

    loadItems();
  }, [playlist, fetchPlaylistWithItems]);

  // Current item
  const currentItem = items[currentIndex];

  /**
   * Sinh audio cho item hiện tại
   */
  const generateAudioForItem = useCallback(async (item: PlaylistItem) => {
    setIsGeneratingAudio(true);

    try {
      const response = await api('/ai/generate-conversation-audio', {
        method: 'POST',
        body: JSON.stringify({ conversation: item.conversation }),
      }, 600000); // 10 phút timeout cho sinh audio hội thoại dài (lên tới 20 phút)

      if (!response.ok) throw new Error('Lỗi sinh audio');

      const data = await response.json();
      return `data:audio/mpeg;base64,${data.audio}`;
    } catch (err) {
      console.error('[PlaylistPlayer] Lỗi sinh audio:', err);
      return null;
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  /**
   * Phát audio
   */
  const playAudio = useCallback(async () => {
    if (!currentItem) return;

    // Sinh audio nếu chưa có
    const audioUrl = await generateAudioForItem(currentItem);
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentItem, generateAudioForItem, volume]);

  /**
   * Pause audio
   */
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  /**
   * Next track
   */
  const nextTrack = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  }, [currentIndex, items.length]);

  /**
   * Previous track
   */
  const prevTrack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  }, [currentIndex]);

  /**
   * Handle audio ended - auto play next
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentIndex < items.length - 1) {
        // Auto play next
        setCurrentIndex(prev => prev + 1);
        // Sẽ trigger playAudio qua useEffect bên dưới
      } else {
        setIsPlaying(false);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentIndex, items.length]);

  /**
   * Auto play khi chuyển track
   */
  useEffect(() => {
    if (isPlaying && currentItem) {
      playAudio();
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Update volume
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * Format time
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Seek
   */
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  if (!playlist) return null;

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Player bar - cố định bottom */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-background/95 backdrop-blur-xl border-t border-border
        shadow-2xl transition-all duration-300
        playlist-player
        ${isExpanded ? 'h-auto' : 'h-20'}
      `}>
        {/* Expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-background border border-border rounded-t-lg flex items-center justify-center hover:bg-muted"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        <div className="container mx-auto px-4 py-3">
          {/* Main controls */}
          <div className="flex items-center gap-4">
            {/* Playlist info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 playlist-player-icon">
                <ListMusic className="w-6 h-6 text-primary" />
              </div>
              
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {playlist.name}
                </p>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                ) : currentItem ? (
                  <p className="font-medium text-sm truncate">{currentItem.topic}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có bài nào</p>
                )}
                {items.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {currentIndex + 1} / {items.length}
                  </p>
                )}
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTrack}
                disabled={currentIndex === 0 || isLoading}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={togglePlay}
                disabled={isLoading || !currentItem || isGeneratingAudio}
              >
                {isGeneratingAudio ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                disabled={currentIndex >= items.length - 1 || isLoading}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress */}
            <div className="hidden sm:flex flex-1 items-center gap-3">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(v) => setVolume(v[0] / 100)}
              />
            </div>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                pauseAudio();
                onClose();
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Expanded view - track list */}
          {isExpanded && items.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2 border-t border-border pt-4">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsPlaying(true);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left
                    ${index === currentIndex
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {index === currentIndex && isPlaying ? (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.duration} phút • {item.num_speakers} người
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

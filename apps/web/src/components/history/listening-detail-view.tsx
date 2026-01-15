'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Users,
  Pin,
  Star,
  FileText,
  Headphones,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { HistoryEntry } from '@/hooks/use-history';
import { Textarea } from '@/components/ui/textarea';

/**
 * ListeningDetailView - Component chi tiết bài nghe từ lịch sử
 * 
 * Mục đích: Hiển thị chi tiết bài nghe với audio player, transcript, và notes
 * Tham số đầu vào:
 *   - entry: HistoryEntry data
 *   - onBack: Callback quay lại danh sách
 *   - onTogglePin: Callback toggle pin
 *   - onToggleFavorite: Callback toggle favorite
 *   - onUpdateNotes: Callback cập nhật notes
 * Khi nào sử dụng: Trong HistoryDrawer hoặc standalone khi xem chi tiết bài nghe
 */

interface ConversationLine {
  speaker: string;
  text: string;
  audioUrl?: string;
}

interface ListeningDetailViewProps {
  entry: HistoryEntry;
  onBack: () => void;
  onTogglePin?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
}

export function ListeningDetailView({
  entry,
  onBack,
  onTogglePin,
  onToggleFavorite,
  onUpdateNotes,
}: ListeningDetailViewProps) {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Notes state
  const [notes, setNotes] = useState(entry.userNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Transcript từ content
  const conversation: ConversationLine[] = entry.content?.conversation || [];
  const audioUrl = entry.content?.audioUrl || '';

  // Khởi tạo audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    setAudioRef(audio);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef) return;

    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  }, [audioRef, isPlaying]);

  // Seek
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return;
    const newTime = Number(e.target.value);
    audioRef.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioRef]);

  // Skip backward/forward
  const skipBackward = useCallback(() => {
    if (!audioRef) return;
    audioRef.currentTime = Math.max(0, audioRef.currentTime - 10);
  }, [audioRef]);

  const skipForward = useCallback(() => {
    if (!audioRef) return;
    audioRef.currentTime = Math.min(duration, audioRef.currentTime + 10);
  }, [audioRef, duration]);

  // Volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return;
    const newVolume = Number(e.target.value);
    audioRef.volume = newVolume;
    setVolume(newVolume);
  }, [audioRef]);

  // Playback rate
  const handleRateChange = useCallback((rate: number) => {
    if (!audioRef) return;
    audioRef.playbackRate = rate;
    setPlaybackRate(rate);
  }, [audioRef]);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!onUpdateNotes) return;
    setIsSavingNotes(true);
    try {
      await onUpdateNotes(entry.id, notes);
      setIsEditingNotes(false);
    } catch {
      // Error handled by hook
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Xác định speaker label
  const getSpeakerLabel = (speaker: string) => {
    if (speaker.toLowerCase().includes('a') || speaker === '1') return 'A';
    if (speaker.toLowerCase().includes('b') || speaker === '2') return 'B';
    if (speaker.toLowerCase().includes('c') || speaker === '3') return 'C';
    return speaker.charAt(0).toUpperCase();
  };

  // Màu cho speaker
  const getSpeakerColor = (speaker: string) => {
    const label = getSpeakerLabel(speaker);
    const colors: Record<string, string> = {
      'A': 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
      'B': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      'C': 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    };
    return colors[label] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 w-9 p-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-lg truncate">
            {entry.topic}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {entry.durationMinutes || 5} phút
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {entry.numSpeakers || 2} người
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin?.(entry.id)}
            className={`h-8 w-8 p-0 ${entry.isPinned ? 'text-amber-500' : ''}`}
          >
            <Pin className={`w-4 h-4 ${entry.isPinned ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite?.(entry.id)}
            className={`h-8 w-8 p-0 ${entry.isFavorite ? 'text-red-500' : ''}`}
          >
            <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Audio Player Section */}
      <GlassCard className="p-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl skill-card-listening flex items-center justify-center shadow-lg">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-medium">Bài nghe</p>
            <p className="text-xs text-muted-foreground">
              {audioUrl ? 'Sẵn sàng phát' : 'Không có audio'}
            </p>
          </div>
        </div>

        {audioUrl ? (
          <>
            {/* Progress bar */}
            <div className="space-y-2 mb-4">
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={skipBackward} title="Lùi 10s">
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                onClick={togglePlay}
                size="lg"
                className="w-14 h-14 rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={skipForward} title="Tiến 10s">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume & Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
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

              <div className="flex gap-1">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleRateChange(rate)}
                    className="text-xs px-2 h-7"
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Audio không khả dụng</p>
            <Button variant="outline" size="sm" className="mt-2">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tạo lại audio
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Transcript Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium">Transcript</h3>
          <span className="text-xs text-muted-foreground">({conversation.length} câu)</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {conversation.length > 0 ? (
            conversation.map((line, index) => {
              const label = getSpeakerLabel(line.speaker);
              const colorClass = getSpeakerColor(line.speaker);
              const isLeft = ['A', '1'].some(s => line.speaker.includes(s));

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] ${isLeft ? '' : 'text-right'}`}>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1 border ${colorClass}`}>
                      Speaker {label}
                    </span>
                    <div className={`p-3 rounded-2xl ${isLeft ? 'bg-muted rounded-tl-sm' : 'bg-primary/10 rounded-tr-sm'}`}>
                      <p className="text-sm leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không có transcript</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-4 pt-4 border-t border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-2">
            📝 Ghi chú
          </h3>
          {!isEditingNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNotes(true)}
              className="text-xs h-7"
            >
              {notes ? 'Sửa' : 'Thêm ghi chú'}
            </Button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú cho bài học này..."
              className="min-h-[80px] text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNotes(entry.userNotes || '');
                  setIsEditingNotes(false);
                }}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        ) : notes ? (
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {notes}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Chưa có ghi chú
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default ListeningDetailView;

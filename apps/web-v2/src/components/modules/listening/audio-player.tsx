"use client"

import * as React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Gauge,
  Loader2
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { PlaybackSpeed, ConversationTimestamp } from "@/types/listening-types"

interface AudioPlayerProps {
  audioSrc?: string
  title: string
  subtitle?: string
  timestamps?: ConversationTimestamp[]
  onTimeUpdate?: (time: number) => void
  onEnded?: () => void
  onSkipPrev?: () => void
  onSkipNext?: () => void
  isLoading?: boolean
}

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string; description: string }[] = [
  { value: 0.5, label: "0.5x", description: "Very Slow" },
  { value: 0.75, label: "0.75x", description: "Slow" },
  { value: 1, label: "1x", description: "Normal" },
  { value: 1.25, label: "1.25x", description: "Faster" },
  { value: 1.5, label: "1.5x", description: "Fast" },
  { value: 1.75, label: "1.75x", description: "Very Fast" },
  { value: 2, label: "2x", description: "Double" },
]

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({
  audioSrc,
  title,
  subtitle,
  timestamps,
  onTimeUpdate,
  onEnded,
  onSkipPrev,
  onSkipNext,
  isLoading = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

  // Handle audio time update
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      setCurrentTime(audio.currentTime)
      onTimeUpdate?.(audio.currentTime)
    }
  }, [onTimeUpdate])

  // Handle audio loaded metadata
  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio) {
      setDuration(audio.duration)
    }
  }

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false)
    onEnded?.()
  }

  // Toggle play/pause
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !audioSrc) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Seek to position
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  // Change speed
  const handleSpeedChange = (newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = newSpeed
    }
  }

  // Change volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
    }
  }

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      if (isMuted) {
        audio.volume = volume || 1
        setIsMuted(false)
      } else {
        audio.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Skip backward 10 seconds
  const skipBackward = () => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    }
  }

  // Skip forward 10 seconds
  const skipForward = () => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10)
    }
  }

  // Calculate progress percentage
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
      "w-[95%] max-w-2xl",
      "bg-background/90 backdrop-blur-xl",
      "border border-border/50 shadow-2xl shadow-black/20",
      "rounded-2xl p-4",
      "dark:bg-background/80 dark:border-border/30"
    )}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex flex-col gap-3">
        {/* Top Row: Track Info + Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold truncate">{title}</span>
            {subtitle && (
              <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
            )}
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-9 text-muted-foreground hover:text-foreground"
              onClick={onSkipPrev || skipBackward}
            >
              <SkipBack className="size-4" />
            </Button>
            
            <Button 
              size="icon" 
              className={cn(
                "size-12 rounded-full",
                "bg-gradient-to-br from-skill-listening to-primary",
                "shadow-lg shadow-primary/30",
                "hover:shadow-xl hover:shadow-primary/40",
                "transition-all duration-200"
              )}
              onClick={togglePlay}
              disabled={!audioSrc || isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current ml-0.5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-9 text-muted-foreground hover:text-foreground"
              onClick={onSkipNext || skipForward}
            >
              <SkipForward className="size-4" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Speed Control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs font-mono gap-1"
                >
                  <Gauge className="size-3.5" />
                  {speed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {SPEED_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSpeedChange(option.value)}
                    className={cn(
                      "flex justify-between",
                      speed === option.value && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="font-mono">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Volume Control */}
            <div 
              className="relative"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
              
              {showVolume && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-popover border rounded-lg shadow-lg">
                  <Slider
                    orientation="vertical"
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    className="h-20"
                    onValueChange={handleVolumeChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs text-muted-foreground font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              className="cursor-pointer"
              onValueChange={handleSeek}
            />
            {/* Progress Glow Effect */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-gradient-to-r from-skill-listening to-primary opacity-50 blur-sm pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

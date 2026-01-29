"use client"

/**
 * audio-player.tsx - Local audio player UI for Listening page (Full Mode)
 * 
 * This component syncs with the global audio store for playback controls
 * but provides the full UI experience for the Listening page.
 */

import * as React from "react"
import { useCallback, useState } from "react"
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
import { useAudioPlayerStore, selectProgress } from "@/stores/audio-player-store"
import type { PlaybackSpeed, ConversationTimestamp } from "@/types/listening-types"

interface AudioPlayerProps {
  audioSrc?: string
  title: string
  subtitle?: string
  timestamps?: ConversationTimestamp[]
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
  onSkipPrev,
  onSkipNext,
  isLoading: externalLoading = false,
}: AudioPlayerProps) {
  const [showVolume, setShowVolume] = useState(false)
  
  // Global store state
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const currentTime = useAudioPlayerStore((s) => s.currentTime)
  const duration = useAudioPlayerStore((s) => s.duration)
  const speed = useAudioPlayerStore((s) => s.speed)
  const volume = useAudioPlayerStore((s) => s.volume)
  const isMuted = useAudioPlayerStore((s) => s.isMuted)
  const isLoading = useAudioPlayerStore((s) => s.isLoading)
  const progress = useAudioPlayerStore(selectProgress)
  
  // Global store actions
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay)
  const seek = useAudioPlayerStore((s) => s.seek)
  const setVolume = useAudioPlayerStore((s) => s.setVolume)
  const setSpeed = useAudioPlayerStore((s) => s.setSpeed)
  const toggleMute = useAudioPlayerStore((s) => s.toggleMute)

  // Handle seek
  const handleSeek = useCallback((value: number[]) => {
    seek(value[0])
  }, [seek])

  // Handle speed change
  const handleSpeedChange = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
  }, [setSpeed])

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0])
  }, [setVolume])

  // Skip backward 10 seconds
  const skipBackward = useCallback(() => {
    seek(Math.max(0, currentTime - 10))
  }, [currentTime, seek])

  // Skip forward 10 seconds
  const skipForward = useCallback(() => {
    seek(Math.min(duration, currentTime + 10))
  }, [currentTime, duration, seek])

  // Combined loading state
  const showLoading = isLoading || externalLoading

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!audioSrc) return

    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowLeft':
      case 'j':
        e.preventDefault()
        skipBackward()
        break
      case 'ArrowRight':
      case 'l':
        e.preventDefault()
        skipForward()
        break
      case 'ArrowUp':
        e.preventDefault()
        handleVolumeChange([Math.min(1, volume + 0.1)])
        break
      case 'ArrowDown':
        e.preventDefault()
        handleVolumeChange([Math.max(0, volume - 0.1)])
        break
      case 'm':
        e.preventDefault()
        toggleMute()
        break
    }
  }, [audioSrc, volume, togglePlay, skipBackward, skipForward, handleVolumeChange, toggleMute])

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "w-[95%] max-w-2xl",
        "bg-background/90 backdrop-blur-xl",
        "border border-border/50 shadow-2xl shadow-black/20",
        "rounded-2xl p-4",
        "dark:bg-background/80 dark:border-border/30"
      )}
      role="region"
      aria-label="Audio player"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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
              aria-label="Skip backward 10 seconds"
              className="size-9 text-muted-foreground hover:text-foreground"
              onClick={onSkipPrev || skipBackward}
            >
              <SkipBack className="size-4" aria-hidden="true" />
            </Button>
            
            <Button 
              size="icon" 
              aria-label={showLoading ? "Loading audio" : isPlaying ? "Pause" : "Play"}
              className={cn(
                "size-12 rounded-full",
                "bg-gradient-to-br from-primary/90 to-primary",
                "shadow-lg shadow-primary/30",
                "hover:shadow-xl hover:shadow-primary/40",
                "transition-all duration-200"
              )}
              onClick={togglePlay}
              disabled={!audioSrc || showLoading}
            >
              {showLoading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : isPlaying ? (
                <Pause className="size-5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="size-5 fill-current ml-0.5" aria-hidden="true" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Skip forward 10 seconds"
              className="size-9 text-muted-foreground hover:text-foreground"
              onClick={onSkipNext || skipForward}
            >
              <SkipForward className="size-4" aria-hidden="true" />
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
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="size-4" aria-hidden="true" />
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
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-gradient-to-r from-primary/80 to-primary opacity-50 blur-sm pointer-events-none"
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

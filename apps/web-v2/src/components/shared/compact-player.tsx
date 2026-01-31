"use client"

/**
 * compact-player.tsx - Compact audio player component
 * 
 * Mục đích: Hiển thị player thu gọn khi user ở trang khác (không phải /listening)
 * 
 * Tham số đầu vào:
 * - isVisible: boolean - Có hiển thị player hay không
 * 
 * Tham số đầu ra: JSX.Element
 * 
 * Luồng sử dụng:
 * - Được dynamic import từ GlobalAudioPlayer với ssr: false
 * - Tránh hydration mismatch do Radix UI DropdownMenu sinh ID khác nhau giữa server/client
 */

import * as React from "react"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Gauge,
  X,
  ChevronDown,
  Headphones,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAudioPlayerStore, selectProgress } from "@/stores/audio-player-store"
import type { PlaybackSpeed } from "@/types/listening-types"

// ============================================
// CONSTANTS
// ============================================

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
]

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ============================================
// COMPACT PLAYER COMPONENT
// ============================================

interface CompactPlayerProps {
  isVisible: boolean
}

export function CompactPlayer({ isVisible }: CompactPlayerProps) {
  const router = useRouter()
  
  // Store state
  const title = useAudioPlayerStore((s) => s.title)
  const subtitle = useAudioPlayerStore((s) => s.subtitle)
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const currentTime = useAudioPlayerStore((s) => s.currentTime)
  const duration = useAudioPlayerStore((s) => s.duration)
  const progress = useAudioPlayerStore(selectProgress)
  const speed = useAudioPlayerStore((s) => s.speed)
  const isLoading = useAudioPlayerStore((s) => s.isLoading)
  const topic = useAudioPlayerStore((s) => s.topic)
  
  // Store actions
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay)
  const seek = useAudioPlayerStore((s) => s.seek)
  const setSpeed = useAudioPlayerStore((s) => s.setSpeed)
  const pause = useAudioPlayerStore((s) => s.pause)
  const close = useAudioPlayerStore((s) => s.close)
  const minimize = useAudioPlayerStore((s) => s.minimize)
  
  // Handle seek
  const handleSeek = useCallback((value: number[]) => {
    seek(value[0])
  }, [seek])
  
  // Skip backward/forward
  const skipBackward = useCallback(() => {
    seek(Math.max(0, currentTime - 10))
  }, [currentTime, seek])
  
  const skipForward = useCallback(() => {
    seek(Math.min(duration, currentTime + 10))
  }, [currentTime, duration, seek])
  
  // Đóng player và pause audio trước
  const handleClose = useCallback(() => {
    pause() // Pause audio trước khi close
    close()
  }, [pause, close])
  
  // Navigate tới listening page - sử dụng query param để trigger viewState
  const goToSession = useCallback(() => {
    // Khi có topic trong store, navigate về /listening với query để restore session
    if (topic?.id) {
      router.push(`/listening?session=restore`)
    } else {
      router.push('/listening')
    }
  }, [router, topic])
  
  return (
    <div 
      className={cn(
        // Layout footer - không dùng fixed
        "flex-shrink-0 w-full",
        "bg-background/95 backdrop-blur-xl",
        "border-t border-border/50",
        "dark:bg-background/90 dark:border-border/30",
        // Slide up/down animation
        "transition-all duration-300 ease-out",
        "overflow-hidden",
        // Hide when not visible
        isVisible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
      )}
      role="region"
      aria-label="Audio player"
      aria-hidden={!isVisible}
    >
      {/* Progress bar at top */}
      <div className="h-1 bg-muted/30">
        <div 
          className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="p-3 flex items-center gap-3 max-w-5xl mx-auto">
        {/* Track Info - Click để chuyển về Listening page với transcript */}
        <button 
          onClick={goToSession}
          className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer text-left"
        >
          {/* Icon */}
          <div className={cn(
            "size-10 rounded-lg shrink-0",
            "bg-gradient-to-br from-primary/20 to-primary/10",
            "flex items-center justify-center",
            "group-hover:from-primary/30 group-hover:to-primary/20",
            "transition-colors"
          )}>
            <Headphones className="size-5 text-primary" />
          </div>
          
          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm group-hover:text-primary transition-colors">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </button>
        
        {/* Time Display */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-mono shrink-0">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Skip Back */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={skipBackward}
            aria-label="Skip backward 10 seconds"
          >
            <SkipBack className="size-4" />
          </Button>
          
          {/* Play/Pause */}
          <Button
            size="icon"
            className={cn(
              "size-10 rounded-full",
              "bg-gradient-to-br from-primary/90 to-primary",
              "shadow-lg shadow-primary/25",
              "hover:shadow-xl hover:shadow-primary/35",
              "transition-all duration-200"
            )}
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current ml-0.5" />
            )}
          </Button>
          
          {/* Skip Forward */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={skipForward}
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward className="size-4" />
          </Button>
          
          {/* Speed Control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-mono gap-1 hidden sm:flex"
              >
                <Gauge className="size-3.5" />
                {speed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-24">
              {SPEED_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSpeed(option.value)}
                  className={cn(
                    "font-mono justify-center",
                    speed === option.value && "bg-primary/10 text-primary"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          

          
          {/* Separator */}
          <div className="w-px h-6 bg-border/50 mx-1" />
          
          {/* Minimize */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={minimize}
            aria-label="Minimize player"
          >
            <ChevronDown className="size-4" />
          </Button>
          
          {/* Close - Pause audio trước khi đóng */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={handleClose}
            aria-label="Close player"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CompactPlayer

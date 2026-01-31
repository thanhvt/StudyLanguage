"use client"

/**
 * minimized-player.tsx - Minimized floating audio player component
 * 
 * Mục đích: Hiển thị player dạng floating pill nhỏ gọn khi user minimize player
 * 
 * Tham số đầu vào: Không có (lấy state từ store)
 * 
 * Tham số đầu ra: JSX.Element
 * 
 * Luồng sử dụng:
 * - Được dynamic import từ GlobalAudioPlayer với ssr: false
 * - Hiển thị khi mode = 'minimized' và audio đang active
 */

import * as React from "react"
import { 
  Play, 
  Pause, 
  X,
  ChevronUp,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAudioPlayerStore, selectProgress } from "@/stores/audio-player-store"

export function MinimizedPlayer() {
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const isLoading = useAudioPlayerStore((s) => s.isLoading)
  const progress = useAudioPlayerStore(selectProgress)
  
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay)
  const expand = useAudioPlayerStore((s) => s.expand)
  const close = useAudioPlayerStore((s) => s.close)
  
  return (
    <div 
      className={cn(
        // Minimized mode vẫn dùng fixed (floating pill)
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-1",
        "bg-background/95 backdrop-blur-xl",
        "border border-border/50 shadow-2xl shadow-black/20",
        "rounded-full p-1.5",
        "dark:bg-background/90 dark:border-border/30",
        // Entrance animation
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
      role="region"
      aria-label="Minimized audio player"
    >
      {/* Progress Ring */}
      <div className="relative">
        <svg className="size-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-muted/30"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-primary transition-all duration-100"
            strokeWidth="3"
            strokeDasharray={`${progress} 100`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Play/Pause button inside ring */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "rounded-full",
            "hover:bg-primary/10 transition-colors"
          )}
          aria-label={isLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : isPlaying ? (
            <Pause className="size-4 text-primary fill-current" />
          ) : (
            <Play className="size-4 text-primary fill-current ml-0.5" />
          )}
        </button>
      </div>
      
      {/* Expand */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-foreground rounded-full"
        onClick={expand}
        aria-label="Expand player"
      >
        <ChevronUp className="size-4" />
      </Button>
      
      {/* Close */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive rounded-full"
        onClick={close}
        aria-label="Close player"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

export default MinimizedPlayer

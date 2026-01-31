"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Mic, StopCircle } from "lucide-react"

interface VoiceVisualizerProps {
  isListening: boolean
  isProcessing?: boolean
  duration?: number
  onClick?: () => void
  disabled?: boolean
  showKeyboardHint?: boolean
  sessionStats?: {
    duration: number
    messageCount: number
    correctionCount: number
  }
}

export function VoiceVisualizer({ 
  isListening, 
  isProcessing,
  duration = 0,
  onClick,
  disabled,
  showKeyboardHint = false,
  sessionStats
}: VoiceVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(40).fill(8))

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isListening) {
      interval = setInterval(() => {
        setBars(prev => prev.map((_, i) => {
          // Create wave pattern from center
          const center = prev.length / 2
          const distance = Math.abs(i - center)
          const maxHeight = 60 - distance * 1.5
          return Math.floor(Math.random() * maxHeight) + 10
        }))
      }, 80)
    } else {
      setBars(Array(40).fill(8))
    }
    return () => clearInterval(interval)
  }, [isListening])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-6 relative">

      {/* Main Button */}
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer overflow-hidden",
          isListening 
            ? "w-32 h-32 bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-xl shadow-red-500/30" 
            : isProcessing
            ? "w-28 h-28 bg-gradient-to-br from-amber-500 to-orange-600"
            : disabled
            ? "w-28 h-28 bg-muted cursor-not-allowed"
            : "w-28 h-28 bg-gradient-to-br from-primary/90 to-primary hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        )}
        onClick={disabled ? undefined : onClick}
      >
        {/* Glow Ring Animation */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
            <div className="absolute inset-[-8px] rounded-full border-4 border-red-400/50 animate-pulse" />
          </>
        )}

        {/* Icon */}
        <div className="z-10 text-white">
          {isListening ? (
            <StopCircle className="size-12" />
          ) : isProcessing ? (
            <div className="size-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Mic className="size-10" />
          )}
        </div>
      </div>

      {/* Waveform Visualizer */}
      {isListening && (
        <div className="flex items-center justify-center gap-[2px] h-16 px-4">
          {bars.map((height, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-gradient-to-t from-primary/70 to-primary transition-all duration-75"
              style={{ 
                height: `${height}px`,
                boxShadow: '0 0 8px hsl(var(--primary) / 0.3)'
              }}
            />
          ))}
        </div>
      )}

      {/* Duration Counter */}
      {isListening && (
        <div className="flex items-center gap-2 text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-lg font-medium">{formatDuration(duration)}</span>
        </div>
      )}

      {/* Status Text */}
      <p className={cn(
        "text-sm font-medium transition-colors",
        isListening 
          ? "text-red-500" 
          : isProcessing 
          ? "text-amber-500 animate-pulse"
          : disabled
          ? "text-muted-foreground"
          : "text-muted-foreground"
      )}>
        {isListening 
          ? "Recording... Tap to stop" 
          : isProcessing 
          ? "Processing your speech..."
          : disabled
          ? "Switch to Voice mode to speak"
          : "Tap to speak"
        }
      </p>

      {/* Keyboard Hint */}
      {showKeyboardHint && !isListening && !isProcessing && !disabled && (
        <div className="text-xs text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-full border border-border/50">
          Press <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono mx-1">Space</kbd> to start recording
        </div>
      )}
    </div>
  )
}

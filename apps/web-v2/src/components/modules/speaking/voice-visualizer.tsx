"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Mic } from "lucide-react"

interface VoiceVisualizerProps {
  isListening: boolean
  onClick?: () => void
}

export function VoiceVisualizer({ isListening, onClick }: VoiceVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(20))

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isListening) {
      interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 15))
      }, 100)
    } else {
      setBars(Array(12).fill(20))
    }
    return () => clearInterval(interval)
  }, [isListening])

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center p-8 rounded-full transition-all duration-300 cursor-pointer overflow-hidden",
        isListening ? "bg-primary/10 scale-110" : "bg-card hover:bg-muted scale-100 shadow-sm border"
      )}
      onClick={onClick}
    >
      {/* Background Pulse Effect */}
      {isListening && (
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" />
      )}

      {/* Main Icon or Waveform */}
      <div className="flex items-center gap-1 h-8 z-10 transition-all">
        {isListening ? (
          bars.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          ))
        ) : (
          <Mic className="size-8 text-primary fill-primary/20" />
        )}
      </div>
    </div>
  )
}

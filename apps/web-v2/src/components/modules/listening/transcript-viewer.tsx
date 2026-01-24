"use client"

import * as React from "react"
import { useRef, useEffect, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ConversationLine, ConversationTimestamp } from "@/types/listening-types"

interface TranscriptViewerProps {
  conversation: ConversationLine[]
  currentTime: number
  timestamps?: ConversationTimestamp[]
  onSeek?: (time: number) => void
  className?: string
}

// Speaker colors for visual distinction
const SPEAKER_COLORS = [
  { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
  { bg: "bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/30" },
  { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
]

function getSpeakerColor(speakerIndex: number) {
  return SPEAKER_COLORS[speakerIndex % SPEAKER_COLORS.length]
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TranscriptViewer({
  conversation,
  currentTime,
  timestamps,
  onSeek,
  className,
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Build speaker map for consistent coloring
  const speakerMap = useMemo(() => {
    const map = new Map<string, number>()
    let index = 0
    conversation.forEach(line => {
      if (!map.has(line.speaker)) {
        map.set(line.speaker, index++)
      }
    })
    return map
  }, [conversation])

  // Find active line index based on current time
  const activeLineIndex = useMemo(() => {
    if (!timestamps || timestamps.length === 0) return -1
    
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (currentTime >= timestamps[i].startTime) {
        return i
      }
    }
    return -1
  }, [currentTime, timestamps])

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLineIndex])

  // Handle line click for seeking
  const handleLineClick = (index: number) => {
    if (timestamps && timestamps[index] && onSeek) {
      onSeek(timestamps[index].startTime)
    }
  }

  // Format speaker label
  const getSpeakerLabel = (speaker: string) => {
    // Convert "Person A" to "Speaker A" or keep as is
    if (speaker.toLowerCase().startsWith('person')) {
      return speaker.replace(/person/i, 'Speaker')
    }
    return speaker
  }

  // Determine if speaker should be on left or right (for chat-bubble layout)
  const isLeftSpeaker = (speaker: string) => {
    const index = speakerMap.get(speaker) ?? 0
    return index % 2 === 0
  }

  if (conversation.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        No conversation to display
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-lg font-semibold mb-4 px-2">Transcript</h3>
      
      <ScrollArea className="h-[400px] rounded-2xl border bg-card/30 p-4 shadow-inner">
        <div ref={containerRef} className="space-y-4">
          {conversation.map((line, index) => {
            const isActive = index === activeLineIndex
            const isPlayed = activeLineIndex >= 0 && index < activeLineIndex
            const speakerIndex = speakerMap.get(line.speaker) ?? 0
            const colors = getSpeakerColor(speakerIndex)
            const isLeft = isLeftSpeaker(line.speaker)
            const timestamp = timestamps?.[index]
            
            return (
              <div
                key={line.id || index}
                ref={isActive ? activeLineRef : null}
                className={cn(
                  "flex",
                  isLeft ? "justify-start" : "justify-end"
                )}
              >
                <div
                  onClick={() => handleLineClick(index)}
                  className={cn(
                    "max-w-[85%] p-4 rounded-2xl transition-all duration-300 cursor-pointer",
                    "border",
                    isLeft ? "rounded-tl-sm" : "rounded-tr-sm",
                    // Active state - highlighted
                    isActive && [
                      "scale-[1.02] shadow-lg",
                      colors.bg,
                      colors.border,
                      "ring-2 ring-primary/30"
                    ],
                    // Played state - normal
                    isPlayed && !isActive && [
                      "bg-muted/30 border-border/30",
                      "opacity-70"
                    ],
                    // Future state - dimmed
                    !isActive && !isPlayed && [
                      "bg-muted/20 border-border/20",
                      "opacity-50 grayscale-[30%]"
                    ],
                    // Hover effect
                    "hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  {/* Speaker Label & Timestamp */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isActive ? colors.text : "text-muted-foreground"
                    )}>
                      {getSpeakerLabel(line.speaker)}
                    </span>
                    {timestamp && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatTimestamp(timestamp.startTime)}
                      </span>
                    )}
                  </div>

                  {/* Message Text */}
                  <p className={cn(
                    "text-base leading-relaxed",
                    isActive 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  )}>
                    {line.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

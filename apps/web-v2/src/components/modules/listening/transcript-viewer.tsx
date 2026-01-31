"use client"

import * as React from "react"
import { useRef, useEffect, useMemo, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  MessageSquare, 
  Mic, 
  Headphones, 
  Radio, 
  Music,
  Minimize2,
  Maximize2
} from "lucide-react"
import type { ConversationLine, ConversationTimestamp } from "@/types/listening-types"

interface TranscriptViewerProps {
  conversation: ConversationLine[]
  currentTime: number
  totalDuration?: number
  timestamps?: ConversationTimestamp[]
  onSeek?: (time: number) => void
  className?: string
}

// Speaker config with icons and gradients
const SPEAKER_CONFIG = [
  { 
    icon: Mic,
    bg: "bg-blue-500/15", 
    text: "text-blue-600 dark:text-blue-400", 
    border: "border-blue-500/40",
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20"
  },
  { 
    icon: Headphones,
    bg: "bg-emerald-500/15", 
    text: "text-emerald-600 dark:text-emerald-400", 
    border: "border-emerald-500/40",
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20"
  },
  { 
    icon: Radio,
    bg: "bg-violet-500/15", 
    text: "text-violet-600 dark:text-violet-400", 
    border: "border-violet-500/40",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/20"
  },
  { 
    icon: Music,
    bg: "bg-amber-500/15", 
    text: "text-amber-600 dark:text-amber-400", 
    border: "border-amber-500/40",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20"
  },
]

function getSpeakerConfig(speakerIndex: number) {
  return SPEAKER_CONFIG[speakerIndex % SPEAKER_CONFIG.length]
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TranscriptViewer({
  conversation,
  currentTime,
  totalDuration,
  timestamps,
  onSeek,
  className,
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)
  const [isCompact, setIsCompact] = useState(false)

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

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (totalDuration && totalDuration > 0) {
      return Math.min((currentTime / totalDuration) * 100, 100)
    }
    if (conversation.length > 0 && activeLineIndex >= 0) {
      return ((activeLineIndex + 1) / conversation.length) * 100
    }
    return 0
  }, [currentTime, totalDuration, activeLineIndex, conversation.length])

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
    if (speaker.toLowerCase().startsWith('person')) {
      return speaker.replace(/person/i, 'Speaker')
    }
    return speaker
  }

  // Determine if speaker should be on left or right
  const isLeftSpeaker = (speaker: string) => {
    const index = speakerMap.get(speaker) ?? 0
    return index % 2 === 0
  }

  if (conversation.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-64 text-muted-foreground gap-3", className)}>
        <MessageSquare className="w-12 h-12 opacity-30" />
        <p>No conversation to display</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full relative", className)}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Transcript</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Display */}
          {totalDuration && (
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {formatTimestamp(currentTime)} / {formatTimestamp(totalDuration)}
            </span>
          )}
          
          {/* Line Counter Badge */}
          <Badge variant="secondary" className="text-xs font-mono">
            {activeLineIndex >= 0 ? activeLineIndex + 1 : 0}/{conversation.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mb-3 mx-2">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Transcript Content - 50% viewport height */}
      <div className="relative">
        {/* Floating Compact Toggle Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-background border border-border/50"
          onClick={() => setIsCompact(!isCompact)}
          title={isCompact ? "Mở rộng" : "Thu gọn"}
        >
          {isCompact ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </Button>

        <ScrollArea 
          className={cn(
            "rounded-2xl border bg-card/30 backdrop-blur-sm shadow-inner transition-all duration-300 overflow-hidden",
            isCompact ? "h-[40vh] p-3" : "h-[50vh] p-4"
          )}
          role="region"
          aria-label="Conversation transcript"
        >
        <div ref={containerRef} className={cn("space-y-3 pt-2", isCompact && "space-y-2")}>
          {conversation.map((line, index) => {
            const isActive = index === activeLineIndex
            const isPlayed = activeLineIndex >= 0 && index < activeLineIndex
            const speakerIndex = speakerMap.get(line.speaker) ?? 0
            const config = getSpeakerConfig(speakerIndex)
            const isLeft = isLeftSpeaker(line.speaker)
            const timestamp = timestamps?.[index]
            const SpeakerIcon = config.icon
            
            return (
              <div
                key={line.id || index}
                ref={isActive ? activeLineRef : null}
                className={cn(
                  "flex gap-2",
                  isLeft ? "justify-start" : "justify-end"
                )}
              >
                {/* Speaker Avatar - Left */}
                {isLeft && (
                  <div className={cn(
                    "shrink-0 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompact ? "w-6 h-6" : "w-8 h-8",
                    isActive 
                      ? `bg-gradient-to-br ${config.gradient} shadow-lg ${config.glow}` 
                      : "bg-muted/50"
                  )}>
                    <SpeakerIcon className={cn(
                      "text-white",
                      isCompact ? "w-3 h-3" : "w-4 h-4",
                      !isActive && "opacity-50"
                    )} />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  onClick={() => handleLineClick(index)}
                  className={cn(
                    "max-w-[80%] rounded-2xl transition-all duration-300 cursor-pointer border",
                    isCompact ? "p-2.5" : "p-4",
                    isLeft ? "rounded-tl-sm" : "rounded-tr-sm",
                    // Active state
                    isActive && [
                      config.bg,
                      config.border,
                      "ring-2 ring-offset-1 ring-offset-background",
                      `ring-${config.gradient.split('-')[1]}-500/40`,
                      `shadow-lg ${config.glow}`
                    ],
                    // Played state
                    isPlayed && !isActive && [
                      "bg-muted/40 border-border/40"
                    ],
                    // Future state
                    !isActive && !isPlayed && [
                      "bg-muted/20 border-border/20",
                      "opacity-60"
                    ],
                    // Hover
                    "hover:opacity-100 hover:bg-muted/40 hover:border-border/50"
                  )}
                >
                  {/* Speaker Label & Timestamp */}
                  <div className={cn(
                    "flex items-center gap-2",
                    isCompact ? "mb-0.5" : "mb-1.5"
                  )}>
                    <span className={cn(
                      "font-semibold uppercase tracking-wide",
                      isCompact ? "text-[10px]" : "text-xs",
                      isActive ? config.text : "text-muted-foreground"
                    )}>
                      {getSpeakerLabel(line.speaker)}
                    </span>
                    {timestamp && (
                      <span className={cn(
                        "text-muted-foreground/70 font-mono",
                        isCompact ? "text-[9px]" : "text-[10px]"
                      )}>
                        {formatTimestamp(timestamp.startTime)}
                      </span>
                    )}
                  </div>

                  {/* Message Text */}
                  <p className={cn(
                    "leading-relaxed",
                    isCompact ? "text-sm" : "text-base",
                    isActive 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  )}>
                    {line.text}
                  </p>
                </div>

                {/* Speaker Avatar - Right */}
                {!isLeft && (
                  <div className={cn(
                    "shrink-0 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompact ? "w-6 h-6" : "w-8 h-8",
                    isActive 
                      ? `bg-gradient-to-br ${config.gradient} shadow-lg ${config.glow}` 
                      : "bg-muted/50"
                  )}>
                    <SpeakerIcon className={cn(
                      "text-white",
                      isCompact ? "w-3 h-3" : "w-4 h-4",
                      !isActive && "opacity-50"
                    )} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        </ScrollArea>
      </div>
    </div>
  )
}

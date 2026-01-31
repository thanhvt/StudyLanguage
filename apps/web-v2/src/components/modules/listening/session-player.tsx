"use client"

import * as React from "react"
import { useCallback, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TranscriptViewer } from "./transcript-viewer"
import { AudioPlayer } from "./audio-player"
import { 
  Clock, 
  Users, 
  RotateCcw, 
  BookmarkPlus,
  Loader2,
} from "lucide-react"
import type { 
  ConversationLine, 
  ConversationTimestamp, 
  TopicScenario 
} from "@/types/listening-types"
import { useAudioPlayerStore } from "@/stores/audio-player-store"

interface SessionPlayerProps {
  topic: TopicScenario
  category?: string
  subCategory?: string
  conversation: ConversationLine[]
  duration: number
  speakers: number
  audioUrl?: string
  timestamps?: ConversationTimestamp[]
  isGeneratingAudio?: boolean
  onReset: () => void
  onSaveToPlaylist?: () => void
  onAudioGenerated?: (url: string, timestamps: ConversationTimestamp[]) => void
}

export function SessionPlayer({
  topic,
  category,
  subCategory,
  conversation,
  duration,
  speakers,
  audioUrl,
  timestamps,
  isGeneratingAudio = false,
  onReset,
  onSaveToPlaylist,
}: SessionPlayerProps) {
  // Global audio store
  const requestAudioChange = useAudioPlayerStore((s) => s.requestAudioChange)
  const setIsLoading = useAudioPlayerStore((s) => s.setIsLoading)
  const globalCurrentTime = useAudioPlayerStore((s) => s.currentTime)
  const globalDuration = useAudioPlayerStore((s) => s.duration)
  const seek = useAudioPlayerStore((s) => s.seek)
  const setMode = useAudioPlayerStore((s) => s.setMode)

  // Sync audio to global store when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      requestAudioChange({
        audioUrl,
        title: topic.name,
        subtitle: `${category || ''}${subCategory ? ` • ${subCategory}` : ''}`,
        timestamps,
        conversation,
        topic,
        category,
        subCategory,
      })
      // Set to full mode on Listening page
      setMode('full')
    }
  }, [audioUrl, topic, category, subCategory, timestamps, conversation, requestAudioChange, setMode])

  // Sync loading state
  useEffect(() => {
    setIsLoading(isGeneratingAudio)
  }, [isGeneratingAudio, setIsLoading])

  // Handle seek from transcript
  const handleSeek = useCallback((time: number) => {
    seek(time)
  }, [seek])

  // Calculate total words
  const totalWords = conversation.reduce((acc, line) => 
    acc + line.text.split(' ').length, 0
  )

  // Estimate reading time
  const estimatedTime = Math.ceil(totalWords / 150) // ~150 words per minute

  return (
    <div className="space-y-6">
      {/* Metadata Card */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          {/* Topic Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {category && <span>{category}</span>}
              {subCategory && (
                <>
                  <span>•</span>
                  <span>{subCategory}</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold">{topic.name}</h2>
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            {onSaveToPlaylist && (
              <Button variant="outline" size="sm" className="gap-2" onClick={onSaveToPlaylist}>
                <BookmarkPlus className="size-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="gap-2" onClick={onReset}>
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="size-3" />
            {duration} min
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Users className="size-3" />
            {speakers} speakers
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {totalWords} words
          </Badge>
          <Badge variant="outline" className="text-xs">
            ~{estimatedTime} min read
          </Badge>
        </div>

        {/* Audio Generation Status */}
        {isGeneratingAudio && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3" role="status" aria-live="polite">
            <Loader2 className="size-4 text-primary animate-spin" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Generating audio…</p>
              <p className="text-xs text-muted-foreground">
                This may take a moment for longer conversations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Area - synced with global audio time */}
      <TranscriptViewer
        conversation={conversation}
        currentTime={globalCurrentTime}
        totalDuration={globalDuration}
        timestamps={timestamps}
        onSeek={handleSeek}
      />

      {/* Audio Player (Fixed Bottom) - Only show on Listening page */}
      {/* This uses the local AudioPlayer for full mode controls */}
      <AudioPlayer
        audioSrc={audioUrl}
        title={topic.name}
        subtitle={`${category}${subCategory ? ` • ${subCategory}` : ''}`}
        timestamps={timestamps}
        isLoading={isGeneratingAudio}
      />
    </div>
  )
}


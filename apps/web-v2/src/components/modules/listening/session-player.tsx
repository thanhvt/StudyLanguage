"use client"

import * as React from "react"
import { useCallback, useEffect } from "react"
import { TranscriptViewer } from "./transcript-viewer"
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

/**
 * SessionPlayer - Hiển thị thông tin session và transcript
 * 
 * UNIFIED PLAYER: Audio player được render bởi GlobalAudioPlayer trong layout
 * Component này chỉ handle metadata và transcript, không render player riêng
 */
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
}: SessionPlayerProps) {
  // Global audio store
  const requestAudioChange = useAudioPlayerStore((s) => s.requestAudioChange)
  const setIsLoading = useAudioPlayerStore((s) => s.setIsLoading)
  const globalCurrentTime = useAudioPlayerStore((s) => s.currentTime)
  const globalDuration = useAudioPlayerStore((s) => s.duration)
  const seek = useAudioPlayerStore((s) => s.seek)

  // Sync audio to global store when session is ready
  // Gọi ngay cả khi không có audioUrl (text-only mode)
  useEffect(() => {
    // Chỉ gọi khi có conversation data
    if (conversation.length > 0) {
      requestAudioChange({
        audioUrl: audioUrl, // có thể undefined
        title: topic.name,
        subtitle: `${category || ''}${subCategory ? ` • ${subCategory}` : ''}`,
        timestamps,
        conversation,
        topic,
        category,
        subCategory,
      })
    }
  }, [audioUrl, topic, category, subCategory, timestamps, conversation, requestAudioChange])

  // Sync loading state
  useEffect(() => {
    setIsLoading(isGeneratingAudio)
  }, [isGeneratingAudio, setIsLoading])

  // Handle seek from transcript
  const handleSeek = useCallback((time: number) => {
    seek(time)
  }, [seek])

  return (
    <div>
      {/* Transcript Area - synced with global audio time + merged metadata */}
      <TranscriptViewer
        conversation={conversation}
        currentTime={globalCurrentTime}
        totalDuration={globalDuration}
        timestamps={timestamps}
        onSeek={handleSeek}
        // Merged metadata props
        title={topic.name}
        subtitle={`${category || ''}${subCategory ? ` • ${subCategory}` : ''}`}
        duration={duration}
        speakers={speakers}
        isGeneratingAudio={isGeneratingAudio}
      />

      {/* Audio Player is now rendered by GlobalAudioPlayer in MainLayout */}
      {/* This ensures consistent UI across all pages */}
    </div>
  )
}


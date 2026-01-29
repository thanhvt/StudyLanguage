"use client"

/**
 * global-audio-provider.tsx - Global audio element provider
 * 
 * Purpose: Single audio element that persists across pages
 * Syncs with Zustand store for state management
 */

import * as React from "react"
import { useRef, useEffect, useCallback } from "react"
import { useAudioPlayerStore } from "@/stores/audio-player-store"

interface GlobalAudioProviderProps {
  children: React.ReactNode
}

export function GlobalAudioProvider({ children }: GlobalAudioProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Store state
  const audioUrl = useAudioPlayerStore((s) => s.audioUrl)
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const volume = useAudioPlayerStore((s) => s.volume)
  const speed = useAudioPlayerStore((s) => s.speed)
  const isMuted = useAudioPlayerStore((s) => s.isMuted)
  
  // Store actions
  const setCurrentTime = useAudioPlayerStore((s) => s.setCurrentTime)
  const setDuration = useAudioPlayerStore((s) => s.setDuration)
  const pause = useAudioPlayerStore((s) => s.pause)
  const seek = useAudioPlayerStore((s) => s.seek)
  
  // Sync play/pause with store
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    
    if (isPlaying) {
      audio.play().catch(() => {
        // Auto-play was prevented, update store
        pause()
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, audioUrl, pause])
  
  // Sync volume with store
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])
  
  // Sync speed with store
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = speed
  }, [speed])
  
  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      setCurrentTime(audio.currentTime)
    }
  }, [setCurrentTime])
  
  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      setDuration(audio.duration)
    }
  }, [setDuration])
  
  // Handle ended
  const handleEnded = useCallback(() => {
    pause()
  }, [pause])
  
  // Handle seek from store (subscribe to seek changes)
  useEffect(() => {
    const unsubscribe = useAudioPlayerStore.subscribe((state, prevState) => {
      const audio = audioRef.current
      if (!audio) return
      
      // Check if seek was requested (currentTime changed externally)
      if (state.currentTime !== prevState.currentTime && 
          Math.abs(audio.currentTime - state.currentTime) > 0.5) {
        audio.currentTime = state.currentTime
      }
    })
    
    return unsubscribe
  }, [])
  
  return (
    <>
      {/* Hidden audio element - persists across pages */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />
      {children}
    </>
  )
}

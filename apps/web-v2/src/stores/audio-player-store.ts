"use client"

/**
 * audio-player-store.ts - Global audio player state management
 * 
 * Purpose: Manage audio playback state across all pages
 * Uses Zustand for lightweight, performant state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlaybackSpeed, ConversationTimestamp, ConversationLine, TopicScenario } from '@/types/listening-types'

// ============================================
// TYPES
// ============================================

export type PlayerMode = 'full' | 'compact' | 'minimized'

export interface AudioData {
  audioUrl?: string // Optional - có thể không có audio (text-only mode)
  title: string
  subtitle?: string
  timestamps?: ConversationTimestamp[]
  conversation?: ConversationLine[]
  topic?: TopicScenario
  category?: string
  subCategory?: string
}

export interface AudioPlayerState {
  // Audio data
  audioUrl: string | null
  title: string
  subtitle: string
  timestamps: ConversationTimestamp[]
  conversation: ConversationLine[]
  topic: TopicScenario | null
  category: string
  subCategory: string
  
  // Playback state
  isPlaying: boolean
  currentTime: number
  duration: number
  speed: PlaybackSpeed
  volume: number
  isMuted: boolean
  isLoading: boolean
  
  // UI state
  isVisible: boolean
  mode: PlayerMode
  showChangeConfirm: boolean
  pendingAudio: AudioData | null
}

export interface AudioPlayerActions {
  // Audio actions
  setAudio: (data: AudioData) => void
  requestAudioChange: (data: AudioData) => void
  confirmAudioChange: () => void
  cancelAudioChange: () => void
  
  // Playback actions
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setIsLoading: (loading: boolean) => void
  
  // Settings actions
  setVolume: (volume: number) => void
  setSpeed: (speed: PlaybackSpeed) => void
  toggleMute: () => void
  
  // UI actions
  close: () => void
  minimize: () => void
  expand: () => void
  setMode: (mode: PlayerMode) => void
  
  // Reset
  reset: () => void
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: AudioPlayerState = {
  // Audio data
  audioUrl: null,
  title: '',
  subtitle: '',
  timestamps: [],
  conversation: [],
  topic: null,
  category: '',
  subCategory: '',
  
  // Playback state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  volume: 1,
  isMuted: false,
  isLoading: false,
  
  // UI state
  isVisible: false,
  mode: 'compact',
  showChangeConfirm: false,
  pendingAudio: null,
}

// ============================================
// STORE
// ============================================

export const useAudioPlayerStore = create<AudioPlayerState & AudioPlayerActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Set new audio (direct, no confirmation)
      setAudio: (data) => {
        set({
          audioUrl: data.audioUrl,
          title: data.title,
          subtitle: data.subtitle || '',
          timestamps: data.timestamps || [],
          conversation: data.conversation || [],
          topic: data.topic || null,
          category: data.category || '',
          subCategory: data.subCategory || '',
          isVisible: true,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          showChangeConfirm: false,
          pendingAudio: null,
        })
      },
      
      // Request audio change (shows confirmation if already playing)
      requestAudioChange: (data) => {
        const { audioUrl, isPlaying } = get()
        
        // If no current audio or not playing, change directly
        if (!audioUrl || !isPlaying) {
          get().setAudio(data)
          return
        }
        
        // Show confirmation dialog
        set({
          showChangeConfirm: true,
          pendingAudio: data,
        })
      },
      
      // Confirm audio change
      confirmAudioChange: () => {
        const { pendingAudio } = get()
        if (pendingAudio) {
          get().setAudio(pendingAudio)
        }
      },
      
      // Cancel audio change
      cancelAudioChange: () => {
        set({
          showChangeConfirm: false,
          pendingAudio: null,
        })
      },
      
      // Playback actions
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      seek: (time) => set({ currentTime: time }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Settings actions
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      setSpeed: (speed) => set({ speed }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      // UI actions
      close: () => set({ 
        ...initialState,
        // Keep user preferences
        volume: get().volume,
        speed: get().speed,
        isMuted: get().isMuted,
      }),
      
      minimize: () => set({ mode: 'minimized' }),
      expand: () => set({ mode: 'compact' }),
      setMode: (mode) => set({ mode }),
      
      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'audio-player-preferences',
      // Only persist user preferences, not audio data
      partialize: (state) => ({
        volume: state.volume,
        speed: state.speed,
        isMuted: state.isMuted,
      }),
    }
  )
)

// ============================================
// SELECTORS
// ============================================

// Player active khi visible VÀ có content (audio hoặc conversation)
export const selectIsActive = (state: AudioPlayerState) => 
  state.isVisible && (state.audioUrl !== null || state.conversation.length > 0)

export const selectProgress = (state: AudioPlayerState) => 
  state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0

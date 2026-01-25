"use client"

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react"

/**
 * Danh sách nhạc nền - Nhạc Lofi/Chill Coffee Shop
 * Nguồn: Pixabay - Free to use, no attribution required
 */
const RELAXING_TRACKS = [
  {
    id: "good-night-lofi",
    name: "Good Night Lofi",
    url: "https://cdn.pixabay.com/audio/2023/07/30/audio_e0908e8569.mp3",
  },
  {
    id: "lofi-study-chill",
    name: "Lofi Study Chill",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  },
  {
    id: "tactical-pause-lofi",
    name: "Tactical Pause Lofi",
    url: "https://cdn.pixabay.com/audio/2026/01/11/audio_c0a807a944.mp3",
  },
  {
    id: "relax-lofi-beat",
    name: "Relax Lofi Beat",
    url: "https://cdn.pixabay.com/audio/2026/01/05/audio_900e402d72.mp3",
  },
  {
    id: "lofi-girl-ambient",
    name: "Lofi Girl Ambient",
    url: "https://cdn.pixabay.com/audio/2026/01/06/audio_2e752c8e21.mp3",
  },
  {
    id: "lofi-chill-bg",
    name: "Lofi Chill Background",
    url: "https://cdn.pixabay.com/audio/2026/01/05/audio_a31cc74f48.mp3",
  },
  {
    id: "lofi-instrumental",
    name: "Lofi Instrumental",
    url: "https://cdn.pixabay.com/audio/2026/01/07/audio_7b34859a47.mp3",
  },
  {
    id: "lofi-girl-chill",
    name: "Lofi Girl Chill",
    url: "https://cdn.pixabay.com/audio/2025/12/24/audio_f328b14e4b.mp3",
  },
]

interface MusicContextType {
  isPlaying: boolean
  volume: number
  currentTrack: (typeof RELAXING_TRACKS)[0] | null
  isDucking: boolean
  smartDuckingEnabled: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (vol: number) => void
  nextTrack: () => void
  prevTrack: () => void
  enableDucking: () => void
  disableDucking: () => void
  shuffleTrack: () => void
  setSmartDuckingEnabled: (enabled: boolean) => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.3)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isDucking, setIsDucking] = useState(false)
  const [smartDuckingEnabled, setSmartDuckingEnabledState] = useState(true)
  const [mounted, setMounted] = useState(false)

  const volumeBeforeDucking = useRef(0.3)
  const currentTrack = RELAXING_TRACKS[trackIndex]

  // Load preferences after mount
  useEffect(() => {
    setMounted(true)

    const savedVolume = localStorage.getItem("music-volume")
    const savedPlaying = localStorage.getItem("music-playing")
    const savedTrack = localStorage.getItem("music-track")
    const savedDucking = localStorage.getItem("smart-ducking")

    if (savedVolume) setVolumeState(parseFloat(savedVolume))
    if (savedTrack) {
      const idx = RELAXING_TRACKS.findIndex((t) => t.id === savedTrack)
      if (idx >= 0) setTrackIndex(idx)
    }
    if (savedDucking !== null) setSmartDuckingEnabledState(savedDucking === "true")
    if (savedPlaying === "true") {
      setTimeout(() => setIsPlaying(true), 500)
    }
  }, [])

  // Create and manage audio element
  useEffect(() => {
    if (!mounted) return

    const audio = new Audio(currentTrack.url)
    audio.loop = true
    audio.volume = isDucking && smartDuckingEnabled ? volume * 0.2 : volume
    audioRef.current = audio

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [mounted, currentTrack.url])

  // Sync volume with audio
  useEffect(() => {
    if (audioRef.current) {
      const actualVolume = isDucking && smartDuckingEnabled ? volume * 0.2 : volume
      audioRef.current.volume = actualVolume
    }
  }, [volume, isDucking, smartDuckingEnabled])

  // Play/Pause control
  useEffect(() => {
    if (!audioRef.current || !mounted) return

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current.pause()
    }

    localStorage.setItem("music-playing", String(isPlaying))
  }, [isPlaying, mounted])

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const toggle = useCallback(() => setIsPlaying((prev) => !prev), [])

  const setVolume = useCallback(
    (vol: number) => {
      setVolumeState(vol)
      if (audioRef.current) {
        const actualVolume = isDucking && smartDuckingEnabled ? vol * 0.2 : vol
        audioRef.current.volume = actualVolume
      }
      localStorage.setItem("music-volume", String(vol))
    },
    [isDucking, smartDuckingEnabled]
  )

  const nextTrack = useCallback(() => {
    const newIndex = (trackIndex + 1) % RELAXING_TRACKS.length
    setTrackIndex(newIndex)
    localStorage.setItem("music-track", RELAXING_TRACKS[newIndex].id)
  }, [trackIndex])

  const prevTrack = useCallback(() => {
    const newIndex = (trackIndex - 1 + RELAXING_TRACKS.length) % RELAXING_TRACKS.length
    setTrackIndex(newIndex)
    localStorage.setItem("music-track", RELAXING_TRACKS[newIndex].id)
  }, [trackIndex])

  const shuffleTrack = useCallback(() => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * RELAXING_TRACKS.length)
    } while (newIndex === trackIndex && RELAXING_TRACKS.length > 1)

    setTrackIndex(newIndex)
    localStorage.setItem("music-track", RELAXING_TRACKS[newIndex].id)
  }, [trackIndex])

  const enableDucking = useCallback(() => {
    if (!isDucking && smartDuckingEnabled) {
      volumeBeforeDucking.current = volume
      setIsDucking(true)
    }
  }, [isDucking, volume, smartDuckingEnabled])

  const disableDucking = useCallback(() => {
    setIsDucking(false)
  }, [])

  const setSmartDuckingEnabled = useCallback((enabled: boolean) => {
    setSmartDuckingEnabledState(enabled)
    localStorage.setItem("smart-ducking", String(enabled))
  }, [])

  const value: MusicContextType = {
    isPlaying,
    volume,
    currentTrack,
    isDucking,
    smartDuckingEnabled,
    play,
    pause,
    toggle,
    setVolume,
    nextTrack,
    prevTrack,
    enableDucking,
    disableDucking,
    shuffleTrack,
    setSmartDuckingEnabled,
  }

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic(): MusicContextType {
  const context = useContext(MusicContext)
  if (context === undefined) {
    return {
      isPlaying: false,
      volume: 0.3,
      currentTrack: null,
      isDucking: false,
      smartDuckingEnabled: true,
      play: () => {},
      pause: () => {},
      toggle: () => {},
      setVolume: () => {},
      nextTrack: () => {},
      prevTrack: () => {},
      enableDucking: () => {},
      disableDucking: () => {},
      shuffleTrack: () => {},
      setSmartDuckingEnabled: () => {},
    }
  }
  return context
}

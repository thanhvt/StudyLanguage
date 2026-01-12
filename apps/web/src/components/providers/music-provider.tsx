'use client';

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react';

/**
 * Danh sách nhạc nền Lofi miễn phí
 * Nguồn: Các track free-to-use từ internet
 */
const LOFI_TRACKS = [
  {
    id: 'lofi-1',
    name: 'Chill Study Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Reliable test source
  },
  {
    id: 'lofi-2', 
    name: 'Rainy Day Coffee',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'lofi-3',
    name: 'Late Night Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  currentTrack: typeof LOFI_TRACKS[0] | null;
  isDucking: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  enableDucking: () => void;
  disableDucking: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

/**
 * MusicProvider Component
 *
 * Mục đích: Quản lý background music cho toàn app
 * Tham số: children - React nodes
 * Khi nào sử dụng: Wrap ở root layout, cung cấp music controls cho mọi component
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isDucking, setIsDucking] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Volume trước khi ducking (để restore)
  const volumeBeforeDucking = useRef(0.3);
  
  const currentTrack = LOFI_TRACKS[trackIndex];

  // Load preferences sau khi mount
  useEffect(() => {
    setMounted(true);
    
    // Load saved preferences
    const savedVolume = localStorage.getItem('music-volume');
    const savedPlaying = localStorage.getItem('music-playing');
    const savedTrack = localStorage.getItem('music-track');
    
    if (savedVolume) setVolumeState(parseFloat(savedVolume));
    if (savedTrack) {
      const idx = LOFI_TRACKS.findIndex(t => t.id === savedTrack);
      if (idx >= 0) setTrackIndex(idx);
    }
    if (savedPlaying === 'true') {
      // Auto-play nếu user đã bật trước đó
      setTimeout(() => setIsPlaying(true), 500);
    }
  }, []);

  // Tạo và quản lý audio element
  useEffect(() => {
    if (!mounted) return;

    // Tạo audio element
    const audio = new Audio(currentTrack.url);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Auto-play nếu đang playing
    if (isPlaying) {
      audio.play().catch(() => {
        // Browser chặn autoplay - cần user interaction
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [mounted, currentTrack.url]);

  // Sync volume với audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isDucking ? volume * 0.2 : volume;
    }
  }, [volume, isDucking]);

  // Play/Pause control
  useEffect(() => {
    if (!audioRef.current || !mounted) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
    
    // Save state
    localStorage.setItem('music-playing', String(isPlaying));
  }, [isPlaying, mounted]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('music-volume', String(vol));
  }, []);

  const nextTrack = useCallback(() => {
    const newIndex = (trackIndex + 1) % LOFI_TRACKS.length;
    setTrackIndex(newIndex);
    localStorage.setItem('music-track', LOFI_TRACKS[newIndex].id);
  }, [trackIndex]);

  const prevTrack = useCallback(() => {
    const newIndex = (trackIndex - 1 + LOFI_TRACKS.length) % LOFI_TRACKS.length;
    setTrackIndex(newIndex);
    localStorage.setItem('music-track', LOFI_TRACKS[newIndex].id);
  }, [trackIndex]);

  /**
   * Enable Audio Ducking
   * Giảm volume xuống 20% khi AI đang nói
   */
  const enableDucking = useCallback(() => {
    if (!isDucking) {
      volumeBeforeDucking.current = volume;
      setIsDucking(true);
    }
  }, [isDucking, volume]);

  /**
   * Disable Audio Ducking
   * Khôi phục volume về mức cũ
   */
  const disableDucking = useCallback(() => {
    setIsDucking(false);
  }, []);

  const value: MusicContextType = {
    isPlaying,
    volume,
    currentTrack,
    isDucking,
    play,
    pause,
    toggle,
    setVolume,
    nextTrack,
    prevTrack,
    enableDucking,
    disableDucking,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

/**
 * Hook để sử dụng music context
 */
export function useMusic(): MusicContextType {
  const context = useContext(MusicContext);
  if (context === undefined) {
    return {
      isPlaying: false,
      volume: 0.3,
      currentTrack: null,
      isDucking: false,
      play: () => {},
      pause: () => {},
      toggle: () => {},
      setVolume: () => {},
      nextTrack: () => {},
      prevTrack: () => {},
      enableDucking: () => {},
      disableDucking: () => {},
    };
  }
  return context;
}

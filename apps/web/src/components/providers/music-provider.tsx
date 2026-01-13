'use client';

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react';

/**
 * Danh sách nhạc nền - Nhạc instrumental/ballad/country nhẹ nhàng
 * Nguồn: Pixabay - Free to use, no attribution required
 * 
 * Mục đích: Background music thư giãn khi học tiếng Anh
 */
const RELAXING_TRACKS = [
  {
    id: 'piano-1',
    name: 'Peaceful Piano Dreams',
    // Ambient piano - nhẹ nhàng, thư giãn
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  },
  {
    id: 'acoustic-1',
    name: 'Gentle Acoustic Morning',
    // Acoustic guitar nhẹ nhàng
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: 'ambient-1',
    name: 'Calm Study Vibes',
    // Ambient chill
    url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3',
  },
  {
    id: 'piano-2',
    name: 'Soft Piano Meditation',
    // Piano meditation
    url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3',
  },
  {
    id: 'nature-1',
    name: 'Forest Rain Ambience',
    // Nature sounds với nhạc nhẹ
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_4a7c509a60.mp3',
  },
];

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  currentTrack: typeof RELAXING_TRACKS[0] | null;
  isDucking: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  enableDucking: () => void;
  disableDucking: () => void;
  shuffleTrack: () => void;
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
  
  const currentTrack = RELAXING_TRACKS[trackIndex];

  // Load preferences sau khi mount
  useEffect(() => {
    setMounted(true);
    
    // Load saved preferences
    const savedVolume = localStorage.getItem('music-volume');
    const savedPlaying = localStorage.getItem('music-playing');
    const savedTrack = localStorage.getItem('music-track');
    
    if (savedVolume) setVolumeState(parseFloat(savedVolume));
    if (savedTrack) {
      const idx = RELAXING_TRACKS.findIndex(t => t.id === savedTrack);
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
    audio.volume = isDucking ? volume * 0.2 : volume;
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

  // Sync volume với audio - SỬA LỖI: Update audio.volume trực tiếp
  useEffect(() => {
    if (audioRef.current) {
      const actualVolume = isDucking ? volume * 0.2 : volume;
      audioRef.current.volume = actualVolume;
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

  // SỬA LỖI: Update volume trực tiếp lên audio element
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    // Update trực tiếp lên audio element để phản hồi ngay lập tức
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    localStorage.setItem('music-volume', String(vol));
  }, []);

  const nextTrack = useCallback(() => {
    const newIndex = (trackIndex + 1) % RELAXING_TRACKS.length;
    setTrackIndex(newIndex);
    localStorage.setItem('music-track', RELAXING_TRACKS[newIndex].id);
  }, [trackIndex]);

  const prevTrack = useCallback(() => {
    const newIndex = (trackIndex - 1 + RELAXING_TRACKS.length) % RELAXING_TRACKS.length;
    setTrackIndex(newIndex);
    localStorage.setItem('music-track', RELAXING_TRACKS[newIndex].id);
  }, [trackIndex]);

  /**
   * Shuffle - Chọn ngẫu nhiên track mới
   */
  const shuffleTrack = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * RELAXING_TRACKS.length);
    } while (newIndex === trackIndex && RELAXING_TRACKS.length > 1);
    
    setTrackIndex(newIndex);
    localStorage.setItem('music-track', RELAXING_TRACKS[newIndex].id);
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
    shuffleTrack,
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
      shuffleTrack: () => {},
    };
  }
  return context;
}

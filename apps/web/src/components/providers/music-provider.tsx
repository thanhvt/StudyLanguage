'use client';

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react';

/**
 * Danh sách nhạc nền - Nhạc Lofi/Chill Coffee Shop
 * Nguồn: Pixabay - Free to use, no attribution required
 * 
 * Mục đích: Background music thư giãn khi học tiếng Anh
 * Style: Lofi, chill, slow tempo - như đang ngồi ở quán café nhẹ nhàng
 */
const RELAXING_TRACKS = [
  {
    id: 'good-night-lofi',
    name: 'Good Night Lofi',
    // Lofi cozy chill - nhẹ nhàng, êm ái, perfect cho buổi tối
    url: 'https://cdn.pixabay.com/audio/2023/07/30/audio_e0908e8569.mp3',
  },
  {
    id: 'lofi-study-chill',
    name: 'Lofi Study Chill',
    // Lofi beats calm peaceful - dành cho học bài, tập trung
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: 'tactical-pause-lofi',
    name: 'Tactical Pause Lofi',
    // Lofi nhẹ nhàng, tiết tấu chậm rãi
    url: 'https://cdn.pixabay.com/audio/2026/01/11/audio_c0a807a944.mp3',
  },
  {
    id: 'relax-lofi-beat',
    name: 'Relax Lofi Beat',
    // Lofi thư giãn, nhịp chậm, dễ chịu
    url: 'https://cdn.pixabay.com/audio/2026/01/05/audio_900e402d72.mp3',
  },
  {
    id: 'lofi-girl-ambient',
    name: 'Lofi Girl Ambient',
    // Lofi girl chill beats - ambient nhẹ nhàng
    url: 'https://cdn.pixabay.com/audio/2026/01/06/audio_2e752c8e21.mp3',
  },
  {
    id: 'lofi-chill-bg',
    name: 'Lofi Chill Background',
    // Nhạc nền lofi nhẹ nhàng, không gây xao lãng
    url: 'https://cdn.pixabay.com/audio/2026/01/05/audio_a31cc74f48.mp3',
  },
  {
    id: 'lofi-instrumental',
    name: 'Lofi Instrumental',
    // Nhạc không lời, giai điệu êm dịu
    url: 'https://cdn.pixabay.com/audio/2026/01/07/audio_7b34859a47.mp3',
  },
  {
    id: 'lofi-girl-chill',
    name: 'Lofi Girl Chill',
    // Lofi girl - giai điệu thư thái, bình yên
    url: 'https://cdn.pixabay.com/audio/2025/12/24/audio_f328b14e4b.mp3',
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
  // Phải tính cả isDucking khi set volume trực tiếp
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    // Update trực tiếp lên audio element để phản hồi ngay lập tức
    // Tính cả trạng thái ducking để volume đúng
    if (audioRef.current) {
      const actualVolume = isDucking ? vol * 0.2 : vol;
      audioRef.current.volume = actualVolume;
      console.log(`🎵 Volume được set: ${Math.round(vol * 100)}% (actual: ${Math.round(actualVolume * 100)}%)`);
    }
    localStorage.setItem('music-volume', String(vol));
  }, [isDucking]);

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

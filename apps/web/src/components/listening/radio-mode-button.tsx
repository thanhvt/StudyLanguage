'use client';

import { useState } from 'react';
import { Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioConfirmModal } from './radio-confirm-modal';
import { useRadioMode } from '@/hooks/use-radio-mode';
import { Playlist } from '@/types/listening-types';

/**
 * RadioModeButton - Nút kích hoạt Radio Mode
 *
 * Mục đích: UI đẹp với gradient animation để thu hút user sử dụng Radio Mode
 * Tham số đầu vào:
 *   - onPlaylistGenerated: Callback khi playlist được tạo xong, để auto-play
 * Khi nào sử dụng: Trong Listening page, section Nghe thụ động
 */
interface RadioModeButtonProps {
  onPlaylistGenerated?: (playlist: Playlist) => void;
}

export function RadioModeButton({ onPlaylistGenerated }: RadioModeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const {
    duration,
    trackCount,
    isGenerating,
    progress,
    fetchPreview,
    generatePlaylist,
    rerollDuration,
  } = useRadioMode();

  /**
   * Xử lý khi click nút Radio Mode
   */
  const handleClick = async () => {
    await fetchPreview();
    setShowModal(true);
  };

  /**
   * Xử lý khi user xác nhận tạo playlist
   */
  const handleConfirm = async () => {
    const result = await generatePlaylist();
    if (result && onPlaylistGenerated) {
      // Chuyển đổi result thành Playlist type
      const playlist: Playlist = {
        id: result.playlist.id,
        name: result.playlist.name,
        description: result.playlist.description,
        user_id: '', // Sẽ được set từ context
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: result.items.map((item) => ({
          id: item.id,
          playlist_id: result.playlist.id,
          topic: item.topic,
          conversation: item.conversation,
          duration: item.duration,
          num_speakers: item.numSpeakers,
          category: item.category,
          sub_category: item.subCategory,
          position: item.position,
          created_at: new Date().toISOString(),
        })),
      };
      onPlaylistGenerated(playlist);
      setShowModal(false);
    }
  };

  /**
   * Xử lý khi user muốn random lại duration
   */
  const handleReroll = async () => {
    await rerollDuration();
  };

  return (
    <>
      {/* Nút Radio Mode với gradient animation */}
      <Button
        onClick={handleClick}
        disabled={isGenerating}
        className="relative group w-full h-16 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-lg">Radio Mode</p>
            <p className="text-xs text-white/80">
              Tạo playlist nghe thụ động tự động
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-white/80 ml-2 animate-pulse" />
        </div>

        {/* Shimmer animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>

      {/* Confirm Modal */}
      <RadioConfirmModal
        isOpen={showModal}
        onClose={() => !isGenerating && setShowModal(false)}
        duration={duration}
        trackCount={trackCount}
        onConfirm={handleConfirm}
        onReroll={handleReroll}
        isLoading={isGenerating}
        progress={progress}
      />
    </>
  );
}

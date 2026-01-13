'use client';

import { useState } from 'react';
import { X, Plus, Check, Loader2, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlaylist } from '@/hooks/use-playlist';
import { ConversationLine, Playlist } from '@/types/listening-types';

/**
 * AddToPlaylistModal - Modal thêm hội thoại vào playlist
 * 
 * Mục đích: Cho phép user chọn playlist để thêm hội thoại
 * Tham số đầu vào:
 *   - isOpen: Trạng thái mở/đóng
 *   - onClose: Callback khi đóng
 *   - topic: Chủ đề hội thoại
 *   - conversation: Nội dung hội thoại
 *   - duration: Thời lượng
 *   - numSpeakers: Số người nói
 *   - category/subCategory: Categories
 *   - onSuccess: Callback khi thêm thành công
 * Khi nào sử dụng: Khi user click "Thêm vào Playlist"
 */
interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  conversation: ConversationLine[];
  duration: number;
  numSpeakers: number;
  category?: string;
  subCategory?: string;
  onSuccess?: (playlist: Playlist) => void;
}

export function AddToPlaylistModal({
  isOpen,
  onClose,
  topic,
  conversation,
  duration,
  numSpeakers,
  category,
  subCategory,
  onSuccess,
}: AddToPlaylistModalProps) {
  const {
    playlists,
    isLoading,
    isCreating,
    createPlaylist,
    addItemToPlaylist,
  } = usePlaylist();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [addedToIds, setAddedToIds] = useState<string[]>([]);

  /**
   * Xử lý thêm vào playlist
   */
  const handleAddToPlaylist = async (playlistId: string) => {
    setAddingToId(playlistId);

    const result = await addItemToPlaylist(playlistId, {
      topic,
      conversation,
      duration,
      numSpeakers,
      category,
      subCategory,
    });

    setAddingToId(null);

    if (result) {
      setAddedToIds(prev => [...prev, playlistId]);
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        onSuccess?.(playlist);
      }
    }
  };

  /**
   * Xử lý tạo playlist mới và thêm vào
   */
  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) return;

    const playlist = await createPlaylist({ name: newPlaylistName.trim() });
    
    if (playlist) {
      setNewPlaylistName('');
      setIsCreatingNew(false);
      await handleAddToPlaylist(playlist.id);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 add-playlist-backdrop"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden add-playlist-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-primary" />
              Thêm vào Playlist
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Topic preview */}
          <div className="px-4 py-3 bg-muted/30 border-b border-border">
            <p className="text-sm text-muted-foreground">Bài đang thêm:</p>
            <p className="font-medium text-sm truncate">{topic}</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {/* Create new option */}
            {isCreatingNew ? (
              <div className="flex gap-2 items-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Tên playlist mới..."
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateAndAdd();
                    if (e.key === 'Escape') setIsCreatingNew(false);
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateAndAdd}
                  disabled={isCreating || !newPlaylistName.trim()}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewPlaylistName('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-sm">Tạo playlist mới</span>
              </button>
            )}

            {/* Playlists list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : playlists.length === 0 && !isCreatingNew ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Chưa có playlist nào
              </p>
            ) : (
              playlists.map((playlist) => {
                const isAdded = addedToIds.includes(playlist.id);
                const isAdding = addingToId === playlist.id;

                return (
                  <button
                    key={playlist.id}
                    onClick={() => !isAdded && handleAddToPlaylist(playlist.id)}
                    disabled={isAdding || isAdded}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg transition-all
                      ${isAdded
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'hover:bg-muted border border-transparent'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isAdded ? 'bg-green-500/20' : 'bg-gradient-to-br from-primary/20 to-primary/5'}
                    `}>
                      {isAdding ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : isAdded ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <ListMusic className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {playlist.itemCount || 0} bài
                      </p>
                    </div>
                    {isAdded && (
                      <span className="text-xs text-green-500 font-medium">
                        Đã thêm!
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

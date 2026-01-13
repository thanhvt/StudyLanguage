'use client';

import { useState } from 'react';
import { Plus, X, Loader2, ListMusic, MoreVertical, Trash2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlaylist } from '@/hooks/use-playlist';
import { Playlist } from '@/types/listening-types';

/**
 * PlaylistManager - Component quản lý Playlists
 * 
 * Mục đích: Hiển thị danh sách playlists, tạo mới, rename, delete
 * Tham số đầu vào:
 *   - onSelectPlaylist: Callback khi chọn playlist để xem chi tiết
 * Khi nào sử dụng: Trong Listening page hoặc as standalone component
 */
interface PlaylistManagerProps {
  onSelectPlaylist?: (playlist: Playlist) => void;
}

export function PlaylistManager({ onSelectPlaylist }: PlaylistManagerProps) {
  const {
    playlists,
    isLoading,
    isCreating,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
  } = usePlaylist();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  /**
   * Xử lý tạo playlist mới
   */
  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    
    await createPlaylist({ name: newPlaylistName.trim() });
    setNewPlaylistName('');
    setIsCreatingNew(false);
  };

  /**
   * Xử lý rename playlist
   */
  const handleRename = async (playlistId: string) => {
    if (!editingName.trim()) return;
    
    await updatePlaylist(playlistId, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  /**
   * Xử lý xóa playlist
   */
  const handleDelete = async (playlistId: string) => {
    if (!confirm('Bạn có chắc muốn xóa playlist này?')) return;
    await deletePlaylist(playlistId);
    setMenuOpenId(null);
  };

  /**
   * Bắt đầu edit mode
   */
  const startEditing = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setEditingName(playlist.name);
    setMenuOpenId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-primary" />
          Playlists
        </h3>
        
        {!isCreatingNew && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingNew(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Tạo mới
          </Button>
        )}
      </div>

      {/* Create new playlist form */}
      {isCreatingNew && (
        <div className="flex gap-2 items-center p-3 bg-muted/50 rounded-lg playlist-create-form">
          <Input
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Tên playlist..."
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setIsCreatingNew(false);
            }}
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={isCreating || !newPlaylistName.trim()}
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
      )}

      {/* Playlists list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
            <ListMusic className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Chưa có playlist nào</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsCreatingNew(true)}
            className="mt-2"
          >
            Tạo playlist đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="glass-card glass-card-hover p-3 flex items-center gap-3 playlist-item"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <ListMusic className="w-5 h-5 text-primary" />
              </div>

              {/* Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => !editingId && onSelectPlaylist?.(playlist)}
              >
                {editingId === playlist.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(playlist.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <Button size="sm" onClick={() => handleRename(playlist.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {playlist.itemCount || 0} bài
                    </p>
                  </>
                )}
              </div>

              {/* Menu */}
              {editingId !== playlist.id && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setMenuOpenId(menuOpenId === playlist.id ? null : playlist.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  {menuOpenId === playlist.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-36 p-1 bg-popover border border-border rounded-lg shadow-lg z-20 playlist-menu">
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                          onClick={() => startEditing(playlist)}
                        >
                          <Edit2 className="w-4 h-4" />
                          Đổi tên
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-destructive/10 text-destructive transition-colors"
                          onClick={() => handleDelete(playlist.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

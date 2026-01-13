'use client';

import { useState } from 'react';
import { Plus, X, Loader2, ListMusic, MoreVertical, Trash2, Edit2, Check, Play, Clock, Music2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlaylist } from '@/hooks/use-playlist';
import { Playlist } from '@/types/listening-types';

// Drag-and-drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Ước tính thời lượng playlist dựa trên số bài và duration trung bình
 * @param playlist - Playlist object
 * @returns Số phút ước tính
 */
function estimateDuration(playlist: Playlist): number {
  // Giả sử mỗi bài trung bình 5 phút
  const avgMinutesPerItem = 5;
  return (playlist.itemCount || 0) * avgMinutesPerItem;
}

/**
 * SortablePlaylistItem - Component playlist có thể kéo thả
 */
interface SortablePlaylistItemProps {
  playlist: Playlist;
  editingId: string | null;
  editingName: string;
  menuOpenId: string | null;
  onSelectPlaylist?: (playlist: Playlist) => void;
  handleRename: (playlistId: string) => void;
  handleDelete: (playlistId: string) => void;
  startEditing: (playlist: Playlist) => void;
  setEditingId: (id: string | null) => void;
  setEditingName: (name: string) => void;
  setMenuOpenId: (id: string | null) => void;
}

function SortablePlaylistItem({
  playlist,
  editingId,
  editingName,
  menuOpenId,
  onSelectPlaylist,
  handleRename,
  handleDelete,
  startEditing,
  setEditingId,
  setEditingName,
  setMenuOpenId,
}: SortablePlaylistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: playlist.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const duration = estimateDuration(playlist);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group glass-card p-4 flex items-center gap-4 playlist-item
        transition-all duration-300 hover:shadow-lg
        border border-transparent hover:border-primary/20
        ${isDragging ? 'shadow-xl scale-105 z-50' : 'hover:scale-[1.02]'}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 touch-none"
        title="Kéo để sắp xếp"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Icon - Gradient với hover effect */}
      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-primary/70 to-accent
        flex items-center justify-center shadow-md group-hover:shadow-primary/30 transition-all duration-300 shrink-0"
      >
        <ListMusic className="w-6 h-6 text-white" />
        
        {/* Play button overlay on hover */}
        <div 
          className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 
            flex items-center justify-center transition-opacity duration-300 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPlaylist?.(playlist);
          }}
        >
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
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
            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {playlist.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Music2 className="w-3 h-3" />
                {playlist.itemCount || 0} bài
              </span>
              {duration > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{duration} phút
                  </span>
                </>
              )}
            </div>
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
  );
}

/**
 * PlaylistManager - Component quản lý Playlists
 * 
 * Mục đích: Hiển thị danh sách playlists, tạo mới, rename, delete, drag-drop sắp xếp
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
    reorderPlaylists,
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

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Cần kéo ít nhất 8px để bắt đầu drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Xử lý khi kéo thả xong
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = playlists.findIndex((p) => p.id === active.id);
      const newIndex = playlists.findIndex((p) => p.id === over.id);

      const reordered = arrayMove(playlists, oldIndex, newIndex);
      reorderPlaylists(reordered);
    }
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
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/5 flex items-center justify-center shadow-lg">
            <Music2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="font-display font-medium text-foreground">Chưa có playlist nào</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Tạo playlist để lưu và nghe lại các hội thoại yêu thích của bạn
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreatingNew(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo playlist đầu tiên
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={playlists.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <SortablePlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  editingId={editingId}
                  editingName={editingName}
                  menuOpenId={menuOpenId}
                  onSelectPlaylist={onSelectPlaylist}
                  handleRename={handleRename}
                  handleDelete={handleDelete}
                  startEditing={startEditing}
                  setEditingId={setEditingId}
                  setEditingName={setEditingName}
                  setMenuOpenId={setMenuOpenId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

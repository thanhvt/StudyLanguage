"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Plus, 
  ListMusic, 
  MoreVertical,
  Play,
  Trash2,
  Edit2,
  Clock,
  GripVertical,
  LogIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Playlist } from "@/types/listening-types"

interface PlaylistPanelProps {
  playlists: Playlist[]
  isAuthenticated?: boolean
  onCreatePlaylist: (name: string) => void
  onDeletePlaylist: (id: string) => void
  onRenamePlaylist: (id: string, name: string) => void
  onPlayPlaylist?: (playlist: Playlist) => void
  className?: string
}

export function PlaylistPanel({ 
  playlists, 
  isAuthenticated = true,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onPlayPlaylist, 
  className 
}: PlaylistPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)

  // Create new playlist
  const handleCreate = () => {
    if (!newPlaylistName.trim()) return
    onCreatePlaylist(newPlaylistName)
    setNewPlaylistName('')
    setIsCreateOpen(false)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <ListMusic className="size-5 text-primary" />
          Playlists
        </h3>
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-4" />
            New
          </Button>
        )}
      </div>

      {/* Playlist List */}
      <ScrollArea className="h-[350px]">
        {/* Not authenticated */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <LogIn className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Đăng nhập để quản lý playlists
            </p>
            <p className="text-xs text-muted-foreground/70">
              Lưu các bài học yêu thích để ôn tập
            </p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListMusic className="size-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No playlists yet</p>
            <p className="text-xs">Create one to save your conversations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => {
              // Calculate total duration if not present
              const totalDuration = playlist.items.reduce((acc, item) => acc + item.duration, 0)
              
              return (
                <div
                  key={playlist.id}
                  className="group p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <GripVertical className="size-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

                    {/* Playlist Info */}
                    <div className="flex-1 min-w-0" onClick={() => onPlayPlaylist?.(playlist)}>
                      <p className="font-medium truncate">{playlist.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{playlist.items.length} items</span>
                        <span>•</span>
                        <Clock className="size-3" />
                        <span>{totalDuration} min</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onPlayPlaylist?.(playlist)}
                      >
                        <Play className="size-4 fill-primary text-primary" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingPlaylist(playlist)}>
                            <Edit2 className="size-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeletePlaylist(playlist.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Items Preview */}
                  {playlist.items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <div className="flex flex-wrap gap-1">
                        {playlist.items.slice(0, 3).map((item) => (
                          <Badge key={item.id} variant="secondary" className="text-xs">
                            {item.topic}
                          </Badge>
                        ))}
                        {playlist.items.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{playlist.items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Playlist</DialogTitle>
            <DialogDescription>
              Create a playlist to organize your listening sessions.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newPlaylistName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!editingPlaylist} onOpenChange={() => setEditingPlaylist(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            defaultValue={editingPlaylist?.name}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editingPlaylist) {
                onRenamePlaylist(editingPlaylist.id, (e.target as HTMLInputElement).value)
                setEditingPlaylist(null)
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlaylist(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const input = document.querySelector('input[placeholder="Playlist name"]') as HTMLInputElement
              if (editingPlaylist && input) {
                onRenamePlaylist(editingPlaylist.id, input.value)
                setEditingPlaylist(null)
              }
            }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

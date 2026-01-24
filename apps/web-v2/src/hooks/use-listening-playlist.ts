"use client"

import { useState, useEffect } from "react"
import type { Playlist, PlaylistItem } from "@/types/listening-types"

const PLAYLIST_KEY = 'listening-playlists'

// Mock initial playlists if empty
const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    name: 'Daily Practice',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { 
        id: '1-1', 
        topic: 'Ordering Coffee', 
        duration: 5,
        speakers: 2,
        conversation: []
      },
    ],
  },
]

export function useListeningPlaylist() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [initialized, setInitialized] = useState(false)

  // Load playlists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLAYLIST_KEY)
      if (saved) {
        setPlaylists(JSON.parse(saved))
      } else {
        setPlaylists(MOCK_PLAYLISTS)
      }
    } catch (e) {
      console.error("Failed to load listening playlists", e)
    } finally {
      setInitialized(true)
    }
  }, [])

  // Save playlists
  useEffect(() => {
    if (!initialized) return
    try {
      localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists))
    } catch (e) {
      console.error("Failed to save listening playlists", e)
    }
  }, [playlists, initialized])

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPlaylists(prev => [...prev, newPlaylist])
  }

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id))
  }

  const updatePlaylistName = (id: string, name: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
    ))
  }

  const addToPlaylist = (playlistId: string, item: Omit<PlaylistItem, 'id'>) => {
    const newItem: PlaylistItem = {
      ...item,
      id: Date.now().toString(),
    }
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId 
        ? { ...p, items: [...p.items, newItem], updatedAt: new Date().toISOString() } 
        : p
    ))
  }

  const removeFromPlaylist = (playlistId: string, itemId: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId 
        ? { ...p, items: p.items.filter(i => i.id !== itemId), updatedAt: new Date().toISOString() } 
        : p
    ))
  }

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    updatePlaylistName,
    addToPlaylist,
    removeFromPlaylist,
    initialized
  }
}

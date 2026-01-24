"use client"

import { useState, useEffect } from "react"
import type { HistoryEntry } from "@/types/listening-types"

const HISTORY_KEY = 'listening-history'

export function useListeningHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [initialized, setInitialized] = useState(false)

  // Load history from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load listening history", e)
    } finally {
      setInitialized(true)
    }
  }, [])

  // Save history to local storage
  useEffect(() => {
    if (!initialized) return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      console.error("Failed to save listening history", e)
    }
  }, [history, initialized])

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'createdAt' | 'status' | 'isPinned' | 'isFavorite'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'completed',
      isPinned: false,
      isFavorite: false,
    }
    setHistory(prev => [newEntry, ...prev])
    return newEntry
  }

  const removeEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    ))
  }

  return {
    history,
    addEntry,
    removeEntry,
    clearHistory,
    toggleFavorite,
    initialized
  }
}

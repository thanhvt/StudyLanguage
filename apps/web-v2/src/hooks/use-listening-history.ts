"use client"

import { useState, useEffect, useCallback } from "react"
import { api, apiJson } from "@/lib/api"
import { toast } from "sonner"
import type { HistoryEntry } from "@/types/listening-types"

export function useListeningHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [initialized, setInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiJson<{ entries: HistoryEntry[] }>('/history?type=listening&limit=50')
      setHistory(data.entries)
    } catch (error) {
      console.error("Failed to load history:", error)
      toast.error("Không thể tải lịch sử")
    } finally {
      setIsLoading(false)
      setInitialized(true)
    }
  }, [])

  // Load history on mount
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Refresh history manually
  const refreshHistory = useCallback(() => {
    fetchHistory()
  }, [fetchHistory])

  const removeEntry = async (id: string) => {
    try {
      // Optimistic update
      setHistory(prev => prev.filter(entry => entry.id !== id))
      
      const response = await api(`/history/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }
      
      toast.success("Đã xóa bản ghi")
    } catch (error) {
      console.error("Failed to delete entry:", error)
      toast.error("Lỗi khi xóa bản ghi")
      // Revert on error
      fetchHistory()
    }
  }

  const clearHistory = async () => {
    // Basic implementation: loop delete or add a clear endpoint if needed.
    // For now, we will warn user or just clear local state? 
    // Since there isn't a "clear all" endpoint in existing controller, we might need to add it or skip it.
    // Let's implement safe "delete visible" for now, or assume this feature is rarely used in bulk.
    // Actually, asking backend to clear history usually requires a specific endpoint. 
    // We will leave this as "not supported" fully or loop. 
    // Given the previous code was localStorage, let's keep it simple:
    
    // TODO: Implement bulk delete in backend if needed.
    toast.error("Chức năng xóa tất cả chưa được hỗ trợ trên server")
  }

  const toggleFavorite = async (id: string) => {
    try {
      const entry = history.find(e => e.id === id)
      if (!entry) return

      // Optimistic update
      setHistory(prev => prev.map(e => 
        e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
      ))

      const response = await api(`/history/${id}/favorite`, {
        method: 'PATCH'
      })
      
      if (!response.ok) throw new Error('Failed to update')

    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast.error("Lỗi khi cập nhật trạng thái")
      fetchHistory() 
    }
  }

  return {
    history,
    isLoading,
    refreshHistory,
    removeEntry,
    clearHistory,
    toggleFavorite,
    initialized
  }
}

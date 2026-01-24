"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HistoryPanel } from "./history-panel"
import { HistoryEntry, HistoryFilters, useHistory } from "@/hooks/use-history"
import { X, History } from "lucide-react"

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  filterType?: HistoryFilters['type']
  onOpenEntry?: (entry: HistoryEntry) => void
}

/**
 * HistoryDrawer - Slide-in drawer cho lịch sử
 * 
 * Features:
 * - Slide-in từ phải
 * - Backdrop blur
 * - Escape để đóng
 * - Chặn body scroll khi mở
 */
export function HistoryDrawer({
  isOpen,
  onClose,
  filterType,
  onOpenEntry,
}: HistoryDrawerProps) {
  // Đóng drawer khi nhấn Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Chặn scroll body khi drawer mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOpenEntry = useCallback((entry: HistoryEntry) => {
    if (onOpenEntry) {
      onOpenEntry(entry)
      onClose()
    }
  }, [onOpenEntry, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <History className="size-5 text-primary" />
                Lịch sử học tập
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden">
              <HistoryPanel
                filterType={filterType}
                onOpenEntry={handleOpenEntry}
                height="100%"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * HistoryButton - Button để trigger mở HistoryDrawer
 */
interface HistoryButtonProps {
  onClick: () => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  showLabel?: boolean
}

export function HistoryButton({
  onClick,
  className = '',
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: HistoryButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      title="Xem lịch sử"
    >
      <History className="size-5" />
      {showLabel && <span className="ml-2">Lịch sử</span>}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HistoryCard } from "./history-card"
import { HistoryEntry } from "@/hooks/use-history"
import { Pin, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface PinnedSectionProps {
  entries: HistoryEntry[]
  onPin: (id: string) => void
  onFavorite: (id: string) => void
  onDelete: (id: string) => void
  onOpen: (entry: HistoryEntry) => void
}

/**
 * PinnedSection - Section riêng cho bài ghim
 * 
 * Features:
 * - Collapsible header
 * - Grid layout
 * - Empty state
 * - Smooth animations
 */
export function PinnedSection({
  entries,
  onPin,
  onFavorite,
  onDelete,
  onOpen,
}: PinnedSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (entries.length === 0) {
    return null // Don't show if no pinned items
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "flex items-center gap-2 w-full text-left",
          "group hover:opacity-80 transition-opacity"
        )}
      >
        <Pin className="size-4 text-amber-500" />
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Đã ghim
        </span>
        <span className="text-xs text-muted-foreground/70">
          ({entries.length})
        </span>
        <div className="flex-1 h-px bg-border/50" />
        {isCollapsed ? (
          <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground" />
        ) : (
          <ChevronUp className="size-4 text-muted-foreground group-hover:text-foreground" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entries.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onPin={onPin}
                  onFavorite={onFavorite}
                  onDelete={onDelete}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

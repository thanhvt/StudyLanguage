"use client"

import * as React from "react"
import { History, Play, Calendar, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HistoryEntry } from "@/types/listening-types"

interface HistoryPanelProps {
  history: HistoryEntry[]
  onPlaySession: (entry: HistoryEntry) => void
  onToggleFavorite: (id: string) => void
  onClearHistory: () => void
  className?: string
}

export function HistoryPanel({ 
  history, 
  onPlaySession, 
  onToggleFavorite, 
  onClearHistory,
  className 
}: HistoryPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="size-5 text-primary" />
          History
        </h3>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="size-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No history yet</p>
            <p className="text-xs">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="group p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="size-10 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
                    <Calendar className="size-5 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.topic}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{entry.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                     <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8 hover:text-yellow-500",
                        entry.isFavorite ? "text-yellow-500" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                      onClick={() => onToggleFavorite(entry.id)}
                    >
                      <Star className={cn("size-4", entry.isFavorite && "fill-current")} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onPlaySession(entry)}
                    >
                      <Play className="size-4 fill-primary text-primary" />
                    </Button>
                  </div>
                </div>
                
                {entry.keywords && (
                   <div className="mt-2 text-xs text-muted-foreground line-clamp-1 opacity-70">
                     Keywords: {entry.keywords}
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

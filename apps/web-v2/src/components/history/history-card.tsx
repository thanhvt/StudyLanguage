"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pin, Heart, Trash2, Play, RotateCcw, BookOpen, Headphones, Mic } from "lucide-react"
import { HistoryEntry, formatRelativeTime } from "@/hooks/use-history"

interface HistoryCardProps {
  entry: HistoryEntry
  onPin: (id: string) => void
  onFavorite: (id: string) => void
  onDelete: (id: string) => void
  onRestore?: (id: string) => void
  onOpen: (entry: HistoryEntry) => void
}

/**
 * HistoryCard - Card hiển thị một bản ghi lịch sử
 * 
 * Features:
 * - Color-coded theo type (Reading/Listening/Speaking)
 * - Thumbnail preview
 * - Pin/Favorite/Delete actions
 * - Smooth animations
 */
export function HistoryCard({
  entry,
  onPin,
  onFavorite,
  onDelete,
  onRestore,
  onOpen,
}: HistoryCardProps) {
  const isDeleted = !!entry.deletedAt

  // Type-specific styling
  const typeConfig = {
    reading: {
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    listening: {
      icon: Headphones,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-600 dark:text-violet-400",
    },
    speaking: {
      icon: Mic,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-600 dark:text-orange-400",
    },
  }

  const config = typeConfig[entry.type]
  const TypeIcon = config.icon

  // Content preview for reading
  const getPreview = () => {
    if (entry.type === 'reading' && entry.content?.article) {
      const article = entry.content.article as string
      return article.slice(0, 100) + (article.length > 100 ? '...' : '')
    }
    return null
  }

  const preview = getPreview()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden transition-colors duration-200",
        "hover:shadow-lg hover:border-primary/30",
        "border-border/50 bg-card/50 backdrop-blur-sm",
        isDeleted && "opacity-60"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Type Icon */}
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br",
              config.color
            )}>
              <TypeIcon className="size-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title with badges */}
              <div className="flex items-center gap-2 mb-1">
                {entry.isPinned && (
                  <Pin className="size-3 text-amber-500 fill-amber-500" />
                )}
                {entry.isFavorite && (
                  <Heart className="size-3 text-red-500 fill-red-500" />
                )}
                <h3 className="font-semibold truncate flex-1">
                  {entry.topic}
                </h3>
              </div>

              {/* Subtitle */}
              <p className={cn("text-sm", config.textColor)}>
                {entry.type === 'listening' && `${entry.durationMinutes || 5} phút • ${entry.numSpeakers || 2} người`}
                {entry.type === 'speaking' && (entry.mode === 'interactive' ? 'Interactive Mode' : 'Practice Mode')}
                {entry.type === 'reading' && (entry.content?.difficulty === 'advanced' ? 'Level B1-B2' : 'Level A1-A2')}
              </p>

              {/* Preview for reading */}
              {preview && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {preview}
                </p>
              )}

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground mt-2">
                {formatRelativeTime(entry.createdAt)}
                {isDeleted && ' • Đã xóa'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
            {!isDeleted ? (
              <>
                {/* Pin */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onPin(entry.id) }}
                  className={cn(
                    "h-8 w-8 p-0",
                    entry.isPinned && "text-amber-500"
                  )}
                  title={entry.isPinned ? 'Bỏ ghim' : 'Ghim'}
                >
                  <Pin className={cn("size-4", entry.isPinned && "fill-current")} />
                </Button>

                {/* Favorite */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onFavorite(entry.id) }}
                  className={cn(
                    "h-8 w-8 p-0",
                    entry.isFavorite && "text-red-500"
                  )}
                  title={entry.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                >
                  <Heart className={cn("size-4", entry.isFavorite && "fill-current")} />
                </Button>

                <div className="flex-1" />

                {/* Open */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onOpen(entry) }}
                  className="h-8 px-3 gap-1"
                >
                  <Play className="size-3" />
                  Mở
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Xóa"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Restore */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onRestore?.(entry.id) }}
                  className="h-8 gap-1"
                >
                  <RotateCcw className="size-3" />
                  Khôi phục
                </Button>

                <div className="flex-1" />

                {/* Permanent Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                  className="h-8 text-destructive hover:text-destructive gap-1"
                >
                  <Trash2 className="size-4" />
                  Xóa hẳn
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

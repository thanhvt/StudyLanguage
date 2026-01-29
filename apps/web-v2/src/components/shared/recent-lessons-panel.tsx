"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { History, Play, Clock, LogIn, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/providers/auth-provider"
import { apiJson } from "@/lib/api"
import { cn } from "@/lib/utils"

type LessonType = "listening" | "speaking" | "reading"

interface RecentLesson {
  id: string
  topic: string
  createdAt: string
  durationMinutes?: number
  content: Record<string, unknown>
}

interface RecentLessonsPanelProps {
  type: LessonType
  isAuthenticated: boolean
  onPlayEntry?: (entry: RecentLesson) => void
  className?: string
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

function getTypeLabel(type: LessonType): string {
  const labels: Record<LessonType, string> = {
    listening: "nghe",
    speaking: "nói",
    reading: "đọc",
  }
  return labels[type]
}

export function RecentLessonsPanel({
  type,
  isAuthenticated,
  onPlayEntry,
  className,
}: RecentLessonsPanelProps) {
  const router = useRouter()
  const { signInWithGoogle, loading: authLoading } = useAuth()
  
  const [lessons, setLessons] = useState<RecentLesson[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRecentLessons = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    try {
      const data = await apiJson<{ entries: RecentLesson[] }>(
        `/history?type=${type}&limit=5`
      )
      setLessons(data.entries || [])
    } catch (error) {
      console.error("Lỗi khi tải lịch sử gần đây:", error)
      setLessons([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, type])

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentLessons()
    }
  }, [isAuthenticated, fetchRecentLessons])

  const handlePlayLesson = (lesson: RecentLesson) => {
    onPlayEntry?.(lesson)
  }

  const handleViewAll = () => {
    router.push(`/history?type=${type}`)
  }

  const handleLogin = async () => {
    await signInWithGoogle()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          Bài {getTypeLabel(type)} gần đây
        </h3>
      </div>

      {/* Content */}
      <ScrollArea className="h-[350px]">
        {/* Loading auth */}
        {authLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Not authenticated */}
        {!authLoading && !isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <LogIn className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Đăng nhập để xem lịch sử học tập
            </p>
            <Button size="sm" onClick={handleLogin} className="gap-2">
              <LogIn className="size-4" />
              Đăng nhập
            </Button>
          </div>
        )}

        {/* Authenticated - loading data */}
        {!authLoading && isAuthenticated && isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Authenticated - no data */}
        {!authLoading && isAuthenticated && !isLoading && lessons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <History className="size-7 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Chưa có bài {getTypeLabel(type)} nào
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Bắt đầu luyện tập để tạo lịch sử!
            </p>
          </div>
        )}

        {/* Authenticated - has data */}
        {!authLoading && isAuthenticated && !isLoading && lessons.length > 0 && (
          <div className="divide-y divide-border/30">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => handlePlayLesson(lesson)}
                className={cn(
                  "w-full px-4 py-3 flex items-center gap-3",
                  "hover:bg-muted/50 transition-colors cursor-pointer",
                  "text-left group"
                )}
              >
                <div className={cn(
                  "size-10 rounded-lg flex items-center justify-center shrink-0",
                  "bg-primary/10 text-primary",
                  "group-hover:bg-primary group-hover:text-primary-foreground",
                  "transition-colors"
                )}>
                  <Play className="size-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {lesson.topic}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formatRelativeTime(lesson.createdAt)}</span>
                    {lesson.durationMinutes && (
                      <>
                        <span>•</span>
                        <span>{lesson.durationMinutes} phút</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer - View all */}
      {!authLoading && isAuthenticated && (
        <div className="pt-3 border-t border-border/50">
          <button
            onClick={handleViewAll}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "text-sm text-primary hover:text-primary/80",
              "font-medium transition-colors cursor-pointer"
            )}
          >
            Xem tất cả lịch sử
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { History, Play, Clock, LogIn, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/components/providers/auth-provider"
import { apiJson } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * Định nghĩa các loại bài học
 */
type LessonType = "listening" | "speaking" | "reading"

/**
 * Interface cho một mục lịch sử bài học
 */
interface RecentLesson {
  id: string
  topic: string
  createdAt: string
  durationMinutes?: number
  content: Record<string, unknown>
}

/**
 * Props cho RecentLessonsDropdown component
 * 
 * - type: Loại bài học để filter (listening, speaking, reading)
 * - onPlayEntry: Callback khi user chọn play một bài học
 * - className: Custom class cho trigger button
 */
interface RecentLessonsDropdownProps {
  type: LessonType
  onPlayEntry?: (entry: RecentLesson) => void
  className?: string
}

/**
 * Format thời gian relative (ví dụ: "5 phút trước", "2 giờ trước")
 * 
 * @param dateString - ISO date string
 * @returns Chuỗi thời gian relative
 */
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

/**
 * Lấy label tiếng Việt cho loại bài học
 */
function getTypeLabel(type: LessonType): string {
  const labels: Record<LessonType, string> = {
    listening: "nghe",
    speaking: "nói",
    reading: "đọc",
  }
  return labels[type]
}

/**
 * RecentLessonsDropdown - Dropdown hiển thị 5 bài học gần nhất
 * 
 * Mục đích: Thay thế History Dialog/Drawer trong các màn hình tính năng
 * Tham số đầu vào:
 *   - type: Loại bài học để filter
 *   - onPlayEntry: Callback khi chọn play
 *   - className: Custom class
 * Tham số đầu ra: JSX Element (Popover dropdown)
 * Khi nào sử dụng: Trong header của các trang Listening, Speaking, Reading
 */
export function RecentLessonsDropdown({
  type,
  onPlayEntry,
  className,
}: RecentLessonsDropdownProps) {
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  
  // State
  const [lessons, setLessons] = useState<RecentLesson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Fetch 5 bài học gần nhất từ API
   * Chỉ gọi khi user đã đăng nhập và popover được mở
   */
  const fetchRecentLessons = useCallback(async () => {
    if (!user) return
    
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
  }, [user, type])

  // Fetch khi popover mở và user đã đăng nhập
  useEffect(() => {
    if (isOpen && user) {
      fetchRecentLessons()
    }
  }, [isOpen, user, fetchRecentLessons])

  /**
   * Xử lý khi click vào một bài học
   */
  const handlePlayLesson = (lesson: RecentLesson) => {
    setIsOpen(false)
    onPlayEntry?.(lesson)
  }

  /**
   * Navigate đến trang History với filter theo type
   */
  const handleViewAll = () => {
    setIsOpen(false)
    router.push(`/history?type=${type}`)
  }

  /**
   * Xử lý đăng nhập
   */
  const handleLogin = async () => {
    await signInWithGoogle()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          <History className="size-4" />
          <span className="hidden sm:inline">Gần đây</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        className="w-80 p-0 overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Bài {getTypeLabel(type)} gần đây
          </h3>
        </div>

        {/* Content */}
        <div className="max-h-[280px] overflow-y-auto">
          {/* Trường hợp đang loading auth */}
          {authLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Trường hợp chưa đăng nhập */}
          {!authLoading && !user && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <LogIn className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Đăng nhập để xem lịch sử học tập
              </p>
              <Button
                size="sm"
                onClick={handleLogin}
                className="gap-2"
              >
                <LogIn className="size-4" />
                Đăng nhập
              </Button>
            </div>
          )}

          {/* Trường hợp đã đăng nhập - đang load data */}
          {!authLoading && user && isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Trường hợp đã đăng nhập - không có data */}
          {!authLoading && user && !isLoading && lessons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <History className="size-5 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Chưa có bài {getTypeLabel(type)} nào
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Bắt đầu luyện tập để tạo lịch sử!
              </p>
            </div>
          )}

          {/* Trường hợp đã đăng nhập - có data */}
          {!authLoading && user && !isLoading && lessons.length > 0 && (
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
                  {/* Play Icon */}
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0",
                    "bg-primary/10 text-primary",
                    "group-hover:bg-primary group-hover:text-primary-foreground",
                    "transition-colors"
                  )}>
                    <Play className="size-4" />
                  </div>

                  {/* Info */}
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
        </div>

        {/* Footer - Xem tất cả (chỉ hiện khi đã đăng nhập) */}
        {!authLoading && user && (
          <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
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
      </PopoverContent>
    </Popover>
  )
}

"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface HeatmapData {
  date: string
  count: number
}

interface LearningHeatmapProps {
  data: HeatmapData[]
  loading?: boolean
  onDateClick?: (date: string) => void
}

/**
 * LearningHeatmap - Calendar heatmap kiểu GitHub
 * 
 * Features:
 * - 90 days history
 * - Color scale based on activity
 * - Tooltips on hover
 * - Click to filter by date
 */
export function LearningHeatmap({ data, loading, onDateClick }: LearningHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<{ date: string; count: number; x: number; y: number } | null>(null)

  // Group data by weeks
  const weeks = useMemo(() => {
    if (!data.length) return []

    const weeksArr: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []

    // Find the day of week for first date (0 = Sunday)
    const firstDate = new Date(data[0].date)
    const startPadding = firstDate.getDay()

    // Add empty padding for start
    for (let i = 0; i < startPadding; i++) {
      currentWeek.push({ date: '', count: -1 }) // -1 = empty
    }

    data.forEach((d) => {
      currentWeek.push(d)
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek)
        currentWeek = []
      }
    })

    // Push remaining
    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek)
    }

    return weeksArr
  }, [data])

  // Get color based on count
  const getColor = (count: number) => {
    if (count < 0) return 'bg-transparent'
    if (count === 0) return 'bg-muted/50'
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/50'
    if (count <= 4) return 'bg-emerald-400 dark:bg-emerald-700'
    return 'bg-emerald-600 dark:bg-emerald-500'
  }

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = []
    let lastMonth = -1

    data.forEach((d, i) => {
      if (!d.date) return
      const date = new Date(d.date)
      const month = date.getMonth()
      if (month !== lastMonth) {
        labels.push({
          label: date.toLocaleDateString('vi-VN', { month: 'short' }),
          index: Math.floor(i / 7),
        })
        lastMonth = month
      }
    })

    return labels
  }, [data])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {[...Array(7)].map((_, j) => (
                  <Skeleton key={j} className="size-3 rounded-sm" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          📅 Hoạt động học tập
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Month Labels */}
        <div className="flex gap-1 mb-1 text-[10px] text-muted-foreground pl-5">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute"
              style={{ left: `${20 + m.index * 14}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 mt-4">
          {/* Day Labels */}
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pr-1">
            <span className="h-3">CN</span>
            <span className="h-3">T2</span>
            <span className="h-3">T3</span>
            <span className="h-3">T4</span>
            <span className="h-3">T5</span>
            <span className="h-3">T6</span>
            <span className="h-3">T7</span>
          </div>

          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className={cn(
                    "size-3 rounded-sm cursor-pointer transition-transform",
                    getColor(day.count),
                    day.count >= 0 && "hover:scale-125 hover:ring-2 hover:ring-primary/50"
                  )}
                  onClick={() => day.count >= 0 && onDateClick?.(day.date)}
                  onMouseEnter={(e) => {
                    if (day.count >= 0) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredDate({
                        date: day.date,
                        count: day.count,
                        x: rect.left,
                        y: rect.top,
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredDate(null)}
                  whileHover={{ scale: day.count >= 0 ? 1.2 : 1 }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>Ít</span>
          <div className="flex gap-0.5">
            <div className="size-3 rounded-sm bg-muted/50" />
            <div className="size-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/50" />
            <div className="size-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="size-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          </div>
          <span>Nhiều</span>
        </div>

        {/* Tooltip */}
        {hoveredDate && (
          <div
            className="fixed z-50 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-lg border"
            style={{
              left: hoveredDate.x - 40,
              top: hoveredDate.y - 35,
            }}
          >
            <div className="font-medium">
              {new Date(hoveredDate.date).toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </div>
            <div className="text-muted-foreground">
              {hoveredDate.count} bài học
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

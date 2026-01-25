"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface WeeklyData {
  date: string
  count: number
  byType: {
    listening: number
    speaking: number
    reading: number
  }
}

interface WeeklyChartProps {
  data: WeeklyData[]
  loading?: boolean
}

const TYPE_COLORS = {
  listening: 'bg-violet-500',
  speaking: 'bg-orange-500',
  reading: 'bg-emerald-500',
}

/**
 * WeeklyChart - Bar chart 7 ngày gần nhất
 * 
 * Features:
 * - Stacked bars theo skill type
 * - CSS-only (no external lib)
 * - Day labels
 * - Tooltip on hover
 */
export function WeeklyChart({ data, loading }: WeeklyChartProps) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1)
  }, [data])

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                <Skeleton className="w-full" style={{ height: `${30 + Math.random() * 70}%` }} />
                <Skeleton className="h-4 w-6 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          📊 Tiến độ tuần này
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((day, index) => {
            const date = new Date(day.date)
            const dayName = dayNames[date.getDay()]
            const isToday = new Date().toDateString() === date.toDateString()
            const heightPercent = (day.count / maxCount) * 100

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                {/* Bar */}
                <div 
                  className="w-full relative flex flex-col-reverse rounded-t-sm overflow-hidden transition-transform group-hover:scale-105"
                  style={{ height: `${Math.max(heightPercent, 5)}%` }}
                >
                  {/* Stacked segments */}
                  {day.count > 0 ? (
                    <>
                      {day.byType.listening > 0 && (
                        <div 
                          className={cn(TYPE_COLORS.listening, "w-full transition-all")}
                          style={{ height: `${(day.byType.listening / day.count) * 100}%` }}
                        />
                      )}
                      {day.byType.speaking > 0 && (
                        <div 
                          className={cn(TYPE_COLORS.speaking, "w-full transition-all")}
                          style={{ height: `${(day.byType.speaking / day.count) * 100}%` }}
                        />
                      )}
                      {day.byType.reading > 0 && (
                        <div 
                          className={cn(TYPE_COLORS.reading, "w-full transition-all")}
                          style={{ height: `${(day.byType.reading / day.count) * 100}%` }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted/30 rounded-t-sm" />
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap">
                      <div className="font-medium">{day.count} bài</div>
                      {day.count > 0 && (
                        <div className="text-muted-foreground space-y-0.5 mt-1">
                          {day.byType.listening > 0 && <div>🎧 {day.byType.listening}</div>}
                          {day.byType.speaking > 0 && <div>🎤 {day.byType.speaking}</div>}
                          {day.byType.reading > 0 && <div>📖 {day.byType.reading}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Day label */}
                <span className={cn(
                  "text-[10px]",
                  isToday ? "font-bold text-primary" : "text-muted-foreground"
                )}>
                  {dayName}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={cn("size-2.5 rounded-sm", TYPE_COLORS.listening)} />
            <span>Nghe</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn("size-2.5 rounded-sm", TYPE_COLORS.speaking)} />
            <span>Nói</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn("size-2.5 rounded-sm", TYPE_COLORS.reading)} />
            <span>Đọc</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

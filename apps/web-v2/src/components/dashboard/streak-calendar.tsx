"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { mockCalendarData, type CalendarDay } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { CalendarDays } from "lucide-react"

interface StreakCalendarProps {
  data?: CalendarDay[]
  className?: string
}

export function StreakCalendar({ data = mockCalendarData, className }: StreakCalendarProps) {
  // Organize data into weeks (7 days each)
  const weeks = useMemo(() => {
    const result: CalendarDay[][] = []
    for (let i = 0; i < data.length; i += 7) {
      result.push(data.slice(i, i + 7))
    }
    return result
  }, [data])

  // Calculate total minutes this week
  const thisWeekMinutes = useMemo(() => {
    const lastWeek = weeks[weeks.length - 1] || []
    return lastWeek.reduce((sum, day) => sum + day.minutes, 0)
  }, [weeks])

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className={cn("h-full shadow-lg border-border/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-medium">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            Learning Streak
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {thisWeekMinutes} mins this week
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="flex gap-1 justify-center">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "calendar-cell cursor-pointer",
                          `calendar-cell-${day.intensity}`
                        )}
                        aria-label={`${formatDate(day.date)}: ${day.minutes} minutes`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{formatDate(day.date)}</p>
                      <p className="text-muted-foreground">
                        {day.minutes > 0 
                          ? `${day.minutes} phút học` 
                          : "Không có hoạt động"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Ít</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={cn("calendar-cell", `calendar-cell-${intensity}`)}
              />
            ))}
          </div>
          <span>Nhiều</span>
        </div>
      </CardContent>
    </Card>
  )
}

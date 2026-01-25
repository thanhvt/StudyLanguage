"use client"

import { useMemo } from "react"
import { ResponsiveTimeRange } from "@nivo/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

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
 * LearningHeatmap - Calendar heatmap sử dụng @nivo/calendar
 * 
 * Features:
 * - Powered by Nivo Charts (D3-based)
 * - 90 days history view (TimeRange)
 * - Responsive & Interactive
 * - Custom dark/light theme support
 */
export function LearningHeatmap({ data, loading, onDateClick }: LearningHeatmapProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Transform data cho Nivo: { day, value }
  const calendarData = useMemo(() => {
    return data.map(d => ({
      day: d.date,
      value: d.count
    }))
  }, [data])

  // Calculate range (90 days ago -> today)
  const dateRange = useMemo(() => {
    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - 90)
    
    return {
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    }
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-[160px] w-full flex items-center justify-center">
             <Skeleton className="h-[120px] w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          📅 Hoạt động học tập
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[200px] w-full relative">
        <ResponsiveTimeRange
          data={calendarData}
          from={dateRange.from}
          to={dateRange.to}
          emptyColor={isDark ? "#1e293b" : "#f1f5f9"} // slate-800 : slate-100
          colors={
             isDark 
              ? ['#312e81', '#4338ca', '#6366f1', '#818cf8'] // Indigo dark mode (deep to light)
              : ['#c7d2fe', '#818cf8', '#6366f1', '#4f46e5'] // Indigo light mode
          }
          margin={{ top: 20, right: 20, bottom: 0, left: 30 }}
          dayBorderWidth={2}
          dayBorderColor={isDark ? "#020817" : "#ffffff"} // background color match
          dayRadius={4}
          align="top"
          onClick={(data) => onDateClick?.(data.day)}
          
          // Custom Tooltip
          tooltip={({ day, value, color }) => (
            <div
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#0f172a",
                padding: "8px 12px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: color,
                  borderRadius: "2px",
                }}
              />
              <div>
                <div className="text-xs font-semibold">
                  {new Date(day).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-xs opacity-90">
                  {value === undefined ? 'Chưa học' : `${value} bài học`}
                </div>
              </div>
            </div>
          )}
          
          // Theme config
          theme={{
            text: {
              fill: isDark ? "#94a3b8" : "#64748b",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            },
            tooltip: {
              container: {
                background: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#0f172a",
                border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                fontSize: 12,
                borderRadius: 8,
                padding: "8px 12px",
              },
            },
          }}

          // Localization & Formatting
          monthLegend={(_year, _month, date) => {
             return date.toLocaleDateString('vi-VN', { month: 'long' })
          }}
          
          weekdayLegendOffset={0} // Hide huge weekday labels if prefer
        />
        
        {/* Legend Custom */}
        <div className="absolute bottom-2 right-4 flex items-center gap-2 text-[10px] text-muted-foreground pointer-events-none">
          <span>Ít</span>
          <div className="flex gap-1">
             <div className={`size-3 rounded-sm ${isDark ? 'bg-[#1e293b]' : 'bg-slate-100'}`} />
             <div className={`size-3 rounded-sm ${isDark ? 'bg-[#312e81]' : 'bg-indigo-200'}`} />
             <div className={`size-3 rounded-sm ${isDark ? 'bg-[#4338ca]' : 'bg-indigo-400'}`} />
             <div className={`size-3 rounded-sm ${isDark ? 'bg-[#6366f1]' : 'bg-indigo-500'}`} />
             <div className={`size-3 rounded-sm ${isDark ? 'bg-[#818cf8]' : 'bg-indigo-600'}`} />
          </div>
          <span>Nhiều</span>
        </div>
      </CardContent>
    </Card>
  )
}


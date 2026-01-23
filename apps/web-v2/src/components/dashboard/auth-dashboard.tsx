"use client"

import { NextLessonCard } from "./next-lesson-card"
import { WeeklyActivityChart } from "./weekly-activity-chart"
import { SkillRadarChart } from "./skill-radar-chart"
import { StreakCard } from "./streak-card"
import { QuickActions } from "./quick-actions"
import { StreakCalendar } from "./streak-calendar"
import { StudyTimeGoal } from "./study-time-goal"
import { mockUserStats, getTimeGreetingVi } from "@/lib/mock-data"

interface AuthDashboardProps {
  userName?: string
}

export function AuthDashboard({ userName = mockUserStats.name }: AuthDashboardProps) {
  const greeting = getTimeGreetingVi()
  const { totalMinutesToday, dailyGoalMinutes, streak } = mockUserStats

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-bold tracking-tight">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bạn đang có chuỗi <span className="font-semibold text-orange-500">{streak} ngày</span> liên tiếp. Tiếp tục nào!
          </p>
        </div>
        
        {/* Quick Stats - Desktop */}
        <div className="hidden md:flex gap-4">
          <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold tabular-nums">{totalMinutesToday}</p>
            <p className="text-xs text-muted-foreground">phút hôm nay</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold tabular-nums">{mockUserStats.level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Row 1: Next Lesson + Study Goal */}
        <div className="md:col-span-3">
          <NextLessonCard />
        </div>
        <div className="md:col-span-1">
          <StudyTimeGoal 
            current={totalMinutesToday} 
            goal={dailyGoalMinutes} 
          />
        </div>

        {/* Row 2: Quick Actions (full width) */}
        <div className="md:col-span-4">
          <QuickActions />
        </div>

        {/* Row 3: Weekly Activity + Streak Card */}
        <div className="md:col-span-2 min-h-[280px]">
          <WeeklyActivityChart />
        </div>
        <div className="md:col-span-1">
          <StreakCard />
        </div>
        <div className="md:col-span-1">
          <SkillRadarChart />
        </div>

        {/* Row 4: Streak Calendar (full width on mobile, spans 3 on desktop) */}
        <div className="md:col-span-3">
          <StreakCalendar />
        </div>
        
        {/* Optional: Additional widget space */}
        <div className="md:col-span-1 hidden md:flex items-center justify-center rounded-xl border border-dashed border-border p-6">
          <p className="text-sm text-muted-foreground text-center">
            🚀 More widgets coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

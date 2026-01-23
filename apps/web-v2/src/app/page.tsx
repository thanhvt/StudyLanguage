import { NextLessonCard } from "@/components/dashboard/next-lesson-card"
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart"
import { SkillRadarChart } from "@/components/dashboard/skill-radar-chart"
import { StreakCard } from "@/components/dashboard/streak-card"

export default function Home() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Good Morning, User! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to continue your journey? You have <span className="font-semibold text-primary">2 goals</span> pending today.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Hero - Spans 2 cols */}
        <div className="md:col-span-2">
          <NextLessonCard />
        </div>

        {/* Top Right Widget - Streak */}
        <div className="md:col-span-1">
          <StreakCard />
        </div>

        {/* Row 2 - Activity Chart */}
        <div className="md:col-span-2 min-h-[300px]">
          <WeeklyActivityChart />
        </div>

        {/* Row 2 - Skill Radar */}
        <div className="md:col-span-1 min-h-[300px]">
          <SkillRadarChart />
        </div>
      </div>
    </div>
  )
}

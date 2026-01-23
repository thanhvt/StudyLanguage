// Mock data for Dashboard components
// This simulates data that would come from an API

// ============================================
// Types
// ============================================

export interface UserStats {
  name: string
  level: number
  xp: number
  xpToNextLevel: number
  streak: number
  totalMinutesToday: number
  dailyGoalMinutes: number
}

export interface CalendarDay {
  date: string // YYYY-MM-DD
  minutes: number
  intensity: 0 | 1 | 2 | 3 | 4 // GitHub-style intensity levels
}

export interface WeeklyActivity {
  day: string
  minutes: number
  listening: number
  speaking: number
  reading: number
}

// ============================================
// Mock User Stats
// ============================================

export const mockUserStats: UserStats = {
  name: "Thanh",
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 12,
  totalMinutesToday: 15,
  dailyGoalMinutes: 30,
}

export const mockGuestStats: Partial<UserStats> = {
  dailyGoalMinutes: 30,
  totalMinutesToday: 0,
}

// ============================================
// Mock Weekly Activity
// ============================================

export const mockWeeklyActivity: WeeklyActivity[] = [
  { day: "Mon", minutes: 20, listening: 10, speaking: 5, reading: 5 },
  { day: "Tue", minutes: 45, listening: 20, speaking: 15, reading: 10 },
  { day: "Wed", minutes: 30, listening: 15, speaking: 10, reading: 5 },
  { day: "Thu", minutes: 60, listening: 25, speaking: 20, reading: 15 },
  { day: "Fri", minutes: 15, listening: 5, speaking: 5, reading: 5 },
  { day: "Sat", minutes: 90, listening: 40, speaking: 30, reading: 20 },
  { day: "Sun", minutes: 45, listening: 20, speaking: 15, reading: 10 },
]

// ============================================
// Mock Calendar Data (7 weeks = 49 days)
// Static data to prevent hydration mismatch
// ============================================

// Pre-generated static calendar data (7 weeks)
export const mockCalendarData: CalendarDay[] = [
  // Week 1 (oldest)
  { date: "2026-01-10", minutes: 0, intensity: 0 },
  { date: "2026-01-11", minutes: 35, intensity: 3 },
  { date: "2026-01-12", minutes: 20, intensity: 2 },
  { date: "2026-01-13", minutes: 45, intensity: 3 },
  { date: "2026-01-14", minutes: 0, intensity: 0 },
  { date: "2026-01-15", minutes: 25, intensity: 2 },
  { date: "2026-01-16", minutes: 60, intensity: 4 },
  // Week 2
  { date: "2026-01-17", minutes: 15, intensity: 2 },
  { date: "2026-01-18", minutes: 40, intensity: 3 },
  { date: "2026-01-19", minutes: 0, intensity: 0 },
  { date: "2026-01-20", minutes: 30, intensity: 3 },
  { date: "2026-01-21", minutes: 55, intensity: 3 },
  { date: "2026-01-22", minutes: 25, intensity: 2 },
  { date: "2026-01-23", minutes: 70, intensity: 4 },
  // Week 3
  { date: "2026-01-24", minutes: 20, intensity: 2 },
  { date: "2026-01-25", minutes: 0, intensity: 0 },
  { date: "2026-01-26", minutes: 45, intensity: 3 },
  { date: "2026-01-27", minutes: 35, intensity: 3 },
  { date: "2026-01-28", minutes: 10, intensity: 1 },
  { date: "2026-01-29", minutes: 50, intensity: 3 },
  { date: "2026-01-30", minutes: 80, intensity: 4 },
  // Week 4
  { date: "2026-01-31", minutes: 25, intensity: 2 },
  { date: "2026-02-01", minutes: 40, intensity: 3 },
  { date: "2026-02-02", minutes: 30, intensity: 3 },
  { date: "2026-02-03", minutes: 0, intensity: 0 },
  { date: "2026-02-04", minutes: 55, intensity: 3 },
  { date: "2026-02-05", minutes: 20, intensity: 2 },
  { date: "2026-02-06", minutes: 65, intensity: 4 },
  // Week 5
  { date: "2026-02-07", minutes: 15, intensity: 2 },
  { date: "2026-02-08", minutes: 45, intensity: 3 },
  { date: "2026-02-09", minutes: 35, intensity: 3 },
  { date: "2026-02-10", minutes: 25, intensity: 2 },
  { date: "2026-02-11", minutes: 50, intensity: 3 },
  { date: "2026-02-12", minutes: 30, intensity: 3 },
  { date: "2026-02-13", minutes: 75, intensity: 4 },
  // Week 6 (streak starts - last 12 days) 
  { date: "2026-02-14", minutes: 20, intensity: 2 },
  { date: "2026-02-15", minutes: 40, intensity: 3 },
  { date: "2026-02-16", minutes: 35, intensity: 3 },
  { date: "2026-02-17", minutes: 45, intensity: 3 },
  { date: "2026-02-18", minutes: 25, intensity: 2 },
  { date: "2026-02-19", minutes: 55, intensity: 3 },
  { date: "2026-02-20", minutes: 60, intensity: 4 },
  // Week 7 (current - streak continues)
  { date: "2026-02-21", minutes: 30, intensity: 3 },
  { date: "2026-02-22", minutes: 45, intensity: 3 },
  { date: "2026-02-23", minutes: 50, intensity: 3 },
  { date: "2026-02-24", minutes: 15, intensity: 2 },
]

// ============================================
// Mock Skill Data
// ============================================

export const mockSkillData = [
  { subject: "Listening", score: 75, fullMark: 100 },
  { subject: "Speaking", score: 62, fullMark: 100 },
  { subject: "Reading", score: 88, fullMark: 100 },
]

// ============================================
// Mock Next Lesson
// ============================================

export const mockNextLesson = {
  id: "lesson-123",
  title: "Business Negotiation: Closing the Deal",
  category: "Business",
  duration: 15,
  level: "Intermediate",
  progress: 35,
  skill: "speaking" as const,
}

// ============================================
// Utility: Get greeting based on time
// ============================================

export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good Morning"
  if (hour >= 12 && hour < 17) return "Good Afternoon"
  if (hour >= 17 && hour < 21) return "Good Evening"
  return "Good Night"
}

export function getTimeGreetingVi(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Chào buổi sáng"
  if (hour >= 12 && hour < 17) return "Chào buổi chiều"
  if (hour >= 17 && hour < 21) return "Chào buổi tối"
  return "Chào buổi khuya"
}

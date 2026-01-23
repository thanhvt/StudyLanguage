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
// ============================================

function generateCalendarData(): CalendarDay[] {
  const days: CalendarDay[] = []
  const today = new Date()
  
  // Generate 49 days (7 weeks) going back from today
  for (let i = 48; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Random minutes with some pattern (weekends more, early week less)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseMinutes = isWeekend ? 45 : 25
    const variance = Math.floor(Math.random() * 40) - 10
    const minutes = Math.max(0, baseMinutes + variance)
    
    // Calculate intensity (0-4) based on minutes
    let intensity: 0 | 1 | 2 | 3 | 4 = 0
    if (minutes > 0 && minutes < 15) intensity = 1
    else if (minutes >= 15 && minutes < 30) intensity = 2
    else if (minutes >= 30 && minutes < 60) intensity = 3
    else if (minutes >= 60) intensity = 4
    
    // Add some "streak break" days for realism
    if (Math.random() < 0.15 && i > 7) {
      days.push({
        date: date.toISOString().split('T')[0],
        minutes: 0,
        intensity: 0,
      })
    } else {
      days.push({
        date: date.toISOString().split('T')[0],
        minutes,
        intensity,
      })
    }
  }
  
  // Ensure last 12 days have activity (current streak)
  for (let i = days.length - 12; i < days.length; i++) {
    if (days[i].minutes === 0) {
      const mins = 15 + Math.floor(Math.random() * 45)
      days[i].minutes = mins
      days[i].intensity = mins >= 60 ? 4 : mins >= 30 ? 3 : 2
    }
  }
  
  return days
}

export const mockCalendarData = generateCalendarData()

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

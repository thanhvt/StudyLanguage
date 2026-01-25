"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HistoryEntry } from "@/hooks/use-history"
import { Lightbulb, RotateCcw, TrendingUp, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudyInsightsProps {
  entries: HistoryEntry[]
  weeklyData?: { date: string; count: number }[]
  onReviewTopic?: (topic: string) => void
}

interface Insight {
  id: string
  type: 'review' | 'progress' | 'suggestion'
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * StudyInsights - AI-generated (rules-based) insights
 * 
 * Features:
 * - Topics chưa ôn > 7 ngày
 * - Progress so với tuần trước
 * - Skill thiếu
 * - Dismissable cards
 */
export function StudyInsights({ entries, weeklyData, onReviewTopic }: StudyInsightsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const insights = useMemo(() => {
    const result: Insight[] = []
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Find topics not reviewed in 7 days
    const recentTopics = new Set(
      entries
        .filter(e => new Date(e.createdAt) > sevenDaysAgo)
        .map(e => e.topic)
    )

    const oldTopics = entries.filter(e => {
      const age = now.getTime() - new Date(e.createdAt).getTime()
      const ageInDays = age / (1000 * 60 * 60 * 24)
      return ageInDays > 7 && ageInDays < 30 && !recentTopics.has(e.topic)
    })

    // Add review suggestions (max 2)
    const uniqueOldTopics = [...new Set(oldTopics.map(e => e.topic))].slice(0, 2)
    uniqueOldTopics.forEach((topic, i) => {
      result.push({
        id: `review-${i}`,
        type: 'review',
        icon: <RotateCcw className="size-4 text-amber-500" />,
        title: topic,
        description: 'Chưa ôn tập trong 7 ngày. Hãy ôn lại để nhớ lâu hơn!',
        action: onReviewTopic ? {
          label: 'Ôn lại ngay',
          onClick: () => onReviewTopic(topic),
        } : undefined,
      })
    })

    // Calculate weekly progress
    if (weeklyData && weeklyData.length >= 7) {
      const thisWeekTotal = weeklyData.slice(-7).reduce((sum, d) => sum + d.count, 0)
      const lastWeekTotal = weeklyData.slice(-14, -7).reduce((sum, d) => sum + d.count, 0)
      
      if (lastWeekTotal > 0) {
        const changePercent = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        
        if (changePercent > 20) {
          result.push({
            id: 'progress-up',
            type: 'progress',
            icon: <TrendingUp className="size-4 text-emerald-500" />,
            title: `+${changePercent}% so với tuần trước!`,
            description: `Bạn đang tiến bộ tuyệt vời! Tiếp tục phát huy nhé.`,
          })
        } else if (changePercent < -30) {
          result.push({
            id: 'progress-down',
            type: 'suggestion',
            icon: <AlertCircle className="size-4 text-orange-500" />,
            title: 'Học ít hơn tuần trước',
            description: 'Hãy dành thời gian luyện tập đều đặn để tiến bộ nhanh hơn.',
          })
        }
      }
    }

    // Check for missing skills
    const last30Days = entries.filter(e => 
      now.getTime() - new Date(e.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    )
    
    const skillCounts = {
      listening: last30Days.filter(e => e.type === 'listening').length,
      speaking: last30Days.filter(e => e.type === 'speaking').length,
      reading: last30Days.filter(e => e.type === 'reading').length,
    }

    const totalSkills = skillCounts.listening + skillCounts.speaking + skillCounts.reading
    if (totalSkills > 5) {
      const skillLabels = { listening: 'Nghe', speaking: 'Nói', reading: 'Đọc' }
      const weakSkill = Object.entries(skillCounts).reduce((min, [skill, count]) => 
        count < min.count ? { skill, count } : min
      , { skill: '', count: Infinity })

      if (weakSkill.count < totalSkills * 0.15) {
        result.push({
          id: 'skill-balance',
          type: 'suggestion',
          icon: <Lightbulb className="size-4 text-blue-500" />,
          title: `Luyện thêm ${skillLabels[weakSkill.skill as keyof typeof skillLabels]}`,
          description: `Kỹ năng ${skillLabels[weakSkill.skill as keyof typeof skillLabels]} còn yếu. Hãy luyện tập đều các kỹ năng!`,
        })
      }
    }

    return result
  }, [entries, weeklyData, onReviewTopic])

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id))

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
  }

  if (visibleInsights.length === 0) {
    return null
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="size-4 text-primary" />
          Gợi ý từ AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {visibleInsights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                "bg-background/50 border border-border/50"
              )}
            >
              <div className="mt-0.5">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                {insight.action && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={insight.action.onClick}
                    className="h-auto p-0 mt-1 text-xs text-primary"
                  >
                    {insight.action.label} →
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(insight.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="size-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

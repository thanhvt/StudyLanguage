"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, TrendingUp, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  todayCount: number
  weekCount: number
  streak: number
  loading?: boolean
}

/**
 * StatsCards - 3 thẻ thống kê nhanh
 * 
 * Features:
 * - Today lessons count
 * - Week lessons count  
 * - Current streak
 * - Skeleton loading state
 * - Hover animations
 */
export function StatsCards({ todayCount, weekCount, streak, loading }: StatsCardsProps) {
  const stats = [
    {
      title: "Hôm nay",
      value: todayCount,
      unit: "bài học",
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: "Tuần này",
      value: weekCount,
      unit: "bài học",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
    },
    {
      title: "Streak",
      value: streak,
      unit: "ngày liên tục",
      icon: Flame,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={cn(
            "border-border/50 overflow-hidden transition-all duration-300",
            "hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
          )}>
            <CardContent className={cn("p-4 bg-gradient-to-br", stat.bgGradient)}>
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-sm",
                  stat.gradient
                )}>
                  <stat.icon className="size-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

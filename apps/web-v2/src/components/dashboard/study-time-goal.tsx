"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudyTimeGoalProps {
  current?: number
  goal?: number
  className?: string
}

export function StudyTimeGoal({
  current = 15,
  goal = 30,
  className,
}: StudyTimeGoalProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  
  // Calculate progress
  const progress = Math.min((current / goal) * 100, 100)
  const isComplete = current >= goal
  
  // SVG circle properties
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Animate on mount
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.setProperty(
        "--progress-offset-start",
        String(circumference)
      )
      circleRef.current.style.setProperty(
        "--progress-offset-end",
        String(strokeDashoffset)
      )
    }
  }, [circumference, strokeDashoffset])

  return (
    <Card className={cn("h-full shadow-lg border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Target className="size-5 text-primary" />
          Daily Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-0">
        {/* Progress Ring */}
        <div className="relative">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            aria-label={`${current} of ${goal} minutes completed`}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              ref={circleRef}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              className="progress-ring-animate"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-bold tabular-nums animate-count-up">
              {current}
            </span>
            <span className="text-sm text-muted-foreground">/ {goal} min</span>
          </div>
        </div>

        {/* Status Message */}
        <p className={cn(
          "text-sm font-medium mt-4 text-center",
          isComplete ? "text-green-500" : "text-muted-foreground"
        )}>
          {isComplete 
            ? "🎉 Goal completed!" 
            : `${goal - current} mins to go`}
        </p>
      </CardContent>
    </Card>
  )
}

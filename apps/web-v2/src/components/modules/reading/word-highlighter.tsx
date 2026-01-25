"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WordScore } from "@/hooks/use-reading-feedback"
import { Check, X, AlertCircle } from "lucide-react"

interface WordHighlighterProps {
  wordScores: WordScore[]
  className?: string
}

/**
 * WordHighlighter - Component hiển thị từng từ với màu sắc theo điểm
 * 
 * - Xanh (90+): Phát âm tốt
 * - Vàng (50-89): Cần cải thiện
 * - Đỏ (<50): Cần luyện tập
 */
export function WordHighlighter({ wordScores, className }: WordHighlighterProps) {
  if (!wordScores || wordScores.length === 0) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400 bg-green-500/10"
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
    return "text-red-600 dark:text-red-400 bg-red-500/10"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Check className="size-3" />
    if (score >= 50) return <AlertCircle className="size-3" />
    return <X className="size-3" />
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {wordScores.map((ws, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-md cursor-pointer transition-all duration-200",
                  "hover:ring-2 hover:ring-offset-1 hover:ring-current",
                  "inline-flex items-center gap-1 text-sm font-medium",
                  getScoreColor(ws.score)
                )}
              >
                {ws.word}
                <span className="opacity-60">{getScoreIcon(ws.score)}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-[200px] text-center"
            >
              <div className="space-y-1">
                <div className="font-bold text-lg">{ws.score}</div>
                <div className="text-xs text-muted-foreground">
                  {ws.correct ? "Chính xác" : ws.issue || "Cần cải thiện"}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

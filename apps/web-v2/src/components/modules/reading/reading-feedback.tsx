"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ReadingFeedbackResult } from "@/hooks/use-reading-feedback"
import { Mic, Activity, Clock } from "lucide-react"

interface FeedbackProps {
  result: ReadingFeedbackResult
  compact?: boolean
}

function ScoreRing({ score, label, icon: Icon, colorClass, compact }: { score: number, label: string, icon: React.ElementType, colorClass: string, compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "relative rounded-full flex items-center justify-center border-3 bg-card shadow-sm",
        compact ? "size-12" : "size-20 border-4",
        colorClass
      )}>
        <span className={cn("font-bold", compact ? "text-sm" : "text-2xl")}>{score}</span>
      </div>
      <span className={cn("font-medium text-muted-foreground uppercase tracking-wide", compact ? "text-[10px]" : "text-xs")}>{label}</span>
    </div>
  )
}

/**
 * ReadingFeedback - Hiển thị kết quả đánh giá đọc
 * @param compact - Chế độ thu gọn cho inline display
 */
export function ReadingFeedback({ result, compact = false }: FeedbackProps) {
  if (compact) {
    return (
      <div className="space-y-3 animate-in fade-in duration-300">
        {/* Compact Score Row */}
        <div className="flex items-center gap-4">
          {/* Overall Score */}
          <div className={cn(
            "shrink-0 size-16 rounded-xl flex flex-col items-center justify-center",
            result.overallScore >= 80 ? "bg-green-500/10 text-green-600 dark:text-green-400" :
            result.overallScore >= 60 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
            "bg-red-500/10 text-red-600 dark:text-red-400"
          )}>
            <span className="text-2xl font-bold">{result.overallScore}</span>
            <span className="text-[10px] uppercase font-medium opacity-70">Điểm</span>
          </div>
          
          {/* Mini Metrics */}
          <div className="flex gap-3 flex-1 justify-center">
            <ScoreRing score={result.fluency} label="Lưu loát" icon={Activity} colorClass="border-blue-500" compact />
            <ScoreRing score={result.pronunciation} label="Phát âm" icon={Mic} colorClass="border-purple-500" compact />
            <ScoreRing score={result.pace} label="Tốc độ" icon={Clock} colorClass="border-orange-500" compact />
          </div>
        </div>

        {/* Feedback Text */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.feedback || (
            result.overallScore >= 80 ? "🎉 Tuyệt vời! Bạn đọc rất trôi chảy." : 
            result.overallScore >= 60 ? "👍 Khá tốt. Tiếp tục luyện tập nhé!" : 
            "💪 Cố gắng lên. Hãy thử lại nhé."
          )}
        </p>
      </div>
    )
  }

  // Full display mode
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Score Banner */}
      <div className={cn(
        "p-6 rounded-2xl text-center border",
        result.overallScore >= 80 
          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
          : result.overallScore >= 60
            ? "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
            : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
      )}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Đánh giá tổng quan</h3>
        <div className="text-5xl font-bold mb-2">{result.overallScore}</div>
        <p className="text-base font-medium">
          {result.overallScore >= 80 ? "🎉 Tuyệt vời! Bạn đọc rất trôi chảy." : 
           result.overallScore >= 60 ? "👍 Khá tốt. Cần cải thiện thêm một chút." : 
           "💪 Cố gắng lên. Hãy luyện tập thêm nhé."}
        </p>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreRing score={result.fluency} label="Lưu loát" icon={Activity} colorClass="border-blue-500 text-blue-500" />
        <ScoreRing score={result.pronunciation} label="Phát âm" icon={Mic} colorClass="border-purple-500 text-purple-500" />
        <ScoreRing score={result.pace} label="Tốc độ" icon={Clock} colorClass="border-orange-500 text-orange-500" />
      </div>

      {/* AI Comments */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-2">
              <span className="text-xl">🤖</span> Nhận xét chi tiết
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.feedback}
            </p>
          </div>

          {/* Word Analysis */}
          {result.wordAnalysis && result.wordAnalysis.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3 text-sm">Từ cần lưu ý:</h4>
              <div className="grid gap-2">
                {result.wordAnalysis.map((word, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/30">
                    <span className="font-bold text-destructive">{word.word}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <Progress value={word.score} className="h-1.5 w-24" />
                         <span className="text-xs text-muted-foreground">{word.score}%</span>
                      </div>
                      {word.suggestion && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          &quot; {word.suggestion} &quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

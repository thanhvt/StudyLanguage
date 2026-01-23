import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

export function StreakCard() {
  return (
    <Card className="h-full bg-gradient-to-br from-orange-500/15 via-orange-500/10 to-amber-500/5 border-orange-200/50 dark:border-orange-500/20 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Flame className="size-24 text-orange-500" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <Flame className="size-5 fill-orange-500 text-orange-600 flame-animate" />
          Day Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <span className="text-5xl font-bold font-display text-foreground tabular-nums animate-count-up">
            12
          </span>
          <span className="text-sm text-muted-foreground">
            You&apos;re on fire! 🔥
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

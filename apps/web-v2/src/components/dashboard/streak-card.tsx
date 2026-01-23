import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

export function StreakCard() {
  return (
    <Card className="h-full bg-linear-to-br from-orange-500/10 to-orange-500/5 border-orange-200/50 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Flame className="size-24 text-orange-500" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Flame className="fill-orange-500 text-orange-600" />
          Day Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-bold font-display text-foreground tabular-nums">12</span>
          <span className="text-sm text-muted-foreground">You're on fire! 🔥</span>
        </div>
      </CardContent>
    </Card>
  )
}

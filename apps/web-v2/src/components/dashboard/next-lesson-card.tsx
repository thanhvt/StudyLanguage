import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"

export function NextLessonCard() {
  return (
    <Card className="w-full bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-xl">
      <CardHeader>
        <CardDescription className="text-primary font-medium">Continue Learning</CardDescription>
        <CardTitle className="text-3xl font-display text-foreground">
          Business Negotiation: Closing the Deal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="bg-background/50 px-2 py-1 rounded border border-border">Business</span>
          <span className="flex items-center gap-1">⏱ 15 mins</span>
          <span className="flex items-center gap-1">Intermediate</span>
        </div>
        <div className="flex gap-4 mt-2">
          <Button size="lg" className="gap-2 shadow-primary/25 shadow-lg">
            <Play className="size-4 fill-current" />
            Start Session
          </Button>
          <Button variant="outline" size="lg">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

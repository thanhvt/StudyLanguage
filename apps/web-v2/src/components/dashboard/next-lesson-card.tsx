import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, BarChart3 } from "lucide-react"
import { mockNextLesson } from "@/lib/mock-data"
import Link from "next/link"

export function NextLessonCard() {
  const lesson = mockNextLesson

  return (
    <Card className="w-full h-full gradient-border glow-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardHeader className="pb-3">
        <CardDescription className="text-primary font-medium flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Continue Learning
        </CardDescription>
        <CardTitle className="text-2xl md:text-3xl font-display text-foreground">
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums">{lesson.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-border font-medium">
            {lesson.category}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {lesson.duration} mins
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="size-4" />
            {lesson.level}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-1">
          <Button asChild size="lg" className="gap-2 shadow-primary/25 shadow-lg">
            <Link href={`/${lesson.skill}`}>
              <Play className="size-4 fill-current" />
              Start Session
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

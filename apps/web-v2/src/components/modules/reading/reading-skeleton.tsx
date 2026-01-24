"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * ReadingSkeleton - Loading skeleton cho Reading page
 */
export function ReadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-muted/50" />
        <div className="space-y-2">
          <div className="h-6 bg-muted/50 rounded w-40" />
          <div className="h-4 bg-muted/30 rounded w-24" />
        </div>
      </div>

      {/* Article skeleton */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="h-8 bg-muted/50 rounded w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted/40 rounded w-full" />
              <div className="h-4 bg-muted/40 rounded w-11/12" />
              <div className="h-4 bg-muted/40 rounded w-4/5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiz skeleton */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="h-6 bg-muted/50 rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 bg-muted/40 rounded w-5/6" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-12 bg-muted/30 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * AIThinkingIndicator - Animation khi AI đang sinh nội dung
 */
export function AIThinkingIndicator({ message = "AI đang tạo bài đọc..." }: { message?: string }) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        {/* Animated dots */}
        <div className="flex items-center gap-1 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "size-3 rounded-full bg-primary",
                "animate-bounce"
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        
        {/* Sparkle icon */}
        <div className="relative mb-4">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 blur-md -z-10 animate-pulse" />
        </div>
        
        {/* Message */}
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">Vui lòng chờ trong giây lát...</p>
      </CardContent>
    </Card>
  )
}

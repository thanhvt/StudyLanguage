"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickActions } from "./quick-actions"
import { WeeklyActivityChart } from "./weekly-activity-chart"
import { SkillRadarChart } from "./skill-radar-chart"
import { Sparkles, LogIn } from "lucide-react"

export function GuestDashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <Card className="gradient-border glow-primary overflow-hidden">
        <CardHeader className="pb-2">
          <CardDescription className="text-primary font-medium flex items-center gap-2">
            <Sparkles className="size-4" />
            AI-Powered English Learning
          </CardDescription>
          <CardTitle className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Chào mừng bạn! 👋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg mb-6">
            Bắt đầu hành trình học tiếng Anh với AI. Luyện nghe, nói, đọc theo cách hoàn toàn mới.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                <LogIn className="size-4" />
                Đăng nhập để bắt đầu
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/listening">Dùng thử miễn phí</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4">
          Chọn kỹ năng để luyện tập
        </h2>
        <QuickActions />
      </section>

      {/* Sample Data Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 flex items-end justify-center pb-8">
            <Button variant="secondary" asChild>
              <Link href="/login">Đăng nhập để xem tiến trình</Link>
            </Button>
          </div>
          <div className="opacity-50 filter blur-[2px]">
            <WeeklyActivityChart />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 flex items-end justify-center pb-8">
            <Button variant="secondary" asChild>
              <Link href="/login">Đăng nhập để xem kỹ năng</Link>
            </Button>
          </div>
          <div className="opacity-50 filter blur-[2px]">
            <SkillRadarChart />
          </div>
        </div>
      </div>

      {/* Features List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display">Tại sao chọn Passive Learning?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "AI Thông minh", desc: "Phản hồi realtime, đánh giá phát âm chính xác" },
              { title: "Học mọi lúc", desc: "Không cần đặt lịch, học bất cứ khi nào bạn muốn" },
              { title: "Nội dung đa dạng", desc: "Podcast, bài đọc, hội thoại từ nhiều nguồn" },
            ].map((feature) => (
              <div key={feature.title} className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

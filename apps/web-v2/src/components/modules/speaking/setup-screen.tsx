"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FeatureHeader, RecentLessonsDropdown } from "@/components/shared"
import { TopicCombobox } from "./topic-combobox"
import { Mic, Phone, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthActionGuard } from "@/components/auth"

interface SetupScreenProps {
  topic: string
  onTopicChange: (topic: string) => void
  duration: number
  onDurationChange: (duration: number) => void
  feedbackMode: "strict" | "gentle"
  onFeedbackModeChange: (mode: "strict" | "gentle") => void
  onStart: () => void
  onPlayRecentLesson?: (entry: { topic: string; content: Record<string, unknown> }) => void
}

const DURATION_OPTIONS = [
  { value: 5, label: "5 min", description: "Quick chat" },
  { value: 10, label: "10 min", description: "Casual talk" },
  { value: 15, label: "15 min", description: "In-depth" },
  { value: 20, label: "20 min", description: "Extended" },
]

export function SetupScreen({
  topic,
  onTopicChange,
  duration,
  onDurationChange,
  feedbackMode,
  onFeedbackModeChange,
  onStart,
  onPlayRecentLesson,
}: SetupScreenProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Compact Header */}
      <FeatureHeader
        icon={Mic}
        colorScheme="speaking"
        title="Speaking Practice"
        subtitle="AI Conversation Coach"
        className="mb-4"
      />
      {/* Recent Lessons Dropdown */}
      <div className="flex justify-end mb-4 -mt-2">
        <RecentLessonsDropdown 
          type="speaking" 
          onPlayEntry={onPlayRecentLesson}
        />
      </div>

      {/* Main Content - Single Column Compact */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Topic Section */}
        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            What topic do you want to practice?
            <Badge variant="secondary" className="text-[10px]">Required</Badge>
          </Label>
          <TopicCombobox
            value={topic}
            onChange={onTopicChange}
            placeholder="Type a topic or choose from suggestions..."
          />
        </div>

        <Separator className="my-4" />

        {/* Settings Row - Compact Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Target Duration
            </Label>
            <div className="flex gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={duration === opt.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1 flex flex-col h-auto py-2 px-2 gap-0",
                    duration === opt.value && "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent"
                  )}
                  onClick={() => onDurationChange(opt.value)}
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-[10px] opacity-70">{opt.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* AI Feedback Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              AI Feedback Mode
            </Label>
            <div className="flex gap-1.5">
              <Button
                variant={feedbackMode === "gentle" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 flex flex-col h-auto py-2 px-2 gap-0",
                  feedbackMode === "gentle" && "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent"
                )}
                onClick={() => onFeedbackModeChange("gentle")}
              >
                <span className="font-semibold text-sm">😊 Gentle</span>
                <span className="text-[10px] opacity-70">Major mistakes only</span>
              </Button>
              <Button
                variant={feedbackMode === "strict" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 flex flex-col h-auto py-2 px-2 gap-0",
                  feedbackMode === "strict" && "bg-gradient-to-br from-orange-500 to-red-600 text-white border-transparent"
                )}
                onClick={() => onFeedbackModeChange("strict")}
              >
                <span className="font-semibold text-sm">📝 Strict</span>
                <span className="text-[10px] opacity-70">All mistakes</span>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Start Button - Protected by AuthActionGuard */}
        <AuthActionGuard message="Đăng nhập để bắt đầu luyện nói">
          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 gap-2"
            size="lg"
            onClick={onStart}
            disabled={!topic.trim()}
          >
            <Phone className="size-5" />
            Start Conversation
          </Button>
        </AuthActionGuard>

        {/* Tip - Compact */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          💡 Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Space</kbd> to start/stop recording
        </p>
      </div>
    </div>
  )
}

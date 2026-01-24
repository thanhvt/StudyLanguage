"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FeatureHeader } from "@/components/shared"
import { TopicPicker } from "./topic-picker"
import { Mic, Phone, Clock, Sparkles, Search, History, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SetupScreenProps {
  topic: string
  onTopicChange: (topic: string) => void
  duration: number
  onDurationChange: (duration: number) => void
  feedbackMode: "strict" | "gentle"
  onFeedbackModeChange: (mode: "strict" | "gentle") => void
  onStart: () => void
  onHistoryClick?: () => void
}

const DURATION_OPTIONS = [
  { value: 5, label: "5 min", description: "Quick chat" },
  { value: 10, label: "10 min", description: "Casual conversation" },
  { value: 15, label: "15 min", description: "In-depth discussion" },
  { value: 20, label: "20 min", description: "Extended practice" },
]

export function SetupScreen({
  topic,
  onTopicChange,
  duration,
  onDurationChange,
  feedbackMode,
  onFeedbackModeChange,
  onStart,
  onHistoryClick,
}: SetupScreenProps) {
  const [isTopicPickerOpen, setIsTopicPickerOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <FeatureHeader
        icon={Mic}
        colorScheme="speaking"
        title="Speaking Practice"
        subtitle="AI Conversation Coach"
        actions={onHistoryClick ? [
          { icon: History, label: "History", onClick: onHistoryClick },
        ] : []}
        className="mb-6"
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-xl bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-display">AI Speaking Coach 🤖</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Have a 1-on-1 conversation with your AI coach. Get real-time feedback on your pronunciation and grammar.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <span>Conversation Topic</span>
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="topic"
                  placeholder="e.g., Daily Routine, Job Interview, Travel..."
                  value={topic}
                  onChange={(e) => onTopicChange(e.target.value)}
                  className="flex-1"
                />
                <Dialog open={isTopicPickerOpen} onOpenChange={setIsTopicPickerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <TopicPicker 
                      value={topic}
                      onSelect={(t) => {
                        onTopicChange(t)
                        setIsTopicPickerOpen(false)
                      }}
                      onClose={() => setIsTopicPickerOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Target Duration
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={duration === opt.value ? "default" : "outline"}
                    className={cn(
                      "flex flex-col h-auto py-3 gap-0.5",
                      duration === opt.value && "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                    )}
                    onClick={() => onDurationChange(opt.value)}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    <span className="text-xs opacity-70">{opt.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Feedback Mode */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                AI Feedback Mode
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={feedbackMode === "gentle" ? "default" : "outline"}
                  className={cn(
                    "flex flex-col h-auto py-3 gap-1",
                    feedbackMode === "gentle" && "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  )}
                  onClick={() => onFeedbackModeChange("gentle")}
                >
                  <span className="font-semibold flex items-center gap-2">
                    😊 Gentle
                  </span>
                  <span className="text-xs opacity-70">Only correct major mistakes</span>
                </Button>
                <Button
                  variant={feedbackMode === "strict" ? "default" : "outline"}
                  className={cn(
                    "flex flex-col h-auto py-3 gap-1",
                    feedbackMode === "strict" && "bg-gradient-to-br from-orange-500 to-red-600 text-white"
                  )}
                  onClick={() => onFeedbackModeChange("strict")}
                >
                  <span className="font-semibold flex items-center gap-2">
                    📝 Strict
                  </span>
                  <span className="text-xs opacity-70">Correct all mistakes</span>
                </Button>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 gap-3" 
              size="lg"
              onClick={onStart}
              disabled={!topic.trim()}
            >
              <Phone className="w-5 h-5" />
              Start Conversation
            </Button>

            {/* Tips */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>💡 Tip: Speak naturally. The AI will adapt to your level.</p>
              <p>🎧 Make sure your microphone is enabled.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

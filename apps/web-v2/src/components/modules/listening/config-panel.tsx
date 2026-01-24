"use client"

import * as React from "react"
import { useState } from "react"
import { Clock, Users, Tag, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ConfigPanelProps {
  duration: number
  setDuration: (duration: number) => void
  speakers: number
  setSpeakers: (speakers: number) => void
  keywords: string
  setKeywords: (keywords: string) => void
  onGenerate: () => void
  isGenerating?: boolean
  disabled?: boolean
}

const DURATION_OPTIONS = [
  { value: 5, label: "5 min", description: "Quick practice" },
  { value: 10, label: "10 min", description: "Standard" },
  { value: 15, label: "15 min", description: "Extended" },
]

const SPEAKER_OPTIONS = [
  { value: 2, label: "2", description: "Dialog" },
  { value: 3, label: "3", description: "Group" },
  { value: 4, label: "4", description: "Team" },
]

export function ConfigPanel({
  duration,
  setDuration,
  speakers,
  setSpeakers,
  keywords,
  setKeywords,
  onGenerate,
  isGenerating = false,
  disabled = false,
}: ConfigPanelProps) {
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDuration, setCustomDuration] = useState(duration.toString())

  const handleDurationSelect = (value: number) => {
    setShowCustomDuration(false)
    setDuration(value)
  }

  const handleCustomDuration = () => {
    setShowCustomDuration(true)
  }

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomDuration(value)
    const num = parseInt(value)
    if (!isNaN(num) && num >= 1 && num <= 20) {
      setDuration(num)
    }
  }

  return (
    <div className="space-y-6">
      {/* Duration Selector */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="size-4 text-muted-foreground" />
          Duration
        </Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDurationSelect(option.value)}
              className={cn(
                "flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                duration === option.value && !showCustomDuration
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                  : "border-border/50 bg-secondary/20"
              )}
            >
              <span className="font-semibold text-sm">{option.label}</span>
              <span className="text-[10px] text-muted-foreground">{option.description}</span>
            </button>
          ))}
          
          {/* Custom Duration */}
          {showCustomDuration ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary bg-primary/10">
              <input
                type="number"
                min={1}
                max={20}
                value={customDuration}
                onChange={handleCustomDurationChange}
                className="w-12 text-center bg-transparent border-none outline-none font-semibold text-sm"
                autoFocus
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          ) : (
            <button
              onClick={handleCustomDuration}
              className={cn(
                "flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all duration-200",
                "border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="font-semibold text-sm">Custom</span>
              <span className="text-[10px]">1-20 min</span>
            </button>
          )}
        </div>
      </div>

      {/* Speakers Selector */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Users className="size-4 text-muted-foreground" />
          Speakers
        </Label>
        <div className="flex gap-2">
          {SPEAKER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSpeakers(option.value)}
              className={cn(
                "flex flex-col items-center px-5 py-2.5 rounded-xl border transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                speakers === option.value
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                  : "border-border/50 bg-secondary/20"
              )}
            >
              <span className="font-semibold text-lg">{option.label}</span>
              <span className="text-[10px] text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Input */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="size-4 text-muted-foreground" />
          Keywords
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="E.g., reservation, room service, check-out, discount..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="resize-none h-20 bg-secondary/20 border-border/50 focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground">
          Add specific vocabulary or phrases you want to practice
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className={cn(
          "w-full h-12 text-base font-semibold",
          "bg-gradient-to-r from-skill-listening to-primary",
          "hover:shadow-lg hover:shadow-primary/25 transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="size-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Conversation...
          </>
        ) : (
          <>
            <Sparkles className="size-5 mr-2" />
            Generate Conversation
          </>
        )}
      </Button>
    </div>
  )
}

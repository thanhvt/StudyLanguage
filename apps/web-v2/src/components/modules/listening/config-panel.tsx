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
  className?: string
}

const DURATION_OPTIONS = [
  { value: 5, label: "5 min", description: "Quick" },
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
  className
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
    <div className={cn("space-y-4", className)}>
      {/* Duration Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          <Clock className="size-3.5" />
          Duration
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDurationSelect(option.value)}
              className={cn(
                "flex flex-col items-center justify-center py-2 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                duration === option.value && !showCustomDuration
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/50 bg-secondary/20"
              )}
            >
              <span className="font-semibold text-sm">{option.label}</span>
            </button>
          ))}
          
          {/* Custom Duration */}
          <button
            onClick={handleCustomDuration}
            className={cn(
              "flex flex-col items-center justify-center py-2 rounded-lg border transition-all duration-200",
              "border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5",
              showCustomDuration 
                ? "border-primary bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {showCustomDuration ? (
               <input
               type="number"
               min={1}
               max={20}
               value={customDuration}
               onClick={(e) => e.stopPropagation()}
               onChange={handleCustomDurationChange}
               className="w-full text-center bg-transparent border-none outline-none font-semibold text-sm"
               autoFocus
             />
            ) : (
              <span className="font-semibold text-sm">Custom</span>
            )}
          </button>
        </div>
      </div>

      {/* Speakers Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          <Users className="size-3.5" />
          Speakers
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {SPEAKER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSpeakers(option.value)}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                speakers === option.value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/50 bg-secondary/20"
              )}
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs opacity-70">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Input */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          <Tag className="size-3.5" />
          Keywords <span className="normal-case opacity-50 font-normal">(opt)</span>
        </Label>
        <Textarea
          placeholder="E.g., reservation, room service..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="resize-none h-16 min-h-[64px] bg-secondary/20 border-border/50 focus:border-primary/50 text-sm"
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className={cn(
          "w-full h-11 text-base font-semibold mt-2",
          "bg-gradient-to-r from-skill-listening to-primary",
          "hover:shadow-lg hover:shadow-primary/25 transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isGenerating ? (
          <>
            <div className="size-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="size-4 mr-2" />
            Generate
          </>
        )}
      </Button>
    </div>
  )
}

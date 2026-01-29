"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  Radio, 
  Shuffle, 
  Play, 
  Loader2,
  Clock,
  Music,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface RadioModeProps {
  onPlaylistGenerated?: (duration: number, trackCount: number) => void
}

const DURATION_OPTIONS = [
  { value: 30, label: "30 min", tracks: "~6 tracks" },
  { value: 60, label: "1 hour", tracks: "~12 tracks" },
  { value: 120, label: "2 hours", tracks: "~24 tracks" },
]

export function RadioMode({ onPlaylistGenerated }: RadioModeProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  // Prevent hydration mismatch from Radix UI's auto-generated IDs
  useEffect(() => {
    setMounted(true)
  }, [])

  // Shuffle animation
  const handleShuffle = () => {
    setIsShuffling(true)
    let shuffleCount = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * DURATION_OPTIONS.length)
      setSelectedDuration(DURATION_OPTIONS[randomIndex].value)
      shuffleCount++
      if (shuffleCount >= 10) {
        clearInterval(interval)
        setIsShuffling(false)
      }
    }, 100)
  }

  // Generate playlist
  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate API call - in production, this would call the radio API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const trackCount = Math.floor(selectedDuration / 5)
    onPlaylistGenerated?.(selectedDuration, trackCount)
    
    setIsGenerating(false)
    setIsOpen(false)
  }

  const currentOption = DURATION_OPTIONS.find(o => o.value === selectedDuration)

  // Render static placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" className="w-full h-14 gap-3 justify-start">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Radio className="size-5" />
        </div>
        <div className="text-left">
          <p className="font-semibold">Radio Mode</p>
          <p className="text-xs text-muted-foreground">Auto-generate continuous playlist</p>
        </div>
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-14 gap-3 justify-start">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Radio className="size-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Radio Mode</p>
            <p className="text-xs text-muted-foreground">Auto-generate continuous playlist</p>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="size-5 text-primary" />
            Radio Mode
          </DialogTitle>
          <DialogDescription>
            Generate a random playlist of conversations to listen continuously.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Duration</label>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-7"
                onClick={handleShuffle}
                disabled={isShuffling}
              >
                <Shuffle className={cn("size-3", isShuffling && "animate-spin")} />
                Random
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border transition-all duration-200",
                    selectedDuration === option.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <span className="font-bold text-lg">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.tracks}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Music className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Random Topics Playlist</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{currentOption?.label}</span>
                  <span>•</span>
                  <span>{currentOption?.tracks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ This will generate multiple conversations using AI.
            Generation may take a few minutes.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-primary/90 to-primary text-white hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Playlist
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

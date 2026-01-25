"use client"

import { Button } from "@/components/ui/button"
import { Keyboard, Mic } from "lucide-react"

interface SpeakingControlsProps {
  mode: "voice" | "text"
  onModeToggle: () => void
}

export function SpeakingControls({ mode, onModeToggle }: SpeakingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="bg-secondary/50 p-1 rounded-full flex items-center border border-border/50">
        <Button 
          variant={mode === "voice" ? "secondary" : "ghost"} 
          size="sm" 
          className="rounded-full px-4 gap-2 transition-all"
          onClick={() => mode !== "voice" && onModeToggle()}
        >
          <Mic className="size-4" />
          Voice
        </Button>
        <Button 
          variant={mode === "text" ? "secondary" : "ghost"} 
          size="sm" 
          className="rounded-full px-4 gap-2 transition-all"
          onClick={() => mode !== "text" && onModeToggle()}
        >
          <Keyboard className="size-4" />
          Text
        </Button>
      </div>
    </div>
  )
}

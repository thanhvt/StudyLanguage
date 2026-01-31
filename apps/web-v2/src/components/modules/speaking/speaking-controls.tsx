"use client"

import { Button } from "@/components/ui/button"
import { Keyboard, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpeakingControlsProps {
  mode: "voice" | "text"
  onModeToggle: () => void
}

export function SpeakingControls({ mode, onModeToggle }: SpeakingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="bg-muted/50 p-1 rounded-full flex items-center border border-border/50 backdrop-blur-sm">
        <Button 
          variant="ghost"
          size="sm" 
          className={cn(
            "rounded-full px-4 gap-2 transition-all duration-200",
            mode === "voice" 
              ? "bg-primary/15 text-primary shadow-sm border border-primary/20" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => mode !== "voice" && onModeToggle()}
        >
          <Mic className="size-4" />
          Voice
        </Button>
        <Button 
          variant="ghost"
          size="sm" 
          className={cn(
            "rounded-full px-4 gap-2 transition-all duration-200",
            mode === "text" 
              ? "bg-primary/15 text-primary shadow-sm border border-primary/20" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => mode !== "text" && onModeToggle()}
        >
          <Keyboard className="size-4" />
          Text
        </Button>
      </div>
    </div>
  )
}

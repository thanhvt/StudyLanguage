"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(33)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 z-50">
      <div className="flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex flex-col min-w-0">
          <span className="font-semibold truncate">Ordering Coffee</span>
          <span className="text-xs text-muted-foreground truncate">Daily Life • Episode 1</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <SkipBack className="size-4" />
          </Button>
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg shadow-primary/20"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <SkipForward className="size-4" />
          </Button>
        </div>

        {/* Volume/Extras */}
        <div className="hidden sm:flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Volume2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-xs text-muted-foreground w-8 text-right">1:23</span>
        <Slider 
          value={[progress]} 
          max={100} 
          step={1} 
          className="flex-1 cursor-pointer"
          onValueChange={(val) => setProgress(val[0])}
        />
        <span className="text-xs text-muted-foreground w-8">4:15</span>
      </div>
    </div>
  )
}

"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const MOCK_TRANSCRIPT = [
  { id: 1, speaker: "Barista", text: "Hi there! Welcome to The Daily Grind. What can I get started for you today?", timestamp: "0:00" },
  { id: 2, speaker: "You", text: "Hi! I'd like a medium latte, please.", timestamp: "0:05" },
  { id: 3, speaker: "Barista", text: "Sure thing. Would you like that hot or iced?", timestamp: "0:08" },
  { id: 4, speaker: "You", text: "Iced, please. And could I swap the milk for oat milk?", timestamp: "0:12" },
  { id: 5, speaker: "Barista", text: "Absolutely. An iced oat milk latte. Anything else to eat with that? We have fresh croissants.", timestamp: "0:16" },
  { id: 6, speaker: "You", text: "No thanks, just the coffee is fine.", timestamp: "0:22" },
  { id: 7, speaker: "Barista", text: "No problem. That'll be $5.50. You can tap your card right here.", timestamp: "0:25" },
]

export function TranscriptViewer() {
  const activeId = 3 // Mock active line for demo

  return (
    <div className="flex flex-col h-full max-h-[500px] w-full max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 px-4">Transcript</h3>
      <ScrollArea className="h-full w-full rounded-2xl border bg-card/50 p-4 shadow-inner">
        <div className="space-y-6">
          {MOCK_TRANSCRIPT.map((line) => (
            <div 
              key={line.id} 
              className={cn(
                "transition-all duration-300 ease-in-out px-4 py-2 rounded-lg cursor-pointer hover:bg-muted/50",
                activeId === line.id ? "scale-105 bg-primary/10 border-l-4 border-primary shadow-sm" : "opacity-70 grayscale"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  activeId === line.id ? "text-primary" : "text-muted-foreground"
                )}>
                  {line.speaker}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{line.timestamp}</span>
              </div>
              <p className={cn(
                "text-lg leading-relaxed font-medium",
                activeId === line.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {line.text}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

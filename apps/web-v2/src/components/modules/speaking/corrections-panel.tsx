"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Lightbulb, Sparkles } from "lucide-react"

interface Correction {
  original: string
  correction: string
  explanation?: string
}

interface CorrectionItem {
  messageId: string
  userText: string
  timestamp: number
  corrections: Correction[]
}

interface CorrectionsPanelProps {
  corrections: CorrectionItem[]
  className?: string
}

export function CorrectionsPanel({ corrections, className }: CorrectionsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const latestRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest correction with highlight effect
  useEffect(() => {
    if (latestRef.current && corrections.length > 0) {
      latestRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [corrections])

  const totalCorrections = corrections.reduce((acc, item) => acc + item.corrections.length, 0)

  if (corrections.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-center p-6", className)}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-semibold text-lg text-emerald-500">Great job!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No corrections yet. Keep speaking naturally!
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with stats */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">AI Feedback</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalCorrections} correction{totalCorrections !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Corrections List */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-3 space-y-4">
          <AnimatePresence initial={false}>
            {corrections.map((item, index) => {
              const isLatest = index === corrections.length - 1
              return (
                <motion.div
                  key={item.messageId}
                  ref={isLatest ? latestRef : null}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "rounded-xl border p-3 space-y-3 transition-all",
                    isLatest 
                      ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20" 
                      : "bg-card/50 border-border/50"
                  )}
                >
                  {/* Latest indicator */}
                  {isLatest && (
                    <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Latest feedback
                    </div>
                  )}

                  {/* User's original text */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">You said:</span>
                    <p className="mt-1 text-foreground font-medium">"{item.userText}"</p>
                  </div>

                  {/* Corrections */}
                  <div className="space-y-2">
                    {item.corrections.map((correction, cIndex) => (
                      <div 
                        key={cIndex} 
                        className="bg-background/50 rounded-lg p-2.5 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="line-through text-red-500/80">
                                {correction.original}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-emerald-500 font-semibold">
                                {correction.correction}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {correction.explanation && (
                          <div className="flex items-start gap-2 ml-6">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {correction.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Summary footer */}
      <div className="p-3 border-t bg-muted/20 text-center">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Review your corrections to improve faster!
        </p>
      </div>
    </div>
  )
}

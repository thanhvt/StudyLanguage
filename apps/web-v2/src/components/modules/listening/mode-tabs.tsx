"use client"

import * as React from "react"
import { Headphones, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

type ListeningMode = 'passive' | 'interactive'

interface ModeTabsProps {
  value: ListeningMode
  onChange: (mode: ListeningMode) => void
  className?: string
}

const MODES = [
  {
    value: 'passive' as const,
    label: 'Passive Mode',
    description: 'Listen to AI conversations',
    icon: Headphones,
  },
  {
    value: 'interactive' as const,
    label: 'Interactive Mode',
    description: 'Join and respond to the conversation',
    icon: Mic,
  },
]

export function ModeTabs({ value, onChange, className }: ModeTabsProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      {MODES.map((mode) => {
        const isActive = value === mode.value
        const Icon = mode.icon

        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex-1 flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
              "group hover:border-primary/50",
              isActive
                ? "bg-primary/10 border-primary/50 shadow-sm shadow-primary/10"
                : "bg-secondary/20 border-border/50 hover:bg-secondary/40"
            )}
          >
            {/* Icon */}
            <div className={cn(
              "size-12 rounded-xl flex items-center justify-center transition-colors",
              isActive
                ? "bg-gradient-to-br from-skill-listening to-primary text-white"
                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            )}>
              <Icon className="size-6" />
            </div>

            {/* Text */}
            <div className="text-left">
              <p className={cn(
                "font-semibold transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {mode.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode.description}
              </p>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <div className="ml-auto size-3 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        )
      })}
    </div>
  )
}

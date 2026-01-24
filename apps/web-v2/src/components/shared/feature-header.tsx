"use client"

import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type FeatureColorScheme = "listening" | "speaking" | "reading"

interface HeaderAction {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: "outline" | "ghost" | "default"
}

interface FeatureHeaderProps {
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Color scheme for gradient and shadow */
  colorScheme: FeatureColorScheme
  /** Main title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Action buttons on the right */
  actions?: HeaderAction[]
  /** Additional className */
  className?: string
  /** Whether to show separator below header */
  showSeparator?: boolean
}

const colorSchemeStyles: Record<FeatureColorScheme, {
  gradient: string
  shadow: string
}> = {
  listening: {
    gradient: "from-skill-listening to-primary",
    shadow: "shadow-skill-listening/30",
  },
  speaking: {
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
  },
  reading: {
    gradient: "from-teal-500 to-emerald-600",
    shadow: "shadow-teal-500/25",
  },
}

export function FeatureHeader({
  icon: Icon,
  colorScheme,
  title,
  subtitle,
  actions = [],
  className,
  showSeparator = true,
}: FeatureHeaderProps) {
  const styles = colorSchemeStyles[colorScheme]

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "size-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br",
              styles.gradient,
              "shadow-lg",
              styles.shadow
            )}
          >
            <Icon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className="gap-2"
              >
                <action.icon className="size-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {showSeparator && <Separator />}
    </div>
  )
}

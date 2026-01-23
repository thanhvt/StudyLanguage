"use client"

import Link from "next/link"
import { Headphones, Mic, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const skills = [
  {
    name: "Listening",
    nameVi: "Nghe",
    href: "/listening",
    icon: Headphones,
    description: "Train your ears with real conversations",
    colorClass: "skill-card-listening",
    bgGradient: "from-skill-listening/20 to-skill-listening/5",
    iconColor: "text-skill-listening",
  },
  {
    name: "Speaking",
    nameVi: "Nói",
    href: "/speaking",
    icon: Mic,
    description: "Practice speaking with AI feedback",
    colorClass: "skill-card-speaking",
    bgGradient: "from-skill-speaking/20 to-skill-speaking/5",
    iconColor: "text-skill-speaking",
  },
  {
    name: "Reading",
    nameVi: "Đọc",
    href: "/reading",
    icon: BookOpen,
    description: "Improve comprehension with articles",
    colorClass: "skill-card-reading",
    bgGradient: "from-skill-reading/20 to-skill-reading/5",
    iconColor: "text-skill-reading",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {skills.map((skill) => {
        const Icon = skill.icon
        return (
          <Link
            key={skill.name}
            href={skill.href}
            className={cn(
              "quick-action-btn skill-card group",
              "flex flex-col items-center gap-3 p-6 rounded-xl",
              "bg-gradient-to-br border border-border/50",
              skill.bgGradient,
              skill.colorClass
            )}
          >
            {/* Icon Container */}
            <div
              className={cn(
                "p-4 rounded-full",
                "bg-background/80 backdrop-blur-sm",
                "group-hover:scale-110 transition-transform duration-200"
              )}
            >
              <Icon className={cn("size-8", skill.iconColor)} />
            </div>

            {/* Skill Name */}
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg text-foreground">
                {skill.nameVi}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {skill.description}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

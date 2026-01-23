"use client"

import { Headphones, MessageCircle, BookOpen, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const skills = [
  { 
    name: "Listening", 
    nameVi: "Nghe",
    value: 80, 
    icon: Headphones,
    colorClass: "skill-listening",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    borderGlow: "hover:shadow-[0_0_30px_oklch(from_var(--skill-listening)_l_c_h_/_0.3)]",
    progressBg: "bg-gradient-to-r from-blue-500 to-cyan-400"
  },
  { 
    name: "Speaking", 
    nameVi: "Nói",
    value: 65, 
    icon: MessageCircle,
    colorClass: "skill-speaking",
    bgGradient: "from-emerald-500/20 to-green-500/20",
    borderGlow: "hover:shadow-[0_0_30px_oklch(from_var(--skill-speaking)_l_c_h_/_0.3)]",
    progressBg: "bg-gradient-to-r from-emerald-500 to-green-400"
  },
  { 
    name: "Reading", 
    nameVi: "Đọc",
    value: 57, 
    icon: BookOpen,
    colorClass: "skill-reading",
    bgGradient: "from-violet-500/20 to-purple-500/20",
    borderGlow: "hover:shadow-[0_0_30px_oklch(from_var(--skill-reading)_l_c_h_/_0.3)]",
    progressBg: "bg-gradient-to-r from-violet-500 to-purple-400"
  },
]

export function SkillRadarChart() {
  const avgScore = Math.round(skills.reduce((sum, s) => sum + s.value, 0) / skills.length)

  return (
    <Card className="h-full shadow-lg border-border/50 overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-60" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Skill Balance</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-semibold text-primary">{avgScore}%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-3 pt-2">
        {skills.map((skill, index) => {
          const Icon = skill.icon
          return (
            <div
              key={skill.name}
              className={`
                group relative p-3 rounded-xl 
                bg-gradient-to-r ${skill.bgGradient}
                border border-border/30
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:-translate-y-0.5
                ${skill.borderGlow}
                skill-card skill-card-${skill.name.toLowerCase()}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* Icon with glow */}
                <div className={`
                  p-2 rounded-lg
                  bg-${skill.colorClass.replace('skill-', '')}-500/20
                  group-hover:bg-${skill.colorClass.replace('skill-', '')}-500/30
                  transition-colors duration-300
                `}>
                  <Icon className={`w-5 h-5 text-${skill.colorClass}`} />
                </div>
                
                {/* Skill info and progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm text-foreground/90">
                      {skill.nameVi}
                    </span>
                    <span className={`text-sm font-bold text-${skill.colorClass} tabular-nums`}>
                      {skill.value}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.progressBg} rounded-full transition-all duration-700 ease-out`}
                      style={{ 
                        width: `${skill.value}%`,
                        boxShadow: '0 0 10px currentColor'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Bottom hint */}
        <p className="text-xs text-muted-foreground text-center pt-1">
          Luyện tập đều đặn để cân bằng kỹ năng
        </p>
      </CardContent>
    </Card>
  )
}

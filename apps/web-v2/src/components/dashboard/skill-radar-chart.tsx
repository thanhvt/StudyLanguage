"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { subject: "Listening", A: 120, fullMark: 150 },
  { subject: "Speaking", A: 98, fullMark: 150 },
  { subject: "Reading", A: 86, fullMark: 150 },
]

export function SkillRadarChart() {
  return (
    <Card className="h-full shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Skill Balance</CardTitle>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid className="stroke-muted-foreground/20" />
            <PolarAngleAxis dataKey="subject" className="text-xs font-medium fill-muted-foreground" />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="A"
              stroke="var(--color-primary)" // Using CSS variable from globals.css
              fill="var(--color-primary)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

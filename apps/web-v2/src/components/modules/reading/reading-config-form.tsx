"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReadingConfigFormProps {
  onGenerate: (topic: string, difficulty: 'basic' | 'advanced') => void
  isGenerating: boolean
}

/**
 * ReadingConfigForm - Form cấu hình bài đọc
 * 
 * Features:
 * - Input chủ đề với validation
 * - Selector độ khó (Basic A1-A2 / Advanced B1-B2)
 * - Generate button với loading state
 */
export function ReadingConfigForm({ onGenerate, isGenerating }: ReadingConfigFormProps) {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'basic' | 'advanced'>('basic')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề')
      return
    }
    
    setError(null)
    onGenerate(topic.trim(), difficulty)
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BookOpen className="size-5 text-white" />
          </div>
          Tạo bài đọc mới
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium">
              Chủ đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="Technology, Environment, Travel, Health..."
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value)
                setError(null)
              }}
              className="bg-background/50"
              disabled={isGenerating}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Độ khó</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDifficulty('basic')}
                disabled={isGenerating}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  difficulty === 'basic'
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📗</span>
                  <span className="font-semibold">Cơ bản</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Level A1-A2 • Từ vựng đơn giản
                </p>
                {difficulty === 'basic' && (
                  <div className="absolute top-2 right-2 size-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('advanced')}
                disabled={isGenerating}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  difficulty === 'advanced'
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📕</span>
                  <span className="font-semibold">Nâng cao</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Level B1-B2 • Từ vựng phức tạp
                </p>
                {difficulty === 'advanced' && (
                  <div className="absolute top-2 right-2 size-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
            disabled={!topic.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Đang tạo bài đọc...
              </>
            ) : (
              <>
                <Sparkles className="size-5 mr-2" />
                Tạo bài đọc
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

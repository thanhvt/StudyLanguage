"use client"

import { useState, useCallback } from "react"
import { BookOpen, Minimize2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { ReadingConfigForm } from "@/components/modules/reading/reading-config-form"
import { ArticleViewer } from "@/components/modules/reading/article-viewer"
import { ReadingQuiz } from "@/components/modules/reading/reading-quiz"
import { AIThinkingIndicator } from "@/components/modules/reading/reading-skeleton"
import { HistoryDrawer, HistoryButton } from "@/components/history"
import { useReading, ReadingArticle } from "@/hooks/use-reading"
import { useSaveLesson } from "@/hooks/use-save-lesson"
import { HistoryEntry } from "@/hooks/use-history"

/**
 * Reading Page - Module Luyện Đọc
 * 
 * Features:
 * - Form cấu hình bài đọc (chủ đề, độ khó)
 * - AI sinh nội dung + câu hỏi
 * - Click-to-lookup tra từ điển
 * - Quiz đọc hiểu với instant feedback
 * - Focus Mode để đọc tập trung
 * - Lưu history khi hoàn thành
 * - History drawer để xem lại bài cũ
 */
export default function ReadingPage() {
  // State
  const [focusMode, setFocusMode] = useState(false)
  const [currentTopic, setCurrentTopic] = useState("")
  const [currentDifficulty, setCurrentDifficulty] = useState<'basic' | 'advanced'>('basic')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [loadedArticle, setLoadedArticle] = useState<ReadingArticle | null>(null)
  
  // Hooks
  const { article: generatedArticle, isGenerating, error, generateArticle, reset: resetReading } = useReading()
  const { saveLesson } = useSaveLesson()

  // Use loaded article from history or generated article
  const article = loadedArticle || generatedArticle

  // Handlers
  const handleGenerate = useCallback((topic: string, difficulty: 'basic' | 'advanced') => {
    setCurrentTopic(topic)
    setCurrentDifficulty(difficulty)
    setLoadedArticle(null) // Clear loaded article
    generateArticle({ topic, difficulty })
  }, [generateArticle])

  const handleQuizComplete = useCallback(async (score: number, total: number) => {
    if (article) {
      await saveLesson({
        type: 'reading',
        topic: currentTopic,
        content: {
          title: article.title,
          article: article.article,
          questions: article.questions,
          score,
          total,
          difficulty: currentDifficulty,
        },
        status: 'completed',
      })
    }
  }, [article, currentTopic, currentDifficulty, saveLesson])

  const handleReset = useCallback(() => {
    resetReading()
    setLoadedArticle(null)
    setCurrentTopic("")
  }, [resetReading])

  const handleOpenHistoryEntry = useCallback((entry: HistoryEntry) => {
    if (entry.content) {
      setCurrentTopic(entry.topic)
      const content = entry.content as { 
        title?: string
        article?: string 
        questions?: { question: string; options: string[]; answer: number }[]
        difficulty?: 'basic' | 'advanced'
      }
      
      if (content.article && content.questions) {
        setLoadedArticle({
          title: content.title,
          article: content.article,
          questions: content.questions,
        })
        setCurrentDifficulty(content.difficulty || 'basic')
      }
    }
    setHistoryOpen(false)
  }, [])

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      focusMode && "fixed inset-0 z-50 bg-background overflow-y-auto"
    )}>
      {/* History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        filterType="reading"
        onOpenEntry={handleOpenHistoryEntry}
      />

      {/* Top Bar */}
      <div className={cn(
        "sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-all",
        focusMode ? "border-transparent" : "border-border"
      )}>
        <div className="flex items-center gap-4">
          {focusMode ? (
            <Button variant="ghost" size="icon" onClick={() => setFocusMode(false)}>
              <Minimize2 className="size-5" />
            </Button>
          ) : (
            <h1 className="text-2xl font-display font-bold flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <BookOpen className="size-5 text-white" />
              </div>
              <span>Reading Practice</span>
            </h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Focus Mode Toggle */}
          {article && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-1.5 border border-border/50">
              <Switch 
                id="focus-mode" 
                checked={focusMode} 
                onCheckedChange={setFocusMode} 
              />
              <Label htmlFor="focus-mode" className="text-sm font-medium cursor-pointer">
                Focus Mode
              </Label>
            </div>
          )}

          {/* History Button */}
          <HistoryButton onClick={() => setHistoryOpen(true)} />
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "max-w-3xl mx-auto py-8 px-6 transition-all duration-700",
        focusMode ? "py-12" : "py-8"
      )}>
        {/* Step 1: Config Form (Show when no article) */}
        {!article && !isGenerating && (
          <ReadingConfigForm 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating}
          />
        )}

        {/* Loading State */}
        {isGenerating && (
          <AIThinkingIndicator message="AI đang tạo bài đọc..." />
        )}

        {/* Step 2: Article + Quiz (Show when article exists) */}
        {article && !isGenerating && (
          <div className="space-y-8">
            {/* Article Header */}
            <div className="text-center space-y-4">
              {article.title && (
                <>
                  <span className="text-xs font-bold tracking-widest uppercase text-primary">
                    {currentDifficulty === 'basic' ? 'Level A1-A2' : 'Level B1-B2'}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                    {article.title}
                  </h2>
                </>
              )}
              
              {/* Reset Button */}
              <div className="flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Làm bài mới
                </Button>
              </div>
            </div>

            {/* Article Content */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
                  💡 <span>Click vào từ để tra từ điển</span>
                </p>
                <ArticleViewer 
                  content={article.article} 
                />
              </CardContent>
            </Card>

            {/* Quiz */}
            {article.questions && article.questions.length > 0 && (
              <ReadingQuiz 
                questions={article.questions}
                onComplete={handleQuizComplete}
                onReset={handleReset}
              />
            )}
          </div>
        )}

        {/* Error State */}
        {error && !isGenerating && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button variant="outline" onClick={handleReset}>
                Thử lại
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { BookOpen, Minimize2, RotateCcw, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { FeatureHeader } from "@/components/shared"
import { cn } from "@/lib/utils"

import { ReadingConfigForm } from "@/components/modules/reading/reading-config-form"
import { ArticleViewer } from "@/components/modules/reading/article-viewer"
import { AIThinkingIndicator } from "@/components/modules/reading/reading-skeleton"
import { ReadingPracticeSection } from "@/components/modules/reading/reading-practice-section"
import { RecentLessonsDropdown } from "@/components/shared"
import { useReading, ReadingArticle } from "@/hooks/use-reading"
import { useSaveLesson } from "@/hooks/use-save-lesson"

/**
 * Reading Page - Module Luyện Đọc
 * 
 * Features:
 * - Form cấu hình bài đọc (chủ đề, độ khó)
 * - AI sinh nội dung bài đọc
 * - Click-to-lookup tra từ điển
 * - Luyện phát âm với AI feedback (Sheet panel)
 * - Focus Mode để đọc tập trung
 * - Lưu history khi hoàn thành
 */
export default function ReadingPage() {
  // State
  const [focusMode, setFocusMode] = useState(false)
  const [currentTopic, setCurrentTopic] = useState("")
  const [currentDifficulty, setCurrentDifficulty] = useState<'basic' | 'advanced'>('basic')
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



  const handleReset = useCallback(() => {
    resetReading()
    setLoadedArticle(null)
    setCurrentTopic("")
  }, [resetReading])

  // Xử lý khi chọn entry từ RecentLessonsDropdown
  const handleRecentLessonPlay = useCallback((entry: { topic: string; content: Record<string, unknown> }) => {
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
  }, [])

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      focusMode && "fixed inset-0 z-50 bg-background overflow-y-auto p-4 md:p-6"
    )}>
      {/* Focus Mode Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 mb-8 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setFocusMode(false)} className="gap-2 text-muted-foreground hover:text-foreground">
              <Minimize2 className="size-4" />
              Thoát Focus Mode
            </Button>
            
            <div className="flex items-center gap-3">
               {article && (
                 <span className="text-sm font-medium hidden sm:inline-block">
                   {article.title}
                 </span>
               )}
               <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-1.5 border border-border/50">
                <Switch 
                  id="focus-mode-active" 
                  checked={focusMode} 
                  onCheckedChange={setFocusMode} 
                />
                <Label htmlFor="focus-mode-active" className="text-sm font-medium cursor-pointer">
                  Focus Mode
                </Label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Header */
        <div className="max-w-5xl mx-auto mb-8 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "size-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-teal-500 to-emerald-600",
                "shadow-lg shadow-teal-500/25"
              )}>
                <BookOpen className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Reading Practice</h1>
                <p className="text-sm text-muted-foreground">Đọc hiểu & học từ vựng mới</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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

              <RecentLessonsDropdown 
                type="reading" 
                onPlayEntry={handleRecentLessonPlay}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "mx-auto transition-all duration-500 px-4 sm:px-6",
        focusMode ? "max-w-7xl" : "max-w-5xl"
      )}>
        {/* Step 1: Config Form */}
        {!article && !isGenerating && (
          <div className="max-w-2xl mx-auto py-8">
            <ReadingConfigForm 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="max-w-2xl mx-auto py-12">
            <AIThinkingIndicator message="AI đang tạo bài đọc..." />
          </div>
        )}

        {/* Step 2: Article + Quiz (2-Column Layout) */}
        {article && !isGenerating && (
          <div className="relative">
            {/* Toolbar / Metadata Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
              <div className="flex items-center gap-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase",
                  currentDifficulty === 'basic' 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                )}>
                  {currentDifficulty === 'basic' ? 'Level A1-A2' : 'Level B1-B2'}
                </span>
                <h2 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md">
                  {article.title}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={handleReset}
                   className="text-muted-foreground hover:text-foreground h-8"
                 >
                   <RotateCcw className="size-3.5 mr-2" />
                   Làm bài mới
                 </Button>
              </div>
            </div>

            {/* 2-Column Layout: Article Left, Practice Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Article (7 cols) */}
              <div className="lg:col-span-7">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg w-fit">
                      <span className="text-lg">💡</span> 
                      <span>Click vào từ bất kỳ để tra nghĩa</span>
                    </div>
                    <ArticleViewer 
                      content={article.article}
                      className={cn(
                        "font-serif text-lg leading-loose",
                        focusMode && "text-xl leading-loose"
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Practice Section (5 cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-20">
                <ReadingPracticeSection
                  articleContent={article.article}
                  onSave={async (result: unknown) => {
                    await saveLesson({
                      type: 'speaking',
                      topic: `Practice: ${article.title}`,
                      content: {
                        articleTitle: article.title,
                        feedback: result,
                      },
                      mode: 'interactive',
                      status: 'completed'
                    })
                    toast.success('Đã lưu kết quả luyện đọc')
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isGenerating && (
          <div className="max-w-md mx-auto py-12">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button variant="outline" onClick={handleReset}>
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

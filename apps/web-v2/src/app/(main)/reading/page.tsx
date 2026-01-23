"use client"

import { useState } from "react"
import { ArticleViewer } from "@/components/modules/reading/article-viewer"
import { READING_ARTICLE } from "@/data/mock-reading-article"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Minimize2, Settings, Type } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReadingPage() {
  const [focusMode, setFocusMode] = useState(false)

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      focusMode && "fixed inset-0 z-50 bg-background overflow-y-auto"
    )}>
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
             <h1 className="text-2xl font-display font-bold flex items-center gap-2">
               <BookOpen className="size-6 text-primary" />
               Reading Practice
             </h1>
           )}
        </div>

        <div className="flex items-center gap-6">
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
           <Button variant="ghost" size="icon">
             <Type className="size-5" />
           </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "max-w-3xl mx-auto py-12 px-6 transition-all duration-700",
        focusMode ? "py-20" : "py-12"
      )}>
        <div className="mb-8 text-center space-y-4">
           <span className="text-xs font-bold tracking-widest uppercase text-primary">
             {READING_ARTICLE.category}
           </span>
           <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
             {READING_ARTICLE.title}
           </h2>
           <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
             <span>{READING_ARTICLE.readTime}</span>
             <span>•</span>
             <span>{READING_ARTICLE.level}</span>
           </div>
        </div>

        <ArticleViewer content={READING_ARTICLE.content} />
        
        {/* Footer/Quiz CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" className="rounded-full px-8">
            Take Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}

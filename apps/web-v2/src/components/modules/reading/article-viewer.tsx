"use client"

import { DictionaryPopup } from "./dictionary-popup"
import { cn } from "@/lib/utils"

interface ArticleViewerProps {
  content: string
  title?: string
  className?: string
}

/**
 * ArticleViewer - Component hiển thị bài đọc với click-to-lookup
 * 
 * Features:
 * - Paragraph splitting
 * - Click từ để tra nghĩa (DictionaryPopup)
 * - Highlight từ khi hover
 * - Typography đẹp cho đọc dễ dàng
 */
export function ArticleViewer({ content, title, className }: ArticleViewerProps) {
  // Split content into paragraphs
  const paragraphs = content.trim().split("\n\n").filter(p => p.trim())

  return (
    <article className={cn(
      "prose prose-lg dark:prose-invert max-w-none",
      className
    )}>
      {title && (
        <h2 className="text-2xl font-display font-bold mb-6 text-foreground">
          {title}
        </h2>
      )}
      
      <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
        {paragraphs.map((para, i) => (
          <p key={i} className="first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-primary">
            {renderClickableWords(para)}
          </p>
        ))}
      </div>
    </article>
  )
}

/**
 * Render từng từ với DictionaryPopup
 * Chỉ wrap từ có độ dài > 3 ký tự
 */
function renderClickableWords(text: string) {
  const words = text.split(/(\s+)/)

  return words.map((word, index) => {
    // Giữ nguyên khoảng trắng
    if (/^\s+$/.test(word)) {
      return <span key={index}>{word}</span>
    }

    // Tách dấu câu khỏi từ
    const match = word.match(/^([.,!?;:'"()\[\]{}]*)([a-zA-Z'-]+)([.,!?;:'"()\[\]{}]*)$/)
    
    if (match) {
      const [, before, cleanWord, after] = match
      
      // Chỉ wrap từ dài > 3 ký tự
      if (cleanWord.length > 3) {
        return (
          <span key={index}>
            {before}
            <DictionaryPopup word={cleanWord}>
              {cleanWord}
            </DictionaryPopup>
            {after}
          </span>
        )
      }
    }

    // Từ ngắn hoặc không match pattern - render bình thường
    return <span key={index}>{word}</span>
  })
}

/**
 * ArticleSkeleton - Loading skeleton cho ArticleViewer
 */
export function ArticleSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-muted/50 rounded-lg w-3/4" />
      
      {/* Paragraphs skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-muted/40 rounded w-full" />
          <div className="h-4 bg-muted/40 rounded w-11/12" />
          <div className="h-4 bg-muted/40 rounded w-4/5" />
          <div className="h-4 bg-muted/40 rounded w-10/12" />
        </div>
      ))}
    </div>
  )
}

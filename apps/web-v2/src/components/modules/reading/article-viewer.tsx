"use client"

import { DictionaryPopup } from "./dictionary-popup"

interface ArticleViewerProps {
  content: string
}

export function ArticleViewer({ content }: ArticleViewerProps) {
  // Simple paragraph splitter
  const paragraphs = content.trim().split("\n\n")

  return (
    <div className="space-y-6 text-lg leading-loose font-serif text-foreground/90 max-w-2xl mx-auto">
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.split(" ").map((word, j) => {
             // Basic cleaner to remove punctuation for the key/word lookup
             const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "")
             if (cleanWord.length > 3) {
                return (
                  <span key={j}>
                    <DictionaryPopup word={cleanWord}>{word}</DictionaryPopup>
                    {" "}
                  </span>
                )
             }
             return <span key={j}>{word} </span>
          })}
        </p>
      ))}
    </div>
  )
}

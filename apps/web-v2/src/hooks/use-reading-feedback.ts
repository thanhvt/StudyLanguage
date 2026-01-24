"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export interface WordAnalysis {
  word: string
  score: number
  suggestion?: string
}

export interface ReadingFeedbackResult {
  overallScore: number
  fluency: number
  pronunciation: number
  pace: number
  feedback: string
  wordAnalysis: WordAnalysis[]
}

interface UseReadingFeedbackReturn {
  analyze: (audioBlob: Blob, text: string) => Promise<ReadingFeedbackResult | null>
  isAnalyzing: boolean
  result: ReadingFeedbackResult | null
  error: string | null
  reset: () => void
}

/**
 * useReadingFeedback - Hook for AI reading analysis
 * 
 * Features:
 * - Submits audio + text to /ai/reading-feedback
 * - Returns structured feedback (scores, suggestions)
 */
export function useReadingFeedback(): UseReadingFeedbackReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ReadingFeedbackResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (audioBlob: Blob, text: string) => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("text", text)

      console.log("[useReadingFeedback] Submitting audio for analysis...")

      const response = await api("/ai/reading-feedback", {
        method: "POST",
        body: formData,
      }, 60000) // 60s timeout for audio processing

      if (!response.ok) {
        throw new Error("Không thể phân tích giọng nói")
      }

      const data = await response.json()
      
      // Parse JSON if nested in text response (common with some AI wrappers)
      let parsedResult: ReadingFeedbackResult
      if (typeof data.text === 'string' && data.text.includes('{')) {
         const jsonMatch = data.text.match(/\{[\s\S]*\}/)
         if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0])
         } else {
            parsedResult = data
         }
      } else {
         parsedResult = data
      }

      setResult(parsedResult)
      toast.success("Đã hoàn thành phân tích!")
      return parsedResult

    } catch (err) {
      console.error("[useReadingFeedback] Error:", err)
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra"
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setIsAnalyzing(false)
  }

  return {
    analyze,
    isAnalyzing,
    result,
    error,
    reset
  }
}

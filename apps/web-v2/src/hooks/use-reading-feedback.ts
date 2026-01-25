"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export interface WordScore {
  word: string
  correct: boolean
  score: number
  issue?: string
}

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
  wordByWord: WordScore[]
  patterns: string[]
  userTranscript?: string
}

interface UseReadingFeedbackReturn {
  analyze: (audioBlob: Blob, text: string) => Promise<ReadingFeedbackResult | null>
  isAnalyzing: boolean
  result: ReadingFeedbackResult | null
  error: string | null
  reset: () => void
}

/**
 * useReadingFeedback - Hook for AI reading analysis (Enhanced)
 * 
 * Flow:
 * 1. Transcribe audio → get user's spoken text
 * 2. Evaluate pronunciation → compare with original text (word-by-word)
 * 3. Return detailed feedback with scores for each word
 */
export function useReadingFeedback(): UseReadingFeedbackReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ReadingFeedbackResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (audioBlob: Blob, originalText: string) => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // Step 1: Transcribe audio to text
      console.log("[useReadingFeedback] Step 1: Transcribing audio...")
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const transcribeResponse = await api("/ai/transcribe", {
        method: "POST",
        body: formData,
      }, 60000)

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể nhận diện giọng nói")
      }

      const transcribeData = await transcribeResponse.json()
      const userTranscript = transcribeData.text || ""
      
      console.log("[useReadingFeedback] Transcribed:", userTranscript.substring(0, 100) + "...")

      if (!userTranscript.trim()) {
        throw new Error("Không nghe được giọng nói. Vui lòng thử lại.")
      }

      // Step 2: Evaluate pronunciation (enhanced with word-by-word)
      console.log("[useReadingFeedback] Step 2: Evaluating pronunciation...")
      const evaluateResponse = await api("/ai/evaluate-pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: originalText.trim(),
          userTranscript: userTranscript.trim(),
        }),
      }, 60000)

      if (!evaluateResponse.ok) {
        const errorData = await evaluateResponse.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể đánh giá phát âm")
      }

      const data = await evaluateResponse.json()
      
      // Backend now returns enhanced format directly (0-100 scores)
      // { overallScore, fluency, pronunciation, pace, wordByWord, patterns, feedback }
      
      const feedbackObj = data.feedback || {}
      const wrongWords = feedbackObj.wrongWords || []
      const tips = feedbackObj.tips || []
      const encouragement = feedbackObj.encouragement || ""
      
      // Build feedback text
      let feedbackText = encouragement
      if (tips.length > 0) {
        feedbackText += "\n\n📝 Mẹo cải thiện:\n• " + tips.join("\n• ")
      }
      
      // Transform wrongWords to wordAnalysis format for backward compat
      const wordAnalysis: WordAnalysis[] = wrongWords.map((w: { word: string; userSaid: string; suggestion: string }) => ({
        word: w.word,
        score: 40,
        suggestion: `Bạn đọc "${w.userSaid}". ${w.suggestion}`
      }))
      
      const parsedResult: ReadingFeedbackResult = {
        overallScore: data.overallScore || 70,
        fluency: data.fluency || data.overallScore || 70,
        pronunciation: data.pronunciation || data.overallScore || 70,
        pace: data.pace || data.overallScore || 70,
        feedback: feedbackText || "Tiếp tục luyện tập nhé!",
        wordAnalysis,
        wordByWord: data.wordByWord || [],
        patterns: data.patterns || [],
        userTranscript,
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

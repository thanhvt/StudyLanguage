"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, RotateCcw, Award, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  question: string
  options: string[]
  answer: number
}

interface ReadingQuizProps {
  questions: Question[]
  onComplete?: (score: number, total: number) => void
  onReset?: () => void
}

/**
 * ReadingQuiz - Quiz component cho bài đọc
 * 
 * Features:
 * - Multiple choice 4 options (A/B/C/D)
 * - Selection state management
 * - Instant feedback styling (green/red)
 * - Score calculation & display
 * - Confetti celebration on high score
 */
export function ReadingQuiz({ questions, onComplete, onReset }: ReadingQuizProps) {
  const [userAnswers, setUserAnswers] = useState<number[]>(new Array(questions.length).fill(-1))
  const [showResults, setShowResults] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (showResults) return
    
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = optionIndex
    setUserAnswers(newAnswers)
  }

  const handleSubmit = () => {
    setShowResults(true)
    
    const score = calculateScore()
    const percentage = (score / questions.length) * 100
    
    // Show confetti for high scores (>= 75%)
    if (percentage >= 75) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    onComplete?.(score, questions.length)
  }

  const handleReset = () => {
    setUserAnswers(new Array(questions.length).fill(-1))
    setShowResults(false)
    setShowConfetti(false)
    onReset?.()
  }

  const calculateScore = () => {
    return questions.reduce((score, q, i) => 
      score + (userAnswers[i] === q.answer ? 1 : 0), 0
    )
  }

  const allAnswered = !userAnswers.includes(-1)
  const score = calculateScore()
  const percentage = Math.round((score / questions.length) * 100)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">❓</span>
          Câu hỏi đọc hiểu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
            >
              <p className="font-medium mb-3 text-foreground">
                <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-bold mr-2">
                  {qIndex + 1}
                </span>
                {q.question}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((option, oIndex) => {
                  const isSelected = userAnswers[qIndex] === oIndex
                  const isCorrect = q.answer === oIndex
                  
                  let bgClass = "bg-muted/30 hover:bg-muted/50 border border-border/50"
                  let iconElement = null
                  
                  if (showResults) {
                    if (isCorrect) {
                      bgClass = "bg-green-100 dark:bg-green-900/30 border-green-500/50"
                      iconElement = <CheckCircle className="size-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    } else if (isSelected && !isCorrect) {
                      bgClass = "bg-red-100 dark:bg-red-900/30 border-red-500/50"
                      iconElement = <XCircle className="size-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    }
                  } else if (isSelected) {
                    bgClass = "bg-primary/20 border-primary shadow-sm"
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleSelectAnswer(qIndex, oIndex)}
                      className={cn(
                        "p-3 rounded-lg text-sm text-left transition-all duration-200",
                        bgClass,
                        !showResults && "hover:shadow-sm"
                      )}
                      disabled={showResults}
                    >
                      <span className="flex items-center gap-2">
                        {iconElement}
                        <span className={cn(
                          "size-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                          isSelected && !showResults 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit / Results */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                onClick={handleSubmit}
                disabled={!allAnswered}
              >
                📊 Nộp bài ({userAnswers.filter(a => a !== -1).length}/{questions.length})
              </Button>
              {!allAnswered && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Hãy trả lời tất cả câu hỏi để nộp bài
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Confetti Effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <PartyPopper className="size-12 text-yellow-500 animate-bounce" />
                  </div>
                </div>
              )}
              
              {/* Score Display */}
              <div className={cn(
                "p-6 rounded-xl text-center",
                percentage >= 75 
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
                  : percentage >= 50 
                    ? "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30"
                    : "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30"
              )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className={cn(
                    "size-8",
                    percentage >= 75 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"
                  )} />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {score}/{questions.length}
                </p>
                <p className={cn(
                  "text-sm font-medium",
                  percentage >= 75 
                    ? "text-green-700 dark:text-green-400"
                    : percentage >= 50 
                      ? "text-yellow-700 dark:text-yellow-400"
                      : "text-red-700 dark:text-red-400"
                )}>
                  {percentage >= 75 
                    ? "🎉 Xuất sắc! Bạn làm rất tốt!" 
                    : percentage >= 50 
                      ? "👍 Khá tốt! Cần cải thiện thêm."
                      : "💪 Cố gắng lên! Hãy đọc lại bài."}
                </p>
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleReset}
              >
                <RotateCcw className="size-4 mr-2" />
                Làm bài mới
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

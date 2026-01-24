"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RotateCcw, X } from "lucide-react"

interface PronunciationAlertProps {
  isOpen: boolean
  userSaid: string
  suggestion: string
  onRetry: () => void
  onIgnore: () => void
}

export function PronunciationAlert({ 
  isOpen, 
  userSaid, 
  suggestion, 
  onRetry, 
  onIgnore 
}: PronunciationAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl shadow-amber-500/10">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-2xl">💡</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                  Pronunciation Tip
                </h4>
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">
                    You said: <span className="text-red-500 line-through font-medium">{userSaid}</span>
                  </p>
                  <p className="text-foreground">
                    Try: <span className="text-green-500 font-bold text-lg">{suggestion}</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onIgnore} 
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <X className="w-4 h-4" />
                Skip
              </Button>
              <Button 
                size="sm" 
                onClick={onRetry} 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

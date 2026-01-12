'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

interface PronunciationAlertProps {
  isOpen: boolean;
  userSaid: string;
  suggestion: string;
  onRetry: () => void;
  onIgnore: () => void;
}

export function PronunciationAlert({ isOpen, userSaid, suggestion, onRetry, onIgnore }: PronunciationAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4"
        >
          <GlassCard variant="glow" className="bg-black/60 backdrop-blur-xl border-red-500/30 p-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-2xl">
                ⚠️
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-red-200">Phát âm chưa chính xác</h4>
                <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Bạn nói: <span className="text-red-400 line-through">{userSaid}</span></p>
                    <p className="text-foreground">Thử lại: <span className="text-green-400 font-bold text-lg">{suggestion}</span></p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
               <Button variant="ghost" size="sm" onClick={onIgnore} className="text-muted-foreground hover:text-foreground">
                 Bỏ qua
               </Button>
               <Button size="sm" onClick={onRetry} className="bg-green-600 hover:bg-green-700 text-white">
                 🔄 Thử lại ngay
               </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

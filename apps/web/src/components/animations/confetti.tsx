'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

/**
 * Confetti Component
 *
 * Mục đích: Hiển thị confetti celebration khi user hoàn thành bài
 * Tham số:
 *   - isActive: Trigger confetti
 *   - duration: Thời gian hiển thị (ms)
 *   - pieceCount: Số lượng confetti pieces
 * Khi nào sử dụng: Sau khi hoàn thành quiz, speaking exercise, etc.
 */
export function Confetti({
  isActive,
  duration = 3000,
  pieceCount = 50,
}: {
  isActive: boolean;
  duration?: number;
  pieceCount?: number;
}) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Random x position (0-100%)
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 0.3,
      }));

      setPieces(newPieces);
      setShow(true);

      // Hide after duration
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, pieceCount]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute top-0 w-3 h-3 rounded-sm"
              style={{
                left: `${piece.x}%`,
                backgroundColor: piece.color,
                transformOrigin: 'center',
              }}
              initial={{
                y: -20,
                rotate: 0,
                scale: piece.scale,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * useConfetti Hook
 *
 * Mục đích: Hook để trigger confetti dễ dàng
 */
export function useConfetti() {
  const [active, setActive] = useState(false);

  const trigger = () => setActive(true);
  const reset = () => setActive(false);

  // Auto reset after animation
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => setActive(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return { active, trigger, reset };
}

/**
 * CelebrationMessage Component
 *
 * Mục đích: Hiển thị celebration message với animation
 */
export function CelebrationMessage({
  isVisible,
  score,
  maxScore,
}: {
  isVisible: boolean;
  score: number;
  maxScore: number;
}) {
  const isPerfect = score === maxScore;
  const isGood = score >= maxScore * 0.7;

  const emoji = isPerfect ? '🎉' : isGood ? '👏' : '💪';
  const message = isPerfect 
    ? 'Hoàn hảo!' 
    : isGood 
    ? 'Tuyệt vời!' 
    : 'Tiếp tục cố gắng!';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.span
              className="text-6xl block mb-2"
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {emoji}
            </motion.span>
            <span className="text-3xl font-bold text-primary">
              {message}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

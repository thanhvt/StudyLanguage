'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * PageTransition Component
 *
 * Mục đích: Wrap pages để có animation fade-in/slide-in mượt mà
 * Khi nào sử dụng: Trong layout hoặc page components
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn Component
 *
 * Mục đích: Animation fade-in đơn giản
 */
export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.4,
  className = ''
}: { 
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn Component
 *
 * Mục đích: Slide in từ các hướng khác nhau
 */
export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  className = ''
}: { 
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const directionOffset = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directionOffset[direction]
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        delay, 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn Component
 *
 * Mục đích: Scale animation cho modals, popups
 */
export function ScaleIn({ 
  children, 
  className = '' 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: 0.2, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerChildren Component
 *
 * Mục đích: Animate children với stagger effect
 */
export function StaggerChildren({ 
  children,
  staggerDelay = 0.1,
  className = ''
}: { 
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem Component
 *
 * Mục đích: Item con cho StaggerChildren
 */
export function StaggerItem({ 
  children,
  className = ''
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.3 }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Re-export AnimatePresence for convenience
export { AnimatePresence };

'use client';

import { motion } from 'framer-motion';

/**
 * Skeleton Loading Components
 *
 * Mục đích: Hiển thị loading placeholder khi đang fetch AI responses
 */

/**
 * SkeletonPulse - Base animation
 */
function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-muted/60 rounded ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/**
 * SkeletonText - Cho loading text
 */
export function SkeletonText({ 
  lines = 3,
  className = ''
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse 
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Cho loading card content
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-xl bg-card border space-y-4 ${className}`}>
      <SkeletonPulse className="h-6 w-1/3" />
      <SkeletonText lines={4} />
      <div className="flex gap-2 pt-2">
        <SkeletonPulse className="h-10 w-24 rounded-lg" />
        <SkeletonPulse className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * SkeletonConversation - Cho loading hội thoại
 */
export function SkeletonConversation({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          className={`p-4 rounded-lg ${i % 2 === 0 ? 'ml-8' : 'mr-8'}`}
        >
          <SkeletonPulse className="h-6 w-20 mb-2 rounded-full" />
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonArticle - Cho loading bài đọc
 */
export function SkeletonArticle({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <SkeletonPulse className="h-8 w-2/3" />
      <SkeletonText lines={6} />
      <SkeletonPulse className="h-px w-full my-4" />
      <SkeletonText lines={4} />
    </div>
  );
}

/**
 * LoadingDots - Animated loading dots
 */
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * AIThinking - Animation khi AI đang "suy nghĩ"
 */
export function AIThinking({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/50 to-primary flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <span className="text-sm">🤖</span>
      </motion.div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">AI đang suy nghĩ</span>
        <LoadingDots />
      </div>
    </div>
  );
}

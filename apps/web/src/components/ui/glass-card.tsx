'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'glow' | 'gradient-border';
  hover?: 'lift' | 'scale' | 'glow' | 'none';
}

/**
 * GlassCard Component
 *
 * Mục đích: Card với hiệu ứng glassmorphism đẹp mắt
 * Tham số:
 *   - variant: Kiểu hiển thị (default, glow, gradient-border)
 *   - hover: Hiệu ứng hover (lift, scale, glow, none)
 * Khi nào sử dụng: Thay thế Card bình thường để tạo premium look
 */
export function GlassCard({
  children,
  variant = 'default',
  hover = 'lift',
  className = '',
  ...props
}: GlassCardProps) {
  const baseClasses = 'rounded-xl p-6';
  
  const variantClasses = {
    default: 'glass-card',
    glow: 'glass-card shadow-glow',
    'gradient-border': 'glass-card gradient-border',
  };

  const hoverClasses = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    glow: 'glow-button',
    none: '',
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hover]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * FloatingCard Component
 *
 * Mục đích: Card với animation floating nhẹ
 */
export function FloatingCard({
  children,
  className = '',
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div
      className={`glass-card rounded-xl p-6 subtle-float ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * GradientBackground Component
 *
 * Mục đích: Background với gradient mesh đẹp mắt
 */
export function GradientBackground({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen gradient-mesh ${className}`}>
      {children}
    </div>
  );
}

/**
 * GlowButton Component
 *
 * Mục đích: Button với hiệu ứng glow
 */
export function GlowButton({
  children,
  className = '',
  ...props
}: HTMLMotionProps<'button'> & { children: ReactNode }) {
  return (
    <motion.button
      className={`px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium glow-button ripple-effect ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * GradientText Component
 *
 * Mục đích: Text với gradient màu đep mắt
 */
export function GradientText({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-gradient ${className}`}>
      {children}
    </span>
  );
}

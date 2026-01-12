'use client';

import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  isRecording: boolean;
  className?: string;
}

/**
 * WaveformVisualizer
 * 
 * Component hiển thị sóng âm thanh hoạt hình.
 * - Khi isRecording = true: Sóng dao động mạnh.
 * - Khi isRecording = false: Sóng dao động nhẹ (idle).
 */
export function WaveformVisualizer({ isRecording, className = '' }: WaveformVisualizerProps) {
  // Tạo 20 thanh sóng giả lập
  const bars = Array.from({ length: 40 });

  return (
    <div className={`flex items-center justify-center h-32 gap-[2px] ${className}`}>
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-[4px] rounded-full ${
            isRecording 
              ? 'bg-gradient-to-t from-green-500 to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
              : 'bg-primary/20'
          }`}
          animate={{
            height: isRecording 
              ? [10, Math.random() * 60 + 20, 10] // Animation ngẫu nhiên khi record
              : [8, 12, 8], // Animation nhẹ nhàng khi idle
          }}
          transition={{
            duration: isRecording ? 0.4 : 1.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
      ))}
    </div>
  );
}

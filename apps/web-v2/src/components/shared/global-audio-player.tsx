"use client"

/**
 * global-audio-player.tsx - Global audio player orchestrator
 * 
 * Mục đích: Điều phối hiển thị audio player dựa trên mode
 * 
 * UNIFIED PLAYER APPROACH:
 * - Một player duy nhất cho TẤT CẢ pages (bao gồm Listening)
 * - Player nằm trong layout flow, không dùng fixed position
 * - Content tự động shrink khi player hiển thị
 * - Slide up/down animation khi show/hide
 * 
 * 2 modes:
 * - Compact: Default player với đầy đủ controls
 * - Minimized: Floating pill, shown when user minimizes
 * 
 * HYDRATION FIX:
 * - CompactPlayer và MinimizedPlayer được dynamic import với ssr: false
 * - Tránh hydration mismatch do Radix UI DropdownMenu sinh ID khác nhau giữa server/client
 * 
 * Luồng sử dụng:
 * - Được import và render trong MainLayout
 * - Hiển thị trên TẤT CẢ pages khi có audio active
 */

import * as React from "react"
import dynamic from "next/dynamic"
import { useAudioPlayerStore, selectIsActive } from "@/stores/audio-player-store"

// ============================================
// DYNAMIC IMPORTS (ssr: false để tránh hydration mismatch)
// Radix UI DropdownMenu sinh random ID, không khớp giữa server và client
// ============================================

const CompactPlayer = dynamic(
  () => import('./compact-player').then(mod => mod.CompactPlayer),
  { ssr: false }
)

const MinimizedPlayer = dynamic(
  () => import('./minimized-player').then(mod => mod.MinimizedPlayer),
  { ssr: false }
)

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * GlobalAudioPlayer - Unified Audio Player Component
 * 
 * Render duy nhất trong MainLayout, hiển thị trên tất cả pages
 * - isActive: có audio đang được load không
 * - mode: 'compact' (default) hoặc 'minimized' (user click minimize)
 */
export function GlobalAudioPlayer() {
  // Store state
  const isActive = useAudioPlayerStore(selectIsActive)
  const mode = useAudioPlayerStore((s) => s.mode)
  
  // Minimized mode uses fixed position (floating pill)
  if (mode === 'minimized' && isActive) {
    return <MinimizedPlayer />
  }
  
  // Compact mode (default) - Layout footer with slide animation
  // Render on ALL pages including Listening page
  return <CompactPlayer isVisible={isActive} />
}

export default GlobalAudioPlayer


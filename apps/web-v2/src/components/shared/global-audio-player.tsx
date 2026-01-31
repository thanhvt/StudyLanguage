"use client"

/**
 * global-audio-player.tsx - Global audio player orchestrator
 * 
 * Mục đích: Điều phối hiển thị audio player dựa trên mode và page
 * 
 * LAYOUT FOOTER APPROACH:
 * - Player nằm trong layout flow, không dùng fixed position
 * - Content tự động shrink khi player hiển thị
 * - Slide up/down animation khi show/hide
 * 
 * 3 modes:
 * - Full: Full controls, shown on Listening page (không render global player)
 * - Compact: Mini player with progress, shown on other pages
 * - Minimized: Floating pill, shown when user minimizes
 * 
 * HYDRATION FIX:
 * - CompactPlayer và MinimizedPlayer được dynamic import với ssr: false
 * - Tránh hydration mismatch do Radix UI DropdownMenu sinh ID khác nhau giữa server/client
 * 
 * Luồng sử dụng:
 * - Được import và render trong MainLayout
 * - Auto-switch mode dựa trên pathname
 */

import * as React from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useAudioPlayerStore, selectIsActive, type PlayerMode } from "@/stores/audio-player-store"

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

export function GlobalAudioPlayer() {
  const pathname = usePathname()
  
  // Store state
  const isActive = useAudioPlayerStore(selectIsActive)
  const mode = useAudioPlayerStore((s) => s.mode)
  const setMode = useAudioPlayerStore((s) => s.setMode)
  
  // Auto-switch mode based on page
  React.useEffect(() => {
    if (pathname === '/listening') {
      setMode('full')
    } else if (mode === 'full') {
      setMode('compact')
    }
  }, [pathname, mode, setMode])
  
  // Minimized mode still uses fixed position (floating pill)
  if (mode === 'minimized' && isActive) {
    return <MinimizedPlayer />
  }
  
  // Full mode - Listening page has its own player, don't render
  if (mode === 'full') {
    return null
  }
  
  // Compact mode - Layout footer with slide animation
  return <CompactPlayer isVisible={isActive} />
}

export default GlobalAudioPlayer

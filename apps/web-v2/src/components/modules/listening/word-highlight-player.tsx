'use client'

/**
 * WordHighlightPlayer - Component highlight từ khi audio đang phát
 *
 * Mục đích: Hiển thị text và highlight từng từ theo word timestamps từ Azure TTS
 * Tham số đầu vào:
 *   - text: Văn bản cần hiển thị
 *   - wordTimestamps: Array WordTimestamp từ Azure TTS
 *   - audioCurrentTime: Thời gian hiện tại của audio player (giây)
 *   - isPlaying: Audio có đang phát không
 *   - speaker: Tên người nói (hiển thị label)
 * Tham số đầu ra: UI component với highlight animation
 * Khi nào sử dụng: Trong Listening module khi phát audio có word timestamps
 */

import * as React from 'react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { WordTimestamp } from '@/types/listening-types'

// ============================================
// COMPONENT PROPS
// ============================================

interface WordHighlightPlayerProps {
  /** Văn bản gốc để hiển thị */
  text: string
  /** Word timestamps từ Azure TTS */
  wordTimestamps?: WordTimestamp[]
  /** Thời gian hiện tại của audio (giây) */
  audioCurrentTime: number
  /** Audio có đang phát không */
  isPlaying: boolean
  /** Tên người nói */
  speaker?: string
  /** Custom class */
  className?: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WordHighlightPlayer({
  text,
  wordTimestamps,
  audioCurrentTime,
  isPlaying,
  speaker,
  className,
}: WordHighlightPlayerProps) {
  // Nếu không có word timestamps → render text bình thường
  if (!wordTimestamps || wordTimestamps.length === 0) {
    return (
      <div className={cn('p-4 rounded-lg bg-muted/50', className)}>
        {speaker && (
          <span className="text-xs font-semibold text-primary mb-1 block">
            {speaker}
          </span>
        )}
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    )
  }

  return (
    <div className={cn('p-4 rounded-lg bg-muted/50', className)}>
      {speaker && (
        <span className="text-xs font-semibold text-primary mb-1 block">
          {speaker}
        </span>
      )}
      <p className="text-sm leading-relaxed">
        {wordTimestamps.map((wt, index) => (
          <HighlightedWord
            key={`${wt.word}-${index}`}
            word={wt.word}
            startTime={wt.startTime}
            endTime={wt.endTime}
            audioCurrentTime={audioCurrentTime}
            isPlaying={isPlaying}
          />
        ))}
      </p>
    </div>
  )
}

// ============================================
// HIGHLIGHTED WORD COMPONENT
// ============================================

interface HighlightedWordProps {
  word: string
  startTime: number
  endTime: number
  audioCurrentTime: number
  isPlaying: boolean
}

function HighlightedWord({
  word,
  startTime,
  endTime,
  audioCurrentTime,
  isPlaying,
}: HighlightedWordProps) {
  // Xác định trạng thái highlight
  const status = useMemo(() => {
    if (!isPlaying) return 'idle'
    if (audioCurrentTime >= startTime && audioCurrentTime < endTime) return 'active'
    if (audioCurrentTime >= endTime) return 'past'
    return 'upcoming'
  }, [audioCurrentTime, startTime, endTime, isPlaying])

  return (
    <span
      className={cn(
        'inline transition-all duration-200 ease-out',
        {
          // Từ đang được đọc → highlight nổi bật
          'bg-primary/20 text-primary font-semibold rounded px-0.5 scale-105': status === 'active',
          // Từ đã đọc → mờ nhẹ
          'text-foreground/80': status === 'past',
          // Từ chưa đọc → bình thường
          'text-foreground/60': status === 'upcoming',
          // Không phát → bình thường  
          'text-foreground': status === 'idle',
        }
      )}
    >
      {word}{' '}
    </span>
  )
}

// ============================================
// CONVERSATION HIGHLIGHT PLAYER
// ============================================

interface ConversationHighlightPlayerProps {
  /** Danh sách câu hội thoại */
  conversation: { speaker: string; text: string }[]
  /** Word timestamps theo câu (2D array) */
  wordTimestamps?: WordTimestamp[][]
  /** Sentence timestamps */
  timestamps?: { startTime: number; endTime: number }[]
  /** Thời gian hiện tại audio */
  audioCurrentTime: number
  /** Audio đang phát */
  isPlaying: boolean
  /** Custom class */
  className?: string
}

/**
 * ConversationHighlightPlayer - Highlight cho toàn bộ conversation
 *
 * Mục đích: Kết hợp nhiều WordHighlightPlayer cho mỗi câu trong conversation
 * Tham số đầu vào: Conversation lines + word timestamps + audio time
 * Tham số đầu ra: UI component với scroll-to-active
 * Khi nào sử dụng: Listening module hiển thị conversation đang phát
 */
export function ConversationHighlightPlayer({
  conversation,
  wordTimestamps,
  timestamps,
  audioCurrentTime,
  isPlaying,
  className,
}: ConversationHighlightPlayerProps) {
  // Xác định câu đang active
  const activeLineIndex = useMemo(() => {
    if (!timestamps || !isPlaying) return -1
    return timestamps.findIndex(
      t => audioCurrentTime >= t.startTime && audioCurrentTime < t.endTime
    )
  }, [timestamps, audioCurrentTime, isPlaying])

  // Auto-scroll đến câu đang active
  const activeRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (activeRef.current && activeLineIndex >= 0) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLineIndex])

  return (
    <div className={cn('space-y-2 max-h-[400px] overflow-y-auto', className)}>
      {conversation.map((line, index) => {
        const isActive = index === activeLineIndex
        const isPast = timestamps
          ? audioCurrentTime >= (timestamps[index]?.endTime || Infinity)
          : false

        return (
          <div
            key={index}
            ref={isActive ? activeRef : undefined}
            className={cn(
              'transition-all duration-300',
              {
                'ring-2 ring-primary/30 shadow-sm': isActive,
                'opacity-60': isPast && !isActive,
              }
            )}
          >
            <WordHighlightPlayer
              text={line.text}
              wordTimestamps={wordTimestamps?.[index]}
              audioCurrentTime={audioCurrentTime}
              isPlaying={isPlaying}
              speaker={line.speaker}
            />
          </div>
        )
      })}
    </div>
  )
}

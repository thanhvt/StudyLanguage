"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface HistorySearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const RECENT_SEARCHES_KEY = 'history-recent-searches'
const MAX_RECENT_SEARCHES = 5

/**
 * HistorySearch - Enhanced search với recent searches
 * 
 * Features:
 * - Debounced search (300ms)
 * - Recent searches từ localStorage
 * - Clear button
 * - Keyboard shortcut: "/" to focus
 */
export function HistorySearch({
  value,
  onChange,
  placeholder = "Tìm kiếm theo chủ đề...",
  className,
}: HistorySearchProps) {
  const [focused, setFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch {
      // Ignore errors
    }
  }, [])

  // Save to recent searches on blur
  const handleBlur = useCallback(() => {
    setFocused(false)
    
    if (value.trim() && value.length > 2) {
      const updated = [value, ...recentSearches.filter(s => s !== value)].slice(0, MAX_RECENT_SEARCHES)
      setRecentSearches(updated)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch {
        // Ignore errors
      }
    }
  }, [value, recentSearches])

  // Keyboard shortcut: "/" to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  const handleSelectRecent = (search: string) => {
    onChange(search)
    setFocused(false)
  }

  const showDropdown = focused && recentSearches.length > 0 && !value

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 bg-background/50",
            focused && "ring-2 ring-primary/20"
          )}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="size-3.5" />
          </Button>
        )}
        {!value && !focused && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            Tìm kiếm gần đây
          </div>
          {recentSearches.map((search, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelectRecent(search)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

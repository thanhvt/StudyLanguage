import { createClient } from '@/lib/supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Get access token from Supabase session
 */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/**
 * Redirect to login page (client-side only)
 */
function redirectToLogin() {
  if (typeof window !== 'undefined') {
    console.warn('[API] Redirecting to login...')
    window.location.href = '/login'
  }
}

/**
 * Refresh session and get new token
 */
async function refreshAndGetToken(): Promise<string | null> {
  const supabase = createClient()
  
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  if (!currentSession) {
    console.debug('[API] Not logged in, skipping refresh')
    return null
  }
  
  const { data: { session }, error } = await supabase.auth.refreshSession()
  
  if (error) {
    console.warn('[API] Session refresh failed:', error.message)
    // Check for refresh token errors - redirect to login
    if (error.message?.toLowerCase().includes('refresh token') || 
        error.message?.toLowerCase().includes('invalid') ||
        error.code === 'refresh_token_not_found') {
      redirectToLogin()
    }
    return null
  }
  
  return session?.access_token ?? null
}

/**
 * API client with authentication and retry logic
 * 
 * @param endpoint - API endpoint (e.g., '/ai/generate-conversation')
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 60s)
 */
export async function api(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 60000,
  _isRetry = false
): Promise<Response> {
  const token = await getAccessToken()

  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const url = `${API_BASE_URL}${endpoint}`
  console.log(`[API] ${options.method || 'GET'} ${url}`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
    console.warn(`[API] Request timeout after ${timeoutMs / 1000}s`)
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle 401 - try refresh and retry once
    if (response.status === 401 && !_isRetry) {
      console.warn('[API] Token expired, attempting refresh...')
      
      const newToken = await refreshAndGetToken()
      
      if (newToken) {
        console.log('[API] Refresh successful, retrying request...')
        return api(endpoint, options, timeoutMs, true)
      }
      
      console.error('[API] Refresh failed, redirecting to login...')
      redirectToLogin()
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[API] Request aborted (timeout or cancelled)')
        throw new Error('Connection timeout. Please try again.')
      }
      if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
        console.error('[API] Network error:', error.message)
        throw new Error('Network error. Check your connection and try again.')
      }
    }
    throw error
  }
}

/**
 * API client that returns JSON
 */
export async function apiJson<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 60000
): Promise<T> {
  const response = await api(endpoint, options, timeoutMs)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }

  return response.json() as Promise<T>
}

// ============================================
// LISTENING API FUNCTIONS
// ============================================

import type { 
  GenerateConversationRequest, 
  GenerateConversationResponse,
  GenerateAudioResponse,
  ConversationLine 
} from '@/types/listening-types'

/**
 * Generate a conversation using AI
 */
export async function generateConversation(
  request: GenerateConversationRequest
): Promise<GenerateConversationResponse> {
  return apiJson<GenerateConversationResponse>(
    '/ai/generate-conversation',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    90000 // 90s timeout for generation
  )
}

/**
 * Generate audio for a conversation (TTS)
 */
export async function generateConversationAudio(
  conversation: ConversationLine[]
): Promise<GenerateAudioResponse> {
  return apiJson<GenerateAudioResponse>(
    '/ai/generate-conversation-audio',
    {
      method: 'POST',
      body: JSON.stringify({
        conversation: conversation.map(line => ({
          speaker: line.speaker,
          text: line.text,
        })),
      }),
    },
    180000 // 3 minute timeout for audio generation
  )
}

/**
 * Transcribe audio to text (STT)
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')

  const response = await api('/ai/transcribe', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  return response.json()
}

/**
 * Text to Speech - single text
 */
export async function textToSpeech(
  text: string, 
  voice: 'alloy' | 'nova' | 'onyx' = 'alloy'
): Promise<{ audioUrl: string }> {
  return apiJson<{ audioUrl: string }>(
    '/ai/text-to-speech',
    {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
    }
  )
}

// ============================================
// RADIO MODE API FUNCTIONS
// ============================================

export interface RadioPlaylistItem {
  id: string
  topic: string
  conversation: { speaker: string; text: string }[]
  duration: number
  numSpeakers: number
  category: string
  subCategory: string
  position: number
}

export interface RadioPlaylistResult {
  playlist: {
    id: string
    name: string
    description: string
    duration: number
    trackCount: number
  }
  items: RadioPlaylistItem[]
}

/**
 * Generate a radio playlist with random topics
 * Requires authentication
 */
export async function generateRadioPlaylist(
  duration: number
): Promise<RadioPlaylistResult> {
  const response = await apiJson<{ success: boolean; data: RadioPlaylistResult }>(
    '/radio/generate',
    {
      method: 'POST',
      body: JSON.stringify({ duration }),
    },
    300000 // 5 minutes timeout for generating multiple tracks
  )
  return response.data
}

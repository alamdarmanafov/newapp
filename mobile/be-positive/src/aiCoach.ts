import { API_BASE_URL } from './config'
import type { MoodKey } from './types'

const REQUEST_TIMEOUT_MS = 12000

// Calls the /api/coach backend (Gemini-powered). Returns null on any failure
// (network, timeout, missing server key, bad response) so the caller can
// fall back to the local rule-based coach in coach.ts.
export async function fetchAiCoachMessage(
  mood: MoodKey,
  note: string,
  gratitude: string
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, note, gratitude }),
      signal: controller.signal,
    })

    if (!response.ok) return null

    const data = (await response.json()) as { message?: string }
    return typeof data.message === 'string' && data.message.trim().length > 0 ? data.message.trim() : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

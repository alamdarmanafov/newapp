import AsyncStorage from '@react-native-async-storage/async-storage'
import type { JournalEntry } from './types'

const ENTRIES_KEY = 'be-positive/entries'

export async function loadEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY)
    return raw ? (JSON.parse(raw) as JournalEntry[]) : []
  } catch {
    return []
  }
}

export async function saveEntry(entry: JournalEntry): Promise<JournalEntry[]> {
  const entries = await loadEntries()
  const updated = [entry, ...entries]
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated))
  return updated
}

export async function updateEntry(updated: JournalEntry): Promise<JournalEntry[]> {
  const entries = await loadEntries()
  const next = entries.map((entry) => (entry.id === updated.id ? updated : entry))
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(next))
  return next
}

export async function deleteEntry(id: string): Promise<JournalEntry[]> {
  const entries = await loadEntries()
  const updated = entries.filter((entry) => entry.id !== id)
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated))
  return updated
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

// Consecutive-day streak ending today or yesterday (a gap of one day today
// doesn't break a streak that was kept up through yesterday).
export function computeStreak(entries: JournalEntry[]): number {
  const days = new Set(entries.map((entry) => dayKey(entry.createdAt)))
  if (days.size === 0) return 0

  const cursor = new Date()
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor.toISOString()))) return 0
  }

  let streak = 0
  while (days.has(dayKey(cursor.toISOString()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

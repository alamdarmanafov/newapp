import AsyncStorage from '@react-native-async-storage/async-storage'
import type { JournalEntry } from './types'

const LEGACY_ENTRIES_KEY = 'be-positive/entries'

export function entriesKey(userId: string) {
  return `be-positive/entries/${userId}`
}

// One-time migration for entries saved before entries were scoped per
// account: move them onto the first signed-in user's key, then clear the
// old shared key so they don't also leak into other accounts on this device.
async function migrateLegacyEntries(userId: string): Promise<void> {
  const legacyRaw = await AsyncStorage.getItem(LEGACY_ENTRIES_KEY)
  if (!legacyRaw) return

  const ownKey = entriesKey(userId)
  const existing = await AsyncStorage.getItem(ownKey)
  if (!existing) {
    await AsyncStorage.setItem(ownKey, legacyRaw)
  }
  await AsyncStorage.removeItem(LEGACY_ENTRIES_KEY)
}

export async function loadEntries(userId: string): Promise<JournalEntry[]> {
  try {
    await migrateLegacyEntries(userId)
    const raw = await AsyncStorage.getItem(entriesKey(userId))
    return raw ? (JSON.parse(raw) as JournalEntry[]) : []
  } catch {
    return []
  }
}

export async function saveEntry(entry: JournalEntry, userId: string): Promise<JournalEntry[]> {
  const entries = await loadEntries(userId)
  const updated = [entry, ...entries]
  await AsyncStorage.setItem(entriesKey(userId), JSON.stringify(updated))
  return updated
}

export async function updateEntry(updated: JournalEntry, userId: string): Promise<JournalEntry[]> {
  const entries = await loadEntries(userId)
  const next = entries.map((entry) => (entry.id === updated.id ? updated : entry))
  await AsyncStorage.setItem(entriesKey(userId), JSON.stringify(next))
  return next
}

export async function deleteEntry(id: string, userId: string): Promise<JournalEntry[]> {
  const entries = await loadEntries(userId)
  const updated = entries.filter((entry) => entry.id !== id)
  await AsyncStorage.setItem(entriesKey(userId), JSON.stringify(updated))
  return updated
}

export function dayKey(iso: string) {
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

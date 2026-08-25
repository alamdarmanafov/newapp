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

export async function deleteEntry(id: string): Promise<JournalEntry[]> {
  const entries = await loadEntries()
  const updated = entries.filter((entry) => entry.id !== id)
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated))
  return updated
}

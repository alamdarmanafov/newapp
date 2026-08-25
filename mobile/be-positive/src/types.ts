export type MoodKey = 'terrible' | 'bad' | 'okay' | 'good' | 'great'

export interface MoodOption {
  key: MoodKey
  emoji: string
  label: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  { key: 'terrible', emoji: '😞', label: 'Pis' },
  { key: 'bad', emoji: '😕', label: 'Narahat' },
  { key: 'okay', emoji: '😐', label: 'Normal' },
  { key: 'good', emoji: '🙂', label: 'Yaxşı' },
  { key: 'great', emoji: '😄', label: 'Əla' },
]

export interface JournalEntry {
  id: string
  createdAt: string
  mood: MoodKey
  note: string
  gratitude: string
  coachMessage: string
}

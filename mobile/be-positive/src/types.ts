export type MoodKey = 'terrible' | 'bad' | 'okay' | 'good' | 'great'

export interface MoodOption {
  key: MoodKey
  emoji: string
  label: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  { key: 'terrible', emoji: '😔', label: 'Çətin' },
  { key: 'bad', emoji: '😕', label: 'Zəif' },
  { key: 'okay', emoji: '😐', label: 'Normal' },
  { key: 'good', emoji: '🙂', label: 'Yaxşı' },
  { key: 'great', emoji: '😄', label: 'Əla' },
]

export const FACTOR_OPTIONS: { emoji: string; label: string }[] = [
  { emoji: '😴', label: 'Yuxu' },
  { emoji: '💼', label: 'İş' },
  { emoji: '🏃', label: 'İdman' },
  { emoji: '👥', label: 'Dostlar' },
  { emoji: '🏠', label: 'Ailə' },
  { emoji: '☕️', label: 'Kofe' },
  { emoji: '📱', label: 'Ekran vaxtı' },
  { emoji: '🎧', label: 'Musiqi' },
  { emoji: '🌧', label: 'Hava' },
  { emoji: '💪', label: 'Sağlamlıq' },
  { emoji: '💸', label: 'Pul' },
  { emoji: '✈️', label: 'Səyahət' },
]

export interface JournalEntry {
  id: string
  createdAt: string
  mood: MoodKey
  factors: string[]
  note: string
  gratitude: string
  coachMessage: string
}

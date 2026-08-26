export type MoodKey = 'terrible' | 'bad' | 'okay' | 'good' | 'great'

export interface JournalEntry {
  id: string
  createdAt: string
  mood: MoodKey
  factors: string[]
  note: string
  gratitude: string
  coachMessage: string
}

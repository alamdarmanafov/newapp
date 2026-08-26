import type { MoodKey } from '../types'

export type Locale = 'az' | 'en'

export interface LocaleOption {
  code: Locale
  name: string
}

// Add new languages here — the Profile language picker renders this list.
export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
]

export const MOOD_META: Record<MoodKey, { emoji: string; az: string; en: string }> = {
  terrible: { emoji: '😔', az: 'Çətin', en: 'Terrible' },
  bad: { emoji: '😕', az: 'Zəif', en: 'Bad' },
  okay: { emoji: '😐', az: 'Normal', en: 'Okay' },
  good: { emoji: '🙂', az: 'Yaxşı', en: 'Good' },
  great: { emoji: '😄', az: 'Əla', en: 'Great' },
}

export const MOOD_ORDER: MoodKey[] = ['terrible', 'bad', 'okay', 'good', 'great']

// Moods are picked from 5 discrete options (index 0-4), but scores are shown
// to users on a 10-point scale: each mood step is worth 2 points.
export const MOOD_SCORE_SCALE = 2

export function moodScore(avgIndex: number): number {
  return (avgIndex + 1) * MOOD_SCORE_SCALE
}

export interface FactorDef {
  id: string
  emoji: string
  az: string
  en: string
}

export const FACTOR_DEFS: FactorDef[] = [
  { id: 'sleep', emoji: '😴', az: 'Yuxu', en: 'Sleep' },
  { id: 'work', emoji: '💼', az: 'İş', en: 'Work' },
  { id: 'sport', emoji: '🏃', az: 'İdman', en: 'Exercise' },
  { id: 'friends', emoji: '👥', az: 'Dostlar', en: 'Friends' },
  { id: 'family', emoji: '🏠', az: 'Ailə', en: 'Family' },
  { id: 'coffee', emoji: '☕️', az: 'Kofe', en: 'Coffee' },
  { id: 'screenTime', emoji: '📱', az: 'Ekran vaxtı', en: 'Screen time' },
  { id: 'music', emoji: '🎧', az: 'Musiqi', en: 'Music' },
  { id: 'weather', emoji: '🌧', az: 'Hava', en: 'Weather' },
  { id: 'health', emoji: '💪', az: 'Sağlamlıq', en: 'Health' },
  { id: 'money', emoji: '💸', az: 'Pul', en: 'Money' },
  { id: 'travel', emoji: '✈️', az: 'Səyahət', en: 'Travel' },
]

export interface PlaceCategoryDef {
  id: string
  emoji: string
  az: string
  en: string
}

export const PLACE_CATEGORIES: PlaceCategoryDef[] = [
  { id: 'gym', emoji: '🏋️', az: 'İdman zalı', en: 'Gym' },
  { id: 'restaurant', emoji: '🍽️', az: 'Restoran', en: 'Restaurant' },
  { id: 'cafe', emoji: '☕️', az: 'Kafe', en: 'Cafe' },
  { id: 'work', emoji: '💼', az: 'İş', en: 'Work' },
  { id: 'park', emoji: '🌳', az: 'Park', en: 'Park' },
  { id: 'other', emoji: '📍', az: 'Digər', en: 'Other' },
]

export function placeCategoryLabel(id: string, locale: Locale): string {
  return PLACE_CATEGORIES.find((c) => c.id === id)?.[locale] ?? id
}

export interface TimeOfDayBucket {
  id: string
  emoji: string
  az: string
  en: string
  startHour: number
  endHour: number
}

// endHour <= startHour wraps past midnight (e.g. night: 22 -> 6).
export const TIME_OF_DAY_BUCKETS: TimeOfDayBucket[] = [
  { id: 'morning', emoji: '🌅', az: 'Səhər', en: 'Morning', startHour: 6, endHour: 12 },
  { id: 'afternoon', emoji: '☀️', az: 'Günorta', en: 'Afternoon', startHour: 12, endHour: 17 },
  { id: 'evening', emoji: '🌇', az: 'Axşam', en: 'Evening', startHour: 17, endHour: 22 },
  { id: 'night', emoji: '🌙', az: 'Gecə', en: 'Night', startHour: 22, endHour: 6 },
]

export function timeOfDayBucketForHour(hour: number): TimeOfDayBucket {
  const match = TIME_OF_DAY_BUCKETS.find((b) =>
    b.startHour < b.endHour ? hour >= b.startHour && hour < b.endHour : hour >= b.startHour || hour < b.endHour
  )
  return match ?? TIME_OF_DAY_BUCKETS[3]
}

export function moodLabel(key: MoodKey, locale: Locale): string {
  return MOOD_META[key][locale]
}

export function factorLabel(id: string, locale: Locale): string {
  return FACTOR_DEFS.find((f) => f.id === id)?.[locale] ?? id
}

export function factorEmoji(id: string): string {
  return FACTOR_DEFS.find((f) => f.id === id)?.emoji ?? ''
}

export const DAY_LABELS: Record<Locale, string[]> = {
  az: ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}

export const MONTH_NAMES: Record<Locale, string[]> = {
  az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}

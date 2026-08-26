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

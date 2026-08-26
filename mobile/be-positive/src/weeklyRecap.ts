import * as Notifications from 'expo-notifications'
import { factorLabel, MOOD_ORDER, type Locale } from './i18n/content'
import type { JournalEntry } from './types'

const WEEKLY_RECAP_ID = 'weekly-recap'

const FULL_DAY_NAMES: Record<Locale, string[]> = {
  az: ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
}

const FALLBACK: Record<Locale, { title: string; body: string }> = {
  az: { title: 'Həftəlik icmal', body: 'Bu həftə necə keçdi? İçgörü tabından bax.' },
  en: { title: 'Weekly recap', body: 'How was your week? Check the Insights tab.' },
}

function moodIndex(entry: JournalEntry) {
  return MOOD_ORDER.indexOf(entry.mood)
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function buildWeeklyRecap(entries: JournalEntry[], locale: Locale): { title: string; body: string } {
  const weekStart = startOfDay(new Date())
  weekStart.setDate(weekStart.getDate() - 6)

  const weekEntries = entries.filter((entry) => startOfDay(new Date(entry.createdAt)) >= weekStart)
  if (weekEntries.length < 2) return FALLBACK[locale]

  const byDow = new Map<number, { sum: number; count: number }>()
  for (const entry of weekEntries) {
    const dow = new Date(entry.createdAt).getDay()
    const current = byDow.get(dow) ?? { sum: 0, count: 0 }
    current.sum += moodIndex(entry)
    current.count += 1
    byDow.set(dow, current)
  }

  let bestDow = 1
  let bestAvg = -Infinity
  for (const [dow, stat] of byDow) {
    const avg = stat.sum / stat.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestDow = dow
    }
  }
  const dayName = FULL_DAY_NAMES[locale][bestDow === 0 ? 6 : bestDow - 1]

  const factorCounts = new Map<string, number>()
  for (const entry of weekEntries) {
    for (const factor of entry.factors ?? []) {
      factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1)
    }
  }
  let topFactor: string | null = null
  let topCount = 0
  for (const [factor, count] of factorCounts) {
    if (count > topCount) {
      topCount = count
      topFactor = factor
    }
  }

  const title = locale === 'az' ? 'Həftəlik icmal' : 'Weekly recap'
  const body = topFactor
    ? locale === 'az'
      ? `Bu həftə ${dayName} günü ən yaxşı əhvalın olub, əsasən ${factorLabel(topFactor, locale)} sayəsində.`
      : `This week you felt best on ${dayName}s, mostly thanks to ${factorLabel(topFactor, locale)}.`
    : locale === 'az'
      ? `Bu həftə ${dayName} günü ən yaxşı əhvalın olub.`
      : `This week you felt best on ${dayName}s.`

  return { title, body }
}

function nextSundayEvening(): Date {
  const now = new Date()
  const target = new Date(now)
  const daysUntilSunday = (7 - now.getDay()) % 7
  target.setDate(now.getDate() + daysUntilSunday)
  target.setHours(20, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 7)
  return target
}

export async function scheduleWeeklyRecap(entries: JournalEntry[], locale: Locale): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') return

  await Notifications.cancelScheduledNotificationAsync(WEEKLY_RECAP_ID).catch(() => {})

  const { title, body } = buildWeeklyRecap(entries, locale)

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_RECAP_ID,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextSundayEvening() },
  })
}

export async function cancelWeeklyRecap(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_RECAP_ID).catch(() => {})
}

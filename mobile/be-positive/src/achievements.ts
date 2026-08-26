import { ACHIEVEMENT_DEFS, MOOD_ORDER, timeOfDayBucketForHour, type AchievementDef } from './i18n/content'
import type { MyPlaceCategoryStat } from './places'
import { computeStreak, dayKey } from './storage'
import type { JournalEntry } from './types'

function moodIndex(entry: JournalEntry) {
  return MOOD_ORDER.indexOf(entry.mood)
}

export interface AchievementValues {
  entries: number
  streak: number
  places: number
  factors: number
  goodDays: number
  placeCategories: number
}

export function computeAchievementValues(entries: JournalEntry[], placeStats: MyPlaceCategoryStat[]): AchievementValues {
  const streak = computeStreak(entries)
  const places = placeStats.reduce((sum, s) => sum + s.count, 0)
  const factors = new Set(entries.flatMap((e) => e.factors ?? [])).size
  const goodDays = new Set(entries.filter((e) => moodIndex(e) >= 3).map((e) => dayKey(e.createdAt))).size
  const placeCategories = placeStats.length
  return { entries: entries.length, streak, places, factors, goodDays, placeCategories }
}

export function computeTimeOfDayCounts(entries: JournalEntry[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    const bucket = timeOfDayBucketForHour(new Date(entry.createdAt).getHours())
    counts.set(bucket.id, (counts.get(bucket.id) ?? 0) + 1)
  }
  return counts
}

export function isAchievementUnlocked(
  achievement: AchievementDef,
  values: AchievementValues,
  timeOfDayCounts: Map<string, number>
): boolean {
  if (achievement.metric === 'timeOfDay') {
    return (timeOfDayCounts.get(achievement.bucket ?? '') ?? 0) >= achievement.threshold
  }
  return values[achievement.metric] >= achievement.threshold
}

export function countUnlockedAchievements(entries: JournalEntry[], placeStats: MyPlaceCategoryStat[]): number {
  const values = computeAchievementValues(entries, placeStats)
  const timeOfDayCounts = computeTimeOfDayCounts(entries)
  return ACHIEVEMENT_DEFS.filter((a) => isAchievementUnlocked(a, values, timeOfDayCounts)).length
}

import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import { ACHIEVEMENT_DEFS, MOOD_ORDER, timeOfDayBucketForHour, type AchievementDef } from '../i18n/content'
import type { MyPlaceCategoryStat } from '../places'
import { computeStreak, dayKey } from '../storage'
import { colors, radius, shadow } from '../theme'
import type { TranslationKey } from '../i18n/translations'

interface AchievementsSectionProps {
  entries: JournalEntry[]
  placeStats: MyPlaceCategoryStat[]
}

const METRIC_KEY: Record<AchievementDef['metric'], TranslationKey> = {
  entries: 'achievements.metricEntries',
  streak: 'achievements.metricStreak',
  places: 'achievements.metricPlaces',
  factors: 'achievements.metricFactors',
  goodDays: 'achievements.metricGoodDays',
  timeOfDay: 'achievements.metricTimeOfDay',
  placeCategories: 'achievements.metricPlaceCategories',
}

function moodIndex(entry: JournalEntry) {
  return MOOD_ORDER.indexOf(entry.mood)
}

function isUnlocked(
  achievement: AchievementDef,
  values: { entries: number; streak: number; places: number; factors: number; goodDays: number; placeCategories: number },
  timeOfDayCounts: Map<string, number>
): boolean {
  if (achievement.metric === 'timeOfDay') {
    return (timeOfDayCounts.get(achievement.bucket ?? '') ?? 0) >= achievement.threshold
  }
  return values[achievement.metric] >= achievement.threshold
}

export default function AchievementsSection({ entries, placeStats }: AchievementsSectionProps) {
  const { t, locale } = useLocale()

  const values = useMemo(() => {
    const streak = computeStreak(entries)
    const places = placeStats.reduce((sum, s) => sum + s.count, 0)
    const factors = new Set(entries.flatMap((e) => e.factors ?? [])).size
    const goodDays = new Set(
      entries.filter((e) => moodIndex(e) >= 3).map((e) => dayKey(e.createdAt))
    ).size
    const placeCategories = placeStats.length
    return { entries: entries.length, streak, places, factors, goodDays, placeCategories }
  }, [entries, placeStats])

  const timeOfDayCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of entries) {
      const bucket = timeOfDayBucketForHour(new Date(entry.createdAt).getHours())
      counts.set(bucket.id, (counts.get(bucket.id) ?? 0) + 1)
    }
    return counts
  }, [entries])

  const unlockedCount = ACHIEVEMENT_DEFS.filter((a) => isUnlocked(a, values, timeOfDayCounts)).length

  return (
    <View style={styles.root}>
      <Text style={styles.sectionTitle}>{t('achievements.title')}</Text>
      <Text style={styles.sectionSubtitle}>{t('achievements.subtitle')}</Text>
      <Text style={styles.unlockedCount}>
        {t('achievements.unlockedCount', { unlocked: unlockedCount, total: ACHIEVEMENT_DEFS.length })}
      </Text>

      <View style={styles.grid}>
        {ACHIEVEMENT_DEFS.map((achievement) => {
          const unlocked = isUnlocked(achievement, values, timeOfDayCounts)
          return (
            <View key={achievement.id} style={styles.tile}>
              <View style={[styles.badge, unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                <Text style={[styles.badgeEmoji, !unlocked && styles.badgeEmojiLocked]}>{achievement.emoji}</Text>
                {!unlocked && (
                  <View style={styles.lockWrap}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tileName, !unlocked && styles.tileNameLocked]} numberOfLines={1}>
                {achievement[locale]}
              </Text>
              {!unlocked && (
                <Text style={styles.tileHint} numberOfLines={1}>
                  {t(METRIC_KEY[achievement.metric], { threshold: achievement.threshold })}
                </Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12.5,
    color: colors.muted,
    lineHeight: 18,
  },
  unlockedCount: {
    marginTop: 10,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  grid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnlocked: {
    backgroundColor: colors.primarySoft,
    ...shadow.soft,
  },
  badgeLocked: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  lockWrap: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 9,
  },
  tileName: {
    marginTop: 8,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  tileNameLocked: {
    color: colors.muted,
  },
  tileHint: {
    marginTop: 2,
    fontSize: 9.5,
    color: colors.muted,
    textAlign: 'center',
  },
})

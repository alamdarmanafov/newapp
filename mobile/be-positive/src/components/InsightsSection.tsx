import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import {
  DAY_LABELS,
  MOOD_ORDER,
  MOOD_SCORE_SCALE,
  PLACE_CATEGORIES,
  TIME_OF_DAY_BUCKETS,
  factorEmoji,
  factorLabel,
  moodScore,
  placeCategoryLabel,
  timeOfDayBucketForHour,
} from '../i18n/content'
import { fetchMyPlaceCategoryStats, type MyPlaceCategoryStat } from '../places'
import { colors, MOOD_COLORS, radius, shadow } from '../theme'

interface InsightsSectionProps {
  entries: JournalEntry[]
  userId?: string
}

function moodIndex(entry: JournalEntry) {
  return MOOD_ORDER.indexOf(entry.mood)
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function InsightsSection({ entries, userId }: InsightsSectionProps) {
  const { t, locale } = useLocale()
  const dayLabels = DAY_LABELS[locale]
  const [placeStats, setPlaceStats] = useState<MyPlaceCategoryStat[]>([])

  useEffect(() => {
    if (userId) fetchMyPlaceCategoryStats(userId).then(setPlaceStats)
  }, [userId])

  const week = useMemo(() => {
    const today = startOfDay(new Date())
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      const dayEntries = entries.filter((e) => startOfDay(new Date(e.createdAt)).getTime() === day.getTime())
      const avg = dayEntries.length
        ? dayEntries.reduce((sum, e) => sum + moodIndex(e), 0) / dayEntries.length
        : null
      return { label: dayLabels[i], avg }
    })
  }, [entries, dayLabels])

  const weekAverage = useMemo(() => {
    const values = week.map((d) => d.avg).filter((v): v is number => v !== null)
    if (values.length === 0) return null
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }, [week])

  const topFactorInsight = useMemo(() => {
    const counts = new Map<string, { total: number; sum: number }>()
    for (const entry of entries) {
      for (const factor of entry.factors ?? []) {
        const current = counts.get(factor) ?? { total: 0, sum: 0 }
        current.total += 1
        current.sum += moodIndex(entry)
        counts.set(factor, current)
      }
    }
    if (counts.size === 0) return null

    let best: { factor: string; total: number; avgWith: number } | null = null
    for (const [factor, stat] of counts) {
      if (stat.total < 2) continue
      const avgWith = stat.sum / stat.total
      if (!best || avgWith > best.avgWith) best = { factor, total: stat.total, avgWith }
    }
    if (!best) return null

    const others = entries.filter((e) => !(e.factors ?? []).includes(best!.factor))
    const avgWithout = others.length
      ? others.reduce((sum, e) => sum + moodIndex(e), 0) / others.length
      : best.avgWith
    const diff = best.avgWith - avgWithout

    return { factor: best.factor, days: best.total, diff }
  }, [entries])

  const bestDaysStats = useMemo(() => {
    const now = new Date()
    const startOfWeek = startOfDay(now)
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const countGoodSince = (since: Date) =>
      entries.filter((e) => moodIndex(e) >= 3 && new Date(e.createdAt) >= since).length

    return {
      week: countGoodSince(startOfWeek),
      month: countGoodSince(startOfMonth),
      year: countGoodSince(startOfYear),
    }
  }, [entries])

  const bestTimeOfDay = useMemo(() => {
    const sums = new Map<string, { sum: number; count: number }>()
    for (const entry of entries) {
      const bucket = timeOfDayBucketForHour(new Date(entry.createdAt).getHours())
      const current = sums.get(bucket.id) ?? { sum: 0, count: 0 }
      current.sum += moodIndex(entry)
      current.count += 1
      sums.set(bucket.id, current)
    }

    let best: { id: string; avg: number } | null = null
    for (const [id, stat] of sums) {
      if (stat.count < 2) continue
      const avg = stat.sum / stat.count
      if (!best || avg > best.avg) best = { id, avg }
    }
    return best
  }, [entries])

  const bestPlace = placeStats[0] ?? null

  const monthlyComparison = useMemo(() => {
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthEntries = entries.filter((e) => new Date(e.createdAt) >= startOfThisMonth)
    const lastMonthEntries = entries.filter(
      (e) => new Date(e.createdAt) >= startOfLastMonth && new Date(e.createdAt) < startOfThisMonth
    )
    if (thisMonthEntries.length === 0 || lastMonthEntries.length === 0) return null

    const avg = (list: JournalEntry[]) => list.reduce((sum, e) => sum + moodIndex(e), 0) / list.length
    const current = moodScore(avg(thisMonthEntries))
    const previous = moodScore(avg(lastMonthEntries))
    return { current, previous, diff: current - previous }
  }, [entries])

  const factorRanking = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of entries) {
      for (const factor of entry.factors ?? []) {
        counts.set(factor, (counts.get(factor) ?? 0) + 1)
      }
    }
    const ranked = Array.from(counts.entries())
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count)
    const maxCount = ranked[0]?.count ?? 1
    return ranked.map((r) => ({ ...r, ratio: r.count / maxCount }))
  }, [entries])

  const points = week.map((d, i) => ({
    x: 26 + i * 34,
    y: d.avg === null ? null : 96 - d.avg * 18,
  }))
  const validPoints = points.filter((p): p is { x: number; y: number } => p.y !== null)
  const path = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <View style={styles.root}>
      <Text style={styles.sectionTitle}>{t('insights.title')}</Text>
      <Text style={styles.sectionSubtitle}>{t('insights.subtitle')}</Text>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartHeaderLeft}>
            <View style={styles.chartIconWrap}>
              <Text style={styles.chartIcon}>📈</Text>
            </View>
            <Text style={styles.chartLabel}>{t('insights.weekLabel')}</Text>
          </View>
          <Text style={styles.chartValue}>{weekAverage === null ? '—' : moodScore(weekAverage).toFixed(1)}</Text>
        </View>

        <Svg viewBox="0 0 260 110" width="100%" height={110} style={{ marginTop: 6 }}>
          {validPoints.length > 1 && (
            <Path d={path} fill="none" stroke={colors.border} strokeWidth={2} strokeLinecap="round" />
          )}
          {points.map((p, i) =>
            p.y === null ? null : <Circle key={i} cx={p.x} cy={p.y} r={5} fill={MOOD_COLORS[Math.round(week[i].avg ?? 0)]} />
          )}
        </Svg>
        <View style={styles.dayLabelsRow}>
          {dayLabels.map((d) => (
            <Text key={d} style={styles.dayLabel}>
              {d}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.goodDaysRow}>
        <View style={styles.goodDaysTile}>
          <Text style={styles.goodDaysValue}>{bestDaysStats.week}</Text>
          <Text style={styles.goodDaysLabel}>{t('insights.goodDaysWeek')}</Text>
        </View>
        <View style={styles.goodDaysTile}>
          <Text style={styles.goodDaysValue}>{bestDaysStats.month}</Text>
          <Text style={styles.goodDaysLabel}>{t('insights.goodDaysMonth')}</Text>
        </View>
        <View style={styles.goodDaysTile}>
          <Text style={styles.goodDaysValue}>{bestDaysStats.year}</Text>
          <Text style={styles.goodDaysLabel}>{t('insights.goodDaysYear')}</Text>
        </View>
      </View>

      {topFactorInsight && (
        <View style={styles.patternCard}>
          <View style={styles.patternTagRow}>
            <Text style={styles.patternSparkle}>✨</Text>
            <Text style={styles.patternTag}>{t('insights.patternTag')}</Text>
          </View>
          <Text style={styles.patternText}>
            {t(topFactorInsight.diff >= 0 ? 'insights.patternHigh' : 'insights.patternLow', {
              factor: factorLabel(topFactorInsight.factor, locale),
              diff: (Math.abs(topFactorInsight.diff) * MOOD_SCORE_SCALE).toFixed(1),
            })}
          </Text>
        </View>
      )}

      {monthlyComparison &&
        (() => {
          const { diff } = monthlyComparison
          const isBetter = diff > 0.05
          const isWorse = diff < -0.05
          const label = isBetter
            ? t('insights.monthCompareBetter', { diff: `+${diff.toFixed(1)}` })
            : isWorse
              ? t('insights.monthCompareWorse', { diff: diff.toFixed(1) })
              : t('insights.monthCompareEqual')
          return (
            <View style={[styles.compareCard, isBetter && styles.compareCardUp, isWorse && styles.compareCardDown]}>
              <View style={styles.compareIconWrap}>
                <Text style={styles.rowIcon}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.compareText}>{label}</Text>
                <Text style={styles.compareSub}>
                  {t('insights.monthCompareSub', {
                    current: monthlyComparison.current.toFixed(1),
                    previous: monthlyComparison.previous.toFixed(1),
                  })}
                </Text>
              </View>
            </View>
          )
        })()}

      {factorRanking.length > 0 && (
        <View style={styles.rankCard}>
          <Text style={styles.rankTitle}>{t('insights.factorRankingTitle')}</Text>
          {factorRanking.map((item, index) => (
            <View key={item.factor} style={[styles.rankRow, index > 0 && styles.rankRowSpacing]}>
              <View style={styles.rankNum}>
                <Text style={styles.rankNumText}>{index + 1}</Text>
              </View>
              <Text style={styles.rankEmoji}>{factorEmoji(item.factor)}</Text>
              <Text style={styles.rankName} numberOfLines={1}>
                {factorLabel(item.factor, locale)}
              </Text>
              <View style={styles.rankBarTrack}>
                <View style={[styles.rankBarFill, { width: `${Math.max(item.ratio * 100, 6)}%` }]} />
              </View>
              <Text style={styles.rankMeta}>
                {item.count} {t('insights.topFactorDaysSuffix')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {bestTimeOfDay &&
        (() => {
          const bucket = TIME_OF_DAY_BUCKETS.find((b) => b.id === bestTimeOfDay.id)
          if (!bucket) return null
          return (
            <View style={styles.rowCard}>
              <View style={styles.rowIconWrap}>
                <Text style={styles.rowIcon}>{bucket.emoji}</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>{t('insights.bestTimeLabel')}</Text>
                <Text style={styles.rowValue}>{bucket[locale]}</Text>
              </View>
            </View>
          )
        })()}

      {bestPlace &&
        (() => {
          const category = PLACE_CATEGORIES.find((c) => c.id === bestPlace.category)
          return (
            <View style={styles.rowCard}>
              <View style={styles.rowIconWrap}>
                <Text style={styles.rowIcon}>{category?.emoji ?? '📍'}</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>{t('insights.bestPlaceLabel')}</Text>
                <Text style={styles.rowValue}>
                  {placeCategoryLabel(bestPlace.category, locale)} · {bestPlace.count} {t('insights.bestPlaceTimesSuffix')}
                </Text>
              </View>
            </View>
          )
        })()}

      {entries.length === 0 && <Text style={styles.empty}>{t('insights.empty')}</Text>}
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
    marginBottom: 14,
    fontSize: 12.5,
    color: colors.muted,
    lineHeight: 18,
  },
  chartCard: {
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartIcon: {
    fontSize: 15,
  },
  chartLabel: {
    fontSize: 12.5,
    color: colors.muted,
  },
  chartValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.muted,
  },
  goodDaysRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  goodDaysTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goodDaysValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  goodDaysLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  patternCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patternTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patternSparkle: {
    fontSize: 13,
  },
  patternTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  patternText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 21,
  },
  rowCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: {
    fontSize: 20,
  },
  rowLabel: {
    fontSize: 12.5,
    color: colors.muted,
  },
  rowValue: {
    marginTop: 3,
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.text,
  },
  compareCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  compareCardUp: {
    backgroundColor: '#EAF8EF',
    borderColor: '#CDEEDA',
  },
  compareCardDown: {
    backgroundColor: '#FBEDED',
    borderColor: '#F4D3D3',
  },
  compareIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  compareSub: {
    marginTop: 3,
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: '500',
  },
  rankCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankTitle: {
    fontSize: 12.5,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 12,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankRowSpacing: {
    marginTop: 12,
  },
  rankNum: {
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  rankEmoji: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  rankName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  rankBarTrack: {
    flex: 1.4,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  rankMeta: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 14,
  },
})

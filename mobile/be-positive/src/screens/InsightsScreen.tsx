import { useCallback, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import { DAY_LABELS, MOOD_ORDER, factorEmoji, factorLabel } from '../i18n/content'
import { colors, MOOD_COLORS, radius, shadow } from '../theme'

interface InsightsScreenProps {
  entries: JournalEntry[]
  onRefresh?: () => Promise<void>
}

function moodIndex(entry: JournalEntry) {
  return MOOD_ORDER.indexOf(entry.mood)
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function InsightsScreen({ entries, onRefresh }: InsightsScreenProps) {
  const { t, locale } = useLocale()
  const dayLabels = DAY_LABELS[locale]
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await onRefresh?.()
    setRefreshing(false)
  }, [onRefresh])

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

  const topFactor = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of entries) {
      for (const factor of entry.factors ?? []) {
        counts.set(factor, (counts.get(factor) ?? 0) + 1)
      }
    }
    let best: { factor: string; count: number } | null = null
    for (const [factor, count] of counts) {
      if (!best || count > best.count) best = { factor, count }
    }
    return best
  }, [entries])

  const points = week.map((d, i) => ({
    x: 26 + i * 34,
    y: d.avg === null ? null : 96 - d.avg * 18,
  }))
  const validPoints = points.filter((p): p is { x: number; y: number } => p.y !== null)
  const path = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>{t('insights.title')}</Text>
      <Text style={styles.subtitle}>{t('insights.subtitle')}</Text>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartHeaderLeft}>
            <View style={styles.chartIconWrap}>
              <Text style={styles.chartIcon}>📈</Text>
            </View>
            <Text style={styles.chartLabel}>{t('insights.weekLabel')}</Text>
          </View>
          <Text style={styles.chartValue}>{weekAverage === null ? '—' : (weekAverage + 1).toFixed(1)}</Text>
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

      {topFactorInsight && (
        <View style={styles.patternCard}>
          <View style={styles.patternTagRow}>
            <Text style={styles.patternSparkle}>✨</Text>
            <Text style={styles.patternTag}>{t('insights.patternTag')}</Text>
          </View>
          <Text style={styles.patternText}>
            {t(topFactorInsight.diff >= 0 ? 'insights.patternHigh' : 'insights.patternLow', {
              factor: factorLabel(topFactorInsight.factor, locale),
              diff: Math.abs(topFactorInsight.diff).toFixed(1),
            })}
          </Text>
        </View>
      )}

      {topFactor && (
        <View style={styles.rowCard}>
          <View style={styles.rowIconWrap}>
            <Text style={styles.rowIcon}>{factorEmoji(topFactor.factor)}</Text>
          </View>
          <View>
            <Text style={styles.rowLabel}>{t('insights.topFactorLabel')}</Text>
            <Text style={styles.rowValue}>
              {factorLabel(topFactor.factor, locale)} · {topFactor.count} {t('insights.topFactorDaysSuffix')}
            </Text>
          </View>
        </View>
      )}

      {entries.length === 0 && <Text style={styles.empty}>{t('insights.empty')}</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 13,
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
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 14,
  },
})

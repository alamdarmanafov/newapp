import { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { MOOD_OPTIONS, type JournalEntry } from '../types'
import { colors, MOOD_COLORS, radius, shadow } from '../theme'

interface InsightsScreenProps {
  entries: JournalEntry[]
}

const DAY_LABELS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

function moodIndex(entry: JournalEntry) {
  return MOOD_OPTIONS.findIndex((option) => option.key === entry.mood)
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function InsightsScreen({ entries }: InsightsScreenProps) {
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
      return { label: DAY_LABELS[i], avg }
    })
  }, [entries])

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
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>İçgörülər</Text>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartLabel}>Bu həftə</Text>
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
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.dayLabel}>
              {d}
            </Text>
          ))}
        </View>
      </View>

      {topFactorInsight && (
        <View style={styles.patternCard}>
          <Text style={styles.patternTag}>NÜMUNƏ TAPILDI</Text>
          <Text style={styles.patternText}>
            {topFactorInsight.factor} olan günlərdə əhvalın orta hesabla{' '}
            {Math.abs(topFactorInsight.diff).toFixed(1)} bal {topFactorInsight.diff >= 0 ? 'yüksək' : 'aşağı'} olur.
          </Text>
        </View>
      )}

      {topFactor && (
        <View style={styles.rowCard}>
          <View>
            <Text style={styles.rowLabel}>Ən çox təsir edən</Text>
            <Text style={styles.rowValue}>
              {topFactor.factor} · {topFactor.count} gün
            </Text>
          </View>
        </View>
      )}

      {entries.length === 0 && <Text style={styles.empty}>Hələ heç bir qeydin yoxdur.</Text>}
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
    marginBottom: 16,
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
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

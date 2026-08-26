import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import { DAY_LABELS, MONTH_NAMES, MOOD_ORDER } from '../i18n/content'
import { colors, MOOD_COLORS, radius } from '../theme'

interface MonthScreenProps {
  entries: JournalEntry[]
  onSelectEntry: (entry: JournalEntry) => void
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

function moodIndex(entry: JournalEntry) {
  return MOOD_ORDER.indexOf(entry.mood)
}

export default function MonthScreen({ entries, onSelectEntry }: MonthScreenProps) {
  const { t, locale } = useLocale()
  const dayLabels = DAY_LABELS[locale]
  const monthNames = MONTH_NAMES[locale]

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const entryByDay = useMemo(() => {
    const map = new Map<string, JournalEntry>()
    for (const entry of entries) {
      map.set(dayKey(entry.createdAt), entry)
    }
    return map
  }, [entries])

  const { cells, loggedCount, daysInMonth } = useMemo(() => {
    const first = new Date(year, month, 1)
    const totalDays = new Date(year, month + 1, 0).getDate()
    const leadingBlanks = (first.getDay() + 6) % 7

    const list: ({ entry: JournalEntry | null } | null)[] = Array(leadingBlanks).fill(null)
    let logged = 0
    for (let day = 1; day <= totalDays; day++) {
      const iso = new Date(year, month, day).toISOString().slice(0, 10)
      const entry = entryByDay.get(iso) ?? null
      if (entry) logged += 1
      list.push({ entry })
    }
    return { cells: list, loggedCount: logged, daysInMonth: totalDays }
  }, [entryByDay, year, month])

  const monthAverage = useMemo(() => {
    const values = entries
      .filter((e) => new Date(e.createdAt).getFullYear() === year && new Date(e.createdAt).getMonth() === month)
      .map(moodIndex)
    if (values.length === 0) return null
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }, [entries, year, month])

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{monthNames[month]}</Text>
      <Text style={styles.subtitle}>{t('month.subtitle', { total: daysInMonth, logged: loggedCount })}</Text>

      <View style={styles.grid}>
        {dayLabels.map((d) => (
          <Text key={d} style={styles.dayHeader}>
            {d}
          </Text>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <View key={i} style={[styles.cell, { backgroundColor: 'transparent' }]} />
          const entry = cell.entry
          const color = entry ? MOOD_COLORS[moodIndex(entry)] : colors.surface
          return (
            <Pressable
              key={i}
              disabled={!entry}
              onPress={() => entry && onSelectEntry(entry)}
              style={[styles.cell, { backgroundColor: color }]}
            />
          )
        })}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendText}>{t('month.legendLow')}</Text>
        <View style={styles.legendBar}>
          {MOOD_COLORS.map((c) => (
            <View key={c} style={[styles.legendChip, { backgroundColor: c }]} />
          ))}
        </View>
        <Text style={styles.legendText}>{t('month.legendHigh')}</Text>
      </View>

      {monthAverage !== null && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('month.summaryTitle', { avg: (monthAverage + 1).toFixed(1) })}</Text>
          <Text style={styles.summarySubtitle}>{t('month.summarySubtitle', { logged: loggedCount })}</Text>
        </View>
      )}

      {entries.length === 0 && <Text style={styles.empty}>{t('month.empty')}</Text>}
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
    fontSize: 13,
    color: colors.muted,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayHeader: {
    width: '12.28%',
    textAlign: 'center',
    fontSize: 10,
    color: colors.muted,
  },
  cell: {
    width: '12.28%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  legendText: {
    fontSize: 11.5,
    color: colors.muted,
  },
  legendBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  legendChip: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  summaryCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 21,
  },
  summarySubtitle: {
    marginTop: 6,
    fontSize: 12.5,
    color: colors.muted,
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 14,
  },
})

import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import { DAY_LABELS, MONTH_NAMES, MOOD_META, MOOD_ORDER } from '../i18n/content'
import { colors, MOOD_COLORS, radius } from '../theme'

interface MonthScreenProps {
  entries: JournalEntry[]
  onSelectEntry: (entry: JournalEntry) => void
}

interface Cell {
  day: number
  entry: JournalEntry | null
  isToday: boolean
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
  const todayIso = now.toISOString().slice(0, 10)

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

    const list: (Cell | null)[] = Array(leadingBlanks).fill(null)
    let logged = 0
    for (let day = 1; day <= totalDays; day++) {
      const iso = new Date(year, month, day).toISOString().slice(0, 10)
      const entry = entryByDay.get(iso) ?? null
      if (entry) logged += 1
      list.push({ day, entry, isToday: iso === todayIso })
    }
    return { cells: list, loggedCount: logged, daysInMonth: totalDays }
  }, [entryByDay, year, month, todayIso])

  const monthAverage = useMemo(() => {
    const values = entries
      .filter((e) => new Date(e.createdAt).getFullYear() === year && new Date(e.createdAt).getMonth() === month)
      .map(moodIndex)
    if (values.length === 0) return null
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }, [entries, year, month])

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {monthNames[month]} {year}
      </Text>
      <Text style={styles.subtitle}>{t('month.subtitle', { total: daysInMonth, logged: loggedCount })}</Text>

      <View style={styles.calendarCard}>
        <View style={styles.dayHeaderRow}>
          {dayLabels.map((d) => (
            <Text key={d} style={styles.dayHeader}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, i) => {
            if (!cell) return <View key={i} style={styles.cell} />
            const { day, entry, isToday } = cell
            return (
              <Pressable
                key={i}
                disabled={!entry}
                onPress={() => entry && onSelectEntry(entry)}
                style={styles.cell}
              >
                <View style={[styles.dayNumberWrap, isToday && styles.dayNumberWrapToday]}>
                  <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{day}</Text>
                </View>
                <View style={styles.dayEmojiSlot}>
                  {entry && <Text style={styles.dayEmoji}>{MOOD_META[entry.mood].emoji}</Text>}
                </View>
              </Pressable>
            )
          })}
        </View>
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
  calendarCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayHeader: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.muted,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2857%',
    aspectRatio: 0.85,
    alignItems: 'center',
    paddingTop: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  dayNumberWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapToday: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  dayNumberToday: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dayEmojiSlot: {
    marginTop: 4,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmoji: {
    fontSize: 16,
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

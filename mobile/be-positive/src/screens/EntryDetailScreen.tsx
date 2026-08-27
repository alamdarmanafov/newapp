import { useMemo, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import { FACTOR_DEFS, MOOD_META, MOOD_ORDER, moodLabel } from '../i18n/content'
import { MOOD_COLORS, radius, shadow, type ColorPalette } from '../theme'
import { useTheme } from '../themeContext'

interface EntryDetailScreenProps {
  entry: JournalEntry | null
  onClose: () => void
  onSave: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}

export default function EntryDetailScreen({ entry, onClose, onSave, onDelete }: EntryDetailScreenProps) {
  const { t, locale } = useLocale()
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [moodIndex, setMoodIndex] = useState(0)
  const [factors, setFactors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [openedId, setOpenedId] = useState<string | null>(null)

  if (entry && entry.id !== openedId) {
    setOpenedId(entry.id)
    setMoodIndex(Math.max(0, MOOD_ORDER.indexOf(entry.mood)))
    setFactors(entry.factors ?? [])
    setNote(entry.note)
    setGratitude(entry.gratitude)
  }

  if (!entry) return null

  const toggleFactor = (id: string) => {
    setFactors((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const handleSave = () => {
    onSave({
      ...entry,
      mood: MOOD_ORDER[moodIndex],
      factors,
      note: note.trim(),
      gratitude: gratitude.trim(),
    })
  }

  const handleDelete = () => {
    Alert.alert(t('entryDetail.deleteConfirmTitle'), t('entryDetail.deleteConfirmBody'), [
      { text: t('entryDetail.deleteCancel'), style: 'cancel' },
      { text: t('entryDetail.deleteConfirmAction'), style: 'destructive', onPress: () => onDelete(entry.id) },
    ])
  }

  const date = new Date(entry.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.closeText}>{t('entryDetail.close')}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.moodRow}>
            {MOOD_ORDER.map((key, i) => {
              const on = i === moodIndex
              return (
                <Pressable
                  key={key}
                  onPress={() => setMoodIndex(i)}
                  style={[styles.moodChip, on && { backgroundColor: MOOD_COLORS[i], borderColor: MOOD_COLORS[i] }]}
                >
                  <Text style={styles.moodEmoji}>{MOOD_META[key].emoji}</Text>
                  <Text style={[styles.moodLabel, on && styles.moodLabelOn]}>{moodLabel(key, locale)}</Text>
                </Pressable>
              )
            })}
          </View>

          <View style={styles.chipsRow}>
            {FACTOR_DEFS.map(({ id, emoji }) => {
              const on = factors.includes(id)
              return (
                <Pressable key={id} onPress={() => toggleFactor(id)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={styles.chipEmoji}>{emoji}</Text>
                  <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>
                    {FACTOR_DEFS.find((f) => f.id === id)?.[locale]}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('entryDetail.noteLabel')}</Text>
            <TextInput style={styles.input} multiline value={note} onChangeText={setNote} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('entryDetail.gratitudeLabel')}</Text>
            <TextInput style={styles.input} multiline value={gratitude} onChangeText={setGratitude} />
          </View>

          {entry.coachMessage ? (
            <View style={styles.coachCard}>
              <Text style={styles.coachLabel}>{t('entryDetail.coachLabel')}</Text>
              <Text style={styles.coachText}>{entry.coachMessage}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>{t('entryDetail.delete')}</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>{t('entryDetail.save')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    date: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },
    closeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    scroll: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 40,
    },
    moodRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    moodChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moodEmoji: {
      fontSize: 15,
    },
    moodLabel: {
      fontSize: 13,
      color: colors.text,
    },
    moodLabelOn: {
      color: '#ffffff',
      fontWeight: '700',
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 38,
      paddingHorizontal: 14,
      borderRadius: 19,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipEmoji: {
      fontSize: 14,
    },
    chipLabel: {
      fontSize: 13.5,
      color: colors.text,
    },
    chipLabelOn: {
      color: '#ffffff',
      fontWeight: '700',
    },
    card: {
      marginTop: 16,
      padding: 16,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      marginBottom: 8,
    },
    input: {
      fontSize: 14,
      color: colors.text,
      minHeight: 44,
      textAlignVertical: 'top',
    },
    coachCard: {
      marginTop: 16,
      padding: 16,
      borderRadius: radius.lg,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    coachLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    coachText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 20,
      paddingTop: 8,
    },
    deleteButton: {
      paddingVertical: 16,
      paddingHorizontal: 22,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    deleteText: {
      color: colors.danger,
      fontWeight: '700',
      fontSize: 15,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: radius.xl,
      paddingVertical: 16,
      alignItems: 'center',
      ...shadow.card,
    },
    saveText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '700',
    },
  })
}

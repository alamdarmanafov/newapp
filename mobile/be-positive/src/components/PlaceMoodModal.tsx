import { useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MOOD_META, MOOD_ORDER, PLACE_CATEGORIES } from '../i18n/content'
import { useLocale } from '../i18n/LocaleContext'
import { radius, shadow, type ColorPalette } from '../theme'
import { useTheme } from '../themeContext'
import type { MoodKey } from '../types'

interface PlaceMoodModalProps {
  visible: boolean
  submitting: boolean
  onSubmit: (mood: MoodKey, category: string) => void
  onClose: () => void
}

export default function PlaceMoodModal({ visible, submitting, onSubmit, onClose }: PlaceMoodModalProps) {
  const { t, locale } = useLocale()
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [selected, setSelected] = useState<MoodKey | null>(null)
  const [category, setCategory] = useState(PLACE_CATEGORIES[0].id)

  const handleSubmit = () => {
    if (selected) onSubmit(selected, category)
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('places.pickerTitle')}</Text>
          <Text style={styles.subtitle}>{t('places.pickerSubtitle')}</Text>

          <Text style={styles.sectionLabel}>{t('places.categoryLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryRow}>
            {PLACE_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>{cat[locale]}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>{t('places.moodLabel')}</Text>
          <View style={styles.moodRow}>
            {MOOD_ORDER.map((mood) => {
              const meta = MOOD_META[mood]
              const isSelected = selected === mood
              return (
                <Pressable
                  key={mood}
                  style={[styles.moodButton, isSelected && styles.moodButtonSelected]}
                  onPress={() => setSelected(mood)}
                >
                  <Text style={styles.moodEmoji}>{meta.emoji}</Text>
                  <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>{meta[locale]}</Text>
                </Pressable>
              )
            })}
          </View>

          <Pressable
            style={[styles.submitButton, !selected && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.submitText}>{t('places.pickerSubmit')}</Text>}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(18, 35, 61, 0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: 24,
      paddingBottom: 34,
      ...shadow.card,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.muted,
      marginBottom: 18,
    },
    sectionLabel: {
      fontSize: 11.5,
      fontWeight: '700',
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 10,
    },
    categoryScroll: {
      marginBottom: 20,
    },
    categoryRow: {
      gap: 8,
      paddingRight: 4,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    categoryEmoji: {
      fontSize: 15,
    },
    categoryLabel: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.muted,
    },
    categoryLabelSelected: {
      color: colors.primary,
    },
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 6,
    },
    moodButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    moodButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    moodEmoji: {
      fontSize: 24,
    },
    moodLabel: {
      marginTop: 6,
      fontSize: 10.5,
      color: colors.muted,
      fontWeight: '600',
      textAlign: 'center',
    },
    moodLabelSelected: {
      color: colors.primary,
    },
    submitButton: {
      marginTop: 20,
      height: 52,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.soft,
    },
    submitButtonDisabled: {
      opacity: 0.4,
    },
    submitText: {
      color: '#ffffff',
      fontSize: 15.5,
      fontWeight: '700',
    },
  })
}

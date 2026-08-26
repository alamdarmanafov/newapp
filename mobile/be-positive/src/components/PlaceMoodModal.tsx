import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { MOOD_META, MOOD_ORDER } from '../i18n/content'
import { useLocale } from '../i18n/LocaleContext'
import { colors, radius, shadow } from '../theme'
import type { MoodKey } from '../types'

interface PlaceMoodModalProps {
  visible: boolean
  submitting: boolean
  onSubmit: (mood: MoodKey) => void
  onClose: () => void
}

export default function PlaceMoodModal({ visible, submitting, onSubmit, onClose }: PlaceMoodModalProps) {
  const { t, locale } = useLocale()
  const [selected, setSelected] = useState<MoodKey | null>(null)

  const handleSubmit = () => {
    if (selected) onSubmit(selected)
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('places.pickerTitle')}</Text>
          <Text style={styles.subtitle}>{t('places.pickerSubtitle')}</Text>

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

const styles = StyleSheet.create({
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

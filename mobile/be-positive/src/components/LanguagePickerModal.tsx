import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import { LOCALE_OPTIONS } from '../i18n/content'
import { colors, radius, shadow } from '../theme'

interface LanguagePickerModalProps {
  visible: boolean
  onClose: () => void
}

export default function LanguagePickerModal({ visible, onClose }: LanguagePickerModalProps) {
  const { locale, setLocale } = useLocale()

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {LOCALE_OPTIONS.map((option) => {
            const selected = option.code === locale
            return (
              <Pressable
                key={option.code}
                style={styles.row}
                onPress={() => {
                  setLocale(option.code)
                  onClose()
                }}
              >
                <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{option.name}</Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            )
          })}
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
    paddingTop: 8,
    paddingBottom: 34,
    paddingHorizontal: 8,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
  },
  rowText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  rowTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  check: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '800',
  },
})

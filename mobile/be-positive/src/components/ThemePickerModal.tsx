import { useMemo } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import type { TranslationKey } from '../i18n/translations'
import { useTheme, type ThemePreference } from '../themeContext'
import { radius, shadow, type ColorPalette } from '../theme'

interface ThemePickerModalProps {
  visible: boolean
  onClose: () => void
}

const OPTIONS: { value: ThemePreference; labelKey: TranslationKey }[] = [
  { value: 'light', labelKey: 'theme.light' },
  { value: 'dark', labelKey: 'theme.dark' },
  { value: 'system', labelKey: 'theme.system' },
]

export default function ThemePickerModal({ visible, onClose }: ThemePickerModalProps) {
  const { t } = useLocale()
  const { colors, preference, setPreference } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {OPTIONS.map((option) => {
            const selected = option.value === preference
            return (
              <Pressable
                key={option.value}
                style={styles.row}
                onPress={() => {
                  setPreference(option.value)
                  onClose()
                }}
              >
                <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{t(option.labelKey)}</Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            )
          })}
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
}

import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import type { ColorPalette } from '../theme'
import { useTheme } from '../themeContext'

interface LanguageSwitcherProps {
  onChange?: (locale: 'az' | 'en') => void
}

export default function LanguageSwitcher({ onChange }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const select = (next: 'az' | 'en') => {
    setLocale(next)
    onChange?.(next)
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={() => select('az')} style={[styles.pill, locale === 'az' && styles.pillActive]}>
        <Text style={[styles.pillText, locale === 'az' && styles.pillTextActive]}>AZ</Text>
      </Pressable>
      <Pressable onPress={() => select('en')} style={[styles.pill, locale === 'en' && styles.pillActive]}>
        <Text style={[styles.pillText, locale === 'en' && styles.pillTextActive]}>EN</Text>
      </Pressable>
    </View>
  )
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 6,
    },
    pill: {
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.muted,
    },
    pillTextActive: {
      color: '#ffffff',
    },
  })
}

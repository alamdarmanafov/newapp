import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import type { TranslationKey } from '../i18n/translations'
import { colors } from '../theme'

export type TabKey = 'insights' | 'chat' | 'month' | 'places' | 'profile'

interface TabBarProps {
  tab: TabKey
  onChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; labelKey: TranslationKey; icon: string }[] = [
  { key: 'insights', labelKey: 'tabs.insights', icon: '📊' },
  { key: 'chat', labelKey: 'tabs.chat', icon: '✨' },
  { key: 'month', labelKey: 'tabs.month', icon: '📅' },
  { key: 'places', labelKey: 'tabs.places', icon: '🗺️' },
  { key: 'profile', labelKey: 'tabs.profile', icon: '👤' },
]

export default function TabBar({ tab, onChange }: TabBarProps) {
  const { t } = useLocale()

  return (
    <View style={styles.bar}>
      {TABS.map((item) => {
        const active = item.key === tab
        return (
          <Pressable key={item.key} style={styles.tab} onPress={() => onChange(item.key)}>
            <Text style={[styles.icon, active && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{t(item.labelKey)}</Text>
            {active && <View style={styles.dot} />}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: 10,
    paddingBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 18,
    opacity: 0.45,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  dot: {
    marginTop: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
})

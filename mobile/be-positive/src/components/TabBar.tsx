import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

export type TabKey = 'today' | 'insights' | 'chat' | 'month' | 'profile'

interface TabBarProps {
  tab: TabKey
  onChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'today', label: 'Bugün', icon: '🏠' },
  { key: 'insights', label: 'İçgörü', icon: '📊' },
  { key: 'chat', label: 'Söhbət', icon: '✨' },
  { key: 'month', label: 'Ay', icon: '📅' },
  { key: 'profile', label: 'Profil', icon: '👤' },
]

export default function TabBar({ tab, onChange }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((item) => {
        const active = item.key === tab
        return (
          <Pressable key={item.key} style={styles.tab} onPress={() => onChange(item.key)}>
            <Text style={[styles.icon, active && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
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

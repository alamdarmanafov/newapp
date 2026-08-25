import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

export type TabKey = 'today' | 'history'

interface TabBarProps {
  tab: TabKey
  onChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today', label: 'Bugün' },
  { key: 'history', label: 'Tarixçə' },
]

export default function TabBar({ tab, onChange }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((item) => {
        const active = item.key === tab
        return (
          <Pressable key={item.key} style={styles.tab} onPress={() => onChange(item.key)}>
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            {active && <View style={styles.indicator} />}
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
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  indicator: {
    marginTop: 6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
})

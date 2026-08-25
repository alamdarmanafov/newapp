import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '../theme'

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
      <View style={styles.track}>
        {TABS.map((item) => {
          const active = item.key === tab
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onChange(item.key)}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600',
  },
  labelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
})

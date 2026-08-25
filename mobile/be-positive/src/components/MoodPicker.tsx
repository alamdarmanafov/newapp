import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MOOD_OPTIONS, type MoodKey } from '../types'
import { colors, radius } from '../theme'

interface MoodPickerProps {
  value: MoodKey | null
  onChange: (mood: MoodKey) => void
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View style={styles.row}>
      {MOOD_OPTIONS.map((option) => {
        const selected = option.key === value
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
  },
  labelSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
})

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MOOD_OPTIONS, type MoodKey } from '../types'
import { colors, radius, shadow } from '../theme'

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
    paddingVertical: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadow.soft,
  },
  emoji: {
    fontSize: 26,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
})

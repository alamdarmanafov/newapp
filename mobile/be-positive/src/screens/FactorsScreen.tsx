import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import { FACTOR_OPTIONS } from '../types'
import { colors, radius, shadow } from '../theme'

interface FactorsScreenProps {
  factors: string[]
  onToggleFactor: (label: string) => void
  note: string
  onChangeNote: (value: string) => void
  gratitude: string
  onChangeGratitude: (value: string) => void
  onContinue: () => void
}

export default function FactorsScreen({
  factors,
  onToggleFactor,
  note,
  onChangeNote,
  gratitude,
  onChangeGratitude,
  onContinue,
}: FactorsScreenProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.title}>Nə təsir etdi?</Text>
        <Text style={styles.subtitle}>İstədiyin qədər seç (istəyə bağlı)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.chipsRow}>
          {FACTOR_OPTIONS.map(({ emoji, label }) => {
            const on = factors.includes(label)
            return (
              <Pressable key={label} onPress={() => onToggleFactor(label)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{label}</Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Nə düşünürsən?</Text>
          <TextInput
            style={styles.input}
            placeholder="Bir cümlə ilə yaz..."
            placeholderTextColor={colors.muted}
            multiline
            value={note}
            onChangeText={onChangeNote}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Nəyə görə minnətdarsan?</Text>
          <TextInput
            style={styles.input}
            placeholder="Kiçik də olsa, bir şey yaz..."
            placeholderTextColor={colors.muted}
            multiline
            value={gratitude}
            onChangeText={onChangeGratitude}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Qeyd et</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  progressDot: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  scroll: {
    padding: 20,
    paddingTop: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13.5,
    color: colors.text,
  },
  chipLabelOn: {
    color: '#ffffff',
    fontWeight: '700',
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.card,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
})

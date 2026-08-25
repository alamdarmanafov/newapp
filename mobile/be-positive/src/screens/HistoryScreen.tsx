import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '../theme'
import { MOOD_OPTIONS, type JournalEntry } from '../types'

interface HistoryScreenProps {
  entries: JournalEntry[]
  loaded: boolean
  onDelete: (id: string) => void
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function HistoryScreen({ entries, loaded, onDelete }: HistoryScreenProps) {
  if (loaded && entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Hələ heç bir qeydin yoxdur. "Bugün" bölməsindən başla.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const moodOption = MOOD_OPTIONS.find((option) => option.key === item.mood)
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{moodOption?.emoji}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <Pressable onPress={() => onDelete(item.id)} hitSlop={8}>
                <Text style={styles.delete}>Sil</Text>
              </Pressable>
            </View>
            {item.note.length > 0 && <Text style={styles.note}>{item.note}</Text>}
            {item.gratitude.length > 0 && (
              <Text style={styles.gratitude}>🙏 {item.gratitude}</Text>
            )}
            <View style={styles.coachRow}>
              <Text style={styles.coachMessage}>{item.coachMessage}</Text>
            </View>
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  date: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  delete: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  note: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
  },
  gratitude: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 10,
  },
  coachRow: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  coachMessage: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 19,
  },
})

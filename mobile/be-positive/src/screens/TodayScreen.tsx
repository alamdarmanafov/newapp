import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import MoodPicker from '../components/MoodPicker'
import { fetchAiCoachMessage } from '../aiCoach'
import { generateCoachMessage } from '../coach'
import { colors, radius } from '../theme'
import type { JournalEntry, MoodKey } from '../types'

interface TodayScreenProps {
  onSave: (entry: JournalEntry) => void
}

export default function TodayScreen({ onSave }: TodayScreenProps) {
  const [mood, setMood] = useState<MoodKey | null>(null)
  const [note, setNote] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleReflect = async () => {
    if (!mood) return
    setLoading(true)
    const aiMessage = await fetchAiCoachMessage(mood, note, gratitude)
    setCoachMessage(aiMessage ?? generateCoachMessage(mood, note))
    setLoading(false)
  }

  const handleSave = () => {
    if (!mood || !coachMessage) return
    onSave({
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      mood,
      note: note.trim(),
      gratitude: gratitude.trim(),
      coachMessage,
    })
    setMood(null)
    setNote('')
    setGratitude('')
    setCoachMessage(null)
  }

  const handleRewrite = () => {
    setCoachMessage(null)
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Bu gün özünü necə hiss edirsən?</Text>
      <MoodPicker value={mood} onChange={setMood} />

      <Text style={styles.fieldLabel}>Nə düşünürsən? (istəyə bağlı)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Bu gün seni narahat edən və ya sevindirən nədir?"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={3}
        value={note}
        onChangeText={setNote}
        editable={!coachMessage}
      />

      <Text style={styles.fieldLabel}>Bu gün nəyə görə minnətdarsan? (istəyə bağlı)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Kiçik də olsa, bir şey yaz"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={2}
        value={gratitude}
        onChangeText={setGratitude}
        editable={!coachMessage}
      />

      {!coachMessage ? (
        <Pressable
          style={[styles.primaryButton, (!mood || loading) && styles.primaryButtonDisabled]}
          onPress={handleReflect}
          disabled={!mood || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Paylaş və məsləhət al</Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.coachCard}>
          <Text style={styles.coachLabel}>Be Positive deyir:</Text>
          <Text style={styles.coachMessage}>{coachMessage}</Text>
          <View style={styles.coachActions}>
            <Pressable style={styles.secondaryButton} onPress={handleRewrite}>
              <Text style={styles.secondaryButtonText}>Yenidən yaz</Text>
            </Pressable>
            <Pressable style={[styles.primaryButton, styles.primaryButtonInRow]} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Gündəliyə əlavə et</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  fieldLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonInRow: {
    marginTop: 0,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.muted,
    fontWeight: '600',
  },
  coachCard: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 20,
  },
  coachLabel: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  coachMessage: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 23,
  },
  coachActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
})

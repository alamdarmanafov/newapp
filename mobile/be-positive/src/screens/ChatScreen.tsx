import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '../authContext'
import { DAILY_CHAT_MESSAGE_LIMIT, FUNCTIONS_BASE_URL, SUPABASE_ANON_KEY } from '../config'
import { supabase } from '../supabaseClient'
import { colors, radius, shadow } from '../theme'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function ChatScreen() {
  const { session } = useAuth()
  const userId = session?.user.id

  const [usedToday, setUsedToday] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsage = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('chat_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', todayKey())
      .maybeSingle()
    setUsedToday(data?.count ?? 0)
  }, [userId])

  useEffect(() => {
    loadUsage()
  }, [loadUsage])

  const remaining = usedToday === null ? null : Math.max(0, DAILY_CHAT_MESSAGE_LIMIT - usedToday)

  const handleSend = async () => {
    if (!userId || !message.trim() || remaining === null || remaining <= 0) return
    setLoading(true)
    setError(null)
    setReply(null)

    try {
      const nextCount = (usedToday ?? 0) + 1
      const { error: usageError } = await supabase
        .from('chat_usage')
        .upsert({ user_id: userId, date: todayKey(), count: nextCount }, { onConflict: 'user_id,date' })
      if (usageError) throw usageError
      setUsedToday(nextCount)

      const response = await fetch(`${FUNCTIONS_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (!response.ok) throw new Error('AI cavab vermədi')
      const data = (await response.json()) as { message?: string }
      setReply(data.message ?? 'Cavab alınmadı, bir az sonra yenidən cəhd edin.')
      setMessage('')
    } catch {
      setError('Bir xəta baş verdi. Bir az sonra yenidən cəhd edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Süni intellektlə söhbət</Text>
        <Text style={styles.subtitle}>
          {remaining === null
            ? 'Yüklənir...'
            : remaining > 0
              ? `Bu gün ${remaining} sual haqqınız qalıb`
              : 'Bu günlük sual limitiniz bitib, sabah yenidən sınayın'}
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Nə soruşmaq istəyirsiniz?"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          editable={remaining !== null && remaining > 0 && !loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[
            styles.primaryButton,
            (!message.trim() || loading || !remaining) && styles.primaryButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || loading || !remaining}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Göndər</Text>}
        </Pressable>

        {reply && (
          <View style={styles.replyCard}>
            <Text style={styles.replyLabel}>Cavab</Text>
            <Text style={styles.replyText}>{reply}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 10,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    ...shadow.soft,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  replyCard: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  replyLabel: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  replyText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 23,
  },
})

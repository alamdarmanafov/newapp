import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '../authContext'
import { DAILY_CHAT_MESSAGE_LIMIT, FUNCTIONS_BASE_URL, SUPABASE_ANON_KEY } from '../config'
import { useLocale } from '../i18n/LocaleContext'
import { supabase } from '../supabaseClient'
import { colors, radius, shadow } from '../theme'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function ChatScreen() {
  const { session } = useAuth()
  const { t, locale } = useLocale()
  const userId = session?.user.id
  const scrollRef = useRef<ScrollView>(null)

  const [usedToday, setUsedToday] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [reply, setReply] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [reservedBelow, setReservedBelow] = useState(0)
  const rootRef = useRef<View>(null)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height))
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  // The tab bar (and the safe-area bottom inset) sit below this screen and
  // are already reserved space — only the keyboard height beyond that needs
  // to be added, or the input row overshoots above the keyboard.
  const handleRootLayout = () => {
    rootRef.current?.measureInWindow((_x, y, _width, height) => {
      const screenHeight = Dimensions.get('window').height
      setReservedBelow(Math.max(0, screenHeight - (y + height)))
    })
  }

  const extraKeyboardMargin = Math.max(0, keyboardHeight - reservedBelow)

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
    const outgoing = message.trim()
    setLoading(true)
    setError(null)
    setReply(null)
    setSentMessage(outgoing)
    setMessage('')

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
        body: JSON.stringify({ message: outgoing, language: locale }),
      })
      if (!response.ok) throw new Error('AI cavab vermədi')
      const data = (await response.json()) as { message?: string }
      setReply(data.message ?? null)
    } catch {
      setError(t('chat.error'))
    } finally {
      setLoading(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadUsage()
    setRefreshing(false)
  }

  const limitReached = remaining !== null && remaining <= 0
  const canType = remaining !== null && remaining > 0 && !loading

  return (
    <View style={styles.root} ref={rootRef} onLayout={handleRootLayout}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>✨</Text>
          </View>
          <View>
            <Text style={styles.title}>{t('chat.title')}</Text>
            <Text style={styles.subtitle}>
              {remaining === null ? t('chat.loading') : limitReached ? t('chat.limitReached') : t('chat.remaining', { count: remaining })}
            </Text>
          </View>
        </View>
        {remaining !== null && (
          <View style={[styles.remainingBadge, limitReached && styles.remainingBadgeEmpty]}>
            <Text style={[styles.remainingBadgeText, limitReached && styles.remainingBadgeTextEmpty]}>
              {remaining}/{DAILY_CHAT_MESSAGE_LIMIT}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.conversation}
        contentContainerStyle={[styles.conversationContent, !sentMessage && !loading && styles.conversationContentCentered]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {!sentMessage && !loading && (
          <Pressable style={styles.emptyState} onPress={Keyboard.dismiss}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>{t('chat.emptyState')}</Text>
          </Pressable>
        )}

        {sentMessage && (
          <View style={styles.userBubbleRow}>
            <View style={styles.userBubble}>
              <Text style={styles.userBubbleText}>{sentMessage}</Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.aiBubbleRow}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarEmoji}>✨</Text>
            </View>
            <View style={[styles.aiBubble, styles.aiBubbleLoading]}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          </View>
        )}

        {!loading && reply && (
          <View style={styles.aiBubbleRow}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarEmoji}>✨</Text>
            </View>
            <View style={styles.aiBubble}>
              <Text style={styles.aiBubbleText}>{reply}</Text>
            </View>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={[styles.inputRow, extraKeyboardMargin > 0 && { marginBottom: extraKeyboardMargin }]}>
        <TextInput
          style={styles.input}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.muted}
          multiline
          value={message}
          onChangeText={setMessage}
          editable={canType}
        />
        <Pressable
          style={[styles.sendButton, (!message.trim() || !canType) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || !canType}
        >
          <Text style={styles.sendButtonIcon}>➤</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  avatarEmoji: {
    fontSize: 19,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  remainingBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  remainingBadgeEmpty: {
    backgroundColor: colors.surface,
  },
  remainingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  remainingBadgeTextEmpty: {
    color: colors.muted,
  },
  conversation: {
    flex: 1,
  },
  conversationContent: {
    padding: 20,
    paddingBottom: 12,
  },
  conversationContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 19,
  },
  userBubbleRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    borderBottomRightRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...shadow.soft,
  },
  userBubbleText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 21,
  },
  aiBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarEmoji: {
    fontSize: 13,
  },
  aiBubble: {
    maxWidth: '78%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderBottomLeftRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aiBubbleLoading: {
    paddingVertical: 14,
  },
  aiBubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonIcon: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
})

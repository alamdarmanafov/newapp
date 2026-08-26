import { ActivityIndicator, StyleSheet, Text, View, Pressable } from 'react-native'
import { colors, radius, shadow } from '../theme'

interface SavedScreenProps {
  loading: boolean
  coachMessage: string | null
  streak: number
  onFinish: () => void
}

export default function SavedScreen({ loading, coachMessage, streak, onFinish }: SavedScreenProps) {
  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.center}>
        <View style={styles.badge}>
          {loading ? <ActivityIndicator color="#ffffff" size="large" /> : <Text style={styles.badgeIcon}>✓</Text>}
        </View>

        <Text style={styles.title}>{loading ? 'Düşünürəm...' : 'Qeyd olundu'}</Text>

        {!loading && coachMessage && (
          <View style={styles.coachCard}>
            <Text style={styles.coachLabel}>Be Positive deyir</Text>
            <Text style={styles.coachMessage}>{coachMessage}</Text>
          </View>
        )}

        {!loading && streak > 0 && (
          <View style={styles.streakCard}>
            <View style={styles.streakIconWrap}>
              <Text style={styles.streakIcon}>🔥</Text>
            </View>
            <View>
              <Text style={styles.streakValue}>{streak} gün</Text>
              <Text style={styles.streakLabel}>ardıcıl qeyd — davam et</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={onFinish} disabled={loading} style={[styles.finishButton, loading && styles.finishButtonDisabled]}>
          <Text style={styles.finishButtonText}>Bitir</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: colors.primarySoft,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  badge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  badgeIcon: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: '800',
  },
  title: {
    marginTop: 22,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  coachCard: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  coachLabel: {
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coachMessage: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
  streakCard: {
    marginTop: 16,
    width: '100%',
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 22,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  streakLabel: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.muted,
  },
  footer: {
    padding: 24,
  },
  finishButton: {
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
})

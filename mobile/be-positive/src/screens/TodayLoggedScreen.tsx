import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import { MOOD_META } from '../i18n/content'
import { colors, radius, shadow } from '../theme'

interface TodayLoggedScreenProps {
  entry: JournalEntry
  streak: number
  onContinue: () => void
}

export default function TodayLoggedScreen({ entry, streak, onContinue }: TodayLoggedScreenProps) {
  const { t } = useLocale()
  const mood = MOOD_META[entry.mood]

  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.center}>
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>{mood.emoji}</Text>
        </View>

        <Text style={styles.title}>{t('todayLogged.title')}</Text>
        <Text style={styles.hint}>{t('todayLogged.hint')}</Text>

        {entry.coachMessage && (
          <View style={styles.coachCard}>
            <Text style={styles.coachLabel}>{t('saved.coachLabel')}</Text>
            <Text style={styles.coachMessage}>{entry.coachMessage}</Text>
          </View>
        )}

        {streak > 0 && (
          <View style={styles.streakCard}>
            <View style={styles.streakIconWrap}>
              <Text style={styles.streakIcon}>🔥</Text>
            </View>
            <View>
              <Text style={styles.streakValue}>
                {streak} {t('saved.streakSuffix')}
              </Text>
              <Text style={styles.streakLabel}>{t('saved.streakLabel')}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={onContinue} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>{t('todayLogged.continue')}</Text>
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
  badgeEmoji: {
    fontSize: 40,
  },
  title: {
    marginTop: 22,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
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
  continueButton: {
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
})

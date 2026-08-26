import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { useAuth } from '../authContext'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { areNotificationsEnabled, disableDailyReminders, enableDailyReminders, updatePushTokenLanguage } from '../notifications'
import { colors, radius, shadow } from '../theme'
import type { JournalEntry } from '../types'

interface ProfileScreenProps {
  entries: JournalEntry[]
}

export default function ProfileScreen({ entries }: ProfileScreenProps) {
  const { session, signOut } = useAuth()
  const { t, locale } = useLocale()
  const userId = session?.user.id
  const name = (session?.user.user_metadata?.full_name as string | undefined)?.trim()
  const [remindersOn, setRemindersOn] = useState(false)

  useEffect(() => {
    if (userId) areNotificationsEnabled(userId).then(setRemindersOn)
  }, [userId])

  useEffect(() => {
    if (userId && remindersOn) updatePushTokenLanguage(userId, locale)
  }, [locale, userId, remindersOn])

  const memberSince = session?.user.created_at
    ? new Date(session.user.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'az-AZ', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const toggleReminders = async (value: boolean) => {
    if (!userId) return
    if (value) {
      const granted = await enableDailyReminders(userId, locale, name)
      if (!granted) {
        Alert.alert(t('profile.permissionDeniedTitle'), t('profile.permissionDeniedBody'))
        return
      }
      setRemindersOn(true)
    } else {
      await disableDailyReminders(userId)
      setRemindersOn(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.languageRow}>
        <LanguageSwitcher />
      </View>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(name || session?.user.email || '?').charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.email}>{name || session?.user.email}</Text>
      {name && <Text style={styles.emailSub}>{session?.user.email}</Text>}
      <Text style={styles.memberSince}>
        {t('profile.memberSince')}: {memberSince}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>{t('profile.entriesLabel')}</Text>
        </View>
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>{t('profile.remindersLabel')}</Text>
          <Text style={styles.settingHint}>{t('profile.remindersHint')}</Text>
        </View>
        <Switch
          value={remindersOn}
          onValueChange={toggleReminders}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  languageRow: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  avatarText: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: '800',
  },
  email: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  emailSub: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.muted,
  },
  memberSince: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 28,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  settingHint: {
    marginTop: 3,
    fontSize: 12,
    color: colors.muted,
  },
  signOutButton: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  signOutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
})

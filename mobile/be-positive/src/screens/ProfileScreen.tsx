import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import Constants from 'expo-constants'
import { useAuth } from '../authContext'
import { useLocale } from '../i18n/LocaleContext'
import { LOCALE_OPTIONS } from '../i18n/content'
import LanguagePickerModal from '../components/LanguagePickerModal'
import PasswordModal from '../components/PasswordModal'
import { areNotificationsEnabled, disableDailyReminders, enableDailyReminders, updatePushTokenLanguage } from '../notifications'
import { colors, radius, shadow } from '../theme'
import type { JournalEntry } from '../types'

interface ProfileScreenProps {
  entries: JournalEntry[]
  onRefresh?: () => Promise<void>
}

const appVersion = Constants.expoConfig?.version ?? '1.0.0'

export default function ProfileScreen({ entries, onRefresh }: ProfileScreenProps) {
  const { session, signOut, deleteAccount } = useAuth()
  const { t, locale } = useLocale()
  const userId = session?.user.id
  const name = (session?.user.user_metadata?.full_name as string | undefined)?.trim()
  const [remindersOn, setRemindersOn] = useState(false)
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const currentLanguageName = LOCALE_OPTIONS.find((option) => option.code === locale)?.name ?? locale

  useEffect(() => {
    if (userId) areNotificationsEnabled(userId).then(setRemindersOn)
  }, [userId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([onRefresh?.(), userId ? areNotificationsEnabled(userId).then(setRemindersOn) : Promise.resolve()])
    setRefreshing(false)
  }, [onRefresh, userId])

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

  const confirmDeleteAccount = () => {
    Alert.alert(t('profile.deleteAccountConfirmTitle'), t('profile.deleteAccountConfirmBody'), [
      { text: t('profile.deleteAccountCancel'), style: 'cancel' },
      {
        text: t('profile.deleteAccountConfirmButton'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true)
          try {
            await deleteAccount()
          } catch {
            setDeleting(false)
            Alert.alert(t('profile.deleteAccountError'))
          }
        },
      },
    ])
  }

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
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
    >
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

      <View style={styles.settingsGroup}>
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

        <Pressable style={styles.settingRow} onPress={() => setLanguagePickerOpen(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
          </View>
          <Text style={styles.languageValue}>{currentLanguageName}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.settingRow} onPress={() => setPasswordModalOpen(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{t('profile.password')}</Text>
            <Text style={styles.settingHint}>{t('profile.passwordHint')}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
      </Pressable>

      <Pressable style={styles.deleteAccountButton} onPress={confirmDeleteAccount} disabled={deleting}>
        {deleting ? (
          <ActivityIndicator color={colors.muted} size="small" />
        ) : (
          <Text style={styles.deleteAccountText}>{t('profile.deleteAccount')}</Text>
        )}
      </Pressable>

      <Text style={styles.versionText}>
        {t('profile.version')} {appVersion}
      </Text>

      <LanguagePickerModal visible={languagePickerOpen} onClose={() => setLanguagePickerOpen(false)} />
      <PasswordModal visible={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 28,
    paddingTop: 48,
    paddingBottom: 40,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  avatarText: {
    color: colors.accent,
    fontSize: 42,
    fontWeight: '800',
  },
  email: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
  },
  emailSub: {
    marginTop: 3,
    fontSize: 13,
    color: colors.muted,
  },
  memberSince: {
    marginTop: 6,
    fontSize: 13.5,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 32,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  settingsGroup: {
    width: '100%',
    marginTop: 28,
    gap: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLabel: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.text,
  },
  settingHint: {
    marginTop: 4,
    fontSize: 12.5,
    color: colors.muted,
  },
  languageValue: {
    fontSize: 14.5,
    color: colors.muted,
    fontWeight: '600',
    marginRight: 4,
  },
  chevron: {
    fontSize: 20,
    color: colors.muted,
  },
  signOutButton: {
    marginTop: 40,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  signOutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  deleteAccountButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountText: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 13.5,
    textDecorationLine: 'underline',
  },
  versionText: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 12,
    color: colors.muted,
    opacity: 0.7,
  },
})

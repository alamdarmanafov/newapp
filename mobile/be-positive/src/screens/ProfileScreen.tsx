import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Constants from 'expo-constants'
import { useAuth } from '../authContext'
import { useLocale } from '../i18n/LocaleContext'
import { FUNCTIONS_BASE_URL } from '../config'
import { LOCALE_OPTIONS } from '../i18n/content'
import AchievementsModal from '../components/AchievementsModal'
import InsightsModal from '../components/InsightsModal'
import LanguagePickerModal from '../components/LanguagePickerModal'
import PasswordModal from '../components/PasswordModal'
import { areNotificationsEnabled, disableDailyReminders, enableDailyReminders, updatePushTokenLanguage } from '../notifications'
import { fetchMyPlaceCategoryStats, type MyPlaceCategoryStat } from '../places'
import { computeStreak } from '../storage'
import { uploadAvatar } from '../avatar'
import { cancelWeeklyRecap, scheduleWeeklyRecap } from '../weeklyRecap'
import { colors, radius, shadow } from '../theme'
import type { JournalEntry } from '../types'

interface ProfileScreenProps {
  entries: JournalEntry[]
  onRefresh?: () => Promise<void>
}

const appVersion = Constants.expoConfig?.version ?? '1.0.0'

export default function ProfileScreen({ entries, onRefresh }: ProfileScreenProps) {
  const { session, signOut, deleteAccount, updateAvatarUrl } = useAuth()
  const { t, locale } = useLocale()
  const userId = session?.user.id
  const name = (session?.user.user_metadata?.full_name as string | undefined)?.trim()
  const avatarUrl = session?.user.user_metadata?.avatar_url as string | undefined
  const [remindersOn, setRemindersOn] = useState(false)
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [insightsModalOpen, setInsightsModalOpen] = useState(false)
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [placeStats, setPlaceStats] = useState<MyPlaceCategoryStat[]>([])
  const currentLanguageName = LOCALE_OPTIONS.find((option) => option.code === locale)?.name ?? locale
  const streak = useMemo(() => computeStreak(entries), [entries])

  useEffect(() => {
    if (userId) areNotificationsEnabled(userId).then(setRemindersOn)
  }, [userId])

  useEffect(() => {
    if (userId) fetchMyPlaceCategoryStats(userId).then(setPlaceStats)
  }, [userId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      onRefresh?.(),
      userId ? areNotificationsEnabled(userId).then(setRemindersOn) : Promise.resolve(),
      userId ? fetchMyPlaceCategoryStats(userId).then(setPlaceStats) : Promise.resolve(),
    ])
    setRefreshing(false)
  }, [onRefresh, userId])

  useEffect(() => {
    if (userId && remindersOn) updatePushTokenLanguage(userId, locale)
  }, [locale, userId, remindersOn])

  useEffect(() => {
    if (remindersOn) scheduleWeeklyRecap(entries, locale)
  }, [remindersOn, entries, locale])

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

  const handlePickAvatar = async () => {
    if (!userId) return
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(t('profile.avatarPermissionTitle'), t('profile.avatarPermissionBody'))
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || !result.assets?.[0]) return

    setAvatarUploading(true)
    try {
      const url = await uploadAvatar(userId, result.assets[0].uri)
      await updateAvatarUrl(url)
    } catch {
      Alert.alert(t('profile.avatarError'))
    } finally {
      setAvatarUploading(false)
    }
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
      await cancelWeeklyRecap()
      setRemindersOn(false)
    }
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
    >
      <Pressable style={styles.avatarWrap} onPress={handlePickAvatar} disabled={avatarUploading}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{(name || session?.user.email || '?').charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.avatarEditBadge}>
          {avatarUploading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.avatarEditIcon}>📷</Text>
          )}
        </View>
      </Pressable>

      <Text style={styles.email}>{name || session?.user.email}</Text>
      {name && <Text style={styles.emailSub}>{session?.user.email}</Text>}
      <Text style={styles.memberSince}>
        {t('profile.memberSince')}: {memberSince}
      </Text>

      {streak > 0 && (
        <View style={styles.streakPill}>
          <Text style={styles.streakPillIcon}>🔥</Text>
          <Text style={styles.streakPillText}>
            {streak} {t('saved.streakSuffix')}
          </Text>
        </View>
      )}

      <View style={styles.settingsGroup}>
        <Pressable style={styles.settingRow} onPress={() => setInsightsModalOpen(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{t('insights.title')}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.settingRow} onPress={() => setAchievementsModalOpen(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{t('achievements.title')}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

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

      <View style={styles.legalRow}>
        <Pressable onPress={() => Linking.openURL(`${FUNCTIONS_BASE_URL}/legal`)}>
          <Text style={styles.legalLink}>{t('profile.privacyPolicy')}</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable onPress={() => Linking.openURL(`${FUNCTIONS_BASE_URL}/legal/terms`)}>
          <Text style={styles.legalLink}>{t('profile.termsOfUse')}</Text>
        </Pressable>
      </View>

      <Text style={styles.versionText}>
        {t('profile.version')} {appVersion}
      </Text>

      <LanguagePickerModal visible={languagePickerOpen} onClose={() => setLanguagePickerOpen(false)} />
      <PasswordModal visible={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <InsightsModal
        visible={insightsModalOpen}
        onClose={() => setInsightsModalOpen(false)}
        entries={entries}
        placeStats={placeStats}
      />
      <AchievementsModal
        visible={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        entries={entries}
        placeStats={placeStats}
      />
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
  avatarWrap: {
    width: 108,
    height: 108,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.card,
  },
  avatarText: {
    color: colors.accent,
    fontSize: 42,
    fontWeight: '800',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 54,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryDark,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  streakPill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakPillIcon: {
    fontSize: 14,
  },
  streakPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.flame,
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
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  legalLink: {
    fontSize: 12.5,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12.5,
    color: colors.muted,
  },
  versionText: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 12,
    color: colors.muted,
    opacity: 0.7,
  },
})

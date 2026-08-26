import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { useAuth } from '../authContext'
import { areNotificationsEnabled, disableDailyReminders, enableDailyReminders } from '../notifications'
import { colors, radius, shadow } from '../theme'
import type { JournalEntry } from '../types'

interface ProfileScreenProps {
  entries: JournalEntry[]
}

export default function ProfileScreen({ entries }: ProfileScreenProps) {
  const { session, signOut } = useAuth()
  const [remindersOn, setRemindersOn] = useState(false)

  useEffect(() => {
    areNotificationsEnabled().then(setRemindersOn)
  }, [])

  const memberSince = session?.user.created_at
    ? new Date(session.user.created_at).toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const toggleReminders = async (value: boolean) => {
    if (value) {
      const granted = await enableDailyReminders()
      if (!granted) {
        Alert.alert('İcazə verilmədi', 'Bildirişləri aktivləşdirmək üçün telefon ayarlarından icazə ver.')
        return
      }
      setRemindersOn(true)
    } else {
      await disableDailyReminders()
      setRemindersOn(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(session?.user.email ?? '?').charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.email}>{session?.user.email}</Text>
      <Text style={styles.memberSince}>Qeydiyyat tarixi: {memberSince}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>Gündəlik qeyd</Text>
        </View>
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Gündəlik xatırlatma</Text>
          <Text style={styles.settingHint}>Saat 08:00 və 20:00-da bildiriş</Text>
        </View>
        <Switch
          value={remindersOn}
          onValueChange={toggleReminders}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Çıxış</Text>
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

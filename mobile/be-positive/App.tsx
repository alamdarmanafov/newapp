import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'

import TabBar, { type TabKey } from './src/components/TabBar'
import TodayScreen from './src/screens/TodayScreen'
import InsightsScreen from './src/screens/InsightsScreen'
import MonthScreen from './src/screens/MonthScreen'
import ChatScreen from './src/screens/ChatScreen'
import PlacesScreen from './src/screens/PlacesScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import AuthScreen from './src/screens/AuthScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import EntryDetailScreen from './src/screens/EntryDetailScreen'
import { AuthProvider, useAuth } from './src/authContext'
import { LocaleProvider } from './src/i18n/LocaleContext'
import { computeStreak, deleteEntry, loadEntries, saveEntry, updateEntry } from './src/storage'
import type { JournalEntry } from './src/types'
import { colors } from './src/theme'

const ONBOARDING_KEY = 'be-positive/onboarding-seen'

interface MainAppProps {
  userId: string
}

function MainApp({ userId }: MainAppProps) {
  const [tab, setTab] = useState<TabKey>('insights')
  const [showToday, setShowToday] = useState(true)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    loadEntries(userId).then((loadedEntries) => {
      setEntries(loadedEntries)
      setLoaded(true)
    })
  }, [userId])

  const streak = useMemo(() => computeStreak(entries), [entries])

  const handleSave = useCallback(
    async (entry: JournalEntry) => {
      const updated = await saveEntry(entry, userId)
      setEntries(updated)
    },
    [userId]
  )

  const handleUpdateEntry = useCallback(
    async (entry: JournalEntry) => {
      const updated = await updateEntry(entry, userId)
      setEntries(updated)
      setSelectedEntry(null)
    },
    [userId]
  )

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      const updated = await deleteEntry(id, userId)
      setEntries(updated)
      setSelectedEntry(null)
    },
    [userId]
  )

  const handleRefreshEntries = useCallback(async () => {
    const refreshed = await loadEntries(userId)
    setEntries(refreshed)
  }, [userId])

  if (showToday) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <TodayScreen entries={entries} onSave={handleSave} streak={streak} onDone={() => setShowToday(false)} />
        </SafeAreaView>
        <StatusBar style="dark" />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {tab === 'insights' && <InsightsScreen entries={entries} onRefresh={handleRefreshEntries} />}
          {tab === 'chat' && <ChatScreen />}
          {tab === 'month' && <MonthScreen entries={entries} onSelectEntry={setSelectedEntry} onRefresh={handleRefreshEntries} />}
          {tab === 'places' && <PlacesScreen />}
          {tab === 'profile' && <ProfileScreen entries={entries} onRefresh={handleRefreshEntries} />}
        </View>

        <TabBar tab={tab} onChange={setTab} />
      </SafeAreaView>
      <StatusBar style="dark" />

      <EntryDetailScreen
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onSave={handleUpdateEntry}
        onDelete={handleDeleteEntry}
      />
    </View>
  )
}

function Root() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return session ? <MainApp userId={session.user.id} /> : <AuthScreen />
}

function AppBody() {
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => setOnboardingSeen(value === 'true'))
  }, [])

  const handleFinishOnboarding = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    setOnboardingSeen(true)
  }

  if (onboardingSeen === null) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  if (!onboardingSeen) {
    return <OnboardingScreen onFinish={handleFinishOnboarding} />
  }

  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}

export default function App() {
  return (
    <LocaleProvider>
      <AppBody />
    </LocaleProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'

import TabBar, { type TabKey } from './src/components/TabBar'
import TodayScreen from './src/screens/TodayScreen'
import InsightsScreen from './src/screens/InsightsScreen'
import MonthScreen from './src/screens/MonthScreen'
import ChatScreen from './src/screens/ChatScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import AuthScreen from './src/screens/AuthScreen'
import ResetPasswordScreen from './src/screens/ResetPasswordScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import EntryDetailScreen from './src/screens/EntryDetailScreen'
import { AuthProvider, useAuth } from './src/authContext'
import { LocaleProvider } from './src/i18n/LocaleContext'
import { computeStreak, deleteEntry, loadEntries, saveEntry, updateEntry } from './src/storage'
import type { JournalEntry } from './src/types'
import { colors } from './src/theme'

const ONBOARDING_KEY = 'be-positive/onboarding-seen'

function MainApp() {
  const [tab, setTab] = useState<TabKey>('today')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    loadEntries().then((loadedEntries) => {
      setEntries(loadedEntries)
      setLoaded(true)
    })
  }, [])

  const streak = useMemo(() => computeStreak(entries), [entries])

  const handleSave = useCallback(async (entry: JournalEntry) => {
    const updated = await saveEntry(entry)
    setEntries(updated)
  }, [])

  const handleUpdateEntry = useCallback(async (entry: JournalEntry) => {
    const updated = await updateEntry(entry)
    setEntries(updated)
    setSelectedEntry(null)
  }, [])

  const handleDeleteEntry = useCallback(async (id: string) => {
    const updated = await deleteEntry(id)
    setEntries(updated)
    setSelectedEntry(null)
  }, [])

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {tab === 'today' && <TodayScreen onSave={handleSave} streak={streak} />}
          {tab === 'insights' && <InsightsScreen entries={entries} />}
          {tab === 'chat' && <ChatScreen />}
          {tab === 'month' && <MonthScreen entries={entries} onSelectEntry={setSelectedEntry} />}
          {tab === 'profile' && <ProfileScreen entries={entries} />}
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
  const { session, loading, recovering } = useAuth()

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  if (recovering) return <ResetPasswordScreen />

  return session ? <MainApp /> : <AuthScreen />
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

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

import TabBar, { type TabKey } from './src/components/TabBar'
import TodayScreen from './src/screens/TodayScreen'
import InsightsScreen from './src/screens/InsightsScreen'
import MonthScreen from './src/screens/MonthScreen'
import ChatScreen from './src/screens/ChatScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import AuthScreen from './src/screens/AuthScreen'
import { AuthProvider, useAuth } from './src/authContext'
import { computeStreak, loadEntries, saveEntry } from './src/storage'
import type { JournalEntry } from './src/types'
import { colors } from './src/theme'

function MainApp() {
  const [tab, setTab] = useState<TabKey>('today')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)

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

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {tab === 'today' && <TodayScreen onSave={handleSave} streak={streak} />}
          {tab === 'insights' && <InsightsScreen entries={entries} />}
          {tab === 'chat' && <ChatScreen />}
          {tab === 'month' && <MonthScreen entries={entries} />}
          {tab === 'profile' && <ProfileScreen entries={entries} />}
        </View>

        <TabBar tab={tab} onChange={setTab} />
      </SafeAreaView>
      <StatusBar style="dark" />
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

  return session ? <MainApp /> : <AuthScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
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

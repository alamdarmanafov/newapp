import { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

import TabBar, { type TabKey } from './src/components/TabBar'
import TodayScreen from './src/screens/TodayScreen'
import HistoryScreen from './src/screens/HistoryScreen'
import { deleteEntry, loadEntries, saveEntry } from './src/storage'
import type { JournalEntry } from './src/types'
import { colors } from './src/theme'

export default function App() {
  const [tab, setTab] = useState<TabKey>('today')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadEntries().then((loadedEntries) => {
      setEntries(loadedEntries)
      setLoaded(true)
    })
  }, [])

  const handleSave = useCallback(async (entry: JournalEntry) => {
    const updated = await saveEntry(entry)
    setEntries(updated)
    setTab('history')
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const updated = await deleteEntry(id)
    setEntries(updated)
  }, [])

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Be Positive</Text>
          <Text style={styles.headerSubtitle}>Əhval + minnətdarlıq gündəliyi</Text>
        </View>

        <View style={styles.content}>
          {tab === 'today' ? (
            <TodayScreen onSave={handleSave} />
          ) : (
            <HistoryScreen entries={entries} loaded={loaded} onDelete={handleDelete} />
          )}
        </View>

        <TabBar tab={tab} onChange={setTab} />
      </SafeAreaView>
      <StatusBar style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: colors.secondary,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
})

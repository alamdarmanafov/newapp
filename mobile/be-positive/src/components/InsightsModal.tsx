import { useMemo } from 'react'
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import type { MyPlaceCategoryStat } from '../places'
import { radius, type ColorPalette } from '../theme'
import { useTheme } from '../themeContext'
import InsightsSection from './InsightsSection'

interface InsightsModalProps {
  visible: boolean
  onClose: () => void
  entries: JournalEntry[]
  placeStats: MyPlaceCategoryStat[]
}

export default function InsightsModal({ visible, onClose, entries, placeStats }: InsightsModalProps) {
  const { t } = useLocale()
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>{t('insights.title')}</Text>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <InsightsSection entries={entries} placeStats={placeStats} showHeader={false} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerSpacer: {
      width: 30,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.muted,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
  })
}

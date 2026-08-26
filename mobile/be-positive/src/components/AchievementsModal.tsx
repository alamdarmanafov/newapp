import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '../types'
import { useLocale } from '../i18n/LocaleContext'
import type { MyPlaceCategoryStat } from '../places'
import { colors, radius } from '../theme'
import AchievementsSection from './AchievementsSection'

interface AchievementsModalProps {
  visible: boolean
  onClose: () => void
  entries: JournalEntry[]
  placeStats: MyPlaceCategoryStat[]
}

export default function AchievementsModal({ visible, onClose, entries, placeStats }: AchievementsModalProps) {
  const { t } = useLocale()

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>{t('achievements.title')}</Text>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <AchievementsSection entries={entries} placeStats={placeStats} showHeader={false} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
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

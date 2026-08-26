import { StyleSheet, Text, View } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import { colors } from '../theme'

// react-native-maps has no working web target for this Expo SDK/react-native-web
// combination, so web (used only for our own dev preview, not a shipped
// platform) gets a simple placeholder instead of crashing the whole bundle.
export default function PlacesScreen() {
  const { t } = useLocale()

  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.text}>{t('places.title')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: colors.muted,
  },
})

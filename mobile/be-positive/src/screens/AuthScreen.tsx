import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { isAppleSignInAvailable, signInWithApple, signInWithGoogle } from '../socialAuth'
import { colors } from '../theme'

export default function AuthScreen() {
  const { t } = useLocale()
  const [appleAvailable, setAppleAvailable] = useState(false)
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (Platform.OS === 'ios') isAppleSignInAvailable().then(setAppleAvailable)
  }, [])

  const handleApple = async () => {
    setError(null)
    setLoading('apple')
    const message = await signInWithApple()
    setLoading(null)
    if (message) setError(message)
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading('google')
    const message = await signInWithGoogle()
    setLoading(null)
    if (message) setError(message)
  }

  return (
    <View style={styles.root}>
      <View style={styles.languageRow}>
        <LanguageSwitcher />
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{t('auth.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.buttons}>
          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleApple}
            />
          )}

          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            style={styles.googleButton}
            onPress={handleGoogle}
            disabled={loading !== null}
          />

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  languageRow: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 40,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 14,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  googleButton: {
    width: '100%',
    height: 50,
  },
  loadingRow: {
    marginTop: 4,
  },
})

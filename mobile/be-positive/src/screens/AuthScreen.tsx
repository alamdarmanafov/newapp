import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { isAppleSignInAvailable, signInWithApple, signInWithGoogle, signInWithPassword } from '../socialAuth'
import { colors, radius, shadow } from '../theme'

export default function AuthScreen() {
  const { t } = useLocale()
  const [appleAvailable, setAppleAvailable] = useState(false)
  const [loading, setLoading] = useState<'apple' | 'google' | 'password' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  const handlePasswordSignIn = async () => {
    setError(null)
    if (!email.trim() || !password) {
      setError(t('auth.errorFillFields'))
      return
    }
    setLoading('password')
    const message = await signInWithPassword(email, password)
    setLoading(null)
    if (message) setError(message)
  }

  return (
    <View style={styles.root}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.languageRow}>
            <LanguageSwitcher />
          </View>

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="cover" />
            </View>

            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.buttons}>
              {appleAvailable && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={radius.lg}
                  style={styles.appleButton}
                  onPress={handleApple}
                />
              )}

              <View style={styles.googleWrap}>
                <GoogleSigninButton
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Light}
                  style={styles.googleButton}
                  onPress={handleGoogle}
                  disabled={loading !== null}
                />
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.orDivider')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TextInput
                style={styles.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={loading === null}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={colors.muted}
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                editable={loading === null}
              />

              <Pressable style={styles.signInButton} onPress={handlePasswordSignIn} disabled={loading !== null}>
                {loading === 'password' ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>{t('auth.signInButton')}</Text>
                )}
              </Pressable>

              {(loading === 'apple' || loading === 'google') && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  blobTop: {
    width: 320,
    height: 320,
    top: -140,
    right: -100,
  },
  blobBottom: {
    width: 260,
    height: 260,
    bottom: -120,
    left: -90,
    backgroundColor: colors.surface,
  },
  languageRow: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 1,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: colors.background,
    ...shadow.card,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 44,
  },
  errorBanner: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FDECEC',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 14,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  googleWrap: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  googleButton: {
    width: '100%',
    height: 52,
  },
  loadingRow: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12.5,
    color: colors.muted,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  signInButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
  },
})

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
import Svg, { Path } from 'react-native-svg'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { isAppleSignInAvailable, signInWithApple, signInWithGoogle, signInWithPassword } from '../socialAuth'
import { colors, radius, shadow } from '../theme'

function GoogleLogo() {
  return (
    <Svg viewBox="0 0 18 18" width={18} height={18}>
      <Path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6155z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <Path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" />
      <Path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" />
    </Svg>
  )
}

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

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.orDivider')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {appleAvailable && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={radius.lg}
                  style={styles.appleButton}
                  onPress={handleApple}
                />
              )}

              <Pressable style={styles.googleButton} onPress={handleGoogle} disabled={loading !== null}>
                <GoogleLogo />
                <Text style={styles.googleButtonText}>{t('auth.googleButton')}</Text>
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
  googleButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...shadow.soft,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 15.5,
    fontWeight: '700',
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

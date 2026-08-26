import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '../authContext'
import { colors, radius, shadow } from '../theme'

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgot'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setInfo(null)

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Email daxil edin')
        return
      }
      setLoading(true)
      const message = await resetPassword(email.trim())
      setLoading(false)
      if (message) {
        setError(message)
        return
      }
      setInfo('Email-ə şifrə bərpa linki göndərildi. Poçt qutunu yoxla.')
      return
    }

    if (!email.trim() || !password) {
      setError('Email və parolu daxil edin')
      return
    }
    setLoading(true)

    if (mode === 'signIn') {
      const message = await signIn(email.trim(), password)
      setLoading(false)
      if (message) setError(message)
      return
    }

    const result = await signUp(email.trim(), password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsConfirmation) {
      setInfo('Qeydiyyat uğurlu oldu! Email-inizi yoxlayın (təsdiq linki göndərilib).')
    }
    // Otherwise a session was created immediately and Root() will switch to MainApp.
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Be Positive</Text>
        <Text style={styles.subtitle}>
          {mode === 'signIn' ? 'Hesabınıza daxil olun' : mode === 'signUp' ? 'Yeni hesab yaradın' : 'Şifrəni bərpa et'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {mode !== 'forgot' && (
          <TextInput
            style={styles.input}
            placeholder="Parol"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        )}

        {error && <Text style={styles.error}>{error}</Text>}
        {info && <Text style={styles.info}>{info}</Text>}

        <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'signIn' ? 'Daxil ol' : mode === 'signUp' ? 'Qeydiyyatdan keç' : 'Bərpa linki göndər'}
            </Text>
          )}
        </Pressable>

        {mode === 'signIn' && (
          <Pressable
            onPress={() => {
              setMode('forgot')
              setError(null)
              setInfo(null)
            }}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Şifrəni unutmusan?</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            setMode(mode === 'signUp' ? 'signIn' : mode === 'forgot' ? 'signIn' : 'signUp')
            setError(null)
            setInfo(null)
          }}
          style={styles.switchLink}
        >
          <Text style={styles.switchText}>
            {mode === 'signIn'
              ? 'Hesabınız yoxdur? Qeydiyyatdan keçin'
              : mode === 'signUp'
                ? 'Artıq hesabınız var? Daxil olun'
                : 'Daxil ol səhifəsinə qayıt'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
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
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  info: {
    color: colors.primary,
    fontSize: 13,
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    ...shadow.soft,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  forgotLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  forgotText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
})

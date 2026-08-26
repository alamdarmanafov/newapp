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
import { useLocale } from '../i18n/LocaleContext'
import { colors, radius, shadow } from '../theme'

export default function ResetPasswordScreen() {
  const { updatePassword, cancelRecovery } = useAuth()
  const { t } = useLocale()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (password.length < 6) {
      setError(t('reset.errorTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('reset.errorMismatch'))
      return
    }
    setLoading(true)
    const message = await updatePassword(password)
    setLoading(false)
    if (message) setError(message)
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('reset.title')}</Text>
        <Text style={styles.subtitle}>{t('reset.subtitle')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('reset.newPassword')}
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder={t('reset.confirmPassword')}
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>{t('reset.save')}</Text>}
        </Pressable>

        <Pressable onPress={cancelRecovery} style={styles.switchLink}>
          <Text style={styles.switchText}>{t('reset.cancel')}</Text>
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
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
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
})

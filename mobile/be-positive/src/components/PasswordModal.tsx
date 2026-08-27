import { useMemo, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import { supabase } from '../supabaseClient'
import { radius, shadow, type ColorPalette } from '../theme'
import { useTheme } from '../themeContext'

interface PasswordModalProps {
  visible: boolean
  onClose: () => void
}

export default function PasswordModal({ visible, onClose }: PasswordModalProps) {
  const { t } = useLocale()
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setPassword('')
    setConfirm('')
    setError(null)
    setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    setError(null)
    if (password.length < 6) {
      setError(t('passwordModal.errorTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('passwordModal.errorMismatch'))
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    reset()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdropTouch} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('passwordModal.title')}</Text>
          <Text style={styles.subtitle}>{t('passwordModal.subtitle')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('passwordModal.newPasswordPlaceholder')}
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder={t('passwordModal.confirmPasswordPlaceholder')}
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            value={confirm}
            onChangeText={setConfirm}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={saving}>
              <Text style={styles.cancelText}>{t('passwordModal.cancel')}</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.saveText}>{t('passwordModal.save')}</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(18, 35, 61, 0.35)',
      justifyContent: 'flex-end',
    },
    backdropTouch: {
      ...StyleSheet.absoluteFill,
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: 24,
      paddingBottom: 34,
      ...shadow.card,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.muted,
      marginBottom: 18,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: 16,
      paddingVertical: 13,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.surface,
      marginBottom: 12,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 2,
      marginBottom: 4,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 10,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: radius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelText: {
      color: colors.muted,
      fontWeight: '700',
      fontSize: 15,
    },
    saveButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: radius.lg,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    saveText: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 15,
    },
  })
}

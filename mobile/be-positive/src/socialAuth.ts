import * as AppleAuthentication from 'expo-apple-authentication'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from './config'
import { supabase } from './supabaseClient'

let googleConfigured = false
function ensureGoogleConfigured() {
  if (googleConfigured) return
  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  })
  googleConfigured = true
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync()
}

async function setNameIfMissing(name: string | null) {
  if (!name) return
  const { data } = await supabase.auth.getUser()
  if (data.user?.user_metadata?.full_name) return
  await supabase.auth.updateUser({ data: { full_name: name } })
}

export async function signInWithApple(): Promise<string | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })

    if (!credential.identityToken) return 'Apple sign-in failed'

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    })
    if (error) return error.message

    const name = credential.fullName
      ? AppleAuthentication.formatFullName(credential.fullName).trim()
      : null
    await setNameIfMissing(name || null)

    return null
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_REQUEST_CANCELED') {
      return null
    }
    return err instanceof Error ? err.message : 'Apple sign-in failed'
  }
}

export async function signInWithPassword(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return error.message
  return null
}

export async function signInWithGoogle(): Promise<string | null> {
  ensureGoogleConfigured()
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    const response = await GoogleSignin.signIn()
    if (response.type !== 'success') return null

    const idToken = response.data.idToken
    if (!idToken) return 'Google sign-in failed'

    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
    if (error) return error.message

    await setNameIfMissing(response.data.user.name)

    return null
  } catch (err: unknown) {
    return err instanceof Error ? err.message : 'Google sign-in failed'
  }
}

import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Linking } from 'react-native'
import { supabase } from './supabaseClient'

const RESET_REDIRECT_URL = 'bepositive://reset-password'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  recovering: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<string | null>
  updatePassword: (newPassword: string) => Promise<string | null>
  cancelRecovery: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function parseRecoveryTokens(url: string) {
  const fragment = url.split('#')[1]
  if (!fragment) return null
  const params = new URLSearchParams(fragment)
  const type = params.get('type')
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (type !== 'recovery' || !accessToken || !refreshToken) return null
  return { accessToken, refreshToken }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    const handleUrl = async (url: string) => {
      const tokens = parseRecoveryTokens(url)
      if (!tokens) return
      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      })
      if (!error) setRecovering(true)
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url)
    })
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => handleUrl(url))

    return () => {
      subscription.subscription.unsubscribe()
      linkingSubscription.remove()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    })
    if (error) return { error: error.message, needsConfirmation: false }
    // If email confirmation is disabled in Supabase, signUp returns a session
    // immediately; otherwise the user must confirm via email before one exists.
    return { error: null, needsConfirmation: !data.session }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_REDIRECT_URL })
    return error ? error.message : null
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setRecovering(false)
    return error ? error.message : null
  }

  const cancelRecovery = () => setRecovering(false)

  return (
    <AuthContext.Provider
      value={{ session, loading, recovering, signIn, signUp, signOut, resetPassword, updatePassword, cancelRecovery }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabaseClient'
import { FUNCTIONS_BASE_URL } from './config'
import { entriesKey } from './storage'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  updateAvatarUrl: (url: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const deleteAccount = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    const userId = data.session?.user.id
    if (!token || !userId) throw new Error('No active session')

    const response = await fetch(`${FUNCTIONS_BASE_URL}/delete-account`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}) as { error?: string })
      throw new Error(body.error || 'Failed to delete account')
    }

    await AsyncStorage.removeItem(entriesKey(userId))
    await supabase.auth.signOut()
  }

  const updateAvatarUrl = async (url: string) => {
    const { data, error } = await supabase.auth.updateUser({ data: { avatar_url: url } })
    if (error) throw error
    setSession(data.user ? { ...session!, user: data.user } : session)
  }

  return (
    <AuthContext.Provider value={{ session, loading, signOut, deleteAccount, updateAvatarUrl }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

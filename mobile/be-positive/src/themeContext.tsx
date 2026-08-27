import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { darkColors, lightColors, type ColorPalette } from './theme'

const THEME_PREF_KEY = 'be-positive/theme-preference'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedScheme = 'light' | 'dark'

interface ThemeContextValue {
  colors: ColorPalette
  scheme: ResolvedScheme
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREF_KEY).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') setPreferenceState(value)
    })
  }, [])

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref)
    AsyncStorage.setItem(THEME_PREF_KEY, pref)
  }

  const scheme: ResolvedScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference
  const colors = scheme === 'dark' ? darkColors : lightColors

  const value = useMemo(() => ({ colors, scheme, preference, setPreference }), [colors, scheme, preference])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

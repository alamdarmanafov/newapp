import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Locale } from './content'
import translations, { type TranslationKey } from './translations'

const LOCALE_KEY = 'be-positive/locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('az')

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY).then((value) => {
      if (value === 'en' || value === 'az') setLocaleState(value)
    })
  }, [])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    AsyncStorage.setItem(LOCALE_KEY, next)
  }

  const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
    interpolate(translations[locale][key], vars)

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

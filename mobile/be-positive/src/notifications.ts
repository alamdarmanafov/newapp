import Constants from 'expo-constants'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { Locale } from './i18n/content'
import { supabase } from './supabaseClient'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function areNotificationsEnabled(userId: string): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') return false

  const { data } = await supabase.from('push_tokens').select('user_id').eq('user_id', userId).maybeSingle()
  return !!data
}

// Registers this device for AI-written daily reminder pushes (sent server-side
// by the daily-notification Edge Function), instead of scheduling static
// local notifications.
export async function enableDailyReminders(userId: string, locale: Locale, name?: string): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return false

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Xatırlatmalar',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  if (!projectId) return false

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token: data,
      name: name || null,
      language: locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}

export async function updatePushTokenLanguage(userId: string, locale: Locale): Promise<void> {
  await supabase.from('push_tokens').update({ language: locale }).eq('user_id', userId)
}

export async function disableDailyReminders(userId: string): Promise<void> {
  await supabase.from('push_tokens').delete().eq('user_id', userId)
}

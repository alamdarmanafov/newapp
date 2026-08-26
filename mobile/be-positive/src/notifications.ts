import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

const MORNING_ID = 'be-positive-reminder-morning'
const EVENING_ID = 'be-positive-reminder-evening'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

export async function enableDailyReminders(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return false

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Xatırlatmalar',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => {})
  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(() => {})

  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_ID,
    content: {
      title: 'Be Positive',
      body: 'Bugünkü əhvalını qeyd et 🌤️',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 },
  })

  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_ID,
    content: {
      title: 'Be Positive',
      body: 'Günü necə keçirdin? Əhvalını qeyd et 🌙',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
  })

  return true
}

export async function disableDailyReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => {})
  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(() => {})
}

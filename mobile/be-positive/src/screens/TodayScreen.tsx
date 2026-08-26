import { useState } from 'react'
import { View } from 'react-native'
import CheckInScreen from './CheckInScreen'
import FactorsScreen from './FactorsScreen'
import SavedScreen from './SavedScreen'
import TodayLoggedScreen from './TodayLoggedScreen'
import { fetchAiCoachMessage } from '../aiCoach'
import { generateCoachMessage } from '../coach'
import { MOOD_ORDER } from '../i18n/content'
import { useLocale } from '../i18n/LocaleContext'
import { dayKey } from '../storage'
import type { JournalEntry } from '../types'

interface TodayScreenProps {
  entries: JournalEntry[]
  onSave: (entry: JournalEntry) => void
  streak: number
  onDone: () => void
}

type Step = 'checkin' | 'factors' | 'saved'

export default function TodayScreen({ entries, onSave, streak, onDone }: TodayScreenProps) {
  const { locale } = useLocale()
  const [step, setStep] = useState<Step>('checkin')
  const [moodIndex, setMoodIndex] = useState(2)
  const [factors, setFactors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [loading, setLoading] = useState(false)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null)

  const todayKey = dayKey(new Date().toISOString())
  const loggedToday = entries.find((entry) => dayKey(entry.createdAt) === todayKey)

  const toggleFactor = (label: string) => {
    setFactors((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    )
  }

  const handleFactorsContinue = async () => {
    const mood = MOOD_ORDER[moodIndex]
    setStep('saved')
    setLoading(true)

    const aiMessage = await fetchAiCoachMessage(mood, note, gratitude, locale)
    const message = aiMessage ?? generateCoachMessage(mood, note, locale)

    const entry: JournalEntry = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      mood,
      factors,
      note: note.trim(),
      gratitude: gratitude.trim(),
      coachMessage: message,
    }

    setCoachMessage(message)
    setSavedEntry(entry)
    setLoading(false)
  }

  const handleFinish = () => {
    if (savedEntry) onSave(savedEntry)
    setStep('checkin')
    setMoodIndex(2)
    setFactors([])
    setNote('')
    setGratitude('')
    setCoachMessage(null)
    setSavedEntry(null)
    onDone()
  }

  // Only one check-in per day: once today already has an entry (either from
  // a previous session, or just saved in this one), show its summary instead
  // of letting the mood picker open again. Resets automatically once the
  // date changes.
  if (step === 'checkin' && loggedToday) {
    return <TodayLoggedScreen entry={loggedToday} streak={streak} onContinue={onDone} />
  }

  return (
    <View style={{ flex: 1 }}>
      {step === 'checkin' && (
        <CheckInScreen value={moodIndex} onChange={setMoodIndex} onContinue={() => setStep('factors')} />
      )}
      {step === 'factors' && (
        <FactorsScreen
          factors={factors}
          onToggleFactor={toggleFactor}
          note={note}
          onChangeNote={setNote}
          gratitude={gratitude}
          onChangeGratitude={setGratitude}
          onContinue={handleFactorsContinue}
        />
      )}
      {step === 'saved' && (
        <SavedScreen
          loading={loading}
          coachMessage={coachMessage}
          streak={savedEntry ? streak + 1 : streak}
          onFinish={handleFinish}
        />
      )}
    </View>
  )
}

import { useState } from 'react'
import { View } from 'react-native'
import CheckInScreen from './CheckInScreen'
import FactorsScreen from './FactorsScreen'
import SavedScreen from './SavedScreen'
import { fetchAiCoachMessage } from '../aiCoach'
import { generateCoachMessage } from '../coach'
import { MOOD_OPTIONS } from '../types'
import type { JournalEntry } from '../types'

interface TodayScreenProps {
  onSave: (entry: JournalEntry) => void
  streak: number
}

type Step = 'checkin' | 'factors' | 'saved'

export default function TodayScreen({ onSave, streak }: TodayScreenProps) {
  const [step, setStep] = useState<Step>('checkin')
  const [moodIndex, setMoodIndex] = useState(2)
  const [factors, setFactors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [loading, setLoading] = useState(false)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null)

  const toggleFactor = (label: string) => {
    setFactors((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    )
  }

  const handleFactorsContinue = async () => {
    const mood = MOOD_OPTIONS[moodIndex].key
    setStep('saved')
    setLoading(true)

    const aiMessage = await fetchAiCoachMessage(mood, note, gratitude)
    const message = aiMessage ?? generateCoachMessage(mood, note)

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

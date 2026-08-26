import type { Locale } from './i18n/content'
import type { MoodKey } from './types'

interface KeywordRule {
  keywords: string[]
  message: string
}

// Matched against the user's free-text note. Order matters - first match wins.
// This is a rule-based stand-in for a real AI coach; swap `generateCoachMessage`
// with a call to an LLM backend later without touching the callers.
const KEYWORD_RULES_AZ: KeywordRule[] = [
  {
    keywords: ['yorğun', 'yorgun', 'taqətsiz', 'enerjim yox'],
    message: 'Bədənin sənə yorğun olduğunu deyir - bunu dinlə. Bu gün özünə 10 dəqiqəlik fasilə ver, bir stəkan su iç. Hər şeyi bu gün həll etmək məcburiyyətində deyilsən.',
  },
  {
    keywords: ['narahat', 'stress', 'təşviş', 'gərgin'],
    message: 'Narahatlıq keçicidir, indi hiss etdiyin şey sənin bütün günün deyil. 4 saniyə nəfəs al, 4 saniyə saxla, 4 saniyə burax - bunu 3 dəfə et. Sonra bir addım at, hamısını yox.',
  },
  {
    keywords: ['kədərli', 'üzgün', 'depressiya', 'ağlamaq'],
    message: 'Bu hissi hiss etməyə haqqın var, onu boğma. Bu gün özünlə mehriban ol - sevdiyin bir mahnı qoy və ya yaxın birinə mesaj yaz. Sabah bu gündən fərqli olacaq.',
  },
  {
    keywords: ['tənha', 'yalnız', 'kimsə yox'],
    message: 'Tənhalıq ağırdır, amma tək deyilsən. Bu gün bir yaxınına "salam, necəsən" yaz - kiçik bir addım böyük fərq yaradar.',
  },
  {
    keywords: ['hirsli', 'qəzəbli', 'əsəbi'],
    message: 'Bu hissi tanımaq artıq böyük addımdır. Reaksiya verməzdən əvvəl 60 saniyə gözlə - bu qısa fasilə sonra peşman olmayacağın seçim etməyə kömək edər.',
  },
  {
    keywords: ['xoşbəxt', 'sevinc', 'əla', 'super', 'şad'],
    message: 'Bu hissi qeyd et! Bu gün səni xoşbəxt edən şeyi yaz - gələcəkdə çətin günlərdə bu qeydə qayıda bilərsən.',
  },
]

const KEYWORD_RULES_EN: KeywordRule[] = [
  {
    keywords: ['tired', 'exhausted', 'no energy', 'drained'],
    message: "Your body is telling you it's tired - listen to it. Take a 10-minute break today and drink a glass of water. You don't have to solve everything today.",
  },
  {
    keywords: ['anxious', 'stress', 'stressed', 'tense', 'worried'],
    message: "Anxiety is temporary - what you feel right now isn't your whole day. Breathe in for 4 seconds, hold for 4, release for 4 - repeat 3 times. Then take one step, not all of them.",
  },
  {
    keywords: ['sad', 'down', 'depressed', 'crying'],
    message: "You're allowed to feel this - don't suppress it. Be kind to yourself today - play a song you love or message someone close to you. Tomorrow will be different.",
  },
  {
    keywords: ['lonely', 'alone', 'no one'],
    message: 'Loneliness is heavy, but you are not alone. Text someone close to you today, just "hi, how are you" - a small step makes a big difference.',
  },
  {
    keywords: ['angry', 'furious', 'irritated'],
    message: "Recognizing this feeling is already a big step. Wait 60 seconds before reacting - that short pause helps you choose something you won't regret.",
  },
  {
    keywords: ['happy', 'joy', 'great', 'awesome', 'glad'],
    message: 'Mark this feeling! Write down what made you happy today - you can return to this entry on harder days.',
  },
]

const FALLBACK_BY_MOOD: Record<Locale, Record<MoodKey, string>> = {
  az: {
    terrible: 'Bu gün çətindir və bu normaldır. Özünə qarşı sərt olma - kiçik bir şəfqət addımı at: rahat otur, dərin nəfəs al.',
    bad: 'Hər gün eyni olmur, bu da keçəcək. Bugünkü ən kiçik məqsədin özünə qarşı mərhəmətli olmaq olsun.',
    okay: 'Normal bir gün də dəyərlidir. Bu gün özünə minnətdar olduğun bir şeyi tap və ona fokuslan.',
    good: 'Yaxşı hiss etdiyin üçün özünü təbrik et. Bu enerjini bu gün başqası ilə paylaş - kiçik bir yaxşılıq et.',
    great: 'Əla gün keçirirsən! Bu anı qeyd et ki, çətin günlərdə xatırlaya biləsən.',
  },
  en: {
    terrible: "Today is hard, and that's okay. Don't be harsh on yourself - take one small step of compassion: sit comfortably, breathe deeply.",
    bad: "Not every day is the same, and this will pass too. Let today's smallest goal be to be gentle with yourself.",
    okay: 'An ordinary day still has value. Find one thing today you feel grateful for and focus on it.',
    good: "Congratulate yourself for feeling good. Share this energy with someone else today - do one small kindness.",
    great: "You're having a great day! Note this moment so you can look back on it during harder days.",
  },
}

export function generateCoachMessage(mood: MoodKey, note: string, locale: Locale = 'az'): string {
  const normalizedNote = note.trim().toLowerCase()
  const rules = locale === 'en' ? KEYWORD_RULES_EN : KEYWORD_RULES_AZ

  if (normalizedNote.length > 0) {
    const rule = rules.find((r) => r.keywords.some((keyword) => normalizedNote.includes(keyword)))
    if (rule) return rule.message
  }

  return FALLBACK_BY_MOOD[locale][mood]
}

import type { MoodKey } from './types'

interface KeywordRule {
  keywords: string[]
  message: string
}

// Matched against the user's free-text note. Order matters - first match wins.
// This is a rule-based stand-in for a real AI coach; swap `generateCoachMessage`
// with a call to an LLM backend later without touching the callers.
const KEYWORD_RULES: KeywordRule[] = [
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

const FALLBACK_BY_MOOD: Record<MoodKey, string> = {
  terrible: 'Bu gün çətindir və bu normaldır. Özünə qarşı sərt olma - kiçik bir şəfqət addımı at: rahat otur, dərin nəfəs al.',
  bad: 'Hər gün eyni olmur, bu da keçəcək. Bugünkü ən kiçik məqsədin özünə qarşı mərhəmətli olmaq olsun.',
  okay: 'Normal bir gün də dəyərlidir. Bu gün özünə minnətdar olduğun bir şeyi tap və ona fokuslan.',
  good: 'Yaxşı hiss etdiyin üçün özünü təbrik et. Bu enerjini bu gün başqası ilə paylaş - kiçik bir yaxşılıq et.',
  great: 'Əla gün keçirirsən! Bu anı qeyd et ki, çətin günlərdə xatırlaya biləsən.',
}

export function generateCoachMessage(mood: MoodKey, note: string): string {
  const normalizedNote = note.trim().toLowerCase()

  if (normalizedNote.length > 0) {
    const rule = KEYWORD_RULES.find((r) => r.keywords.some((keyword) => normalizedNote.includes(keyword)))
    if (rule) return rule.message
  }

  return FALLBACK_BY_MOOD[mood]
}

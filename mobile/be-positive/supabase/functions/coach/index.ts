import { corsHeaders, generateAiReply } from '../_shared/ai.ts'

const MOOD_LABELS: Record<string, Record<string, string>> = {
  az: { terrible: 'çox pis', bad: 'pis', okay: 'normal', good: 'yaxşı', great: 'əla' },
  en: { terrible: 'terrible', bad: 'bad', okay: 'okay', good: 'good', great: 'great' },
}

const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  az:
    'Sən "Be Positive" tətbiqinin mehriban, dəstəkləyici əhval-ruhiyyə koçusan. ' +
    'İstifadəçi əhvalını və qeydini paylaşır, sən Azərbaycan dilində 2-3 qısa ' +
    'cümlədən ibarət, isti və konkret bir kiçik addım təklif edən mesaj yazırsan. ' +
    'Tibbi diaqnoz qoyma, boş "hər şey yaxşı olacaq" kimi ifadələrdən qaçın, ' +
    'hissi qəbul et və real, kiçik, bu gün ediləcək bir addım təklif et.',
  en:
    'You are the friendly, supportive mood coach for the "Be Positive" app. ' +
    'The user shares their mood and a note, and you write a warm, specific message ' +
    'in English, 2-3 short sentences, suggesting one small step. Do not give medical ' +
    'diagnoses, avoid empty phrases like "everything will be fine", acknowledge the ' +
    'feeling and suggest one real, small, doable-today step.',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  let body: { mood?: string; note?: string; gratitude?: string; language?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
  }

  const language = body.language === 'en' ? 'en' : 'az'
  const mood = body.mood
  if (!mood || !(mood in MOOD_LABELS[language])) {
    return Response.json({ error: 'Invalid input' }, { status: 400, headers: corsHeaders })
  }
  const note = (body.note ?? '').slice(0, 2000)
  const gratitude = (body.gratitude ?? '').slice(0, 2000)

  const labels = language === 'en' ? { mood: 'Mood', note: 'Note', gratitude: 'Grateful for' } : { mood: 'Əhval', note: 'Qeyd', gratitude: 'Minnətdarlıq' }

  const userMessage = [
    `${labels.mood}: ${MOOD_LABELS[language][mood]}`,
    note && `${labels.note}: ${note}`,
    gratitude && `${labels.gratitude}: ${gratitude}`,
  ]
    .filter(Boolean)
    .join('\n')

  const result = await generateAiReply({ systemInstruction: SYSTEM_INSTRUCTIONS[language], message: userMessage })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status, headers: corsHeaders })
  }

  return Response.json({ message: result.text }, { headers: corsHeaders })
})

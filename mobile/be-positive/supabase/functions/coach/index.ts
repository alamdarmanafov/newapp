import { corsHeaders, generateGeminiReply } from '../_shared/gemini.ts'

const MOOD_LABELS: Record<string, string> = {
  terrible: 'çox pis',
  bad: 'pis',
  okay: 'normal',
  good: 'yaxşı',
  great: 'əla',
}

const SYSTEM_INSTRUCTION =
  'Sən "Be Positive" tətbiqinin mehriban, dəstəkləyici əhval-ruhiyyə koçusan. ' +
  'İstifadəçi əhvalını və qeydini paylaşır, sən Azərbaycan dilində 2-3 qısa ' +
  'cümlədən ibarət, isti və konkret bir kiçik addım təklif edən mesaj yazırsan. ' +
  'Tibbi diaqnoz qoyma, boş "hər şey yaxşı olacaq" kimi ifadələrdən qaçın, ' +
  'hissi qəbul et və real, kiçik, bu gün ediləcək bir addım təklif et.'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  let body: { mood?: string; note?: string; gratitude?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
  }

  const mood = body.mood
  if (!mood || !(mood in MOOD_LABELS)) {
    return Response.json({ error: 'Invalid input' }, { status: 400, headers: corsHeaders })
  }
  const note = (body.note ?? '').slice(0, 2000)
  const gratitude = (body.gratitude ?? '').slice(0, 2000)

  const userMessage = [
    `Əhval: ${MOOD_LABELS[mood]}`,
    note && `Qeyd: ${note}`,
    gratitude && `Minnətdarlıq: ${gratitude}`,
  ]
    .filter(Boolean)
    .join('\n')

  const result = await generateGeminiReply({ systemInstruction: SYSTEM_INSTRUCTION, message: userMessage })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status, headers: corsHeaders })
  }

  return Response.json({ message: result.text }, { headers: corsHeaders })
})

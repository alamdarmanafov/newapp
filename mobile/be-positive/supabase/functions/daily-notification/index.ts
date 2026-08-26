import { corsHeaders, generateGeminiReply } from '../_shared/gemini.ts'

const INSTRUCTIONS: Record<string, Record<'morning' | 'evening', string>> = {
  az: {
    morning:
      'Sən "Be Positive" adlı əhval-ruhiyyə gündəliyi tətbiqi üçün push bildiriş mətnləri yazan yaradıcı ' +
      'köməkçisən. Səhər üçün QISA (maksimum 70 simvol), maraqlı, motivasiyaedici, Azərbaycan dilində BİR ' +
      'cümlə yaz ki, istifadəçini tətbiqi açıb bu günkü əhvalını qeyd etməyə həvəsləndirsin. Hər dəfə fərqli ' +
      'üslub istifadə et: bəzən sual ver, bəzən kiçik bir müdriklik paylaş, bəzən sadəcə isti salam. Dırnaq ' +
      'işarəsi yazma, sadəcə mətnin özünü qaytar (1 uyğun emoji əlavə edə bilərsən). İstifadəçinin adını YAZMA, ' +
      'ad ayrıca əlavə ediləcək.',
    evening:
      'Sən "Be Positive" adlı əhval-ruhiyyə gündəliyi tətbiqi üçün push bildiriş mətnləri yazan yaradıcı ' +
      'köməkçisən. Axşam üçün QISA (maksimum 70 simvol), isti, düşündürücü, Azərbaycan dilində BİR cümlə ' +
      'yaz ki, istifadəçini günü necə keçdiyini düşünüb qeyd etməyə həvəsləndirsin. Hər dəfə fərqli üslub ' +
      'istifadə et: bəzən sual ver, bəzən minnətdarlığı xatırlat, bəzən sadəcə mehriban bir cümlə. Dırnaq ' +
      'işarəsi yazma, sadəcə mətnin özünü qaytar (1 uyğun emoji əlavə edə bilərsən). İstifadəçinin adını YAZMA, ' +
      'ad ayrıca əlavə ediləcək.',
  },
  en: {
    morning:
      'You are a creative assistant writing push notification copy for "Be Positive", a mood-journaling app. ' +
      'Write ONE SHORT (max 70 characters), interesting, motivating sentence in English for a morning reminder ' +
      "that encourages the user to open the app and log today's mood. Vary the style each time: sometimes ask " +
      'a question, sometimes share a small piece of wisdom, sometimes just a warm greeting. No quotation marks, ' +
      'return only the text itself (you may add 1 fitting emoji). Do NOT include the user\'s name, it will be ' +
      'added separately.',
    evening:
      'You are a creative assistant writing push notification copy for "Be Positive", a mood-journaling app. ' +
      'Write ONE SHORT (max 70 characters), warm, reflective sentence in English for an evening reminder that ' +
      'encourages the user to reflect on their day and log it. Vary the style each time: sometimes ask a ' +
      'question, sometimes reference gratitude, sometimes just a kind sentence. No quotation marks, return only ' +
      "the text itself (you may add 1 fitting emoji). Do NOT include the user's name, it will be added separately.",
  },
}

const FALLBACK: Record<string, Record<'morning' | 'evening', string>> = {
  az: { morning: 'Bugünkü əhvalını qeyd et 🌤️', evening: 'Günü necə keçirdin? Əhvalını qeyd et 🌙' },
  en: { morning: "Log today's mood 🌤️", evening: 'How was your day? Log it 🌙' },
}

interface PushToken {
  token: string
  name: string | null
  language: string | null
}

async function sendExpoPush(messages: { to: string; title: string; body: string }[]) {
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map((m) => ({ ...m, sound: 'default' }))
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(chunk),
    }).catch(() => null)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const cronSecret = Deno.env.get('CRON_SECRET')
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  let body: { slot?: 'morning' | 'evening' }
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const slot = body.slot === 'evening' ? 'evening' : 'morning'

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers: corsHeaders })
  }

  const tokensResponse = await fetch(`${supabaseUrl}/rest/v1/push_tokens?select=token,name,language`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  if (!tokensResponse.ok) {
    return Response.json({ error: 'Failed to load push tokens' }, { status: 502, headers: corsHeaders })
  }
  const rows = (await tokensResponse.json()) as PushToken[]

  if (rows.length === 0) {
    return Response.json({ sent: 0 }, { headers: corsHeaders })
  }

  // Generate one AI message per language present among registered devices,
  // then personalize the title with each user's name.
  const languages = Array.from(new Set(rows.map((r) => (r.language === 'en' ? 'en' : 'az'))))
  const textByLanguage: Record<string, string> = {}

  for (const lang of languages) {
    const instruction = INSTRUCTIONS[lang][slot]
    const result = await generateGeminiReply({
      systemInstruction: instruction,
      message: slot === 'evening' ? 'Write the evening notification.' : 'Write the morning notification.',
      maxOutputTokens: 120,
    })
    textByLanguage[lang] = 'text' in result ? result.text.replace(/^"|"$/g, '') : FALLBACK[lang][slot]
  }

  const messages = rows
    .filter((r) => r.token)
    .map((r) => {
      const lang = r.language === 'en' ? 'en' : 'az'
      const title = r.name ? `${lang === 'en' ? 'Hi' : 'Salam'}, ${r.name}!` : 'Be Positive'
      return { to: r.token, title, body: textByLanguage[lang] }
    })

  await sendExpoPush(messages)

  return Response.json({ sent: messages.length }, { headers: corsHeaders })
})

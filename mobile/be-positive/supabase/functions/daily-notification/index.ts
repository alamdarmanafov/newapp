import { corsHeaders, generateGeminiReply } from '../_shared/gemini.ts'

const MORNING_INSTRUCTION =
  'Sən "Be Positive" adlı əhval-ruhiyyə gündəliyi tətbiqi üçün push bildiriş mətnləri yazan yaradıcı ' +
  'köməkçisən. Səhər üçün QISA (maksimum 80 simvol), maraqlı, motivasiyaedici, Azərbaycan dilində BİR ' +
  'cümlə yaz ki, istifadəçini tətbiqi açıb bu günkü əhvalını qeyd etməyə həvəsləndirsin. Hər dəfə fərqli ' +
  'üslub istifadə et: bəzən sual ver, bəzən kiçik bir müdriklik paylaş, bəzən sadəcə isti salam. Dırnaq ' +
  'işarəsi, emoji izahı yazma, sadəcə mətnin özünü qaytar (1-2 uyğun emoji əlavə edə bilərsən).'

const EVENING_INSTRUCTION =
  'Sən "Be Positive" adlı əhval-ruhiyyə gündəliyi tətbiqi üçün push bildiriş mətnləri yazan yaradıcı ' +
  'köməkçisən. Axşam üçün QISA (maksimum 80 simvol), isti, düşündürücü, Azərbaycan dilində BİR cümlə ' +
  'yaz ki, istifadəçini günü necə keçdiyini düşünüb qeyd etməyə həvəsləndirsin. Hər dəfə fərqli üslub ' +
  'istifadə et: bəzən sual ver, bəzən minnətdarlığı xatırlat, bəzən sadəcə mehriban bir cümlə. Dırnaq ' +
  'işarəsi, emoji izahı yazma, sadəcə mətnin özünü qaytar (1-2 uyğun emoji əlavə edə bilərsən).'

async function sendExpoPush(tokens: string[], body: string) {
  const chunks: string[][] = []
  for (let i = 0; i < tokens.length; i += 100) chunks.push(tokens.slice(i, i + 100))

  for (const chunk of chunks) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(
        chunk.map((token) => ({ to: token, title: 'Be Positive', body, sound: 'default' }))
      ),
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

  const tokensResponse = await fetch(`${supabaseUrl}/rest/v1/push_tokens?select=token`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  if (!tokensResponse.ok) {
    return Response.json({ error: 'Failed to load push tokens' }, { status: 502, headers: corsHeaders })
  }
  const rows = (await tokensResponse.json()) as { token: string }[]
  const tokens = rows.map((row) => row.token).filter(Boolean)

  if (tokens.length === 0) {
    return Response.json({ sent: 0 }, { headers: corsHeaders })
  }

  const instruction = slot === 'evening' ? EVENING_INSTRUCTION : MORNING_INSTRUCTION
  const result = await generateGeminiReply({
    systemInstruction: instruction,
    message: slot === 'evening' ? 'Axşam bildirişi yaz.' : 'Səhər bildirişi yaz.',
    maxOutputTokens: 120,
  })

  const text =
    'text' in result
      ? result.text.replace(/^"|"$/g, '')
      : slot === 'evening'
        ? 'Günü necə keçirdin? Əhvalını qeyd et 🌙'
        : 'Bugünkü əhvalını qeyd et 🌤️'

  await sendExpoPush(tokens, text)

  return Response.json({ sent: tokens.length, message: text }, { headers: corsHeaders })
})

import { corsHeaders, generateGeminiReply } from '../_shared/gemini.ts'

const SYSTEM_INSTRUCTION =
  'Sən "Be Positive" tətbiqinin mehriban, dəstəkləyici süni intellekt köməkçisisən. ' +
  'İstifadəçi sənə istənilən mövzuda sual verə bilər. Azərbaycan dilində, isti, ' +
  'qısa və faydalı cavab yaz (2-4 cümlə). Tibbi diaqnoz qoyma.'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  let body: { message?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
  }

  const message = (body.message ?? '').trim().slice(0, 2000)
  if (!message) {
    return Response.json({ error: 'Invalid input' }, { status: 400, headers: corsHeaders })
  }

  const result = await generateGeminiReply({ systemInstruction: SYSTEM_INSTRUCTION, message })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status, headers: corsHeaders })
  }

  return Response.json({ message: result.text }, { headers: corsHeaders })
})

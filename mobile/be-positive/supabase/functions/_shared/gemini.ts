export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

interface GenerateOptions {
  systemInstruction: string
  message: string
  maxOutputTokens?: number
}

const GEMINI_MODEL = 'gemini-2.5-flash'

export async function generateGeminiReply({
  systemInstruction,
  message,
  maxOutputTokens = 1024,
}: GenerateOptions): Promise<{ text: string } | { error: string; status: number }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')?.trim()
  if (!apiKey) {
    return { error: 'AI service not configured', status: 503 }
  }

  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { maxOutputTokens, temperature: 0.8 },
        }),
      }
    )
  } catch (err) {
    return { error: `AI request failed: ${err instanceof Error ? err.message : String(err)}`, status: 502 }
  }

  if (response.status === 401 || response.status === 403) {
    return { error: 'AI service misconfigured', status: 503 }
  }
  if (response.status === 429) {
    return { error: 'Rate limited', status: 429 }
  }
  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    return { error: `AI service error (${response.status}): ${bodyText.slice(0, 300)}`, status: 502 }
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    return { error: 'Empty response from AI', status: 502 }
  }

  return { text }
}

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

const OPENAI_MODEL = 'gpt-4o-mini'

export async function generateAiReply({
  systemInstruction,
  message,
  maxOutputTokens = 1024,
}: GenerateOptions): Promise<{ text: string } | { error: string; status: number }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim()
  if (!apiKey) {
    return { error: 'AI service not configured', status: 503 }
  }

  let response: Response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message },
        ],
        max_tokens: maxOutputTokens,
        temperature: 0.8,
      }),
    })
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
  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    return { error: 'Empty response from AI', status: 502 }
  }

  return { text }
}

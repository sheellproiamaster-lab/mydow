import { OpenAI } from 'openai'

export const dynamic = 'force-dynamic'

const LANG_NAMES = {
  pt: 'português', en: 'inglês', es: 'espanhol', fr: 'francês',
  de: 'alemão', it: 'italiano', ja: 'japonês', ko: 'coreano',
  zh: 'chinês (mandarim)', ru: 'russo', ar: 'árabe', hi: 'hindi',
}

export async function POST(request) {
  const { text, fromLang, toLang, userId } = await request.json()
  if (!userId || !text?.trim()) return Response.json({ error: 'Missing params' }, { status: 400 })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const from = LANG_NAMES[fromLang] || fromLang
  const to = LANG_NAMES[toLang] || toLang

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `Você é um tradutor profissional. Traduza o texto de ${from} para ${to}. Retorne APENAS a tradução, sem comentários, sem explicações adicionais. Preserve a formatação original (parágrafos, listas, etc).` },
      { role: 'user', content: text },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  })

  return Response.json({ translation: completion.choices[0]?.message?.content || '' })
}

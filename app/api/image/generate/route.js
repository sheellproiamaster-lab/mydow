import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const WEEKLY_LIMITS = { free: 3, plus: 7, pro: Infinity }

export async function POST(request) {
  const { prompt, userId, userPlan = 'free', language = 'pt' } = await request.json()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('*').eq('user_id', userId).single()
    const limit = WEEKLY_LIMITS[userPlan] || 3
    if (ul && (ul.images_used || 0) >= limit) {
      return Response.json({ error: 'limit_reached', feature: 'images_used', limit }, { status: 429 })
    }
    if (!ul) {
      await supabase.from('usage_limits').insert({ user_id: userId, images_used: 0, docs_analyzed: 0, docs_generated: 0, week_reset_at: new Date().toISOString() })
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Traduz o prompt para inglês e preserva textos no idioma correto
  const langNames = { pt: 'português', en: 'inglês', es: 'espanhol' }
  const langStr = langNames[language] || 'português'

  const translationResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a DALL-E prompt specialist. Translate the user's image request to English for DALL-E. If the request includes text to appear in the image, keep that text in ${langStr} and write it exactly as requested. Return only the optimized English prompt, nothing else.`,
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 300,
  })

  const optimizedPrompt = translationResponse.choices[0]?.message?.content || prompt

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: optimizedPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })

  const imageUrl = response.data[0]?.url
  if (!imageUrl) return Response.json({ error: 'Erro ao gerar imagem' }, { status: 500 })

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('images_used').eq('user_id', userId).single()
    await supabase.from('usage_limits').update({ images_used: (ul?.images_used || 0) + 1 }).eq('user_id', userId)
  }

  return Response.json({ url: imageUrl })
}
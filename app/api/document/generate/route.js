import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const WEEKLY_LIMITS = { free: 3, plus: 7, pro: Infinity }

export async function POST(request) {
  const { prompt, docType = 'documento', userId, userPlan = 'free', language = 'pt' } = await request.json()
  if (!userId || !prompt) return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('*').eq('user_id', userId).single()
    const limit = WEEKLY_LIMITS[userPlan] || 3
    if (ul) {
      const resetAt = ul.week_reset_at
      if (resetAt && new Date() > new Date(new Date(resetAt).getTime() + 7 * 24 * 60 * 60 * 1000)) {
        await supabase.from('usage_limits').update({ docs_generated: 0, week_reset_at: new Date().toISOString() }).eq('user_id', userId)
      } else if ((ul.docs_generated || 0) >= limit) {
        return Response.json({ error: 'limit_reached', feature: 'docs_generated', limit }, { status: 429 })
      }
    } else {
      await supabase.from('usage_limits').insert({ user_id: userId, images_used: 0, docs_analyzed: 0, docs_generated: 0, week_reset_at: new Date().toISOString() })
    }
  }

  const langNames = { pt: 'português', en: 'inglês', es: 'espanhol' }
  const langStr = langNames[language] || 'português'

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Você é um especialista em criação de documentos. Gere um ${docType} profissional e completo. Use formatação markdown (# para títulos, ## para subtítulos, **negrito**, listas). Responda em ${langStr}.`,
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1200,
    temperature: 0.6,
  })

  const content = completion.choices[0]?.message?.content || ''

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('docs_generated').eq('user_id', userId).single()
    await supabase.from('usage_limits').update({ docs_generated: (ul?.docs_generated || 0) + 1 }).eq('user_id', userId)
  }

  return Response.json({ content, docType })
}

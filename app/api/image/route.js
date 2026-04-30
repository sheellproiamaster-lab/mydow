import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const WEEKLY_LIMITS = { free: 3, plus: 7, pro: Infinity }

export async function POST(request) {
  const { prompt, userId, userPlan = 'free' } = await request.json()
  if (!userId || !prompt) return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('*').eq('user_id', userId).single()
    const limit = WEEKLY_LIMITS[userPlan] || 3

    if (ul) {
      const resetAt = ul.week_reset_at
      if (resetAt && new Date() > new Date(new Date(resetAt).getTime() + 7 * 24 * 60 * 60 * 1000)) {
        await supabase.from('usage_limits').update({ images_used: 0, week_reset_at: new Date().toISOString() }).eq('user_id', userId)
      } else if ((ul.images_used || 0) >= limit) {
        return Response.json({ error: 'limit_reached', feature: 'images', limit }, { status: 429 })
      }
    } else {
      await supabase.from('usage_limits').insert({ user_id: userId, images_used: 0, docs_analyzed: 0, docs_generated: 0, week_reset_at: new Date().toISOString() })
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })

  const imageUrl = response.data[0]?.url
  if (!imageUrl) return Response.json({ error: 'Falha ao gerar imagem' }, { status: 500 })

  if (userPlan !== 'pro') {
    await supabase.from('usage_limits').update({ images_used: supabase.rpc ? undefined : 0 }).eq('user_id', userId)
    await supabase.rpc?.('increment_images_used', { uid: userId }).catch(() =>
      supabase.from('usage_limits').select('images_used').eq('user_id', userId).single().then(({ data }) =>
        supabase.from('usage_limits').update({ images_used: (data?.images_used || 0) + 1 }).eq('user_id', userId)
      )
    )
    const { data: ul } = await supabase.from('usage_limits').select('images_used').eq('user_id', userId).single()
    await supabase.from('usage_limits').update({ images_used: (ul?.images_used || 0) + 1 }).eq('user_id', userId)
  }

  return Response.json({ url: imageUrl })
}

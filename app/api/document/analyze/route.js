import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const WEEKLY_LIMITS = { free: 3, plus: 7, pro: Infinity }

export async function POST(request) {
  const { fileBase64, fileText, mimeType, fileName, userMessage, userId, userPlan = 'free', language = 'pt' } = await request.json()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('*').eq('user_id', userId).single()
    const limit = WEEKLY_LIMITS[userPlan] || 3
    if (ul) {
      const resetAt = ul.week_reset_at
      if (resetAt && new Date() > new Date(new Date(resetAt).getTime() + 7 * 24 * 60 * 60 * 1000)) {
        await supabase.from('usage_limits').update({ docs_analyzed: 0, week_reset_at: new Date().toISOString() }).eq('user_id', userId)
      } else if ((ul.docs_analyzed || 0) >= limit) {
        return Response.json({ error: 'limit_reached', feature: 'docs_analyzed', limit }, { status: 429 })
      }
    } else {
      await supabase.from('usage_limits').insert({ user_id: userId, images_used: 0, docs_analyzed: 0, docs_generated: 0, week_reset_at: new Date().toISOString() })
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const langNames = { pt: 'português', en: 'inglês', es: 'espanhol' }
  const langStr = langNames[language] || 'português'

  const isImage = mimeType && mimeType.startsWith('image/')
  let messages

  if (isImage && fileBase64) {
    messages = [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${fileBase64}` } },
          { type: 'text', text: userMessage || `Analise esta imagem (${fileName}) e descreva o conteúdo em detalhes. Responda em ${langStr}.` },
        ],
      },
    ]
  } else if (fileText) {
    messages = [
      {
        role: 'user',
        content: `Analise o seguinte conteúdo do arquivo "${fileName}" e ${userMessage || 'forneça um resumo detalhado'}. Responda em ${langStr}.\n\n---\n${fileText.slice(0, 12000)}`,
      },
    ]
  } else {
    messages = [
      {
        role: 'user',
        content: `O arquivo "${fileName}" foi enviado mas não pôde ser lido diretamente. Por favor informe ao usuário que arquivos PDF e DOCX precisam ter seu conteúdo copiado e colado no chat. Responda em ${langStr}.`,
      },
    ]
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 800,
  })

  const result = completion.choices[0]?.message?.content || 'Não foi possível analisar o arquivo.'

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('docs_analyzed').eq('user_id', userId).single()
    await supabase.from('usage_limits').update({ docs_analyzed: (ul?.docs_analyzed || 0) + 1 }).eq('user_id', userId)
  }

  return Response.json({ result })
}

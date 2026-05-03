import Anthropic from '@anthropic-ai/sdk'
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

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const langNames = { pt: 'português', en: 'inglês', es: 'espanhol' }
  const langStr = langNames[language] || 'português'

  const isImage = mimeType && mimeType.startsWith('image/')
  const isPdf = mimeType === 'application/pdf'
  let content

  if (isImage && fileBase64) {
    // Análise de imagem via Claude
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const mediaType = validImageTypes.includes(mimeType) ? mimeType : 'image/jpeg'
    content = [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: fileBase64 },
      },
      {
        type: 'text',
        text: userMessage || `Analise esta imagem (${fileName}) em detalhes. Descreva tudo que vê: elementos visuais, textos, cores, contexto, possíveis usos. Responda em ${langStr}.`,
      },
    ]
  } else if (isPdf && fileBase64) {
    // Análise de PDF via Claude
    content = [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 },
      },
      {
        type: 'text',
        text: userMessage || `Analise este documento PDF (${fileName}) em detalhes. Faça um resumo completo, identifique os pontos principais e forneça insights relevantes. Responda em ${langStr}.`,
      },
    ]
  } else if (fileText) {
    // Análise de texto (DOCX, TXT, etc)
    content = userMessage
      ? `${userMessage}\n\nConteúdo do arquivo "${fileName}":\n\n${fileText.slice(0, 12000)}\n\nResponda em ${langStr}.`
      : `Analise o conteúdo do arquivo "${fileName}" em detalhes. Faça um resumo completo, identifique os pontos principais e forneça insights relevantes. Responda em ${langStr}.\n\nConteúdo:\n\n${fileText.slice(0, 12000)}`
  } else {
    content = `O arquivo "${fileName}" foi enviado mas não pôde ser lido. Informe ao usuário de forma amigável que este formato pode não ser suportado e sugira converter para PDF, imagem ou texto. Responda em ${langStr}.`
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content }],
    system: `Você é o Mydow, um assistente especialista em análise de documentos e imagens criado pela Michel Macedo Holding. Faça análises detalhadas, precisas e úteis. Nunca mencione outras IAs ou tecnologias. Responda sempre em ${langStr}.`,
  })

  const result = response.content[0]?.text || 'Não foi possível analisar o arquivo.'

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('docs_analyzed').eq('user_id', userId).single()
    await supabase.from('usage_limits').update({ docs_analyzed: (ul?.docs_analyzed || 0) + 1 }).eq('user_id', userId)
  }

  return Response.json({ result })
}
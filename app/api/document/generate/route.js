import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const WEEKLY_LIMITS = { free: 3, plus: 7, pro: Infinity }

export async function POST(request) {
  const { prompt, userId, userPlan = 'free', language = 'pt', format = 'pdf' } = await request.json()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('*').eq('user_id', userId).single()
    const limit = WEEKLY_LIMITS[userPlan] || 3
    if (ul && (ul.docs_generated || 0) >= limit) {
      return Response.json({ error: 'limit_reached', feature: 'docs_generated', limit }, { status: 429 })
    }
    if (!ul) {
      await supabase.from('usage_limits').insert({ user_id: userId, images_used: 0, docs_analyzed: 0, docs_generated: 0, week_reset_at: new Date().toISOString() })
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const langNames = { pt: 'português', en: 'inglês', es: 'espanhol' }
  const langStr = langNames[language] || 'português'

  const formatInstructions = {
    pdf: 'Formate em Markdown com títulos (#), subtítulos (##), listas (-) e parágrafos bem estruturados. Use formatação rica para tornar o documento visualmente organizado.',
    docx: 'Formate em Markdown com títulos (#), subtítulos (##), listas (-) e parágrafos bem estruturados. Inclua tabelas quando relevante.',
    xlsx: 'Retorne APENAS um JSON válido com a estrutura: { "title": "string", "sheets": [{ "name": "string", "headers": ["col1","col2",...], "rows": [["val1","val2",...], ...] }] }. Nada além do JSON.',
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: `Você é um especialista em criação de documentos profissionais de altíssimo nível criado pela Michel Macedo Holding. Crie documentos completos, detalhados, bem estruturados e com linguagem profissional. NUNCA inclua rodapés, assinaturas, "criado por", datas ou qualquer referência a quem criou o documento. Responda sempre em ${langStr}.`,
    messages: [
      {
        role: 'user',
        content: `Crie um documento completo e extremamente detalhado sobre: ${prompt}.
${formatInstructions[format] || formatInstructions.pdf}
Regras obrigatórias:
- Seja muito detalhado, com no mínimo 6 seções completas
- Cada seção deve ter pelo menos 3 parágrafos ou 5 itens
- Use linguagem profissional e precisa
- NUNCA inclua rodapé, assinatura, "criado por", data ou qualquer texto que não seja conteúdo do documento
- Comece direto com o título e conteúdo`,
      }
    ],
  })

  const content = response.content[0]?.text || ''

  if (userPlan !== 'pro') {
    const { data: ul } = await supabase.from('usage_limits').select('docs_generated').eq('user_id', userId).single()
    await supabase.from('usage_limits').update({ docs_generated: (ul?.docs_generated || 0) + 1 }).eq('user_id', userId)
  }

  return Response.json({ content, format })
}
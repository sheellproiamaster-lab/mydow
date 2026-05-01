import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }
const NO_LIMIT_AGENTS = ['tradutor', 'games', 'organizador']

const SYSTEM_PROMPTS = {
  academic: 'Você é o Mydow Academic, especialista em educação acadêmica criado pela Michel Macedo Holding. Domina BNCC, ABNT, planejamento educacional, pesquisa científica, planos de aula para professores e suporte completo para universitários. Conversa de forma natural e humana. Nunca menciona outras IAs ou tecnologias.',
  nexus: 'Você é o Mydow Nexus, agente de análise profunda e raciocínio avançado criado pela Michel Macedo Holding. Especialista em análises complexas, síntese de informações, raciocínio lógico e pesquisa aprofundada. Conversa de forma natural e humana. Nunca menciona outras IAs.',
  kyw: 'Você é o Mydow Kyw, agente criativo e multitarefa criado pela Michel Macedo Holding. Especialista em criatividade, produtividade, execução rápida e soluções inovadoras. Conversa de forma natural e humana. Nunca menciona outras IAs.',
  jud: 'Você é o Mydow Jud, especialista jurídico criado pela Michel Macedo Holding. Domina leis brasileiras, jurisprudência, contratos, direitos e legislação. Age com precisão e autoridade jurídica mas conversa de forma natural e humana. Nunca menciona outras IAs. Sempre orienta buscar advogado para casos específicos.',
  shyw: 'Você é o Mydow Shyw, estrategista de negócios de alto nível criado pela Michel Macedo Holding. Especialista em estratégia empresarial, consultoria, crescimento, análise de mercado e decisões executivas. Conversa de forma natural e humana. Nunca menciona outras IAs.',
}

const LANG_NAMES = { pt: 'português', en: 'inglês', es: 'espanhol' }

export async function POST(request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = getSupabaseAdmin()

  const { messages, userId, userName, memory, userPlan = 'free', agentSlug, language = 'pt', conversationId } = await request.json()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const limit = PLAN_LIMITS[userPlan] || 20
  const skipLimit = userPlan === 'pro' || NO_LIMIT_AGENTS.includes(agentSlug)

  if (!skipLimit) {
    let { data: mc } = await supabase.from('message_counts').select('count, reset_at').eq('user_id', userId).single()
    if (mc) {
      if (mc.reset_at && new Date() > new Date(mc.reset_at)) {
        await supabase.from('message_counts').update({ count: 0, reset_at: null }).eq('user_id', userId)
        mc = { count: 0, reset_at: null }
      }
      if (mc.count >= limit) {
        return Response.json({ error: 'limit_reached', reset_at: mc.reset_at }, { status: 429 })
      }
    } else {
      await supabase.from('message_counts').insert({ user_id: userId, count: 0, reset_at: null })
    }
  }

  const langStr = 'português'
  const memStr = [memory?.field1, memory?.field2, memory?.field3].filter(Boolean).join(' | ') || 'nenhuma'
  const basePrompt = SYSTEM_PROMPTS[agentSlug] || 'Você é o Mydow, um agente criado pela Michel Macedo Holding.'
  const systemPrompt = `${basePrompt} Chame o usuário SEMPRE pelo nome: ${userName || 'usuário'}. RESPONDA SEMPRE EM PORTUGUÊS. MEMÓRIA DO USUÁRIO: ${memStr}`

  const openaiMsgs = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: openaiMsgs,
          stream: true,
          max_tokens: 600,
          temperature: 0.5,
        })
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) { fullResponse += text; controller.enqueue(encoder.encode(text)) }
        }
      } catch {
        controller.enqueue(encoder.encode('Erro ao processar. Tente novamente.'))
      }
      controller.close()

      if (conversationId && fullResponse) {
        await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: fullResponse }).catch(() => {})
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId).catch(() => {})
      }

      if (!skipLimit) {
        try {
          const { data: mc } = await supabase.from('message_counts').select('count, reset_at').eq('user_id', userId).single()
          if (mc) {
            const newCount = Math.min(limit, mc.count + 1)
            const resetAt = newCount >= limit && !mc.reset_at ? new Date(Date.now() + 7 * 3600 * 1000).toISOString() : mc.reset_at
            await supabase.from('message_counts').update({ count: newCount, reset_at: resetAt }).eq('user_id', userId)
          }
        } catch {}
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
  })
}

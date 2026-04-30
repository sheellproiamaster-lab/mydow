import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }
const NO_DECREMENT_AGENTS = ['tradutor', 'games', 'organizador']
const LANG_NAMES = { pt: 'português', en: 'inglês', es: 'espanhol' }

export async function POST(request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = getSupabaseAdmin()

  const body = await request.json()
  const { messages, userId, conversationId, userName, memory, userPlan = 'free', agentType, language = 'pt' } = body

  if (!userId) return new Response('Unauthorized', { status: 401 })

  const limit = PLAN_LIMITS[userPlan] || 20
  const skipLimit = userPlan === 'pro' || NO_DECREMENT_AGENTS.includes(agentType)

  // ── Check message count (count = messages USED, starts at 0) ──
  if (!skipLimit) {
    let { data: mc } = await supabase.from('message_counts').select('count, reset_at').eq('user_id', userId).single()

    if (mc) {
      // Reset if window expired
      if (mc.reset_at && new Date() > new Date(mc.reset_at)) {
        await supabase.from('message_counts').update({ count: 0, reset_at: null }).eq('user_id', userId)
        mc = { count: 0, reset_at: null }
      }
      // Block if limit reached
      if (mc.count >= limit) {
        return Response.json({ error: 'limit_reached', reset_at: mc.reset_at }, { status: 429 })
      }
    } else {
      // Auto-create if missing (first message)
      await supabase.from('message_counts').insert({ user_id: userId, count: 0, reset_at: null })
    }
  }

  // ── Save user message ─────────────────────────────────────────
  const lastUserMsg = messages[messages.length - 1]
  if (lastUserMsg?.role === 'user' && conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: lastUserMsg.content,
    }).catch(() => {})
  }

  // ── Build system prompt ───────────────────────────────────────
  const langStr = LANG_NAMES[language] || 'português'
  const memStr = [memory?.field1, memory?.field2, memory?.field3].filter(Boolean).join(' | ') || 'nenhuma'
  const systemPrompt = `Você é o Mydow, um agente executor criado pela Michel Macedo Holding, desenvolvido para executar tarefas com excelência. Você não menciona nenhuma outra inteligência artificial, empresa ou tecnologia. Você é apenas o Mydow. Chame o usuário SEMPRE pelo nome: ${userName || 'usuário'}. Converse de forma natural, humana e próxima. Nunca genérico. Nunca consultor sem autorização. Antes de listas, OBRIGATORIAMENTE pergunte se o usuário permite. Para perguntas com opções use: <pergunta opcoes="A|B|C">Pergunta?</pergunta>. RESPONDA SEMPRE EM ${langStr.toUpperCase()}. MEMÓRIA DO USUÁRIO: ${memStr}`

  const openaiMsgs = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ]

  // ── Stream ────────────────────────────────────────────────────
  let fullResponse = ''
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: openaiMsgs,
          stream: true,
          max_tokens: 400,
          temperature: 0.5,
        })
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) { fullResponse += text; controller.enqueue(encoder.encode(text)) }
        }
      } catch (err) {
        controller.enqueue(encoder.encode('Erro ao processar resposta. Tente novamente.'))
      }
      controller.close()

      // ── Post-stream: save assistant message + increment count ─
      if (conversationId && fullResponse) {
        await Promise.all([
          supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: fullResponse }),
          supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId),
        ]).catch(() => {})
      }

      if (!skipLimit) {
        const { data: mc } = await supabase.from('message_counts').select('count, reset_at').eq('user_id', userId).single().catch(() => ({ data: null }))
        if (mc) {
          const newCount = Math.min(limit, mc.count + 1)
          // Set reset_at when limit first reached
          const resetAt = newCount >= limit && !mc.reset_at ? new Date(Date.now() + 7 * 3600 * 1000).toISOString() : mc.reset_at
          await supabase.from('message_counts').update({ count: newCount, reset_at: resetAt }).eq('user_id', userId).catch(() => {})
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}

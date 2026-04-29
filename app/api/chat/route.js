import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }
const NO_DECREMENT_AGENTS = ['tradutor', 'games']

export async function POST(request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabaseAdmin = getSupabaseAdmin()
  const body = await request.json()
  const { messages, userId, conversationId, userName, memory, userPlan = 'free', agentType } = body

  // Verify user
  if (!userId) return new Response('Unauthorized', { status: 401 })

  // Check message count (unless pro or no-decrement agent)
  const skipLimit = userPlan === 'pro' || NO_DECREMENT_AGENTS.includes(agentType)

  if (!skipLimit) {
    const { data: mc } = await supabaseAdmin
      .from('message_counts')
      .select('count, reset_at')
      .eq('user_id', userId)
      .single()

    if (mc) {
      // Check if reset_at has passed
      if (mc.reset_at && new Date() > new Date(mc.reset_at)) {
        const limit = PLAN_LIMITS[userPlan] || 20
        await supabaseAdmin.from('message_counts').update({ count: limit, reset_at: null }).eq('user_id', userId)
      } else if (mc.count <= 0) {
        return new Response(JSON.stringify({ error: 'limit_reached', reset_at: mc.reset_at }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  // Build system prompt with memory
  const memField1 = memory?.field1 || ''
  const memField2 = memory?.field2 || ''
  const memField3 = memory?.field3 || ''

  const systemPrompt = `Você é o Mydow, um agente executor criado pela Michel Macedo Holding, desenvolvido para executar tarefas com excelência e ajudar os usuários no que precisarem. Você não menciona nenhuma outra inteligência artificial e nunca faz referência a outras empresas ou tecnologias. Você é apenas o Mydow. Você sempre chama o usuário pelo nome (${userName || 'usuário'}). Você conversa de forma natural, humana e próxima. Nunca é genérico. Nunca age como mentor ou consultor sem autorização. Sempre que precisar enviar uma lista OBRIGATORIAMENTE pergunte antes se o usuário permite. Quando precisar entender melhor o contexto faça perguntas com opções clicáveis usando este formato exato: <pergunta opcoes="Opção A|Opção B|Opção C">Sua pergunta aqui?</pergunta>. MEMÓRIA DO USUÁRIO: ${memField1} | ${memField2} | ${memField3}`

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  // Save user message
  const lastUserMessage = messages[messages.length - 1]
  if (lastUserMessage?.role === 'user' && conversationId) {
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: lastUserMessage.content,
    })
  }

  let fullResponse = ''

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: openaiMessages,
          stream: true,
          max_tokens: 400,
          temperature: 0.5,
        })

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }
        }

        // Save assistant message
        if (conversationId && fullResponse) {
          await supabaseAdmin.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
          })

          // Update conversation updated_at
          await supabaseAdmin.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
        }

        // Decrement message count
        if (!skipLimit && conversationId) {
          const { data: mc } = await supabaseAdmin.from('message_counts').select('count, reset_at').eq('user_id', userId).single()
          if (mc) {
            const newCount = Math.max(0, mc.count - 1)
            const resetAt = newCount === 0 && !mc.reset_at
              ? new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString()
              : mc.reset_at
            await supabaseAdmin.from('message_counts').update({ count: newCount, reset_at: resetAt }).eq('user_id', userId)
          }
        }

        controller.close()
      } catch (err) {
        controller.enqueue(encoder.encode('\n[Erro ao processar resposta]'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
  })
}

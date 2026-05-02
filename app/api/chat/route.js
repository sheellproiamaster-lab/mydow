import { OpenAI } from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }
const NO_DECREMENT_AGENTS = ['tradutor', 'games', 'organizador']
const LANG_NAMES = { pt: 'português', en: 'inglês', es: 'espanhol' }

// Detecta se a mensagem precisa de busca na web
function needsWebSearch(message) {
  const msg = message.toLowerCase()

  // Gatilhos explícitos do usuário
  const explicit = [
    'pesquise', 'pesquisa', 'busque', 'busca', 'encontre', 'encontra',
    'procure', 'procura', 'pesquisar', 'buscar', 'encontrar', 'procurar',
    'na internet', 'na web', 'online', 'me mostre', 'me traga',
    'search', 'find', 'look up',
  ]

  // Gatilhos temporais
  const temporal = [
    'hoje', 'agora', 'atual', 'atualmente', 'recente', 'recentemente',
    'essa semana', 'esse mês', 'esse ano', 'último', 'últimos', 'última',
    '2024', '2025', '2026', 'notícia', 'notícias', 'novidade', 'novidades',
    'lançamento', 'lançou', 'anunciou', 'anúncio',
  ]

  // Gatilhos de mercado e precisão
  const market = [
    'preço', 'valor', 'cotação', 'taxa', 'dólar', 'euro', 'bitcoin',
    'empresa', 'concorrente', 'mercado', 'tendência', 'estatística',
    'pesquisa', 'estudo', 'dado', 'dados', 'resultado', 'ranking',
    'melhor', 'top', 'mais usado', 'mais popular',
  ]

  // Gatilhos de precisão técnica
  const precision = [
    'lei', 'legislação', 'norma', 'regulamento', 'decreto',
    'médico', 'diagnóstico', 'sintoma', 'tratamento', 'remédio',
    'jurídico', 'advogado', 'processo', 'tribunal',
    'como funciona', 'o que é', 'quando foi', 'quem é', 'onde fica',
  ]

  const allTriggers = [...explicit, ...temporal, ...market, ...precision]
  return allTriggers.some(trigger => msg.includes(trigger))
}

// Chama a API da Tavily
async function searchWeb(query) {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
      }),
    })
    const data = await response.json()

    if (!data.results?.length) return null

    const summary = data.answer ? `Resposta direta: ${data.answer}\n\n` : ''
    const sources = data.results
      .slice(0, 5)
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.content?.slice(0, 300)}...\nFonte: ${r.url}`)
      .join('\n\n')

    return `${summary}Resultados da web:\n\n${sources}`
  } catch (err) {
    console.error('Tavily error:', err)
    return null
  }
}

export async function POST(request) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { messages, userId, conversationId, userName, memory, userPlan = 'free', agentType, language = 'pt' } = body

    if (!userId) return new Response('Unauthorized', { status: 401 })

    const limit = PLAN_LIMITS[userPlan] || 20
    const skipLimit = userPlan === 'pro' || NO_DECREMENT_AGENTS.includes(agentType)

    if (!skipLimit) {
      const { data: mc } = await supabase.from('message_counts').select('count, reset_at').eq('user_id', userId).single()

      if (!mc) {
        await supabase.from('message_counts').insert({ user_id: userId, count: 0, reset_at: null })
      } else {
        if (mc.reset_at && new Date() > new Date(mc.reset_at)) {
          await supabase.from('message_counts').update({ count: 0, reset_at: null }).eq('user_id', userId)
        }
        if (mc.count >= limit) {
          return Response.json({ error: 'limit_reached', reset_at: mc.reset_at }, { status: 429 })
        }
      }
    }

    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg?.role === 'user' && conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: lastUserMsg.content,
      })
    }

    // Busca na web se necessário
    let webContext = ''
    const userMessage = lastUserMsg?.content || ''
    if (needsWebSearch(userMessage)) {
      const searchResult = await searchWeb(userMessage)
      if (searchResult) {
        webContext = `\n\nINFORMAÇÕES ATUALIZADAS DA WEB (use esses dados na sua resposta):\n${searchResult}\n`
      }
    }

    const langStr = LANG_NAMES[language] || 'português'
    const memStr = [memory?.field1, memory?.field2, memory?.field3].filter(Boolean).join(' | ') || 'nenhuma'
    const systemPrompt = `Você é o Mydow, um agente executor criado pela Michel Macedo Holding, desenvolvido para executar tarefas com excelência. Você não menciona nenhuma outra inteligência artificial, empresa ou tecnologia. Você é apenas o Mydow. Chame o usuário SEMPRE pelo nome: ${userName || 'usuário'}. Converse de forma natural, humana e próxima. Nunca genérico. Nunca consultor sem autorização. Antes de listas, OBRIGATORIAMENTE pergunte se o usuário permite. Para perguntas com opções use: <pergunta opcoes="A|B|C">Pergunta?</pergunta>. RESPONDA SEMPRE EM ${langStr.toUpperCase()}. MEMÓRIA DO USUÁRIO: ${memStr}

GERAÇÃO DE DOCUMENTOS: Quando o usuário pedir para criar, redigir ou gerar qualquer documento (PDF, Word, planilha, relatório, artigo, contrato, currículo, proposta, etc), responda APENAS com [DOC] seguido do conteúdo em markdown. NUNCA escreva texto antes do [DOC]. NUNCA escreva texto após o documento. NUNCA inclua frases como "aqui está", "espero que", "criado por", datas, rodapés ou qualquer texto fora do documento. Apenas [DOC] e o conteúdo profissional completo.

GERAÇÃO DE IMAGENS: Quando o usuário pedir para gerar, criar ou desenhar uma imagem, responda APENAS com: [IMAGE_REQUEST] seguido da descrição detalhada em inglês para o DALL-E. Nada mais.${webContext}`

    const openaiMsgs = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    let fullResponse = ''
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: openaiMsgs,
            stream: true,
            max_tokens: 1500,
            temperature: 0.5,
          })
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) { fullResponse += text; controller.enqueue(encoder.encode(text)) }
          }
        } catch (err) {
          controller.enqueue(encoder.encode('Erro ao processar. Tente novamente.'))
        }
        controller.close()

        if (conversationId && fullResponse) {
          await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: fullResponse, metadata: fullResponse.includes('[DOC]') || fullResponse.includes('[IMAGE_REQUEST]') ? { hasDoc: fullResponse.includes('[DOC]'), hasImage: fullResponse.includes('[IMAGE_REQUEST]') } : null })
          await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
        }

        if (!skipLimit) {
          const { data: mc } = await supabase.from('message_counts').select('count, reset_at').eq('user_id', userId).single()
          if (mc) {
            const newCount = Math.min(limit, mc.count + 1)
            const resetAt = newCount >= limit && !mc.reset_at ? new Date(Date.now() + 7 * 3600 * 1000).toISOString() : mc.reset_at
            await supabase.from('message_counts').update({ count: newCount, reset_at: resetAt }).eq('user_id', userId)
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
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
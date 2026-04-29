import { OpenAI } from 'openai'

export async function POST() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Você é o Mydow, agente criado pela Michel Macedo Holding. Gere 5 dicas estratégicas variadas e poderosas sobre vida, negócios, produtividade e mentalidade. Cada dica deve ter um título curto e impactante e uma explicação de 2-3 frases. Retorne um array JSON no formato: [{"titulo": "...", "dica": "..."}]. Apenas o JSON, sem mais nada.',
      },
    ],
    max_tokens: 600,
    temperature: 0.8,
  })

  try {
    const content = completion.choices[0].message.content.trim()
    const tips = JSON.parse(content)
    return Response.json({ tips })
  } catch {
    return Response.json({
      tips: [
        { titulo: 'Execute, depois perfeiçoe', dica: 'A perfeição é inimiga da execução. Aja agora com o que você tem e refine no caminho.' },
        { titulo: 'Foco gera resultado', dica: 'Um único objetivo bem executado vale mais que dez projetos abandonados no meio.' },
        { titulo: 'Tempo é o seu ativo mais valioso', dica: 'Proteja suas horas com tanto cuidado quanto protegeria seu dinheiro.' },
        { titulo: 'Comunique com clareza', dica: 'Quem comunica bem lidera bem. Invista em ser claro, direto e inspirador.' },
        { titulo: 'Aprenda com cada erro', dica: 'Todo fracasso carrega uma lição. Extraia o aprendizado antes de seguir em frente.' },
      ],
    })
  }
}

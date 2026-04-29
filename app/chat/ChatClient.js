'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────── CONSTANTS ───────────────────────────
const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }
const ORANGE = '#E07B2A'
const CREAM = '#fdf0e0'
const DARK_CARD = '#fff8f0'

// ─────────────────────────── HELPERS ─────────────────────────────
function formatCountdown(resetAt) {
  if (!resetAt) return '7:00:00'
  const diff = Math.max(0, new Date(resetAt) - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Parse AI response: split into text and question blocks
function parseResponse(text) {
  const parts = []
  const regex = /<pergunta opcoes="([^"]+)">([^<]+)<\/pergunta>/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', content: text.slice(last, match.index) })
    parts.push({ type: 'question', options: match[1].split('|'), question: match[2] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) })
  return parts
}

// ─────────────────────────── TERMS MODAL ─────────────────────────
function TermsModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '580px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Termos de Uso</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#444' }}>
          {[
            ['1. Aceitação dos Termos', 'Ao acessar e utilizar o Mydow, você concorda com os presentes Termos de Uso. O Mydow é uma plataforma desenvolvida e operada pela Michel Macedo Holding. Caso não concorde com estes termos, não utilize o serviço.'],
            ['2. Descrição do Serviço', 'O Mydow é um agente executor desenvolvido para realizar tarefas de alto nível, auxiliar na tomada de decisões estratégicas e apoiar os usuários em suas demandas pessoais e profissionais. O serviço é disponibilizado em planos gratuito e pagos, com funcionalidades distintas em cada modalidade.'],
            ['3. Elegibilidade e Cadastro', 'Para utilizar o Mydow, o usuário deve ter 18 anos ou mais e fornecer informações verídicas no momento do cadastro. A Michel Macedo Holding reserva-se o direito de cancelar contas com informações falsas ou que violem estes termos.'],
            ['4. Uso Adequado da Plataforma', 'O usuário compromete-se a utilizar o Mydow de forma ética e legal. É vedado o uso da plataforma para fins ilícitos, difamatórios, discriminatórios ou que causem danos a terceiros. A Michel Macedo Holding pode suspender ou encerrar contas que violem esta cláusula.'],
            ['5. Responsabilidades do Usuário', 'O usuário é responsável por todas as interações realizadas em sua conta, pela segurança de suas credenciais de acesso e pelo conteúdo inserido na plataforma. A Michel Macedo Holding não se responsabiliza por decisões tomadas com base nas respostas do Mydow.'],
            ['6. Propriedade Intelectual', 'Toda a propriedade intelectual relacionada ao Mydow, incluindo nome, logo, interface, algoritmos e conteúdo gerado pela plataforma, pertence à Michel Macedo Holding. É proibida a reprodução, distribuição ou comercialização sem autorização expressa.'],
            ['7. Disposições Gerais', 'Estes Termos de Uso podem ser alterados a qualquer momento pela Michel Macedo Holding. Os usuários serão notificados sobre alterações relevantes. O foro competente para dirimir eventuais conflitos é o da comarca de domicílio da Michel Macedo Holding, com renúncia a qualquer outro.'],
          ].map(([title, text]) => (
            <div key={title} style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#111', display: 'block', marginBottom: '4px' }}>{title}</strong>
              <p style={{ margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── PRIVACY MODAL ───────────────────────
function PrivacyModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '580px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Política de Privacidade</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#444' }}>
          {[
            ['1. Informações Coletadas', 'O Mydow coleta nome, e-mail, dados de interação e informações de pagamento quando aplicável, todos tratados conforme a LGPD (Lei 13.709/2018).'],
            ['2. Uso das Informações', 'As informações são usadas para fornecer e melhorar o serviço, personalizar a experiência, processar pagamentos e garantir a segurança da plataforma.'],
            ['3. Armazenamento e Segurança', 'Os dados são armazenados em servidores seguros com criptografia. A Michel Macedo Holding adota medidas técnicas para proteger as informações contra acesso não autorizado.'],
            ['4. Compartilhamento de Informações', 'Não vendemos nem compartilhamos dados com terceiros para fins comerciais. O compartilhamento ocorre apenas para prestação do serviço ou por obrigação legal.'],
            ['5. Direitos do Usuário', 'Você pode acessar, corrigir, exportar ou solicitar a exclusão de seus dados a qualquer momento pelo suporte oficial do Mydow.'],
            ['6. Retenção de Dados', 'Os dados são mantidos enquanto a conta estiver ativa. Após a exclusão, são removidos conforme a legislação, exceto quando houver obrigação legal de retenção.'],
            ['7. Cookies e Tecnologias Similares', 'O Mydow utiliza cookies para autenticar usuários e garantir o funcionamento da plataforma. Cookies essenciais são necessários para o serviço.'],
            ['8. Alterações na Política', 'Esta política pode ser atualizada. Alterações significativas serão comunicadas pela plataforma ou por e-mail. O uso continuado implica aceitação da nova política.'],
            ['9. Contato', 'Para dúvidas sobre privacidade, entre em contato com a Michel Macedo Holding pelos canais oficiais de suporte do Mydow.'],
            ['10. Legislação Aplicável', 'Esta política é regida pela LGPD (Lei 13.709/2018) e demais legislações brasileiras aplicáveis, seguindo os princípios de finalidade, necessidade, transparência e segurança.'],
          ].map(([title, text]) => (
            <div key={title} style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#111', display: 'block', marginBottom: '4px' }}>{title}</strong>
              <p style={{ margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── LGPD MODAL ──────────────────────────
function LGPDModal({ user, onAccept }) {
  const [accepted, setAccepted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    if (!accepted) return
    setLoading(true)
    await onAccept()
    setLoading(false)
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '460px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="/images/mydow.png" alt="Mydow" style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '14px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '8px' }}>Termos de Uso e Política de Privacidade</h2>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Antes de continuar, você precisa aceitar nossos termos.</p>
          </div>
          <div style={{ background: '#f9f7f4', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '14px', color: '#444', lineHeight: '1.7' }}>
            Leia e aceite nossos{' '}
            <button onClick={() => setTermsOpen(true)} style={{ color: ORANGE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Termos de Uso</button>
            {' '}e nossa{' '}
            <button onClick={() => setPrivacyOpen(true)} style={{ color: ORANGE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Política de Privacidade</button>
            {' '}para continuar usando o Mydow.
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '20px', padding: '14px', border: `2px solid ${accepted ? ORANGE : '#e0d5c8'}`, borderRadius: '12px', transition: 'border-color 0.2s' }}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '1px', accentColor: ORANGE, cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>Li e aceito os Termos de Uso e a Política de Privacidade do Mydow</span>
          </label>
          <button onClick={handleAccept} disabled={!accepted || loading} style={{ width: '100%', padding: '14px', background: accepted ? ORANGE : '#d0c8bf', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: accepted ? 'pointer' : 'not-allowed', transition: 'background 0.2s', fontFamily: 'inherit' }}>
            {loading ? 'Salvando...' : 'Aceitar e Continuar'}
          </button>
        </div>
      </div>
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  )
}

// ─────────────────────────── KNOW MYDOW MODAL ────────────────────
function KnowMydowModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/mydow.png" alt="Mydow" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Conheça o Mydow</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#444' }}>
          <p style={{ marginBottom: '16px' }}>O <strong style={{ color: ORANGE }}>Mydow</strong> é um agente executor criado pela <strong>Michel Macedo Holding</strong>, desenvolvido para executar tarefas com excelência e ajudar você no que precisar — de forma humana, natural e personalizada.</p>
          <p style={{ marginBottom: '16px' }}>Diferente de assistentes comuns, o Mydow age como um parceiro estratégico. Ele entende seu contexto, aprende com suas interações e executa sem precisar de aprovação constante.</p>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Como obter os melhores resultados:</h3>
          {[
            ['Seja direto', 'Diga exatamente o que você precisa. O Mydow prefere clareza a rodeios.'],
            ['Dê contexto', 'Quanto mais contexto você fornecer, mais precisa e útil será a resposta.'],
            ['Use a Memória', 'Configure o que o Mydow deve saber sobre você na seção "Memória do Mydow" no menu.'],
            ['Explore os Agentes', 'O Mydow tem agentes especializados para diferentes tarefas. Acesse pelo menu lateral.'],
            ['Autorize listas', 'O Mydow sempre pede permissão antes de enviar listas para manter a conversa fluida.'],
          ].map(([titulo, desc]) => (
            <div key={titulo} style={{ display: 'flex', gap: '12px', marginBottom: '12px', padding: '12px', background: '#fdf8f4', borderRadius: '10px' }}>
              <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>→</span>
              <div><strong style={{ color: '#111' }}>{titulo}:</strong> {desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── PLANS MODAL ─────────────────────────
function PlansModal({ user, onClose }) {
  const plans = [
    { key: 'free', name: 'Gratuito', desc: 'Mydow Básico', msgs: '20 mensagens/dia', price: null, features: ['Chat com o Mydow', 'Acesso básico aos agentes', 'Memória personalizada'] },
    { key: 'plus', name: 'Plus', desc: 'Mydow Intermediário', msgs: '60 mensagens/dia', price: 'R$ 67/mês', features: ['Tudo do Gratuito', 'Mais mensagens diárias', 'Prioridade nas respostas', 'Acesso a todos os agentes'] },
    { key: 'pro', name: 'Pro', desc: 'Mydow Avançado', msgs: 'Mensagens ilimitadas', price: 'R$ 98/mês', badge: 'Nível Premium', features: ['Tudo do Plus', 'Mensagens ilimitadas', 'Respostas prioritárias', 'Suporte dedicado'] },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: 0 }}>Planos do Mydow</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {plans.map((plan) => {
            const isCurrent = user.plan === plan.key
            const isHighlight = plan.key === 'pro'
            return (
              <div key={plan.key} style={{ flex: '1 1 180px', border: `2px solid ${isHighlight ? ORANGE : isCurrent ? '#c0b0a0' : '#e8e0d5'}`, borderRadius: '20px', padding: '20px', background: isHighlight ? '#fff8f2' : '#fff', position: 'relative' }}>
                {plan.badge && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: ORANGE, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{plan.badge}</span>}
                {isCurrent && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#555', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Seu plano atual</span>}
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>{plan.name}</h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{plan.desc}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: ORANGE, marginBottom: '16px' }}>{plan.msgs}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.map((f) => <li key={f} style={{ fontSize: '13px', color: '#555', display: 'flex', gap: '8px', alignItems: 'flex-start' }}><span style={{ color: ORANGE, fontWeight: 700 }}>✓</span>{f}</li>)}
                </ul>
                {plan.price ? (
                  <button style={{ width: '100%', padding: '12px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{plan.price}</button>
                ) : (
                  <div style={{ width: '100%', padding: '12px', textAlign: 'center', fontSize: '14px', color: '#aaa', fontWeight: 600 }}>Plano atual</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── AGENTS MODAL ────────────────────────
const AGENTS = [
  { id: 'academic', name: 'Academic', icon: '🎓', desc: 'Pesquisa e aprendizado' },
  { id: 'nexus', name: 'Nexus', icon: '🔗', desc: 'Conexões e estratégia' },
  { id: 'kyw', name: 'Kyw', icon: '🔑', desc: 'Soluções e desbloqueios' },
  { id: 'jud', name: 'Jud', icon: '⚖️', desc: 'Análise e decisão' },
  { id: 'shyw', name: 'Shyw', icon: '✨', desc: 'Criatividade e inovação' },
  { id: 'games', name: 'Games', icon: '🎮', desc: 'Entretenimento e desafios' },
  { id: 'tradutor', name: 'Tradutor', icon: '🌐', desc: 'Tradução multilingue' },
  { id: 'organizador', name: 'Organizador', icon: '📋', desc: 'Tarefas e rotinas' },
]

function AgentsModal({ onClose, onSelectAgent }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Mydow Agentes</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {AGENTS.map((agent) => (
            <button key={agent.id} onClick={() => { onSelectAgent(agent); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', border: '1.5px solid #e8e0d5', borderRadius: '14px', background: '#fdf9f5', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.background = '#fff8f2' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e0d5'; e.currentTarget.style.background = '#fdf9f5' }}
            >
              <span style={{ fontSize: '24px' }}>{agent.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{agent.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{agent.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '16px', margin: '16px 0 0' }}>Interfaces completas em breve</p>
      </div>
    </div>
  )
}

// ─────────────────────────── TIPS MODAL ──────────────────────────
function TipsModal({ onClose }) {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTips = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tips', { method: 'POST' })
      const data = await res.json()
      setTips(data.tips || [])
    } catch {
      setTips([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadTips() }, [loadTips])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Dicas do Mydow</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={loadTips} disabled={loading} style={{ padding: '7px 14px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : '↺ Atualizar'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
          </div>
        </div>
        <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Gerando dicas...</div>
          ) : tips.map((tip, i) => (
            <div key={i} style={{ padding: '16px', background: '#fdf8f4', borderRadius: '14px', borderLeft: `4px solid ${ORANGE}` }}>
              <strong style={{ fontSize: '14px', color: '#111', display: 'block', marginBottom: '6px' }}>{tip.titulo}</strong>
              <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: '1.6' }}>{tip.dica}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── MEMORIA MODAL ───────────────────────
function MemoriaModal({ user, memory, onClose, onSave }) {
  const [fields, setFields] = useState({ field1: memory?.field1 || '', field2: memory?.field2 || '', field3: memory?.field3 || '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(fields)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Memória do Mydow</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {[['field1', 'O que o Mydow precisa saber sobre você?'], ['field2', 'Como você deseja que o Mydow seja?'], ['field3', 'O que o Mydow não pode fazer?']].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>{label}</label>
              <textarea value={fields[key]} onChange={(e) => setFields(f => ({ ...f, [key]: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e0d5c8', fontSize: '14px', fontFamily: 'inherit', color: '#333', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = ORANGE}
                onBlur={(e) => e.target.style.borderColor = '#e0d5c8'}
              />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '13px', background: saved ? '#27ae60' : ORANGE, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.3s' }}>
          {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
        </button>
        <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '12px', lineHeight: '1.5' }}>Todas as informações que você fornecer serão implementadas na memória do Mydow</p>
      </div>
    </div>
  )
}

// ─────────────────────────── SETTINGS MODAL ──────────────────────
function SettingsModal({ user, onClose, settings, onUpdateSettings, onDeleteAccount }) {
  const [sub, setSub] = useState(null)

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '400px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>Configurações</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'appearance', label: '🌓 Aparência', desc: settings.theme === 'dark' ? 'Modo escuro' : 'Modo claro' },
              { id: 'language', label: '🌐 Idioma', desc: settings.language === 'pt' ? 'Português' : settings.language === 'en' ? 'English' : 'Español' },
              { id: 'font', label: '🔤 Fonte', desc: settings.fontSize === 'small' ? 'Pequena' : settings.fontSize === 'large' ? 'Grande' : 'Normal' },
              { id: 'lgpd', label: '📋 LGPD', desc: 'Termos e privacidade' },
              { id: 'delete', label: '🗑 Excluir Conta', desc: 'Remover todos os dados', danger: true },
            ].map((item) => (
              <button key={item.id} onClick={() => setSub(item.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1.5px solid #e8e0d5', borderRadius: '12px', background: '#fdf9f5', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = item.danger ? '#e74c3c' : ORANGE}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e8e0d5'}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: item.danger ? '#e74c3c' : '#111' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{item.desc}</div>
                </div>
                <span style={{ color: '#ccc' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {sub === 'appearance' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111' }}>Aparência</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {['light', 'dark'].map((t) => (
              <button key={t} onClick={() => { onUpdateSettings({ theme: t }); setSub(null) }} style={{ width: '100%', padding: '12px', marginBottom: '8px', border: `2px solid ${settings.theme === t ? ORANGE : '#e0d5c8'}`, borderRadius: '12px', background: settings.theme === t ? '#fff8f2' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#111' }}>
                {t === 'light' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'language' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111' }}>Idioma</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {[['pt', '🇧🇷 Português'], ['en', '🇺🇸 English'], ['es', '🇪🇸 Español']].map(([lang, label]) => (
              <button key={lang} onClick={() => { onUpdateSettings({ language: lang }); setSub(null) }} style={{ width: '100%', padding: '12px', marginBottom: '8px', border: `2px solid ${settings.language === lang ? ORANGE : '#e0d5c8'}`, borderRadius: '12px', background: settings.language === lang ? '#fff8f2' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#111' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'font' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111' }}>Tamanho da Fonte</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {[['small', 'Pequena', '13px'], ['normal', 'Normal', '15px'], ['large', 'Grande', '17px']].map(([size, label, example]) => (
              <button key={size} onClick={() => { onUpdateSettings({ fontSize: size }); setSub(null) }} style={{ width: '100%', padding: '12px', marginBottom: '8px', border: `2px solid ${settings.fontSize === size ? ORANGE : '#e0d5c8'}`, borderRadius: '12px', background: settings.fontSize === size ? '#fff8f2' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: example, fontWeight: 600, color: '#111' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'lgpd' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '380px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111' }}>LGPD</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '12px' }}>
              <strong>Aceito em:</strong> {user.accepted_at ? new Date(user.accepted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data não registrada'}
            </p>
            <LGPDLinks />
          </div>
        </div>
      )}

      {sub === 'delete' && (
        <DeleteAccountModal user={user} onClose={() => setSub(null)} onConfirm={onDeleteAccount} />
      )}
    </>
  )
}

function LGPDLinks() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  return (
    <>
      <button onClick={() => setTermsOpen(true)} style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '8px', border: `1.5px solid ${ORANGE}`, borderRadius: '12px', background: '#fff8f2', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: ORANGE }}>Ver Termos de Uso</button>
      <button onClick={() => setPrivacyOpen(true)} style={{ display: 'block', width: '100%', padding: '12px', border: `1.5px solid ${ORANGE}`, borderRadius: '12px', background: '#fff8f2', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: ORANGE }}>Ver Política de Privacidade</button>
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  )
}

function DeleteAccountModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😢</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Tem certeza que quer excluir o Mydow da sua vida?</h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', fontStyle: 'italic' }}>Pense bem antes de tomar essa decisão.</p>
        <button onClick={onClose} style={{ width: '100%', padding: '14px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px' }}>
          Quero continuar usando o Mydow
        </button>
        <button onClick={handleDelete} disabled={loading} style={{ width: '100%', padding: '14px', background: 'none', color: '#e74c3c', border: '1.5px solid #e74c3c', borderRadius: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Excluindo...' : 'Quero excluir minha conta'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── CONFIRM DELETE CONV MODAL ───────────
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', marginBottom: '20px' }}>Excluir esta conversa?</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', border: '1.5px solid #e0d5c8', borderRadius: '12px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#666' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '12px', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700 }}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── SIDE MENU ───────────────────────────
function SideMenu({ open, onClose, user, conversations, msgCount, onNewConversation, onSelectConversation, onDeleteConversation, onFavoriteConversation, onRenameConversation, onOpenAgents, onOpenTips, onOpenUpgrade, onOpenMemoria, onOpenSettings, onLogout }) {
  const [optionsOpenId, setOptionsOpenId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const menuRef = useRef(null)
  const limit = PLAN_LIMITS[user.plan] || 20
  const remaining = msgCount?.count ?? limit
  const resetAt = msgCount?.reset_at
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!resetAt || remaining > 0) return
    const timer = setInterval(() => setCountdown(formatCountdown(resetAt)), 1000)
    setCountdown(formatCountdown(resetAt))
    return () => clearInterval(timer)
  }, [resetAt, remaining])

  useEffect(() => {
    function handleClick(e) {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  const startRename = (conv) => { setRenamingId(conv.id); setRenameVal(conv.title); setOptionsOpenId(null) }
  const submitRename = () => { if (renameVal.trim()) onRenameConversation(renamingId, renameVal.trim()); setRenamingId(null) }

  const sortedConvs = [...conversations].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1
    if (!a.is_favorite && b.is_favorite) return 1
    return new Date(b.updated_at) - new Date(a.updated_at)
  })

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100dvh', width: '50%', maxWidth: '320px', background: '#fff', zIndex: 60, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', boxShadow: open ? '4px 0 30px rgba(0,0,0,0.15)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={menuRef}>

        {/* Header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0e8dd' }}>
          <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Olá,</p>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>{user.name || 'Usuário'}</p>
        </div>

        {/* Nova Conversa */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0e8dd' }}>
          <button onClick={() => { onNewConversation(); onClose(); }} style={{ width: '100%', padding: '11px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Nova Conversa</button>
        </div>

        {/* Conversations list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {sortedConvs.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#ccc', textAlign: 'center', padding: '20px 0' }}>Nenhuma conversa ainda</p>
          ) : sortedConvs.map((conv) => (
            <div key={conv.id} style={{ position: 'relative' }}>
              {renamingId === conv.id ? (
                <div style={{ display: 'flex', gap: '6px', padding: '6px 0' }}>
                  <input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitRename()} autoFocus style={{ flex: 1, padding: '7px 10px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
                  <button onClick={submitRename} style={{ padding: '7px 10px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>✓</button>
                  <button onClick={() => setRenamingId(null)} style={{ padding: '7px 10px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '8px', marginBottom: '2px', background: optionsOpenId === conv.id ? '#fff8f2' : 'transparent', cursor: 'pointer' }}>
                  <div onClick={() => { onSelectConversation(conv.id); onClose(); setOptionsOpenId(null) }} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {conv.is_favorite && <span style={{ color: '#f39c12', fontSize: '12px' }}>★</span>}
                      <span style={{ fontSize: '13px', color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{conv.title}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setOptionsOpenId(optionsOpenId === conv.id ? null : conv.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: '16px', color: '#aaa', flexShrink: 0 }}>›</button>
                </div>
              )}
              {optionsOpenId === conv.id && (
                <div style={{ position: 'absolute', right: '0', top: '100%', background: '#fff', border: '1px solid #e8e0d5', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '150px', overflow: 'hidden' }}>
                  <button onClick={() => { onFavoriteConversation(conv.id, !conv.is_favorite); setOptionsOpenId(null) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', color: conv.is_favorite ? '#f39c12' : '#555' }}>
                    {conv.is_favorite ? '★' : '☆'} {conv.is_favorite ? 'Desfavoritar' : 'Favoritar'}
                  </button>
                  <button onClick={() => startRename(conv)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', color: '#555', borderTop: '1px solid #f0e8dd' }}>✏️ Renomear</button>
                  <button onClick={() => { setConfirmDeleteId(conv.id); setOptionsOpenId(null) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', color: '#e74c3c', borderTop: '1px solid #f0e8dd' }}>🗑 Excluir</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f0e8dd', margin: '0 16px' }} />

        {/* Menu items */}
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { label: '🤖 Mydow Agentes', action: onOpenAgents },
            { label: '💡 Dicas do Mydow', action: onOpenTips },
          ].map((item) => (
            <button key={item.label} onClick={item.action} style={{ display: 'block', width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#333', textAlign: 'left', borderRadius: '10px' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fdf8f4'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >{item.label}</button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f0e8dd', margin: '0 16px' }} />

        {/* Usage */}
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px', fontWeight: 600 }}>Uso do Mydow</p>
          {user.plan === 'pro' ? (
            <p style={{ fontSize: '13px', color: '#27ae60', fontWeight: 600, margin: 0 }}>Ilimitado ✓</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>{remaining}/{limit} mensagens</span>
                {remaining === 0 && <span style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 600 }}>{countdown}</span>}
              </div>
              <div style={{ height: '6px', background: '#f0e8dd', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(remaining / limit) * 100}%`, background: remaining === 0 ? '#e74c3c' : ORANGE, borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
              {remaining === 0 && <button onClick={onOpenUpgrade} style={{ marginTop: '8px', width: '100%', padding: '8px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Fazer Upgrade</button>}
            </>
          )}
        </div>

        <button onClick={onOpenUpgrade} style={{ margin: '0 12px', padding: '11px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⚡ Fazer Upgrade</button>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f0e8dd', margin: '10px 16px' }} />

        {/* Bottom items */}
        <div style={{ padding: '4px 12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { label: '🧠 Memória do Mydow', action: onOpenMemoria },
            { label: '⚙️ Configurações', action: onOpenSettings },
          ].map((item) => (
            <button key={item.label} onClick={item.action} style={{ display: 'block', width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#333', textAlign: 'left', borderRadius: '10px' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fdf8f4'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >{item.label}</button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0e8dd' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{user.name}</p>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'none', border: '1.5px solid #e0d5c8', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>Sair</button>
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmDeleteModal
          onConfirm={() => { onDeleteConversation(confirmDeleteId); setConfirmDeleteId(null) }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </>
  )
}

// ─────────────────────────── MESSAGE BUBBLE ──────────────────────
function MessageBubble({ msg, userName, onCopy, onRefresh }) {
  const isUser = msg.role === 'user'
  const parts = isUser ? [{ type: 'text', content: msg.content }] : parseResponse(msg.content)

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', gap: '10px', alignItems: 'flex-start' }}>
      {!isUser && (
        <img src="/images/mydow.png" alt="Mydow" style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0, marginTop: '4px' }} />
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={{ background: isUser ? ORANGE : '#fff', color: isUser ? '#fff' : '#111', borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '14px', lineHeight: '1.6' }}>
          {parts.map((part, i) => (
            part.type === 'text' ? (
              <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.content}</span>
            ) : (
              <div key={i} style={{ marginTop: '12px', marginBottom: '8px' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px', color: isUser ? '#fff' : '#111' }}>{part.question}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {part.options.map((opt) => (
                    <button key={opt} onClick={() => onCopy?.(opt, true)} style={{ padding: '6px 12px', background: '#fff8f2', border: `1.5px solid ${ORANGE}`, borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: ORANGE, cursor: 'pointer', fontFamily: 'inherit' }}>{opt}</button>
                  ))}
                  <button onClick={() => {}} style={{ padding: '6px 12px', background: '#f5f5f5', border: '1.5px solid #ddd', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#777', cursor: 'pointer', fontFamily: 'inherit' }}>Outro</button>
                </div>
              </div>
            )
          ))}
        </div>
        {!isUser && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', paddingLeft: '4px' }}>
            {[
              { icon: '📋', title: 'Copiar', action: () => navigator.clipboard.writeText(msg.content) },
              { icon: '👍', title: 'Gostei', action: () => {} },
              { icon: '👎', title: 'Não gostei', action: () => {} },
              { icon: '↻', title: 'Atualizar', action: () => onRefresh?.(msg) },
            ].map((btn) => (
              <button key={btn.icon} title={btn.title} onClick={btn.action} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px', borderRadius: '4px', opacity: 0.5, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              >{btn.icon}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────── CHAT HOME ───────────────────────────
function ChatHome({ user, msgCount, onStartConversation, onOpenSideMenu, onOpenUpgrade, onOpenKnowMydow, onOpenAgents }) {
  const limit = PLAN_LIMITS[user.plan] || 20
  const remaining = msgCount?.count ?? limit
  const isLimited = remaining <= 0 && user.plan !== 'pro'

  const suggestions = [
    'Me ajude a organizar minha rotina',
    'Quero criar um plano estratégico',
    'Quero aprender algo novo hoje',
    'Me ajude a analisar um problema complexo',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: CREAM }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', flexShrink: 0 }}>
        <button onClick={onOpenSideMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ width: '22px', height: '2px', background: '#555', borderRadius: '1px' }} />
          <div style={{ width: '22px', height: '2px', background: '#555', borderRadius: '1px' }} />
          <div style={{ width: '22px', height: '2px', background: '#555', borderRadius: '1px' }} />
        </button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onOpenKnowMydow} style={{ padding: '8px 14px', background: 'none', border: '1.5px solid #e0d5c8', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>Conheça o Mydow</button>
          <button onClick={onOpenUpgrade} style={{ padding: '8px 16px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⚡ Fazer Upgrade</button>
        </div>
      </div>

      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
        <img src="/images/mydow.png" alt="Mydow" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }} />
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: ORANGE, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Mydow</h1>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '28px', textAlign: 'center' }}>Olá, {user.name}! O que vamos executar hoje?</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%', maxWidth: '600px', marginBottom: '12px' }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => onStartConversation(s)} disabled={isLimited} style={{ padding: '16px', background: '#fff', border: '1.5px solid #e8e0d5', borderRadius: '16px', fontSize: '14px', color: '#333', cursor: isLimited ? 'not-allowed' : 'pointer', textAlign: 'left', fontFamily: 'inherit', lineHeight: '1.4', transition: 'all 0.2s', opacity: isLimited ? 0.5 : 1 }}
              onMouseEnter={(e) => { if (!isLimited) { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.background = '#fff8f2' } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e0d5'; e.currentTarget.style.background = '#fff' }}
            >{s}</button>
          ))}
          <button onClick={onOpenAgents} style={{ padding: '16px', background: '#fff8f2', border: `1.5px solid ${ORANGE}`, borderRadius: '16px', fontSize: '14px', color: ORANGE, fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', lineHeight: '1.4', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff0e0' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff8f2' }}
          >🤖 Mydow Agentes</button>
        </div>

        {isLimited && (
          <div style={{ padding: '14px 20px', background: '#fff3f0', border: '1.5px solid #e74c3c', borderRadius: '14px', textAlign: 'center', maxWidth: '400px' }}>
            <p style={{ fontSize: '14px', color: '#c0392b', fontWeight: 600, margin: '0 0 8px' }}>Você atingiu seu limite diário.</p>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 10px' }}>Reset em: <strong style={{ color: '#555' }}>{formatCountdown(msgCount?.reset_at)}</strong></p>
            <button onClick={onOpenUpgrade} style={{ padding: '8px 20px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Fazer Upgrade</button>
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSend={onStartConversation} disabled={isLimited} />
    </div>
  )
}

// ─────────────────────────── CHAT INPUT ──────────────────────────
function ChatInput({ onSend, disabled, placeholder = 'Digite sua mensagem...' }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSend = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px' }
  }

  return (
    <div style={{ padding: '12px 16px 20px', background: CREAM, borderTop: '1px solid #e8e0d5', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#fff', border: `1.5px solid ${disabled ? '#e0d5c8' : '#e8e0d5'}`, borderRadius: '18px', padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <textarea ref={textareaRef} value={value} onChange={handleInput} onKeyDown={handleKeyDown} disabled={disabled} placeholder={disabled ? 'Limite atingido' : placeholder} rows={1} style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#333', background: 'transparent', lineHeight: '1.5', maxHeight: '120px', overflow: 'hidden' }} />
        <button onClick={handleSend} disabled={disabled || !value.trim()} style={{ padding: '8px 16px', background: disabled || !value.trim() ? '#e0d5c8' : ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'background 0.2s' }}>
          Enviar
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── CONVERSATION VIEW ───────────────────
function ConversationView({ messages, isStreaming, onSend, onOpenSideMenu, onOpenUpgrade, onOpenKnowMydow, user, msgCount }) {
  const bottomRef = useRef(null)
  const limit = PLAN_LIMITS[user.plan] || 20
  const remaining = msgCount?.count ?? limit
  const isLimited = remaining <= 0 && user.plan !== 'pro'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: CREAM }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e8e0d5', flexShrink: 0, background: CREAM }}>
        <button onClick={onOpenSideMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ width: '22px', height: '2px', background: '#555', borderRadius: '1px' }} />
          <div style={{ width: '22px', height: '2px', background: '#555', borderRadius: '1px' }} />
          <div style={{ width: '22px', height: '2px', background: '#555', borderRadius: '1px' }} />
        </button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onOpenKnowMydow} style={{ padding: '8px 14px', background: 'none', border: '1.5px solid #e0d5c8', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>Conheça o Mydow</button>
          <button onClick={onOpenUpgrade} style={{ padding: '8px 16px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⚡ Fazer Upgrade</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} msg={msg} userName={user.name} onCopy={(text, send) => { if (send) onSend(text) }} />
        ))}
        {isStreaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <img src="/images/mydow.png" alt="Mydow" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <div style={{ background: '#fff', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Mydow está executando</span>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: '5px', height: '5px', background: ORANGE, borderRadius: '50%', display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        {isLimited && (
          <div style={{ padding: '14px 20px', background: '#fff3f0', border: '1.5px solid #e74c3c', borderRadius: '14px', textAlign: 'center', margin: '10px 0' }}>
            <p style={{ fontSize: '14px', color: '#c0392b', fontWeight: 600, margin: '0 0 8px' }}>Você atingiu seu limite diário. Faça upgrade para continuar.</p>
            <button onClick={onOpenUpgrade} style={{ padding: '8px 20px', background: ORANGE, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Fazer Upgrade</button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={isLimited || isStreaming} placeholder="Continue a conversa..." />

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}

// ─────────────────────────── MAIN CLIENT ─────────────────────────
export default function ChatClient({ user, messageCount, memory: initialMemory, conversations: initialConversations }) {
  const router = useRouter()
  const supabase = createClient()

  const [view, setView] = useState('home')
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversations, setConversations] = useState(initialConversations || [])
  const [msgCount, setMsgCount] = useState(messageCount || { count: 20, reset_at: null })
  const [userMemory, setUserMemory] = useState(initialMemory || { field1: '', field2: '', field3: '' })
  const [settings, setSettings] = useState({ theme: 'light', language: 'pt', fontSize: 'normal' })

  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [lgpdOpen, setLgpdOpen] = useState(!user.accepted_terms)
  const [plansOpen, setPlansOpen] = useState(false)
  const [knowMydowOpen, setKnowMydowOpen] = useState(false)
  const [memoriaOpen, setMemoriaOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [agentsOpen, setAgentsOpen] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)

  const openMenuRef = useRef(null)

  const fontSize = settings.fontSize === 'small' ? '13px' : settings.fontSize === 'large' ? '17px' : '15px'

  // ── LGPD accept ──────────────────────────────────────────────
  const handleLGPDAccept = async () => {
    await supabase.from('users').update({ accepted_terms: true, accepted_at: new Date().toISOString() }).eq('id', user.id)
    setLgpdOpen(false)
  }

  // ── New conversation ──────────────────────────────────────────
  const handleNewConversation = () => {
    setView('home')
    setActiveConvId(null)
    setMessages([])
  }

  // ── Select existing conversation ──────────────────────────────
  const handleSelectConversation = async (convId) => {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
    setActiveConvId(convId)
    setView('conversation')
  }

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (isStreaming) return

    let convId = activeConvId

    // Create conversation if needed
    if (!convId) {
      const title = text.length > 42 ? text.slice(0, 39) + '...' : text
      const { data: newConv } = await supabase.from('conversations').insert({
        user_id: user.id, title, is_favorite: false,
      }).select().single()

      if (!newConv) return
      convId = newConv.id
      setActiveConvId(convId)
      setConversations((prev) => [newConv, ...prev])
      setView('conversation')
    }

    // Add user message to UI
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])

    // Start streaming
    setIsStreaming(true)
    const assistantMsgId = `a-${Date.now()}`
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          userId: user.id,
          conversationId: convId,
          userName: user.name,
          memory: userMemory,
          userPlan: user.plan,
        }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId))
        setMsgCount((prev) => ({ ...prev, count: 0, reset_at: data.reset_at }))
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        full += chunk
        setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: full } : m))
      }

      // Update message count in state
      setMsgCount((prev) => {
        if (user.plan === 'pro') return prev
        const newCount = Math.max(0, prev.count - 1)
        const resetAt = newCount === 0 && !prev.reset_at
          ? new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString()
          : prev.reset_at
        return { ...prev, count: newCount, reset_at: resetAt }
      })

      // Update conversation in list
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c))
    } catch (err) {
      setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: 'Erro ao conectar. Tente novamente.' } : m))
    }

    setIsStreaming(false)
  }, [activeConvId, isStreaming, messages, user, userMemory, supabase])

  // ── Delete conversation ───────────────────────────────────────
  const handleDeleteConversation = async (convId) => {
    await supabase.from('messages').delete().eq('conversation_id', convId)
    await supabase.from('conversations').delete().eq('id', convId)
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    if (activeConvId === convId) handleNewConversation()
  }

  // ── Favorite conversation ─────────────────────────────────────
  const handleFavoriteConversation = async (convId, fav) => {
    await supabase.from('conversations').update({ is_favorite: fav }).eq('id', convId)
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, is_favorite: fav } : c))
  }

  // ── Rename conversation ───────────────────────────────────────
  const handleRenameConversation = async (convId, title) => {
    await supabase.from('conversations').update({ title }).eq('id', convId)
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, title } : c))
  }

  // ── Save memory ───────────────────────────────────────────────
  const handleSaveMemory = async (fields) => {
    await supabase.from('memory').upsert({ user_id: user.id, ...fields, updated_at: new Date().toISOString() })
    setUserMemory(fields)
  }

  // ── Update settings ───────────────────────────────────────────
  const handleUpdateSettings = (patch) => setSettings((prev) => ({ ...prev, ...patch }))

  // ── Delete account ────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    await supabase.from('messages').delete().eq('conversation_id', conversations.map((c) => c.id))
    await supabase.from('conversations').delete().eq('user_id', user.id)
    await supabase.from('memory').delete().eq('user_id', user.id)
    await supabase.from('message_counts').delete().eq('user_id', user.id)
    await supabase.from('users').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Select agent ──────────────────────────────────────────────
  const handleSelectAgent = (agent) => {
    const welcomeMsg = `Olá, ${user.name}! Eu sou o agente ${agent.name}. Estou aqui para ajudar com ${agent.desc.toLowerCase()}. O que você precisa?`
    handleNewConversation()
    setTimeout(() => handleSend(`Ativar agente ${agent.name}`), 100)
  }

  const bgColor = settings.theme === 'dark' ? '#1a1a1a' : CREAM

  return (
    <div style={{ fontSize, background: bgColor, minHeight: '100dvh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* LGPD Modal - blocking */}
      {lgpdOpen && <LGPDModal user={user} onAccept={handleLGPDAccept} />}

      {/* Side Menu */}
      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        user={user}
        conversations={conversations}
        msgCount={msgCount}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onFavoriteConversation={handleFavoriteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenAgents={() => setAgentsOpen(true)}
        onOpenTips={() => setTipsOpen(true)}
        onOpenUpgrade={() => setPlansOpen(true)}
        onOpenMemoria={() => setMemoriaOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main view */}
      {view === 'home' ? (
        <ChatHome
          user={user}
          msgCount={msgCount}
          onStartConversation={handleSend}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onOpenUpgrade={() => setPlansOpen(true)}
          onOpenKnowMydow={() => setKnowMydowOpen(true)}
          onOpenAgents={() => setAgentsOpen(true)}
        />
      ) : (
        <ConversationView
          user={user}
          messages={messages}
          isStreaming={isStreaming}
          msgCount={msgCount}
          onSend={handleSend}
          onOpenSideMenu={() => setSideMenuOpen(true)}
          onOpenUpgrade={() => setPlansOpen(true)}
          onOpenKnowMydow={() => setKnowMydowOpen(true)}
        />
      )}

      {/* Modals (always on top, never close menu) */}
      {knowMydowOpen && <KnowMydowModal onClose={() => setKnowMydowOpen(false)} />}
      {plansOpen && <PlansModal user={user} onClose={() => setPlansOpen(false)} />}
      {agentsOpen && <AgentsModal onClose={() => setAgentsOpen(false)} onSelectAgent={handleSelectAgent} />}
      {tipsOpen && <TipsModal onClose={() => setTipsOpen(false)} />}
      {memoriaOpen && <MemoriaModal user={user} memory={userMemory} onClose={() => setMemoriaOpen(false)} onSave={handleSaveMemory} />}
      {settingsOpen && <SettingsModal user={user} onClose={() => setSettingsOpen(false)} settings={settings} onUpdateSettings={handleUpdateSettings} onDeleteAccount={handleDeleteAccount} />}
    </div>
  )
}

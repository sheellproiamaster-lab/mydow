'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────── CONSTANTS ───────────────────────────
const ORANGE = '#E07B2A'
const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }
const WEEKLY_LIMITS = { free: 3, plus: 7, pro: Infinity }

const TRANSLATIONS = {
  pt: {
    newConv: 'Nova Conversa', send: 'Enviar', hello: 'Olá', typeMsg: 'Digite sua mensagem...',
    continueConv: 'Continue a conversa...', upgrade: '⚡ Fazer Upgrade', knowMydow: 'Conheça o Mydow',
    executing: 'Mydow está executando', limitReached: 'Você atingiu seu limite diário. Faça upgrade para continuar.',
    logout: 'Sair', noConvs: 'Nenhuma conversa ainda', save: 'Salvar', saved: '✓ Salvo!',
    saving: 'Salvando...', accept: 'Aceitar e Continuar', accepting: 'Salvando...',
    whatExecute: 'O que vamos executar hoje?',
    suggestions: ['Me ajude a organizar minha rotina', 'Quero criar um plano estratégico', 'Quero aprender algo novo hoje', 'Me ajude a analisar um problema complexo'],
  },
  en: {
    newConv: 'New Conversation', send: 'Send', hello: 'Hello', typeMsg: 'Type your message...',
    continueConv: 'Continue the conversation...', upgrade: '⚡ Upgrade', knowMydow: 'Meet Mydow',
    executing: 'Mydow is executing', limitReached: 'You reached your daily limit. Upgrade to continue.',
    logout: 'Sign out', noConvs: 'No conversations yet', save: 'Save', saved: '✓ Saved!',
    saving: 'Saving...', accept: 'Accept and Continue', accepting: 'Saving...',
    whatExecute: 'What shall we execute today?',
    suggestions: ['Me ajude a organizar minha rotina', 'Quero criar um plano estratégico', 'Quero aprender algo novo hoje', 'Me ajude a analisar um problema complexo'],
  },
  es: {
    newConv: 'Nueva Conversación', send: 'Enviar', hello: 'Hola', typeMsg: 'Escribe tu mensaje...',
    continueConv: 'Continúa la conversación...', upgrade: '⚡ Mejorar Plan', knowMydow: 'Conoce Mydow',
    executing: 'Mydow está ejecutando', limitReached: 'Alcanzaste tu límite diario. Mejora para continuar.',
    logout: 'Salir', noConvs: 'Sin conversaciones aún', save: 'Guardar', saved: '✓ ¡Guardado!',
    saving: 'Guardando...', accept: 'Aceptar y Continuar', accepting: 'Guardando...',
    whatExecute: '¿Qué vamos a ejecutar hoy?',
    suggestions: ['Ayúdame a organizar mi rutina', 'Quiero crear un plan estratégico', 'Quiero aprender algo nuevo hoy', 'Ayúdame a analizar un problema complejo'],
  },
}

// ─────────────────────────── HELPERS ─────────────────────────────
function formatCountdown(resetAt) {
  if (!resetAt) return '7:00:00'
  const diff = Math.max(0, new Date(resetAt) - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function parseResponse(text) {
  const parts = []
  const imageRegex = /\[MYDOW_IMAGE:(https?:\/\/[^\]]+)\]/g
  const questionRegex = /<pergunta opcoes="([^"]+)">([^<]+)<\/pergunta>/g
  const docRegex = /\[MYDOW_DOC_READY\]/g

  let combined = text
  let last = 0
  const matches = []

  let m
  const re = /(\[MYDOW_IMAGE:(https?:\/\/[^\]]+)\])|(<pergunta opcoes="([^"]+)">([^<]+)<\/pergunta>)/g
  while ((m = re.exec(combined)) !== null) {
    if (m.index > last) parts.push({ type: 'text', content: combined.slice(last, m.index) })
    if (m[1]) {
      parts.push({ type: 'image', url: m[2] })
    } else {
      parts.push({ type: 'question', options: m[4].split('|'), question: m[5] })
    }
    last = m.index + m[0].length
  }
  if (last < combined.length) parts.push({ type: 'text', content: combined.slice(last) })
  return parts.length ? parts : [{ type: 'text', content: text }]
}

function applyTheme(isDark) {
  const r = document.documentElement
  if (isDark) {
    r.style.setProperty('--t-bg', '#1a1a2e')
    r.style.setProperty('--t-card', '#0f3460')
    r.style.setProperty('--t-card-hover', '#16213e')
    r.style.setProperty('--t-text', '#e8e8e8')
    r.style.setProperty('--t-muted', '#a0a0b8')
    r.style.setProperty('--t-border', '#2a2a4e')
    r.style.setProperty('--t-input', '#0f3460')
    r.style.setProperty('--t-side', '#12122a')
    r.style.setProperty('--t-divider', '#2a2a4e')
    r.style.setProperty('--t-msg-user-bg', ORANGE)
    r.style.setProperty('--t-msg-ai-bg', '#16213e')
    r.style.setProperty('--t-msg-ai-text', '#e8e8e8')
    r.style.setProperty('--t-overlay', 'rgba(0,0,0,0.8)')
    r.style.setProperty('--t-modal', '#16213e')
  } else {
    r.style.setProperty('--t-bg', '#fdf0e0')
    r.style.setProperty('--t-card', '#ffffff')
    r.style.setProperty('--t-card-hover', '#fff8f2')
    r.style.setProperty('--t-text', '#111111')
    r.style.setProperty('--t-muted', '#888888')
    r.style.setProperty('--t-border', '#e8e0d5')
    r.style.setProperty('--t-input', '#ffffff')
    r.style.setProperty('--t-side', '#ffffff')
    r.style.setProperty('--t-divider', '#f0e8dd')
    r.style.setProperty('--t-msg-user-bg', ORANGE)
    r.style.setProperty('--t-msg-ai-bg', '#ffffff')
    r.style.setProperty('--t-msg-ai-text', '#111111')
    r.style.setProperty('--t-overlay', 'rgba(0,0,0,0.55)')
    r.style.setProperty('--t-modal', '#ffffff')
  }
}

// ─────────────────────────── TERMS / PRIVACY ─────────────────────
function TermsModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 28, maxWidth: 580, width: '100%', maxHeight: '80vh', overflow: 'auto', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Termos de Uso</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t-muted)' }}>
          {[['1. Aceitação dos Termos','Ao acessar e utilizar o Mydow, você concorda com os presentes Termos de Uso. O Mydow é uma plataforma desenvolvida e operada pela Michel Macedo Holding.'],['2. Descrição do Serviço','O Mydow é um agente executor desenvolvido para realizar tarefas de alto nível, auxiliar na tomada de decisões estratégicas e apoiar os usuários em suas demandas pessoais e profissionais.'],['3. Elegibilidade e Cadastro','Para utilizar o Mydow, o usuário deve ter 18 anos ou mais e fornecer informações verídicas no momento do cadastro.'],['4. Uso Adequado da Plataforma','O usuário compromete-se a utilizar o Mydow de forma ética e legal. É vedado o uso para fins ilícitos, difamatórios ou que causem danos a terceiros.'],['5. Responsabilidades do Usuário','O usuário é responsável por todas as interações em sua conta e pela segurança de suas credenciais. A Michel Macedo Holding não se responsabiliza por decisões tomadas com base nas respostas do Mydow.'],['6. Propriedade Intelectual','Toda a propriedade intelectual relacionada ao Mydow pertence à Michel Macedo Holding. É proibida a reprodução ou comercialização sem autorização expressa.'],['7. Disposições Gerais','Estes Termos podem ser alterados a qualquer momento. O foro competente é o da comarca de domicílio da Michel Macedo Holding.']].map(([t,d]) => (
            <div key={t} style={{ marginBottom: 16 }}><strong style={{ color: 'var(--t-text)', display: 'block', marginBottom: 4 }}>{t}</strong><p style={{ margin: 0 }}>{d}</p></div>
          ))}
        <div style={{ marginTop: 20, padding: '14px 20px', background: 'rgba(232,122,47,0.08)', border: '1.5px solid rgba(232,122,47,0.3)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#C96520' }}>Você Acessou o Mydow e Aceitou Nossos Termos de Uso</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrivacyModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 28, maxWidth: 580, width: '100%', maxHeight: '80vh', overflow: 'auto', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Política de Privacidade</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t-muted)' }}>
          {[['1. Informações Coletadas','Coletamos nome, e-mail, dados de interação e informações de pagamento, tratados conforme a LGPD (Lei 13.709/2018).'],['2. Uso das Informações','Usamos as informações para fornecer e melhorar o serviço, personalizar a experiência e garantir a segurança da plataforma.'],['3. Armazenamento e Segurança','Dados armazenados em servidores seguros com criptografia. Adotamos medidas técnicas contra acesso não autorizado.'],['4. Compartilhamento de Informações','Não vendemos dados. Compartilhamento apenas para prestação do serviço ou por obrigação legal.'],['5. Direitos do Usuário','Você pode acessar, corrigir, exportar ou solicitar exclusão de seus dados pelo suporte oficial.'],['6. Retenção de Dados','Dados mantidos enquanto a conta estiver ativa. Após exclusão, removidos conforme a legislação.'],['7. Cookies','Usamos cookies para autenticar usuários e garantir o funcionamento da plataforma.'],['8. Alterações na Política','Alterações significativas serão comunicadas. O uso continuado implica aceitação da nova política.'],['9. Contato','Para dúvidas sobre privacidade, entre em contato pelo suporte oficial do Mydow.'],['10. Legislação Aplicável','Regida pela LGPD (Lei 13.709/2018) e demais legislações brasileiras aplicáveis.']].map(([t,d]) => (
            <div key={t} style={{ marginBottom: 16 }}><strong style={{ color: 'var(--t-text)', display: 'block', marginBottom: 4 }}>{t}</strong><p style={{ margin: 0 }}>{d}</p></div>
          ))}
        <div style={{ marginTop: 20, padding: '14px 20px', background: 'rgba(232,122,47,0.08)', border: '1.5px solid rgba(232,122,47,0.3)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#C96520' }}>Você Acessou o Mydow e Aceitou Nossa Política de Privacidade</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── LGPD MODAL ──────────────────────────
function LGPDModal({ user, onAccept, t }) {
  const [accepted, setAccepted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleAccept = async () => { if (!accepted) return; setLoading(true); await onAccept(); setLoading(false) }
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 32, maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', color: 'var(--t-text)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/images/mydow.png" alt="Mydow" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 14 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Termos de Uso e Política de Privacidade</h2>
            <p style={{ color: 'var(--t-muted)', fontSize: 13, margin: 0 }}>Antes de continuar, você precisa aceitar nossos termos.</p>
          </div>
          <div style={{ background: 'var(--t-card)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 14, color: 'var(--t-muted)', lineHeight: 1.7 }}>
            Leia e aceite nossos{' '}
            <button onClick={() => setTermsOpen(true)} style={{ color: ORANGE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Termos de Uso</button>
            {' '}e nossa{' '}
            <button onClick={() => setPrivacyOpen(true)} style={{ color: ORANGE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Política de Privacidade</button>.
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 20, padding: 14, border: `2px solid ${accepted ? ORANGE : 'var(--t-border)'}`, borderRadius: 12, transition: 'border-color 0.2s' }}>
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: ORANGE, cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>Li e aceito os Termos de Uso e a Política de Privacidade do Mydow</span>
          </label>
          <button onClick={handleAccept} disabled={!accepted || loading} style={{ width: '100%', padding: 14, background: accepted ? ORANGE : 'var(--t-border)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: accepted ? 'pointer' : 'not-allowed', transition: 'background 0.2s', fontFamily: 'inherit' }}>
            {loading ? t.accepting : t.accept}
          </button>
        </div>
      </div>
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  )
}

// ─────────────────────────── USAGE CIRCLE ────────────────────────
function UsageModal({ user, msgCount, onClose, onOpenUpgrade }) {
  const limit = PLAN_LIMITS[user.plan] || 20
  const used = msgCount?.count ?? 0
  const remaining = Math.max(0, limit - used)
  const isPro = user.plan === 'pro'
  const isMaxed = remaining <= 0 && !isPro
  const resetAt = msgCount?.reset_at
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!isMaxed || !resetAt) return
    const t = setInterval(() => setCountdown(formatCountdown(resetAt)), 1000)
    setCountdown(formatCountdown(resetAt))
    return () => clearInterval(t)
  }, [isMaxed, resetAt])

  const radius = 44, circ = 2 * Math.PI * radius
  const pct = isPro ? 0 : Math.min(used / limit, 1)
  const dashOffset = circ * (1 - pct)
  const strokeColor = isMaxed ? '#e74c3c' : ORANGE

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 32, maxWidth: 320, width: '100%', textAlign: 'center', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Uso do Mydow</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>

        {isPro ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>∞</div>
            <p style={{ color: '#27ae60', fontWeight: 700, fontSize: 16 }}>Mensagens ilimitadas</p>
            <p style={{ color: 'var(--t-muted)', fontSize: 13 }}>Você tem o plano Pro</p>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--t-border)" strokeWidth="9" />
                <circle cx="50" cy="50" r={radius} fill="none" stroke={strokeColor} strokeWidth="9"
                  strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dashoffset 0.8s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: strokeColor }}>{used}</span>
                <span style={{ fontSize: 11, color: 'var(--t-muted)' }}>/{limit}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--t-muted)', marginBottom: 8 }}>
              {remaining === 0 ? 'Limite atingido' : `${remaining} mensagens restantes`}
            </p>
            {isMaxed && (
              <>
                <div style={{ background: 'var(--t-card)', borderRadius: 12, padding: '10px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#e74c3c', margin: 0, fontWeight: 600 }}>Reset em {countdown}</p>
                </div>
                <button onClick={() => { onClose(); onOpenUpgrade() }} style={{ width: '100%', padding: 12, background: ORANGE, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Fazer Upgrade</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────── KNOW MYDOW MODAL ────────────────────
function KnowMydowModal({ onClose, t }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 28, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'auto', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/images/mydow.png" alt="Mydow" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.knowMydow}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--t-muted)' }}>
          <p style={{ marginBottom: 16 }}>O <strong style={{ color: ORANGE }}>Mydow</strong> é um agente executor criado pela <strong style={{ color: 'var(--t-text)' }}>Michel Macedo Holding</strong>, desenvolvido para executar tarefas com excelência de forma humana e personalizada.</p>
          <p style={{ marginBottom: 20 }}>Diferente de assistentes comuns, o Mydow age como um parceiro estratégico que entende seu contexto, aprende com suas interações e executa sem precisar de aprovação constante.</p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t-text)', marginBottom: 12 }}>Como obter os melhores resultados:</h3>
          {[['Seja direto','Diga exatamente o que você precisa.'],['Dê contexto','Quanto mais contexto, mais precisa será a resposta.'],['Use a Memória','Configure o que o Mydow deve saber sobre você no menu lateral.'],['Explore os Agentes','O Mydow tem agentes especializados para diferentes tarefas.'],['Autorize listas','O Mydow sempre pede permissão antes de enviar listas.']].map(([tit,desc]) => (
            <div key={tit} style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '12px 14px', background: 'var(--t-card)', borderRadius: 10 }}>
              <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>→</span>
              <div><strong style={{ color: 'var(--t-text)' }}>{tit}:</strong> {desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── PLANS MODAL ─────────────────────────
function PlansModal({ user, onClose }) {
  const [loading, setLoading] = useState(null)

  async function handleUpgrade(planKey) {
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: planKey, userEmail: user.email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { }
    setLoading(null)
  }
  const plans = [
    {
      key: 'free', name: 'Gratuito', desc: 'Mydow Básico', price: null,
      features: ['20 mensagens por dia','Execução de tarefas complexas','Gerar imagens — 3 por semana','Análise de documentos — 3 por semana','Gerar documentos — 3 por semana'],
    },
    {
      key: 'plus', name: 'Plus', desc: 'Mydow Intermediário', price: 'R$ 67/mês',
      features: ['60 mensagens por dia','Execução de tarefas complexas','Gerar imagens — 7 por semana','Análise de documentos — 7 por semana','Gerar documentos — 7 por semana'],
    },
    {
      key: 'pro', name: 'Pro', desc: 'Mydow Avançado', price: 'R$ 119/mês', badge: 'Nível Premium',
      features: ['Mensagens ilimitadas sem restrição','Gerar imagens ilimitado','Análise de documentos ilimitado','Gerar documentos ilimitado','Navegar na web','Mydow fala com você por voz'],
    },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 28, maxWidth: 700, width: '100%', maxHeight: '90vh', overflow: 'auto', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Planos do Mydow</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {plans.map(plan => {
            const isCurrent = user.plan === plan.key
            const isPro = plan.key === 'pro'
            return (
              <div key={plan.key} style={{ flex: '1 1 180px', border: `2px solid ${isPro ? ORANGE : isCurrent ? '#a0a0a0' : 'var(--t-border)'}`, borderRadius: 20, padding: 20, background: 'var(--t-card)', position: 'relative' }}>
                {plan.badge && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: ORANGE, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>{plan.badge}</span>}
                {isCurrent && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#555', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>Seu plano atual</span>}
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--t-muted)', margin: '0 0 12px' }}>{plan.desc}</p>
                {plan.price && <p style={{ fontSize: 20, fontWeight: 800, color: ORANGE, margin: '0 0 16px' }}>{plan.price}</p>}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => <li key={f} style={{ fontSize: 13, color: 'var(--t-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}><span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</li>)}
                </ul>
                {plan.price && !isCurrent ? (
                  <button onClick={() => handleUpgrade(plan.key)} disabled={!!loading} style={{ width: '100%', padding: 12, background: loading === plan.key ? '#aaa' : ORANGE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                    {loading === plan.key ? 'Aguarde...' : `Assinar ${plan.name}`}
                  </button>
                ) : (
                  <div style={{ width: '100%', padding: 12, textAlign: 'center', fontSize: 13, color: ORANGE, fontWeight: 700, background: 'rgba(224,123,42,0.08)', borderRadius: 10 }}> Assine um PLano Mensal e use muito mais o Mydow</div>
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
  { id: 'games', name: 'Games', icon: '🎮', desc: 'Entretenimento' },
  { id: 'tradutor', name: 'Tradutor', icon: '🌐', desc: 'Tradução multilingue' },
  { id: 'organizador', name: 'Organizador', icon: '📋', desc: 'Tarefas e rotinas' },
]

function AgentsModal({ onClose, onSelectAgent }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 28, maxWidth: 480, width: '100%', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Mydow Agentes</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {AGENTS.map(agent => (
            <button key={agent.id} onClick={() => { onSelectAgent(agent); onClose() }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, border: '1.5px solid var(--t-border)', borderRadius: 14, background: 'var(--t-card)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: 'var(--t-text)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.background = 'var(--t-card-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.background = 'var(--t-card)' }}
            >
              <span style={{ fontSize: 24 }}>{agent.icon}</span>
              <div><div style={{ fontSize: 14, fontWeight: 700 }}>{agent.name}</div><div style={{ fontSize: 11, color: 'var(--t-muted)' }}>{agent.desc}</div></div>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--t-muted)', textAlign: 'center', marginTop: 16, margin: '16px 0 0' }}>Clique em um agente para abrir a interface completa</p>
      </div>
    </div>
  )
}

// ─────────────────────────── TIPS MODAL ──────────────────────────
// BUG 8 FIX: onClose never called from inside TipsModal → menu stays open
function TipsModal({ onClose }) {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTips = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tips', { method: 'POST' })
      const data = await res.json()
      setTips(data.tips || [])
    } catch { setTips([]) }
    setLoading(false)
  }, [])

  useEffect(() => { loadTips() }, [loadTips])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 28, maxWidth: 520, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dicas do Mydow</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadTips} disabled={loading} style={{ padding: '7px 14px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : '↺ Atualizar'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
          </div>
        </div>
        <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--t-muted)' }}>Gerando dicas...</div>
            : tips.map((tip, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--t-card)', borderRadius: 14, borderLeft: `4px solid ${ORANGE}` }}>
                <strong style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>{tip.titulo}</strong>
                <p style={{ fontSize: 13, color: 'var(--t-muted)', margin: 0, lineHeight: 1.6 }}>{tip.dica}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── MEMORIA MODAL ───────────────────────
function MemoriaModal({ user, memory, onClose, onSave, t }) {
  const [fields, setFields] = useState({ field1: memory?.field1 || '', field2: memory?.field2 || '', field3: memory?.field3 || '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const handleSave = async () => { setSaving(true); await onSave(fields); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 28, maxWidth: 480, width: '100%', color: 'var(--t-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Memória do Mydow</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {[['field1','O que o Mydow precisa saber sobre você?'],['field2','Como você deseja que o Mydow seja?'],['field3','O que o Mydow não pode fazer?']].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
              <textarea value={fields[key]} onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))} rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--t-border)', fontSize: 14, fontFamily: 'inherit', color: 'var(--t-text)', background: 'var(--t-input)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = ORANGE}
                onBlur={e => e.target.style.borderColor = 'var(--t-border)'}
              />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: 13, background: saved ? '#27ae60' : ORANGE, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.3s' }}>
          {saving ? t.saving : saved ? t.saved : t.save}
        </button>
        <p style={{ fontSize: 12, color: 'var(--t-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>Todas as informações que você fornecer serão implementadas na memória do Mydow</p>
      </div>
    </div>
  )
}

// ─────────────────────────── SETTINGS MODAL ──────────────────────
function LGPDLinks() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  return (
    <>
      <button onClick={() => setTermsOpen(true)} style={{ display: 'block', width: '100%', padding: 12, marginBottom: 8, border: `1.5px solid ${ORANGE}`, borderRadius: 12, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: ORANGE }}>Ver Termos de Uso</button>
      <button onClick={() => setPrivacyOpen(true)} style={{ display: 'block', width: '100%', padding: 12, border: `1.5px solid ${ORANGE}`, borderRadius: 12, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: ORANGE }}>Ver Política de Privacidade</button>
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  )
}

function DeleteAccountModal({ onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', color: 'var(--t-text)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😢</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Tem certeza que quer excluir o Mydow da sua vida?</h2>
        <p style={{ fontSize: 13, color: 'var(--t-muted)', marginBottom: 24, fontStyle: 'italic' }}>Pense bem antes de tomar essa decisão.</p>
        <button onClick={onClose} style={{ width: '100%', padding: 14, background: ORANGE, color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
          Quero continuar usando o Mydow
        </button>
        <button onClick={async () => { setLoading(true); await onConfirm() }} disabled={loading} style={{ width: '100%', padding: 14, background: 'none', color: '#e74c3c', border: '1.5px solid #e74c3c', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Excluindo...' : 'Quero excluir minha conta'}
        </button>
      </div>
    </div>
  )
}

// BUG 7 FIX: Settings saved to Supabase preferences jsonb, applied globally
function SettingsModal({ user, onClose, settings, onUpdateSettings, onDeleteAccount }) {
  const [sub, setSub] = useState(null)
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: 'var(--t-modal)', borderRadius: 24, padding: 28, maxWidth: 400, width: '100%', color: 'var(--t-text)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Configurações</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'appearance', label: '🌓 Aparência', desc: settings.theme === 'dark' ? 'Modo escuro' : 'Modo claro' },
              { id: 'lgpd', label: '📋 LGPD', desc: 'Termos e privacidade' },
              { id: 'delete', label: '🗑 Excluir Conta', desc: 'Remover todos os dados', danger: true },
            ].map(item => (
              <button key={item.id} onClick={() => setSub(item.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1.5px solid var(--t-border)', borderRadius: 12, background: 'var(--t-card)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: item.danger ? '#e74c3c' : 'var(--t-text)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = item.danger ? '#e74c3c' : ORANGE}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border)'}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--t-muted)' }}>{item.desc}</div>
                </div>
                <span style={{ color: 'var(--t-muted)' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {sub === 'appearance' && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', color: 'var(--t-text)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Aparência</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
            </div>
            {[['light','☀️ Modo Claro'],['dark','🌙 Modo Escuro Suave']].map(([th, label]) => (
              <button key={th} onClick={() => { onUpdateSettings({ theme: th }); setSub(null) }}
                style={{ width: '100%', padding: 12, marginBottom: 8, border: `2px solid ${settings.theme === th ? ORANGE : 'var(--t-border)'}`, borderRadius: 12, background: settings.theme === th ? 'var(--t-card-hover)' : 'var(--t-card)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--t-text)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'language' && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', color: 'var(--t-text)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Idioma</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
            </div>
            {[['pt','🇧🇷 Português'],['en','🇺🇸 English'],['es','🇪🇸 Español']].map(([lang, label]) => (
              <button key={lang} onClick={() => { onUpdateSettings({ language: lang }); setSub(null) }}
                style={{ width: '100%', padding: 12, marginBottom: 8, border: `2px solid ${settings.language === lang ? ORANGE : 'var(--t-border)'}`, borderRadius: 12, background: settings.language === lang ? 'var(--t-card-hover)' : 'var(--t-card)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--t-text)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'font' && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', color: 'var(--t-text)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Tamanho da Fonte</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
            </div>
            {[['small','Pequena','13px'],['normal','Normal','15px'],['large','Grande','17px']].map(([sz, label, fs]) => (
              <button key={sz} onClick={() => { onUpdateSettings({ fontSize: sz }); setSub(null) }}
                style={{ width: '100%', padding: 12, marginBottom: 8, border: `2px solid ${settings.fontSize === sz ? ORANGE : 'var(--t-border)'}`, borderRadius: 12, background: settings.fontSize === sz ? 'var(--t-card-hover)' : 'var(--t-card)', cursor: 'pointer', fontFamily: 'inherit', fontSize: fs, fontWeight: 600, color: 'var(--t-text)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'lgpd' && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 24, maxWidth: 380, width: '100%', color: 'var(--t-text)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>LGPD</h3>
              <button onClick={() => setSub(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--t-muted)' }}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--t-muted)', marginBottom: 16 }}>
              <strong>Aceito em:</strong>{' '}
              {user.accepted_at ? new Date(user.accepted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data não registrada'}
            </p>
            <LGPDLinks />
          </div>
        </div>
      )}

      {sub === 'delete' && <DeleteAccountModal onClose={() => setSub(null)} onConfirm={onDeleteAccount} />}
    </>
  )
}

// ─────────────────────────── CONFIRM DELETE ───────────────────────
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--t-modal)', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', textAlign: 'center', color: 'var(--t-text)' }}>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Excluir esta conversa?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, border: '1.5px solid var(--t-border)', borderRadius: 12, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--t-muted)' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, border: 'none', borderRadius: 12, background: '#e74c3c', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── SIDE MENU ───────────────────────────
// BUG 4 FIX: anyModalOpen prevents outside-click from closing menu
// BUG 5 FIX: width 50vw, no maxWidth
function SideMenu({ open, onToggle, user, conversations, msgCount, anyModalOpen, onNewConversation, onSelectConversation, onDeleteConversation, onFavoriteConversation, onRenameConversation, onOpenAgents, onOpenTips, onOpenUpgrade, onOpenMemoria, onOpenSettings, onOpenUsage, onLogout, t }) {
  const [optionsOpenId, setOptionsOpenId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const menuRef = useRef(null)

  // BUG 4 FIX: Only close on outside click when no modal is open
  useEffect(() => {
    function handleClick(e) {
      if (!open || anyModalOpen) return
      if (menuRef.current && !menuRef.current.contains(e.target)) onToggle()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, anyModalOpen, onToggle])

  const startRename = (conv) => { setRenamingId(conv.id); setRenameVal(conv.title); setOptionsOpenId(null) }
  const submitRename = () => { if (renameVal.trim()) onRenameConversation(renamingId, renameVal.trim()); setRenamingId(null) }

  const sortedConvs = [...conversations].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1
    if (!a.is_favorite && b.is_favorite) return 1
    return new Date(b.updated_at) - new Date(a.updated_at)
  })

  const Hamburger = ({ onClick }) => (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
      <div style={{ width: 22, height: 2, background: 'var(--t-muted)', borderRadius: 1 }} />
      <div style={{ width: 22, height: 2, background: 'var(--t-muted)', borderRadius: 1 }} />
      <div style={{ width: 22, height: 2, background: 'var(--t-muted)', borderRadius: 1 }} />
    </button>
  )

  return (
    <>
      {/* BUG 5 FIX: 50vw, no maxWidth */}
      <div ref={menuRef} style={{ position: 'fixed', top: 0, left: 0, height: '100dvh', width: 'min(70vw, 320px)', background: 'var(--t-side)', zIndex: 60, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', boxShadow: open ? '4px 0 30px rgba(0,0,0,0.2)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--t-border)' }}>

        {/* Header with close button (BUG 4: close via toggle only) */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--t-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--t-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.hello},</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--t-text)', margin: 0 }}>{user.name || 'Usuário'}</p>
          </div>
          <Hamburger onClick={onToggle} />
        </div>

        {/* Nova Conversa */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--t-divider)' }}>
          <button onClick={() => { onNewConversation(); onToggle() }} style={{ width: '100%', padding: 10, background: ORANGE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ {t.newConv}</button>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px' }}>
          {sortedConvs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--t-muted)', textAlign: 'center', padding: '20px 0' }}>{t.noConvs}</p>
          ) : sortedConvs.map(conv => (
            <div key={conv.id} style={{ position: 'relative' }}>
              {renamingId === conv.id ? (
                <div style={{ display: 'flex', gap: 6, padding: '6px 0' }}>
                  <input value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitRename()} autoFocus style={{ flex: 1, padding: '7px 10px', border: `1.5px solid ${ORANGE}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--t-input)', color: 'var(--t-text)' }} />
                  <button onClick={submitRename} style={{ padding: '7px 10px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>✓</button>
                  <button onClick={() => setRenamingId(null)} style={{ padding: '7px 10px', background: 'var(--t-card)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--t-text)' }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: 10, padding: '7px 6px', marginBottom: 2, cursor: 'pointer', background: optionsOpenId === conv.id ? 'var(--t-card)' : 'transparent' }}>
                  <div onClick={() => { onSelectConversation(conv.id); onToggle(); setOptionsOpenId(null) }} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {conv.is_favorite && <span style={{ color: '#f39c12', fontSize: 12, flexShrink: 0 }}>★</span>}
                      <span style={{ fontSize: 13, color: 'var(--t-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{conv.title}</span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setOptionsOpenId(optionsOpenId === conv.id ? null : conv.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', fontSize: 16, color: 'var(--t-muted)', flexShrink: 0 }}>›</button>
                </div>
              )}
              {optionsOpenId === conv.id && (
                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--t-modal)', border: '1px solid var(--t-border)', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 10, minWidth: 150, overflow: 'hidden' }}>
                  <button onClick={() => { onFavoriteConversation(conv.id, !conv.is_favorite); setOptionsOpenId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: conv.is_favorite ? '#f39c12' : 'var(--t-text)' }}>
                    {conv.is_favorite ? '★' : '☆'} {conv.is_favorite ? 'Desfavoritar' : 'Favoritar'}
                  </button>
                  <button onClick={() => startRename(conv)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: 'var(--t-text)', borderTop: '1px solid var(--t-divider)' }}>✏️ Renomear</button>
                  <button onClick={() => { setConfirmDeleteId(conv.id); setOptionsOpenId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#e74c3c', borderTop: '1px solid var(--t-divider)' }}>🗑 Excluir</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--t-divider)', margin: '0 14px' }} />

        <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[['🤖 Mydow Agentes', onOpenAgents],['💡 Dicas do Mydow', onOpenTips]].map(([label, action]) => (
            <button key={label} onClick={action} style={{ display: 'block', width: '100%', padding: '9px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--t-text)', textAlign: 'left', borderRadius: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--t-card)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >{label}</button>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--t-divider)', margin: '0 14px' }} />

        {/* BUG 6 FIX: "Uso do Mydow" opens modal instead of inline display */}
        <div style={{ padding: '6px 10px' }}>
          <button onClick={onOpenUsage} style={{ display: 'block', width: '100%', padding: '9px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--t-text)', textAlign: 'left', borderRadius: 10 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--t-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >📊 Uso do Mydow</button>
          <button onClick={onOpenUpgrade} style={{ width: '100%', padding: '9px 10px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.upgrade}</button>
        </div>

        <div style={{ height: 1, background: 'var(--t-divider)', margin: '4px 14px' }} />

        <div style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[['🧠 Memória do Mydow', onOpenMemoria],['⚙️ Configurações', onOpenSettings]].map(([label, action]) => (
            <button key={label} onClick={action} style={{ display: 'block', width: '100%', padding: '9px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--t-text)', textAlign: 'left', borderRadius: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--t-card)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >{label}</button>
          ))}
        </div>

        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--t-divider)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
          <p style={{ fontSize: 12, color: 'var(--t-muted)', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          <button onClick={onLogout} style={{ width: '100%', padding: 10, background: 'none', border: '1.5px solid var(--t-border)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--t-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>{t.logout}</button>
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
function MessageBubble({ msg, onOptionSelect, onRefresh }) {
  const isUser = msg.role === 'user'
  const parts = isUser ? [{ type: 'text', content: msg.content }] : parseResponse(msg.content)

  const handleDownloadDoc = async (content) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()

    // Capa
    doc.setFillColor(224, 123, 42)
    doc.rect(0, 0, W, 55, 'F')
    doc.setFillColor(180, 90, 20)
    doc.rect(0, 48, W, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    const lines0 = content.split('\n')
    const title = lines0[0]?.replace(/[#*`]/g, '').trim() || 'Documento Mydow'
    const titleLines = doc.splitTextToSize(title, W - 30)
    doc.text(titleLines, W / 2, 28, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Gerado por Mydow · Michel Macedo Holding', W / 2, 44, { align: 'center' })

    // Linha laranja lateral
    doc.setFillColor(224, 123, 42)
    doc.rect(0, 55, 4, H - 55, 'F')

    // Conteúdo
    doc.setTextColor(30, 30, 30)
    let y = 68
    const bodyLines = lines0.slice(1)
    bodyLines.forEach(line => {
      const clean = line.replace(/[`]/g, '').trim()
      if (!clean) { y += 4; return }
      const isH2 = line.startsWith('## ') || line.startsWith('**') && line.endsWith('**')
      const isH1 = line.startsWith('# ')
      const isBullet = line.trim().startsWith('- ') || line.trim().match(/^\d+\./)
      if (isH1) {
        if (y > H - 30) { doc.addPage(); y = 20; doc.setFillColor(224,123,42); doc.rect(0,0,4,H,'F') }
        doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(224, 123, 42)
        const t = doc.splitTextToSize(clean.replace(/^#+\s*/, ''), W - 30)
        doc.text(t, 12, y); y += t.length * 8 + 3
        doc.setDrawColor(224,123,42); doc.setLineWidth(0.4); doc.line(12, y - 1, W - 12, y - 1); y += 2
      } else if (isH2) {
        if (y > H - 30) { doc.addPage(); y = 20; doc.setFillColor(224,123,42); doc.rect(0,0,4,H,'F') }
        doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 60, 60)
        const t = doc.splitTextToSize(clean.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, ''), W - 30)
        doc.text(t, 12, y); y += t.length * 7 + 2
      } else if (isBullet) {
        if (y > H - 30) { doc.addPage(); y = 20; doc.setFillColor(224,123,42); doc.rect(0,0,4,H,'F') }
        doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
        const bulletText = clean.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')
        const boldMatch = bulletText.match(/^\*\*(.*?)\*\*(.*)/)
        if (boldMatch) {
          doc.setFillColor(224,123,42); doc.circle(17, y - 2, 1.2, 'F')
          doc.setFont('helvetica', 'bold'); doc.text(boldMatch[1], 21, y)
          const bw = doc.getTextWidth(boldMatch[1])
          doc.setFont('helvetica', 'normal'); doc.text(boldMatch[2], 21 + bw, y)
        } else {
          doc.setFillColor(224,123,42); doc.circle(17, y - 2, 1.2, 'F')
          const t = doc.splitTextToSize(bulletText.replace(/\*\*/g,''), W - 35)
          doc.text(t, 21, y); y += (t.length - 1) * 6
        }
        y += 7
      } else {
        if (y > H - 30) { doc.addPage(); y = 20; doc.setFillColor(224,123,42); doc.rect(0,0,4,H,'F') }
        doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
        const t = doc.splitTextToSize(clean.replace(/\*\*/g,''), W - 25)
        doc.text(t, 12, y); y += t.length * 6 + 2
      }
    })

    // Rodapé em todas as páginas
    const total = doc.internal.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      doc.setPage(i)
      doc.setFillColor(245, 245, 245)
      doc.rect(0, H - 12, W, 12, 'F')
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(150, 150, 150)
      doc.text(`Criado por Michel Macedo · Mydow Platform · ${new Date().toLocaleDateString('pt-BR')}`, W / 2, H - 5, { align: 'center' })
      doc.text(`${i}/${total}`, W - 12, H - 5)
    }

    const safeName = title.replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 40) || 'mydow-documento'
    doc.save(`${safeName}.pdf`)
  }

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16, gap: 10, alignItems: 'flex-start' }}>
      {!isUser && <img src="/images/mydow.png" alt="Mydow" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0, marginTop: 4 }} />}
      <div style={{ maxWidth: '75%' }}>
        <div style={{ background: isUser ? 'var(--t-msg-user-bg)' : 'var(--t-msg-ai-bg)', color: isUser ? '#fff' : 'var(--t-msg-ai-text)', borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 14, lineHeight: 1.6 }}>
          {parts.map((part, i) => {
            if (part.type === 'text') return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.content}</span>
            if (part.type === 'image') return (
              <div key={i} style={{ marginTop: 8, marginBottom: 4 }}>
                <img src={part.url} alt="Imagem gerada" style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
              </div>
            )
            if (part.type === 'question') return (
              <div key={i} style={{ marginTop: 12 }}>
                <p style={{ fontWeight: 600, marginBottom: 8, color: isUser ? '#fff' : 'var(--t-text)' }}>{part.question}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {part.options.map(opt => (
                    <button key={opt} onClick={() => onOptionSelect?.(opt)} style={{ padding: '6px 12px', background: 'transparent', border: `1.5px solid ${ORANGE}`, borderRadius: 20, fontSize: 13, fontWeight: 600, color: ORANGE, cursor: 'pointer', fontFamily: 'inherit' }}>{opt}</button>
                  ))}
                  <button style={{ padding: '6px 12px', background: 'transparent', border: '1.5px solid var(--t-border)', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--t-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Outro</button>
                </div>
              </div>
            )
            return null
          })}
          {msg.docContent && (
            <button onClick={() => handleDownloadDoc(msg.docContent)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 14px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ⬇ Download do Documento
            </button>
          )}
        </div>
        {!isUser && !msg.streaming && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 4 }}>
            {[['📋','Copiar', () => navigator.clipboard.writeText(msg.content)],['👍','Gostei',() => {}],['👎','Não gostei',() => {}],['↻','Atualizar',() => onRefresh?.(msg)]].map(([icon,title,action]) => (
              <button key={icon} title={title} onClick={action} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4, opacity: 0.4, transition: 'opacity 0.2s', color: 'var(--t-text)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
              >{icon}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────── CHAT INPUT ──────────────────────────
function ChatInput({ onSend, onFileSelect, disabled, placeholder }) {
  const [value, setValue] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const textareaRef = useRef(null)
  const fileRef = useRef(null)

  const handleSend = () => {
    const text = value.trim()
    if ((!text && !pendingFile) || disabled) return
    if (pendingFile) { onFileSelect?.(pendingFile); setPendingFile(null) }
    if (text) onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }
  const handleKeyDown = (e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); handleSend() } }
  const handleInput = (e) => {
    setValue(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px' }
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPendingFile(file)
  }

  return (
    <div style={{ padding: '10px 14px 18px', background: 'var(--t-bg)', borderTop: '1px solid var(--t-border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--t-input)', border: `1.5px solid var(--t-border)`, borderRadius: 18, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <button onClick={() => fileRef.current?.click()} title="Enviar arquivo" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 2px', color: 'var(--t-muted)', flexShrink: 0, lineHeight: 1 }}>📎</button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.md" onChange={handleFile} style={{ display: 'none' }} />
        {pendingFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--t-card)', borderRadius: 8, fontSize: 12, color: 'var(--t-text)', flexShrink: 0 }}>
            <span>📎 {pendingFile.name}</span>
            <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-muted)', fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>
        )}
        <textarea ref={textareaRef} value={value} onChange={handleInput} onKeyDown={handleKeyDown} disabled={disabled} placeholder={disabled ? 'Limite atingido' : placeholder} rows={1}
          style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 14, fontFamily: 'inherit', color: 'var(--t-text)', background: 'transparent', lineHeight: 1.5, maxHeight: 120, overflow: 'hidden' }} />
        <button onClick={handleSend} disabled={disabled || (!value.trim() && !pendingFile)}
          style={{ padding: '7px 14px', background: disabled || !value.trim() ? 'var(--t-border)' : ORANGE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'background 0.2s' }}>
          {placeholder?.includes('Enviar') ? 'Enviar' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── TOP BAR ─────────────────────────────
function TopBar({ onOpenSideMenu, onOpenUpgrade, onOpenKnowMydow, t }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--t-border)', flexShrink: 0, background: 'var(--t-bg)' }}>
      <button onClick={onOpenSideMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ width: 22, height: 2, background: 'var(--t-text)', borderRadius: 1 }} />
        <div style={{ width: 22, height: 2, background: 'var(--t-text)', borderRadius: 1 }} />
        <div style={{ width: 22, height: 2, background: 'var(--t-text)', borderRadius: 1 }} />
      </button>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onOpenKnowMydow} style={{ padding: '7px 12px', background: 'none', border: '1.5px solid var(--t-border)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--t-muted)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t.knowMydow}</button>
        <button onClick={onOpenUpgrade} style={{ padding: '7px 14px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t.upgrade}</button>
      </div>
    </div>
  )
}

// ─────────────────────────── CHAT HOME ───────────────────────────
// BUG 3 FIX: cards create conversation and send message immediately
function ChatHome({ user, msgCount, onSend, onOpenSideMenu, onOpenUpgrade, onOpenKnowMydow, onOpenAgents, t }) {
  const limit = PLAN_LIMITS[user.plan] || 20
  const isLimited = (msgCount?.count ?? 0) >= limit && user.plan !== 'pro'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--t-bg)' }}>
      <TopBar onOpenSideMenu={onOpenSideMenu} onOpenUpgrade={onOpenUpgrade} onOpenKnowMydow={onOpenKnowMydow} t={t} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}>
        <img src="/images/mydow.png" alt="Mydow" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 10 }} />
        <h1 style={{ fontSize: 28, fontWeight: 900, color: ORANGE, margin: '0 0 6px', letterSpacing: '-0.03em' }}>Mydow</h1>
        <p style={{ fontSize: 14, color: 'var(--t-muted)', marginBottom: 28, textAlign: 'center' }}>{t.hello}, {user.name}! {t.whatExecute}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, width: '100%', maxWidth: 580, marginBottom: 12 }}>
          {t.suggestions.map(s => (
            <button key={s} onClick={() => !isLimited && onSend(s)} disabled={isLimited}
              style={{ padding: '14px 12px', background: 'var(--t-card)', border: '1.5px solid var(--t-border)', borderRadius: 16, fontSize: 13, color: 'var(--t-text)', cursor: isLimited ? 'not-allowed' : 'pointer', textAlign: 'left', fontFamily: 'inherit', lineHeight: 1.4, transition: 'all 0.2s', opacity: isLimited ? 0.5 : 1 }}
              onMouseEnter={e => { if (!isLimited) { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.background = 'var(--t-card-hover)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.background = 'var(--t-card)' }}
            >{s}</button>
          ))}
          <button onClick={onOpenAgents}
            style={{ padding: '14px 12px', background: 'var(--t-card)', border: `1.5px solid ${ORANGE}`, borderRadius: 16, fontSize: 13, color: ORANGE, fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', lineHeight: 1.4, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--t-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--t-card)'}
          >🤖 Mydow Agentes</button>
        </div>

        {isLimited && (
          <div style={{ padding: '14px 20px', background: 'var(--t-card)', border: '1.5px solid #e74c3c', borderRadius: 14, textAlign: 'center', maxWidth: 380 }}>
            <p style={{ fontSize: 14, color: '#e74c3c', fontWeight: 600, margin: '0 0 8px' }}>{t.limitReached}</p>
            <button onClick={onOpenUpgrade} style={{ padding: '8px 20px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Fazer Upgrade</button>
          </div>
        )}
      </div>
      <ChatInput onSend={onSend} disabled={isLimited} placeholder={t.typeMsg} />
    </div>
  )
}

// ─────────────────────────── CONVERSATION VIEW ───────────────────
function ConversationView({ messages, isStreaming, onSend, onFileSelect, onOpenSideMenu, onOpenUpgrade, onOpenKnowMydow, user, msgCount, t }) {
  const bottomRef = useRef(null)
  const limit = PLAN_LIMITS[user.plan] || 20
  const isLimited = (msgCount?.count ?? 0) >= limit && user.plan !== 'pro'

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isStreaming])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--t-bg)' }}>
      <TopBar onOpenSideMenu={onOpenSideMenu} onOpenUpgrade={onOpenUpgrade} onOpenKnowMydow={onOpenKnowMydow} t={t} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px' }}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} msg={msg} onOptionSelect={opt => onSend(opt)} />
        ))}
        {isStreaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src="/images/mydow.png" alt="Mydow" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <div style={{ background: 'var(--t-msg-ai-bg)', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--t-muted)' }}>{t.executing}</span>
                {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, background: ORANGE, borderRadius: '50%', display: 'inline-block', animation: `dotpulse 1.2s ease-in-out ${i*0.2}s infinite`, marginLeft: 3 }} />)}
              </div>
            </div>
          </div>
        )}
        {isLimited && !isStreaming && (
          <div style={{ padding: '14px 20px', background: 'var(--t-card)', border: '1.5px solid #e74c3c', borderRadius: 14, textAlign: 'center', margin: '10px 0' }}>
            <p style={{ fontSize: 14, color: '#e74c3c', fontWeight: 600, margin: '0 0 8px' }}>{t.limitReached}</p>
            <button onClick={onOpenUpgrade} style={{ padding: '8px 20px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Fazer Upgrade</button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={onSend} onFileSelect={onFileSelect} disabled={isLimited || isStreaming} placeholder={t.continueConv} />
      <style>{`@keyframes dotpulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

// ─────────────────────────── MAIN CLIENT ─────────────────────────
export default function ChatClient({ user, messageCount, memory: initialMemory, conversations: initialConversations, usageLimits: initialUsageLimits }) {
  const router = useRouter()
  // FIX: stable supabase client (not recreated on every render)
  const supabase = useMemo(() => createClient(), [])

  // FIX BUG 7: Load settings from user.preferences jsonb
  const [settings, setSettings] = useState({
    theme: user.preferences?.theme || 'light',
    language: 'pt',
    fontSize: user.preferences?.fontSize || 'normal',
  })

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.pt
  const fontSize = settings.fontSize === 'small' ? '13px' : settings.fontSize === 'large' ? '17px' : '15px'

  // Apply CSS custom properties for dark mode (BUG 7)
  useEffect(() => { applyTheme(settings.theme === 'dark') }, [settings.theme])
   useEffect(() => {
    document.documentElement.style.fontSize = fontSize
    document.documentElement.style.setProperty('--font-size', fontSize)
  }, [fontSize])

  const [view, setView] = useState('home')
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversations, setConversations] = useState(initialConversations || [])
  const [msgCount, setMsgCount] = useState(messageCount || { count: 0, reset_at: null })
  const [userMemory, setUserMemory] = useState(initialMemory || { field1: '', field2: '', field3: '' })
  const activeConvIdRef = useRef(null)
  const messagesRef = useRef([])

  // Keep refs in sync for use inside callbacks
  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Auto-refresh: atualiza contador e conversas a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/user/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.msgCount) setMsgCount(data.msgCount)
          if (data.conversations) setConversations(data.conversations)
        }
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [user.id])

  // BUG 1 FIX: Only show LGPD when explicitly false (not just falsy null)
  const [lgpdOpen, setLgpdOpen] = useState(false)

  // Modal states — anyModalOpen used to prevent menu from closing (BUG 4)
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [plansOpen, setPlansOpen] = useState(false)
  const [knowMydowOpen, setKnowMydowOpen] = useState(false)
  const [memoriaOpen, setMemoriaOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [agentsOpen, setAgentsOpen] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [usageOpen, setUsageOpen] = useState(false)

  // BUG 4 FIX: anyModalOpen prevents menu outside-click from firing
  const anyModalOpen = lgpdOpen || plansOpen || knowMydowOpen || memoriaOpen || settingsOpen || agentsOpen || tipsOpen || usageOpen

  // ── LGPD (via admin API to bypass RLS) ────────────────────────
  const handleLGPDAccept = useCallback(async () => {
    const res = await fetch('/api/user/accept-terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    if (res.ok) setLgpdOpen(false)
  }, [user.id])

  // ── Navigation ─────────────────────────────────────────────────
  const handleNewConversation = useCallback(() => {
    setView('home')
    setActiveConvId(null)
    setMessages([])
  }, [])

  const handleSelectConversation = useCallback(async (convId) => {
    const res = await fetch('/api/conversation/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId }),
    }).catch(() => null)
    const data = res?.ok ? await res.json() : []
    setMessages(Array.isArray(data) ? data : [])
    setActiveConvId(convId)
    setView('conversation')
  }, [])

  // ── BUG 2 & 3 FIX: reliable send with conversation creation ─────
  const handleSend = useCallback(async (text) => {
    if (isStreaming || !text?.trim()) return

    // Snapshot current values from refs to avoid stale closure issues
    let convId = activeConvIdRef.current
    const prevMessages = messagesRef.current

    // Optimistic: block UI immediately
    setIsStreaming(true)

    try {
      // Create conversation if none active
      if (!convId) {
        const title = text.length > 42 ? text.slice(0, 39) + '...' : text
        const res = await fetch('/api/conversation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, title }),
        })
        if (!res.ok) { setIsStreaming(false); return }
        const newConv = await res.json()
        if (!newConv?.id) { setIsStreaming(false); return }
        convId = newConv.id
        setActiveConvId(convId)
        activeConvIdRef.current = convId
        setConversations(prev => [newConv, ...prev])
        setView('conversation')
      }

      // Add user message to UI
      const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }
      const assistantId = `a-${Date.now()}`
      const assistantMsg = { id: assistantId, role: 'assistant', content: '', streaming: true }

      setMessages(prev => [...prev, userMsg, assistantMsg])

      // All history for context (prev messages + this user msg)
      const allMsgs = [...prevMessages, userMsg].map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMsgs,
          userId: user.id,
          conversationId: convId,
          userName: user.name,
          memory: userMemory,
          userPlan: user.plan,
          language: settings.language,
        }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setMsgCount(prev => {
          const limit = PLAN_LIMITS[user.plan] || 20
          return { ...prev, count: limit, reset_at: data.reset_at }
        })
        setIsStreaming(false)
        return
      }

      if (!res.ok) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Erro ao conectar. Tente novamente.', streaming: false } : m))
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m))
      }

      // Finalize message — detect [DOC] tag for downloadable document
      if (full.includes('[DOC]')) {
        const rawDoc = full.split('[DOC]')[1] || ''
        const docContent = rawDoc
          .replace(/```markdown|```/g, '')
          .replace(/\[PDF gerado[\s\S]*$/i, '')
          .replace(/Agora,? vou gerar[\s\S]*$/i, '')
          .replace(/Você pode baixar[\s\S]*$/i, '')
          .replace(/Criado por Michel Macedo[\s\S]*$/i, '')
          .replace(/---\s*$/m, '')
          .trim()
        const preview = full.split('[DOC]')[0].replace(/```markdown|```/g,'').trim().slice(0, 300)
        setMessages(prev => prev.map(m => m.id === assistantId ? {
          ...m,
          content: preview || '📄 Documento gerado com sucesso!',
          docContent,
          streaming: false,
        } : m))
      } else {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full, streaming: false } : m))
      }

      // Update local message count (count = used, increments)
      setMsgCount(prev => {
        if (user.plan === 'pro') return prev
        const limit = PLAN_LIMITS[user.plan] || 20
        const newCount = Math.min(limit, prev.count + 1)
        const resetAt = newCount >= limit && !prev.reset_at ? new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString() : prev.reset_at
        return { ...prev, count: newCount, reset_at: resetAt }
      })

      setConversations(prev => prev.map(c => c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c))
    } catch (err) {
      console.error('Send error:', err)
    }

    setIsStreaming(false)
  }, [isStreaming, user, userMemory, settings.language])

   // ── Generate PDF ───────────────────────────────────────────────
  const handleGeneratePDF = useCallback(async (prompt) => {
    if (isStreaming) return
    setIsStreaming(true)
    let convId = activeConvIdRef.current
    if (!convId) {
      const title = `PDF: ${prompt.slice(0, 40)}`
      const res = await fetch('/api/conversation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title }),
      })
      const newConv = res?.ok ? await res.json() : null
      if (newConv?.id) {
        convId = newConv.id
        setActiveConvId(convId)
        activeConvIdRef.current = convId
        setConversations(prev => [newConv, ...prev])
        setView('conversation')
      }
    }
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: `📄 Gerar PDF: ${prompt}` }
    const assistantId = `a-${Date.now()}`
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: 'Gerando documento...', streaming: true }])
    try {
      const res = await fetch('/api/document/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId: user.id, userPlan: user.plan, language: settings.language, format: 'pdf' }),
      })
      if (res.status === 429) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Limite de geração de documentos atingido. Faça upgrade para continuar.', streaming: false } : m))
      } else {
        const data = await res.json()
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '📄 Documento gerado! Clique abaixo para baixar.', docContent: data.content, streaming: false } : m))
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Erro ao gerar documento.', streaming: false } : m))
    }
    setIsStreaming(false)
  }, [isStreaming, user, settings.language])

  // ── File upload / document analysis ───────────────────────────
  const handleFileSelect = useCallback(async (file) => {
    if (isStreaming) return
    setIsStreaming(true)

    let convId = activeConvIdRef.current
    if (!convId) {
      const title = `Análise: ${file.name}`
      const res = await fetch('/api/conversation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title }),
      })
      const newConv = res?.ok ? await res.json() : null
      if (!newConv?.id) { setIsStreaming(false); return }
      convId = newConv.id
      setActiveConvId(convId)
      activeConvIdRef.current = convId
      setConversations(prev => [newConv, ...prev])
      setView('conversation')
    }

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: `📎 Arquivo enviado: ${file.name}` }
    const assistantId = `a-${Date.now()}`
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: 'Analisando arquivo...', streaming: true }])

    try {
      const isImage = file.type.startsWith('image/')
      const isText = file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')

      let fileBase64 = null
      let fileText = null

      if (isImage) {
        fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      } else if (isText) {
        fileText = await file.text()
      }

      const res = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileText, mimeType: file.type, fileName: file.name, userId: user.id, userPlan: user.plan, language: settings.language }),
      })

      if (res.status === 429) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Limite de análise de documentos atingido. Faça upgrade para continuar.', streaming: false } : m))
      } else {
        const data = await res.json()
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: data.result || 'Não foi possível analisar.', streaming: false } : m))
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Erro ao analisar arquivo.', streaming: false } : m))
    }
    setIsStreaming(false)
  }, [isStreaming, user, settings.language])

  // ── Conversation management ────────────────────────────────────
  const handleDeleteConversation = useCallback(async (convId) => {
    await fetch('/api/conversation/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, userId: user.id }),
    }).catch(() => {})
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (activeConvIdRef.current === convId) handleNewConversation()
  }, [user.id, handleNewConversation])

  const handleFavoriteConversation = useCallback(async (convId, fav) => {
    await fetch('/api/conversation/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, userId: user.id, patch: { is_favorite: fav } }),
    }).catch(() => {})
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, is_favorite: fav } : c))
  }, [user.id])

  const handleRenameConversation = useCallback(async (convId, title) => {
    await fetch('/api/conversation/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, userId: user.id, patch: { title } }),
    }).catch(() => {})
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c))
  }, [user.id])

  // ── Memory ─────────────────────────────────────────────────────
  const handleSaveMemory = useCallback(async (fields) => {
    await fetch('/api/memory/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...fields }),
    }).catch(() => {})
    setUserMemory(fields)
  }, [user.id])

  // ── Settings (BUG 7 FIX: save to Supabase preferences jsonb) ──
  const handleUpdateSettings = useCallback(async (patch) => {
    const newSettings = { ...settings, ...patch }
    setSettings(newSettings)
    await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, preferences: newSettings }),
    }).catch(() => {})
    applyTheme(newSettings.theme === 'dark')
  }, [settings, user.id])

  // ── Account deletion ───────────────────────────────────────────
  const handleDeleteAccount = useCallback(async () => {
    const convIds = conversations.map(c => c.id)
    if (convIds.length) await supabase.from('messages').delete().in('conversation_id', convIds)
    await supabase.from('conversations').delete().eq('user_id', user.id)
    await supabase.from('memory').delete().eq('user_id', user.id)
    await supabase.from('message_counts').delete().eq('user_id', user.id)
    await supabase.from('usage_limits').delete().eq('user_id', user.id)
    await supabase.from('users').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }, [supabase, user.id, conversations, router])

  // ── Logout ─────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/')
  }, [supabase, router])

  // ── Agents ────────────────────────────────────────────────────
  const handleSelectAgent = useCallback((agent) => {
    router.push(`/agents/${agent.id}`)
  }, [router])

  // ── Side menu toggle ───────────────────────────────────────────
  const handleToggleMenu = useCallback(() => setSideMenuOpen(prev => !prev), [])

  return (
    <div style={{ fontSize, fontFamily: 'Inter, system-ui, sans-serif', background: 'var(--t-bg)', minHeight: '100dvh', color: 'var(--t-text)' }}>

      {/* BUG 1 FIX: Only shows when accepted_terms is explicitly false */}

      {/* BUG 4 & 5 FIX: anyModalOpen prevents outside-click close; width 50vw */}
      <SideMenu
        open={sideMenuOpen}
        onToggle={handleToggleMenu}
        user={user}
        conversations={conversations}
        msgCount={msgCount}
        anyModalOpen={anyModalOpen}
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
        onOpenUsage={() => setUsageOpen(true)}
        onLogout={handleLogout}
        t={t}
      />

      {view === 'home' ? (
        <ChatHome
          user={user}
          msgCount={msgCount}
          onSend={handleSend}
          onOpenSideMenu={handleToggleMenu}
          onOpenUpgrade={() => setPlansOpen(true)}
          onOpenKnowMydow={() => setKnowMydowOpen(true)}
          onOpenAgents={() => setAgentsOpen(true)}
          t={t}
        />
      ) : (
        <ConversationView
          user={user}
          messages={messages}
          isStreaming={isStreaming}
          msgCount={msgCount}
          onSend={handleSend}
          onFileSelect={handleFileSelect}
          onOpenSideMenu={handleToggleMenu}
          onOpenUpgrade={() => setPlansOpen(true)}
          onOpenKnowMydow={() => setKnowMydowOpen(true)}
          t={t}
        />
      )}

      {/* All modals — never close the menu (BUG 4) */}
      {knowMydowOpen && <KnowMydowModal onClose={() => setKnowMydowOpen(false)} t={t} />}
      {plansOpen && <PlansModal user={user} onClose={() => setPlansOpen(false)} />}
      {agentsOpen && <AgentsModal onClose={() => setAgentsOpen(false)} onSelectAgent={handleSelectAgent} />}
      {tipsOpen && <TipsModal onClose={() => setTipsOpen(false)} />}
      {memoriaOpen && <MemoriaModal user={user} memory={userMemory} onClose={() => setMemoriaOpen(false)} onSave={handleSaveMemory} t={t} />}
      {settingsOpen && <SettingsModal user={user} onClose={() => setSettingsOpen(false)} settings={settings} onUpdateSettings={handleUpdateSettings} onDeleteAccount={handleDeleteAccount} />}
      {usageOpen && <UsageModal user={user} msgCount={msgCount} onClose={() => setUsageOpen(false)} onOpenUpgrade={() => { setUsageOpen(false); setPlansOpen(true) }} />}
    </div>
  )
}

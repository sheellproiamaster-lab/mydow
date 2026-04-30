'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const CAPABILITIES = [
  'Automatiza fluxos complexos de trabalho',
  'Gerencia projetos inteiros de ponta a ponta',
  'Pesquisa, analisa e sintetiza dados',
  'Escreve, revisa e publica conteúdo',
  'Integra APIs, sistemas e ferramentas',
  'Toma decisões estratégicas com precisão',
  'Opera 24 horas sem interrupção',
  'Escala conforme seu negócio cresce',
  'Executa múltiplas tarefas em paralelo',
  'Aprende e se adapta ao seu contexto',
  'Cria relatórios e análises executivas',
  'Coordena equipes e processos complexos',
];

const TYPING_TEXT = 'Mydow';
const CHAR_W = 28;

function MydowTyping() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      if (count <= TYPING_TEXT.length) setCount((c) => c + 1);
      else setTimeout(() => setCount(0), 1800);
    }, count === 0 ? 700 : 320);
    return () => clearTimeout(t);
  }, [count]);
  const totalW = TYPING_TEXT.length * CHAR_W;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ height: '22px', position: 'relative', width: `${totalW}px`, marginBottom: '2px' }}>
        <span style={{
          position: 'absolute', left: `${count * CHAR_W}px`, top: 0,
          fontSize: '14px', transition: 'left 0.28s ease',
          opacity: count <= TYPING_TEXT.length ? 1 : 0,
          color: '#E87A2F', lineHeight: 1,
        }}>➤</span>
      </div>
      <div style={{ display: 'flex' }}>
        {TYPING_TEXT.split('').map((char, i) => (
          <span key={i} style={{
            display: 'inline-block', width: `${CHAR_W}px`, textAlign: 'center',
            fontSize: '32px', fontWeight: 900,
            background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            opacity: count > i ? 1 : 0, transition: 'opacity 0.18s ease',
          }}>{char}</span>
        ))}
      </div>
    </div>
  );
}

function LoginModal({ onClose }) {
  const router = useRouter();
  const [tab, setTab] = useState('criar');
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSignUp() {
    if (!form.nome || !form.email || !form.senha) { setError('Preencha todos os campos.'); return; }
    setLoading(true); setError('');
    const supabase = createClient();
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { name: form.nome } },
    });
    if (authErr) { setError(authErr.message); setLoading(false); return; }
    if (data.user) {
      await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email: form.email, name: form.nome }),
      }).catch(() => {})
    }
    router.push('/chat');
  }

  async function handleSignIn() {
    if (!form.email || !form.senha) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true); setError('');
    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.senha,
    });
    if (authErr) { setError('E-mail ou senha incorretos.'); setLoading(false); return; }
    router.push('/chat');
  }

  async function handleGoogleSignIn() {
    setLoading(true); setError('');
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account', access_type: 'offline' },
      },
    });
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        zIndex: 200, backdropFilter: 'blur(6px)',
      }} />
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(400px, 92vw)',
        maxHeight: '85vh',
        background: '#fdf0e0',
        borderRadius: '24px',
        zIndex: 201,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        animation: 'scaleIn 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.12)' }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#777', margin: '12px 24px 0', fontStyle: 'italic' }}>
          Acesse o Mydow para executar suas tarefas
        </p>
        <div style={{ display: 'flex', margin: '14px 24px 0', borderRadius: '12px', background: 'rgba(0,0,0,0.06)', padding: '3px' }}>
          {['criar', 'entrar'].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              background: tab === t ? '#E87A2F' : 'transparent',
              color: tab === t ? '#fff' : '#888', transition: 'all 0.2s ease',
            }}>{t === 'criar' ? 'Criar Conta' : 'Entrar'}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px 0' }}>
          {error && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '8px', textAlign: 'center' }}>{error}</p>}
          {tab === 'criar' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="modal-input" placeholder="Nome" value={form.nome} onChange={set('nome')} />
              <input className="modal-input" placeholder="E-mail" type="email" value={form.email} onChange={set('email')} />
              <input className="modal-input" placeholder="Senha" type="password" value={form.senha} onChange={set('senha')} />
              <button className="btn-orange modal-btn" onClick={handleSignUp} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="modal-input" placeholder="E-mail" type="email" value={form.email} onChange={set('email')} />
              <input className="modal-input" placeholder="Senha" type="password" value={form.senha} onChange={set('senha')} />
              <button className="btn-orange modal-btn" onClick={handleSignIn} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: '12px', color: '#aaa' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
          </div>
          <button onClick={handleGoogleSignIn} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.15)', background: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Entrar com Google
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 18px' }}>
          <MydowTyping />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [currentCap, setCurrentCap] = useState(0);
  const [capVisible, setCapVisible] = useState(true);
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCapVisible(false);
      const t = setTimeout(() => {
        setCurrentCap((p) => (p + 1) % CAPABILITIES.length);
        setCapVisible(true);
      }, 420);
      return () => clearTimeout(t);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* página inteira: coluna com fundo creme */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#fdf0e0' }}>

        {/* ── CONTEÚDO PRINCIPAL ── */}
        <main style={{ flex: 1, display: 'flex' }}>

          {/* ── ESQUERDA: quadrado branco flutuando no creme ── */}
          <div className="left-panel">
            <div className="white-box">
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <p
                  key={currentCap}
                  style={{
                    fontSize: 'clamp(28px, 3.2vw, 52px)',
                    fontWeight: 800,
                    fontStyle: 'italic',
                    lineHeight: 1.15,
                    color: '#111',
                    letterSpacing: '-0.025em',
                    textAlign: 'center',
                    margin: 0,
                    opacity: capVisible ? 1 : 0,
                    transform: capVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}
                >
                  {CAPABILITIES[currentCap]}
                </p>
              </div>
              {/* barra laranja */}
              <div style={{ width: '100%', height: '3px', background: 'rgba(0,0,0,0.07)', borderRadius: '2px', overflow: 'hidden', marginTop: '24px' }}>
                <div key={`bar-${currentCap}`} style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #E87A2F, #D4AF37)',
                  borderRadius: '2px',
                  animation: 'progressBar 3.5s linear forwards',
                }} />
              </div>
            </div>
          </div>

          {/* ── DIREITA: imagem + nome + frase + botão + framework ── */}
          <div className="right-panel">

            {/* imagem colada ao nome — margem bottom zero na imagem */}
            <div className="agent-wrap float-agent">
              <Image src="/images/mydow.png" alt="Mydow" fill style={{ objectFit: 'contain' }} priority />
            </div>

            {/* nome imediatamente abaixo, sem margem top */}
            <h1 style={{
              fontSize: 'clamp(42px, 4.8vw, 70px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #E87A2F 0%, #D4AF37 50%, #C96520 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              Mydow
            </h1>

            <p style={{
              fontSize: 'clamp(13px, 1.3vw, 17px)',
              fontWeight: 800,
              color: '#222',
              margin: 0,
              textAlign: 'center',
              maxWidth: '320px',
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
            }}>
              Seu Agente que executa tarefas de alto nível
            </p>

            <button
              className="btn-orange"
              onClick={() => setShowModal(true)}
              style={{
                padding: '13px 40px',
                borderRadius: '50px',
                border: 'none',
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                fontFamily: 'inherit',
              }}
            >
              Começar
            </button>

            {/* framework — começa do meio da tela (left: 50vw) */}
            <div className="fw-inline">
              {[
                { letter: 'M', title: 'Mente Estratégica', desc: 'Planeja e antecipa com precisão.' },
                { letter: 'Y', title: 'Your Agent',         desc: 'Disponível 24h, na sua voz.' },
                { letter: 'D', title: 'Decisão Autônoma',   desc: 'Executa sem aprovação constante.' },
                { letter: 'O', title: 'Orquestração Total', desc: 'Conecta tudo em harmonia.' },
                { letter: 'W', title: 'Workflow Elevado',   desc: 'Complexo vira extraordinário.' },
              ].map((item, i) => (
                <div key={item.letter} className="fw-inline-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(232,122,47,0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,122,47,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.borderColor = 'rgba(232,122,47,0.13)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="fw-inline-letter">{item.letter}</div>
                  <div className="fw-inline-title">{item.title}</div>
                  <p className="fw-inline-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── RODAPÉ ── */}
        <footer style={{
          background: '#0A0A0A',
          padding: '18px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600,
            background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Desenvolvido por Michel Macedo Holding
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '15px', fontWeight: 900,
              background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Mydow</span>
            <span style={{
              fontSize: '13px', fontWeight: 700,
              background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>2026 ©</span>
          </div>
        </footer>
      </div>

      {/* ── MODAL ── */}
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}

      <style>{`
        /* ── DESKTOP ── */
        .left-panel {
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .white-box {
          width: 100%;
          height: 100%;
          background-color: #ffffff;
          background-image:
            linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px);
          background-size: 44px 44px;
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 40px rgba(0,0,0,0.06);
        }
        .right-panel {
          width: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 32px 32px 32px 0;
        }
        .agent-wrap {
          width: 300px;
          height: 300px;
          position: relative;
          flex-shrink: 0;
        }
        .fw-inline {
          display: flex;
          gap: 8px;
          width: 100%;
          margin-top: 8px;
        }
        .fw-inline-card {
          flex: 1;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(232,122,47,0.13);
          border-radius: 12px;
          padding: 12px 10px;
          transition: all 0.22s ease;
          cursor: default;
          animation: fadeInUp 0.4s ease both;
        }
        .fw-inline-letter {
          font-size: 26px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 5px;
          background: linear-gradient(135deg, #E87A2F, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fw-inline-title {
          font-size: 10px;
          font-weight: 700;
          color: #111;
          margin-bottom: 3px;
          line-height: 1.2;
        }
        .fw-inline-desc {
          font-size: 9.5px;
          color: #777;
          line-height: 1.4;
          margin: 0;
        }

        /* ── ANIMAÇÕES ── */
        @keyframes progressBar { from { width: 0%; } to { width: 100%; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform: translate(-50%,-50%) scale(0.92); } to { opacity:1; transform: translate(-50%,-50%) scale(1); } }
        .btn-orange {
          background: linear-gradient(135deg, #E87A2F 0%, #C96520 60%, #FFB347 100%);
          transition: all 0.3s ease;
        }
        .btn-orange:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 36px rgba(232,122,47,0.45); }
        .float-agent { animation: floatAgent 6s ease-in-out infinite; }
        @keyframes floatAgent { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        .modal-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          border: 1px solid rgba(232,122,47,0.25); background: #fff;
          font-size: 14px; font-family: inherit; color: #111; outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .modal-input:focus { border-color: #E87A2F; }
        .modal-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          color: white; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: inherit;
        }

        /* ══ MOBILE ══ */
        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100%;
            padding: 60px 32px 40px;
            gap: 20px;
          }
          .agent-wrap { width: 260px; height: 260px; }
          .fw-inline { display: none; }
        }
      `}</style>
    </>
  );
}

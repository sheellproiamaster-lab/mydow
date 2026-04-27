'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  'Aprende, evolui e se adapta ao seu contexto',
  'Cria relatórios e análises executivas',
  'Coordena equipes e processos complexos',
];

const FRAMEWORK = [
  {
    letter: 'M',
    title: 'Mente Estratégica',
    desc: 'Planeja, prioriza e antecipa cada movimento com precisão cirúrgica.',
  },
  {
    letter: 'Y',
    title: 'Your Agent',
    desc: 'Seu agente pessoal de alto desempenho, disponível 24h, na sua voz.',
  },
  {
    letter: 'D',
    title: 'Decisão Autônoma',
    desc: 'Executa com maestria sem precisar de aprovação constante.',
  },
  {
    letter: 'O',
    title: 'Orquestração Total',
    desc: 'Conecta ferramentas, APIs e sistemas em perfeita harmonia.',
  },
  {
    letter: 'W',
    title: 'Workflow Elevado',
    desc: 'Transforma processos complexos em resultados extraordinários.',
  },
];

export default function Home() {
  const [currentCap, setCurrentCap] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setCurrentCap((prev) => (prev + 1) % CAPABILITIES.length);
        setVisible(true);
      }, 420);
      return () => clearTimeout(t);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <main>

        {/* ── TOP SECTION ── fundo preto ───────────────────────── */}
        <div
          style={{
            background: '#0A0A0A',
            display: 'flex',
            alignItems: 'flex-start',
            padding: '48px 48px 40px',
            gap: '48px',
          }}
        >
          {/* ── ESQUERDA: quadrado branco c/ animação ── */}
          <div
            style={{
              flexShrink: 0,
              width: '46%',
              backgroundColor: '#ffffff',
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              borderRadius: '16px',
              padding: '32px 36px 28px',
              boxShadow: '0 0 60px rgba(232,122,47,0.08)',
            }}
          >
            {/* Counter */}
            <div
              style={{
                fontSize: '11px',
                color: '#bbb',
                letterSpacing: '3px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              {String(currentCap + 1).padStart(2, '0')} /{' '}
              {String(CAPABILITIES.length).padStart(2, '0')}
            </div>

            {/* Texto animado grande */}
            <div style={{ minHeight: '168px', display: 'flex', alignItems: 'flex-start' }}>
              <p
                key={currentCap}
                style={{
                  fontSize: 'clamp(32px, 3.8vw, 58px)',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  lineHeight: 1.1,
                  color: '#111',
                  letterSpacing: '-0.025em',
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? 'translateY(0) scale(1)'
                    : 'translateY(24px) scale(0.96)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
              >
                {CAPABILITIES[currentCap]}
              </p>
            </div>

            {/* Linha laranja — o quadrado para aqui */}
            <div
              style={{
                marginTop: '20px',
                height: '3px',
                background: 'rgba(0,0,0,0.06)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                key={`bar-${currentCap}`}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #E87A2F, #D4AF37)',
                  borderRadius: '2px',
                  animation: 'progressBar 3.5s linear forwards',
                }}
              />
            </div>
          </div>

          {/* ── DIREITA: imagem + card creme + botão ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '20px',
            }}
          >
            {/* Imagem do Mydow — grande, sem círculo, sem anel */}
            <div
              className="float-agent"
              style={{
                width: '180px',
                height: '180px',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/mydow-agent.jpeg"
                alt="Mydow"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            {/* Card creme com descrição */}
            <div
              style={{
                background: '#fdf0e0',
                borderRadius: '16px',
                padding: '20px 24px',
                maxWidth: '420px',
                border: '1px solid rgba(232,122,47,0.15)',
              }}
            >
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#111',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Mydow não é um assistente comum. É um agente de inteligência
                autônoma projetado para operar no nível estratégico — tomando
                decisões, executando processos e entregando resultados que antes
                exigiam equipes inteiras.
              </p>
            </div>

            {/* Botão Começar Agora */}
            <button
              className="btn-orange"
              style={{
                padding: '14px 36px',
                borderRadius: '50px',
                border: 'none',
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'inherit',
              }}
            >
              <span>Começar Agora</span>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.22)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}
              >
                →
              </span>
            </button>
          </div>
        </div>

        {/* ── FRAMEWORK ── 5 cards lado a lado ───────────────────── */}
        <div
          style={{
            background: '#fdf0e0',
            padding: '28px 40px 20px',
            display: 'flex',
            gap: '12px',
            borderTop: '1px solid rgba(232,122,47,0.1)',
          }}
        >
          {FRAMEWORK.map((item, i) => (
            <div
              key={item.letter}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(232,122,47,0.13)',
                borderRadius: '14px',
                padding: '18px 16px',
                transition: 'all 0.25s ease',
                cursor: 'default',
                animation: `fadeInUp 0.45s ease ${i * 0.07}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = 'rgba(232,122,47,0.38)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,122,47,0.13)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.borderColor = 'rgba(232,122,47,0.13)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  fontSize: '38px',
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {item.letter}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: '5px',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </div>
              <p style={{ fontSize: '11.5px', color: '#666', lineHeight: 1.55, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── SLOGAN ──────────────────────────────────────────────── */}
        <div
          style={{
            background: '#fdf0e0',
            textAlign: 'center',
            padding: '14px 40px 24px',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(15px, 1.8vw, 20px)',
              fontWeight: 700,
              color: '#333',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            Seu Agente que executa tarefas de alto nível
          </p>
        </div>
      </main>

      {/* ── RODAPÉ ──────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#0A0A0A',
          color: 'white',
          padding: '22px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#555',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Desenvolvido por Michel Macedo Holding
          </div>
          <div
            style={{
              width: '32px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #E87A2F, transparent)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Mydow
            </span>
            <span style={{ color: '#444', fontSize: '13px' }}>
              © {new Date().getFullYear()} — Todos os direitos reservados
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .btn-orange {
          background: linear-gradient(135deg, #E87A2F 0%, #C96520 60%, #FFB347 100%);
          background-size: 200% 200%;
          transition: all 0.3s ease;
        }
        .btn-orange:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 36px rgba(232,122,47,0.45);
        }
        .float-agent {
          animation: floatAgent 6s ease-in-out infinite;
        }
        @keyframes floatAgent {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}

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
  { letter: 'M', title: 'Mente Estratégica', desc: 'Planeja, prioriza e antecipa cada movimento com precisão cirúrgica.' },
  { letter: 'Y', title: 'Your Agent',         desc: 'Seu agente pessoal de alto desempenho, disponível 24h, na sua voz.' },
  { letter: 'D', title: 'Decisão Autônoma',   desc: 'Executa com maestria sem precisar de aprovação constante.' },
  { letter: 'O', title: 'Orquestração Total', desc: 'Conecta ferramentas, APIs e sistemas em perfeita harmonia.' },
  { letter: 'W', title: 'Workflow Elevado',   desc: 'Transforma processos complexos em resultados extraordinários.' },
];

const WORDS = [
  { text: 'Estratégia', color: '#FF9500' },
  { text: 'Autonomia',  color: '#FFD700' },
  { text: 'Precisão',   color: '#FF6B35' },
  { text: 'Execução',   color: '#FFC300' },
  { text: 'Resultado',  color: '#FFFFFF' },
];

export default function Home() {
  const [currentCap, setCurrentCap]   = useState(0);
  const [capVisible, setCapVisible]   = useState(true);
  const [wordIndex, setWordIndex]     = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  /* ciclo das capacidades */
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

  /* ciclo das palavras */
  useEffect(() => {
    let t1, t2;
    t1 = setTimeout(() => {
      setWordVisible(false);
      t2 = setTimeout(() => {
        setWordIndex((p) => (p + 1) % WORDS.length);
        setWordVisible(true);
      }, 500);
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [wordIndex]);

  return (
    <>
      <main>

        {/* ══════════════ SEÇÃO PRETA ══════════════ */}
        <div
          style={{
            background: '#0A0A0A',
            display: 'flex',
            alignItems: 'stretch',   /* quadrado branco = altura do conteúdo direito */
            padding: '48px',
            gap: '32px',
          }}
        >

          {/* ── QUADRADO BRANCO (animação) ── */}
          <div
            style={{
              width: '44%',
              flexShrink: 0,
              backgroundColor: '#ffffff',
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              borderRadius: '16px',
              padding: '32px 36px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* contador */}
            <div
              style={{
                fontSize: '11px',
                color: '#bbb',
                letterSpacing: '3px',
                fontWeight: 700,
                marginBottom: '20px',
                alignSelf: 'flex-start',
              }}
            >
              {String(currentCap + 1).padStart(2, '0')} /{' '}
              {String(CAPABILITIES.length).padStart(2, '0')}
            </div>

            {/* texto animado — ocupa o espaço restante, centralizado */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <p
                key={currentCap}
                style={{
                  fontSize: 'clamp(34px, 4vw, 60px)',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  lineHeight: 1.1,
                  color: '#111',
                  letterSpacing: '-0.025em',
                  textAlign: 'center',
                  opacity: capVisible ? 1 : 0,
                  transform: capVisible ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.96)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
              >
                {CAPABILITIES[currentCap]}
              </p>
            </div>

            {/* barra laranja — o quadrado para aqui */}
            <div
              style={{
                width: '100%',
                height: '3px',
                background: 'rgba(0,0,0,0.07)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '24px',
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

          {/* ── CENTRO: imagem + card creme + botão ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            {/* imagem — maior, sem anel */}
            <div
              className="float-agent"
              style={{ width: '220px', height: '220px', position: 'relative', flexShrink: 0 }}
            >
              <Image
                src="/images/mydow-agent.jpeg"
                alt="Mydow"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            {/* card creme */}
            <div
              style={{
                background: '#fdf0e0',
                borderRadius: '16px',
                padding: '20px 24px',
                maxWidth: '380px',
                border: '1px solid rgba(232,122,47,0.18)',
              }}
            >
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#111',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Mydow não é um assistente comum. É um agente de inteligência
                autônoma projetado para operar no nível estratégico — tomando
                decisões, executando processos e entregando resultados que antes
                exigiam equipes inteiras.
              </p>
            </div>

            {/* botão */}
            <button
              className="btn-orange"
              style={{
                width: 'fit-content',
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

          {/* ── DIREITA: animação de palavras ── */}
          <div
            style={{
              width: '160px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              paddingTop: '12px',
              gap: '10px',
            }}
          >
            {WORDS.map((word, i) => (
              <div
                key={word.text}
                style={{
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: wordIndex === i && wordVisible ? 1 : 0,
                  transform:
                    wordIndex === i && wordVisible
                      ? 'translateX(0)'
                      : 'translateX(16px)',
                  transition: 'opacity 0.45s ease, transform 0.45s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: word.color,
                    letterSpacing: '-0.01em',
                    textShadow: `0 0 24px ${word.color}55`,
                  }}
                >
                  {word.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ FRAMEWORK ══════════════ */}
        <div
          style={{
            background: '#fdf0e0',
            padding: '24px 40px 18px',
            display: 'flex',
            gap: '12px',
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
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '5px' }}>
                {item.title}
              </div>
              <p style={{ fontSize: '11.5px', color: '#666', lineHeight: 1.55, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* ══════════════ RODAPÉ ══════════════ */}
      <footer
        style={{
          background: '#0A0A0A',
          padding: '28px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>

          {/* slogan — destaque máximo */}
          <p
            style={{
              fontSize: 'clamp(17px, 2vw, 24px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Seu Agente que executa tarefas de alto nível
          </p>

          <div
            style={{
              width: '36px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #E87A2F, transparent)',
            }}
          />

          {/* desenvolvido por */}
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Desenvolvido por Michel Macedo Holding
          </div>

          {/* Mydow 2026 © */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Mydow
            </span>
            <span style={{ color: '#555', fontSize: '13px' }}>2026 ©</span>
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

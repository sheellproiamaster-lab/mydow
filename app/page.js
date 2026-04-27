'use client';

import { useState, useEffect, useRef } from 'react';
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
  'Monitora métricas e alerta em tempo real',
  'Negocia, responde e representa você',
];

const FRAMEWORK = [
  {
    letter: 'M',
    title: 'Mente Estratégica',
    desc: 'Inteligência que planeja, prioriza e antecipa cada movimento do seu negócio com precisão cirúrgica.',
    icon: '🧠',
  },
  {
    letter: 'Y',
    title: 'Your Agent',
    desc: 'Seu agente pessoal de alto desempenho — disponível 24h, alinhado aos seus objetivos, na sua voz.',
    icon: '⚡',
  },
  {
    letter: 'D',
    title: 'Decisão Autônoma',
    desc: 'Executa com maestria sem precisar de aprovação constante. Autonomia com responsabilidade.',
    icon: '🎯',
  },
  {
    letter: 'O',
    title: 'Orquestração Total',
    desc: 'Conecta ferramentas, APIs e sistemas em perfeita harmonia — tudo funcionando como um só.',
    icon: '🔗',
  },
  {
    letter: 'W',
    title: 'Workflow Elevado',
    desc: 'Transforma processos complexos em resultados extraordinários. Do caos à excelência operacional.',
    icon: '🚀',
  },
];

function ParticleDot({ style }) {
  return <div className="particle-dot" style={style} />;
}

function LeftPanel({ currentCap, visible }) {
  return (
    <div
      className="left-panel grid-bg flex flex-col items-center justify-center relative overflow-hidden"
      style={{ width: '50%', minHeight: '100vh', flexShrink: 0 }}
    >
      {/* Subtle corner fade overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.6) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Decorative label */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '32px',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#E87A2F',
            animation: 'glowBlink 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#999',
            fontWeight: 600,
          }}
        >
          Capacidades
        </span>
      </div>

      {/* Main animated text block */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '0 48px',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        {/* Counter */}
        <div
          style={{
            fontSize: '11px',
            color: '#bbb',
            letterSpacing: '2px',
            marginBottom: '20px',
            fontWeight: 600,
          }}
        >
          {String(currentCap + 1).padStart(2, '0')} / {String(CAPABILITIES.length).padStart(2, '0')}
        </div>

        {/* Animated capability text */}
        <div
          style={{
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <p
            key={currentCap}
            style={{
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              fontWeight: 800,
              fontStyle: 'italic',
              lineHeight: 1.15,
              color: '#111',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
              letterSpacing: '-0.02em',
            }}
          >
            {CAPABILITIES[currentCap]}
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: '32px',
            height: '3px',
            background: 'rgba(0,0,0,0.07)',
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

        {/* Dots navigator */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {CAPABILITIES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentCap ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentCap ? '#E87A2F' : 'rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom quote */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '32px',
          right: '32px',
          zIndex: 2,
          borderLeft: '3px solid rgba(232,122,47,0.3)',
          paddingLeft: '16px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: '#888',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          &ldquo;Não se trata de trabalhar mais.
          <br />
          Trata-se de executar com inteligência.&rdquo;
        </p>
      </div>

      <style>{`
        @keyframes glowBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function AgentImage() {
  const [imageExists, setImageExists] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
    img.src = '/images/mydow-agent.jpeg';
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Outer expanding rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: `-${i * 20}px`,
            borderRadius: '50%',
            border: '1px solid rgba(232,122,47,0.15)',
            animation: `ringExpandAnim ${2 + i * 0.7}s ease-out ${i * 0.5}s infinite`,
          }}
        />
      ))}

      {/* Main image container */}
      <div
        className="float-agent glow-ring"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid rgba(232,122,47,0.4)',
          position: 'relative',
          background: imageExists
            ? 'transparent'
            : 'linear-gradient(135deg, #E87A2F 0%, #D4AF37 50%, #C96520 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {imageExists ? (
          <Image
            src="/images/mydow-agent.jpeg"
            alt="Mydow Agent"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'white', padding: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🤖</div>
            <div style={{ fontSize: '11px', opacity: 0.9, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
              Mydow
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ringExpandAnim {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      className="right-panel"
      style={{
        width: '50%',
        minHeight: '100vh',
        background: '#fdf0e0',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        paddingTop: '80px',
      }}
    >
      <div
        style={{
          padding: '48px 56px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
          maxWidth: '640px',
          width: '100%',
        }}
      >
        {/* Agent image + title block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '32px',
            animation: 'fadeInUp 0.7s ease forwards',
          }}
        >
          <AgentImage />

          {/* Name */}
          <div>
            <h1
              className="shimmer-text"
              style={{
                fontSize: 'clamp(52px, 6vw, 80px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                marginBottom: '12px',
              }}
            >
              Mydow
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #E87A2F, transparent)',
                }}
              />
              <p
                style={{
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  color: '#555',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                O agente que executa tarefas de alto nível
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: '15px',
              color: '#666',
              lineHeight: 1.75,
              maxWidth: '440px',
              borderLeft: '3px solid rgba(232,122,47,0.25)',
              paddingLeft: '16px',
            }}
          >
            Mydow não é um assistente comum. É um agente de inteligência autônoma
            projetado para operar no nível estratégico — tomando decisões, executando
            processos e entregando resultados que antes exigiam equipes inteiras.
          </p>

          {/* CTA Button */}
          <button
            className="btn-orange"
            style={{
              padding: '16px 40px',
              borderRadius: '50px',
              border: 'none',
              color: 'white',
              fontSize: '16px',
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
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                fontSize: '14px',
              }}
            >
              →
            </span>
          </button>
        </div>

        {/* MYDOW Framework */}
        <div style={{ animation: 'fadeInUp 0.7s ease 0.2s both' }}>
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#E87A2F',
                fontWeight: 700,
              }}
            >
              Framework
            </span>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#111',
                marginTop: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              O que é Mydow?
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FRAMEWORK.map((item, i) => (
              <div
                key={item.letter}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '18px 20px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(232,122,47,0.12)',
                  backdropFilter: 'blur(10px)',
                  animation: `fadeInUp 0.5s ease ${0.3 + i * 0.1}s both`,
                  transition: 'all 0.25s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.borderColor = 'rgba(232,122,47,0.35)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(232,122,47,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.borderColor = 'rgba(232,122,47,0.12)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Letter */}
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    lineHeight: 1,
                    minWidth: '40px',
                    background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {item.letter}
                </div>

                {/* Content */}
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#111',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {item.icon} {item.title}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slogan */}
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(232,122,47,0.08), rgba(212,175,55,0.08))',
            border: '1px solid rgba(232,122,47,0.15)',
            animation: 'fadeInUp 0.7s ease 0.6s both',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#E87A2F',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            Slogan
          </div>
          <p
            style={{
              fontSize: 'clamp(18px, 2.5vw, 26px)',
              fontWeight: 800,
              fontStyle: 'italic',
              color: '#111',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
            }}
          >
            &ldquo;Enquanto você pensa,
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              o Mydow já executou.
            </span>
            &rdquo;
          </p>
        </div>

        {/* BATNA - Harvard Style */}
        <div
          className="batna-card"
          style={{
            padding: '28px 32px',
            borderRadius: '16px',
            animation: 'fadeInUp 0.7s ease 0.8s both',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              ⚖️
            </div>
            <div>
              <div
                style={{
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#E87A2F',
                  fontWeight: 700,
                }}
              >
                Análise BATNA · Harvard Negotiation Style
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#111',
                  marginTop: '2px',
                }}
              >
                Sua Melhor Alternativa ao Mydow
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13.5px', color: '#555', lineHeight: 1.75, marginBottom: '16px' }}>
            Antes de decidir, avalie sua BATNA — Best Alternative to a Negotiated Agreement.
            Sem o Mydow, o que você tem? Mais horas trabalhando? Contratar mais pessoas? Delegar
            para ferramentas genéricas que não entendem seu contexto?
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            {[
              { label: 'Sem Mydow', items: ['+ Horas perdidas', '+ Custo operacional', '+ Erros humanos', '+ Decisões lentas'], bad: true },
              { label: 'Com Mydow', items: ['Execução 24h', 'ROI mensurável', 'Zero gargalos', 'Escala ilimitada'], bad: false },
            ].map((col) => (
              <div
                key={col.label}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: col.bad ? 'rgba(255,50,50,0.05)' : 'rgba(232,122,47,0.08)',
                  border: `1px solid ${col.bad ? 'rgba(255,50,50,0.1)' : 'rgba(232,122,47,0.15)'}`,
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: col.bad ? '#c0392b' : '#E87A2F',
                    marginBottom: '8px',
                  }}
                >
                  {col.label}
                </div>
                {col.items.map((item) => (
                  <div
                    key={item}
                    style={{
                      fontSize: '12px',
                      color: '#555',
                      padding: '3px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ color: col.bad ? '#c0392b' : '#E87A2F', fontWeight: 700 }}>
                      {col.bad ? '✗' : '✓'}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: '13px',
              fontStyle: 'italic',
              color: '#777',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              paddingTop: '14px',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: '#E87A2F' }}>Conclusão estratégica:</strong> O Mydow não é
            uma opção — é sua vantagem competitiva definitiva. Cada dia sem ele é um dia que sua
            concorrência avança.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [imageExists, setImageExists] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
    img.src = '/images/mydow-agent.jpeg';
  }, []);

  return (
    <header
      className="header-glass"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '64px',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Logo + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(232,122,47,0.3)',
            background: imageExists
              ? 'transparent'
              : 'linear-gradient(135deg, #E87A2F, #D4AF37)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {imageExists ? (
            <Image
              src="/images/mydow-agent.jpeg"
              alt="Mydow"
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '18px' }}>🤖</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mydow
          </span>
          <span
            style={{
              fontSize: '10px',
              color: '#999',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Agent
          </span>
        </div>
      </div>

      {/* Right side nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span
          style={{
            fontSize: '11px',
            color: '#999',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Alto Nível
        </span>
        <button
          className="btn-orange"
          style={{
            padding: '8px 22px',
            borderRadius: '50px',
            border: 'none',
            color: 'white',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Começar
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: '#0A0A0A',
        color: 'white',
        padding: '32px 24px',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Company */}
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Desenvolvido por Michel Macedo Holding
        </div>

        {/* Divider */}
        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #E87A2F, transparent)',
          }}
        />

        {/* Brand + copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '18px',
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
          <span style={{ color: '#444', fontSize: '14px' }}>©</span>
          <span style={{ color: '#444', fontSize: '13px' }}>
            {new Date().getFullYear()} — Todos os direitos reservados
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>
          O agente que executa tarefas de alto nível
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  const [currentCap, setCurrentCap] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const timer = setTimeout(() => {
        setCurrentCap((prev) => (prev + 1) % CAPABILITIES.length);
        setVisible(true);
      }, 450);
      return () => clearTimeout(timer);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />

      <main>
        {/* Split layout: left (grid/text) + right (content) */}
        <div
          className="split-layout"
          style={{
            display: 'flex',
            minHeight: '100vh',
          }}
        >
          <LeftPanel currentCap={currentCap} visible={visible} />
          <RightPanel />
        </div>
      </main>

      <Footer />
    </>
  );
}

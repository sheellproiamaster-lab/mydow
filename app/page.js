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

function Header() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        background: 'rgba(253,240,224,0.94)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(232,122,47,0.1)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
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
    </header>
  );
}

function LeftPanel({ currentCap, visible }) {
  return (
    <div
      style={{
        width: '50%',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Fade overlay on edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 80% 50%, transparent 50%, rgba(255,255,255,0.5) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Animation at TOP */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '40px 44px 0',
        }}
      >
        {/* Counter */}
        <div
          style={{
            fontSize: '11px',
            color: '#bbb',
            letterSpacing: '3px',
            fontWeight: 700,
            marginBottom: '18px',
          }}
        >
          {String(currentCap + 1).padStart(2, '0')} / {String(CAPABILITIES.length).padStart(2, '0')}
        </div>

        {/* Large animated text */}
        <div style={{ minHeight: '200px', display: 'flex', alignItems: 'flex-start' }}>
          <p
            key={currentCap}
            style={{
              fontSize: 'clamp(38px, 4.8vw, 68px)',
              fontWeight: 800,
              fontStyle: 'italic',
              lineHeight: 1.1,
              color: '#111',
              letterSpacing: '-0.025em',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {CAPABILITIES[currentCap]}
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: '28px',
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

        {/* Dots */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CAPABILITIES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentCap ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentCap ? '#E87A2F' : 'rgba(0,0,0,0.13)',
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
          bottom: '28px',
          left: '44px',
          right: '44px',
          zIndex: 2,
          borderLeft: '3px solid rgba(232,122,47,0.25)',
          paddingLeft: '14px',
        }}
      >
        <p style={{ fontSize: '13px', color: '#999', fontStyle: 'italic', lineHeight: 1.6 }}>
          &ldquo;Não se trata de trabalhar mais.
          <br />
          Trata-se de executar com inteligência.&rdquo;
        </p>
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      style={{
        width: '50%',
        flexShrink: 0,
        background: '#fdf0e0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 52px',
        gap: '20px',
      }}
    >
      {/* Agent image — large, no circle, no ring */}
      <div
        className="float-agent"
        style={{
          width: '260px',
          height: '260px',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <Image
          src="/images/mydow-agent.jpeg"
          alt="Mydow Agent"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      {/* Description */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '2px',
              background: 'linear-gradient(90deg, #E87A2F, transparent)',
            }}
          />
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 500, letterSpacing: '0.02em' }}>
            O agente que executa tarefas de alto nível
          </p>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: '#777',
            lineHeight: 1.75,
            maxWidth: '420px',
            borderLeft: '3px solid rgba(232,122,47,0.2)',
            paddingLeft: '14px',
          }}
        >
          Mydow não é um assistente comum. É um agente de inteligência autônoma
          projetado para operar no nível estratégico — tomando decisões, executando
          processos e entregando resultados que antes exigiam equipes inteiras.
        </p>
      </div>

      {/* CTA */}
      <button
        className="btn-orange"
        style={{
          width: 'fit-content',
          padding: '15px 38px',
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
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
        >
          →
        </span>
      </button>
    </div>
  );
}

function Framework() {
  return (
    <div
      style={{
        background: '#fdf0e0',
        padding: '32px 40px 20px',
        display: 'flex',
        gap: '14px',
        borderTop: '1px solid rgba(232,122,47,0.12)',
      }}
    >
      {FRAMEWORK.map((item, i) => (
        <div
          key={item.letter}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(232,122,47,0.12)',
            borderRadius: '16px',
            padding: '20px 18px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease',
            cursor: 'default',
            animation: `fadeInUp 0.5s ease ${i * 0.08}s both`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,1)';
            e.currentTarget.style.borderColor = 'rgba(232,122,47,0.35)';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,122,47,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
            e.currentTarget.style.borderColor = 'rgba(232,122,47,0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              fontSize: '42px',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '10px',
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
              fontSize: '13px',
              fontWeight: 700,
              color: '#111',
              marginBottom: '6px',
              letterSpacing: '-0.01em',
            }}
          >
            {item.title}
          </div>
          <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

function Slogan() {
  return (
    <div
      style={{
        background: '#fdf0e0',
        textAlign: 'center',
        padding: '16px 40px 28px',
      }}
    >
      <p
        style={{
          fontSize: 'clamp(16px, 2vw, 22px)',
          fontWeight: 800,
          fontStyle: 'italic',
          color: '#222',
          letterSpacing: '-0.02em',
        }}
      >
        Não é automação.{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #E87A2F, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          É execução de alto nível.
        </span>
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: '#0A0A0A',
        color: 'white',
        padding: '24px',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
            width: '36px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #E87A2F, transparent)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '17px',
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
  );
}

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
      <Header />

      <main style={{ paddingTop: '64px' }}>
        {/* Split: left grid animation + right content */}
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          <LeftPanel currentCap={currentCap} visible={visible} />
          <RightPanel />
        </div>

        {/* Framework - full width */}
        <Framework />

        {/* Slogan */}
        <Slogan />
      </main>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

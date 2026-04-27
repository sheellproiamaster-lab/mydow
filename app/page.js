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
  'Aprende e se adapta ao seu contexto',
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

        {/* ══ SEÇÃO PRETA ══ */}
        <div className="top-section">

          {/* QUADRADO BRANCO */}
          <div className="white-box">
            <div className="cap-counter">
              {String(currentCap + 1).padStart(2, '0')} / {String(CAPABILITIES.length).padStart(2, '0')}
            </div>
            <div className="cap-text-wrap">
              <p
                key={currentCap}
                className="cap-text"
                style={{
                  opacity: capVisible ? 1 : 0,
                  transform: capVisible ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.96)',
                }}
              >
                {CAPABILITIES[currentCap]}
              </p>
            </div>
            <div className="cap-bar-track">
              <div key={`bar-${currentCap}`} className="cap-bar-fill" />
            </div>
          </div>

          {/* CENTRO: imagem + card + botão */}
          <div className="center-col">
            <div className="agent-img-wrap float-agent">
              <Image
                src="/images/mydow-agent.jpeg"
                alt="Mydow"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            <div className="cream-card">
              <p className="cream-card-text">
                Mydow não é um assistente comum. É um agente de inteligência
                autônoma projetado para operar no nível estratégico — tomando
                decisões, executando processos e entregando resultados que antes
                exigiam equipes inteiras.
              </p>
            </div>

            <button className="btn-orange cta-btn">
              <span>Começar Agora</span>
              <span className="cta-arrow">→</span>
            </button>
          </div>

          {/* PALAVRAS — canto direito */}
          <div className="word-col">
            {WORDS.map((word, i) => (
              <div
                key={word.text}
                className="word-slot"
                style={{
                  opacity: wordIndex === i && wordVisible ? 1 : 0,
                  transform: wordIndex === i && wordVisible ? 'translateX(0)' : 'translateX(16px)',
                }}
              >
                <span style={{ color: word.color, textShadow: `0 0 24px ${word.color}55` }}>
                  {word.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FRAMEWORK ══ */}
        <div className="fw-grid">
          {FRAMEWORK.map((item, i) => (
            <div
              key={item.letter}
              className="fw-card"
              style={{ animationDelay: `${i * 0.07}s` }}
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
              <div className="fw-letter">{item.letter}</div>
              <div className="fw-title">{item.title}</div>
              <p className="fw-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ══ RODAPÉ ══ */}
      <footer className="site-footer">
        <p className="footer-slogan">Seu Agente que executa tarefas de alto nível</p>
        <div className="footer-divider" />
        <div className="footer-by">Desenvolvido por Michel Macedo Holding</div>
        <div className="footer-brand">
          <span className="footer-name">Mydow</span>
          <span className="footer-year">2026 ©</span>
        </div>
      </footer>

      <style>{`
        /* ── DESKTOP ── */
        .top-section {
          background: #0A0A0A;
          display: flex;
          align-items: stretch;
          padding: 48px;
          gap: 32px;
        }
        .white-box {
          width: 44%;
          flex-shrink: 0;
          background-color: #ffffff;
          background-image:
            linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px);
          background-size: 44px 44px;
          border-radius: 16px;
          padding: 32px 36px 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .cap-counter {
          font-size: 11px;
          color: #bbb;
          letter-spacing: 3px;
          font-weight: 700;
          margin-bottom: 20px;
          align-self: flex-start;
        }
        .cap-text-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .cap-text {
          font-size: clamp(34px, 4vw, 60px);
          font-weight: 800;
          font-style: italic;
          line-height: 1.1;
          color: #111;
          letter-spacing: -0.025em;
          text-align: center;
          transition: opacity 0.4s ease, transform 0.4s ease;
          margin: 0;
        }
        .cap-bar-track {
          width: 100%;
          height: 3px;
          background: rgba(0,0,0,0.07);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 24px;
        }
        .cap-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #E87A2F, #D4AF37);
          border-radius: 2px;
          animation: progressBar 3.5s linear forwards;
        }
        .center-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
        }
        .agent-img-wrap {
          width: 220px;
          height: 220px;
          position: relative;
          flex-shrink: 0;
        }
        .cream-card {
          background: #fdf0e0;
          border-radius: 16px;
          padding: 20px 24px;
          max-width: 380px;
          border: 1px solid rgba(232,122,47,0.18);
        }
        .cream-card-text {
          font-size: 15px;
          font-weight: 700;
          color: #111;
          line-height: 1.7;
          margin: 0;
        }
        .cta-btn {
          width: fit-content;
          padding: 14px 36px;
          border-radius: 50px;
          border: none;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: inherit;
        }
        .cta-arrow {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }
        .word-col {
          width: 160px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 12px;
          gap: 10px;
        }
        .word-slot {
          height: 52px;
          display: flex;
          align-items: center;
          transition: opacity 0.45s ease, transform 0.45s ease;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .fw-grid {
          background: #fdf0e0;
          padding: 24px 40px 18px;
          display: flex;
          gap: 12px;
        }
        .fw-card {
          flex: 1;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(232,122,47,0.13);
          border-radius: 14px;
          padding: 18px 16px;
          transition: all 0.25s ease;
          cursor: default;
          animation: fadeInUp 0.45s ease both;
        }
        .fw-letter {
          font-size: 38px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #E87A2F, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fw-title {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          margin-bottom: 5px;
        }
        .fw-desc {
          font-size: 11.5px;
          color: #666;
          line-height: 1.55;
          margin: 0;
        }
        .site-footer {
          background: #0A0A0A;
          padding: 28px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .footer-slogan {
          font-size: clamp(16px, 2vw, 22px);
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .footer-divider {
          width: 36px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #E87A2F, transparent);
        }
        .footer-by {
          font-size: 12px;
          color: #666;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .footer-name {
          font-size: 16px;
          font-weight: 900;
          background: linear-gradient(135deg, #E87A2F, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .footer-year {
          color: #555;
          font-size: 13px;
        }

        /* ── ANIMAÇÕES ── */
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

        /* ══════════════════════════════
           MOBILE  (≤ 768px)
        ══════════════════════════════ */
        @media (max-width: 768px) {
          .top-section {
            flex-direction: column;
            padding: 20px 16px;
            gap: 16px;
            align-items: stretch;
          }
          .white-box {
            width: 100%;
            min-height: 170px;
            padding: 20px 20px 16px;
          }
          .cap-text {
            font-size: clamp(24px, 7vw, 34px);
          }
          .center-col {
            align-items: center;
            gap: 14px;
          }
          .agent-img-wrap {
            width: 140px;
            height: 140px;
          }
          .cream-card {
            max-width: 100%;
            padding: 16px 18px;
          }
          .cream-card-text {
            font-size: 13px;
            line-height: 1.65;
          }
          .cta-btn {
            padding: 13px 30px;
            font-size: 14px;
          }
          .word-col {
            display: none;
          }
          .fw-grid {
            padding: 16px 16px 12px;
            gap: 10px;
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .fw-grid::-webkit-scrollbar {
            display: none;
          }
          .fw-card {
            flex: 0 0 148px;
            min-width: 148px;
            padding: 14px 12px;
          }
          .fw-letter {
            font-size: 30px;
          }
          .fw-title {
            font-size: 11px;
          }
          .fw-desc {
            font-size: 10.5px;
          }
          .site-footer {
            padding: 22px 16px;
            gap: 8px;
          }
          .footer-slogan {
            font-size: 15px;
          }
          .footer-by {
            font-size: 10px;
            letter-spacing: 1px;
          }
        }
      `}</style>
    </>
  );
}

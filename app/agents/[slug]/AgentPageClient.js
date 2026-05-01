'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ORANGE = '#E07B2A'
const PLAN_LIMITS = { free: 20, plus: 60, pro: Infinity }

const AGENT_META = {
  academic: {
    name: 'Mydow Academic', icon: '🎓', accentColor: '#2ecc71',
    desc: 'Especialista acadêmico para universitários e professores',
    tags: 'BNCC · ABNT · Planos de Aula · TCC · Pesquisa Científica',
    suggestions: ['Crie um plano de aula sobre fotossíntese', 'Como formatar uma monografia ABNT?', 'Me ajude a estruturar meu TCC', 'Explique a metodologia científica'],
  },
  nexus: {
    name: 'Mydow Nexus', icon: '🔗', accentColor: '#9b59b6',
    desc: 'Agente de análise profunda e raciocínio avançado',
    tags: 'Análise Profunda · Raciocínio Complexo · Pesquisa · Síntese',
    suggestions: ['Analise profundamente este tema:', 'Sintetize as principais ideias sobre', 'Qual a conexão entre X e Y?', 'Raciocine sobre este problema:'],
  },
  kyw: {
    name: 'Mydow Kyw', icon: '🔑', accentColor: '#3498db',
    desc: 'Agente criativo e multitarefa de alta performance',
    tags: 'Criatividade · Produtividade · Multitarefa · Soluções Rápidas',
    suggestions: ['Me dê 5 ideias criativas para...', 'Como aumentar minha produtividade?', 'Crie um conteúdo criativo sobre', 'Solucione este desafio:'],
  },
  jud: {
    name: 'Mydow Jud', icon: '⚖️', accentColor: '#e74c3c',
    desc: 'Especialista jurídico em leis e legislação brasileira',
    tags: 'Leis · Jurisprudência · Contratos · Direitos · Legislação',
    suggestions: ['Quais são meus direitos como consumidor?', 'Explique o artigo 5º da Constituição', 'Como funciona o processo de divórcio?', 'Analise esta cláusula contratual:'],
  },
  shyw: {
    name: 'Mydow Shyw', icon: '✨', accentColor: '#f39c12',
    desc: 'Estrategista de negócios e consultoria de alto nível',
    tags: 'Estratégia · Negócios · Consultoria · Crescimento · Mercado',
    suggestions: ['Crie uma estratégia de crescimento para', 'Analise o mercado de...', 'Como escalar meu negócio?', 'Que decisão estratégica tomar sobre'],
  },
}

const LANGUAGES = [
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
]

const GAMES_LIST = [
  { id: 'tictactoe', name: 'Jogo da Velha', icon: '⭕', desc: 'Você vs IA — Quem vence?', active: true },
  { id: 'memory', name: 'Jogo da Memória', icon: '🃏', desc: 'Encontre os pares', active: true },
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Clássico jogo da cobrinha', active: true },
  { id: 'blockblast', name: 'Block Blast 3D', icon: '🧱', desc: 'Quebre blocos em 3D', active: true },
  { id: 'chess', name: 'Xadrez', icon: '♟️', desc: 'Desafie a IA no xadrez', active: false },
  { id: 'strategic', name: 'Jogo Estratégico Mydow', icon: '🎯', desc: 'Estratégia exclusiva Mydow', active: false },
]

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
    r.style.setProperty('--t-msg-user-bg', ORANGE)
    r.style.setProperty('--t-msg-ai-bg', '#16213e')
    r.style.setProperty('--t-msg-ai-text', '#e8e8e8')
  } else {
    r.style.setProperty('--t-bg', '#fdf0e0')
    r.style.setProperty('--t-card', '#ffffff')
    r.style.setProperty('--t-card-hover', '#fff8f2')
    r.style.setProperty('--t-text', '#111111')
    r.style.setProperty('--t-muted', '#888888')
    r.style.setProperty('--t-border', '#e8e0d5')
    r.style.setProperty('--t-input', '#ffffff')
    r.style.setProperty('--t-msg-user-bg', ORANGE)
    r.style.setProperty('--t-msg-ai-bg', '#ffffff')
    r.style.setProperty('--t-msg-ai-text', '#111111')
  }
}

// ── TIC TAC TOE ───────────────────────────────────────────────────
function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [playerTurn, setPlayerTurn] = useState(true)
  const [winner, setWinner] = useState(null)
  const [winLine, setWinLine] = useState(null)
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 })
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  function checkWin(b) { for (const line of LINES) { const [a,bl,c]=line; if(b[a]&&b[a]===b[bl]&&b[a]===b[c]) return{winner:b[a],line} } return null }
  function minimax(b,isMax) { const res=checkWin(b); if(res) return res.winner==='O'?10:-10; if(b.every(c=>c)) return 0; const scores=[]; for(let i=0;i<9;i++){if(!b[i]){const nb=[...b];nb[i]=isMax?'O':'X';scores.push(minimax(nb,!isMax))}} return isMax?Math.max(...scores):Math.min(...scores) }
  function bestMove(b) { let best=-Infinity,move=-1; for(let i=0;i<9;i++){if(!b[i]){const nb=[...b];nb[i]='O';const s=minimax(nb,false);if(s>best){best=s;move=i}}} return move }
  function handleClick(i) {
    if(!playerTurn||board[i]||winner) return
    const nb=[...board];nb[i]='X';const res=checkWin(nb);setBoard(nb)
    if(res){setWinner('X');setWinLine(res.line);setScore(s=>({...s,player:s.player+1}));return}
    if(nb.every(c=>c)){setWinner('draw');setScore(s=>({...s,draws:s.draws+1}));return}
    setPlayerTurn(false)
    setTimeout(()=>{const m=bestMove(nb);const ab=[...nb];ab[m]='O';const ar=checkWin(ab);setBoard(ab);if(ar){setWinner('O');setWinLine(ar.line);setScore(s=>({...s,ai:s.ai+1}))}else if(ab.every(c=>c)){setWinner('draw');setScore(s=>({...s,draws:s.draws+1}))}else setPlayerTurn(true)},450)
  }
  function reset(){setBoard(Array(9).fill(null));setWinner(null);setWinLine(null);setPlayerTurn(true)}
  return (
    <div style={{textAlign:'center'}}>
      <div style={{display:'flex',justifyContent:'center',gap:28,marginBottom:20}}>
        {[['Você (X)',score.player,ORANGE],['Empates',score.draws,'var(--t-muted)'],['IA (O)',score.ai,'#e74c3c']].map(([l,v,c])=>(
          <div key={l}><div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:'inline-grid',gridTemplateColumns:'repeat(3,80px)',gap:8,marginBottom:20}}>
        {board.map((cell,i)=>(
          <button key={i} onClick={()=>handleClick(i)} style={{width:80,height:80,fontSize:34,fontWeight:900,border:'3px solid var(--t-border)',borderRadius:14,background:winLine?.includes(i)?(winner==='X'?'#2ecc7130':'#e74c3c30'):'var(--t-card)',cursor:cell||winner?'default':'pointer',color:cell==='X'?ORANGE:'#e74c3c',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 0 rgba(0,0,0,0.18)',transform:'translateY(-2px)'}}>{cell}</button>
        ))}
      </div>
      {winner?(<div><p style={{fontSize:18,fontWeight:700,marginBottom:14,color:winner==='X'?ORANGE:winner==='O'?'#e74c3c':'var(--t-muted)'}}>{winner==='X'?'🎉 Você venceu!':winner==='O'?'🤖 IA venceu!':'🤝 Empate!'}</p><button onClick={reset} style={{padding:'10px 28px',background:ORANGE,color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Jogar de Novo</button></div>)
      :(<p style={{fontSize:13,color:'var(--t-muted)'}}>{playerTurn?'Sua vez — clique (X)':'🤖 IA pensando...'}</p>)}
    </div>
  )
}

// ── MEMORY GAME ───────────────────────────────────────────────────
const MEMORY_EMOJIS=['🌟','🎯','🚀','🌈','🎮','💎','🔥','🌺','🦋','🎸','🍀','🎭']
function MemoryGame() {
  const [cards,setCards]=useState([])
  const [flipped,setFlipped]=useState([])
  const [matched,setMatched]=useState([])
  const [moves,setMoves]=useState(0)
  const [best,setBest]=useState(0)
  const [won,setWon]=useState(false)
  const [blocking,setBlocking]=useState(false)
  function init(){const pairs=[...MEMORY_EMOJIS,...MEMORY_EMOJIS].map((e,i)=>({id:i,emoji:e,key:Math.random()})).sort(()=>Math.random()-0.5);setCards(pairs);setFlipped([]);setMatched([]);setMoves(0);setWon(false)}
  useEffect(()=>{init()},[])
  function flip(id){
    if(blocking||flipped.includes(id)||matched.includes(cards[id]?.emoji)) return
    const nf=[...flipped,id];setFlipped(nf)
    if(nf.length===2){
      setMoves(m=>m+1);setBlocking(true)
      const [a,b]=nf
      if(cards[a]?.emoji===cards[b]?.emoji){
        const nm=[...matched,cards[a].emoji];setMatched(nm);setFlipped([]);setBlocking(false)
        if(nm.length===MEMORY_EMOJIS.length){setWon(true);const t=moves+1;if(!best||t<best)setBest(t)}
      }else{setTimeout(()=>{setFlipped([]);setBlocking(false)},900)}
    }
  }
  return(
    <div style={{textAlign:'center',padding:'0 8px'}}>
      <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:16}}>
        <div><div style={{fontSize:20,fontWeight:800,color:ORANGE}}>{moves}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Jogadas</div></div>
        <div><div style={{fontSize:20,fontWeight:800,color:'#f39c12'}}>👑 {best||'—'}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Recorde</div></div>
        <div><div style={{fontSize:20,fontWeight:800,color:'#2ecc71'}}>{matched.length}/{MEMORY_EMOJIS.length}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Pares</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6,maxWidth:380,margin:'0 auto 16px'}}>
        {cards.map((card,i)=>{
          const isFlipped=flipped.includes(i)||matched.includes(card.emoji)
          return(
            <div key={card.key} onClick={()=>flip(i)} style={{aspectRatio:'1',cursor:'pointer',perspective:500}}>
              <div style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',transform:isFlipped?'rotateY(180deg)':'rotateY(0)',transition:'transform 0.4s'}}>
                <div style={{position:'absolute',inset:0,background:matched.includes(card.emoji)?'#2ecc7133':'var(--t-card)',border:`2px solid ${matched.includes(card.emoji)?'#2ecc71':ORANGE}`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,backfaceVisibility:'hidden',transform:'rotateY(180deg)',boxShadow:'0 3px 0 rgba(0,0,0,0.15)'}}>{card.emoji}</div>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,backfaceVisibility:'hidden',boxShadow:'0 3px 0 rgba(0,0,0,0.2)'}}>❓</div>
              </div>
            </div>
          )
        })}
      </div>
      {won?(<div><p style={{fontSize:18,fontWeight:700,color:'#2ecc71',marginBottom:12}}>🎉 Parabéns! {moves} jogadas!</p><button onClick={init} style={{padding:'10px 28px',background:ORANGE,color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Jogar Novamente</button></div>)
      :(<button onClick={init} style={{padding:'8px 20px',background:'none',border:'1.5px solid var(--t-border)',borderRadius:10,fontSize:13,cursor:'pointer',fontFamily:'inherit',color:'var(--t-text)'}}>↺ Reiniciar</button>)}
    </div>
  )
}

// ── SNAKE GAME ────────────────────────────────────────────────────
function SnakeGame() {
  const COLS=20,ROWS=20,CELL=16
  const [snake,setSnake]=useState([[10,10],[10,9],[10,8]])
  const [food,setFood]=useState([5,5])
  const [running,setRunning]=useState(false)
  const [dead,setDead]=useState(false)
  const [score,setScore]=useState(0)
  const [best,setBest]=useState(0)
  const dirRef=useRef([0,1])
  const snakeRef=useRef([[10,10],[10,9],[10,8]])
  const foodRef=useRef([5,5])
  const scoreRef=useRef(0)
  function rndFood(s){let f;do{f=[Math.floor(Math.random()*ROWS),Math.floor(Math.random()*COLS)]}while(s.some(([r,c])=>r===f[0]&&c===f[1]));return f}
  function reset(){const s=[[10,10],[10,9],[10,8]];snakeRef.current=s;dirRef.current=[0,1];scoreRef.current=0;const f=rndFood(s);foodRef.current=f;setSnake(s);setFood(f);setScore(0);setDead(false);setRunning(false)}
  useEffect(()=>{
    const h=(e)=>{const map={'ArrowUp':[-1,0],'ArrowDown':[1,0],'ArrowLeft':[0,-1],'ArrowRight':[0,1],'w':[-1,0],'s':[1,0],'a':[0,-1],'d':[0,1]};const nd=map[e.key];if(!nd)return;const cd=dirRef.current;if(nd[0]===-cd[0]&&nd[1]===-cd[1])return;dirRef.current=nd;e.preventDefault()}
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)
  },[])
  useEffect(()=>{
    if(!running)return
    const iv=setInterval(()=>{
      const s=snakeRef.current,d=dirRef.current,f=foodRef.current
      const head=[s[0][0]+d[0],s[0][1]+d[1]]
      if(head[0]<0||head[0]>=ROWS||head[1]<0||head[1]>=COLS||s.some(([r,c])=>r===head[0]&&c===head[1])){setDead(true);setRunning(false);if(scoreRef.current>best)setBest(scoreRef.current);return}
      const ate=head[0]===f[0]&&head[1]===f[1]
      const ns=ate?[head,...s]:[head,...s.slice(0,-1)];snakeRef.current=ns
      if(ate){const nf=rndFood(ns);foodRef.current=nf;setFood(nf);scoreRef.current+=10;setScore(sc=>sc+10)}
      setSnake([...ns])
    },130)
    return()=>clearInterval(iv)
  },[running,best])
  const SCOLORS=['#2ecc71','#27ae60']
  return(
    <div style={{textAlign:'center'}}>
      <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:12}}>
        <div><div style={{fontSize:20,fontWeight:800,color:'#2ecc71'}}>{score}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Score</div></div>
        <div><div style={{fontSize:20,fontWeight:800,color:'#f39c12'}}>👑 {best}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Recorde</div></div>
      </div>
      <div style={{display:'inline-block',border:'3px solid var(--t-border)',borderRadius:12,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.2)',background:'#0d1f0d',marginBottom:12}}>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},${CELL}px)`,gridTemplateRows:`repeat(${ROWS},${CELL}px)`}}>
          {Array.from({length:ROWS*COLS}).map((_,idx)=>{
            const r=Math.floor(idx/COLS),c=idx%COLS
            const si=snake.findIndex(([sr,sc])=>sr===r&&sc===c)
            const isFood=food[0]===r&&food[1]===c,isHead=si===0
            return(<div key={idx} style={{width:CELL,height:CELL,background:si>=0?(isHead?ORANGE:SCOLORS[si%2]):isFood?'#e74c3c':'transparent',borderRadius:isHead?5:si>=0?3:0,boxShadow:isHead?`0 0 8px ${ORANGE}`:isFood?'0 0 6px #e74c3c':'none'}}/>)
          })}
        </div>
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:12,flexWrap:'wrap'}}>
        {[['↑',[-1,0]],['↓',[1,0]],['←',[0,-1]],['→',[0,1]]].map(([label,nd])=>(
          <button key={label} onClick={()=>{const cd=dirRef.current;if(nd[0]===-cd[0]&&nd[1]===-cd[1])return;dirRef.current=nd;if(!running&&!dead)setRunning(true)}}
            style={{width:48,height:48,background:'var(--t-card)',border:'2px solid var(--t-border)',borderRadius:12,fontSize:20,cursor:'pointer',boxShadow:'0 4px 0 rgba(0,0,0,0.2)',fontFamily:'inherit'}}>{label}</button>
        ))}
      </div>
      {dead?(<div><p style={{fontSize:16,fontWeight:700,color:'#e74c3c',marginBottom:10}}>😢 Que Pena, Você Perdeu!</p><button onClick={reset} style={{padding:'10px 28px',background:ORANGE,color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Jogar Novamente</button></div>)
      :(<button onClick={()=>setRunning(r=>!r)} style={{padding:'10px 28px',background:running?'#e74c3c':ORANGE,color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{running?'⏸ Pausar':'▶ Iniciar'}</button>)}
      <p style={{fontSize:11,color:'var(--t-muted)',marginTop:8}}>Setas do teclado ou botões acima · Mobile: use os botões</p>
    </div>
  )
}

// ── BLOCK BLAST 3D ────────────────────────────────────────────────
const BB_COLS=8,BB_ROWS=8
const BB_COLORS=['#e74c3c','#2ecc71','#3498db','#f39c12','#9b59b6','#e67e22','#1abc9c']
const BB_PIECES=[[[1,1,1]],[[1],[1],[1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]],[[1,0],[1,0],[1,1]],[[0,1],[0,1],[1,1]],[[1,1,1,1]],[[1]],[[1,1]],[[1],[1]],[[1,1],[1,0]],[[1,0],[1,1]]]
function randPiece(){return{shape:BB_PIECES[Math.floor(Math.random()*BB_PIECES.length)],color:BB_COLORS[Math.floor(Math.random()*BB_COLORS.length)]}}
function BlockBlast(){
  const [grid,setGrid]=useState(()=>Array(BB_ROWS).fill(null).map(()=>Array(BB_COLS).fill(null)))
  const [pieces,setPieces]=useState([randPiece(),randPiece(),randPiece()])
  const [score,setScore]=useState(0)
  const [best,setBest]=useState(0)
  const [exploding,setExploding]=useState(new Set())
  const [dragging,setDragging]=useState(null)
  const [hoverCell,setHoverCell]=useState(null)
  const [lost,setLost]=useState(false)
  const gridRef=useRef(null)
  function canPlace(g,shape,row,col){return shape.every((r,ri)=>r.every((c,ci)=>!c||(row+ri>=0&&row+ri<BB_ROWS&&col+ci>=0&&col+ci<BB_COLS&&!g[row+ri][col+ci])))}
  function place(g,shape,row,col,color){const ng=g.map(r=>[...r]);shape.forEach((r,ri)=>r.forEach((c,ci)=>{if(c)ng[row+ri][col+ci]=color}));return ng}
  function clearLines(g){
    const fullRows=g.map((r,i)=>r.every(c=>c)?i:-1).filter(i=>i>=0)
    const fullCols=Array.from({length:BB_COLS},(_,ci)=>g.every(r=>r[ci])?ci:-1).filter(i=>i>=0)
    const cells=new Set()
    fullRows.forEach(ri=>Array.from({length:BB_COLS},(_,ci)=>cells.add(`${ri}-${ci}`)))
    fullCols.forEach(ci=>Array.from({length:BB_ROWS},(_,ri)=>cells.add(`${ri}-${ci}`)))
    if(!cells.size)return{ng:g,cleared:0,cells}
    const ng=g.map(r=>[...r])
    cells.forEach(k=>{const[r,c]=k.split('-').map(Number);ng[r][c]=null})
    return{ng,cleared:fullRows.length+fullCols.length,cells}
  }
  function checkLost(g,ps){return ps.filter(Boolean).every(({shape})=>{for(let r=0;r<=BB_ROWS-shape.length;r++)for(let c=0;c<=BB_COLS-(shape[0]?.length||1);c++)if(canPlace(g,shape,r,c))return false;return true})}
  function dropPiece(idx,row,col){
    const p=pieces[idx];if(!p)return
    if(!canPlace(grid,p.shape,row,col))return
    let ng=place(grid,p.shape,row,col,p.color)
    const{ng:cg,cleared,cells}=clearLines(ng)
    const pts=cleared*100+p.shape.flat().filter(Boolean).length*10
    const ns=score+pts;if(ns>best)setBest(ns);setScore(ns)
    if(cells.size>0){setExploding(cells);setTimeout(()=>setExploding(new Set()),500)}
    const np=[...pieces];np[idx]=null
    const fp=np.every(x=>!x)?[randPiece(),randPiece(),randPiece()]:np
    setGrid(cg);setPieces(fp)
    if(checkLost(cg,fp))setLost(true)
  }
  function getCell(clientX,clientY){
    if(!gridRef.current)return null
    const rect=gridRef.current.getBoundingClientRect()
    const cs=rect.width/BB_COLS
    const col=Math.floor((clientX-rect.left)/cs),row=Math.floor((clientY-rect.top)/cs)
    if(row<0||row>=BB_ROWS||col<0||col>=BB_COLS)return null
    return{row,col}
  }
  function onDragStart(e,idx){setDragging(idx);e.preventDefault()}
  function onDragMove(e){
    if(dragging===null)return
    const t=e.touches?e.touches[0]:e
    setHoverCell(getCell(t.clientX,t.clientY));e.preventDefault()
  }
  function onDragEnd(e){
    if(dragging===null)return
    const t=e.changedTouches?e.changedTouches[0]:e
    const cell=getCell(t.clientX,t.clientY)
    if(cell)dropPiece(dragging,cell.row,cell.col)
    setDragging(null);setHoverCell(null)
  }
  function reset(){setGrid(Array(BB_ROWS).fill(null).map(()=>Array(BB_COLS).fill(null)));setPieces([randPiece(),randPiece(),randPiece()]);setScore(0);setLost(false);setExploding(new Set())}
  const CS=Math.min(40,Math.floor(320/BB_COLS))
  return(
    <div style={{textAlign:'center',userSelect:'none'}} onMouseMove={onDragMove} onTouchMove={onDragMove} onMouseUp={onDragEnd} onTouchEnd={onDragEnd}>
      <div style={{display:'flex',justifyContent:'center',gap:28,marginBottom:12}}>
        <div><div style={{fontSize:22,fontWeight:800,color:ORANGE}}>{score}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Score</div></div>
        <div><div style={{fontSize:22,fontWeight:800,color:'#f39c12'}}>👑 {best}</div><div style={{fontSize:11,color:'var(--t-muted)'}}>Recorde</div></div>
      </div>
      <div ref={gridRef} style={{display:'inline-grid',gridTemplateColumns:`repeat(${BB_COLS},${CS}px)`,gap:2,background:'var(--t-border)',padding:3,borderRadius:14,border:'3px solid var(--t-border)',boxShadow:'0 8px 32px rgba(0,0,0,0.25)',marginBottom:16}}>
        {grid.map((row,ri)=>row.map((cell,ci)=>{
          const k=`${ri}-${ci}`
          const isExploding=exploding.has(k)
          const isHover=dragging!==null&&hoverCell&&pieces[dragging]&&canPlace(grid,pieces[dragging].shape,hoverCell.row,hoverCell.col)&&pieces[dragging].shape[ri-hoverCell.row]?.[ci-hoverCell.col]
          return(<div key={k} style={{width:CS,height:CS,background:isExploding?'#fff':cell||(isHover?pieces[dragging].color+'99':null)||'var(--t-card)',borderRadius:6,boxShadow:cell?`inset 0 -3px 0 rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.3)`:'none',transition:'all 0.15s',transform:isExploding?'scale(1.3)':'scale(1)',opacity:isExploding?0:1}}/>)
        }))}
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        {pieces.map((p,idx)=>p?(
          <div key={idx} onMouseDown={e=>onDragStart(e,idx)} onTouchStart={e=>onDragStart(e,idx)}
            style={{cursor:'grab',opacity:dragging===idx?0.4:1,padding:8,background:'var(--t-card)',borderRadius:12,border:`2px solid ${p.color}`,boxShadow:`0 4px 0 ${p.color}66`,touchAction:'none',transition:'opacity 0.2s'}}>
            <div style={{display:'grid',gridTemplateColumns:`repeat(${p.shape[0].length},${CS*0.75}px)`,gap:2}}>
              {p.shape.map((row,ri)=>row.map((c,ci)=>(
                <div key={`${ri}-${ci}`} style={{width:CS*0.75,height:CS*0.75,background:c?p.color:'transparent',borderRadius:4,boxShadow:c?`inset 0 -2px 0 rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.3)`:'none'}}/>
              )))}
            </div>
          </div>
        ):<div key={idx} style={{width:56,height:56}}/>)}
      </div>
      {lost?(<div><p style={{fontSize:18,fontWeight:700,color:'#e74c3c',marginBottom:10}}>😢 Que Pena, Você Perdeu!</p><button onClick={reset} style={{padding:'10px 28px',background:ORANGE,color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Jogar Novamente</button></div>)
      :(<button onClick={reset} style={{padding:'8px 20px',background:'none',border:'1.5px solid var(--t-border)',borderRadius:10,fontSize:13,cursor:'pointer',fontFamily:'inherit',color:'var(--t-text)'}}>↺ Reiniciar</button>)}
      <p style={{fontSize:11,color:'var(--t-muted)',marginTop:8}}>Arraste as peças para o tabuleiro · Complete linhas para pontuar</p>
    </div>
  )
}

// ── GAMES UI ──────────────────────────────────────────────────────
function GamesUI() {
  const [activeGame, setActiveGame] = useState(null)
  const games = { tictactoe: <TicTacToe/>, memory: <MemoryGame/>, snake: <SnakeGame/>, blockblast: <BlockBlast/> }
  const titles = { tictactoe:'⭕ Jogo da Velha', memory:'🃏 Jogo da Memória', snake:'🐍 Snake', blockblast:'🧱 Block Blast 3D' }
  if (activeGame && games[activeGame]) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--t-border)',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <button onClick={()=>setActiveGame(null)} style={{background:'none',border:'1.5px solid var(--t-border)',borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontSize:13,color:'var(--t-text)',padding:'6px 14px'}}>← Jogos</button>
          <h2 style={{fontSize:18,fontWeight:800,margin:0,color:'var(--t-text)'}}>{titles[activeGame]}</h2>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',overflowY:'auto'}}>
          {games[activeGame]}
        </div>
      </div>
    )
  }
  return (
    <div style={{flex:1,padding:'20px 16px',overflowY:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))',gap:14,maxWidth:840,margin:'0 auto'}}>
        {GAMES_LIST.map(game=>(
          <button key={game.id} onClick={()=>game.active&&setActiveGame(game.id)}
            style={{padding:20,border:`2px solid ${game.active?ORANGE:'var(--t-border)'}`,borderRadius:18,background:'var(--t-card)',cursor:game.active?'pointer':'default',textAlign:'left',fontFamily:'inherit',opacity:game.active?1:0.55,transition:'all 0.2s'}}
            onMouseEnter={e=>{if(game.active){e.currentTarget.style.background='var(--t-card-hover)';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'}}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--t-card)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
          >
            <div style={{fontSize:38,marginBottom:10}}>{game.icon}</div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--t-text)',marginBottom:6}}>{game.name}</div>
            <div style={{fontSize:12,color:'var(--t-muted)',lineHeight:1.4,marginBottom:10}}>{game.desc}</div>
            {game.active?<span style={{fontSize:12,color:ORANGE,fontWeight:700}}>▶ Jogar agora</span>:<span style={{fontSize:11,color:'var(--t-muted)',fontStyle:'italic'}}>Em breve</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── TRADUTOR UI ───────────────────────────────────────────────────
function TradutorUI({ user }) {
  const [fromLang, setFromLang] = useState('pt')
  const [toLang, setToLang] = useState('en')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTranslate() {
    if (!inputText.trim() || loading) return
    setLoading(true)
    setOutputText('')
    try {
      const res = await fetch('/api/agents/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, fromLang, toLang, userId: user.id }),
      })
      const data = await res.json()
      setOutputText(data.translation || 'Erro na tradução.')
    } catch {
      setOutputText('Erro ao traduzir. Tente novamente.')
    }
    setLoading(false)
  }

  function swap() {
    const fl = fromLang, tl = toLang, it = inputText, ot = outputText
    setFromLang(tl); setToLang(fl); setInputText(ot); setOutputText(it)
  }

  const selectStyle = { flex: 1, minWidth: 140, padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--t-border)', background: 'var(--t-input)', color: 'var(--t-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
  const taStyle = { width: '100%', height: 200, padding: 14, borderRadius: 12, border: '1.5px solid var(--t-border)', background: 'var(--t-input)', color: 'var(--t-text)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }

  return (
    <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <select value={fromLang} onChange={e => setFromLang(e.target.value)} style={selectStyle}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button onClick={swap} title="Inverter idiomas"
            style={{ padding: '9px 16px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>⇄</button>
          <select value={toLang} onChange={e => setToLang(e.target.value)} style={selectStyle}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="tradutor-grid">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Texto original</label>
              <button onClick={() => { setInputText(''); setOutputText('') }} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--t-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Limpar</button>
            </div>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Digite ou cole o texto aqui..." style={taStyle}
              onFocus={e => e.target.style.borderColor = ORANGE}
              onBlur={e => e.target.style.borderColor = 'var(--t-border)'}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleTranslate() }}
            />
            <p style={{ fontSize: 11, color: 'var(--t-muted)', marginTop: 4 }}>{inputText.length} caracteres · Ctrl+Enter para traduzir</p>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Tradução</label>
              {outputText && (
                <button onClick={() => navigator.clipboard.writeText(outputText)} style={{ background: 'none', border: 'none', fontSize: 12, color: ORANGE, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>📋 Copiar</button>
              )}
            </div>
            <div style={{ ...taStyle, background: 'var(--t-card)', resize: 'none', overflowY: 'auto', display: 'flex', alignItems: outputText || loading ? 'flex-start' : 'center', justifyContent: outputText || loading ? 'flex-start' : 'center', whiteSpace: 'pre-wrap' }}>
              {loading
                ? <span style={{ color: 'var(--t-muted)', fontStyle: 'italic' }}>Traduzindo...</span>
                : outputText || <span style={{ color: 'var(--t-muted)', fontStyle: 'italic' }}>A tradução aparecerá aqui</span>
              }
            </div>
            <p style={{ fontSize: 11, color: 'var(--t-muted)', marginTop: 4 }}>{outputText.length} caracteres</p>
          </div>
        </div>

        <button onClick={handleTranslate} disabled={!inputText.trim() || loading}
          style={{ width: '100%', padding: 14, background: !inputText.trim() || loading ? 'var(--t-border)' : ORANGE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: !inputText.trim() || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
          {loading ? 'Traduzindo...' : 'Traduzir'}
        </button>
      </div>
      <style>{`@media(max-width:640px){.tradutor-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

// ── ORGANIZADOR UI ────────────────────────────────────────────────
const SQL_HINT = `CREATE TABLE goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  deadline timestamptz,
  priority text DEFAULT 'media',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);`

function OrganizadorUI({ user }) {
  const supabase = useMemo(() => createClient(), [])
  const [goals, setGoals] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', deadline: '', priority: 'media' })
  const [newTask, setNewTask] = useState('')
  const [copied, setCopied] = useState(false)

  const loadGoals = useCallback(async () => {
    const { data, error } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) { setDbError(true); setLoading(false); return }
    setGoals(data || [])
    setLoading(false)
  }, [supabase, user.id])

  useEffect(() => { loadGoals() }, [loadGoals])

  useEffect(() => {
    if (!selectedGoal) { setTasks([]); return }
    supabase.from('tasks').select('*').eq('goal_id', selectedGoal.id).order('created_at').then(({ data }) => setTasks(data || []))
  }, [selectedGoal, supabase])

  async function createGoal() {
    if (!form.title.trim()) return
    const { data, error } = await supabase.from('goals').insert({ user_id: user.id, title: form.title, description: form.description, deadline: form.deadline || null, priority: form.priority }).select().single()
    if (!error && data) { setGoals(p => [data, ...p]); setForm({ title: '', description: '', deadline: '', priority: 'media' }); setShowForm(false) }
  }

  async function deleteGoal(id) {
    await supabase.from('tasks').delete().eq('goal_id', id)
    await supabase.from('goals').delete().eq('id', id)
    setGoals(p => p.filter(g => g.id !== id))
    if (selectedGoal?.id === id) setSelectedGoal(null)
  }

  async function addTask() {
    if (!newTask.trim() || !selectedGoal) return
    const { data } = await supabase.from('tasks').insert({ goal_id: selectedGoal.id, user_id: user.id, title: newTask, completed: false }).select().single()
    if (data) { setTasks(p => [...p, data]); setNewTask('') }
  }

  async function toggleTask(t) {
    await supabase.from('tasks').update({ completed: !t.completed }).eq('id', t.id)
    setTasks(p => p.map(x => x.id === t.id ? { ...x, completed: !t.completed } : x))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(p => p.filter(t => t.id !== id))
  }

  const pColor = p => p === 'alta' ? '#e74c3c' : p === 'media' ? ORANGE : '#3498db'
  const pLabel = p => p === 'alta' ? 'Alta' : p === 'media' ? 'Média' : 'Baixa'
  const inStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--t-border)', background: 'var(--t-input)', color: 'var(--t-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }

  if (dbError) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', marginBottom: 8 }}>Tabelas não criadas</h3>
        <p style={{ fontSize: 14, color: 'var(--t-muted)', marginBottom: 16, maxWidth: 440 }}>Execute o SQL abaixo no <strong>Supabase → SQL Editor</strong> para ativar o Organizador:</p>
        <pre style={{ background: 'var(--t-card)', border: '1px solid var(--t-border)', borderRadius: 12, padding: 16, fontSize: 11, textAlign: 'left', color: 'var(--t-text)', overflow: 'auto', maxWidth: 600, width: '100%', whiteSpace: 'pre', marginBottom: 16 }}>{SQL_HINT}</pre>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { navigator.clipboard.writeText(SQL_HINT); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            style={{ padding: '10px 20px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied ? '✓ Copiado!' : '📋 Copiar SQL'}
          </button>
          <button onClick={() => { setDbError(false); setLoading(true); loadGoals() }}
            style={{ padding: '10px 20px', background: 'none', border: '1.5px solid var(--t-border)', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--t-text)' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-muted)', fontSize: 14 }}>Carregando metas...</div>
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const pct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Goals panel */}
      <div style={{ width: selectedGoal ? '42%' : '100%', display: 'flex', flexDirection: 'column', borderRight: selectedGoal ? '1px solid var(--t-border)' : 'none', overflow: 'hidden', transition: 'width 0.25s' }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--t-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t-text)' }}>Minhas Metas</div>
            <div style={{ fontSize: 12, color: 'var(--t-muted)' }}>{goals.length} meta{goals.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ padding: '8px 14px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Nova Meta</button>
        </div>

        {showForm && (
          <div style={{ padding: 14, background: 'var(--t-card)', borderBottom: '1px solid var(--t-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da meta *" style={inStyle}
              onFocus={e => e.target.style.borderColor = ORANGE} onBlur={e => e.target.style.borderColor = 'var(--t-border)'}
            />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição (opcional)" rows={2}
              style={{ ...inStyle, resize: 'none' }}
              onFocus={e => e.target.style.borderColor = ORANGE} onBlur={e => e.target.style.borderColor = 'var(--t-border)'}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ ...inStyle, flex: 1 }} />
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ ...inStyle, flex: 1 }}>
                <option value="baixa">Prioridade Baixa</option>
                <option value="media">Prioridade Média</option>
                <option value="alta">Prioridade Alta</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={createGoal} style={{ flex: 1, padding: 10, background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Criar</button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 14px', background: 'none', border: '1.5px solid var(--t-border)', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--t-muted)' }}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--t-muted)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
              <p style={{ fontSize: 14 }}>Nenhuma meta criada ainda. Comece agora!</p>
            </div>
          ) : goals.map(goal => (
            <div key={goal.id} onClick={() => setSelectedGoal(s => s?.id === goal.id ? null : goal)}
              style={{ padding: 14, border: `2px solid ${selectedGoal?.id === goal.id ? ORANGE : 'var(--t-border)'}`, borderRadius: 14, marginBottom: 8, cursor: 'pointer', background: 'var(--t-card)', transition: 'all 0.18s' }}
              onMouseEnter={e => { if (selectedGoal?.id !== goal.id) e.currentTarget.style.borderColor = 'var(--t-muted)' }}
              onMouseLeave={e => { if (selectedGoal?.id !== goal.id) e.currentTarget.style.borderColor = 'var(--t-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-text)', flex: 1, marginRight: 8 }}>{goal.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pColor(goal.priority), background: `${pColor(goal.priority)}20`, padding: '2px 8px', borderRadius: 20 }}>{pLabel(goal.priority)}</span>
                  <button onClick={e => { e.stopPropagation(); deleteGoal(goal.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: 14, padding: 2, lineHeight: 1 }}>✕</button>
                </div>
              </div>
              {goal.description && <p style={{ fontSize: 12, color: 'var(--t-muted)', margin: '0 0 6px', lineHeight: 1.4 }}>{goal.description}</p>}
              {goal.deadline && <p style={{ fontSize: 11, color: 'var(--t-muted)', margin: 0 }}>📅 {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks panel */}
      {selectedGoal && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--t-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t-text)', marginBottom: 2 }}>{selectedGoal.title}</div>
                <div style={{ fontSize: 12, color: 'var(--t-muted)' }}>{completedTasks}/{tasks.length} concluídas · {pct}%</div>
              </div>
              <button onClick={() => setSelectedGoal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-muted)', fontSize: 20, padding: 4 }}>✕</button>
            </div>
            {tasks.length > 0 && (
              <div style={{ height: 6, background: 'var(--t-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#2ecc71' : ORANGE, borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--t-muted)' }}>
                <p style={{ fontSize: 14 }}>Nenhuma tarefa. Adicione a primeira!</p>
              </div>
            ) : tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--t-border)', borderRadius: 10, marginBottom: 6, background: 'var(--t-card)', opacity: t.completed ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t)} style={{ width: 18, height: 18, accentColor: ORANGE, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, color: 'var(--t-text)', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</span>
                <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: 14, padding: 2, flexShrink: 0, opacity: 0.6 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                >✕</button>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--t-border)', display: 'flex', gap: 8 }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Nova tarefa..." style={{ ...inStyle, flex: 1 }}
              onFocus={e => e.target.style.borderColor = ORANGE} onBlur={e => e.target.style.borderColor = 'var(--t-border)'}
            />
            <button onClick={addTask} disabled={!newTask.trim()} style={{ padding: '9px 16px', background: newTask.trim() ? ORANGE : 'var(--t-border)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: newTask.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>+</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── AGENT CHAT UI ─────────────────────────────────────────────────
function AgentChatUI({ slug, meta, user, messageCount, memory }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [msgCount, setMsgCount] = useState(messageCount || { count: 0, reset_at: null })
  const [convId, setConvId] = useState(null)
  const convIdRef = useRef(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const messagesRef = useRef([])

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isStreaming])

  const limit = PLAN_LIMITS[user.plan] || 20
  const isLimited = (msgCount?.count ?? 0) >= limit && user.plan !== 'pro'

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg || isStreaming || isLimited) return
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: msg }
    const assistantId = `a-${Date.now()}`
    const assistantMsg = { id: assistantId, role: 'assistant', content: '', streaming: true }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    const history = [...messagesRef.current, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      // Cria conversa se não existir
      let currentConvId = convIdRef.current
      if (!currentConvId) {
        const title = `${meta.name}: ${msg.length > 40 ? msg.slice(0, 37) + '...' : msg}`
        const res = await fetch('/api/conversation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, title }),
        })
        const newConv = res.ok ? await res.json() : null
        if (newConv?.id) {
          currentConvId = newConv.id
          convIdRef.current = currentConvId
          setConvId(currentConvId)
        }
      }

      // Salva mensagem do usuário
      if (currentConvId) {
        await fetch('/api/message/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: currentConvId, role: 'user', content: msg }),
        }).catch(() => {})
      }

      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userId: user.id,
          userName: user.name,
          memory,
          userPlan: user.plan,
          agentSlug: slug,
          conversationId: currentConvId,
          language: 'pt',
        }),
      })

      if (res.status === 429) {
        const d = await res.json()
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setMsgCount(prev => ({ ...prev, count: PLAN_LIMITS[user.plan] || 20, reset_at: d.reset_at }))
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
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full, streaming: false } : m))
      setMsgCount(prev => {
        if (user.plan === 'pro') return prev
        const lim = PLAN_LIMITS[user.plan] || 20
        const nc = Math.min(lim, prev.count + 1)
        const ra = nc >= lim && !prev.reset_at ? new Date(Date.now() + 7 * 3600000).toISOString() : prev.reset_at
        return { ...prev, count: nc, reset_at: ra }
      })
      await fetch('/api/message-count/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      }).catch(() => {})
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Erro ao conectar. Tente novamente.', streaming: false } : m))
    }
    setIsStreaming(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{meta.icon}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: meta.accentColor, margin: '0 0 8px', textAlign: 'center' }}>{meta.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--t-muted)', margin: '0 0 6px', textAlign: 'center', maxWidth: 400 }}>{meta.desc}</p>
          <p style={{ fontSize: 12, color: 'var(--t-muted)', margin: '0 0 28px', textAlign: 'center', opacity: 0.7 }}>{meta.tags}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 10, width: '100%', maxWidth: 540 }}>
            {meta.suggestions.map(s => (
              <button key={s} onClick={() => !isLimited && handleSend(s)} disabled={isLimited}
                style={{ padding: '12px 14px', background: 'var(--t-card)', border: '1.5px solid var(--t-border)', borderRadius: 12, fontSize: 13, color: 'var(--t-text)', cursor: isLimited ? 'not-allowed' : 'pointer', textAlign: 'left', fontFamily: 'inherit', lineHeight: 1.4, transition: 'all 0.2s', opacity: isLimited ? 0.5 : 1 }}
                onMouseEnter={e => { if (!isLimited) { e.currentTarget.style.borderColor = meta.accentColor; e.currentTarget.style.background = 'var(--t-card-hover)' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.background = 'var(--t-card)' }}
              >{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
          {messages.map((msg, i) => (
            <div key={msg.id || i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14, gap: 10, alignItems: 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${meta.accentColor}22`, border: `2px solid ${meta.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>{meta.icon}</div>
              )}
              <div style={{ maxWidth: '76%', background: msg.role === 'user' ? 'var(--t-msg-user-bg)' : 'var(--t-msg-ai-bg)', color: msg.role === 'user' ? '#fff' : 'var(--t-msg-ai-text)', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {msg.content || (msg.streaming ? <span style={{ opacity: 0.5 }}>...</span> : '')}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${meta.accentColor}22`, border: `2px solid ${meta.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{meta.icon}</div>
              <div style={{ background: 'var(--t-msg-ai-bg)', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--t-muted)' }}>Mydow está executando</span>
                {[0,1,2].map(j => <span key={j} style={{ width: 5, height: 5, background: meta.accentColor, borderRadius: '50%', display: 'inline-block', animation: `dp 1.2s ${j*0.2}s ease-in-out infinite`, marginLeft: 2 }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ padding: '10px 14px 18px', background: 'var(--t-bg)', borderTop: '1px solid var(--t-border)', flexShrink: 0 }}>
        {isLimited && (
          <div style={{ padding: '10px 14px', background: 'var(--t-card)', border: '1.5px solid #e74c3c', borderRadius: 10, marginBottom: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#e74c3c', margin: 0, fontWeight: 600 }}>Limite diário atingido. Faça upgrade para continuar.</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--t-input)', border: '1.5px solid var(--t-border)', borderRadius: 18, padding: '8px 12px' }}>
          <textarea ref={textareaRef} value={input}
            onChange={e => { setInput(e.target.value); const ta = e.target; ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px' }}
            onKeyDown={e => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); handleSend() } }}
            disabled={isLimited || isStreaming} placeholder={isLimited ? 'Limite atingido' : `Fale com ${meta.name}...`} rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 14, fontFamily: 'inherit', color: 'var(--t-text)', background: 'transparent', lineHeight: 1.5, maxHeight: 120 }}
          />
          <button onClick={() => handleSend()} disabled={isLimited || isStreaming || !input.trim()}
            style={{ padding: '7px 14px', background: isLimited || isStreaming || !input.trim() ? 'var(--t-border)' : meta.accentColor, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: isLimited || isStreaming || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'background 0.2s' }}>Enviar</button>
        </div>
      </div>
      <style>{`@keyframes dp{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
const CHAT_AGENTS = ['academic', 'nexus', 'kyw', 'jud', 'shyw']
const NO_SAVE_AGENTS = ['tradutor', 'games', 'organizador']

export default function AgentPageClient({ slug, user, messageCount, memory }) {
  const router = useRouter()
  const isDark = user.preferences?.theme === 'dark'
  const fontSize = user.preferences?.fontSize === 'small' ? '13px' : user.preferences?.fontSize === 'large' ? '17px' : '15px'

  useEffect(() => {
    applyTheme(isDark)
    document.documentElement.style.setProperty('--font-size', fontSize)
  }, [isDark, fontSize])

  const meta = AGENT_META[slug] || { name: 'Mydow Agent', icon: '🤖', accentColor: ORANGE, desc: '', tags: '', suggestions: [] }
  const limit = PLAN_LIMITS[user.plan] || 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--t-bg)', fontFamily: 'Inter, system-ui, sans-serif', fontSize, color: 'var(--t-text)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--t-border)', background: 'var(--t-bg)', flexShrink: 0 }}>
        <button onClick={() => router.push('/chat')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--t-muted)', padding: '4px 8px', borderRadius: 8, fontFamily: 'inherit', lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--t-card)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >←</button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${meta.accentColor}22`, border: `2px solid ${meta.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.name}</div>
          <div style={{ fontSize: 11, color: 'var(--t-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.tags}</div>
        </div>
                <img src="/images/mydow.png" alt="Mydow" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
      </div>

      {CHAT_AGENTS.includes(slug) && <AgentChatUI slug={slug} meta={meta} user={user} messageCount={messageCount} memory={memory} />}
      {slug === 'tradutor' && <TradutorUI user={user} />}
      {slug === 'games' && <GamesUI />}
      {slug === 'organizador' && <OrganizadorUI user={user} />}
    </div>
  )
}

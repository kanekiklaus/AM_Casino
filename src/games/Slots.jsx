// games/Slots.jsx
// ────────────────────────────────────────────────────────────────────────────
// Jogo SLOTS (Máquina de Jogo):
//   1. O jogador define a aposta e carrega "GIRAR".
//   2. 3 rolos giram aleatoriamente e param sequencialmente (suspense).
//   3. O design simula uma máquina física com sombras, reentrâncias e luzes.
// ────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';

// ── Símbolos disponíveis com os seus multiplicadores ──────────────────────────
const SYMBOLS = [
  { emoji: '🍒', label: 'Cereja',    multiplier: 2,   weight: 30 }, // Mais comum
  { emoji: '🍋', label: 'Limão',     multiplier: 3,   weight: 25 },
  { emoji: '🍊', label: 'Laranja',   multiplier: 4,   weight: 20 },
  { emoji: '🔔', label: 'Sino',      multiplier: 6,   weight: 12 },
  { emoji: '⭐', label: 'Estrela',   multiplier: 10,  weight: 8  },
  { emoji: '💎', label: 'Diamante',  multiplier: 20,  weight: 4  }, // Raro
  { emoji: '7️⃣', label: '7',         multiplier: 50,  weight: 1  }, // Jackpot
];

// Gerar array ponderado
const WEIGHTED_POOL = SYMBOLS.flatMap(s => Array(s.weight).fill(s));

function randomSymbol() {
  return WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)];
}

// ── Confetti — partículas de jackpot ─────────────────────────────────────────
const CONFETTI_EMOJIS = ['🎊','💰','⭐','💎','🎉','7️⃣','🍀','🏆'];
function ConfettiParticle({ style, emoji }) {
  return (
    <div className="absolute text-2xl pointer-events-none" style={style}>
      {emoji}
    </div>
  );
}

function JackpotOverlay({ amount, onClose }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    style: {
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 10 + 5}%`,
      animationName: 'confettiFall',
      animationDuration: `${Math.random() * 2 + 1.5}s`,
      animationDelay: `${Math.random() * 1}s`,
      animationTimingFunction: 'linear',
      animationFillMode: 'forwards',
      fontSize: `${Math.random() * 1.5 + 1}rem`,
    },
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
      style={{ animation: 'jackpotOverlayIn 0.4s ease forwards' }}
      onClick={onClose}
    >
      {/* Partículas */}
      {particles.map(p => <ConfettiParticle key={p.id} emoji={p.emoji} style={p.style} />)}

      {/* Conteúdo central */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
        <div className="text-8xl" style={{ animation: 'jackpotBounce 0.6s ease infinite alternate' }}>🏆</div>
        <h1
          className="text-6xl md:text-8xl font-black uppercase tracking-widest text-transparent bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(135deg, #ffd700, #ff8c00, #ffd700)',
            backgroundSize: '200% auto',
            animation: 'goldShimmer 1.5s linear infinite, jackpotBounce 0.5s ease infinite alternate',
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 0 40px rgba(255,215,0,0.8)',
          }}
        >
          JACKPOT!
        </h1>
        <p className="text-3xl md:text-5xl font-black text-green-400 font-mono" style={{ textShadow: '0 0 20px rgba(74,222,128,0.8)' }}>
          +{amount.toLocaleString('pt-PT')} GB
        </p>
        <p className="text-zinc-400 text-sm animate-pulse mt-2">Clique para continuar...</p>
      </div>
    </div>
  );
}

// ── Componente de um rolo individual ─────────────────────────────────────────
function Reel({ resultSymbol, spinning, jackpot }) {
  const [displaySymbol, setDisplaySymbol] = useState('❓');

  useEffect(() => {
    let interval;
    if (spinning) {
      interval = setInterval(() => {
        setDisplaySymbol(randomSymbol().emoji);
      }, 50);
    } else {
      setDisplaySymbol(resultSymbol ? resultSymbol.emoji : '❓');
    }
    return () => clearInterval(interval);
  }, [spinning, resultSymbol]);

  return (
    <div className={`
      relative w-24 h-32 bg-gradient-to-b from-zinc-300 via-white to-zinc-300 border-y-4 border-zinc-950
      flex flex-col items-center justify-center text-6xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden rounded
      ${jackpot ? 'border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)]' : ''}
    `}
      style={jackpot ? { animation: 'jackpotBorder 0.4s ease infinite alternate' } : {}}
    >
      <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
      <div className={`
        relative z-0 transition-transform duration-75 
        ${spinning ? 'blur-[1.5px] scale-105 translate-y-1 opacity-90' : 'animate-fadeSlideUp scale-100'}
        ${jackpot ? 'scale-110' : ''}
      `}>
        {displaySymbol}
      </div>
      <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}

// ── Tabela de Pagamentos ─────────────────────────────────────────────────────
function PayTable() {
  const jackpotSymbol = SYMBOLS.find(s => s.label === '7');

  return (
    <div className="glass-card p-4 w-full max-w-sm overflow-hidden">
      <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold text-center">
        Tabela de Pagamentos
      </h3>
      <div className="space-y-1.5 px-2">

        {/* ── Linha especial JACKPOT (triplo 7) — destaque absoluto ── */}
        <div
          className="relative flex items-center justify-between text-sm px-3 py-2.5 rounded-lg border border-yellow-500/60 bg-yellow-500/10 overflow-hidden"
          style={{ boxShadow: '0 0 14px rgba(250,204,21,0.25)' }}
        >
          {/* brilho de fundo animado */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-400/10 to-yellow-500/0 pointer-events-none"
            style={{ animation: 'goldShimmer 2s linear infinite', backgroundSize: '200% auto' }}
          />
          <span className="relative tracking-widest text-base">
            {jackpotSymbol.emoji} {jackpotSymbol.emoji} {jackpotSymbol.emoji}
          </span>
          <div className="relative flex items-center gap-2">
            <span
              className="text-[10px] font-black uppercase tracking-widest text-yellow-950 bg-yellow-400 px-1.5 py-0.5 rounded"
              style={{ animation: 'jackpotBounce 0.7s ease infinite alternate' }}
            >
              JACKPOT
            </span>
            <span className="text-yellow-300 font-black font-mono text-base">{jackpotSymbol.multiplier}x</span>
          </div>
        </div>

        {/* Restantes símbolos (excluindo o 7) */}
        {[...SYMBOLS].reverse().filter(s => s.label !== '7').map(s => (
          <div key={s.emoji} className="flex items-center justify-between text-sm px-2">
            <span className="tracking-widest">{s.emoji} {s.emoji} {s.emoji}</span>
            <span className="text-yellow-400 font-bold font-mono bg-zinc-900/50 px-2 rounded">{s.multiplier}x</span>
          </div>
        ))}

        {/* Regras especiais */}
        <div className="border-t border-zinc-800/50 pt-2 mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-sm px-2">
            <span>7️⃣ 7️⃣ (dois 7s)</span>
            <span className="text-orange-400 font-bold font-mono bg-zinc-900/50 px-2 rounded">10x</span>
          </div>
          <div className="flex items-center justify-between text-sm px-2">
            <span>🍒 (qualquer posição)</span>
            <span className="text-green-400 font-bold font-mono bg-zinc-900/50 px-2 rounded">1.5x</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal SLOTS ────────────────────────────────────────────────
export default function Slots() {
  const { balance, updateBalance } = useUser();
  const [bet, setBet] = useState(50);
  
  // Resultados finais dos rolos
  const [reels, setReels] = useState([null, null, null]);
  
  // Estado individual de rotação de CADA rolo (para o suspense escalonado)
  const [spinStates, setSpinStates] = useState([false, false, false]);
  
  const [result, setResult] = useState(null);
  const [jackpot, setJackpot] = useState(false);     // overlay de jackpot ativo?
  const [jackpotAmount, setJackpotAmount] = useState(0);

  // Se algum rolo estiver a girar, a máquina como um todo está bloqueada
  const isAnySpinning = spinStates.some(s => s);

  // Cálculo da vitória idêntico ao original
  const calcWin = (r0, r1, r2) => {
    if (r0.emoji === r1.emoji && r1.emoji === r2.emoji) {
      return bet * r0.multiplier;
    }
    const sevens = [r0, r1, r2].filter(r => r.label === '7').length;
    if (sevens === 2) return bet * 10;
    
    const cherries = [r0, r1, r2].filter(r => r.label === 'Cereja').length;
    if (cherries >= 1) return Math.floor(bet * 1.5);

    return 0;
  };

  // ── Ação: GIRAR! ──────────────────────────────────────────────────────────
  const spin = () => {
    if (isAnySpinning || bet > balance || bet <= 0) return;

    updateBalance(-bet, 'Slots');
    setResult(null);
    
    // Liga todos os rolos simultaneamente
    setSpinStates([true, true, true]);

    // O RNG define o destino agora (ninguém vê isto)
    const newReels = [randomSymbol(), randomSymbol(), randomSymbol()];
    setReels(newReels);

    // O Rolo 1 para aos 1000ms
    setTimeout(() => {
      setSpinStates(prev => [false, prev[1], prev[2]]);
    }, 1000);

    // O Rolo 2 para aos 1600ms (Aumenta ritmo)
    setTimeout(() => {
      setSpinStates(prev => [prev[0], false, prev[2]]);
    }, 1600);

    // O Rolo 3 para aos 2400ms (Suspense Máximo)
    setTimeout(() => {
      setSpinStates([false, false, false]);
      
      const winAmount = calcWin(...newReels);
      const isJackpotResult = newReels.every(r => r.label === '7');

      if (winAmount > 0) {
        updateBalance(winAmount, 'Slots');
        if (isJackpotResult) {
          // Acionar a sequência de jackpot!
          setJackpotAmount(winAmount);
          setTimeout(() => setJackpot(true), 300); // ligeiro atraso para o rolo fixar
          setResult({ type: 'win', amount: winAmount, message: '🎊 JACKPOT!!! 🎊' });
        } else {
          setResult({ type: 'win', amount: winAmount, message: '🎉 ESPECTÁCULO!' });
        }
      } else {
        setResult({ type: 'loss', message: '😔 Mais Sorte na Próxima...', amount: 0 });
      }
    }, 2400);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-10 animate-fadeSlideUp">

      {/* Overlay de Jackpot — aparece por cima de tudo */}
      {jackpot && (
        <JackpotOverlay
          amount={jackpotAmount}
          onClose={() => setJackpot(false)}
        />
      )}

      <div className="text-center mb-2">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
            style={{ fontFamily: "'Outfit', sans-serif" }}>
          SLOTS
        </h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Slots Clássica • TORN Casino</p>
      </div>

      {/* ── DESIGN DA MÁQUINA DE SLOTS FÍSICA ────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 border-[6px] border-zinc-700/80 rounded-[2rem] p-4 md:p-6 pb-6 md:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-lg mx-auto flex flex-col items-center">
        
        {/* Topo da Máquina - Detalhes em vidro */}
        <div className="w-[80%] h-8 bg-zinc-950 border border-zinc-800 rounded-xl mb-6 shadow-inner flex items-center justify-around px-4">
          {/* Leds decorativos */}
          {[...Array(5)].map((_, i) => (
             <div key={i} className={`w-3 h-3 rounded-full ${isAnySpinning ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]' : 'bg-red-900'}`}></div>
          ))}
        </div>

        {/* Ecrã de Rolos (Reel Window) */}
        <div className="bg-zinc-950 border-4 border-zinc-800 rounded-xl p-4 shadow-[inset_0_0_40px_rgba(0,0,0,1)] relative w-full mb-6">
          
          {/* Fio de "Linha de Pagamento" central */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-20 pointer-events-none transform -translate-y-1/2"></div>
          
          <div className="flex gap-4 justify-center relative z-10">
            {reels.map((symbol, i) => (
              <Reel key={i} resultSymbol={symbol} spinning={spinStates[i]} jackpot={jackpot} />
            ))}
          </div>
        </div>

        {/* Display de Resultado na Máquina */}
        <div className="w-full h-16 bg-zinc-950 border-2 border-zinc-800 rounded-lg shadow-inner flex flex-col justify-center items-center overflow-hidden relative">
          {!result && !isAnySpinning && (
            <p className="text-green-500 font-mono font-bold animate-pulse text-sm">INSIRA APOSTA E GIRE</p>
          )}
          {isAnySpinning && (
            <p className="text-yellow-500 font-mono font-bold animate-pulseSoft text-sm">BOA SORTE...</p>
          )}
          {result && !isAnySpinning && (
            <div className={`w-full h-full flex items-center justify-center font-bold px-4 ${result.type === 'win' ? 'bg-green-600/20 text-green-400' : 'text-zinc-500'}`}>
              <span className="text-sm md:text-base mr-3">{result.message}</span>
              {result.amount > 0 && <span className="font-mono text-xl md:text-2xl glow-text-green">{result.amount.toLocaleString('pt-PT')}GB</span>}
            </div>
          )}
        </div>
      </div>
      {/* ── FIM DA MÁQUINA ──────────────────────────────────────────────── */}

      {/* ── Painel de Comando (Abaixo da Máquina) ────────────────────────── */}
      {/* Painel assenta também sobre a mesa feltro */}
      <div className="relative z-10 w-full max-w-lg bg-zinc-900/95 border border-zinc-700/80 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row gap-4 md:gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
        
        {/* Esquerda: Ajustes de aposta */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest w-20">Aposta</label>
            <input
              type="number" min={10} max={balance} step={10}
              value={bet}
              onChange={e => setBet(Number(e.target.value))}
              disabled={isAnySpinning}
              className="flex-1 h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-white font-mono focus:outline-none focus:border-yellow-500 disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2">
            {[25, 50, 100, 500].map(v => (
              <button
                key={v}
                onClick={() => setBet(v)}
                disabled={v > balance || isAnySpinning}
                className="flex-1 text-xs py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded border border-zinc-700 font-bold transition cursor-pointer active:scale-95"
              >
                {v}GB
              </button>
            ))}
          </div>
        </div>

        {/* Direita: Botão Gigante de Girar */}
        <button
          onClick={spin}
          disabled={isAnySpinning || bet > balance || bet <= 0}
          className={`
            w-full md:w-32 h-20 md:h-auto font-black text-xl md:text-2xl rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer uppercase tracking-wider
            ${isAnySpinning
              ? 'bg-zinc-800 text-zinc-600 shadow-none cursor-not-allowed border border-zinc-700'
              : 'bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black border-b-4 border-yellow-700 hover:-translate-y-1 glow-green'
            }
          `}
        >
          {isAnySpinning ? '⏳' : 'Girar'}
        </button>
      </div>

      {/* Tabela de pagamentos */}
      <PayTable />
    </div>
  );
}

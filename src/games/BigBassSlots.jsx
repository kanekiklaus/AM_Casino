// games/BigBassSlots.jsx
// ──────────────────────────────────────────────────────────────────────────────
// Slot BIG BASS BONANZA — 5 rolos com tema de pesca
//   • Símbolos: Peixe Azul (mais comum) → Tropicana → Polvo → Chapéu → Diamante → Pescador (wild)
//   • O Pescador 🎣 é wild (substitui tudo) + 3+ Pescadores ativam FREE SPINS
//   • Ronda de bónus: 10 free spins, cada Pescador adicional +multiplier
//   • Visual: fundo aquático animado, bolhas, ondas
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';

// ── Símbolos e pesos ─────────────────────────────────────────────────────────
const SYMBOLS = [
  { emoji: '🐟', label: 'Peixe',    multiplier: 2,   weight: 35, color: '#3b82f6' },
  { emoji: '🦑', label: 'Polvo',    multiplier: 3,   weight: 25, color: '#8b5cf6' },
  { emoji: '🪣', label: 'Balde',    multiplier: 5,   weight: 18, color: '#6b7280' },
  { emoji: '🎩', label: 'Chapéu',   multiplier: 8,   weight: 12, color: '#d97706' },
  { emoji: '💎', label: 'Diamante', multiplier: 15,  weight: 6,  color: '#06b6d4' },
  { emoji: '🎣', label: 'Pescador', multiplier: 25,  weight: 4,  color: '#22c55e', isWild: true },
];

// Gerar pool ponderado
const POOL = SYMBOLS.flatMap(s => Array(s.weight).fill(s));

function rnd() { return POOL[Math.floor(Math.random() * POOL.length)]; }

// Grelha: 5 rolos × 3 linhas
function makeGrid() {
  return Array.from({ length: 5 }, () => [rnd(), rnd(), rnd()]);
}

// ── Paylines: 5 linhas horizontais + 2 diagonais ─────────────────────────────
// Uma payline = array de [rolo, linha] para cada posição
const PAYLINES = [
  // Horizontais
  [[0,0],[1,0],[2,0],[3,0],[4,0]], // topo
  [[0,1],[1,1],[2,1],[3,1],[4,1]], // meio (principal)
  [[0,2],[1,2],[2,2],[3,2],[4,2]], // baixo
  // Diagonais
  [[0,0],[1,1],[2,2],[3,1],[4,0]], // V
  [[0,2],[1,1],[2,0],[3,1],[4,2]], // ^
];

// Calcular vitórias numa grelha
function calcWin(grid, bet) {
  let total = 0;
  let fishermanCount = 0;

  // Contar Pescadores em toda a grelha (para ativar bónus)
  for (const col of grid)
    for (const cell of col)
      if (cell.label === 'Pescador') fishermanCount++;

  // Avaliar cada payline
  for (const line of PAYLINES) {
    const cells = line.map(([c, r]) => grid[c][r]);
    // Symbols na payline (Pescador é wild = qualquer símbolo)
    const nonWilds = cells.filter(s => s.label !== 'Pescador');
    const firstReal = nonWilds[0];
    if (!firstReal) {
      // Linha toda de Pescadores!
      total += bet * 50;
      continue;
    }
    // Contar quantas desta payline são o mesmo símbolo ou wild
    let count = 0;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].label === firstReal.label || cells[i].label === 'Pescador') count++;
      else break; // deve ser consecutivo da esquerda
    }
    if (count >= 3) {
      total += bet * firstReal.multiplier * (count - 2);
    }
  }

  return { winAmount: total, fishermanCount };
}

// ── Componente Rolo Individual ────────────────────────────────────────────────
function Reel({ col, spinning, bonus }) {
  const [display, setDisplay] = useState([rnd(), rnd(), rnd()]);

  useEffect(() => {
    if (!spinning) {
      setDisplay(col);
      return;
    }
    const id = setInterval(() => setDisplay([rnd(), rnd(), rnd()]), 70);
    return () => clearInterval(id);
  }, [spinning, col]);

  return (
    <div className={`
      flex flex-col gap-1 bg-gradient-to-b from-blue-950 to-blue-900
      border-2 rounded-xl p-1 shadow-inner overflow-hidden
      ${bonus ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-blue-800/50'}
    `}>
      {display.map((sym, row) => (
        <div
          key={row}
          className={`
            w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl rounded-lg
            ${spinning ? 'blur-[2px] scale-90 opacity-80' : 'scale-100 opacity-100'}
            transition-all duration-75
            ${sym.label === 'Pescador' ? 'bg-green-900/40 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-blue-950/50'}
          `}
          style={!spinning && sym.label === 'Pescador' ? { filter: 'drop-shadow(0 0 6px #22c55e)' } : {}}
        >
          {sym.emoji}
        </div>
      ))}
    </div>
  );
}

// ── Overlay de Bónus Free Spins ───────────────────────────────────────────────
function BonusOverlay({ spinsLeft, multiplier, totalWin, onClose }) {
  const finished = spinsLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
      {/* Bolhas animadas */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-400/30 bg-cyan-400/5"
          style={{
            width:  `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            left:   `${Math.random() * 100}%`,
            bottom: `${Math.random() * -20}%`,
            animation: `bubbleRise ${Math.random() * 4 + 3}s ease-in infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <div className="relative z-10 text-center space-y-4 px-8">
        <div className="text-6xl animate-bounce">🎣</div>
        {!finished ? (
          <>
            <h2 className="text-4xl md:text-5xl font-black text-cyan-300" style={{ fontFamily:"'Outfit',sans-serif" }}>
              FREE SPINS
            </h2>
            <div className="flex gap-6 justify-center text-center">
              <div>
                <p className="text-3xl font-black text-white font-mono">{spinsLeft}</p>
                <p className="text-xs text-cyan-400 uppercase tracking-widest">restantes</p>
              </div>
              <div className="w-px bg-cyan-800" />
              <div>
                <p className="text-3xl font-black text-green-400 font-mono">×{multiplier}</p>
                <p className="text-xs text-cyan-400 uppercase tracking-widest">multiplicador</p>
              </div>
              <div className="w-px bg-cyan-800" />
              <div>
                <p className="text-3xl font-black text-yellow-400 font-mono">{totalWin.toLocaleString('pt-PT')} GB</p>
                <p className="text-xs text-cyan-400 uppercase tracking-widest">Capacidade Ganhos</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-5xl font-black text-yellow-300" style={{ fontFamily:"'Outfit',sans-serif" }}>
              🏆 BÓNUS!
            </h2>
            <p className="text-4xl font-black font-mono text-green-400">
              +{totalWin.toLocaleString('pt-PT')} GB
            </p>
            <p className="text-zinc-400 text-sm">Multiplicador final: ×{multiplier}</p>
            <button
              onClick={onClose}
              className="mt-4 px-10 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg rounded-xl transition-all cursor-pointer active:scale-95"
            >
              Receber Prémio!
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function BigBassSlots() {
  const { balance, updateBalance } = useUser();

  const [bet, setBet]           = useState(50);
  const [grid, setGrid]         = useState(() => makeGrid());

  // Estado de spinning por rolo (array de 5 booleans)
  const [spinStates, setSpinStates] = useState([false,false,false,false,false]);
  const isSpinning = spinStates.some(Boolean);

  const [result, setResult]     = useState(null);

  // ── Estado do bónus ────────────────────────────────────────────────────────
  const [bonusActive, setBonusActive]   = useState(false);
  const [bonusSpins, setBonusSpins]     = useState(0);   // spins restantes
  const [bonusMult, setBonusMult]       = useState(1);   // multiplicador
  const [bonusWin, setBonusWin]         = useState(0);   // ganho acumulado do bónus
  const [showBonusOverlay, setShowBonusOverlay] = useState(false);
  const [isAutoSpin, setIsAutoSpin]     = useState(false);

  // ── Executar spin ─────────────────────────────────────────────────────────
  const doSpin = useCallback((isFreeSpins = false) => {
    if (isSpinning) return;
    if (!isFreeSpins && (bet > balance || bet <= 0)) return;

    if (!isFreeSpins) updateBalance(-bet, 'Big Bass');
    setResult(null);

    // Gerar grelha final
    const newGrid = makeGrid();
    setGrid(newGrid);

    // Ativar todos os rolos
    setSpinStates([true, true, true, true, true]);

    // Parar sequencialmente: 800, 1100, 1400, 1700, 2100ms
    const stops = [800, 1100, 1400, 1700, 2100];
    stops.forEach((delay, i) => {
      setTimeout(() => {
        setSpinStates(prev => {
          const next = [...prev];
          next[i] = false;
          return next;
        });
      }, delay);
    });

    // Calcular resultado ao fim
    setTimeout(() => {
      setSpinStates([false,false,false,false,false]);
      const { winAmount, fishermanCount } = calcWin(newGrid, bet);

      if (isFreeSpins) {
        // Durante free spins, adicionar ao acumulado
        const mult = bonusMult + (fishermanCount > 0 ? fishermanCount : 0);
        setBonusMult(mult);
        const bonusEarned = winAmount * mult;
        setBonusWin(prev => prev + bonusEarned);
        setBonusSpins(prev => {
          const remaining = prev - 1;
          if (remaining <= 0) {
            // Bónus terminou
            setTimeout(() => {
              if (bonusEarned + bonusWin > 0) {
                updateBalance(bonusEarned + bonusWin, 'Big Bass Bónus');
              }
              setBonusActive(false);
              setShowBonusOverlay(false);
              setBonusMult(1);
              setBonusWin(0);
            }, 1500);
          }
          return remaining;
        });
      } else {
        // Spin normal
        if (fishermanCount >= 3) {
          // Ativar bónus!
          setBonusActive(true);
          setBonusSpins(10);
          setBonusMult(1);
          setBonusWin(0);
          setShowBonusOverlay(true);
          setResult({ type: 'bonus', message: '🎣 FREE SPINS ATIVADO!', amount: 0 });
        } else if (winAmount > 0) {
          updateBalance(winAmount, 'Big Bass');
          setResult({ type: 'win', message: '🐟 BOA PESCARIA!', amount: winAmount });
        } else {
          setResult({ type: 'loss', message: '🌊 Sem sorte...', amount: 0 });
        }
      }
    }, 2200);
  }, [isSpinning, bet, balance, updateBalance, bonusMult, bonusWin]);

  // Auto-spin durante o bónus
  useEffect(() => {
    if (bonusActive && bonusSpins > 0 && !isSpinning) {
      const t = setTimeout(() => doSpin(true), 1200);
      return () => clearTimeout(t);
    }
  }, [bonusActive, bonusSpins, isSpinning, doSpin]);

  // Auto-spin no jogo normal
  useEffect(() => {
    if (isAutoSpin && !isSpinning && !bonusActive && balance >= bet) {
      const t = setTimeout(() => doSpin(false), 1200);
      return () => clearTimeout(t);
    }
    if (isAutoSpin && balance < bet) setIsAutoSpin(false);
  }, [isAutoSpin, isSpinning, bonusActive, balance, bet, doSpin]);

  // ── Tabela de pagamentos ──────────────────────────────────────────────────
  function PayTable() {
    return (
      <div className="w-full max-w-sm bg-blue-950/60 border border-blue-800/40 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="text-[10px] uppercase tracking-widest text-blue-400 mb-3 font-bold text-center">
          Tabela de Pagamentos
        </h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between px-2">
            <span className="text-green-400">🎣🎣🎣🎣🎣</span>
            <span className="text-yellow-300 font-black">50x 🏆</span>
          </div>
          <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
            <span>3+ 🎣 em qualquer posição</span>
            <span className="text-cyan-400 font-bold">FREE SPINS</span>
          </div>
          <div className="border-t border-blue-800/40 my-2" />
          {[...SYMBOLS].filter(s => !s.isWild).reverse().map(s => (
            <div key={s.emoji} className="flex items-center justify-between px-2">
              <span>{s.emoji} {s.emoji} {s.emoji}</span>
              <span className="text-yellow-400 font-bold">{s.multiplier}x</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    // Fundo aquático
    <div
      className="relative flex flex-col items-center gap-5 p-4 md:p-8 animate-fadeSlideUp min-h-full overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #083344 0%, #0c1a2e 50%, #050d18 100%)' }}
    >
      {/* Ondas de fundo decorativas */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(14,165,233,0.05) 40px, rgba(14,165,233,0.05) 41px)`,
           }} />
      {/* Vinheta */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Bolhas decorativas de fundo */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-400/20 pointer-events-none"
          style={{
            width: `${Math.random() * 30 + 10}px`,
            height: `${Math.random() * 30 + 10}px`,
            left: `${Math.random() * 95}%`,
            bottom: `${Math.random() * 80}%`,
            opacity: 0.3,
          }}
        />
      ))}

      {/* Overlay de bónus */}
      {showBonusOverlay && (
        <BonusOverlay
          spinsLeft={bonusSpins}
          multiplier={bonusMult}
          totalWin={bonusWin}
          onClose={() => setShowBonusOverlay(false)}
        />
      )}

      {/* Título */}
      <div className="relative z-10 text-center">
        <h2
          className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-500 uppercase tracking-wider drop-shadow-[0_0_20px_rgba(14,165,233,0.5)]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          BIG BASS 🎣
        </h2>
        <p className="text-cyan-600/70 text-xs uppercase tracking-widest mt-1">
          {bonusActive ? `🎣 FREE SPINS — ${bonusSpins} restantes • ×${bonusMult}` : 'Big Bass Bonanza • TORN Casino'}
        </p>
      </div>

      {/* Grelha de 5 rolos × 3 linhas */}
      <div className="relative z-10 bg-blue-950/80 border-2 border-blue-700/50 rounded-2xl p-4 shadow-[0_0_40px_rgba(14,165,233,0.15)] w-full max-w-xl">
        {/* Linha de pagamento central */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.4)] pointer-events-none -translate-y-1/2 z-20" />

        <div className="flex gap-2 justify-center">
          {grid.map((col, i) => (
            <Reel key={i} col={col} spinning={spinStates[i]} bonus={bonusActive} />
          ))}
        </div>

        {/* Display resultado */}
        <div className="mt-3 h-10 flex items-center justify-center">
          {isSpinning && (
            <p className="text-cyan-400 font-mono font-bold animate-pulse text-sm">
              {bonusActive ? '🎣 FREE SPIN...' : '🌊 A pescar...'}
            </p>
          )}
          {result && !isSpinning && (
            <div className={`flex items-center gap-3 font-bold text-sm ${
              result.type === 'win' ? 'text-green-400' :
              result.type === 'bonus' ? 'text-cyan-300' : 'text-zinc-500'
            }`}>
              <span>{result.message}</span>
              {result.amount > 0 && (
                <span className="font-mono text-xl text-green-400 glow-text-green">
                  +{result.amount.toLocaleString('pt-PT')} GB
                </span>
              )}
            </div>
          )}
          {!result && !isSpinning && (
            <p className="text-blue-400/60 font-mono text-xs animate-pulse">
              INSIRA APOSTA E LANCE
            </p>
          )}
        </div>
      </div>

      {/* Painel de controlo */}
      {!bonusActive && (
        <div className="relative z-10 w-full max-w-xl bg-blue-950/60 border border-blue-800/40 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row gap-4 backdrop-blur-sm shadow-xl">
          {/* Aposta */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-3">
              <label className="text-blue-400 text-xs font-bold uppercase tracking-widest w-16">Dados (GB)</label>
              <input
                type="number" min={10} max={balance} step={10}
                value={bet}
                onChange={e => setBet(Number(e.target.value))}
                disabled={isSpinning}
                className="flex-1 h-10 bg-blue-950 border border-blue-700/50 rounded-lg px-3 text-white font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>
            <div className="flex gap-2">
              {[25, 50, 100, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  disabled={v > balance || isSpinning}
                  className="flex-1 text-xs py-2 bg-blue-900/60 hover:bg-blue-800 disabled:opacity-30 rounded-lg border border-blue-700/30 text-blue-200 font-bold transition cursor-pointer active:scale-95"
                >
                  {v} GB
                </button>
              ))}
            </div>
          </div>

          {/* Botão de lançar e Auto-Spin */}
          <div className="flex gap-2 w-full md:w-auto mt-auto">
            <button
              onClick={() => setIsAutoSpin(!isAutoSpin)}
              disabled={bonusActive}
              className={`
                px-4 py-2 text-[10px] font-black rounded-lg border transition-all cursor-pointer uppercase tracking-tighter
                ${isAutoSpin 
                  ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                  : 'bg-blue-900/30 border-blue-700/50 text-blue-400 hover:bg-blue-800/40'
                }
              `}
            >
              {isAutoSpin ? 'Parar AUTO' : 'Auto'}
            </button>
            <button
              onClick={() => { setIsAutoSpin(false); doSpin(false); }}
              disabled={isSpinning || bet > balance || bet <= 0}
              className={`
                flex-1 md:w-36 h-16 md:h-20 font-black text-xl rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer
                ${isSpinning
                  ? 'bg-blue-900 text-blue-600 cursor-not-allowed border border-blue-800'
                  : 'bg-gradient-to-b from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-b-4 border-blue-800 hover:-translate-y-1 shadow-[0_0_20px_rgba(14,165,233,0.4)]'
                }
              `}
            >
              {isSpinning ? '⏳' : '🎣'}
            </button>
          </div>
        </div>
      )}

      {/* Tabela de pagamentos */}
      <div className="relative z-10">
        <PayTable />
      </div>
    </div>
  );
}

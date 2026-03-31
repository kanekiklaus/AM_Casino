// games/RussianRoulette.jsx
// Roleta Russa: 6 câmaras, 1 bala.
// Cena animada: dois jogadores sentados frente a frente, revólver passa de mão em mão.

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const CHAMBERS      = 6;
const INITIAL_BET   = 100;
const PAYOUT_MULTI  = [0, 2, 3, 5, 8, 14]; // multiplicador por sobrevivência (ronda 1-5)

// ── Revólver SVG inline ────────────────────────────────────────────────────────
function Revolver({ spinning, fired, side }) {
  // side: 'left' (jogador esquerdo segura) | 'right' (jogador direito segura)
  const flip = side === 'right' ? 'scale(-1,1)' : 'scale(1,1)';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 140, height: 80 }}
    >
      <svg
        viewBox="0 0 200 110"
        width="140" height="80"
        style={{
          transform: flip,
          filter: fired
            ? 'drop-shadow(0 0 16px rgba(255,80,0,1))'
            : spinning
            ? 'drop-shadow(0 0 10px rgba(100,200,255,0.7))'
            : 'drop-shadow(0 0 6px rgba(0,0,0,0.8))',
          animation: spinning ? 'revolverSpin 0.6s linear infinite' : 'none',
          transformOrigin: 'center',
        }}
      >
        {/* Cano */}
        <rect x="110" y="44" width="80" height="16" rx="5" fill="#555" stroke="#333" strokeWidth="2"/>
        <rect x="170" y="42" width="18" height="20" rx="3" fill="#444"/>
        {/* Tambor */}
        <circle cx="100" cy="52" r="28" fill="#666" stroke="#333" strokeWidth="3"/>
        <circle cx="100" cy="52" r="22" fill="#555" stroke="#444" strokeWidth="1"/>
        {/* Câmaras do tambor */}
        {Array.from({ length: CHAMBERS }).map((_, i) => {
          const a  = (i / CHAMBERS) * Math.PI * 2;
          const cx = 100 + 13 * Math.cos(a);
          const cy = 52  + 13 * Math.sin(a);
          return <circle key={i} cx={cx} cy={cy} r="4.5" fill={i === 0 ? '#c0392b' : '#333'} stroke="#222" strokeWidth="1"/>;
        })}
        {/* Gatilho */}
        <polygon points="90,68 95,85 100,68" fill="#444" stroke="#333" strokeWidth="1"/>
        {/* Coronha */}
        <path d="M70 60 Q60 70 55 90 Q58 95 68 93 Q78 90 82 75 L88 60 Z" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="2"/>
        <path d="M60 75 Q62 80 66 82" stroke="#a07850" strokeWidth="1.5" fill="none"/>
        {/* Chama ao disparar */}
        {fired && (
          <g>
            <polygon points="185,50 205,52 185,54" fill="#ff8800" opacity="0.9"/>
            <polygon points="185,46 210,52 185,58" fill="#ffcc00" opacity="0.6"/>
          </g>
        )}
      </svg>
    </div>
  );
}

// ── Personagem SVG ─────────────────────────────────────────────────────────────
function Character({ side, state, holdingGun, spinning, fired }) {
  // state: 'idle' | 'dead' | 'relieved'
  const flip = side === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
  const headColor   = '#f5cba7';
  const bodyColor   = side === 'left' ? '#2563eb' : '#dc2626'; // azul vs vermelho
  const faceExpression = state === 'dead' ? 'dead' : state === 'relieved' ? 'smile' : 'neutral';

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        transform: flip,
        animation: state === 'dead' ? 'characterFall 0.6s ease forwards' : 'none',
      }}
    >
      <svg viewBox="0 0 80 130" width="80" height="130">
        {/* Cadeira */}
        <rect x="5"  y="85"  width="70" height="8"  rx="3" fill="#5a3e28"/>
        <rect x="5"  y="60"  width="8"  height="35" rx="3" fill="#5a3e28"/>
        <rect x="67" y="60"  width="8"  height="35" rx="3" fill="#5a3e28"/>
        <rect x="5"  y="93"  width="8"  height="30" rx="3" fill="#5a3e28"/>
        <rect x="67" y="93"  width="8"  height="30" rx="3" fill="#5a3e28"/>
        {/* Encosto */}
        <rect x="5"  y="40"  width="70" height="22" rx="4" fill="#7a5230"/>
        {/* Corpo */}
        <rect x="20" y="50"  width="40" height="38" rx="6" fill={bodyColor}/>
        {/* Pernas */}
        <rect x="22" y="85"  width="12" height="28" rx="4" fill="#374151"/>
        <rect x="46" y="85"  width="12" height="28" rx="4" fill="#374151"/>
        {/* Pés */}
        <ellipse cx="28" cy="114" rx="10" ry="5" fill="#111"/>
        <ellipse cx="52" cy="114" rx="10" ry="5" fill="#111"/>
        {/* Braços */}
        {holdingGun ? (
          // Braço estendido a segurar a arma
          <line x1="55" y1="62" x2="78" y2="58" stroke={bodyColor} strokeWidth="10" strokeLinecap="round"/>
        ) : (
          <>
            <line x1="20" y1="62" x2="8"  y2="78" stroke={bodyColor} strokeWidth="10" strokeLinecap="round"/>
            <line x1="60" y1="62" x2="72" y2="78" stroke={bodyColor} strokeWidth="10" strokeLinecap="round"/>
          </>
        )}
        {/* Cabeça */}
        <ellipse
          cx="40" cy="36" rx="20" ry="22"
          fill={headColor}
          style={state === 'dead' ? { transform:'rotate(45deg)', transformOrigin:'40px 36px' } : {}}
        />
        {/* Cabelo */}
        <ellipse cx="40" cy="17" rx="20" ry="10" fill={side === 'left' ? '#1a1a1a' : '#8b4513'}/>
        {/* Olhos */}
        {faceExpression === 'dead' ? (
          <>
            <line x1="31" y1="31" x2="37" y2="37" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="37" y1="31" x2="31" y2="37" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="43" y1="31" x2="49" y2="37" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="49" y1="31" x2="43" y2="37" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <ellipse cx="33" cy="34" rx="4" ry={faceExpression === 'relieved' ? 3 : 4} fill="#222"/>
            <ellipse cx="47" cy="34" rx="4" ry={faceExpression === 'relieved' ? 3 : 4} fill="#222"/>
            <circle cx="34" cy="33" r="1.5" fill="white"/>
            <circle cx="48" cy="33" r="1.5" fill="white"/>
          </>
        )}
        {/* Boca */}
        {faceExpression === 'smile' && <path d="M33 43 Q40 49 47 43" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>}
        {faceExpression === 'neutral' && <line x1="33" y1="44" x2="47" y2="44" stroke="#333" strokeWidth="2" strokeLinecap="round"/>}
        {faceExpression === 'dead' && <path d="M33 45 Q40 41 47 45" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>}
        {/* Suor quando em tensão */}
        {state === 'idle' && holdingGun && (
          <ellipse cx="55" cy="28" rx="2" ry="4" fill="#60a5fa" opacity="0.7"/>
        )}
      </svg>
    </div>
  );
}

// ── Câmaras do tambor ─────────────────────────────────────────────────────────
function DrumDisplay({ bulletPos, currentShot, totalShots }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Tambor</p>
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 80 80" width="64" height="64">
          <circle cx="40" cy="40" r="36" fill="#555" stroke="#333" strokeWidth="4"/>
          <circle cx="40" cy="40" r="28" fill="#444"/>
          {Array.from({ length: CHAMBERS }).map((_, i) => {
            const a    = ((i / CHAMBERS) * Math.PI * 2) - Math.PI / 2;
            const cx   = 40 + 18 * Math.cos(a);
            const cy   = 40 + 18 * Math.sin(a);
            const shot = i < totalShots;
            const hasBullet = i === bulletPos;
            return (
              <circle
                key={i} cx={cx} cy={cy} r="7"
                fill={shot ? '#111' : hasBullet ? '#c0392b' : '#666'}
                stroke={i === totalShots ? '#fbbf24' : '#222'}
                strokeWidth={i === totalShots ? 2 : 1}
              />
            );
          })}
          <circle cx="40" cy="40" r="6" fill="#333"/>
        </svg>
      </div>
      <p className="text-xs text-zinc-400 font-mono">Disparo <strong className="text-white">{totalShots + 1}</strong>/6</p>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function RussianRoulette() {
  const { balance, updateBalance } = useUser();

  const [bet,        setBet]        = useState(INITIAL_BET);
  const [phase,      setPhase]      = useState('bet');    // 'bet' | 'spinning' | 'result' | 'dead' | 'gameover'
  const [turn,       setTurn]       = useState(0);        // 0 = jogador esq, 1 = dir
  const [shotCount,  setShotCount]  = useState(0);        // quantos disparos já houve
  const [bulletPos,  setBulletPos]  = useState(null);     // posição da bala (0-5)
  const [currentMsg, setCurrentMsg] = useState('');
  const [deadSide,   setDeadSide]   = useState(null);     // 'left'|'right'
  const [firedAnim,  setFiredAnim]  = useState(false);
  const [spinning,   setSpinning]   = useState(false);
  const rafRef = useRef(null);

  // Iniciar jogo: sorteia posição da bala e bloqueia aposta
  const startGame = () => {
    if (bet > balance || bet <= 0) return;
    updateBalance(-bet, 'Roleta Russa');
    const pos = Math.floor(Math.random() * CHAMBERS);
    setBulletPos(pos);
    setShotCount(0);
    setTurn(0);
    setDeadSide(null);
    setFiredAnim(false);
    setCurrentMsg('O tambor foi girado... 🎲');
    setPhase('idle');
  };

  // Girar e disparar
  const pullTrigger = () => {
    if (phase !== 'idle') return;
    setSpinning(true);
    setCurrentMsg('A girar o tambor...');
    setPhase('spinning');

    setTimeout(() => {
      setSpinning(false);
      setFiredAnim(true);

      const side = turn === 0 ? 'left' : 'right';
      const isFatal = shotCount === bulletPos;

      setTimeout(() => {
        setFiredAnim(false);
        if (isFatal) {
          // MORREU
          setDeadSide(side);
          setPhase('dead');
          setCurrentMsg(turn === 0
            ? '💀 O Jogador Azul foi atingido! O Jogador Vermelho vence!'
            : '💀 O Jogador Vermelho foi atingido! O Jogador Azul vence!');
          // Pagar ganho se for o adversário a morrer (jogador do utilizador é sempre o azul)
          if (turn === 1) {
            const mult = PAYOUT_MULTI[Math.min(shotCount, 5)];
            const winAmt = bet * mult;
            updateBalance(winAmt, 'Roleta Russa');
          }
        } else {
          const nextShot  = shotCount + 1;
          const nextTurn  = 1 - turn;
          setShotCount(nextShot);
          setTurn(nextTurn);

          if (nextShot >= CHAMBERS) {
            // Todos sobreviveram (impossível com 1 bala, mas salvaguarda)
            setPhase('gameover');
            setCurrentMsg('Incrível! Todos sobreviveram...');
          } else {
            setPhase('idle');
            setCurrentMsg(nextTurn === 0
              ? '😅 Clique! O Jogador Vermelho sobreviveu. Vez do Azul...'
              : '😅 Clique! O Jogador Azul sobreviveu. Vez do Vermelho...');
          }
        }
      }, 600);
    }, 1200);
  };

  // Retirar-se e receber prémio parcial
  const cashOut = () => {
    if (phase !== 'idle' || shotCount === 0) return;
    const mult    = PAYOUT_MULTI[Math.min(shotCount - 1, 5)];
    const winAmt  = Math.floor(bet * mult * 0.6); // 60% do prémio por retirar cedo
    updateBalance(winAmt, 'Roleta Russa');
    setCurrentMsg(`Retirou-se a tempo! Ganhou ${winAmt.toLocaleString('pt-PT')}GB 🏳️`);
    setPhase('gameover');
  };

  const reset = () => {
    setPhase('bet');
    setBulletPos(null);
    setShotCount(0);
    setTurn(0);
    setDeadSide(null);
    setFiredAnim(false);
    setSpinning(false);
    setCurrentMsg('');
  };

  const currentSide = turn === 0 ? 'left' : 'right';

  return (
    <div className="flex flex-col items-center gap-6 p-6 md:p-8 animate-fadeSlideUp min-h-screen">

      {/* Título */}
      <div className="text-center">
        <h2
          className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800"
          style={{ fontFamily:"'Outfit', sans-serif", textShadow:'0 0 30px rgba(220,38,38,0.3)' }}
        >
          🔫 Roleta Russa
        </h2>
        <p className="text-zinc-500 text-sm mt-1">1 bala · 6 câmaras · Máximo suspense</p>
      </div>

      {/* ── Cena de jogo ────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-zinc-800"
        style={{
          background: 'linear-gradient(180deg, #0f0a0a 0%, #1c1008 50%, #0f0a0a 100%)',
          boxShadow: '0 0 60px rgba(120,0,0,0.4), inset 0 0 40px rgba(0,0,0,0.8)',
          minHeight: 300,
        }}
      >
        {/* Fundo: mesa de madeira */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <div className="w-4/5 h-6 bg-gradient-to-r from-transparent via-amber-950/50 to-transparent rounded-full blur-sm"/>
        </div>

        {/* Lâmpada decorativa */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-yellow-200/20 to-transparent blur-lg pointer-events-none"/>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-yellow-200/60 shadow-[0_0_20px_10px_rgba(255,255,200,0.15)]"/>

        {/* Personagens + revólver */}
        <div className="relative flex items-end justify-between px-8 pt-6 pb-2">

          {/* Jogador Esquerdo (Azul) */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Tu</span>
            <Character
              side="left"
              state={deadSide === 'left' ? 'dead' : phase === 'gameover' ? 'relieved' : 'idle'}
              holdingGun={currentSide === 'left' && phase !== 'bet'}
              spinning={spinning && currentSide === 'left'}
              fired={firedAnim && turn === 0}
            />
          </div>

          {/* Centro: Revólver + tambor */}
          <div className="flex flex-col items-center gap-3 z-10">
            {/* Revólver a passar de mão */}
            <div
              style={{
                transform: phase === 'bet' ? 'translateX(0)' : turn === 0 ? 'translateX(-60px)' : 'translateX(60px)',
                transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                animation: spinning ? 'revolverBounce 0.3s ease infinite alternate' : 'none',
              }}
            >
              <Revolver
                spinning={spinning}
                fired={firedAnim}
                side={turn === 0 ? 'right' : 'left'}
              />
            </div>

            {bulletPos !== null && (
              <DrumDisplay bulletPos={bulletPos} currentShot={shotCount} totalShots={shotCount} />
            )}
          </div>

          {/* Jogador Direito (Vermelho) */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold">Adversário</span>
            <Character
              side="right"
              state={deadSide === 'right' ? 'dead' : phase === 'gameover' ? 'relieved' : 'idle'}
              holdingGun={currentSide === 'right' && phase !== 'bet'}
              spinning={spinning && currentSide === 'right'}
              fired={firedAnim && turn === 1}
            />
          </div>
        </div>

        {/* Mensagem de estado */}
        {currentMsg && (
          <div className="text-center px-6 py-3 text-sm font-bold text-zinc-200 animate-fadeSlideUp">
            {currentMsg}
          </div>
        )}
      </div>

      {/* ── Painel de Controlo ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-center justify-center w-full max-w-2xl">

        {phase === 'bet' && (
          <div className="glass-card p-5 flex flex-col gap-4 w-full max-w-sm">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-center">Risco (GB)</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {[50, 100, 250, 500, 1000].map(v => (
                <button key={v} onClick={() => setBet(v)}
                  className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer
                    ${bet === v
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] scale-105'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {v} GB
                </button>
              ))}
            </div>
            <button
              onClick={startGame}
              disabled={bet > balance}
              className="w-full py-4 bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-lg rounded-xl border-b-4 border-red-900 active:scale-95 cursor-pointer disabled:opacity-40 transition-all"
            >
              🔫 Começar
            </button>
          </div>
        )}

        {phase === 'idle' && (
          <div className="flex gap-3">
            <button
              onClick={pullTrigger}
              className="px-8 py-4 bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 text-white font-black text-lg rounded-xl border-b-4 border-red-900 active:scale-95 cursor-pointer transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              🔫 Disparar
            </button>
            {shotCount > 0 && (
              <button
                onClick={cashOut}
                className="px-6 py-4 bg-gradient-to-b from-green-600 to-green-800 hover:from-green-500 text-white font-black rounded-xl border-b-4 border-green-900 active:scale-95 cursor-pointer transition-all"
              >
                🏳️ Retirar
              </button>
            )}
          </div>
        )}

        {phase === 'spinning' && (
          <p className="text-yellow-400 font-bold animate-pulseSoft tracking-widest uppercase">
            O tambor está a girar...
          </p>
        )}

        {(phase === 'dead' || phase === 'gameover') && (
          <button
            onClick={reset}
            className="px-8 py-4 bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 text-white font-black text-lg rounded-xl border-b-4 border-zinc-900 active:scale-95 cursor-pointer transition-all"
          >
            🔄 Nova Partida
          </button>
        )}
      </div>

      {/* Tabela de prémios */}
      <div className="glass-card p-4 w-full max-w-sm">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-center mb-3">Prémios por Sobrevivência</p>
        <div className="space-y-1">
          {PAYOUT_MULTI.map((mult, i) => (
            <div key={i} className={`flex justify-between text-xs px-2 py-1 rounded ${shotCount === i && phase !== 'bet' ? 'bg-yellow-500/10 border border-yellow-500/30' : ''}`}>
              <span className="text-zinc-400">{i + 1}º Disparo ({i === 0 ? '1ª vez' : `${i+1} sobreviventes`})</span>
              <span className={`font-mono font-bold ${mult >= 8 ? 'text-yellow-400' : 'text-green-400'}`}>{mult}x</span>
            </div>
          ))}
          <div className="flex justify-between text-xs px-2 py-1 text-zinc-500">
            <span>Retirar cedo (60% do prémio)</span>
            <span className="font-mono">✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

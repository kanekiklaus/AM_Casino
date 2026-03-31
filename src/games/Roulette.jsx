// games/Roulette.jsx — Roleta Europeia com Mesa de Apostas Autêntica

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';

// Ordenação real europeia da roda
const WHEEL_ORDER = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,
  24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,
];

const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

const getColor = (n) => {
  if (n === 0) return 'green';
  return RED_NUMBERS.has(n) ? 'red' : 'black';
};

// Layout da mesa: 3 linhas × 12 colunas (ordem da Mesa de Roleta real)
// Linha 3 (topo da mesa): 3,6,9,12... | Linha 2: 2,5,8,11... | Linha 1: 1,4,7,10...
const TABLE_ROWS = [
  [3,6,9,12,15,18,21,24,27,30,33,36],  // row mais alto
  [2,5,8,11,14,17,20,23,26,29,32,35],
  [1,4,7,10,13,16,19,22,25,28,31,34],  // row mais baixo
];

const checkBet = (betId, number) => {
  switch (betId) {
    case 'red':    return getColor(number) === 'red';
    case 'black':  return getColor(number) === 'black';
    case 'even':   return number !== 0 && number % 2 === 0;
    case 'odd':    return number % 2 !== 0;
    case 'low':    return number >= 1  && number <= 18;
    case 'high':   return number >= 19 && number <= 36;
    case 'dozen1': return number >= 1  && number <= 12;
    case 'dozen2': return number >= 13 && number <= 24;
    case 'dozen3': return number >= 25 && number <= 36;
    case 'col1':   return number % 3 === 1;  // 1,4,7...34
    case 'col2':   return number % 3 === 2;  // 2,5,8...35
    case 'col3':   return number % 3 === 0 && number !== 0; // 3,6,9...36
    default:       return false;
  }
};

const BET_MULTIPLIERS = {
  red:2, black:2, even:2, odd:2, low:2, high:2,
  dozen1:3, dozen2:3, dozen3:3, col1:3, col2:3, col3:3,
};

// ── Roda Visual — bola e prato giram em simultâneo ───────────────────────────
function RouletteWheel({ spinning, winningNum, onSpinEnd }) {
  const NUM_SLOTS   = WHEEL_ORDER.length;
  const sliceAngle  = 360 / NUM_SLOTS;
  const SIZE        = 300;
  const CENTER      = SIZE / 2;
  const BALL_R      = 123;
  const WHEEL_RATIO = 0.3; // prato move-se a 30% da velocidade da bola, sentido contrário

  const [ballAngle, setBallAngle] = useState(0);
  const [wheelRot,  setWheelRot]  = useState(0);
  const spinRef = useRef(false);
  const rafId   = useRef(null);

  useEffect(() => {
    if (spinning && !spinRef.current) {
      spinRef.current = true;

      // ── 1. Pré-calcular totais antes de animar ─────────────────────────────
      const winIdx = WHEEL_ORDER.indexOf(winningNum);
      const θ      = (winIdx * sliceAngle + sliceAngle / 2) % 360;

      // Bola faz 7 voltas completas como base
      const BASE_ROTATIONS  = 7;
      const baseBallDeg     = 360 * BASE_ROTATIONS;

      // Onde fica o prato depois das 7 voltas da bola?
      const baseWheelDeg    = baseBallDeg * WHEEL_RATIO;
      const wheelFinal      = baseWheelDeg % 360;

      // Para que a bola pouse sobre o número vencedor, ela tem de estar em:
      // θ_bola = θ_número − rotação_prato   (em módulo 360)
      const ballTarget      = ((θ - wheelFinal) % 360 + 360) % 360;

      // Total real da bola = voltas base + alinhamento final
      const totalBall  = baseBallDeg + ballTarget;
      const totalWheel = totalBall * WHEEL_RATIO; // prato proporcional

      // ── 2. Easing: arranca rápido, desacelera suavemente ──────────────────
      // Cubic ease-in-out assimétrico — 20% acelera, 80% desacelera
      const ease = (t) => {
        if (t < 0.2) {
          // Arranque rápido: ease-in quadrático escalado para 0.35
          return (t / 0.2) * (t / 0.2) * 0.35;
        }
        // Desaceleração longa: mapeamos 0.2→1 em 0.35→1 com cubic ease-out
        const u = (t - 0.2) / 0.8;
        return 0.35 + 0.65 * (1 - Math.pow(1 - u, 2.5));
      };

      const TOTAL_FRAMES = 450; // ~7.5s a 60fps
      let frame = 0;

      const animate = () => {
        if (frame <= TOTAL_FRAMES) {
          const progress = ease(frame / TOTAL_FRAMES);
          setBallAngle((totalBall  * progress) % 360);
          setWheelRot ((totalWheel * progress) % 360);
          frame++;
          rafId.current = requestAnimationFrame(animate);
        } else {
          // Posição final exacta
          setBallAngle(ballTarget % 360);
          setWheelRot (totalWheel % 360);
          setTimeout(onSpinEnd, 250);
        }
      };

      rafId.current = requestAnimationFrame(animate);
    }
    if (!spinning) spinRef.current = false;
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [spinning, winningNum]); // eslint-disable-line

  const ballRad = (ballAngle * Math.PI) / 180;
  const ballX   = CENTER + BALL_R * Math.sin(ballRad);
  const ballY   = CENTER - BALL_R * Math.cos(ballRad);

  const colorMap = { red:'#b91c1c', black:'#18181b', green:'#15803d' };

  return (
    <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>

      {/* Anel exterior — decorativo */}
      <div className="absolute inset-0 rounded-full bg-zinc-950
        border-[10px] border-yellow-700
        shadow-[0_0_50px_rgba(161,98,7,0.7),inset_0_0_30px_rgba(0,0,0,0.95)]" />

      {/* Overlay de números e prato — roda no sentido contrário à bola */}
      <div className="absolute inset-0" style={{ transform: `rotate(${-wheelRot}deg)` }}>
        {WHEEL_ORDER.map((num, i) => {
          const textAngle = i * sliceAngle + sliceAngle / 2;
          const rNum = 122;
          const rDiv = 140;
          const x = CENTER + rNum * Math.sin((textAngle * Math.PI) / 180);
          const y = CENTER - rNum * Math.cos((textAngle * Math.PI) / 180);
          const divAngle = i * sliceAngle;
          return (
            <React.Fragment key={num}>
              <div className="absolute"
                style={{ width:rDiv, height:1, top:CENTER, left:CENTER,
                  transformOrigin:'0 50%', transform:`rotate(${divAngle}deg)`,
                  background:'rgba(255,255,255,0.10)' }} />
              <div className="absolute flex items-center justify-center text-white font-black select-none"
                style={{ fontSize:8, width:18, height:18, left:x-9, top:y-9,
                  borderRadius:3, background: colorMap[getColor(num)],
                  transform:`rotate(${textAngle}deg)`,
                  boxShadow:'0 0 4px rgba(0,0,0,0.9)' }}>
                {num}
              </div>
            </React.Fragment>
          );
        })}

        {/* Prato interior */}
        <div className="absolute rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950
          border-4 border-yellow-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]"
          style={{ width:90, height:90, left:CENTER-45, top:CENTER-45 }}>
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700
              shadow-[0_0_14px_rgba(234,179,8,1)]" />
          </div>
        </div>
      </div>

      {/* Ponteiro */}
      <div className="absolute left-1/2 z-30 -translate-x-1/2"
        style={{ top:-4, width:0, height:0,
          borderLeft:'10px solid transparent', borderRight:'10px solid transparent',
          borderTop:'24px solid #fbbf24',
          filter:'drop-shadow(0 0 10px rgba(251,191,36,1))' }} />

      {/* Bola de ivório */}
      {(spinning || ballAngle !== 0) && (
        <div className="absolute z-20 rounded-full bg-white
          shadow-[0_0_12px_rgba(255,255,255,1),0_0_4px_rgba(0,0,0,0.5)]"
          style={{ width:14, height:14, left:ballX-7, top:ballY-7 }} />
      )}
    </div>
  );
}



// ── Ficha visual em cima de uma célula ───────────────────────────────────────
function Chip({ amount }) {
  return (
    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-400 border border-yellow-600 text-[8px] font-black text-black flex items-center justify-center shadow-md z-10 pointer-events-none">
      {amount >= 1000 ? `${Math.floor(amount/1000)}k` : amount}
    </div>
  );
}

// ── Mesa de Roleta ───────────────────────────────────────────────────────────
function RouletteTable({ bets, onBet, winningNum, spinning }) {
  const cellBase = `
    relative flex items-center justify-center font-black text-sm cursor-pointer border border-green-900/60
    transition-all duration-150 select-none active:scale-95 hover:brightness-125
  `;
  const isWinner = (n) => winningNum !== null && winningNum === n;

  return (
    <div
      className="bg-green-800 border-4 border-yellow-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.3)] p-4 overflow-x-auto"
      style={{ minWidth: 540 }}
    >
      {/* Linha decorativa topo */}
      <div className="text-center text-yellow-400/60 font-bold text-[10px] tracking-[0.4em] uppercase mb-3">Torn City Casino — European Roulette</div>

      <div className="flex gap-1">

        {/* Coluna do Zero */}
        <div className="flex flex-col">
          <button
            onClick={() => !spinning && onBet('0')}
            className={`${cellBase} bg-green-700 hover:bg-green-600 text-white h-full w-12 rounded-l-lg text-lg
              ${isWinner(0) ? 'ring-2 ring-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.9)] scale-105 z-20' : ''}
              ${bets['0'] ? 'brightness-125' : ''}
            `}
          >
            0
            {bets['0'] && <Chip amount={bets['0']} />}
          </button>
        </div>

        {/* Grelha 3 linhas × 12 colunas */}
        <div className="flex flex-col gap-1 flex-1">
          {TABLE_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((num) => {
                const c = getColor(num);
                const winner = isWinner(num);
                return (
                  <button
                    key={num}
                    onClick={() => !spinning && onBet(String(num))}
                    className={`
                      ${cellBase} flex-1 h-10 text-white text-xs font-black rounded
                      ${c === 'red'   ? 'bg-red-700 hover:bg-red-600'   : 'bg-zinc-900 hover:bg-zinc-700'}
                      ${winner ? 'ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,1)] scale-110 z-20' : ''}
                      ${bets[String(num)] ? 'brightness-125' : ''}
                    `}
                  >
                    {num}
                    {bets[String(num)] && <Chip amount={bets[String(num)]} />}
                  </button>
                );
              })}
              {/* Aposta 2-to-1 por coluna */}
              <button
                onClick={() => !spinning && onBet(`col${3 - rowIdx}`)}
                className={`${cellBase} w-12 h-10 rounded bg-green-900 hover:bg-green-700 text-yellow-300 text-[9px] text-center leading-tight
                  ${bets[`col${3 - rowIdx}`] ? 'bg-green-600 brightness-125' : ''}
                `}
              >
                2:1
                {bets[`col${3 - rowIdx}`] && <Chip amount={bets[`col${3 - rowIdx}`]} />}
              </button>
            </div>
          ))}

          {/* Dúzias */}
          <div className="flex gap-1 mt-0.5">
            {[
              { id:'dozen1', label:'1ª Dúzia  (1-12)'  },
              { id:'dozen2', label:'2ª Dúzia  (13-24)' },
              { id:'dozen3', label:'3ª Dúzia  (25-36)' },
            ].map(d => (
              <button key={d.id} onClick={() => !spinning && onBet(d.id)}
                className={`${cellBase} flex-1 h-8 rounded bg-green-900 hover:bg-green-700 text-green-200 text-[10px]
                  ${bets[d.id] ? 'bg-green-600 brightness-125' : ''}
                `}
              >
                {d.label}
                {bets[d.id] && <Chip amount={bets[d.id]} />}
              </button>
            ))}
            {/* espaço para alinhar com col 2:1 */}
            <div className="w-12" />
          </div>

          {/* Apostas exteriores */}
          <div className="flex gap-1 mt-0.5">
            {[
              { id:'low',   label:'1-18',    cls:'bg-green-900 hover:bg-green-700 text-green-200' },
              { id:'even',  label:'Par',      cls:'bg-green-900 hover:bg-green-700 text-green-200' },
              { id:'red',   label:'Vermelho', cls:'bg-red-700 hover:bg-red-600 text-white' },
              { id:'black', label:'Preto',    cls:'bg-zinc-900 hover:bg-zinc-700 text-white' },
              { id:'odd',   label:'Ímpar',    cls:'bg-green-900 hover:bg-green-700 text-green-200' },
              { id:'high',  label:'19-36',    cls:'bg-green-900 hover:bg-green-700 text-green-200' },
            ].map(b => (
              <button key={b.id} onClick={() => !spinning && onBet(b.id)}
                className={`${cellBase} flex-1 h-8 rounded text-xs font-black ${b.cls}
                  ${bets[b.id] ? 'ring-2 ring-yellow-400 brightness-125' : ''}
                `}
              >
                {b.id === 'red'   && <span className="w-3 h-3 rounded-full bg-red-500 mr-1 shadow" />}
                {b.id === 'black' && <span className="w-3 h-3 rounded-full bg-zinc-400 mr-1 shadow" />}
                {b.label}
                {bets[b.id] && <Chip amount={bets[b.id]} />}
              </button>
            ))}
            <div className="w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function Roulette() {
  const { balance, updateBalance } = useUser();
  const [chipAmount, setChipAmount] = useState(50);
  const [bets, setBets]             = useState({});
  const [winningNum, setWinningNum] = useState(null);
  const [spinning, setSpinning]     = useState(false);
  const [results, setResults]       = useState([]);
  const [resultInfo, setResultInfo] = useState(null);
  const pendingNum = useRef(null);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const placeBet = (key) => {
    if (spinning) return;
    setBets(prev => {
      if (prev[key]) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: chipAmount };
    });
  };

  const spin = () => {
    if (spinning || totalBet === 0 || totalBet > balance) return;
    updateBalance(-totalBet, 'Roleta');
    setResultInfo(null);
    const num = Math.floor(Math.random() * 37);
    pendingNum.current = num;
    setWinningNum(num);
    setSpinning(true);
  };

  const handleSpinEnd = () => {
    const num = pendingNum.current;
    setSpinning(false);
    setResults(prev => [num, ...prev].slice(0, 15));
    let totalWin = 0;
    for (const [key, amt] of Object.entries(bets)) {
      const mult = BET_MULTIPLIERS[key];
      const betNum = parseInt(key, 10);
      if (mult && checkBet(key, num))             totalWin += amt * mult;
      else if (!isNaN(betNum) && betNum === num)  totalWin += amt * 36;
    }
    if (totalWin > 0) {
      updateBalance(totalWin, 'Roleta');
      setResultInfo({ type: 'win', num, amount: totalWin });
    } else {
      setResultInfo({ type: 'loss', num });
    }
    setBets({});
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 animate-fadeSlideUp">
      <div className="text-center">
        <h2 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
          style={{ fontFamily:"'Outfit', sans-serif" }}>
          🎡 Roleta Europeia
        </h2>
        <p className="text-zinc-500 text-sm mt-1">Número único paga 36x — apostas externas pagam 2x ou 3x</p>
      </div>

      {/* Topo: Roda + Painel de Controlo */}
      <div className="flex flex-wrap gap-6 items-center justify-center w-full">

        {/* Roda */}
        <RouletteWheel spinning={spinning} winningNum={winningNum} onSpinEnd={handleSpinEnd} />

        {/* Painel direito */}
        <div className="flex flex-col gap-4 min-w-52">

          {/* Resultado */}
          <div className="h-20 flex items-center justify-center">
            {spinning && (
              <p className="text-yellow-400 font-bold animate-pulseSoft tracking-[0.2em] text-sm uppercase">
                A Rodar...
              </p>
            )}
            {resultInfo && !spinning && (
              <div className={`rounded-xl px-6 py-3 text-center font-bold shadow-lg animate-fadeSlideUp
                ${resultInfo.type === 'win'
                  ? 'bg-green-600/20 text-green-400 border border-green-600/40'
                  : 'bg-red-900/20 text-red-400 border border-red-800/40'}`}>
                <p className="text-sm">Saiu:
                  <strong className={`ml-1 text-xl ${getColor(resultInfo.num) === 'red' ? 'text-red-400' : getColor(resultInfo.num) === 'green' ? 'text-green-400' : 'text-zinc-300'}`}>
                    {resultInfo.num}
                  </strong>
                </p>
                {resultInfo.type === 'win' && (
                  <p className="text-2xl font-mono glow-text-green">+{resultInfo.amount.toLocaleString('pt-PT')} GB</p>
                )}
              </div>
            )}
          </div>

          {/* Fichas */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 text-center">Valor da Ficha</p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {[10,25,50,100,500,1000].map(v => (
                <button key={v} onClick={() => setChipAmount(v)}
                  className={`w-11 h-11 rounded-full text-[10px] font-black transition-all cursor-pointer shadow active:scale-90
                    ${chipAmount === v
                      ? 'bg-yellow-400 text-black ring-2 ring-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.8)] scale-110'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'}`}>
                  {v >= 1000 ? `${v/1000}k` : v} GB
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="text-center text-sm text-zinc-500">
            Apostado: <span className="text-white font-mono font-bold">{totalBet.toLocaleString('pt-PT')}GB</span>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button onClick={spin}
              disabled={spinning || totalBet === 0 || totalBet > balance}
              className="flex-1 py-3.5 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 disabled:opacity-40 text-white font-black text-base rounded-xl transition-all glow-green cursor-pointer border-b-4 border-green-900 active:scale-95 disabled:cursor-not-allowed">
              {spinning ? '⏳' : '🎡 GIRAR'}
            </button>
            <button onClick={() => setBets({})} disabled={spinning}
              className="px-4 py-3.5 text-sm text-zinc-500 hover:text-red-400 transition cursor-pointer border border-zinc-700 rounded-xl hover:border-red-500/30">
              ✕
            </button>
          </div>

          {/* Histórico */}
          {results.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {results.map((n, i) => (
                <span key={i} className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow
                  ${getColor(n) === 'red' ? 'bg-red-700' : getColor(n) === 'black' ? 'bg-zinc-700' : 'bg-green-700'}`}>
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mesa de apostas */}
      <RouletteTable bets={bets} onBet={placeBet} winningNum={winningNum} spinning={spinning} />

    </div>
  );
}

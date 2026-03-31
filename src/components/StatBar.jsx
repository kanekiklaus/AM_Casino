// StatBar.jsx
// Barra de topo: saldo animado, temperatura do PC, vitórias/derrotas

import React, { useState, useEffect } from 'react';
import { useUser, tempColor } from '../context/UserContext';

// Mapa de id de jogo → nome legível
const GAME_LABELS = {
  home:      'Salão Principal',
  highlow:   'High-Low',
  slots:     'Slots',
  blackjack: 'Blackjack',
  roulette:  'Roleta',
  russian:   'Roleta Russa',
  bookie:    'Apostas',
};

export default function StatBar({ activeGame, onMenuOpen }) {
  const { balance, temperature, stats } = useUser();
  const [balanceClass, setBalanceClass] = useState('text-green-400');
  const [prevBalance, setPrevBalance]   = useState(balance);

  // Animação ao mudar de saldo
  useEffect(() => {
    if (balance > prevBalance)       setBalanceClass('text-green-400 glow-text-green scale-110');
    else if (balance < prevBalance)  setBalanceClass('text-red-400 glow-text-red scale-110');
    setPrevBalance(balance);
    const t = setTimeout(() => setBalanceClass('text-green-400 scale-100'), 600);
    return () => clearTimeout(t);
  }, [balance]); // eslint-disable-line react-hooks/exhaustive-deps

  const netResult = stats.totalWon - stats.totalLost;
  const color     = tempColor(temperature);

  return (
    <header className="relative flex flex-col flex-shrink-0 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 z-10">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 md:h-auto md:py-3 gap-3">

        {/* ── Esquerda: botão hambúrguer (mobile) + nome do jogo ── */}
        <div className="flex items-center gap-3">
          {/* Hambúrguer — só visível em mobile */}
          <button
            onClick={onMenuOpen}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Abrir menu"
            id="hamburger-btn"
          >
            <span className="block w-5 h-0.5 bg-zinc-400" />
            <span className="block w-5 h-0.5 bg-zinc-400" />
            <span className="block w-5 h-0.5 bg-zinc-400" />
          </button>

          <span className="text-zinc-400 font-semibold text-sm uppercase tracking-[0.2em] drop-shadow-md truncate max-w-[120px] md:max-w-none">
            {GAME_LABELS[activeGame] ?? activeGame}
          </span>
        </div>

        {/* ── Centro: stats (escondido em mobile muito pequeno) ── */}
        <div className="hidden sm:flex items-center gap-5 md:gap-8 text-sm bg-zinc-950/50 px-4 md:px-6 py-2 rounded-full border border-zinc-800/50 shadow-inner">
          <div className="flex flex-col items-center group cursor-default">
            <span className="text-green-400 font-bold text-sm md:text-base">{stats.wins}</span>
            <span className="text-zinc-600 text-[9px] md:text-[10px] uppercase tracking-wider">Vitórias</span>
          </div>
          <div className="w-px h-6 bg-zinc-800" />
          <div className="flex flex-col items-center group cursor-default">
            <span className="text-red-400 font-bold text-sm md:text-base">{stats.losses}</span>
            <span className="text-zinc-600 text-[9px] md:text-[10px] uppercase tracking-wider">Derrotas</span>
          </div>
          <div className="w-px h-6 bg-zinc-800" />
          <div className="flex flex-col items-center group cursor-default">
            <span className={`font-bold font-mono text-sm md:text-base ${netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netResult >= 0 ? '+' : ''}{Math.abs(netResult).toLocaleString('pt-PT')}GB
            </span>
            <span className="text-zinc-600 text-[9px] md:text-[10px] uppercase tracking-wider">Líquido</span>
          </div>
        </div>

        {/* ── Direita: temperatura + saldo ── */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Temperatura (mini badge) */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">CPU</span>
              <span
                className="text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all duration-700"
                style={{
                  color,
                  borderColor: `${color}55`,
                  backgroundColor: `${color}15`,
                  textShadow: `0 0 8px ${color}88`,
                }}
              >
                {temperature}°C
              </span>
            </div>
            {/* Mini barra de temperatura */}
            <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${temperature}%`,
                  background: `linear-gradient(90deg, #3b82f6, ${color})`,
                  boxShadow: `0 0 4px ${color}`,
                }}
              />
            </div>
          </div>

          {/* Saldo */}
          <div className={`text-xl md:text-2xl font-black font-mono transition-all duration-500 origin-right ${balanceClass}`}>
            {balance.toLocaleString('pt-PT')}GB
          </div>
        </div>
      </div>

      {/* Linha decorativa de base */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50" />
    </header>
  );
}

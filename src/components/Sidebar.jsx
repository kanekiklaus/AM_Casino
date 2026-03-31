// Sidebar.jsx — Barra lateral com termómetro de temperatura PC e quiz de escola

import React, { useState } from 'react';
import { useUser, tempColor } from '../context/UserContext';

const GAMES = [
  { id: 'home',      label: 'Salão Principal',   icon: '🏠', colour: 'text-zinc-400'   },
  { id: 'highlow',   label: 'High-Low',           icon: '🃏', colour: 'text-blue-400'   },
  { id: 'slots',     label: 'Slots',              icon: '🎰', colour: 'text-yellow-400' },
  { id: 'blackjack', label: 'Blackjack',          icon: '♠️', colour: 'text-white'      },
  { id: 'roulette',  label: 'Roleta',             icon: '🎡', colour: 'text-green-400'  },
  { id: 'russian',   label: 'Roleta Russa',       icon: '🔫', colour: 'text-red-500'    },
  { id: 'bookie',    label: 'Apostas',            icon: '📊', colour: 'text-purple-400' },
  { id: 'sobedesce', label: 'Sobe e Desce',       icon: '🃏', colour: 'text-orange-400' },
];

// ── Componente do Termómetro de PC ─────────────────────────────────────────────
function TempGauge({ temperature }) {
  const color  = tempColor(temperature);
  const label  = temperature >= 80 ? 'CRÍTICO 🔥'
               : temperature >= 60 ? 'QUENTE'
               : temperature >= 40 ? 'MORNO'
               : temperature >= 20 ? 'FRESCO'
               : 'FRIO ❄️';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-zinc-500">CPU Temp</span>
        <span style={{ color }} className="transition-colors duration-700">{label}</span>
      </div>

      {/* Barra de temperatura */}
      <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
        {/* Gradiente de fundo (sempre visível, esmaecido) */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 via-yellow-500/20 to-red-600/20" />
        {/* Barra de preenchimento */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-in-out"
          style={{
            width: `${temperature}%`,
            background: `linear-gradient(90deg, #3b82f6, ${color})`,
            boxShadow: `0 0 8px ${color}88`,
          }}
        />
        {/* Brilho animado na ponta */}
        <div
          className="absolute top-0 h-full w-3 blur-sm animate-pulse rounded-full"
          style={{
            left: `calc(${temperature}% - 6px)`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      </div>

      {/* Valor numérico */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">0°</span>
        <span
          className="text-sm font-black font-mono transition-all duration-700"
          style={{ color, textShadow: `0 0 10px ${color}66` }}
        >
          {temperature}°C
        </span>
        <span className="text-[10px] text-zinc-600">100°</span>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function Sidebar({ activeGame, setActiveGame, isOpen, onClose }) {
  const { balance, temperature, resetGame, openQuiz } = useUser();

  return (
    <>
      {/* Overlay mobile (fundo escuro quando sidebar está aberta) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-full z-40 md:z-20
          w-72 min-h-screen bg-zinc-950 border-r border-zinc-800/80
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Iluminação decorativa */}
        <div className="absolute top-0 left-0 w-full h-64 bg-red-900/10 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="p-6 md:p-8 border-b border-zinc-800/50 relative flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-700 uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              TORN
            </h1>
            <p className="text-xs text-zinc-400 tracking-[0.3em] mt-1 font-semibold uppercase">Casino</p>
          </div>
          {/* Botão fechar sidebar no mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-zinc-500 hover:text-white text-2xl p-1 transition-colors cursor-pointer"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* Info do Jogador + Temperatura */}
        <div className="px-6 md:px-8 py-5 border-b border-zinc-800/50 bg-zinc-900/30 relative overflow-hidden">
          <div className="flex flex-col items-center">
            <span className="text-zinc-600 text-[10px] uppercase font-black tracking-widest mb-1">Espaço</span>
            <span className="text-2xl font-black text-white font-mono flex items-center gap-1 group-hover:scale-105 transition-transform">
              {balance.toLocaleString('pt-PT')}
              <span className="text-yellow-500 text-sm">GB</span>
            </span>
          </div>
          <div className="relative z-10 space-y-4 mt-4">
            {/* Termómetro de temperatura */}
            <TempGauge temperature={temperature} />
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 md:p-5 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-4 mb-3">
            Catálogo de Jogos
          </p>

          {GAMES.map(game => {
            const isActive = activeGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => { setActiveGame(game.id); onClose(); }}
                className={`
                  group relative w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-300 ease-out cursor-pointer overflow-hidden
                  ${isActive
                    ? 'bg-gradient-to-r from-red-600/20 to-transparent text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.1)]'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white border border-transparent hover:border-zinc-700/50 hover:-translate-y-0.5'
                  }
                `}
              >
                <div className={`relative z-10 flex items-center gap-4 transition-transform duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-2'}`}>
                  <span className={`text-xl drop-shadow-md transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
                    {game.icon}
                  </span>
                  <span className={`tracking-wide ${isActive ? 'text-white' : game.colour}`}>
                    {game.label}
                  </span>
                </div>

                {isActive && (
                  <>
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-50 animate-pulseSoft" />
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rodapé: Quiz + Repor */}
        <div className="p-5 border-t border-zinc-800/50 bg-zinc-950 space-y-2 relative">
          {/* Botão Quiz — destaque */}
          <button
            onClick={openQuiz}
            className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest py-3 rounded-xl bg-gradient-to-r from-blue-700/20 to-purple-700/20 border border-blue-500/30 text-blue-400 hover:from-blue-700/40 hover:to-purple-700/40 hover:text-blue-300 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
          >
            🎓 Ganhar Crédito (Quiz)
          </button>

          {/* Botão Repor */}
          <button
            onClick={() => {
              if (window.confirm('Tem a certeza? O saldo será reposto para 10.000GB e o progresso perdido.')) {
                resetGame();
              }
            }}
            className="w-full flex items-center justify-center gap-2 group text-xs text-zinc-500 hover:text-red-400 font-bold uppercase tracking-widest transition-all duration-300 py-2.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 cursor-pointer"
          >
            <span className="transition-transform duration-500 group-hover:-rotate-180">↺</span>
            Repor Conta
          </button>
        </div>
      </aside>
    </>
  );
}

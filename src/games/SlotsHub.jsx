// SlotsHub.jsx
// Ecrã de seleção entre Slots Clássica e Big Bass Bonanza

import React, { useState } from 'react';
import Slots        from './Slots';
import BigBassSlots from './BigBassSlots';

export default function SlotsHub() {
  const [choice, setChoice] = useState(null); // null | 'classic' | 'bigbass'

  // Se já escolheu, renderiza o jogo directamente
  if (choice === 'classic')  return <Slots />;
  if (choice === 'bigbass')  return <BigBassSlots />;

  // Ecrã de seleção
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 md:p-12 gap-10 animate-fadeSlideUp">

      {/* Título */}
      <div className="text-center space-y-2">
        <h2
          className="text-4xl md:text-5xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          🎰 SLOTS
        </h2>
        <p className="text-zinc-400 text-sm">Escolhe a tua máquina preferida</p>
      </div>

      {/* Cards de seleção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

        {/* ── Slots Clássica ── */}
        <button
          onClick={() => setChoice('classic')}
          className="group relative glass-card p-8 md:p-10 text-left hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-yellow-800/30 hover:border-yellow-600/60 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] overflow-hidden"
        >
          {/* Brilho de hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/0 to-yellow-700/0 group-hover:from-yellow-900/20 group-hover:to-transparent transition-all duration-500" />

          <div className="relative z-10 space-y-4">
            {/* Ícone / mini preview */}
            <div className="flex gap-3 mb-4">
              {['🍒','🔔','7️⃣'].map((s, i) => (
                <div key={i} className="w-14 h-20 bg-gradient-to-b from-zinc-300 via-white to-zinc-300 rounded flex items-center justify-center text-3xl shadow-inner border border-zinc-400/30">
                  {s}
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-black text-yellow-400 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Slots Clássica
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A máquina de slots original com 3 rolos e símbolos clássicos.
                Acerta no triplo 7️⃣ para o Jackpot de <span className="text-yellow-400 font-bold">50x GB</span>!
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest bg-yellow-900/40 text-yellow-300 border border-yellow-700/30 px-2.5 py-1 rounded-full font-bold">3 Rolos</span>
              <span className="text-[10px] uppercase tracking-widest bg-yellow-900/40 text-yellow-300 border border-yellow-700/30 px-2.5 py-1 rounded-full font-bold">Jackpot 50x GB</span>
              <span className="text-[10px] uppercase tracking-widest bg-yellow-900/40 text-yellow-300 border border-yellow-700/30 px-2.5 py-1 rounded-full font-bold">Clássico</span>
            </div>

            <div className="text-yellow-500 font-black text-sm group-hover:translate-x-2 transition-transform">
              Jogar →
            </div>
          </div>
        </button>

        {/* ── Big Bass Bonanza ── */}
        <button
          onClick={() => setChoice('bigbass')}
          className="group relative glass-card p-8 md:p-10 text-left hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-blue-800/30 hover:border-blue-500/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden"
        >
          {/* Fundo aquático de hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/0 to-blue-900/0 group-hover:from-blue-950/30 group-hover:to-cyan-900/20 transition-all duration-500" />
          {/* Bolhas decorativas */}
          <div className="absolute bottom-4 right-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity select-none">🐟</div>
          <div className="absolute top-4 right-8 text-2xl opacity-10 group-hover:opacity-20 transition-opacity select-none">🎣</div>

          <div className="relative z-10 space-y-4">
            {/* Mini preview dos 5 rolos */}
            <div className="flex gap-1.5 mb-4">
              {['🐟','🎣','🪣','💎','🎩'].map((s, i) => (
                <div key={i} className="w-10 h-14 bg-gradient-to-b from-blue-900 to-blue-950 border border-blue-700/40 rounded flex items-center justify-center text-xl shadow-inner">
                  {s}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-black text-blue-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Big Bass
                </h3>
                <span className="text-[10px] bg-blue-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">NOVO</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                5 rolos com tema de pesca! O 🎣 Pescador é Wild e ativa
                rondas de Free Spins com multiplicadores especiais.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest bg-blue-900/40 text-blue-300 border border-blue-700/30 px-2.5 py-1 rounded-full font-bold">5 Rolos</span>
              <span className="text-[10px] uppercase tracking-widest bg-blue-900/40 text-blue-300 border border-blue-700/30 px-2.5 py-1 rounded-full font-bold">Free Spins</span>
              <span className="text-[10px] uppercase tracking-widest bg-blue-900/40 text-blue-300 border border-blue-700/30 px-2.5 py-1 rounded-full font-bold">Wild Pescador</span>
            </div>

            <div className="text-blue-400 font-black text-sm group-hover:translate-x-2 transition-transform">
              Mergulhar →
            </div>
          </div>
        </button>
      </div>

      <p className="text-zinc-700 text-xs">Podes voltar ao salão a qualquer momento</p>
    </div>
  );
}

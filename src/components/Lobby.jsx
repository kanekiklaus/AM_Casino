// Lobby.jsx — Ecrã inicial quando nenhum jogo está seleccionado

import React from 'react';
import { useUser, tempColor } from '../context/UserContext';

const GAME_CARDS = [
  { id: 'highlow',    title: 'High-Low',     icon: '🃏', desc: 'Adivinha se a próxima carta é maior ou menor', color: 'from-blue-900/40 to-blue-800/20',     border: 'border-blue-800/30'   },
  { id: 'slots',      title: 'Slots',        icon: '🎰', desc: 'Slots clássica ou Big Bass Bonanza com bónus!', color: 'from-yellow-900/40 to-yellow-800/20', border: 'border-yellow-800/30' },
  { id: 'blackjack',  title: 'Blackjack',    icon: '♠️', desc: 'Chega a 21 antes da banca sem ultrapassar',   color: 'from-zinc-900/60 to-zinc-800/30',     border: 'border-zinc-700/30'   },
  { id: 'roulette',   title: 'Roleta',       icon: '🎡', desc: 'Roleta europeia com apostas múltiplas',       color: 'from-green-900/40 to-green-800/20',   border: 'border-green-800/30'  },
  { id: 'bookie',     title: 'Apostas',      icon: '📊', desc: 'Apostas desportivas com odds fixas',          color: 'from-purple-900/40 to-purple-800/20', border: 'border-purple-800/30' },
  { id: 'russian',    title: 'Roleta Russa', icon: '🔫', desc: 'Aposta a tua vida... e o teu dinheiro',      color: 'from-red-900/40 to-red-800/20',       border: 'border-red-800/30'    },
  { id: 'sobedesce',  title: 'Sobe e Desce', icon: '🃏', desc: 'Jogo de vazas português • 40 cartas • 4 jogadores', color: 'from-orange-900/40 to-orange-800/20', border: 'border-orange-800/30' },
];

export default function Lobby({ setActiveGame }) {
  const { balance, temperature, stats, history, openQuiz } = useUser();
  const color = tempColor(temperature);

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-10 animate-fadeSlideUp">

      {/* ── Banner de boas-vindas ── */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Bem-vindo ao <span className="text-red-600">TORN</span> Casino
        </h2>
        <p className="text-zinc-500 text-sm md:text-base">
          Saldo actual:{' '}
          <span className="text-green-400 font-mono font-bold">{balance.toLocaleString('pt-PT')}GB</span>
        </p>
      </div>

      {/* ── Estatísticas ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Saldo',     value: `${balance.toLocaleString('pt-PT')}GB`,                       color: 'text-green-400'  },
          { label: 'CPU Temp',  value: `${temperature}°C`,                                           color: ''               },
          { label: 'Ganhos',    value: `${stats.totalWon.toLocaleString('pt-PT')}GB`,                color: 'text-blue-400'  },
          { label: 'Perdas',    value: `${stats.totalLost.toLocaleString('pt-PT')}GB`,               color: 'text-red-400'   },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 md:p-5 text-center">
            <p
              className={`text-xl md:text-2xl font-black font-mono transition-colors duration-700 ${stat.color}`}
              style={stat.label === 'CPU Temp' ? { color, textShadow: `0 0 10px ${color}66` } : {}}
            >
              {stat.value}
            </p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Banner de Saldo Crítico — GB ── */}
      {balance < 2000 && (
        <div className="w-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Capacidade de Sistema Baixa</h3>
              <p className="text-red-300 text-xs italic">O teu armazenamento está a chegar ao fim ({balance} GB restantes). O sistema está a aquecer!</p>
            </div>
          </div>
          <button 
            onClick={openQuiz}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg transition shadow-lg cursor-pointer active:scale-95 uppercase tracking-widest"
          >
            📋 Pedir Mais GB (Quiz)
          </button>
        </div>
      )}

      {/* ── Grid de jogos ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Escolhe o teu Jogo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {GAME_CARDS.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`
                bg-gradient-to-br ${g.color} border ${g.border}
                rounded-xl p-5 md:p-6 text-left hover:scale-[1.02] transition-all
                hover:shadow-lg cursor-pointer active:scale-[0.98]
              `}
            >
              <span className="text-3xl md:text-4xl block mb-2 md:mb-3">{g.icon}</span>
              <h4 className="font-bold text-white text-base md:text-lg">{g.title}</h4>
              <p className="text-zinc-400 text-xs md:text-sm mt-1">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Histórico recente ── */}
      {history.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Histórico Recente</h3>
          <div className="glass-card divide-y divide-zinc-800 overflow-hidden">
            {history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 md:px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${h.type === 'win' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-zinc-300 truncate max-w-[120px] md:max-w-none">{h.game}</span>
                  <span className="text-xs text-zinc-600 hidden md:inline">{h.date}</span>
                </div>
                <span className={`font-mono font-bold text-sm flex-shrink-0 ${h.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {h.type === 'win' ? '+' : '-'}{h.amount.toLocaleString('pt-PT')}GB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

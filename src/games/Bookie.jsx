// games/Bookie.jsx — Sistema de Apostas Desportivas (Bookie)
// ─────────────────────────────────────────────────────────────────────────────
// O Bookie simula apostas desportivas com odds fixas:
//   - Lista de eventos com equipas/participantes e odds variadas
//   - O jogador escolhe o resultado em que quer apostar
//   - Odds usadas: formato decimal europeu (ex: 2.50 = retorno de 2.5x o apostado)
//   - Resultados são aleatórios, calibrados pelas odds (probabilidade implícita)

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

// ── Eventos disponíveis no Bookie ──────────────────────────────────────────
// Cada evento tem um desporto, dois participantes e as suas odds
// Probabilidade implícita de uma odd = 1 / odd (ex: 2.0 → 50%)
const EVENTS = [
  {
    id: 1,
    sport: '⚽ Futebol',
    match: 'Sporting vs Benfica',
    options: [
      { id: 'home', label: 'Sporting Ganha', odd: 2.40 },
      { id: 'draw', label: 'Empate',         odd: 3.10 },
      { id: 'away', label: 'Benfica Ganha',  odd: 2.80 },
    ],
  },
  {
    id: 2,
    sport: '🏀 Basquetebol',
    match: 'Lakers vs Celtics',
    options: [
      { id: 'home', label: 'Lakers',  odd: 1.75 },
      { id: 'away', label: 'Celtics', odd: 2.10 },
    ],
  },
  {
    id: 3,
    sport: '🎾 Ténis',
    match: 'Djokovic vs Alcaraz',
    options: [
      { id: 'home', label: 'Djokovic', odd: 1.55 },
      { id: 'away', label: 'Alcaraz',  odd: 2.50 },
    ],
  },
  {
    id: 4,
    sport: '🏎 Fórmula 1',
    match: 'GP de Monaco — Vencedor',
    options: [
      { id: 'ver', label: 'Verstappen', odd: 1.60 },
      { id: 'lec', label: 'Leclerc',    odd: 2.80 },
      { id: 'ham', label: 'Hamilton',   odd: 4.50 },
      { id: 'nor', label: 'Norris',     odd: 6.00 },
    ],
  },
  {
    id: 5,
    sport: '🥊 Boxe',
    match: 'Canelo vs GGG III',
    options: [
      { id: 'home', label: 'Canelo Ganha', odd: 1.85 },
      { id: 'away', label: 'GGG Ganha',    odd: 2.00 },
    ],
  },
];

// ── Simular resultado com base nas odds ──────────────────────────────────────
// Odds mais baixas = resultado mais provável (casino retém margem ~5%)
function simulateResult(options) {
  // Calcular probabilidades a partir das odds inversas
  const probabilities = options.map(o => 1 / o.odd);
  const total = probabilities.reduce((a, b) => a + b, 0);

  // Sortear um número aleatório entre 0 e total
  const roll = Math.random() * total;
  let cumulative = 0;

  for (let i = 0; i < options.length; i++) {
    cumulative += probabilities[i];
    if (roll <= cumulative) return options[i].id; // Este resultado ganhou
  }

  // Fallback (não deve acontecer)
  return options[options.length - 1].id;
}

// Componente de um evento desportivo
function EventCard({ event, selectedOption, stake, onSelect, onStakeChange, onBet, resolving, result }) {

  const isResolved = result !== null;

  return (
    <div className="glass-card p-5 space-y-3">
      {/* Cabeçalho do evento */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{event.sport}</span>
        {isResolved && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full
            ${result.won ? 'bg-green-600/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            {result.won ? `+${result.payout.toLocaleString('pt-PT')}GB` : 'Perdeu'}
          </span>
        )}
      </div>
      <h3 className="font-bold text-white">{event.match}</h3>

      {/* Opções de aposta */}
      <div className="flex gap-2 flex-wrap">
        {event.options.map(opt => {
          const isWinner = isResolved && result.winningId === opt.id;
          const isMyPick = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => !isResolved && onSelect(opt.id)}
              disabled={isResolved}
              className={`
                flex-1 min-w-[80px] py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer
                ${isWinner   ? 'bg-green-600 text-white ring-2 ring-green-400' : ''}
                ${isMyPick && !isResolved ? 'bg-red-600 text-white ring-2 ring-red-400' : ''}
                ${!isMyPick && !isWinner ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : ''}
                ${isResolved && !isWinner ? 'opacity-50' : ''}
              `}
            >
              <span className="block">{opt.label}</span>
              <span className="text-yellow-400 font-mono">{opt.odd.toFixed(2)}x</span>
            </button>
          );
        })}
      </div>

      {/* Aposta (só se um resultado foi seleccionado e ainda não resolvido) */}
      {selectedOption && !isResolved && (
        <div className="flex gap-2 items-center">
          <input
            type="number" min={10} step={10} value={stake}
            onChange={e => onStakeChange(Number(e.target.value))}
            placeholder="Valor (GB)"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-red-600"
          />
          <button
            onClick={onBet}
            disabled={resolving}
            className="py-1.5 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition cursor-pointer"
          >
            Apostar
          </button>
        </div>
      )}
    </div>
  );
}

// ── Componente principal Bookie ───────────────────────────────────────────────
export default function Bookie() {
  const { balance, updateBalance } = useUser();

  // Estado por evento: { eventId: { selectedOption, stake, resolving, result } }
  const [eventStates, setEventStates] = useState(
    Object.fromEntries(EVENTS.map(e => [e.id, { selectedOption: null, stake: 50, resolving: false, result: null }]))
  );

  // Actualizar estado de um evento específico
  const updateEvent = (eventId, patch) => {
    setEventStates(prev => ({
      ...prev,
      [eventId]: { ...prev[eventId], ...patch },
    }));
  };

  // Processar uma aposta num evento
  const placeBet = (event) => {
    const state = eventStates[event.id];
    if (!state.selectedOption || state.stake <= 0 || state.stake > balance) return;

    updateBalance(-state.stake, 'Bookie');
    updateEvent(event.id, { resolving: true });

    // Simular tempo de análise da aposta
    setTimeout(() => {
      const winningId = simulateResult(event.options);
      const won = winningId === state.selectedOption;
      const winOption = event.options.find(o => o.id === state.selectedOption);
      const payout = won ? Math.floor(state.stake * winOption.odd) : 0;

      if (won) updateBalance(payout, 'Bookie');

      updateEvent(event.id, {
        resolving: false,
        result: { won, winningId, payout },
      });
    }, 1500);
  };

  // Repor um evento para novo jogo
  const resetEvent = (eventId) => {
    updateEvent(eventId, { selectedOption: null, stake: 50, resolving: false, result: null });
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 animate-fadeSlideUp">
      <div className="text-center">
        <h2 className="text-4xl font-black uppercase tracking-widest text-purple-400"
            style={{ fontFamily: "'Outfit', sans-serif" }}>📊 Bookie</h2>
        <p className="text-zinc-500 text-sm mt-1">Apostas desportivas com odds fixas</p>
      </div>

      {/* Lista de eventos */}
      <div className="w-full max-w-2xl space-y-4">
        {EVENTS.map(event => {
          const state = eventStates[event.id];
          return (
            <div key={event.id}>
              <EventCard
                event={event}
                selectedOption={state.selectedOption}
                stake={state.stake}
                onSelect={(optId) => updateEvent(event.id, { selectedOption: optId })}
                onStakeChange={(amt) => updateEvent(event.id, { stake: amt })}
                onBet={() => placeBet(event)}
                resolving={state.resolving}
                result={state.result}
              />
              {/* Botão para repor o evento após resolução */}
              {state.result && (
                <button
                  onClick={() => resetEvent(event.id)}
                  className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                >
                  ↺ Nova Aposta
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

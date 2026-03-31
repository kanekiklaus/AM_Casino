// games/HighLow.jsx
// ────────────────────────────────────────────────────────────────────────────
// Jogo HIGH-LOW (Maior/Menor):
//   1. É revelada uma carta secreta ao centro.
//   2. O jogador aposta se a próxima carta será MAIOR ou MENOR.
//   3. Se acertar, duplica a aposta; se errar, perde.
//   4. Pode "retirar" a qualquer momento para receber os ganhos acumulados.
// ────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

// ── Baralho simplificado (A=1, J=11, Q=12, K=13) ────────────────────────────
const DECK = [
  {label: 'A', value: 1}, {label: '2', value: 2}, {label: '3', value: 3},
  {label: '4', value: 4}, {label: '5', value: 5}, {label: '6', value: 6},
  {label: '7', value: 7}, {label: '8', value: 8}, {label: '9', value: 9},
  {label: '10', value: 10}, {label: 'J', value: 11}, {label: 'Q', value: 12},
  {label: 'K', value: 13},
];

// Naipes disponíveis para exibição visual
const SUITS = ['♠', '♥', '♦', '♣'];

// Retorna uma carta aleatória do baralho
function randomCard() {
  const card  = DECK[Math.floor(Math.random() * DECK.length)]; // Carta aleatória
  const suit  = SUITS[Math.floor(Math.random() * SUITS.length)]; // Naipe aleatório
  return { ...card, suit }; // spread operator: copia o objecto da carta e adiciona o naipe
}

// Componente visual de uma carta de baralho
function PlayingCard({ card, hidden = false }) {
  // Naipes vermelhos têm cor diferente
  const isRed = card && (card.suit === '♥' || card.suit === '♦');

  return (
    <div className={`
      w-24 h-36 rounded-xl border-2 flex flex-col items-center justify-center
      font-bold text-3xl shadow-xl transition-all duration-300
      ${hidden
        ? 'bg-zinc-800 border-zinc-700 text-zinc-600'  // Carta virada a baixo
        : `bg-white border-zinc-300 ${isRed ? 'text-red-600' : 'text-zinc-900'}` // Carta visível
      }
    `}>
      {hidden ? (
        // Carta desconhecida — mostrar padrão XadreZ
        <span className="text-4xl opacity-30">🂠</span>
      ) : (
        <>
          {/* Valor da carta */}
          <span className="text-2xl font-black">{card.label}</span>
          {/* Naipe da carta */}
          <span className="text-xl">{card.suit}</span>
        </>
      )}
    </div>
  );
}

// ── Componente principal High-Low ─────────────────────────────────────────────
export default function HighLow() {
  const { balance, updateBalance } = useUser(); // Do contexto global

  // Estado da aposta inicial
  const [bet, setBet] = useState(100);

  // Carta actualmente virada (visível ao jogador)
  const [currentCard, setCurrentCard] = useState(null);

  // Próxima carta a ser revelada após o jogador escolher
  const [nextCard, setNextCard] = useState(null);

  // Multiplicador acumulado (começa em 1x, sobe a cada round ganho)
  const [multiplier, setMultiplier] = useState(1);

  // Prémio potencial actual = bet * multiplier
  const [pot, setPot] = useState(0);

  // 'idle' | 'playing' | 'reveal' | 'gameover'
  const [phase, setPhase] = useState('idle');

  // Mensagem de resultado (ex: "Correcto! +2x")
  const [resultMsg, setResultMsg] = useState('');

  // ── Iniciar uma nova ronda ─────────────────────────────────────────────────
  const startGame = () => {
    if (bet > balance) return; // Não pode apostar mais do que tem
    updateBalance(-bet, 'High-Low'); // Debita a aposta do saldo
    const first = randomCard();     // Gera a primeira carta
    setCurrentCard(first);
    setNextCard(null);
    setMultiplier(1);               // Reset do multiplicador
    setPot(bet);                    // Prémio inicial = valor apostado
    setPhase('playing');
    setResultMsg('');
  };

  // ── Lógica de escolha (Higher ou Lower) ──────────────────────────────────
  const guess = (direction) => {
    const next = randomCard(); // Carta seguinte aleatória
    setNextCard(next);
    setPhase('reveal'); // Revelar a próxima carta

    // Comparar cartas — se iguais, tratamos como derrota para simplificar
    let correct = false;
    if (direction === 'high'  && next.value > currentCard.value)  correct = true;
    if (direction === 'low'   && next.value < currentCard.value)  correct = true;

    if (correct) {
      // Acertou: aumenta o multiplicador e o prémio
      const newMult = multiplier + 1; // Cada vitória adiciona 1x
      const newPot  = pot * 2;        // Prémio duplica a cada acerto
      setMultiplier(newMult);
      setPot(newPot);
      setResultMsg(`✅ Correcto! Prémio: ${newPot.toLocaleString('pt-PT')}GB`);
    } else {
      // Errou: perde tudo
      setPot(0);
      setPhase('gameover');
      setResultMsg('❌ Errado! Perdeste tudo.');
    }
  };

  // ── Retirar (Cash Out) — recebe o prémio acumulado ─────────────────────────
  const cashOut = () => {
    updateBalance(pot, 'High-Low'); // Credita o prémio
    setResultMsg(`💰 Retiraste ${pot.toLocaleString('pt-PT')}GB!`);
    setPhase('gameover');
  };

  // ── Continuar (após revelação correcta) ─────────────────────────────────
  const continueGame = () => {
    setCurrentCard(nextCard); // A próxima carta torna-se a actual
    setNextCard(null);
    setPhase('playing');
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 animate-fadeSlideUp">

      {/* ── Título ─────────────────────────────────────────── */}
      <div className="text-center">
        <h2 className="text-4xl font-black uppercase tracking-widest text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}>
          High-Low
        </h2>
        <p className="text-zinc-500 text-sm mt-1">Adivinhe se a próxima carta é MAIOR ou MENOR</p>
      </div>

      {/* ── Área de cartas ─────────────────────────────────── */}
      <div className="flex items-center gap-8">
        {/* Carta actual */}
        <div className="flex flex-col items-center gap-2">
          <PlayingCard card={currentCard} hidden={!currentCard} />
          <span className="text-xs text-zinc-500">Carta Actual</span>
        </div>

        {/* VS */}
        <span className="text-zinc-600 font-bold text-xl">VS</span>

        {/* Próxima carta (escondida ou revelada) */}
        <div className="flex flex-col items-center gap-2">
          <PlayingCard card={nextCard} hidden={!nextCard} />
          <span className="text-xs text-zinc-500">Próxima</span>
        </div>
      </div>

      {/* ── Info do prémio actual ─────────────────────────── */}
      {phase !== 'idle' && (
        <div className="glass-card px-8 py-4 flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400 font-mono">
              {pot.toLocaleString('pt-PT')} GB
            </p>
            <p className="text-xs text-zinc-500">Prémio Actual</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="text-2xl font-bold text-yellow-400">{multiplier}x</p>
            <p className="text-xs text-zinc-500">Multiplicador</p>
          </div>
        </div>
      )}

      {/* ── Mensagem de resultado ─────────────────────────── */}
      {resultMsg && (
        <p className="text-lg font-semibold text-center animate-pulseSoft">{resultMsg}</p>
      )}

      {/* ── Controlos ────────────────────────────────────── */}
      <div className="w-full max-w-md space-y-4">

        {/* Fase inactiva: configurar aposta e começar */}
        {(phase === 'idle' || phase === 'gameover') && (
          <>
            <div className="flex items-center gap-3">
              <label className="text-zinc-400 text-sm w-20">Dados (GB)</label>
              <input
                type="number"
                min={10}
                max={balance}
                step={10}
                value={bet}
                onChange={e => setBet(Number(e.target.value))} // Atualiza bet ao digitar
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              onClick={startGame}
              disabled={bet > balance || bet <= 0}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all glow-red cursor-pointer"
            >
              🃏 Iniciar Jogo
            </button>
          </>
        )}

        {/* Fase de jogar: escolher Higher ou Lower */}
        {phase === 'playing' && (
          <div className="flex gap-4">
            <button
              onClick={() => guess('high')}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              ⬆ HIGHER
            </button>
            <button
              onClick={() => guess('low')}
              className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              ⬇ LOWER
            </button>
          </div>
        )}

        {/* Fase de revelação (depois de uma escolha correcta) */}
        {phase === 'reveal' && (
          <div className="flex gap-4">
            <button
              onClick={cashOut}
              className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              💰 Retirar {pot.toLocaleString('pt-PT')}GB
            </button>
            <button
              onClick={continueGame}
              className="flex-1 py-4 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              ▶ Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

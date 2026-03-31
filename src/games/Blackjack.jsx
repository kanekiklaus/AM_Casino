// games/Blackjack.jsx
// ────────────────────────────────────────────────────────────────────────────
// Jogo BLACKJACK (21):
//   Regras simplificadas (casino standard):
//   - O jogador e a banca recebem 2 cartas (1 da banca fica escondida).
//   - O jogador pode "HIT" (pedir carta) ou "STAND" (parar).
//   - Objectivo: chegar o mais perto possível de 21 sem ultrapassar (bust).
//   - Blackjack natural (Ás + figura na mão inicial) paga 1.5x.
//   - A banca tem de pedir carta abaixo de 17 (regra da banca).
// ────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

// ── Baralho completo (4 naipes × 13 cartas = 52 cartas) ─────────────────────
const VALUES  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS   = ['♠','♥','♦','♣'];

// Gerar o baralho completo e baralhar com Fisher-Yates
function createDeck() {
  // flatMap cria uma carta para cada combinação valor × naipe
  const deck = VALUES.flatMap(v => SUITS.map(s => ({ value: v, suit: s })));

  // Fisher-Yates shuffle — algoritmo de mistura eficiente e sem bias
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Trocar posições
  }
  return deck;
}

// Calcular o valor numérico de uma mão de cartas
// O Ás vale 11, mas passa a 1 se a mão ultrapassar 21
function calcHandValue(hand) {
  let total = 0;
  let aces  = 0; // Contar Ases separadamente para flexibilidade

  for (const card of hand) {
    if (card.hidden) continue; // Ignorar cartas escondidas da banca
    if (card.value === 'A') {
      aces++;
      total += 11; // Ás começa como 11
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      total += 10; // Figuras valem 10
    } else {
      total += Number(card.value);
    }
  }

  // Se a mão exceder 21 e houver Ases, convertê-los para 1
  while (total > 21 && aces > 0) {
    total -= 10; // Reduzir de 11 para 1 = diferença de 10
    aces--;
  }

  return total;
}

// Componente visual de uma carta
function Card({ card }) {
  // Carta escondida (costas)
  if (card.hidden) {
    return (
      <div className="w-16 h-24 rounded-lg bg-zinc-800 border-2 border-zinc-600
                      flex items-center justify-center text-2xl shadow-md">
        🂠
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div className={`
      w-16 h-24 rounded-lg bg-white border-2 border-zinc-200
      flex flex-col items-center justify-center shadow-md
      ${isRed ? 'text-red-600' : 'text-zinc-900'}
    `}>
      <span className="text-sm font-black leading-none">{card.value}</span>
      <span className="text-lg leading-none">{card.suit}</span>
    </div>
  );
}

// Componente para uma mão (conjunto de cartas)
function Hand({ cards, label, value, isDealer }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {cards.map((card, i) => <Card key={i} card={card} />)}
      </div>
      {/* Mostrar valor da mão */}
      <div className="text-center">
        <span className="text-xs text-zinc-500">{label}: </span>
        <span className={`font-bold ${value > 21 ? 'text-red-500' : 'text-white'}`}>
          {value > 21 ? `${value} (BUST)` : value}
        </span>
      </div>
    </div>
  );
}

// ── Componente principal Blackjack ────────────────────────────────────────────
export default function Blackjack() {
  const { balance, updateBalance } = useUser();

  const [bet, setBet]           = useState(100);
  const [deck, setDeck]         = useState([]);    // Baralho restante
  const [playerHand, setPlayer] = useState([]);    // Mão do jogador
  const [dealerHand, setDealer] = useState([]);    // Mão da banca
  const [phase, setPhase]       = useState('idle'); // 'idle'|'playing'|'over'
  const [message, setMessage]   = useState('');     // Resultado final

  // ── Tirar uma carta do topo do baralho ───────────────────────────────────
  // Retorna { card, remainingDeck }
  const drawCard = (d, hidden = false) => {
    const [card, ...rest] = d; // Desestruturar: first + resto
    return { card: { ...card, hidden }, deck: rest };
  };

  // ── Iniciar uma mão de Blackjack ─────────────────────────────────────────
  const deal = () => {
    if (bet > balance || bet <= 0) return;
    updateBalance(-bet, 'Blackjack'); // Debitar aposta

    // Criar e baralhar novo baralho
    let d = createDeck();

    // Distribuir 2 cartas a cada um (alternando como num jogo real)
    let p1, p2, b1, b2;
    ({ card: p1, deck: d } = drawCard(d));         // Jogador carta 1 (visível)
    ({ card: b1, deck: d } = drawCard(d));         // Banca carta 1 (visível)
    ({ card: p2, deck: d } = drawCard(d));         // Jogador carta 2 (visível)
    ({ card: b2, deck: d } = drawCard(d, true));   // Banca carta 2 (ESCONDIDA)

    const newPlayer = [p1, p2];
    const newDealer = [b1, b2];

    setDeck(d);
    setPlayer(newPlayer);
    setDealer(newDealer);
    setPhase('playing');
    setMessage('');

    // Verificar Blackjack natural (21 com 2 cartas)
    const pVal = calcHandValue(newPlayer);
    if (pVal === 21) {
      // Paga 1.5x (blackjack bonus) — arredondado para baixo
      finishGame(newPlayer, newDealer, d, true);
    }
  };

  // ── HIT: pedir mais uma carta ────────────────────────────────────────────
  const hit = () => {
    let d = [...deck];
    let newCard;
    ({ card: newCard, deck: d } = drawCard(d));
    const newHand = [...playerHand, newCard];
    setPlayer(newHand);
    setDeck(d);

    // Se ultrapassar 21 → BUST (derrota imediata)
    if (calcHandValue(newHand) > 21) {
      revealDealer(newHand, dealerHand, d); // Mostrar carta escondida
      endRound('bust', newHand, dealerHand);
    }
  };

  // ── STAND: parar e deixar a banca jogar ─────────────────────────────────
  const stand = () => {
    finishGame(playerHand, dealerHand, deck);
  };

  // ── Revelar a carta escondida da banca ───────────────────────────────────
  const revealDealer = (ph, dh, d) => {
    // Tornar todas as cartas da banca visíveis (hidden: false)
    const revealed = dh.map(c => ({ ...c, hidden: false }));
    setDealer(revealed);
    return revealed;
  };

  // ── Lógica da banca: pedir até ≥17 ──────────────────────────────────────
  const finishGame = (ph, dh, d, naturalBJ = false) => {
    let revealed = dh.map(c => ({ ...c, hidden: false })); // Revelar carta oculta
    let currentDeck = [...d];

    // Banca pede cartas até ter 17 ou mais (regra oficial)
    while (calcHandValue(revealed) < 17) {
      let newCard;
      ({ card: newCard, deck: currentDeck } = drawCard(currentDeck));
      revealed = [...revealed, newCard];
    }

    setDealer(revealed);
    setDeck(currentDeck);

    const pVal = calcHandValue(ph);
    const dVal = calcHandValue(revealed);

    endRound(null, ph, revealed, pVal, dVal, naturalBJ);
  };

  // ── Determinar vencedor e pagar prémio ───────────────────────────────────
  const endRound = (forcedResult, ph, dh, pVal, dVal, naturalBJ = false) => {
    setPhase('over');

    let msg = '';
    let payout = 0;

    if (forcedResult === 'bust') {
      // Jogador ultrapassou 21
      msg = '💥 Bust! Perdeste!';
      payout = 0;
    } else if (naturalBJ && pVal === 21) {
      // Blackjack natural — paga 1.5x
      payout = bet + Math.floor(bet * 1.5);
      msg = '🃏 BLACKJACK! Ganhas 1.5x!';
    } else if (dVal > 21) {
      // Banca fez bust
      payout = bet * 2;
      msg = '🎉 Banca bust! Ganhas!';
    } else if (pVal > dVal) {
      // Jogador mais perto de 21
      payout = bet * 2;
      msg = `🎉 Ganhas! ${pVal} vs ${dVal}`;
    } else if (pVal === dVal) {
      // Empate — devolve a aposta
      payout = bet;
      msg = `🤝 Empate! ${pVal} vs ${dVal}`;
    } else {
      // Banca ganha
      msg = `😔 Perdeste! ${pVal} vs ${dVal}`;
      payout = 0;
    }

    setMessage(msg);
    if (payout > 0) {
      updateBalance(payout, 'Blackjack');
    }
  };

  // Calcular valores actuais das mãos para exibição
  const playerValue = calcHandValue(playerHand);
  const dealerValue = dealerHand.some(c => !c.hidden)
    ? calcHandValue(dealerHand) : '?';

  return (
    // ── Mesa de Blackjack como cenário ────────────────────────────────────────
    <div
      className="relative flex flex-col items-center gap-8 p-6 md:p-10 animate-fadeSlideUp min-h-full"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #14532d 0%, #0f3d22 50%, #091f12 100%)',
      }}
    >
      {/* Feltro — textura diagonal subtil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(
            45deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px
          )`,
        }}
      />
      {/* Borda dourada superior e inferior */}
      <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent pointer-events-none" />
      {/* Vinheta de profundidade */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* ── Título ─────────────────────────────────────────── */}
      <div className="relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Outfit', sans-serif" }}>
          ♠ Blackjack
        </h2>
        <p className="text-green-300/60 text-xs uppercase tracking-widest mt-1">Mesa VIP • TORN Casino</p>
      </div>

      {/* ── Área Central da Mesa ──────────────────────────────── */}
      {/* Elipse decorativa no centro da mesa (look clássico) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,90%)] h-64 border-2 border-yellow-600/20 rounded-[50%] pointer-events-none opacity-40" />

      {/* ── Mesa de jogo ──────────────────────────────────── */}
      {phase !== 'idle' && (
        <div className="relative z-10 w-full max-w-lg bg-black/30 backdrop-blur-sm border border-yellow-700/20 p-6 md:p-8 rounded-2xl flex flex-col items-center gap-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

          {/* Banca */}
          <Hand
            cards={dealerHand}
            label="Banca"
            value={dealerValue}
            isDealer
          />

          {/* Linha divisória dourada */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent" />

          {/* Jogador */}
          <Hand
            cards={playerHand}
            label="Tu"
            value={playerValue}
          />
        </div>
      )}

      {/* ── Mensagem de resultado ─────────────────────────── */}
      {message && (
        <div className={`
          relative z-10 px-6 py-3 rounded-xl font-bold text-lg animate-pulseSoft
          backdrop-blur-sm
          ${message.includes('Ganhas') || message.includes('BLACKJACK')
            ? 'bg-green-600/30 text-green-300 border border-green-500/40'
            : message.includes('Empate')
              ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/40'
              : 'bg-red-900/30 text-red-400 border border-red-700/40'}
        `}>
          {message}
        </div>
      )}

      {/* ── Controlos ────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm space-y-4">

        {/* Fase inactiva ou fim de jogo: configurar aposta */}
        {(phase === 'idle' || phase === 'over') && (
          <>
            <div className="flex-1 space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Processamento (GB)</label>
            <input
              type="number" min={10} max={balance} step={10}
              value={bet}
              onChange={e => setBet(Number(e.target.value))}
              disabled={gameActive}
              className="w-full h-10 bg-black/40 border border-yellow-800/20 rounded-lg px-3 text-white font-mono focus:outline-none focus:border-yellow-500 disabled:opacity-50"
            />
          </div>
            <div className="flex gap-2">
              {[50, 100, 250, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  disabled={gameActive || v > balance}
                  className="flex-1 py-2 bg-black/40 hover:bg-black/60 disabled:opacity-30 rounded-lg border border-yellow-800/20 text-yellow-500 font-bold text-xs transition active:scale-95 cursor-pointer"
                >
                  {v} GB
                </button>
              ))}
            </div>
            <button
              onClick={deal}
              disabled={bet > balance || bet <= 0}
              className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-40 text-black font-black text-lg rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(202,138,4,0.4)] hover:-translate-y-0.5 active:scale-95"
            >
              ♠ Distribuir Cartas
            </button>
          </>
        )}

        {/* Fase de jogo: Hit ou Stand */}
        {phase === 'playing' && (
          <div className="flex gap-4">
            <button
              onClick={hit}
              className="flex-1 py-4 bg-blue-600/80 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all cursor-pointer border border-blue-400/30 backdrop-blur-sm active:scale-95"
            >
              HIT +1
            </button>
            <button
              onClick={stand}
              className="flex-1 py-4 bg-red-700/80 hover:bg-red-600 text-white font-bold text-lg rounded-xl transition-all cursor-pointer border border-red-500/30 backdrop-blur-sm active:scale-95"
            >
              STAND
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

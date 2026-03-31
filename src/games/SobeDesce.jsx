// games/SobeDesce.jsx
// ──────────────────────────────────────────────────────────────────────────────
// SOBE E DESCE — Jogo de vazas português
//
// REGRAS COMPLETAS:
//   • 4 jogadores (1 humano + 3 bots)
//   • Baralho de 40 cartas (sem 8, 9, 10)
//   • Ordem: 2 < 3 < 4 < 5 < 6 < Q < J < K < 7 < A  (em cada naipe)
//   • No início da mão, sorteia-se um naipe como trunfo
//   • Trunfo bate qualquer carta não-trunfo
//   • PONTUAÇÃO por mão:
//       -1 por vaza ganha
//       -2 se trunfo = ♣ (Paus) e a vaza foi ganha com trunfo
//       +5 se não ganhou nenhuma vaza na mão
//       +10 se não ganhou nenhuma vaza E trunfo = ♣ (Paus)
//   • Ganha quem tiver 0 pontos (imediato) ou menos ao atingir limite
//   • Aposta: valor fixo descontado antes de cada mão; vence o humano se tiver 0 pts
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../context/UserContext';

// ── Baralho de 40 cartas ─────────────────────────────────────────────────────
const SUITS  = ['♠', '♥', '♦', '♣'];   // Espadas, Copas, Ouros, Paus
const VALUES = ['2','3','4','5','6','Q','J','K','7','A']; // do mais fraco ao mais forte
const SUIT_NAMES = { '♠': 'Espadas', '♥': 'Copas', '♦': 'Ouros', '♣': 'Paus' };

// Valor numérico de uma carta (0=mais fraco, 9=mais forte)
function cardStrength(value) { return VALUES.indexOf(value); }

// Comparar cartas numa vaza dado o naipe de abertura e o trunfo
// Retorna true se a carta A bate a carta B
function beats(a, b, leadSuit, trump) {
  const aIsTrump = a.suit === trump;
  const bIsTrump = b.suit === trump;
  if (aIsTrump && !bIsTrump) return true;
  if (!aIsTrump && bIsTrump) return false;
  // Ambos trunfo ou ambos não-trunfo:
  if (a.suit === b.suit) return cardStrength(a.value) > cardStrength(b.value);
  // Seguiu naipe? (a não seguiu, b seguiu)
  if (b.suit === leadSuit) return false;
  return true;
}

function createDeck() {
  const deck = SUITS.flatMap(s => VALUES.map(v => ({ suit: s, value: v })));
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ── IA dos Bots: escolhe a carta a jogar ─────────────────────────────────────
// Estratégia simples: tenta não ganhar a vaza se possível
function botPlay(hand, trickSoFar, trump) {
  const leadSuit = trickSoFar.length > 0 ? trickSoFar[0].card.suit : null;

  // Filtrar cartas do naipe de abertura (obrigatório jogar se tiver)
  const sameSuit = leadSuit ? hand.filter(c => c.suit === leadSuit) : [];
  const eligible = sameSuit.length > 0 ? sameSuit : hand;

  // Determinar se alguém já ganhou com trunfo
  const currentWinnerCard = trickSoFar.reduce((best, t) => {
    if (!best) return t.card;
    return beats(t.card, best, leadSuit, trump) ? t.card : best;
  }, null);

  const isCurrentlyWinning = (c) => {
    if (!currentWinnerCard) return true; // primeira carta
    return beats(c, currentWinnerCard, leadSuit || c.suit, trump);
  };

  // Preferir NÃO ganhar: jogar a carta mais fraca que não vença
  const losing = eligible.filter(c => !isCurrentlyWinning(c));
  if (losing.length > 0) {
    // Mais fraca das perdedoras
    return losing.reduce((a, b) => cardStrength(a.value) < cardStrength(b.value) ? a : b);
  }

  // Não há jeito — jogar a mais fraca disponível
  return eligible.reduce((a, b) => cardStrength(a.value) < cardStrength(b.value) ? a : b);
}

// ── Componente Carta Visual ──────────────────────────────────────────────────
function CardComp({ card, onClick, selected, disabled, small = false }) {
  if (!card) return null;
  const isRed = card.suit === '♥' || card.suit === '♦';
  const isTrumpSuit = card._isTrump;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-between
        ${small ? 'w-9 h-13 text-xs p-0.5' : 'w-12 h-18 md:w-14 md:h-20 text-sm p-1'}
        rounded-lg border-2 bg-white shadow-md
        transition-all duration-200 cursor-pointer select-none
        ${selected   ? 'border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.8)] -translate-y-3' : ''}
        ${!selected && !disabled ? 'hover:-translate-y-2 hover:shadow-lg border-zinc-300' : ''}
        ${disabled   ? 'opacity-60 cursor-default border-zinc-200' : ''}
        ${isTrumpSuit && !disabled ? 'border-purple-400/60' : ''}
      `}
      style={{ minWidth: small ? '2.25rem' : '3rem', height: small ? '3.25rem' : '5rem' }}
    >
      <span className={`font-black leading-none ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
        {card.value}
      </span>
      <span className={`text-base md:text-lg leading-none ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
        {card.suit}
      </span>
    </button>
  );
}

// ── Componente Carta no Centro (vaza) ──────────────────────────────────────
function TrickCard({ entry }) {
  if (!entry) return <div className="w-12 h-20 rounded-lg border-2 border-dashed border-zinc-700/30 bg-zinc-900/20" />;
  const isRed = entry.card.suit === '♥' || entry.card.suit === '♦';
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] text-zinc-500 uppercase tracking-wider truncate max-w-[52px]">{entry.name}</span>
      <div className={`w-12 h-18 rounded-lg bg-white border-2 border-zinc-200 flex flex-col items-center justify-between p-1 shadow-md ${entry.isWinner ? 'border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.6)]' : ''}`}>
        <span className={`text-sm font-black leading-none ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{entry.card.value}</span>
        <span className={`text-lg leading-none ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{entry.card.suit}</span>
      </div>
    </div>
  );
}

// ── Nomes dos bots ──────────────────────────────────────────────────────────
const BOT_NAMES = ['🤖 MAX', '🎩 DUQUE', '🧠 SOFIA'];
const PLAYER_NAMES = ['Tu', ...BOT_NAMES];

// ── Componente Principal ──────────────────────────────────────────────────────
export default function SobeDesce() {
  const { balance, updateBalance } = useUser();

  const [mode, setMode]       = useState(null);   // null | 'bots' | 'multiplayer'
  const [roomCode, setRoomCode] = useState('');     // Código da sala
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);

  const [bet, setBet]       = useState(200);
  const [phase, setPhase]   = useState('idle'); // idle | waiting | playing | trick_end | hand_end | game_end

  // Gera um código de sala aleatório
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setRoomCode(code);
    setIsRoomCreator(true);
    setMode('multiplayer');
    setPhase('waiting');
  };

  // Jogo
  const [hands, setHands]         = useState([[], [], [], []]);   // mão de cada jogador [humano, b1, b2, b3]
  const [trump, setTrump]         = useState(null);               // naipe trunfo da mão
  const [scores, setScores]       = useState([25, 25, 25, 25]);       // pontuação total (começam com 25)
  const [tricks, setTricks]       = useState([0, 0, 0, 0]);       // vazas ganhas nesta mão
  const [currentTrick, setCurrentTrick] = useState([]);           // {playerIdx, card, name}
  const [leadPlayer, setLeadPlayer]     = useState(0);            // quem abre a vaza
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedCard, setSelectedCard]   = useState(null);
  const [log, setLog]             = useState([]);
  const [showResults, setShowResults] = useState(null); // resultados da mão
  const [gameWinner, setGameWinner]   = useState(null);

  // Limite de pontuação máxima (perde ao atingir)
  const SCORE_LIMIT = 50; // Limite para perder (sobe demasiado)

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 10));

  // ── Iniciar mão ─────────────────────────────────────────────────────────────
  const dealHand = useCallback(() => {
    if (bet > balance) return;
    updateBalance(-bet, 'Sobe e Desce');

    const deck    = createDeck(); // 40 cartas
    const newTrump = SUITS[Math.floor(Math.random() * SUITS.length)];

    // Distribuir 10 cartas a cada jogador
    const newHands = [
      deck.slice(0, 10),
      deck.slice(10, 20),
      deck.slice(20, 30),
      deck.slice(30, 40),
    ];

    // Marcar cartas trunfo (apenas visual)
    const marked = newHands.map(h => h.map(c => ({ ...c, _isTrump: c.suit === newTrump })));

    setHands(marked);
    setTrump(newTrump);
    setTricks([0, 0, 0, 0]);
    setCurrentTrick([]);
    setLeadPlayer(0);
    setCurrentPlayer(0);
    setSelectedCard(null);
    setLog([]);
    setShowResults(null);
    setPhase('playing');
    addLog(`Mão iniciada! Trunfo: ${newTrump} ${SUIT_NAMES[newTrump]}`);
  }, [bet, balance, updateBalance]);

  // ── Jogar carta (humano) ────────────────────────────────────────────────────
  const playCard = useCallback((cardIdx) => {
    if (phase !== 'playing' || currentPlayer !== 0) return;
    if (selectedCard === cardIdx) {
      // Confirmar jogada
      const card        = hands[0][cardIdx];
      const leadSuit    = currentTrick.length > 0 ? currentTrick[0].card.suit : null;

      // Validar: deve seguir naipe se tiver
      if (leadSuit) {
        const hasSuit = hands[0].some(c => c.suit === leadSuit);
        if (hasSuit && card.suit !== leadSuit) {
          addLog('⚠️ Tens de jogar ' + leadSuit + ' se tiveres!');
          return;
        }
      }

      const newTrick = [...currentTrick, { playerIdx: 0, card, name: 'Tu' }];
      const newHand  = hands[0].filter((_, i) => i !== cardIdx);

      setHands(prev => { const h = [...prev]; h[0] = newHand; return h; });
      setCurrentTrick(newTrick);
      setSelectedCard(null);

      // Se 4 cartas na vaza → proceder para bots e depois resolver
      if (newTrick.length >= 4 || (leadPlayer !== 0 && newTrick.length === 4 - leadPlayer)) {
        // Próximo: bots
        continueTrick(newTrick, newHand, 1);
      } else {
        setCurrentPlayer(1); // Bot 1
      }
    } else {
      setSelectedCard(cardIdx);
    }
  }, [phase, currentPlayer, selectedCard, hands, currentTrick, leadPlayer]);

  // ── Bot joga automaticamente ─────────────────────────────────────────────────
  const continueTrick = useCallback((trick, _unusedHand, nextBot) => {
    // Jogar todos os bots seguintes na ordem circular a partir de leadPlayer
    // Os jogadores jogam na ordem: leadPlayer, (leadPlayer+1)%4, ...
    let t = [...trick];
    let h = hands.map(h => [...h]);
    const order = [0, 1, 2, 3].map(i => (leadPlayer + i) % 4);
    const played = new Set(t.map(e => e.playerIdx));

    // Simular bots imediatamente (com delay visual)
    const playNext = (remaining) => {
      if (remaining.length === 0 || t.length >= 4) {
        // Vaza completa!
        resolveTrick(t, h);
        return;
      }
      const bot = remaining[0];
      if (bot === 0) { playNext(remaining.slice(1)); return; } // skip humano

      setTimeout(() => {
        const choice = botPlay(h[bot], t, trump);
        h[bot] = h[bot].filter(c => !(c.suit === choice.suit && c.value === choice.value));
        t = [...t, { playerIdx: bot, card: choice, name: BOT_NAMES[bot - 1] }];
        setHands([...h]);
        setCurrentTrick([...t]);
        if (t.length >= 4) {
          resolveTrick(t, h);
        } else {
          playNext(remaining.slice(1));
        }
      }, 600);
    };

    const stillToPlay = order.filter(p => !played.has(p));
    playNext(stillToPlay);
  }, [hands, trump, leadPlayer]);

  // ── Resolver vaza ─────────────────────────────────────────────────────────
  const resolveTrick = useCallback((trick, finalHands) => {
    const leadSuit = trick[0].card.suit;
    let winner = trick[0];
    for (let i = 1; i < trick.length; i++) {
      if (beats(trick[i].card, winner.card, leadSuit, trump)) {
        winner = trick[i];
      }
    }

    const wi = winner.playerIdx;
    const newTricks = [...tricks];
    newTricks[wi]++;

    const trickWithWinner = trick.map(t => ({ ...t, isWinner: t.playerIdx === wi }));
    setCurrentTrick(trickWithWinner);
    setTricks(newTricks);
    addLog(`${winner.name} ganhou a vaza com ${winner.card.value}${winner.card.suit}`);

    setTimeout(() => {
      // Mão terminou?
      if (finalHands[0].length === 0) {
        endHand(newTricks);
      } else {
        // Próxima vaza — vencedor abre
        setLeadPlayer(wi);
        setCurrentPlayer(wi === 0 ? 0 : wi); // se bot venceu, continua automaticamente
        setCurrentTrick([]);
        setPhase('playing');

        if (wi !== 0) {
          // Bot abre — prosseguir automaticamente
          setTimeout(() => startBotLead(wi, finalHands, newTricks), 500);
        }
      }
    }, 1500);
  }, [tricks, trump]);

  // ── Bot abre uma nova vaza ────────────────────────────────────────────────
  const startBotLead = useCallback((leadBot, finalHands, currentTricks) => {
    let t = [];
    let h = finalHands.map(hh => [...hh]);
    const order = [0, 1, 2, 3].map(i => (leadBot + i) % 4);

    const playNext = (remaining) => {
      if (remaining.length === 0 || t.length >= 4) {
        if (t.length >= 4) resolveTrick(t, h);
        return;
      }
      const p = remaining[0];
      if (p === 0) {
        // Chegou ao humano — parar e esperar input
        setCurrentTrick([...t]);
        setCurrentPlayer(0);
        setLeadPlayer(leadBot);
        setPhase('playing');
        return;
      }
      setTimeout(() => {
        const choice = botPlay(h[p], t, trump);
        h[p] = h[p].filter(c => !(c.suit === choice.suit && c.value === choice.value));
        t = [...t, { playerIdx: p, card: choice, name: BOT_NAMES[p - 1] }];
        setHands([...h]);
        setCurrentTrick([...t]);
        playNext(remaining.slice(1));
      }, 600);
    };

    playNext(order);
  }, [trump, resolveTrick]);

  // ── Fim da mão — calcular pontuação ─────────────────────────────────────────
  const endHand = useCallback((finalTricks) => {
    const isTrumpPaus = trump === '♣';
    const delta = finalTricks.map(t => {
      if (t === 0) return isTrumpPaus ? 10 : 5;        // nenhuma vaza
      return isTrumpPaus ? -2 * t : -t;                // perde por vaza
    });

    const newScores = scores.map((s, i) => s + delta[i]);
    setScores(newScores);

    const results = PLAYER_NAMES.map((name, i) => ({
      name, tricks: finalTricks[i], delta: delta[i], score: newScores[i],
    }));
    setShowResults(results);
    setPhase('hand_end');

    addLog(`Mão terminada! Trunfo era ${trump}`);

    // Verificar vitória
    const winner = newScores.findIndex(s => s <= 0);
    const loser  = newScores.findIndex(s => s >= SCORE_LIMIT);

    if (winner !== -1) {
      setGameWinner({ idx: winner, name: PLAYER_NAMES[winner], reason: '0 pontos!' });
      if (winner === 0) updateBalance(bet * 4, 'Sobe e Desce'); // humano ganhou
      setPhase('game_end');
    } else if (loser !== -1) {
      const minScore = Math.min(...newScores);
      const minIdx   = newScores.indexOf(minScore);
      setGameWinner({ idx: minIdx, name: PLAYER_NAMES[minIdx], reason: `${PLAYER_NAMES[loser]} atingiu ${SCORE_LIMIT} pts` });
      if (minIdx === 0) updateBalance(bet * 3, 'Sobe e Desce');
      setPhase('game_end');
    }
  }, [trump, scores, bet, updateBalance]);

  // ── Efeito: bots jogam quando é a vez deles (em jogo normal) ─────────────
  useEffect(() => {
    if (phase !== 'playing' || currentPlayer === 0) return;
    if (currentTrick.length >= 4) return;

    const timer = setTimeout(() => {
      const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
      const h = [...hands];
      const choice = botPlay(h[currentPlayer], currentTrick, trump);
      h[currentPlayer] = h[currentPlayer].filter(c => !(c.suit === choice.suit && c.value === choice.value));

      const newTrick = [...currentTrick, { playerIdx: currentPlayer, card: choice, name: BOT_NAMES[currentPlayer - 1] }];
      setHands(h);
      setCurrentTrick(newTrick);

      if (newTrick.length >= 4) {
        resolveTrick(newTrick, h);
      } else {
        const next = (currentPlayer + 1) % 4;
        setCurrentPlayer(next);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, currentPlayer, currentTrick, hands, trump, resolveTrick]);

  // ── UI helper ───────────────────────────────────────────────────────────────
  const playerHand = hands[0];
  const leadSuit   = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
  const mustFollow = leadSuit && playerHand.some(c => c.suit === leadSuit);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex flex-col min-h-full p-4 md:p-6 gap-4 animate-fadeSlideUp"
      style={{ background: 'radial-gradient(ellipse at 50% 10%, #1e3a2f 0%, #0f1f18 50%, #060d0a 100%)' }}
    >
      {/* Feltro */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
           style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)' }} />
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

      {/* ── IDLE: ecrã de início ── */}
      {phase === 'idle' && (
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily:"'Outfit',sans-serif" }}>
              🃏 Sobe e Desce
            </h2>
            <p className="text-green-300/60 text-xs uppercase tracking-widest">Mesa de Cartas • TORN Casino</p>
          </div>

          {!mode ? (
            // ── Seleção de Modo ──
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4 mt-4">
              <button
                onClick={() => setMode('bots')}
                className="group glass-card p-6 text-left hover:border-green-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-xl font-bold text-white">Treinar com Bots</h3>
                </div>
                <p className="text-xs text-zinc-400">Joga 1v3 contra a inteligência artificial. Ideal para aprender as regras.</p>
              </button>

              <button
                onClick={generateRoomCode}
                className="group glass-card p-6 text-left hover:border-yellow-500/50 transition-all cursor-pointer border-yellow-800/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🤝</span>
                  <h3 className="text-xl font-bold text-white">Criar Sala</h3>
                </div>
                <p className="text-xs text-zinc-400">Gera um código e joga com os teus amigos na mesma rede.</p>
              </button>

              <div className="md:col-span-2 glass-card p-4 flex gap-3 items-center">
                <input
                  placeholder="Introduz Código (ex: XG2H9)"
                  maxLength={6}
                  className="bg-black/30 border border-zinc-800 rounded px-3 py-2 text-sm text-yellow-500 font-mono tracking-widest flex-1 focus:border-yellow-600 outline-none uppercase"
                />
                <button
                  onClick={() => { setMode('multiplayer'); setPhase('waiting'); }}
                  className="bg-zinc-100 text-black font-black text-xs px-6 py-2 rounded hover:bg-white active:scale-95 transition-all cursor-pointer"
                >
                  ENTRAR
                </button>
              </div>
            </div>
          ) : (
            // ── Setup de Aposta ──
            <>
              <div className="glass-card p-6 max-w-lg w-full space-y-3 text-sm text-zinc-300">
                <p className="font-bold text-white text-base">📋 Regras — {mode === 'bots' ? '🆚 IA' : '👫 Sala Privada'}</p>
                <ul className="space-y-1.5 text-zinc-400">
                  <li>• Baralho de <strong className="text-white">40 cartas</strong> (sem 8, 9, 10)</li>
                  <li>• Ordem: 2 &lt; 3 &lt; 4 &lt; 5 &lt; 6 &lt; Q &lt; J &lt; K &lt; 7 &lt; <strong className="text-yellow-400">A</strong></li>
                  <li>• Pontuação: <span className="text-red-400">-1 pt</span> por vaza ganha</li>
                  <li>• Caso trunfo = <span className="text-purple-400">♣ Paus</span>: <span className="text-red-400">Dobro (-2 ou +10)</span></li>
                  <li>• Todos começam com <strong className="text-white">25 pontos</strong>.</li>
                  <li>• <span className="text-yellow-400">Ganha</span> quem chegar a <strong>0 pts</strong> (ou menos).</li>
                </ul>
              </div>

              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <div className="flex items-center gap-3 w-full text-zinc-400">
                  <label className="text-xs uppercase font-bold w-20">Aposta (GB)</label>
                  <input
                    type="number" min={50} max={Math.min(balance, 5000)} step={50}
                    value={bet}
                    onChange={e => setBet(Number(e.target.value))}
                    className="flex-1 h-10 bg-black/40 border border-green-800/40 rounded-lg px-3 text-white font-mono focus:outline-none focus:border-green-500"
                  />
                </div>
                <button
                  onClick={mode === 'bots' ? dealHand : () => setPhase('waiting')}
                  disabled={bet > balance || bet <= 0}
                  className="w-full py-4 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 disabled:opacity-40 text-white font-black text-lg rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(22,163,74,0.4)] active:scale-95"
                >
                  {mode === 'bots' ? '🚀 Começar Jogo' : '✅ Confirmar Aposta'}
                </button>
              </div>
            </>
          )}

          <button onClick={() => setMode(null)} className="text-zinc-500 text-xs hover:text-zinc-400">Voltar à seleção</button>
        </div>
      )}

      {/* ── WAITING: ecrã de lobby de espera ── */}
      {phase === 'waiting' && (
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white" style={{ fontFamily:"'Outfit',sans-serif" }}>
              🤝 Lobby da Sala
            </h2>
            <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-yellow-600/30 flex flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Código para Partilhar</span>
              <span className="text-4xl font-mono text-yellow-500 font-black tracking-widest">{roomCode || 'A7H2K9'}</span>
              <span className="text-[9px] text-yellow-600/50 mt-1 uppercase">Dá este código aos teus colegas</span>
            </div>
          </div>

          <div className="w-full max-w-sm glass-card p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Jogadores na Sala (1/4)</h3>
            <div className="space-y-2">
              <div className="p-3 bg-green-950/20 rounded border border-green-700/20 flex justify-between items-center">
                <span className="text-white text-sm font-bold">👤 Tu (Criador)</span>
                <span className="text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded uppercase font-black">Pronto</span>
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 bg-black/30 rounded border border-zinc-800 flex justify-between items-center opacity-50">
                  <span className="text-zinc-600 text-sm">🚪 à espera...</span>
                  <div className="w-2 h-2 rounded-full bg-zinc-800 animate-pulse" />
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-zinc-600 italic text-center">Simulação Multiplayer — no teste real os teus amigos apareceriam aqui.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { setPhase('idle'); }}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl active:scale-95 transition-all text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => { dealHand(); }}
              className="px-10 py-3 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black rounded-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(202,138,4,0.3)]"
            >
              Começar com Bots 🤖
            </button>
          </div>
        </div>
      )}

      {/* ── PLAYING: mesa de jogo ── */}
      {(phase === 'playing' || phase === 'trick_end') && (
        <div className="relative z-10 flex flex-col gap-4 flex-1">

          {/* Header: trunfo + pontuações */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-zinc-500">Trunfo:</span>
              <span className={`text-xl font-black ${trump === '♥' || trump === '♦' ? 'text-red-400' : trump === '♣' ? 'text-purple-400' : 'text-white'}`}>
                {trump} {SUIT_NAMES[trump]}
                {trump === '♣' && <span className="text-[10px] text-purple-400 ml-1">(-2pts)</span>}
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              {PLAYER_NAMES.map((name, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg border font-bold ${i === 0 ? 'bg-green-900/30 border-green-700/30 text-green-300' : 'bg-zinc-900/30 border-zinc-700/30 text-zinc-400'}`}>
                  <span className="truncate block max-w-[60px]">{name}</span>
                  <span className="font-mono">{scores[i]}pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cartas dos bots (verso) */}
          <div className="flex justify-around items-start">
            {[1, 2, 3].map(bi => (
              <div key={bi} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-zinc-500">{BOT_NAMES[bi - 1]} ({hands[bi].length} cartas) • {tricks[bi]}🎯</span>
                <div className="flex gap-0.5">
                  {hands[bi].map((_, ci) => (
                    <div key={ci} className="w-8 h-12 rounded-md bg-gradient-to-b from-blue-800 to-blue-950 border border-blue-700/50 shadow-sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Centro: vaza atual */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Vaza Atual</p>
            <div className="flex gap-4 justify-center p-4 bg-black/20 rounded-xl border border-white/5 min-h-[90px] items-center">
              {[0, 1, 2, 3].map(i => {
                const entry = currentTrick.find(e => e.playerIdx === i);
                return <TrickCard key={i} entry={entry} />;
              })}
            </div>
            {currentPlayer === 0 && phase === 'playing' && (
              <p className="text-green-400 text-xs animate-pulse font-bold">
                {selectedCard !== null ? '✅ Clica novamente para confirmar!' : `🎯 A tua vez! ${mustFollow ? `Deves jogar ${leadSuit}` : 'Escolhe uma carta'}`}
              </p>
            )}
            {currentPlayer !== 0 && (
              <p className="text-zinc-500 text-xs animate-pulse">{BOT_NAMES[currentPlayer - 1]} a pensar...</p>
            )}
          </div>

          {/* Mão do jogador */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">A tua mão ({playerHand.length} cartas) • Vazas: {tricks[0]}🎯</span>
              {mustFollow && <span className="text-xs text-orange-400 font-bold">Deves jogar {leadSuit}</span>}
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {playerHand.map((card, i) => {
                const canPlay = currentPlayer === 0 && phase === 'playing';
                const isDisabled = !canPlay || (mustFollow && card.suit !== leadSuit);
                return (
                  <CardComp
                    key={`${card.suit}-${card.value}`}
                    card={card}
                    selected={selectedCard === i}
                    onClick={() => !isDisabled && playCard(i)}
                    disabled={isDisabled}
                  />
                );
              })}
            </div>
          </div>

          {/* Log de eventos */}
          {log.length > 0 && (
            <div className="text-[10px] text-zinc-600 space-y-0.5 max-h-16 overflow-hidden">
              {log.slice(0, 4).map((l, i) => <p key={i}>{l}</p>)}
            </div>
          )}
        </div>
      )}

      {/* ── FIM DE MÃO: mostrar resultados ── */}
      {(phase === 'hand_end' || phase === 'game_end') && showResults && (
        <div className="relative z-10 flex flex-col items-center gap-6 flex-1 justify-center">
          <h3 className="text-2xl font-black text-white">📊 Resultados da Mão</h3>

          <div className="w-full max-w-md glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-zinc-500 font-bold uppercase text-xs tracking-widest">Jogador</th>
                  <th className="px-4 py-3 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest">Vazas</th>
                  <th className="px-4 py-3 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest">Delta</th>
                  <th className="px-4 py-3 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest">Total</th>
                </tr>
              </thead>
              <tbody>
                {showResults.map((r, i) => (
                  <tr key={i} className={`border-b border-zinc-800/50 ${i === 0 ? 'bg-green-900/10' : ''}`}>
                    <td className="px-4 py-3 font-bold text-white">{r.name}</td>
                    <td className="px-4 py-3 text-center font-mono text-zinc-300">{r.tricks}</td>
                    <td className={`px-4 py-3 text-center font-mono font-bold ${r.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {r.delta > 0 ? '+' : ''}{r.delta}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-yellow-400">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {phase === 'game_end' && gameWinner && (
            <div className={`text-center p-6 rounded-xl border ${gameWinner.idx === 0 ? 'bg-green-900/30 border-green-600/30' : 'bg-red-900/20 border-red-700/30'}`}>
              <p className="text-3xl mb-2">{gameWinner.idx === 0 ? '🏆' : '😔'}</p>
              <p className="font-black text-xl text-white">{gameWinner.name} venceu!</p>
              <p className="text-zinc-400 text-sm mt-1">{gameWinner.reason}</p>
              {gameWinner.idx === 0 && (
                <p className="text-green-400 font-black text-lg mt-2">+{ (bet * 4).toLocaleString('pt-PT') } GB</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {phase === 'hand_end' && (
              <button
                onClick={dealHand}
                disabled={bet > balance}
                className="px-8 py-3 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 disabled:opacity-40 text-white font-black rounded-xl transition-all cursor-pointer active:scale-95"
              >
                🃏 Nova Mão
              </button>
            )}
            <button
              onClick={() => { setPhase('idle'); setScores([25,25,25,25]); setGameWinner(null); setShowResults(null); }}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all cursor-pointer active:scale-95 border border-zinc-700"
            >
              ↩ Novo Jogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

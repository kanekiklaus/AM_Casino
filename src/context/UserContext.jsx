// UserContext.jsx
// Context API do React — partilha estado global entre todos os componentes
// sem precisar de prop drilling (passar props manualmente de pai para filho)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── 1. Criar o Contexto ──────────────────────────────────────────────────────
export const UserContext = createContext(null);

// ── 2. Custom Hook para consumir o contexto facilmente ───────────────────────
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser tem de ser usado dentro de <UserProvider>');
  return ctx;
};

// ── 3. Valores padrão ────────────────────────────────────────────────────────
const INITIAL_BALANCE = 10_000;   // Espaço Livre inicial: 10.000 GB
const MAX_HISTORY     = 20;       // Máximo de entradas no histórico

// Temperatura máxima normalizadora:
// 0 GB     → 100°C (crítico)
// 10k GB   → ~52°C (morno/estável — Espaço Livre inicial)
// 20k GB+  → ~5°C (frio)
const TEMP_REFERENCE  = 20_000;   // 20k GB = temperatura mínima (~5%)
const TEMP_MIN        = 5;        // Temperatura nunca desce abaixo dos 5%

// Chaves para localStorage
const LS_BALANCE  = 'casino_balance';
const LS_HISTORY  = 'casino_history';
const LS_STATS    = 'casino_stats';

// ── 4. Calcular temperatura com base no Espaço Livre ─────────────────────────────────
// Espaço Livre = 0 → 100°C | Espaço Livre crescente → temperatura desce (min 5%)
export function calcTemperature(balance) {
  if (balance <= 0) return 100;
  const raw = 100 - (Math.min(balance, TEMP_REFERENCE) / TEMP_REFERENCE) * (100 - TEMP_MIN);
  return Math.max(TEMP_MIN, Math.round(raw));
}

// Cor baseada na temperatura
export function tempColor(temp) {
  if (temp >= 80) return '#ef4444'; // vermelho — perigo
  if (temp >= 60) return '#f97316'; // laranja
  if (temp >= 40) return '#eab308'; // amarelo
  if (temp >= 20) return '#22c55e'; // verde
  return '#3b82f6';                 // azul — frio
}

// ── 5. Provider ──────────────────────────────────────────────────────────────
export const UserProvider = ({ children }) => {

  // Espaço Livre do jogador
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem(LS_BALANCE);
    return saved !== null ? Number(saved) : INITIAL_BALANCE;
  });

  // Histórico de transacções: [{ type, amount, game, date }]
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Estatísticas totais (persistem separadamente do histórico curto)
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_STATS);
      return saved ? JSON.parse(saved) : { wins: 0, losses: 0, totalWon: 0, totalLost: 0 };
    } catch { return { wins: 0, losses: 0, totalWon: 0, totalLost: 0 }; }
  });

  // Temperatura derivada do Espaço Livre (não persiste — calcula-se sempre)
  const temperature = calcTemperature(balance);

  // Toast de notificação
  const [toast, setToast] = useState(null);

  // Controlo do modal de quiz
  const [showQuiz, setShowQuiz] = useState(false);
  // true = modal aberto por Espaço Livre zero (não pode ser fechado sem responder)
  const [quizForcedByZero, setQuizForcedByZero] = useState(false);

  // ── Persistência ──────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(LS_BALANCE, balance); }, [balance]);
  useEffect(() => { localStorage.setItem(LS_HISTORY, JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem(LS_STATS, JSON.stringify(stats)); }, [stats]);

  // ── Detectar Espaço Livre zero → abrir quiz automaticamente ─────────────────────
  useEffect(() => {
    if (balance <= 0 && !showQuiz) {
      // Pequeno delay para o toast de perda desaparecer primeiro
      setTimeout(() => {
        setQuizForcedByZero(true);
        setShowQuiz(true);
      }, 800);
    }
  }, [balance]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toast temporário ─────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'win') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Actualizar Espaço Livre + histórico ─────────────────────────────────────────
  const updateBalance = useCallback((amount, game = 'Casino') => {
    setBalance(prev => Math.max(0, prev + amount));

    const entry = {
      type:   amount >= 0 ? 'win' : 'loss',
      amount: Math.abs(amount),
      game,
      date:   new Date().toLocaleTimeString('pt-PT'),
    };
    setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));

    // Actualizar stats totais
    setStats(prev => ({
      wins:      prev.wins      + (amount > 0 ? 1 : 0),
      losses:    prev.losses    + (amount < 0 ? 1 : 0),
      totalWon:  prev.totalWon  + (amount > 0 ? amount : 0),
      totalLost: prev.totalLost + (amount < 0 ? Math.abs(amount) : 0),
    }));

    if (amount > 0) showToast(`+${amount.toLocaleString('pt-PT')}GB 🎉`, 'win');
    else            showToast(`-${Math.abs(amount).toLocaleString('pt-PT')}GB 💸`, 'loss');
  }, [showToast]);

  // ── Quiz: creditar ganho das perguntas ───────────────────────────────────
  const creditQuizEarnings = useCallback((amount) => {
    if (amount > 0) {
      setBalance(prev => prev + amount);
      showToast(`+${amount.toLocaleString('pt-PT')}GB 🎓 Quiz!`, 'win');
    }
  }, [showToast]);

  // ── Abrir quiz manualmente (botão na sidebar) ─────────────────────────────
  const openQuiz = useCallback(() => {
    setQuizForcedByZero(false);
    setShowQuiz(true);
  }, []);

  const closeQuiz = useCallback(() => {
    setShowQuiz(false);
    setQuizForcedByZero(false);
  }, []);

  // ── Reset completo ───────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setHistory([]);
    setStats({ wins: 0, losses: 0, totalWon: 0, totalLost: 0 });
  }, []);

  // ── Valor exposto ────────────────────────────────────────────────────────
  const contextValue = {
    balance,
    temperature,       // 5–100 (percentagem/graus de temperatura do PC)
    history,
    stats,
    toast,
    showQuiz,
    quizForcedByZero,
    updateBalance,
    creditQuizEarnings,
    openQuiz,
    closeQuiz,
    resetGame,
    showToast,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// App.jsx — Componente raiz da aplicação
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidades:
//   1. Envolver toda a app com o UserProvider (contexto global)
//   2. Gerir qual o jogo activo (estado de navegação)
//   3. Gerir estado de abertura da sidebar mobile (hambúrguer)
//   4. Renderizar o QuizModal quando necessário
//   5. Renderizar o layout principal: Sidebar + StatBar + área de conteúdo
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

// Contexto global
import { UserProvider, useUser } from './context/UserContext';

// Componentes de layout
import Sidebar     from './components/Sidebar';
import StatBar     from './components/StatBar';
import Toast       from './components/Toast';
import Lobby       from './components/Lobby';
import QuizModal   from './components/QuizModal';

// Os jogos
import HighLow         from './games/HighLow';
import SlotsHub        from './games/SlotsHub';   // Hub de seleção Slots
import Blackjack       from './games/Blackjack';
import Roulette        from './games/Roulette';
import Bookie          from './games/Bookie';
import RussianRoulette from './games/RussianRoulette';
import SobeDesce       from './games/SobeDesce';

// ── Mapa de jogo → componente ─────────────────────────────────────────────────
const GAME_COMPONENTS = {
  highlow:    HighLow,
  slots:      SlotsHub,
  blackjack:  Blackjack,
  roulette:   Roulette,
  bookie:     Bookie,
  russian:    RussianRoulette,
  sobedesce:  SobeDesce,
};

// ── CasinoHub — Layout Principal ──────────────────────────────────────────────
// Separado do App para poder usar hooks do UserContext
function CasinoHub() {
  const [activeGame, setActiveGame]   = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { showQuiz, quizForcedByZero, closeQuiz, creditQuizEarnings } = useUser();

  const GameComponent = GAME_COMPONENTS[activeGame] || null;

  return (
    // Layout flex horizontal: Sidebar | área de conteúdo
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">

      {/* ── Sidebar: menu lateral fixo em desktop, drawer em mobile ── */}
      <Sidebar
        activeGame={activeGame}
        setActiveGame={setActiveGame}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Área principal ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Barra de estatísticas no topo */}
        <StatBar
          activeGame={activeGame}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        {/* Conteúdo do jogo / lobby */}
        <section className="flex-1 overflow-y-auto">
          {GameComponent ? (
            // key={activeGame} garante reset do estado interno ao mudar de jogo
            <GameComponent key={activeGame} />
          ) : (
            <Lobby setActiveGame={setActiveGame} />
          )}
        </section>
      </main>

      {/* ── Toast: notificação flutuante ── */}
      <Toast />

      {/* ── Quiz Modal ── */}
      {showQuiz && (
        <QuizModal
          isZeroBalance={quizForcedByZero}
          onClose={closeQuiz}
          onEarn={creditQuizEarnings}
        />
      )}
    </div>
  );
}

// ── App — componente exportado ─────────────────────────────────────────────────
export default function App() {
  return (
    <UserProvider>
      <CasinoHub />
    </UserProvider>
  );
}

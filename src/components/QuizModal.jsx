// QuizModal.jsx
// Modal de quiz educativo que aparece quando o saldo chega a 0GB
// ou ao clicar em "Repor Conta". Cada resposta certa adiciona 1.000GB ao saldo.

import React, { useState, useEffect, useCallback } from 'react';

// ── Banco de perguntas ────────────────────────────────────────────────────────
// Tema: escola, informática, programação, tecnologia, matemática
const QUESTIONS = [
  // 🖥️ Programação
  { q: 'Qual linguagem é usada para estilizar páginas web?',                  options: ['Python','CSS','Java','SQL'],           correct: 1 },
  { q: 'O que significa "HTML"?',                                              options: ['HyperText Markup Language','High Tech Modern Language','HyperTool Markup Link','Hard Transfer Mode Language'], correct: 0 },
  { q: 'Qual destes é um framework de JavaScript?',                            options: ['Django','Laravel','React','Flask'],    correct: 2 },
  { q: 'Qual é a extensão de ficheiros Python?',                               options: ['.py','pt','pyt','python'],            correct: 0 },
  { q: 'O que é um "bug" em programação?',                                     options: ['Um insecto virtual','Um erro no código','Um tipo de vírus','Uma shortcut de teclado'], correct: 1 },
  { q: 'Qual estrutura de dados segue a regra LIFO (último a entrar, primeiro a sair)?', options: ['Fila','Lista','Pilha','Árvore'], correct: 2 },
  { q: 'O que significa "API"?',                                               options: ['Application Programming Interface','Advanced Program Input','Automated Protocol Integration','Application Process Index'], correct: 0 },
  { q: 'Qual destes NÃO é um tipo de dado primitivo em JavaScript?',           options: ['String','Number','Array','Boolean'],   correct: 2 },
  { q: 'O que faz o comando "git commit"?',                                    options: ['Apaga ficheiros','Guarda alterações no repositório','Faz download do código','Liga ao servidor'], correct: 1 },
  { q: 'Qual é a função principal do React?',                                  options: ['Gerir bases de dados','Criar interfaces de utilizador','Lidar com servidores','Editar imagens'], correct: 1 },

  // 🌐 Redes & Web
  { q: 'O que significa "URL"?',                                               options: ['Universal Resource Locator','Unique Remote Link','Unified Resource Layer','Universal Route Link'], correct: 0 },
  { q: 'Qual protocolo é usado para sites seguros (HTTPS)?',                   options: ['FTP','SSL/TLS','SSH','UDP'],           correct: 1 },
  { q: 'O que é um "servidor"?',                                               options: ['Um computador que fornece serviços a outros','Um tipo de browser','Um ficheiro comprimido','Um protocolo de segurança'], correct: 0 },
  { q: 'Qual porta é usada por padrão pelo protocolo HTTP?',                   options: ['21','22','80','443'],                 correct: 2 },

  // 🔢 Matemática
  { q: 'Quanto é 2 elevado à potência 10?',                                    options: ['512','1024','2048','256'],            correct: 1 },
  { q: 'Qual é a raíz quadrada de 144?',                                       options: ['11','12','13','14'],                  correct: 1 },
  { q: 'Num sistema binário, como se representa o número 5?',                  options: ['100','101','110','111'],              correct: 1 },
  { q: 'O que é um número primo?',                                             options: ['Divisível por 2','Divisível apenas por 1 e por si mesmo','Maior que 100','Par e positivo'], correct: 1 },

  // 🏫 Geral / Escola
  { q: 'O que significa "IPCB"?',                                              options: ['Instituto Politécnico de Castelo Branco','Instituto Público de Ciências do Brasil','Instituto Português de Computação Básica','Instituto Pedagógico de Ciências e Biologia'], correct: 0 },
  { q: 'Qual software é mais comum para gestão de bases de dados relacionais?', options: ['MongoDB','MySQL','Redis','Neo4j'],    correct: 1 },
  { q: 'O que é "UML"?',                                                       options: ['Universal Markup Language','Unified Modeling Language','User Management Layer','Unified Mobile Library'], correct: 1 },
  { q: 'O que é "POO" em programação?',                                        options: ['Programação Orientada a Objectos','Plataforma Online de Operações','Protocolo de Operação Ordenada','Processo de Output Organizado'], correct: 0 },
  { q: 'Qual destes é um sistema operativo?',                                  options: ['Google Chrome','Microsoft Word','Linux','Adobe Photoshop'], correct: 2 },
  { q: 'Quantos bits tem um byte?',                                            options: ['4','8','16','32'],                    correct: 1 },
  { q: 'O que é "RAM"?',                                                       options: ['Read-Only Automatic Memory','Random Access Memory','Remote Access Manager','Rapid Application Module'], correct: 1 },
];

// Crédito por resposta certa
const CREDIT_PER_CORRECT = 1000;
// Número de perguntas por sessão
const QUESTIONS_PER_SESSION = 5;

// ── Função para selecionar perguntas aleatórias únicas ────────────────────────
function pickRandomQuestions(n) {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function QuizModal({ onClose, onEarn, isZeroBalance }) {
  const [questions]  = useState(() => pickRandomQuestions(QUESTIONS_PER_SESSION));
  const [current, setCurrent]    = useState(0);
  const [selected, setSelected]  = useState(null);   // índice da opção escolhida
  const [answered, setAnswered]  = useState(false);  // mostrar feedback?
  const [score, setScore]        = useState(0);       // perguntas certas
  const [earned, setEarned]      = useState(0);       // crédito ganho
  const [finished, setFinished]  = useState(false);
  const [streak, setStreak]      = useState(0);       // respostas certas seguidas

  const q = questions[current];

  // ── Responder ────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    const isCorrect = idx === q.correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setEarned(e => e + CREDIT_PER_CORRECT);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    // Avançar após 1.4s
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setAnswered(false);
      }
    }, 1400);
  }, [answered, current, questions.length, q]);

  // ── Fechar e creditar ────────────────────────────────────────────────────────
  const handleFinish = () => {
    if (earned > 0) onEarn(earned);
    onClose();
  };

  // ── Cor por opção ─────────────────────────────────────────────────────────────
  const optionStyle = (idx) => {
    if (!answered) {
      return 'bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700/80 hover:border-zinc-500 text-zinc-200 cursor-pointer';
    }
    if (idx === q.correct) return 'bg-green-900/60 border-green-500 text-green-300';
    if (idx === selected && idx !== q.correct) return 'bg-red-900/60 border-red-500 text-red-300';
    return 'bg-zinc-800/40 border-zinc-700/30 text-zinc-500';
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md"
         onClick={e => { if (e.target === e.currentTarget && !isZeroBalance) onClose(); }}>

      {/* Card principal */}
      <div className="relative w-full max-w-xl mx-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
           style={{ animation: 'fadeSlideUp 0.35s ease forwards' }}>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-zinc-800/70">
          {/* Glow de topo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                🎓 Desafio do Conhecimento
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isZeroBalance ? 'Responde para repor o Espaço Livre!' : 'Ganha memória extra com a tua sabedoria'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black font-mono text-green-400">+{earned.toLocaleString('pt-PT')} GB</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Capacidade Ganhada</p>
            </div>
          </div>

          {/* Progresso */}
          {!finished && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5">
                <span>Pergunta {current + 1} de {questions.length}</span>
                {streak >= 2 && <span className="text-orange-400 font-bold">🔥 {streak}x Combo!</span>}
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500"
                  style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {!finished ? (
            <>
              {/* Pergunta */}
              <p className="text-lg font-bold text-white mb-6 leading-snug">{q.q}</p>

              {/* Opções */}
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${optionStyle(idx)}`}
                  >
                    <span className="inline-block w-6 h-6 rounded-md bg-zinc-700/60 text-center text-xs leading-6 mr-3 font-black text-zinc-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {answered && (
                <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm font-bold text-center ${selected === q.correct ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                  {selected === q.correct
                    ? `✅ Correto! +${CREDIT_PER_CORRECT.toLocaleString('pt-PT')} GB`
                    : `❌ Errado. A resposta era: "${q.options[q.correct]}"`}
                </div>
              )}
            </>
          ) : (
            /* ── Ecrã de resultado ── */
            <div className="text-center py-4 space-y-5 animate-fadeSlideUp">
              <div className="text-6xl mb-2">
                {score === questions.length ? '🏆' : score >= 3 ? '🎓' : '📚'}
              </div>
              <div>
                <p className="text-3xl font-black text-white">{score}/{questions.length} certas</p>
                <p className="text-zinc-500 text-sm mt-1">
                  {score === questions.length ? 'Perfeito! Estudaste bem!' : score >= 3 ? 'Boa prestação!' : 'Continua a estudar!'}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Espaço Livre Ganho</p>
                <p className="text-4xl font-black font-mono text-green-400">
                  +{earned.toLocaleString('pt-PT')} GB
                </p>
                <p className="text-xs text-zinc-600">
                  {CREDIT_PER_CORRECT.toLocaleString('pt-PT')} GB × {score} resposta{score !== 1 ? 's' : ''} certa{score !== 1 ? 's' : ''}
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-lg rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(22,163,74,0.4)] cursor-pointer"
              >
                {earned > 0 ? `Adicionar ${earned.toLocaleString('pt-PT')} GB e Jogar!` : 'Fechar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast.jsx
// Notificação visual temporária que aparece no canto inferior direito do ecrã.
// Mostra ganho (verde) ou perda (vermelho) após cada jogada.
// É controlado pelo UserContext — aparece e desaparece automaticamente.

import React from 'react';
import { useUser } from '../context/UserContext';

export default function Toast() {
  // Obtém o estado do toast do contexto global
  // toast = null → não renderiza nada
  // toast = { message: '...', type: 'win' | 'loss' } → renderiza a notificação
  const { toast } = useUser();

  // Se não há toast, não renderizar nada (retorno null = componente vazio)
  if (!toast) return null;

  // Definir cores conforme o tipo (vitória ou derrota)
  const isWin = toast.type === 'win';

  return (
    // Posição fixa no canto inferior direito, acima de tudo (z-50)
    <div
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-3
        px-5 py-3 rounded-xl shadow-2xl
        text-white font-semibold text-sm
        animate-toastIn
        ${isWin
          ? 'bg-green-600/90 border border-green-500' // Verde para ganho
          : 'bg-red-700/90 border border-red-600'     // Vermelho para perda
        }
      `}
    >
      {/* Ícone (emoji) à esquerda da mensagem */}
      <span className="text-lg">{isWin ? '✅' : '❌'}</span>

      {/* Mensagem dinâmica (ex: "+$500 🎉") */}
      <span>{toast.message}</span>
    </div>
  );
}

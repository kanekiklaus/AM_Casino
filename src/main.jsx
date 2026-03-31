// main.jsx — Ponto de entrada da aplicação React
// ─────────────────────────────────────────────────────────────────────────────
// Este é o primeiro ficheiro executado pelo Vite ao arrancar a aplicação.
// Responsabilidades:
//   1. Importar o React e o ReactDOM
//   2. Importar os estilos globais (index.css com Tailwind)
//   3. Montar o componente App na div #root do index.html

import { StrictMode } from 'react';   // StrictMode activa avisos extra em desenvolvimento
import { createRoot }  from 'react-dom/client'; // API moderna do React 18 para montar a app

import './index.css'; // Importar Tailwind + estilos globais ANTES do App
import App from './App';

// createRoot() substitui o antigo ReactDOM.render() (React 17)
// Selecciona o elemento com id="root" no index.html e monta a aplicação React lá dentro
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode não afecta o build de produção — só activa checks em dev */}
    <App />
  </StrictMode>
);

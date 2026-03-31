// vite.config.js
// Configuração principal do Vite — define plugins usados no projeto

import { defineConfig } from 'vite'        // Função auxiliar para configuração com tipagem
import react from '@vitejs/plugin-react'   // Plugin oficial do React para Vite (suporte JSX, Fast Refresh)
import tailwindcss from '@tailwindcss/vite' // Plugin oficial do Tailwind CSS v4 para Vite

export default defineConfig({
  plugins: [
    react(),        // Activa o suporte a React/JSX e hot module replacement
    tailwindcss(),  // Activa o Tailwind CSS para estilização utilitária
  ],
})

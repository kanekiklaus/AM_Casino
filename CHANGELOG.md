# 📋 CHANGELOG — Torn City Casino
> Registo de erros encontrados, melhorias implementadas e alterações ao projecto.
> Actualizado à medida que o projecto evolui.

---

## 🗓️ Versão 1.0 — Setup Inicial (2026-03-19)

### ✅ Estrutura criada
- Projecto Vite + React inicializado com template `react`
- Tailwind CSS v4 instalado via `@tailwindcss/vite` (plugin oficial)
- Estrutura de pastas: `src/context/`, `src/components/`, `src/games/`

### ❌ Erros encontrados durante o setup
| # | Erro | Causa | Solução |
|---|------|-------|---------|
| 1 | `npx` bloqueado no PowerShell | Política de execução de scripts desactivada no Windows | Usar `cmd /c "npx ..."` em vez de PowerShell directo |
| 2 | `create-vite` recusa criar em pasta com ficheiros | O diretório já continha `plano.md` | Criar em subpasta `casino/` e trabalhar dentro dela |

### 🔧 Decisões de Design
- **Tailwind v4** em vez de v3: nova API `@import "tailwindcss"` sem ficheiro `tailwind.config.js`
- **UserContext** com localStorage: saldo e histórico persistem ao recarregar a página
- **key={activeGame}** no GameComponent: garante reset do estado interno ao mudar de jogo
- Animações CSS customizadas em `index.css` (não dependem de plugins Tailwind)

---

## 🗓️ Versão 1.1 — HUD Mais Dinâmico (PT-PT) (2026-03-19)

### 🚀 Melhorias / Alterações
- **Slots (Máquina de Jogo):**
  - Implementada uma recriação visual impressionante de uma Slot Machine mecânica, completa com painel interno escurecido e LEDs reativos.
  - Implementado motor de **Suspense Sequencial**: Os rolos não param instantaneamente, mas rodam com paragens graduais (Rolo 1 aos 1s, Rolo 2 aos 1.6s, Rolo 3 aos 2.4s).
  - Animação de extrema velocidade (`setInterval` de ciclo visual) juntamente com desfoque de movimento em CSS para elevar o realismo da rotação.
  - **Sequência de Jackpot:** Ao acertar triplo 7️⃣, dispõe-se um overlay a ecrã inteiro com confetti animado, título dourado em shimmer e o valor ganho. Os rolos são destacados por um flash de luz amarela intermitente e o título fica com bounce.
  - Tabela de pagamentos restruturada com linha JACKPOT destacada com brilho dourado e badge animado.
- **Roleta (Roulette):**
  - Substituída a representação simples por uma **roda visual giratória** com layout real de roleta europeia (37 números na ordem autentica).
  - Bola de ivório animada em orbit durante a rotação (CSS `ballSpin`).
  - Animação de iniciação rápida com desaceleração controlada por `requestAnimationFrame` até ao número sorteado (paragem alinhada com precisao).
  - Ponteiro dourado fixo no topo da roda para indicar o resultado final.
  - Número vencedor destaca-se na grelha de apostas com brilho e escala aumentada.
  - **Mesa de Apostas Autêntica:** Mesa em felt verde com layout real de roleta européia: Zero à esquerda, grelha 3 linhas × 12 colunas de números (vermelho/preto), apostas 2:1 por coluna, dúzias e apostas externas (1-18/19-36, Par/Ímpar, Vermelho/Preto).
  - Fichas visuais sobrepostas nas células com aposta activa.
- **Roleta Russa (Russian Roulette):**
  - Novo jogo implementado de raiz com cena animada: duas personagens SVG sentadas em cadeiras frente a frente.
  - Revólver desenhado em SVG a passar de mão em mão com animação de transladação (`cubic-bezier` com bounce).
  - Animação de giro do tambor (`revolverSpin`) e tremor antes do disparo (`revolverBounce`).
  - Personagem atingida cai com animação CSS (`characterFall`).
  - Display do tambor com 6 câmaras, bala vermelha na posição sorteada.
  - Sistema de prémios escalonados por sobrevivência e opção de retirada (60% do prémio).
- **Barra Lateral (Sidebar):**
  - Implementado layout "glassmorphism" moderno com brilhos e luminosidade de destaque.
  - Adicionada barra interpolada de progresso visual de XP (Nível e % visível).
  - Animação complexa nos botões interactivos do catálogo (transições smooth `scale`, `translate`, `glow`).
  - Adaptação terminológica para português de Portugal padrão estrito.
- **Barra de Estatísticas (StatBar):**
  - Valores do saldo totalmente reativos, brilhando temporariamente a verde ou vermelho em caso de vitória/derrota.
  - O saldo redimensiona e ganha uma "text-shadow" iluminada em real-time.
  - Dados restruturados e agrupados de forma polida (Vitórias, Derrotas, Líquido).

---

## 🗓️ Versão 1.2 — Temperatura, Quiz & Mobile (2026-03-30)

### 🚀 Novas Funcionalidades

#### 🃏 Sobe e Desce (Novo Jogo de Vazas)
- Implementação completa do clássico português com baralho de 40 cartas.
- **Regras Oficiais:** Jogadores começam com **25 pontos**. Vencer vazas subtrai pontos (desce), perder todas as vazas da mão adiciona pontos (sobe).
- **Modo Multiplayer (Simulado):** Possibilidade de "Criar Sala" e "Entrar com Código" para jogar com amigos (ou bots para preencher).
- **Lobby de Espera:** Interface de sala com código de 6 dígitos gerado aleatoriamente.
- Regra de pontuação especial para **♣ Paus** (dobra pontos).
- Inteligência Artificial para 3 bots adversários.

#### 🎰 SlotsHub & Big Bass Bonanza
- **SlotsHub:** Novo ecrã de seleção que permite escolher entre Slots Clássica e a nova Big Bass.
- **Big Bass Slots:** Máquina de 5 rolos com tema subaquático, Wild Pescador e ronda de **Free Spins** com multiplicadores.
- **Cenário:** Slots voltaram ao fundo escuro original para dar destaque à máquina; Blackjack herdou o feltro.

#### ♠️ Blackjack Mesa VIP
- O cenário de **mesa de feltro verde** com bordas douradas foi movido para o Blackjack, onde faz mais sentido visual.
- Interface "Glass" para as cartas e controlos de aposta rápida (50 GB, 100 GB, 250 GB, 500 GB).

#### 🌡️ Estabilidade de Temperatura
- Ajuste na formula: com o saldo inicial de 10.000 GB, a CPU agora marca **~52°C (MORNO/Estável)**.
- A temperatura só atinge o vermelho crítico (100°C) se o jogador perder quase tudo.

---

## 📌 Backlog — Em Curso / Futuro

### ✅ Fase 1 — Concluído
- [x] Sistema de Temperatura CPU (10.000 GB = Estável)
- [x] Modal de Quiz para repor saldo
- [x] Blackjack com cenário de mesa de feltro
- [x] SlotsHub (Seleção de máquinas)
- [x] Sobe e Desce com salas e modo multiplayer (Início com 25 pts)
- [x] Adaptação mobile básica (drawer)

### 🔄 Fase 2 — A Implementar
- [ ] Som ao ganhar/perder (Web Audio API)
- [ ] Animação real de rotação dos rolos nas Slots
- [ ] Double Down e Split no Blackjack
- [ ] Chat ao vivo entre jogadores (WebSocket)
- [ ] Sistema de conquistas (badges)
- [ ] Tabela de líderes (Leaderboard)


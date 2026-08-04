# Estado atual

> Este arquivo e a memoria do projeto entre sessoes. Sempre atualizar ao fim
> de um milestone. Quem chega sem contexto deve conseguir retomar so lendo isto.

**Ultima atualizacao:** Milestone 0 concluido.

## O que existe e funciona

- Projeto Vite + TypeScript + Three.js. `npm run dev`, `npm run build`,
  `npm run preview` e `npm run check` funcionam.
- Game loop com passo fixo a 60Hz e interpolacao (`src/core/loop.ts`).
- Renderer com limite de `devicePixelRatio` em 2, resize, rotacao de tela,
  FOV vertical derivado de um alvo horizontal e tratamento de perda de
  contexto WebGL (`src/render/renderer.ts`).
- Cena de verificacao: chao, grid, 8 pilares, cubo girando, fog, duas luzes
  (`src/render/scene.ts`). **Temporaria** — substituida no M3.
- Overlay de metricas: fps, ms por frame, pico, ticks de simulacao, draw calls,
  triangulos, DPR, resolucao, heap (`src/debug/overlay.ts`).
- Console in-game capturando `console.*`, `window.onerror` e promises
  rejeitadas, com contador de erros (`src/debug/console.ts`).
- Publicacao automatica em GitHub Pages a cada push.

## Verificado

Rodado via Playwright emulando iPhone (390x844, DPR 3, toque):

- Sem erros de console, sem erros de pagina, sem requisicoes falhas.
- Canvas em 780x1688 — o limite de DPR esta agindo (3 -> 2).
- 9 draw calls, 86 triangulos.
- Pagina nao rola; retrato e paisagem enquadram corretamente.
- Console in-game abre e fecha por toque.

Observacao: o framerate medido no ambiente de verificacao (~45fps) reflete
renderizacao por software (SwiftShader), nao uma GPU. Com 9 draw calls o custo
real no iPhone e irrelevante. O numero que vale e o do aparelho.

## O que NAO existe ainda

Player, input, colisao, mobs, combate, XP, HUD, units, gacha, quests, boss,
portal, save. Tambem nao existem: barramento de eventos (chega no M4), painel
de tuning (M5), pasta `src/game/` (M1), `src/data/` (M4).

## Proximo passo

**Milestone 1 — Player + Input:** joystick virtual em DOM respeitando safe-area,
entidade do player em `src/game/`, movimento em passo fixo, camera seguindo com
suavizacao. E o primeiro codigo em `src/game/`, entao estabelece o padrao de
como simulacao e renderizacao se espelham.

## Decisoes em aberto

- **Orientacao alvo.** Hoje o jogo funciona em retrato e paisagem. Retrato e o
  natural no navegador; paisagem enquadra muito melhor um jogo de exploracao.
  Precisa ser decidido no M1, porque muda o layout da HUD e o enquadramento da
  camera. Ver `decisions/`.
- **Origem da arte.** Sprites de personagens e mobs precisam vir de algum lugar
  antes do M4. Decidir a fonte e o estilo antes de escrever o sistema de mobs.

# Estado atual

> Este arquivo e a memoria do projeto entre sessoes. Sempre atualizar ao fim
> de um milestone. Quem chega sem contexto deve conseguir retomar so lendo isto.

**Ultima atualizacao:** Milestone 0 concluido e publicado. Fundacao reorganizada
com a equipe de agentes.

## O que existe e funciona

**Motor**
- Projeto Vite + TypeScript + Three.js. `npm run dev`, `build`, `preview` e
  `check` funcionam.
- Game loop com passo fixo a 60Hz e interpolacao, com teto no acumulador
  (`src/core/loop.ts`).
- Renderer com limite de `devicePixelRatio` em 2, resize, rotacao de tela, FOV
  vertical derivado de um alvo horizontal e tratamento de perda de contexto
  WebGL (`src/render/renderer.ts`).
- Cena de verificacao: chao, grid, 8 pilares, cubo girando, fog, duas luzes
  (`src/render/scene.ts`). **Temporaria** — substituida no M3.

**Orientacao**
- O jogo assume exclusivamente paisagem. Em retrato, o portao
  (`src/ui/orientation-gate.ts`) cobre a tela e **pausa a simulacao**; ao voltar
  para paisagem ela retoma sem lote de ticks atrasados.

**Debug**
- Overlay de metricas: fps, ms, pico, ticks, draw calls, triangulos, DPR,
  resolucao, heap.
- Console in-game capturando `console.*`, `window.onerror` e promises
  rejeitadas, com contador de erros.

**Entrega**
- `main` publica no GitHub Pages a cada push, via `.github/workflows/deploy.yml`.
- URL: https://grossmannmyguel07-boop.github.io/astra-sovereign/

**Organizacao**
- Equipe de agentes com mapa de propriedade fixo: `docs/05-agents.md` e
  `.claude/agents/`. Regras no `CLAUDE.md`.

## Verificado

Playwright emulando iPhone (DPR 3, toque), sobre a build de producao:

- **Paisagem 844x390:** jogo roda, portao oculto, canvas 1688x780 (DPR 3 -> 2),
  11 draw calls, 110 triangulos, pagina nao rola.
- **Retrato 390x844:** portao aparece e a simulacao para de fato — as metricas
  ficam identicas ao longo de 1,2s.
- **Volta para paisagem:** portao some e a simulacao retoma.
- Sem erros de console, sem erros de pagina, sem requisicoes falhas.

O framerate medido no ambiente de verificacao reflete renderizacao por software
(SwiftShader), nao uma GPU. Com 11 draw calls o custo real no iPhone e
irrelevante. O numero que vale e o do aparelho.

Limitacao: o proxy do ambiente bloqueia `github.io`, entao a verificacao visual
acontece sobre a build servida localmente — byte a byte a mesma que vai ao
Pages. A confirmacao na URL publicada e do desenvolvedor.

## O que NAO existe ainda

Player, input, colisao, mobs, combate, XP, HUD, units, gacha, quests, boss,
portal, save. Tambem nao existem: barramento de eventos (chega no M4), painel de
tuning (M5), `src/game/` (M1), `src/data/` (M4).

## Proximo passo

**Milestone 1 — Player + Input.** Joystick virtual em DOM respeitando safe area
(em paisagem o notch fica na lateral), entidade do player em `src/game/`,
movimento em passo fixo, camera seguindo com suavizacao.

E o primeiro codigo em `src/game/`, entao estabelece o padrao de como simulacao
e renderizacao se espelham. Toca **UI/UX** (joystick) e **Rendering** (camera
follow), com o Tech Lead criando a entidade do player e o estado.

## Decisoes em aberto

- **Origem da arte.** Sprites de personagens e mobs precisam existir antes do
  M4. Definir fonte e estilo antes de escrever o sistema de mobs.
